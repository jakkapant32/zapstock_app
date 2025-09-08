import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateMessage, setShowUpdateMessage] = useState(false);

  useEffect(() => {
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
          <Text style={styles.loadingText}>Loading from 10.214.162.160:8081...</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* App Name */}
          <Text style={styles.appName}>ZapStock</Text>
          
          {/* Slogan */}
          <Text style={styles.slogan}>Fast Stock. Sure Stock. ZapStock!</Text>
        </View>

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
  return <Redirect href="/auth/Login" />;
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
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    fontStyle: 'italic',
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
