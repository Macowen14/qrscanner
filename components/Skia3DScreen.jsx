// components/Skia3DScreen.js - Version without reanimated dependencies
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import {
  Canvas,
  Group,
  vec,
  Path,
  LinearGradient,
  Skia,
  Shadow,
} from '@shopify/react-native-skia';
import { Ionicons } from '@expo/vector-icons';

const Skia3DScreen = () => {
  const { width, height } = useWindowDimensions();
  const canvasHeight = height * 0.6;
  
  // Manual animation state instead of useLoop
  const [animationTime, setAnimationTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  // Manual animation loop
  useEffect(() => {
    let animationId;
    
    if (isAnimating) {
      const animate = () => {
        setAnimationTime(prev => prev + 0.016); // ~60fps
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAnimating]);

  // Calculate animation values manually
  const progress = (animationTime * 0.25) % 1; // 4 second cycle
  const rotationY = (animationTime * 0.33) % 1; // 3 second cycle
  const rotationX = (animationTime * 0.2) % 1; // 5 second cycle

  // Create 3D cube paths
  const createCubePath = (size = 80) => {
    const path = Skia.Path.Make();
    const half = size / 2;
    
    // Front face
    path.moveTo(-half, -half);
    path.lineTo(half, -half);
    path.lineTo(half, half);
    path.lineTo(-half, half);
    path.close();
    
    return path;
  };

  const createPyramidPath = (size = 80) => {
    const path = Skia.Path.Make();
    const half = size / 2;
    
    // Base triangle
    path.moveTo(0, -half);
    path.lineTo(half, half);
    path.lineTo(-half, half);
    path.close();
    
    return path;
  };

  const createDiamondPath = (size = 80) => {
    const path = Skia.Path.Make();
    const half = size / 2;
    
    // Diamond shape
    path.moveTo(0, -half);
    path.lineTo(half, 0);
    path.lineTo(0, half);
    path.lineTo(-half, 0);
    path.close();
    
    return path;
  };

  // Gradient colors
  const gradientColors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5'];
  const gradientColors2 = ['#f72585', '#b5179e', '#7209b7', '#480ca8'];
  const gradientColors3 = ['#ff9500', '#ff5400', '#ff006e', '#8338ec'];

  const CubeComponent = ({ transform, colors, shadowColor }) => (
    <Group transform={transform}>
      {/* Main cube face */}
      <Path path={createCubePath(120)} style="fill">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(120, 120)}
          colors={colors}
        />
        <Shadow dx={5} dy={5} blur={10} color={shadowColor} />
      </Path>
      
      {/* Side face for 3D effect */}
      <Group transform={[{ translateX: 10 }, { translateY: 10 }]}>
        <Path path={createCubePath(120)} style="fill">
          <LinearGradient
            start={vec(0, 0)}
            end={vec(120, 120)}
            colors={colors.map(color => color + '80')} // Add transparency
          />
        </Path>
      </Group>
      
      {/* Top face */}
      <Group transform={[{ translateX: -5 }, { translateY: -5 }]}>
        <Path path={createCubePath(120)} style="fill">
          <LinearGradient
            start={vec(0, 0)}
            end={vec(120, 120)}
            colors={colors.map(color => color + '60')} // More transparency
          />
        </Path>
      </Group>
    </Group>
  );

  const PyramidComponent = ({ transform, colors, shadowColor }) => (
    <Group transform={transform}>
      <Path path={createPyramidPath(140)} style="fill">
        <LinearGradient
          start={vec(0, -70)}
          end={vec(0, 70)}
          colors={colors}
        />
        <Shadow dx={3} dy={3} blur={8} color={shadowColor} />
      </Path>
      
      {/* Side triangles for 3D effect */}
      <Group transform={[{ translateX: 8 }, { translateY: 8 }]}>
        <Path path={createPyramidPath(140)} style="fill">
          <LinearGradient
            start={vec(0, -70)}
            end={vec(0, 70)}
            colors={colors.map(color => color + '60')}
          />
        </Path>
      </Group>
    </Group>
  );

  const DiamondComponent = ({ transform, colors, shadowColor }) => (
    <Group transform={transform}>
      <Path path={createDiamondPath(100)} style="fill">
        <LinearGradient
          start={vec(-50, -50)}
          end={vec(50, 50)}
          colors={colors}
        />
        <Shadow dx={4} dy={4} blur={12} color={shadowColor} />
      </Path>
    </Group>
  );

  // Calculate rotation transformations
  const cubeRotation = [
    { rotateX: (rotationX - 0.5) * Math.PI * 0.3 },
    { rotateY: (rotationY - 0.5) * Math.PI * 2 },
    { rotateZ: (progress - 0.5) * Math.PI * 0.2 },
  ];

  const cubeScale = 0.8 + Math.sin(progress * Math.PI * 2) * 0.2;

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetAnimation = () => {
    setAnimationTime(0);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Skia 3D Graphics</Text>
        <Text style={styles.subtitle}>Hardware-accelerated 2D/3D rendering</Text>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer}>
        <Canvas style={{ width, height: canvasHeight }}>
          {/* Background gradient */}
          <Group>
            <Path 
              path={Skia.Path.Make().addRect(Skia.XYWHRect(0, 0, width, canvasHeight))} 
              style="fill"
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(width, canvasHeight)}
                colors={['#000428', '#004e92']}
              />
            </Path>
          </Group>

          {/* Animated 3D Cube */}
          <Group transform={[
            { translateX: width * 0.25 }, 
            { translateY: canvasHeight * 0.3 },
            ...cubeRotation,
            { scale: cubeScale }
          ]}>
            <CubeComponent 
              transform={[]}
              colors={gradientColors}
              shadowColor="rgba(255, 0, 110, 0.4)"
            />
          </Group>

          {/* Animated Pyramid */}
          <Group transform={[
            { translateX: width * 0.75 }, 
            { translateY: canvasHeight * 0.3 },
            { rotateZ: progress * Math.PI * 2 },
            { scale: 0.9 + Math.cos(progress * Math.PI * 4) * 0.1 }
          ]}>
            <PyramidComponent 
              transform={[]}
              colors={gradientColors2}
              shadowColor="rgba(181, 23, 158, 0.4)"
            />
          </Group>

          {/* Animated Diamond */}
          <Group transform={[
            { translateX: width * 0.5 }, 
            { translateY: canvasHeight * 0.7 },
            { rotateY: rotationY * Math.PI * 2 },
            { rotateX: rotationX * Math.PI },
            { scale: 1.2 }
          ]}>
            <DiamondComponent 
              transform={[]}
              colors={gradientColors3}
              shadowColor="rgba(255, 149, 0, 0.4)"
            />
          </Group>

          {/* Floating particles */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (progress + i / 8) * Math.PI * 2;
            const radius = 80 + Math.sin(progress * Math.PI * 4) * 20;
            const x = width * 0.5 + Math.cos(angle) * radius;
            const y = canvasHeight * 0.5 + Math.sin(angle) * radius * 0.6;
            
            return (
              <Group key={i} transform={[{ translateX: x }, { translateY: y }]}>
                <Path path={createDiamondPath(12)} style="fill">
                  <LinearGradient
                    start={vec(-6, -6)}
                    end={vec(6, 6)}
                    colors={['#00f5ff', '#0080ff']}
                  />
                </Path>
              </Group>
            );
          })}
        </Canvas>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
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

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="hardware-chip-outline" size={20} color="#00f5ff" />
            <Text style={styles.infoText}>Hardware Accelerated</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="eye-outline" size={20} color="#00f5ff" />
            <Text style={styles.infoText}>60 FPS Rendering</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="color-palette-outline" size={20} color="#00f5ff" />
            <Text style={styles.infoText}>GPU Shaders</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features:</Text>
          <Text style={styles.featureText}>• Real-time 3D transformations</Text>
          <Text style={styles.featureText}>• Hardware-accelerated gradients</Text>
          <Text style={styles.featureText}>• Advanced shadow effects</Text>
          <Text style={styles.featureText}>• Smooth 60fps animations</Text>
          <Text style={styles.featureText}>• GPU-optimized rendering</Text>
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
  controls: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,245,255,0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.3)',
  },
  infoRow: {
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
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

export default Skia3DScreen;