import { Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TabIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Tab Index - Auth Status:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>กำลังโหลด...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  // ถ้าเข้าสู่ระบบแล้ว ให้ redirect ไปหน้า products
  return <Redirect href="/products" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
