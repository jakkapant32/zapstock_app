import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickActionsBarProps {
  active?: string;
  onAddPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  active,
  onAddPress,
  onEditPress,
  onDeletePress,
  showAdd = true,
  showEdit = true,
  showDelete = true,
}) => {
  const router = useRouter();

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'หน้าหลัก',
      icon: 'home',
      route: '/dashboard'
    },
    {
      id: 'products',
      name: 'สินค้า',
      icon: 'cube',
      route: '/products'
    },
    {
      id: 'categories',
      name: 'หมวดหมู่',
      icon: 'folder',
      route: '/categories'
    },
    {
      id: 'profile',
      name: 'โปรไฟล์',
      icon: 'person',
      route: '/profile'
    }
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      {navigationItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.navItem,
            active === item.id && styles.activeNavItem
          ]}
          onPress={() => handleNavigation(item.route)}
        >
          <Ionicons
            name={item.icon as any}
            size={24}
            color={active === item.id ? '#FFFFFF' : '#8E8E93'}
          />
          <Text style={[
            styles.navText,
            active === item.id && styles.activeNavText
          ]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: '#1E3A8A',
  },
  navText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  activeNavText: {
    color: '#FFFFFF',
  },
});

export default QuickActionsBar;
