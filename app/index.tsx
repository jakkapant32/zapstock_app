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
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* App Name */}
          <Text style={styles.appName}>ZapStock</Text>
          
          {/* Slogan */}
          <Text style={styles.slogan}>Fast Stock. Sure Stock. ZapStock!</Text>
          
          {/* Loading Text */}
          <Text style={styles.loadingText}>กำลังโหลด...</Text>
        </View>

        {/* Update Message */}
        {showUpdateMessage && (
          <View style={styles.updateContainer}>
            <Text style={styles.updateText}>กำลังอัปเดต...</Text>
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
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
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
    textAlign: 'center',
  },
});
