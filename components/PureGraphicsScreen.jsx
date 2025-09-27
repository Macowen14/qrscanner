// components/PureGraphicsScreen.js - No external dependencies
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Dimensions, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const canvasHeight = height * 0.6;

const PureGraphicsScreen = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentShape, setCurrentShape] = useState('cube');
  
  // Animation values
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Start animations
  useEffect(() => {
    if (isAnimating) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        })
      ).start();

      // Scale pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.7,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        })
      ).start();

      // Float animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Color animation
      Animated.loop(
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false,
        })
      ).start();
    }
  }, [isAnimating]);

  // Calculate animated values
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ff006e'],
  });

  const borderColor = colorAnim.interpolate({
    inputRange: [0, 0.33, 0.66, 1],
    outputRange: ['#00ff00', '#ff0066', '#0066ff', '#00ff00'],
  });

  // Shape components using View with styling
  const CubeShape = () => (
    <View style={styles.shapeContainer}>
      <Animated.View style={[
        styles.cube,
        { 
          backgroundColor,
          borderColor,
        }
      ]} />
      {/* Side face for 3D effect */}
      <Animated.View style={[
        styles.cubeSide,
        { 
          backgroundColor: backgroundColor,
          opacity: 0.7,
          borderColor,
        }
      ]} />
      {/* Top face */}
      <Animated.View style={[
        styles.cubeTop,
        { 
          backgroundColor: backgroundColor,
          opacity: 0.5,
          borderColor,
        }
      ]} />
    </View>
  );

  const PyramidShape = () => (
    <View style={styles.shapeContainer}>
      <Animated.View style={[
        styles.pyramid,
        { 
          borderBottomColor: backgroundColor,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
        }
      ]} />
    </View>
  );

  const DiamondShape = () => (
    <View style={styles.shapeContainer}>
      <Animated.View style={[
        styles.diamond,
        { 
          backgroundColor,
          borderColor,
        }
      ]} />
    </View>
  );

  const SphereShape = () => (
    <View style={styles.shapeContainer}>
      <Animated.View style={[
        styles.sphere,
        { 
          backgroundColor,
          borderColor,
        }
      ]} />
    </View>
  );

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetAnimation = () => {
    rotationAnim.setValue(0);
    scaleAnim.setValue(1);
    pulseAnim.setValue(0);
    floatAnim.setValue(0);
    colorAnim.setValue(0);
  };

  const changeShape = (shape) => {
    setCurrentShape(shape);
  };

  const shapes = [
    { name: 'cube', label: 'Cube', icon: 'cube-outline' },
    { name: 'pyramid', label: 'Pyramid', icon: 'triangle-outline' },
    { name: 'diamond', label: 'Diamond', icon: 'diamond-outline' },
    { name: 'sphere', label: 'Sphere', icon: 'radio-button-on-outline' },
  ];

  const renderShape = () => {
    switch (currentShape) {
      case 'cube':
        return <CubeShape />;
      case 'pyramid':
        return <PyramidShape />;
      case 'diamond':
        return <DiamondShape />;
      case 'sphere':
        return <SphereShape />;
      default:
        return <CubeShape />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Animated Graphics</Text>
        <Text style={styles.subtitle}>Pure React Native animations</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        {/* Background gradient effect */}
        <View style={styles.backgroundGradient} />
        
        {/* Main shape */}
        <Animated.View style={[
          styles.centerContainer,
          {
            transform: [
              { rotate: rotation },
              { scale: scaleAnim },
              { translateY: floatY },
            ],
          }
        ]}>
          {renderShape()}
        </Animated.View>

        {/* Floating particles */}
        <View style={styles.particleContainer}>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.6;
            
            return (
              <Animated.View
                key={i}
                style={[
                  styles.particle,
                  {
                    left: width/2 + x - 6,
                    top: canvasHeight/2 + y - 6,
                    opacity: pulseOpacity,
                    backgroundColor: borderColor,
                  }
                ]}
              />
            );
          })}
        </View>

        {/* Orbiting elements */}
        <Animated.View 
          style={[
            styles.orbitContainer,
            { transform: [{ rotate: rotation }] }
          ]}
        >
          <View style={[styles.orbitElement, styles.orbitElement1]} />
          <View style={[styles.orbitElement, styles.orbitElement2]} />
          <View style={[styles.orbitElement, styles.orbitElement3]} />
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Shape Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shapes:</Text>
          <View style={styles.buttonGrid}>
            {shapes.map((shape) => (
              <TouchableOpacity
                key={shape.name}
                style={[
                  styles.shapeButton,
                  currentShape === shape.name && styles.activeShapeButton
                ]}
                onPress={() => changeShape(shape.name)}
              >
                <Ionicons 
                  name={shape.icon} 
                  size={16} 
                  color={currentShape === shape.name ? '#000' : '#fff'} 
                />
                <Text style={[
                  styles.shapeButtonText,
                  currentShape === shape.name && styles.activeShapeButtonText
                ]}>
                  {shape.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Animation Controls */}
        <View style={styles.animationControls}>
          <TouchableOpacity
            style={[styles.controlButton, isAnimating && styles.activeControlButton]}
            onPress={toggleAnimation}
          >
            <Ionicons 
              name={isAnimating ? "pause" : "play"} 
              size={18} 
              color={isAnimating ? '#000' : '#fff'} 
            />
            <Text style={[
              styles.controlButtonText,
              isAnimating && styles.activeControlButtonText
            ]}>
              {isAnimating ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={resetAnimation}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <Text style={styles.featureText}>• Native React Native animations</Text>
          <Text style={styles.featureText}>• Hardware acceleration</Text>
          <Text style={styles.featureText}>• No external dependencies</Text>
          <Text style={styles.featureText}>• Cross-platform compatible</Text>
          <Text style={styles.featureText}>• Lightweight and stable</Text>
        </View>
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
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#00f5ff',
    marginTop: 5,
    textAlign: 'center',
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#001122',
    opacity: 0.8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shapeContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cube: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 8,
  },
  cubeSide: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    top: -8,
    left: 8,
  },
  cubeTop: {
    position: 'absolute',
    width: 80,
    height: 15,
    borderWidth: 1,
    top: -8,
    left: 0,
    transform: [{ skewX: '45deg' }],
  },
  pyramid: {
    width: 0,
    height: 0,
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 80,
    borderStyle: 'solid',
  },
  diamond: {
    width: 60,
    height: 60,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
    borderRadius: 8,
  },
  sphere: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  orbitContainer: {
    position: 'absolute',
    top: canvasHeight/2 - 60,
    left: width/2 - 60,
    width: 120,
    height: 120,
  },
  orbitElement: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  orbitElement1: {
    backgroundColor: '#ff0066',
    top: 0,
    left: 52,
  },
  orbitElement2: {
    backgroundColor: '#00ff66',
    top: 52,
    left: 0,
  },
  orbitElement3: {
    backgroundColor: '#ffaa00',
    bottom: 0,
    right: 52,
  },
  controls: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shapeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeShapeButton: {
    backgroundColor: '#00f5ff',
    borderColor: '#00f5ff',
  },
  shapeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeShapeButtonText: {
    color: '#000',
  },
  animationControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,245,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.3)',
    minWidth: 120,
    justifyContent: 'center',
  },
  activeControlButton: {
    backgroundColor: '#00f5ff',
    borderColor: '#00f5ff',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeControlButtonText: {
    color: '#000',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00f5ff',
    marginBottom: 10,
  },
  featureText: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default PureGraphicsScreen;