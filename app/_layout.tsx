import { Slot } from 'expo-router';
import { View } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { DataProvider } from '../contexts/DataContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
} 