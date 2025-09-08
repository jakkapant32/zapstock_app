import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="products" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="transactions" />
            <Stack.Screen name="poor-selling-products" />
            <Stack.Screen name="product-monitoring" />
            <Stack.Screen name="product-tracking" />
            <Stack.Screen name="inactive-products" />
          </Stack>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
