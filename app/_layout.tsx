import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth" />
              <Stack.Screen name="products" />
              <Stack.Screen name="categories" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="transactions" />
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="inactive-products" />
              <Stack.Screen name="poor-selling-products" />
              <Stack.Screen name="product-monitoring" />
              <Stack.Screen name="product-tracking" />
            </Stack>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
