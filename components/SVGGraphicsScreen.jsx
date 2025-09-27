// components/SVGGraphicsScreen.js - Alternative to Skia using React Native SVG
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Polygon,
  Ellipse,
  Defs,
  LinearGradient,
  Stop,
  Shadow,
  G,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const canvasHeight = height * 0.6;

const SVGGraphicsScreen = () => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentShape, setCurrentShape] = useState('cube');
  
  // Animation values
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Start animations
  useEffect(() => {
    if (isAnimating) {
      // Rotation animation
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        })
      ).start();

      // Scale pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: false,
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
            useNativeDriver: false,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isAnimating]);

  const AnimatedG = Animated.createAnimatedComponent(G);

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
    outputRange: [0, 20],
  });

  // Shape components
  const CubeShape = ({ x, y, size = 80, colors }) => (
    <G>
      {/* Main face */}
      <Rect
        x={x - size/2}
        y={y - size/2}
        width={size}
        height={size}
        fill="url(#cubeGradient)"
        stroke="#00ff00"
        strokeWidth="2"
        opacity={0.9}
      />
      
      {/* Side face for 3D effect */}
      <Polygon
        points={`${x + size/2},${y - size/2} ${x + size/2 + 15},${y - size/2 - 15} ${x + size/2 + 15},${y + size/2 - 15} ${x + size/2},${y + size/2}`}
        fill="url(#cubeSideGradient)"
        stroke="#00aa00"
        strokeWidth="1"
        opacity={0.7}
      />
      
      {/* Top face */}
      <Polygon
        points={`${x - size/2},${y - size/2} ${x - size/2 + 15},${y - size/2 - 15} ${x + size/2 + 15},${y - size/2 - 15} ${x + size/2},${y - size/2}`}
        fill="url(#cubeTopGradient)"
        stroke="#00cc00"
        strokeWidth="1"
        opacity={0.8}
      />
    </G>
  );

  const PyramidShape = ({ x, y, size = 80 }) => (
    <G>
      {/* Main triangle */}
      <Polygon
        points={`${x},${y - size/2} ${x + size/2},${y + size/2} ${x - size/2},${y + size/2}`}
        fill="url(#pyramidGradient)"
        stroke="#ff0066"
        strokeWidth="2"
        opacity={0.9}
      />
      
      {/* Right side for 3D effect */}
      <Polygon
        points={`${x},${y - size/2} ${x + size/2},${y + size/2} ${x + size/2 + 10},${y + size/2 - 10} ${x + 10},${y - size/2 - 10}`}
        fill="url(#pyramidSideGradient)"
        stroke="#cc0044"
        strokeWidth="1"
        opacity={0.7}
      />
    </G>
  );

  const DiamondShape = ({ x, y, size = 60 }) => (
    <Polygon
      points={`${x},${y - size} ${x + size/2},${y} ${x},${y + size} ${x - size/2},${y}`}
      fill="url(#diamondGradient)"
      stroke="#00aaff"
      strokeWidth="2"
      opacity={0.9}
    />
  );

  const SphereShape = ({ x, y, size = 60 }) => (
    <Circle
      cx={x}
      cy={y}
      r={size}
      fill="url(#sphereGradient)"
      stroke="#ffaa00"
      strokeWidth="2"
      opacity={0.9}
    />
  );

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    if (!isAnimating) {
      // Restart animations
    }
  };

  const resetAnimation = () => {
    rotationAnim.setValue(0);
    scaleAnim.setValue(1);
    pulseAnim.setValue(0);
    floatAnim.setValue(0);
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

  const renderShape = (x, y, size) => {
    switch (currentShape) {
      case 'cube':
        return <CubeShape x={x} y={y} size={size} />;
      case 'pyramid':
        return <PyramidShape x={x} y={y} size={size} />;
      case 'diamond':
        return <DiamondShape x={x} y={y} size={size} />;
      case 'sphere':
        return <SphereShape x={x} y={y} size={size} />;
      default:
        return <CubeShape x={x} y={y} size={size} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SVG Graphics</Text>
        <Text style={styles.subtitle}>Smooth vector graphics with native animations</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <Svg width={width} height={canvasHeight} style={styles.svg}>
          <Defs>
            {/* Gradients */}
            <LinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#000428" />
              <Stop offset="100%" stopColor="#004e92" />
            </LinearGradient>
            
            <LinearGradient id="cubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#ff006e" />
              <Stop offset="50%" stopColor="#8338ec" />
              <Stop offset="100%" stopColor="#3a86ff" />
            </LinearGradient>
            
            <LinearGradient id="cubeSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#cc0055" />
              <Stop offset="100%" stopColor="#6622bb" />
            </LinearGradient>
            
            <LinearGradient id="cubeTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#dd0066" />
              <Stop offset="100%" stopColor="#7733cc" />
            </LinearGradient>

            <LinearGradient id="pyramidGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#f72585" />
              <Stop offset="50%" stopColor="#b5179e" />
              <Stop offset="100%" stopColor="#480ca8" />
            </LinearGradient>
            
            <LinearGradient id="pyramidSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#cc1166" />
              <Stop offset="100%" stopColor="#330066" />
            </LinearGradient>

            <LinearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00f5ff" />
              <Stop offset="50%" stopColor="#0080ff" />
              <Stop offset="100%" stopColor="#0040aa" />
            </LinearGradient>

            <LinearGradient id="sphereGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#ffaa00" />
              <Stop offset="50%" stopColor="#ff6600" />
              <Stop offset="100%" stopColor="#cc3300" />
            </LinearGradient>
          </Defs>

          {/* Background */}
          <Rect width={width} height={canvasHeight} fill="url(#backgroundGradient)" />

          {/* Main animated shape */}
          <AnimatedG
            rotation={rotation}
            origin={`${width/2}, ${canvasHeight/2}`}
            scale={scaleAnim}
            translateY={floatY}
          >
            {renderShape(width/2, canvasHeight/2, 100)}
          </AnimatedG>

          {/* Floating particles */}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 120;
            const x = width/2 + Math.cos(angle) * radius;
            const y = canvasHeight/2 + Math.sin(angle) * radius * 0.6;
            
            return (
              <Animated.View key={i}>
                <Circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="#00f5ff"
                  opacity={pulseOpacity}
                />
              </Animated.View>
            );
          })}

          {/* Smaller orbiting shapes */}
          <AnimatedG
            rotation={rotation}
            origin={`${width/2}, ${canvasHeight/2}`}
          >
            <G>
              <Circle cx={width/2 + 80} cy={canvasHeight/2} r="12" fill="#ff0066" opacity="0.8" />
              <Rect x={width/2 - 92} y={canvasHeight/2 - 6} width="12" height="12" fill="#00ff66" opacity="0.8" />
              <Polygon
                points={`${width/2},${canvasHeight/2 - 80} ${width/2 + 8},${canvasHeight/2 - 64} ${width/2 - 8},${canvasHeight/2 - 64}`}
                fill="#ffaa00"
                opacity="0.8"
              />
            </G>
          </AnimatedG>
        </Svg>
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
          <Text style={styles.featureText}>• Native SVG rendering</Text>
          <Text style={styles.featureText}>• Smooth vector animations</Text>
          <Text style={styles.featureText}>• Hardware acceleration</Text>
          <Text style={styles.featureText}>• Cross-platform compatibility</Text>
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
    backgroundColor: '#000',
  },
  svg: {
    backgroundColor: 'transparent',
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

export default SVGGraphicsScreen;