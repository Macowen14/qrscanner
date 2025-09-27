// App.js
import React, { useState, useEffect } from "react";
import { 
  Text, 
  View, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity,
  Dimensions 
} from "react-native";
import { Camera } from "expo-camera";
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

import CameraScreen from "./components/CameraScreen";
import ResultScreen from "./components/ResultScreen";
import ThreeDScreen from "./components/3DScreen";
// import Skia3DScreen from "./components/Skia3DScreen";
import SVGGraphicsScreen from "./components/SVGGraphicsScreen";
import PureGraphicsScreen from "./components/PureGraphicsScreen";

const { width } = Dimensions.get('window');

export default function App() {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'scanner', 'result', '3d', 'skia3d'
  
  // Scanner states
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [facing, setFacing] = useState('back');

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getCameraPermissions();
  }, []);

  // Scanner functions
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScanData({ type, data });
    setCurrentScreen('result');
  };

  const resetScanner = () => {
    setScanned(false);
    setScanData(null);
    setCurrentScreen('scanner');
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  // Navigation functions
  const navigateTo = (screen) => {
    // Reset scanner state when leaving scanner
    if (currentScreen === 'result' && screen !== 'scanner') {
      setScanned(false);
      setScanData(null);
    }
    setCurrentScreen(screen);
  };

  const goHome = () => {
    setCurrentScreen('home');
    setScanned(false);
    setScanData(null);
  };

  // Home Screen Component
  const HomeScreen = () => (
    <View style={styles.homeContainer}>
      <View style={styles.homeHeader}>
        <Ionicons name="apps" size={50} color="#00ff00" />
        <Text style={styles.homeTitle}>Multi-Feature App</Text>
        <Text style={styles.homeSubtitle}>Choose a feature to get started</Text>
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
          <Text style={styles.cardTitle}>Barcode Scanner</Text>
          <Text style={styles.cardDescription}>
            Scan QR codes, barcodes, and more with advanced recognition
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

        {/* Skia 3D Card */}
        <TouchableOpacity
          style={[styles.featureCard, styles.skiaCard]}
          onPress={() => navigateTo('skia3d')}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="diamond" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>Skia Graphics</Text>
          <Text style={styles.cardDescription}>
            Hardware-accelerated 2D/3D graphics with smooth animations
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* Coming Soon Card */}
        <TouchableOpacity
          style={[styles.featureCard, styles.comingSoonCard]}
          onPress={() => {/* Add your next feature */}}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="add-circle-outline" size={40} color="#fff" />
          </View>
          <Text style={styles.cardTitle}>More Features</Text>
          <Text style={styles.cardDescription}>
            Additional features coming soon...
          </Text>
          <View style={styles.cardFooter}>
            <Ionicons name="time-outline" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Navigation Bar Component
  const NavigationBar = () => {
    if (currentScreen === 'home') return null;

    return (
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navButton} onPress={goHome}>
          <Ionicons name="home" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>

        <View style={styles.navTitle}>
          <Text style={styles.navTitleText}>
            {currentScreen === 'scanner' && 'Scanner'}
            {currentScreen === 'result' && 'Scan Result'}
            {currentScreen === '3d' && '3D Scene'}
            {currentScreen === 'skia3d' && 'Skia Graphics'}
          </Text>
        </View>

        <View style={styles.navSpacer} />
      </View>
    );
  };

  // Permission handling for scanner
  if (currentScreen === 'scanner' || currentScreen === 'result') {
    if (hasPermission === null) {
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

    if (hasPermission === false) {
      return (
        <SafeAreaView style={styles.container}>
          <NavigationBar />
          <View style={styles.messageContainer}>
            <Ionicons name="camera-off" size={50} color="#ff4444" />
            <Text style={styles.message}>No access to camera</Text>
            <Text style={styles.subMessage}>Please enable camera permissions in settings</Text>
            <TouchableOpacity style={styles.backButton} onPress={goHome}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }
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
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <NavigationBar />
      {renderCurrentScreen()}
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
    fontSize: 32,
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
  comingSoonCard: {
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