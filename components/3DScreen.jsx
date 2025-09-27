// components/3DScreen.js - Fixed version
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, PanResponder, Dimensions } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ThreeDScreen = () => {
  const [isRotating, setIsRotating] = useState(true);
  const [currentShape, setCurrentShape] = useState('cube');
  const [currentColor, setCurrentColor] = useState('#00ff00');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  const meshRef = useRef();
  const animationIdRef = useRef();
  const glRef = useRef();

  // Pan responder for touch interactions
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isInitialized,
    onMoveShouldSetPanResponder: () => isInitialized,
    onPanResponderGrant: () => {
      setIsRotating(false);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (meshRef.current && isInitialized) {
        const deltaX = gestureState.dx * 0.01;
        const deltaY = gestureState.dy * 0.01;
        
        meshRef.current.rotation.y += deltaX;
        meshRef.current.rotation.x += deltaY;
      }
    },
    onPanResponderRelease: () => {
      // Keep manual control
    },
  });

  const onContextCreate = async (gl) => {
    try {
      console.log('Initializing GL context...');
      glRef.current = gl;
      
      // Initialize Three.js scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Setup camera
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
      cameraRef.current = camera;
      camera.position.set(0, 0, 5);

      // Create a simple WebGL renderer that works with expo-gl
      const renderer = new THREE.WebGLRenderer({
        canvas: {
          width: gl.drawingBufferWidth,
          height: gl.drawingBufferHeight,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: gl.drawingBufferHeight,
          getContext: () => gl,
        },
        context: gl,
        alpha: true,
        antialias: true,
        depth: true,
        stencil: true,
        preserveDrawingBuffer: true
      });

      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000422, 1.0);
      rendererRef.current = renderer;

      // Enhanced lighting setup
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const pointLight1 = new THREE.PointLight(0x00ff00, 0.8, 100);
      pointLight1.position.set(-8, 0, 8);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xff0066, 0.8, 100);
      pointLight2.position.set(8, 0, 8);
      scene.add(pointLight2);

      // Add particles
      createParticles(scene);

      // Create initial shape
      createShape(currentShape, currentColor);

      console.log('Scene initialized successfully');
      setIsInitialized(true);

      // Start render loop
      const render = () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
          return;
        }

        animationIdRef.current = requestAnimationFrame(render);
        
        // Auto-rotation
        if (meshRef.current && isRotating) {
          meshRef.current.rotation.x += 0.008;
          meshRef.current.rotation.y += 0.012;
          meshRef.current.rotation.z += 0.005;
        }

        // Animate lights
        const time = Date.now() * 0.001;
        const lights = scene.children.filter(child => child.type === 'PointLight');
        if (lights.length >= 2) {
          lights[0].position.x = Math.cos(time) * 6;
          lights[0].position.z = Math.sin(time) * 6;
          
          lights[1].position.x = Math.cos(time + Math.PI) * 6;
          lights[1].position.z = Math.sin(time + Math.PI) * 6;
        }

        try {
          renderer.render(scene, camera);
          
          // Essential for expo-gl
          gl.flush();
          gl.endFrameEXP();
        } catch (error) {
          console.warn('Render error:', error);
        }
      };
      
      render();

    } catch (error) {
      console.error('3D Scene initialization error:', error);
    }
  };

  const createParticles = (scene) => {
    try {
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 50;
      const positions = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;     // x
        positions[i + 1] = (Math.random() - 0.5) * 20; // y
        positions[i + 2] = (Math.random() - 0.5) * 20; // z
      }

      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0x00aaff,
        size: 0.15,
        transparent: true,
        opacity: 0.7,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
    } catch (error) {
      console.warn('Particles creation error:', error);
    }
  };

  const createShape = (shapeType, color) => {
    if (!sceneRef.current) {
      console.log('Scene not ready for shape creation');
      return;
    }

    try {
      // Remove existing mesh
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        if (meshRef.current.material) meshRef.current.material.dispose();
      }

      let geometry;

      // Create different geometries
      switch (shapeType) {
        case 'cube':
          geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
          break;

        case 'sphere':
          geometry = new THREE.SphereGeometry(1.8, 32, 32);
          break;

        case 'pyramid':
          geometry = new THREE.ConeGeometry(1.8, 3.5, 8);
          break;

        case 'torus':
          geometry = new THREE.TorusGeometry(1.4, 0.5, 16, 100);
          break;

        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(2.0);
          break;

        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(1.7);
          break;

        case 'icosahedron':
          geometry = new THREE.IcosahedronGeometry(1.8);
          break;

        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(2.2);
          break;

        default:
          geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5);
      }

      // Create material with better properties for mobile
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color(color),
        shininess: 80,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
      });

      // Create mesh and add to scene
      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      sceneRef.current.add(mesh);

      console.log(`Created ${shapeType} with color ${color}`);

    } catch (error) {
      console.error('Shape creation error:', error);
    }
  };

  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      cameraRef.current.rotation.set(0, 0, 0);
    }
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  const changeShape = (newShape) => {
    console.log(`Changing shape to: ${newShape}`);
    setCurrentShape(newShape);
    createShape(newShape, currentColor);
  };

  const changeColor = (newColor) => {
    console.log(`Changing color to: ${newColor}`);
    setCurrentColor(newColor);
    createShape(currentShape, newColor);
  };

  useEffect(() => {
    return () => {
      // Cleanup animation on unmount
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  const shapes = [
    { name: 'cube', icon: 'cube-outline', label: 'Cube' },
    { name: 'sphere', icon: 'radio-button-on-outline', label: 'Sphere' },
    { name: 'pyramid', icon: 'triangle-outline', label: 'Pyramid' },
    { name: 'torus', icon: 'ellipse-outline', label: 'Torus' },
    { name: 'octahedron', icon: 'diamond-outline', label: 'Octahedron' },
    { name: 'dodecahedron', icon: 'flower-outline', label: 'Dodecahedron' },
    { name: 'icosahedron', icon: 'star-outline', label: 'Icosahedron' },
    { name: 'tetrahedron', icon: 'triangle', label: 'Tetrahedron' },
  ];

  const colors = [
    { value: '#00ff00', name: 'Green' },
    { value: '#ff0066', name: 'Pink' },
    { value: '#0066ff', name: 'Blue' },
    { value: '#ffaa00', name: 'Orange' },
    { value: '#ff00aa', name: 'Magenta' },
    { value: '#00aaff', name: 'Cyan' },
    { value: '#aaff00', name: 'Lime' },
    { value: '#ff6600', name: 'Red-Orange' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>3D Interactive Scene</Text>
        <Text style={styles.subtitle}>
          {isInitialized ? 'Touch and drag to interact • Tap controls below' : 'Loading 3D scene...'}
        </Text>
      </View>

      {/* 3D View */}
      <View style={styles.glContainer} {...panResponder.panHandlers}>
        <GLView
          style={styles.gl}
          onContextCreate={onContextCreate}
        />
        {!isInitialized && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Initializing 3D Scene...</Text>
          </View>
        )}
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
                  styles.gridButton,
                  currentShape === shape.name && styles.activeButton
                ]}
                onPress={() => changeShape(shape.name)}
                disabled={!isInitialized}
              >
                <Ionicons 
                  name={shape.icon} 
                  size={16} 
                  color={currentShape === shape.name ? '#000' : '#fff'} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors:</Text>
          <View style={styles.buttonGrid}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color.value}
                style={[
                  styles.colorButton,
                  { backgroundColor: color.value },
                  currentColor === color.value && styles.activeColorButton
                ]}
                onPress={() => changeColor(color.value)}
                disabled={!isInitialized}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isRotating && styles.activeActionButton]}
            onPress={toggleRotation}
            disabled={!isInitialized}
          >
            <Ionicons 
              name={isRotating ? "pause" : "play"} 
              size={18} 
              color={isRotating ? '#000' : '#fff'} 
            />
            <Text style={[
              styles.actionButtonText,
              isRotating && styles.activeActionButtonText
            ]}>
              {isRotating ? 'Pause' : 'Rotate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={resetCamera}
            disabled={!isInitialized}
          >
            <Ionicons name="refresh-outline" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Reset</Text>
          </TouchableOpacity>
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
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
  glContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    position: 'relative',
  },
  gl: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 4, 34, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: '600',
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
  gridButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 40,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#00ff00',
    borderColor: '#00ff00',
  },
  colorButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeColorButton: {
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,0,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,255,0,0.3)',
    minWidth: 120,
    justifyContent: 'center',
  },
  activeActionButton: {
    backgroundColor: '#00ff00',
    borderColor: '#00ff00',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeActionButtonText: {
    color: '#000',
  },
});

export default ThreeDScreen;