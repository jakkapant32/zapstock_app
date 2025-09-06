import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsBarProps {
  active: 'dashboard' | 'products' | 'categories' | 'profile';
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ active }) => {
  const router = useRouter();

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, active === 'dashboard' && styles.activeTab]}
          onPress={() => handleNavigate('/dashboard')}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={active === 'dashboard' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, active === 'dashboard' && styles.activeTabText]}>
            หน้าแรก
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, active === 'products' && styles.activeTab]}
          onPress={() => handleNavigate('/products')}
        >
          <Ionicons
            name="cube-outline"
            size={24}
            color={active === 'products' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, active === 'products' && styles.activeTabText]}>
            สินค้า
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, active === 'categories' && styles.activeTab]}
          onPress={() => handleNavigate('/categories')}
        >
          <Ionicons
            name="folder-outline"
            size={24}
            color={active === 'categories' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, active === 'categories' && styles.activeTabText]}>
            หมวดหมู่
          </Text>
        </TouchableOpacity>



        <TouchableOpacity
          style={[styles.tab, active === 'profile' && styles.activeTab]}
          onPress={() => handleNavigate('/profile')}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={active === 'profile' ? '#007AFF' : '#8E8E93'}
          />
          <Text style={[styles.tabText, active === 'profile' && styles.activeTabText]}>
            โปรไฟล์
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 20, // สำหรับ iPhone ที่มี home indicator
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  activeTab: {
    backgroundColor: '#F0F8FF',
  },
  tabText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },

});

export default QuickActionsBar; 