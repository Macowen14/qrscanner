// App.js - Enhanced with product lookup integration
import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView // Use React Native's built-in ScrollView
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

import CameraScreen from "./components/CameraScreen";
import ResultScreen from "./components/ResultScreen";
import ProductScreen from "./components/ProductScreen";
import ThreeDScreen from "./components/3DScreen";
import PureGraphicsScreen from "./components/PureGraphicsScreen";
import ProductService from "./services/ProductService";
import Toast from "./utils/Toast";

const { width } = Dimensions.get('window');

export default function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'scanner', 'result', 'product', '3d', 'skia3d'
  
  // Scanner states
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [facing, setFacing] = useState('back');
  
  // Product states
  const [productData, setProductData] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  // Helper function to check if barcode is a product barcode
  const isProductBarcode = (data, type) => {
    if (!data) return false;
    
    // Clean the barcode
    const cleaned = data.replace(/[\s\-]/g, '').trim();
    
    // Check if it matches product barcode patterns
    const productPatterns = [
      /^\d{8}$/,    // EAN-8
      /^\d{12}$/,   // UPC-A
      /^\d{13}$/,   // EAN-13
      /^\d{14}$/,   // GTIN-14
      /^97[89]\d{10}$/, // ISBN-13
    ];
    
    // Check if the barcode type indicates a product
    const productBarcodeTypes = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'];
    
    return productPatterns.some(pattern => pattern.test(cleaned)) || 
           productBarcodeTypes.includes(type?.toLowerCase());
  };

  // Scanner functions
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScanData({ type, data });
    Toast.success('Barcode scanned successfully!');
    
    // Always go to result screen first
    setCurrentScreen('result');
  };

  const handleProductLookup = async (barcode) => {
    setLoadingProduct(true);
    Toast.loading('Looking up product information...');
    
    try {
      const productInfo = await ProductService.lookupProduct(barcode);
      setProductData(productInfo);
      
      if (productInfo.found && !productInfo.isUnknown) {
        Toast.success(`Product found: ${productInfo.name}`);
        setCurrentScreen('product');
      } else if (productInfo.isUnknown) {
        Toast.info('Product found with limited information');
        setCurrentScreen('product');
      } else {
        Toast.warning('Product not found in any database');
      }
    } catch (error) {
      console.error('Product lookup failed:', error);
      Toast.error('Failed to lookup product information');
    } finally {
      setLoadingProduct(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanData(null);
    setProductData(null);
    setLoadingProduct(false);
    setCurrentScreen('scanner');
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Navigation functions
  const navigateTo = (screen) => {
    // Reset scanner state when leaving scanner
    if (currentScreen === 'result' || currentScreen === 'product') {
      if (screen !== 'scanner') {
        setScanned(false);
        setScanData(null);
        setProductData(null);
      }
    }
    setCurrentScreen(screen);
  };

  const goHome = () => {
    setCurrentScreen('home');
    setScanned(false);
    setScanData(null);
    setProductData(null);
  };

  // Home Screen Component
  const HomeScreen = () => (
    <View style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Ionicons name="apps" size={50} color="#00ff00" />
        <Text style={styles.homeTitle}>Multi-Feature Scanner App</Text>
        <Text style={styles.homeSubtitle}>Scan barcodes, QR codes, and explore 3D graphics</Text>
      </View>

      <View style={styles.featuresGrid}>
        {/* Barcode Scanner Card */}
        <TouchableOpacity
          style={[styles.featureCard, styles.scannerCard]}
          onPress={() => navigateTo('scanner')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="scan" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Smart Scanner</Text>
          <Text style={styles.cardDescription}>
            Scan product barcodes, QR codes, and get detailed information
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Three.js 3D Card */}
        <TouchableOpacity
          style={[styles.featureCard, styles.threejsCard]}
          onPress={() => navigateTo('3d')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="cube" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>3D Scene</Text>
          <Text style={styles.cardDescription}>
            Interactive 3D objects with Three.js and touch controls
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Graphics Card */}
        <TouchableOpacity
          style={[styles.featureCard, styles.skiaCard]}
          onPress={() => navigateTo('skia3d')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="diamond" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Pure Graphics</Text>
          <Text style={styles.cardDescription}>
            Hardware-accelerated graphics with smooth animations
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* API Status Card */}
        <TouchableOpacity
          style={[styles.featureCard, styles.statusCard]}
          onPress={() => showAPIStatus()}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="settings-outline" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>API Status</Text>
          <Text style={styles.cardDescription}>
            Check product lookup API configuration and status
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="information-circle" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Show API Status
  const showAPIStatus = () => {
    const status = ProductService.getAPIStatus();
    const activeAPIs = Object.entries(status)
      .filter(([_, isActive]) => isActive)
      .map(([name, _]) => name)
      .join(', ');
    
    const inactiveAPIs = Object.entries(status)
      .filter(([_, isActive]) => !isActive)
      .map(([name, _]) => name)
      .join(', ');

    Toast.info(`Active APIs: ${activeAPIs || 'None'}`, 'LONG');
    
    Alert.alert(
      'API Status',
      `Active APIs: ${activeAPIs || 'None'}\n\nInactive APIs: ${inactiveAPIs || 'None'}\n\nTo enable more APIs, add your API keys to the ProductService.`,
      [{ text: 'OK' }]
    );
  };

  // Navigation Bar Component
  const NavigationBar = () => {
    if (currentScreen === 'home') return null;

    const getScreenTitle = () => {
      switch (currentScreen) {
        case 'scanner': return 'Scanner';
        case 'result': return 'Scan Result';
        case 'product': return loadingProduct ? 'Loading...' : 'Product Info';
        case '3d': return '3D Scene';
        case 'skia3d': return 'Pure Graphics';
        default: return 'App';
      }
    };

    return (
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navButton} onPress={goHome}>
          <Ionicons name="home" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>

        <View style={styles.navTitle}>
          <Text style={styles.navTitleText}>{getScreenTitle()}</Text>
          {loadingProduct && (
            <Text style={styles.navSubtitle}>Looking up product...</Text>
          )}
        </View>

        <View style={styles.navSpacer} />
      </View>
    );
  };

  // Permission handling for scanner
  if ((currentScreen === 'scanner' || currentScreen === 'result' || currentScreen === 'product') && hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar />
        <View style={styles.messageContainer}>
          <Ionicons name="camera" size={50} color="#ccc" />
          <Text style={styles.message}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if ((currentScreen === 'scanner' || currentScreen === 'result' || currentScreen === 'product') && hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationBar />
        <View style={styles.messageContainer}>
          <Ionicons name="camera-off" size={50} color="#ff4444" />
          <Text style={styles.message}>No access to camera</Text>
          <Text style={styles.subMessage}>Please enable camera permissions in settings to scan barcodes</Text>
          <TouchableOpacity style={styles.backButton} onPress={goHome}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render current screen
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      
      case 'scanner':
        return (
          <CameraScreen
            facing={facing}
            onBarCodeScanned={handleBarCodeScanned}
            onToggleFacing={toggleCameraFacing}
          />
        );
      
      case 'result':
        return (
          <ResultScreen 
            scanData={scanData} 
            onReset={resetScanner}
            onProductLookup={handleProductLookup}
            loadingProduct={loadingProduct}
          />
        );
      
      case 'product':
        return (
          <ProductScreen
            productData={productData}
            onBack={() => setCurrentScreen('result')}
            onScanAgain={resetScanner}
          />
        );
      
      case '3d':
        return <ThreeDScreen />;
      
      case 'skia3d':
        return <PureGraphicsScreen />;
      
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsHorizontalScrollIndicator={false} 
        showsVerticalScrollIndicator={false}
        scrollEnabled={currentScreen === 'home'}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <NavigationBar />
        {renderCurrentScreen()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Navigation Bar Styles
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,0,0.3)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,255,0,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.4)',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  navTitle: {
    flex: 1,
    alignItems: 'center',
  },
  navTitleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navSubtitle: {
    color: '#00ff00',
    fontSize: 12,
    marginTop: 2,
  },
  navSpacer: {
    width: 80, // Same width as navButton to center the title
  },

  // Home Screen Styles
  homeContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  homeHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  homeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  homeSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scannerCard: {
    borderColor: 'rgba(0,255,0,0.4)',
    backgroundColor: 'rgba(0,255,0,0.1)',
  },
  threejsCard: {
    borderColor: 'rgba(255,0,110,0.4)',
    backgroundColor: 'rgba(255,0,110,0.1)',
  },
  skiaCard: {
    borderColor: 'rgba(0,245,255,0.4)',
    backgroundColor: 'rgba(0,245,255,0.1)',
  },
  statusCard: {
    borderColor: 'rgba(255,149,0,0.4)',
    backgroundColor: 'rgba(255,149,0,0.1)',
  },
  cardIcon: {
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    alignItems: 'center',
  },

  // Message Screens
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 20,
  },
  subMessage: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});