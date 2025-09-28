// components/ProductScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductScreen = ({ productData, onBack, onScanAgain }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  if (!productData) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ff4444" />
          <Text style={styles.errorText}>No product data available</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { found, source, name, brand, category, image, description, price, currency, ingredients, nutrition, nutritionGrade, additionalInfo, url, isUnknown } = productData;

  const handleShare = async () => {
    try {
      const shareMessage = `${name} by ${brand}\nBarcode: ${productData.barcode}\nCategory: ${category}${price ? `\nPrice: ${price} ${currency || ''}` : ''}`;
      
      await Share.share({
        message: shareMessage,
        title: 'Product Information',
      });


    } catch (error) {
      console.error('Error sharing product:', error);
      Alert.alert('Error', 'Failed to share product information');
    }
  };

  const handleOpenUrl = async () => {
    if (url) {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        console.error('Error opening URL:', error);
        Alert.alert('Error', 'Failed to open URL');
      }
    }
  };

  const renderNutritionInfo = () => {
    if (!nutrition) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition Information (per 100g)</Text>
        <View style={styles.nutritionContainer}>
          {Object.entries(nutrition).map(([key, value]) => (
            <View key={key} style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
              </Text>
              <Text style={styles.nutritionValue}>
                {value} {getNutritionUnit(key)}
              </Text>
            </View>
          ))}
        </View>
        
        {nutritionGrade && (
          <View style={styles.nutritionGradeContainer}>
            <Text style={styles.nutritionGradeLabel}>Nutrition Grade:</Text>
            <View style={[styles.nutritionGradeBadge, { backgroundColor: getNutritionGradeColor(nutritionGrade) }]}>
              <Text style={styles.nutritionGradeText}>{nutritionGrade.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const getNutritionUnit = (key) => {
    const units = {
      energy: 'kcal',
      fat: 'g',
      saturatedFat: 'g',
      carbohydrates: 'g',
      sugars: 'g',
      protein: 'g',
      fiber: 'g',
      salt: 'g',
      sodium: 'g'
    };
    return units[key] || '';
  };

  const getNutritionGradeColor = (grade) => {
    const colors = {
      'a': '#00C851',
      'b': '#7CB342',
      'c': '#FFB74D',
      'd': '#FF8A65',
      'e': '#FF5722'
    };
    return colors[grade.toLowerCase()] || '#666';
  };

  const renderAdditionalInfo = () => {
    if (!additionalInfo || Object.keys(additionalInfo).length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        {Object.entries(additionalInfo).map(([key, value]) => {
          if (!value || value === '') return null;
          
          return (
            <View key={key} style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
              </Text>
              <Text style={styles.infoValue}>
                {Array.isArray(value) ? value.join(', ') : value}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderUnknownProductActions = () => {
    if (!isUnknown) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help Improve Database</Text>
        <Text style={styles.helpText}>
          This product wasn't found in our databases. You can help by:
        </Text>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => Linking.openURL(`https://world.openfoodfacts.org/cgi/product_jqm2.pl?code=${productData.barcode}&action=display`)}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Add to OpenFoodFacts</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Header */}
        <View style={styles.header}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {image && !imageError ? (
              <>
                {imageLoading && (
                  <View style={styles.imageLoadingContainer}>
                    <ActivityIndicator size="large" color="#00ff00" />
                  </View>
                )}
                <Image
                  source={{ uri: image }}
                  style={styles.productImage}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </>
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={60} color="#666" />
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{name}</Text>
            <Text style={styles.productBrand}>{brand}</Text>
            <Text style={styles.productCategory}>{category}</Text>
            
            {price && (
              <Text style={styles.productPrice}>
                {price} {currency || ''}
              </Text>
            )}

            {/* Source Badge */}
            <View style={[styles.sourceBadge, { backgroundColor: getSourceColor(source) }]}>
              <Text style={styles.sourceText}>Source: {source}</Text>
            </View>
          </View>
        </View>

        {/* Barcode Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barcode Information</Text>
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeText}>{productData.barcode}</Text>
            <TouchableOpacity onPress={() => Share.share({ message: productData.barcode })}>
              <Ionicons name="share-outline" size={24} color="#00ff00" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        {description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        )}

        {/* Ingredients */}
        {ingredients && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.ingredientsText}>{ingredients}</Text>
          </View>
        )}

        {/* Nutrition Information */}
        {renderNutritionInfo()}

        {/* Additional Information */}
        {renderAdditionalInfo()}

        {/* Unknown Product Actions */}
        {renderUnknownProductActions()}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#000" />
            <Text style={styles.primaryButtonText}>Share Product</Text>
          </TouchableOpacity>

          {url && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenUrl}>
              <Ionicons name="open-outline" size={20} color="#fff" />
              <Text style={styles.secondaryButtonText}>View Online</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanButton} onPress={onScanAgain}>
          <Ionicons name="scan" size={24} color="#000" />
          <Text style={styles.scanButtonText}>Scan Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getSourceColor = (source) => {
  const colors = {
    'Barcode Lookup': '#4285F4',
    'OpenFoodFacts': '#FF6B35',
    'Go-UPC': '#00C851',
    'EAN-Search': '#FF9800',
    'BarcodeSpider': '#9C27B0',
    'UPCDatabase': '#607D8B',
    'Fallback': '#666666'
  };
  return colors[source] || '#666666';
};

export default ProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,0,0.3)',
  },
  imageContainer: {
    width: 120,
    height: 120,
    marginRight: 20,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    zIndex: 1,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  placeholderText: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 18,
    color: '#00ff00',
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  sourceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  barcodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
  },
  barcodeText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  ingredientsText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  nutritionContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 15,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  nutritionValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'right',
  },
  nutritionGradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    justifyContent: 'center',
  },
  nutritionGradeLabel: {
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
  },
  nutritionGradeBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nutritionGradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 15,
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
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonsContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00ff00',
    paddingVertical: 15,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,0,0.3)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 15,
    paddingVertical: 12,
    backgroundColor: '#00ff00',
    borderRadius: 25,
  },
  scanButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});