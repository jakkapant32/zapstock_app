import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
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

// const { width } = Dimensions.get('window');

// Add type for product - ปรับให้ตรงกับ DataContext
interface Product {
  id: string;
  name: string;
  price: number;
  categoryName: string | null;
  currentStock: number;
  image: string | null;
  sku: string | null;
  description: string | null;
  minStockQuantity: number;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
}

type SortOption = 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc' | 'date_newest' | 'date_oldest';

export const unstable_settings = { initialRouteName: 'index', headerShown: false };

const Products = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { products, categories, deleteProduct, loading, error } = useData();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name_asc');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Data is now loaded from context
  useEffect(() => {
    setLocalLoading(false);
    console.log('🔄 Products component mounted');
    console.log('📊 Products from context:', products);
    console.log('📊 Products length:', products?.length);
    if (products && products.length > 0) {
      console.log('📊 First product details:', {
        id: products[0].id,
        name: products[0].name,
        sku: products[0].sku,
        categoryName: products[0].categoryName,
        price: products[0].price,
        currentStock: products[0].currentStock
      });
    }
  }, [products]);

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

  const handleAddProduct = () => {
    router.push('/products/add');
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/products/edit?id=${product.id}`);
  };

  const handleDeleteProduct = async (product: Product) => {
    Alert.alert(
      'ลบสินค้า',
      `ต้องการลบ "${product.name}" หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ลบ', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete product using context
              deleteProduct(product.id);
              Alert.alert('สำเร็จ', 'ลบสินค้าสำเร็จ');
            } catch (error: any) {
              Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการลบสินค้า');
            }
          }
        }
      ]
    );
  };

  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                         (product.sku?.toLowerCase() || '').includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || (product.categoryName || '') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name_asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name_desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'price_asc':
        return (a.price || 0) - (b.price || 0);
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
             case 'stock_asc':
         return (a.currentStock || 0) - (b.currentStock || 0);
       case 'stock_desc':
         return (b.currentStock || 0) - (a.currentStock || 0);
             case 'date_newest':
         return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
       case 'date_oldest':
         return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
      default:
        return 0;
    }
  });

  const allCategories = ['ทั้งหมด', ...(categories || []).map(cat => cat.name)];

  const formatPrice = (price: number | undefined) => {
    const safePrice = price || 0;
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(safePrice);
  };

  const getStatusInfo = (status: string | undefined, stock: number | undefined) => {
    const safeStock = stock || 0;
    switch (status) {
      case 'active':
        if (safeStock <= 5) {
          return { color: '#FF9500', text: `เหลือ ${safeStock} ชิ้น`, bgColor: '#FFF2E6' };
        }
        return { color: '#34C759', text: 'พร้อมจำหน่าย', bgColor: '#E8F7ED' };
      case 'out_of_stock':
        return { color: '#FF3B30', text: 'สินค้าหมด', bgColor: '#FFE6E6' };
      case 'low_stock':
        return { color: '#FF9500', text: `เหลือน้อย (${safeStock})`, bgColor: '#FFF2E6' };
      default:
        return { color: '#8E8E93', text: 'ไม่ทราบสถานะ', bgColor: '#F2F2F7' };
    }
  };

  const getSortOptionText = (option: SortOption) => {
    switch (option) {
      case 'name_asc': return 'ชื่อ A-Z';
      case 'name_desc': return 'ชื่อ Z-A';
      case 'price_asc': return 'ราคาต่ำ-สูง';
      case 'price_desc': return 'ราคาสูง-ต่ำ';
      case 'stock_asc': return 'สต็อกน้อย-มาก';
      case 'stock_desc': return 'สต็อกมาก-น้อย';
      case 'date_newest': return 'ใหม่ล่าสุด';
      case 'date_oldest': return 'เก่าสุด';
      default: return 'เรียงตาม';
    }
  };

  const ProductCard = ({ product }: { product: Product }) => {
    console.log('🔍 ProductCard rendering:', {
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryName: product.categoryName,
      price: product.price,
      currentStock: product.currentStock
    });
    
    const getStatusInfo = (stock: number) => {
      if (stock > 5) return { text: 'พร้อมจำหน่าย', color: '#34C759', bgColor: '#D4EDDA' };
      if (stock <= 5 && stock > 0) return { text: 'เหลือน้อย', color: '#FF9500', bgColor: '#FFF3CD' };
      if (stock === 0) return { text: 'หมด', color: '#FF3B30', bgColor: '#F8D7DA' };
      return { text: 'ไม่ทราบสถานะ', color: '#8E8E93', bgColor: '#F2F2F7' };
    };
    
    const statusInfo = getStatusInfo(product.currentStock || 0);
    
    return (
      <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
        <View style={styles.productImageContainer}>
          <Image source={{ uri: product.image || undefined }} style={styles.productImage} />
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text style={styles.productName} numberOfLines={2}>{product.name || 'ไม่มีชื่อ'}</Text>
            <View style={styles.productActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditProduct(product)}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { marginLeft: 4 }]}
                onPress={() => handleDeleteProduct(product)}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.productSku}>SKU: {product.sku || 'ไม่มี SKU'}</Text>
          <Text style={styles.productCategory}>{product.categoryName || 'ไม่มีหมวดหมู่'}</Text>
          
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
            <Text style={styles.productStock}>คงเหลือ: {product.currentStock || 0}</Text>
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
              { key: 'price_asc', label: 'ราคาต่ำ-สูง', icon: 'trending-up' },
              { key: 'price_desc', label: 'ราคาสูง-ต่ำ', icon: 'trending-down' },
              { key: 'stock_asc', label: 'สต็อกน้อย-มาก', icon: 'trending-up' },
              { key: 'stock_desc', label: 'สต็อกมาก-น้อย', icon: 'trending-down' },
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>จัดการสินค้า</Text>
      </View>



      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาชื่อสินค้าหรือ SKU..."
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
        <TouchableOpacity style={styles.addButtonContainer} onPress={handleAddProduct}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryFilterContainer}>
        <Text style={styles.categoryFilterLabel}>หมวดหมู่:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterScroll}
        >
          {allCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryFilterButton,
                selectedCategory === category && styles.categoryFilterButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryFilterButtonText,
                selectedCategory === category && styles.categoryFilterButtonActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

     

      {/* Products List */}
      <ScrollView 
        style={styles.productsContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >


        {/* Results and Sort */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>พบ {filteredProducts.length} รายการ</Text>
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
            <View style={styles.productsGrid}>
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </View>

            {sortedProducts.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={64} color="#C7C7CC" />
                <Text style={styles.emptyTitle}>ไม่พบสินค้า</Text>
                <Text style={styles.emptySubtitle}>
                  {searchText ? 'ลองเปลี่ยนคำค้นหา' : 'ยังไม่มีสินค้าในหมวดหมู่นี้'}
                </Text>
                <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
                  <Text style={styles.addProductButtonText}>เพิ่มสินค้าใหม่</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quick Actions */}
      <QuickActionsBar active="products" />

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>เลือกหมวดหมู่</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryModalContent}>
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryModalItem,
                    selectedCategory === category && styles.categoryModalItemActive
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryModalItemText,
                    selectedCategory === category && styles.categoryModalItemTextActive
                  ]}>
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <SortModal />
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
    paddingVertical: 28,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: '#0056CC',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },


  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  searchFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoryFilterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  categoryFilterScroll: {
    paddingRight: 16,
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginRight: 8,
  },
  categoryFilterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryFilterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryFilterButtonTextActive: {
    color: '#FFFFFF',
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
    resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  productsContainer: {
    flex: 1,
  },

  productsGrid: {
    paddingHorizontal: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
  },
  productActions: {
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
  productSku: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  productStock: {
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
  addProductButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addProductButtonText: {
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
  // Category Modal Styles
  categoryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  categoryModalContent: {
    padding: 20,
  },
  categoryModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryModalItemActive: {
    backgroundColor: '#F0F8FF',
  },
  categoryModalItemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  categoryModalItemTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Products;