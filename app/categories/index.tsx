import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CategoryModal from '../../components/CategoryModal';
import QuickActionsBar from '../../components/QuickActionsBar';
import { useData } from '../../contexts/DataContext';

// Add type for category - ปรับให้ตรงกับ Backend API
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; // ตรงกับ backend ที่ส่ง "imageUrl"
  isActive?: boolean; // ตรงกับ backend ที่ส่ง "isActive"
  createdAt?: string; // ตรงกับ backend ที่ส่ง "createdAt"
  updatedAt?: string; // ตรงกับ backend ที่ส่ง "updatedAt"
}

interface CategoryForm {
  name: string;
  description: string;
}

export const unstable_settings = { initialRouteName: 'index', headerShown: false };

const Categories = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { categories, addCategory, updateCategory, deleteCategory, loading, error } = useData();
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Categories are now loaded from context
  useEffect(() => {
    setLocalLoading(false);
    console.log('📱 Categories from context:', categories);
    console.log('📱 Loading state:', loading);
    console.log('📱 Error state:', error);
    console.log('📱 Categories count:', categories?.length || 0);
    
    // Check if we're using fallback data
    if (categories && categories.length > 0) {
      const firstCategory = categories[0];
      console.log('📱 First category:', firstCategory);
      if (firstCategory.name === 'อาหารสด') {
        console.log('⚠️ WARNING: Using fallback data (อาหารสด)');
      } else {
        console.log('✅ Using real data from API');
      }
    }
  }, [categories, loading, error]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh is now handled by context
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
    }
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'ลบหมวดหมู่',
      `ต้องการลบ "${category.name}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete category using context
              await deleteCategory(category.id);
            } catch (error: any) {
              Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
            }
          }
        }
      ]
    );
  };

  const handleSaveCategory = async (categoryData: { name: string; description: string }) => {
    setLocalLoading(true);
    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, categoryData);
      } else {
        // Add new category
        await addCategory(categoryData);
      }
      
      setShowAddModal(false);
      setEditingCategory(null);
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
  };

  const filteredCategories = (categories || []).filter(category =>
    (category.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (category.description?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const CategoryCard = ({ category }: { category: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName} numberOfLines={2}>{category.name}</Text>
        {category.description && (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {category.description}
          </Text>
        )}
        <Text style={styles.categoryDate}>
          สร้างเมื่อ: {category.createdAt ? new Date(category.createdAt).toLocaleDateString('th-TH') : 'ไม่ทราบ'}
        </Text>
      </View>
      
      <View style={styles.categoryActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleEditCategory(category)}
        >
          <Ionicons name="create-outline" size={18} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { marginTop: 8 }]}
          onPress={() => handleDeleteCategory(category)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>จัดการหมวดหมู่</Text>
      </View>

      {/* Search and Add */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาหมวดหมู่..."
            placeholderTextColor="#8E8E93"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.addButtonContainer} 
          onPress={handleAddCategory}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            พบ {filteredCategories.length} หมวดหมู่
          </Text>
          <Text style={styles.debugText}>
            Debug: {categories?.length || 0} categories loaded
          </Text>
        </View>

        {loading || localLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
          </View>
        ) : (
          <>
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>

            {filteredCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>ไม่พบหมวดหมู่</Text>
                <Text style={styles.emptySubtitle}>
                  {searchText ? 'ลองเปลี่ยนคำค้นหา' : 'ยังไม่มีหมวดหมู่ในระบบ'}
                </Text>
                <TouchableOpacity style={styles.addCategoryButton} onPress={handleAddCategory}>
                  <Text style={styles.addCategoryButtonText}>เพิ่มหมวดหมู่ใหม่</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quick Actions */}
      <QuickActionsBar active="categories" />

      {/* Add/Edit Category Modal */}
      <CategoryModal
        visible={showAddModal}
        category={editingCategory}
        onSave={handleSaveCategory}
        onClose={handleCloseModal}
        loading={localLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: '#0056CC',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flex: 0.98,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 8,
  },
  addButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  categoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    lineHeight: 24,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  categoryDate: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  categoryActions: {
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  addCategoryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCategoryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});
export default Categories;

