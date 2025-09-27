import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Share,
  Linking,
  Clipboard,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ResultScreen = ({ scanData, onReset }) => {
  if (!scanData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No scan data available</Text>
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
      const url = new URL(string);
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

  const handleShare = async () => {
    try {
      await Share.share({
        message: data,
        title: 'Scanned Code Data',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share content');
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(data);
      Alert.alert('Copied!', 'Content copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
      Alert.alert('Error', 'Failed to copy content');
    }
  };

  const handleOpenUrl = async () => {
    if (isUrl(data)) {
      try {
        const supported = await Linking.canOpenURL(data);
        if (supported) {
          await Linking.openURL(data);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        console.error('Error opening URL:', error);
        Alert.alert('Error', 'Failed to open URL');
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
        } else {
          Alert.alert('Error', 'No email app available');
        }
      } catch (error) {
        console.error('Error opening email:', error);
        Alert.alert('Error', 'Failed to open email');
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
        } else {
          Alert.alert('Error', 'Cannot make phone calls');
        }
      } catch (error) {
        console.error('Error making call:', error);
        Alert.alert('Error', 'Failed to make call');
      }
    }
  };

  const getDataFormat = () => {
    if (isUrl(data)) return 'URL';
    if (isEmail(data)) return 'Email';
    if (isPhone(data)) return 'Phone';
    if (/^\d+$/.test(data)) return 'Numeric';
    if (data.includes('\n') || data.includes(',')) return 'Structured';
    return 'Text';
  };

  const renderActionButtons = () => {
    const buttons = [];

    // Copy button (always available)
    buttons.push(
      <TouchableOpacity key="copy" style={styles.actionButton} onPress={handleCopy}>
        <Ionicons name="copy-outline" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Copy</Text>
      </TouchableOpacity>
    );

    // URL button
    if (isUrl(data)) {
      buttons.push(
        <TouchableOpacity key="url" style={styles.actionButton} onPress={handleOpenUrl}>
          <Ionicons name="open-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Open URL</Text>
        </TouchableOpacity>
      );
    }

    // Email button
    if (isEmail(data)) {
      buttons.push(
        <TouchableOpacity key="email" style={styles.actionButton} onPress={handleEmail}>
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Email</Text>
        </TouchableOpacity>
      );
    }

    // Phone button
    if (isPhone(data)) {
      buttons.push(
        <TouchableOpacity key="phone" style={styles.actionButton} onPress={handlePhone}>
          <Ionicons name="call-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
      );
    }

    // Share button
    buttons.push(
      <TouchableOpacity key="share" style={styles.actionButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={20} color="#fff" />
        <Text style={styles.actionButtonText}>Share</Text>
      </TouchableOpacity>
    );

    return buttons;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={50} color="#00ff00" />
        </View>
        <Text style={styles.successTitle}>Scan Successful!</Text>
        <Text style={styles.barcodeType}>{getBarcodeTypeName(type)}</Text>
      </View>

      {/* Result Content */}
      <ScrollView 
        style={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Scanned Data:</Text>
          <View style={styles.dataBox}>
            <ScrollView 
              horizontal={false} 
              showsVerticalScrollIndicator={true}
              style={styles.dataScrollView}
            >
              <Text style={styles.dataText} selectable={true}>
                {data}
              </Text>
            </ScrollView>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <ScrollView 
            horizontal={true} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionButtons}
          >
            {renderActionButtons()}
          </ScrollView>
        </View>

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
      </ScrollView>

      {/* Scan Again Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.scanAgainButton} onPress={onReset}>
          <Ionicons name="camera-outline" size={24} color="#000" />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
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
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.4)',
    marginHorizontal: 5,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
  },
});

export default ResultScreen;