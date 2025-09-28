// components/CameraScreen.js - Updated for result screen first workflow
import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const CameraScreen = ({ facing, onBarCodeScanned, onToggleFacing }) => {
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = (scanData) => {
    if (scanned) return; // Prevent multiple scans
    
    setScanned(true);
    onBarCodeScanned(scanData);
    
    // Reset scanned state after a delay to allow rescanning
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Barcode Scanner</Text>
        <Text style={styles.headerSubtitle}>Point camera at barcode or QR code</Text>
      </View>

      {/* Camera Container with Overlay */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",          // QR Code
              "pdf417",      // PDF417
              "aztec",       // Aztec
              "ean13",       // EAN-13
              "ean8",        // EAN-8
              "upc_e",       // UPC-E
              "upc_a",       // UPC-A
              "datamatrix",  // Data Matrix
              "code128",     // Code 128
              "code39",      // Code 39
              "code93",      // Code 93
              "codabar",     // Codabar
              "itf14",       // ITF-14
            ],
          }}
        />
        
        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {/* Corner indicators */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Scanning line animation */}
              <View style={[styles.scanLine, { opacity: scanned ? 0.3 : 1 }]} />
            </View>
            
            {/* Instructions */}
            <Text style={styles.scanInstructions}>
              {scanned ? 'Scanned! Processing...' : 'Align code within frame to scan'}
            </Text>
            
            {/* Scan status indicator */}
            {scanned && (
              <View style={styles.scannedIndicator}>
                <Ionicons name="checkmark-circle" size={30} color="#00ff00" />
                <Text style={styles.scannedText}>Scanned Successfully!</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.flipButton, scanned && styles.disabledButton]} 
          onPress={onToggleFacing}
          disabled={scanned}
        >
          <Ionicons 
            name="camera-reverse" 
            size={24} 
            color={scanned ? "#666" : "#fff"} 
          />
          <Text style={[styles.flipButtonText, scanned && styles.disabledText]}>
            Flip Camera
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Supports: QR codes, product barcodes (UPC, EAN), PDF417, and more
        </Text>
        <Text style={styles.workflowText}>
          Scan → View Results → Look up Product Details (if needed)
        </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  scanArea: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: '#00ff00',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00ff00',
    top: '50%',
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scannedIndicator: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(0,255,0,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.4)',
  },
  scannedText: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  controls: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledText: {
    color: '#666',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  workflowText: {
    fontSize: 11,
    color: '#00ff00',
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default CameraScreen;