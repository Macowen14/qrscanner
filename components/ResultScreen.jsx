// components/ResultScreen.js - Fixed with proper scrolling and error handling
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Share,
  Linking,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import Toast from '../utils/Toast';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

const ResultScreen = ({ scanData, onReset, onProductLookup, loadingProduct }) => {
  if (!scanData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No scan data available</Text>
        <TouchableOpacity style={styles.scanAgainButton} onPress={onReset}>
          <Ionicons name="camera-outline" size={24} color="#000" />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { type, data } = scanData;

  const getBarcodeTypeName = (type) => {
    const typeMap = {
      'qr': 'QR Code',
      'pdf417': 'PDF417',
      'aztec': 'Aztec',
      'ean13': 'EAN-13',
      'ean8': 'EAN-8',
      'upc_e': 'UPC-E',
      'upc_a': 'UPC-A',
      'datamatrix': 'Data Matrix',
      'code128': 'Code 128',
      'code39': 'Code 39',
      'code93': 'Code 93',
      'codabar': 'Codabar',
      'itf14': 'ITF-14',
      'interleaved2of5': 'Interleaved 2 of 5',
      'msi': 'MSI',
      'rss14': 'RSS-14',
      'rssexpanded': 'RSS Expanded',
    };
    return typeMap[type?.toLowerCase()] || (type || 'Unknown');
  };

  const isUrl = (string) => {
    if (!string) return false;
    try {
      // Add protocol if missing
      let urlString = string;
      if (!string.startsWith('http://') && !string.startsWith('https://')) {
        urlString = 'https://' + string;
      }
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const isEmail = (string) => {
    if (!string) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(string);
  };

  const isPhone = (string) => {
    if (!string) return false;
    const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/;
    return phoneRegex.test(string.replace(/[\s\-\(\)]/g, ''));
  };

  const isProductCode = (string, type) => {
    if (!string) return false;
    const cleaned = string.replace(/[\s\-]/g, '');
    
    // Check patterns for product barcodes
    const productPatterns = [
      /^\d{8}$/,    // EAN-8
      /^\d{12}$/,   // UPC-A
      /^\d{13}$/,   // EAN-13
      /^\d{14}$/,   // GTIN-14
      /^97[89]\d{10}$/, // ISBN-13
    ];
    
    // Check if barcode type indicates a product
    const productBarcodeTypes = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'];
    
    return productPatterns.some(pattern => pattern.test(cleaned)) || 
           productBarcodeTypes.includes(type?.toLowerCase());
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: data,
        title: 'Scanned Code Data',
      });
      Toast.success('Content shared successfully');
    } catch (error) {
      console.error('Error sharing:', error);
      Toast.error('Failed to share content');
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(data);
      Toast.success('Content copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
      Toast.error('Failed to copy content');
    }
  };

  const handleOpenUrl = async () => {
    if (isUrl(data)) {
      try {
        let urlString = data;
        if (!data.startsWith('http://') && !data.startsWith('https://')) {
          urlString = 'https://' + data;
        }
        
        const supported = await Linking.canOpenURL(urlString);
        if (supported) {
          await Linking.openURL(urlString);
          Toast.success('Opening URL');
        } else {
          Toast.error('Cannot open this URL');
        }
      } catch (error) {
        console.error('Error opening URL:', error);
        Toast.error('Failed to open URL');
      }
    }
  };

  const handleEmail = async () => {
    if (isEmail(data)) {
      try {
        const emailUrl = `mailto:${data}`;
        const supported = await Linking.canOpenURL(emailUrl);
        if (supported) {
          await Linking.openURL(emailUrl);
          Toast.success('Opening email app');
        } else {
          Toast.error('No email app available');
        }
      } catch (error) {
        console.error('Error opening email:', error);
        Toast.error('Failed to open email');
      }
    }
  };

  const handlePhone = async () => {
    if (isPhone(data)) {
      try {
        const phoneUrl = `tel:${data}`;
        const supported = await Linking.canOpenURL(phoneUrl);
        if (supported) {
          await Linking.openURL(phoneUrl);
          Toast.success('Opening phone app');
        } else {
          Toast.error('Cannot make phone calls');
        }
      } catch (error) {
        console.error('Error making call:', error);
        Toast.error('Failed to make call');
      }
    }
  };

  const handleProductLookup = async () => {
    if (!isProductCode(data, type)) {
      Toast.warning('This barcode is not recognized as a product code');
      return;
    }

    if (onProductLookup) {
      onProductLookup(data);
    }
  };

  // Search functionality
  const handleGoogleSearch = async () => {
    try {
      const searchQuery = encodeURIComponent(data);
      const googleUrl = `https://www.google.com/search?q=${searchQuery}`;
      const supported = await Linking.canOpenURL(googleUrl);
      if (supported) {
        await Linking.openURL(googleUrl);
        Toast.info('Opening Google search');
      } else {
        Toast.error('Cannot open browser');
      }
    } catch (error) {
      console.error('Error opening Google search:', error);
      Toast.error('Failed to search');
    }
  };

  const handleProductSearch = async () => {
    if (isProductCode(data, type)) {
      try {
        const searchOptions = [
          { name: 'Google Shopping', url: `https://www.google.com/search?tbm=shop&q=${data}` },
          { name: 'Barcode Lookup', url: `https://www.barcodelookup.com/${data}` },
        ];

        Alert.alert(
          'Product Search',
          'Choose where to search for this product:',
          [
            ...searchOptions.map(option => ({
              text: option.name,
              onPress: async () => {
                try {
                  const supported = await Linking.canOpenURL(option.url);
                  if (supported) {
                    await Linking.openURL(option.url);
                    Toast.info(`Opening ${option.name}`);
                  }
                } catch (error) {
                  console.error('Error opening product search:', error);
                  Toast.error('Failed to open search');
                }
              }
            })),
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } catch (error) {
        console.error('Error with product search:', error);
        Toast.error('Failed to search for product');
      }
    }
  };

  const handleWikipediaSearch = async () => {
    try {
      const searchQuery = encodeURIComponent(data);
      const wikiUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${searchQuery}`;
      const supported = await Linking.canOpenURL(wikiUrl);
      if (supported) {
        await Linking.openURL(wikiUrl);
        Toast.info('Opening Wikipedia search');
      } else {
        Toast.error('Cannot open browser');
      }
    } catch (error) {
      console.error('Error opening Wikipedia search:', error);
      Toast.error('Failed to search Wikipedia');
    }
  };

  const getDataFormat = () => {
    if (isUrl(data)) return 'URL';
    if (isEmail(data)) return 'Email';
    if (isPhone(data)) return 'Phone';
    if (isProductCode(data, type)) return 'Product Code';
    if (/^\d+$/.test(data)) return 'Numeric';
    if (data.includes('\n') || data.includes(',')) return 'Structured';
    return 'Text';
  };

  const renderProductLookupCard = () => {
    if (!isProductCode(data, type)) return null;

    return (
      <View style={styles.productLookupCard}>
        <View style={styles.productCardHeader}>
          <Ionicons name="storefront" size={32} color="#ff006e" />
          <View style={styles.productCardText}>
            <Text style={styles.productCardTitle}>Product Detected!</Text>
            <Text style={styles.productCardSubtitle}>
              This appears to be a product barcode. Get detailed information about this product.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.productLookupButton, loadingProduct && styles.disabledButton]} 
          onPress={handleProductLookup}
          disabled={loadingProduct}
        >
          {loadingProduct ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.productLookupButtonText}>Looking up product...</Text>
            </>
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.productLookupButtonText}>Find Product Details</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderActionButtons = () => {
    const buttons = [];

    // Copy button (always available)
    buttons.push(
      <TouchableOpacity key="copy" style={styles.actionButton} onPress={handleCopy}>
        <Ionicons name="copy-outline" size={18} color="#fff" />
        <Text style={styles.actionButtonText}>Copy</Text>
      </TouchableOpacity>
    );

    // URL button
    if (isUrl(data)) {
      buttons.push(
        <TouchableOpacity key="url" style={styles.actionButton} onPress={handleOpenUrl}>
          <Ionicons name="open-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Open URL</Text>
        </TouchableOpacity>
      );
    }

    // Email button
    if (isEmail(data)) {
      buttons.push(
        <TouchableOpacity key="email" style={styles.actionButton} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Email</Text>
        </TouchableOpacity>
      );
    }

    // Phone button
    if (isPhone(data)) {
      buttons.push(
        <TouchableOpacity key="phone" style={styles.actionButton} onPress={handlePhone}>
          <Ionicons name="call-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
      );
    }

    // Share button
    buttons.push(
      <TouchableOpacity key="share" style={styles.actionButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={18} color="#fff" />
        <Text style={styles.actionButtonText}>Share</Text>
      </TouchableOpacity>
    );

    return buttons;
  };

  const renderSearchButtons = () => {
    return (
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Search Options</Text>
        <View style={styles.searchButtons}>
          <TouchableOpacity style={[styles.searchButton, styles.googleButton]} onPress={handleGoogleSearch}>
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.searchButton, styles.wikiButton]} onPress={handleWikipediaSearch}>
            <Ionicons name="library-outline" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>Wikipedia</Text>
          </TouchableOpacity>

          {isProductCode(data, type) && (
            <TouchableOpacity style={[styles.searchButton, styles.productSearchButton]} onPress={handleProductSearch}>
              <Ionicons name="bag-outline" size={18} color="#fff" />
              <Text style={styles.searchButtonText}>Shop Online</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={50} color="#00ff00" />
          </View>
          <Text style={styles.successTitle}>Scan Successful!</Text>
          <Text style={styles.barcodeType}>{getBarcodeTypeName(type)}</Text>
        </View>

        {/* Main Content with ScrollView */}
        <View style={styles.scrollContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* Product Lookup Card (if product detected) */}
            {renderProductLookupCard()}

            <View style={styles.dataContainer}>
              <Text style={styles.dataLabel}>Scanned Data:</Text>
              <View style={styles.dataBox}>
                <ScrollView 
                  style={styles.dataScrollView}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.dataText} selectable={true}>
                    {data}
                  </Text>
                </ScrollView>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Text style={styles.actionTitle}>Quick Actions</Text>
              <ScrollView 
                horizontal={true} 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.actionButtons}
              >
                {renderActionButtons()}
              </ScrollView>
            </View>

            {/* Search Buttons */}
            {renderSearchButtons()}

            {/* Data Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Scan Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{getBarcodeTypeName(type)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Length:</Text>
                <Text style={styles.infoValue}>{data?.length || 0} characters</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Format:</Text>
                <Text style={styles.infoValue}>{getDataFormat()}</Text>
              </View>
              
              <View style={[styles.infoRow, styles.lastInfoRow]}>
                <Text style={styles.infoLabel}>Time:</Text>
                <Text style={styles.infoValue}>{new Date().toLocaleTimeString()}</Text>
              </View>
            </View>

            {/* Extra padding at bottom for better scrolling */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </View>

        {/* Scan Again Button - Fixed at bottom */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.scanAgainButton} onPress={onReset}>
            <Ionicons name="camera-outline" size={24} color="#000" />
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  successIconContainer: {
    marginBottom: 10,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  barcodeType: {
    fontSize: 18,
    color: '#00ff00',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Product Lookup Card Styles
  productLookupCard: {
    backgroundColor: 'rgba(255, 0, 110, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    marginTop: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 110, 0.3)',
    elevation: 5,
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  productCardText: {
    flex: 1,
    marginLeft: 15,
  },
  productCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  productCardSubtitle: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 18,
  },
  productLookupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff006e',
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 0, 110, 0.5)',
    elevation: 1,
  },
  productLookupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  dataContainer: {
    marginBottom: 25,
  },
  dataLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  dataBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,255,0,0.3)',
    maxHeight: 200,
  },
  dataScrollView: {
    maxHeight: 160,
  },
  dataText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  actionButtonsContainer: {
    marginBottom: 25,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.4)',
    marginHorizontal: 4,
    minWidth: 90,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchSection: {
    marginBottom: 25,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  searchButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderColor: 'rgba(66, 133, 244, 0.4)',
  },
  wikiButton: {
    backgroundColor: 'rgba(255, 140, 0, 0.2)',
    borderColor: 'rgba(255, 140, 0, 0.4)',
  },
  productSearchButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
    borderColor: 'rgba(156, 39, 176, 0.4)',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  infoContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 16,
    color: '#ccc',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 15,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff00',
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanAgainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
});

export default ResultScreen;