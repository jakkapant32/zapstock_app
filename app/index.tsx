import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show splash for 3 seconds

    // Show update message after 1 second
    const updateTimer = setTimeout(() => {
      setShowUpdateMessage(true);
    }, 1000);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(updateTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
        
        {/* Background */}
        <View style={styles.background} />
        
        {/* Loading Banner */}
        <View style={styles.loadingBanner}>
          <Text style={styles.loadingText}>Loading ZapStock...</Text>
        </View>

        {/* Main Content */}
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Logo Section */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
            <Image 
              source={require('../assets/icon.png')} 
              style={styles.logoImage} 
            />
          </Animated.View>
          
          {/* App Name */}
          <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>ZapStock</Animated.Text>
          
          {/* Slogan */}
          <Animated.Text style={[styles.slogan, { opacity: fadeAnim }]}>Fast Stock. Sure Stock. ZapStock!</Animated.Text>
        </Animated.View>

        {/* Update Message */}
        {showUpdateMessage && (
          <View style={styles.updateContainer}>
            <Text style={styles.updateText}>New update available, downloading...</Text>
          </View>
        )}
      </View>
    );
  }

  // Redirect to login page after loading
  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E3A8A',
  },
  loadingBanner: {
    backgroundColor: '#666666',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 50, // Add margin for status bar
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: '#1E3A8A',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  updateContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  updateText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
});
