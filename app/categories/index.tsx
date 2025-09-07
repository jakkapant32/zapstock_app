import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
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
import QuickActionsBar from '../../components/QuickActionsBar';
import { useData } from '../../contexts/DataContext';

interface Category {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type SortOption = 'name_asc' | 'name_desc' | 'date_newest' | 'date_oldest';

export const unstable_settings = { initialRouteName: 'index', headerShown: false };

const Categories = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { categories, deleteCategory, loading, error } = useData();
  const [searchText, setSearchText] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [showSortModal, setShowSortModal] = useState(false);

  // Data is now loaded from context
  useEffect(() => {
    setLocalLoading(false);
    console.log('🔄 Categories component mounted');
    console.log('📊 Categories from context:', categories);
    console.log('📊 Categories length:', categories?.length);
  }, [categories]);

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
    router.push('/categories/add');
  };

  const handleEditCategory = (category: Category) => {
    router.push(`/categories/edit?id=${category.id}`);
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'ลบหมวดหมู่',
      `ต้องการลบหมวดหมู่ "${category.name}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert('สำเร็จ', 'ลบหมวดหมู่สำเร็จ');
            } catch (error: any) {
              Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการลบหมวดหมู่');
            }
          }
        }
      ]
    );
  };


  const filteredCategories = (categories || []).filter(category =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'date_newest':
        const dateB = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateA = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      case 'date_oldest':
        const dateA2 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA2 - dateB2;
      default:
        return 0;
    }
  });

  const getSortOptionText = (option: SortOption) => {
    switch (option) {
      case 'name_asc': return 'ชื่อ A-Z';
      case 'name_desc': return 'ชื่อ Z-A';
      case 'date_newest': return 'ใหม่ล่าสุด';
      case 'date_oldest': return 'เก่าสุด';
      default: return 'เรียงตาม';
    }
  };

  const CategoryCard = ({ category }: { category: Category }) => {
    return (
      <TouchableOpacity style={styles.categoryCard} activeOpacity={0.8}>
        <View style={styles.categoryInfo}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryName} numberOfLines={2}>{category.name || 'ไม่มีชื่อ'}</Text>
            <View style={styles.categoryActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditCategory(category)}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { marginLeft: 4 }]}
                onPress={() => handleDeleteCategory(category)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
          
          {category.description && (
            <Text style={styles.categoryDescription} numberOfLines={2}>
              {category.description}
            </Text>
          )}
          
          <View style={styles.categoryFooter}>
            <Text style={styles.categoryDate}>
              สร้าง: {new Date(category.createdAt || '').toLocaleDateString('th-TH')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  const SortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sortModal}>
          <View style={styles.sortModalHeader}>
            <Text style={styles.sortModalTitle}>เรียงตาม</Text>
            <TouchableOpacity onPress={() => setShowSortModal(false)}>
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.sortOptionsContainer}>
            {[
              { key: 'name_asc', label: 'ชื่อ A-Z', icon: 'text' },
              { key: 'name_desc', label: 'ชื่อ Z-A', icon: 'text' },
              { key: 'date_newest', label: 'ใหม่ล่าสุด', icon: 'time' },
              { key: 'date_oldest', label: 'เก่าสุด', icon: 'time' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortOption === option.key && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortOption(option.key as SortOption);
                  setShowSortModal(false);
                }}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={20} 
                  color={sortOption === option.key ? '#007AFF' : '#8E8E93'} 
                />
                <Text style={[
                  styles.sortOptionText,
                  sortOption === option.key && styles.sortOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {sortOption === option.key && (
                  <Ionicons name="checkmark" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>จัดการหมวดหมู่</Text>
      </View>

      {/* Search and Filter */}
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
        <TouchableOpacity style={styles.addButtonContainer} onPress={handleAddCategory}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView 
        style={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Results and Sort */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>พบ {filteredCategories.length} รายการ</Text>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Text style={styles.sortButtonText}>{getSortOptionText(sortOption)}</Text>
            <Ionicons name="chevron-down" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {loading || localLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
          </View>
        ) : (
          <>
            <View style={styles.categoriesGrid}>
              {sortedCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>

            {sortedCategories.length === 0 && (
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

      {/* Sort Modal */}
      <SortModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 6,
    minHeight: 100,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: '#0056CC',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    marginRight: 8,
  },
  addButtonContainer: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  categoriesContainer: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  resultsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
  categoriesGrid: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  categoryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDate: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
    marginBottom: 24,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  // Sort Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  sortOptionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  sortOptionActive: {
    backgroundColor: '#F0F8FF',
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  sortOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Categories;
