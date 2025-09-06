import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useData } from '../../contexts/DataContext';

const { width } = Dimensions.get('window');

export default function InactiveProducts() {
  const router = useRouter();
  const { products, categories, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'no-stock', 'low-stock'
  const [sortBy, setSortBy] = useState('stock'); // 'stock', 'name', 'category'

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // ฟังก์ชันดึงสินค้าที่ไม่เคลื่อนไหว
  const getInactiveProducts = () => {
    let filteredProducts = [...products];
    
    // กรองตามประเภท
    if (filterBy === 'no-stock') {
      filteredProducts = filteredProducts.filter(product => product.currentStock === 0);
    } else if (filterBy === 'low-stock') {
      filteredProducts = filteredProducts.filter(product => 
        product.currentStock > 0 && product.currentStock <= 5
      );
    }
    
    // เรียงลำดับ
    filteredProducts.sort((a, b) => {
      if (sortBy === 'stock') {
        if (a.currentStock !== b.currentStock) {
          return a.currentStock - b.currentStock;
        }
        return a.name.localeCompare(b.name, 'th');
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'th');
      } else if (sortBy === 'category') {
        const categoryA = categories.find(cat => cat.id === a.categoryId)?.name || '';
        const categoryB = categories.find(cat => cat.id === b.categoryId)?.name || '';
        return categoryA.localeCompare(categoryB, 'th');
      }
      return 0;
    });
    
    return filteredProducts;
  };

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('th-TH');
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(num);
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'ไม่ระบุ';
  };

  const getInactivityStatus = (currentStock: number) => {
    if (currentStock === 0) return { text: 'หมดสต็อก', color: '#FF3B30', bgColor: '#FFE5E5', icon: 'close-circle' };
    if (currentStock <= 2) return { text: 'สต็อกต่ำมาก', color: '#FF9500', bgColor: '#FFF5E5', icon: 'warning' };
    if (currentStock <= 5) return { text: 'สต็อกต่ำ', color: '#FFD700', bgColor: '#FFFDE5', icon: 'alert-circle' };
    return { text: 'ปกติ', color: '#34C759', bgColor: '#E5F5E5', icon: 'checkmark-circle' };
  };

  const getActionSuggestion = (currentStock: number) => {
    if (currentStock === 0) return 'ควรเพิ่มสต็อกหรือยกเลิกสินค้า';
    if (currentStock <= 2) return 'ควรเพิ่มสต็อกด่วน';
    if (currentStock <= 5) return 'ควรพิจารณาเพิ่มสต็อก';
    return 'ติดตามสถานการณ์';
  };

  const inactiveProducts = getInactiveProducts();
  const noStockCount = products.filter(p => p.currentStock === 0).length;
  const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= 5).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>สินค้าไม่เคลื่อนไหว</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="close-circle" size={24} color="#FF3B30" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(noStockCount)}</Text>
              <Text style={styles.statLabel}>หมดสต็อก</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="warning" size={24} color="#FF9500" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(lowStockCount)}</Text>
              <Text style={styles.statLabel}>สต็อกต่ำ</Text>
            </View>
          </View>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>แสดงสินค้า:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterBy('all')}
            >
              <Text style={[styles.filterButtonText, filterBy === 'all' && styles.filterButtonTextActive]}>
                ทั้งหมด ({inactiveProducts.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'no-stock' && styles.filterButtonActive]}
              onPress={() => setFilterBy('no-stock')}
            >
              <Text style={[styles.filterButtonText, filterBy === 'no-stock' && styles.filterButtonTextActive]}>
                หมดสต็อก ({noStockCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'low-stock' && styles.filterButtonActive]}
              onPress={() => setFilterBy('low-stock')}
            >
              <Text style={[styles.filterButtonText, filterBy === 'low-stock' && styles.filterButtonTextActive]}>
                สต็อกต่ำ ({lowStockCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>เรียงตาม:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'stock' && styles.sortButtonActive]}
              onPress={() => setSortBy('stock')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'stock' && styles.sortButtonTextActive]}>
                สต็อก
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>
                ชื่อ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'category' && styles.sortButtonActive]}
              onPress={() => setSortBy('category')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'category' && styles.sortButtonTextActive]}>
                หมวดหมู่
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products List */}
        <View style={styles.productsContainer}>
          {inactiveProducts.length > 0 ? (
            inactiveProducts.map((product, index) => {
              const inactivityStatus = getInactivityStatus(product.currentStock);
              const actionSuggestion = getActionSuggestion(product.currentStock);
              return (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    <View style={[styles.inactivityBadge, { backgroundColor: inactivityStatus.bgColor }]}>
                      <Ionicons 
                        name={inactivityStatus.icon as any} 
                        size={16} 
                        color={inactivityStatus.color} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productCategory}>
                      {getCategoryName(product.categoryId)}
                    </Text>
                    
                    <View style={styles.productStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="cube-outline" size={16} color="#8E8E93" />
                        <Text style={styles.statText}>
                          สต็อก: {formatNumber(product.currentStock)}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="pause-circle" size={16} color="#8E8E93" />
                        <Text style={styles.statText}>
                          ราคา: {formatCurrency(product.price)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.suggestionContainer}>
                      <Text style={styles.suggestionText}>{actionSuggestion}</Text>
                    </View>
                    
                    <View style={[styles.inactivityStatusBadge, { backgroundColor: inactivityStatus.bgColor }]}>
                      <Text style={[styles.inactivityStatusText, { color: inactivityStatus.color }]}>
                        {inactivityStatus.text}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productActions}>
                    <TouchableOpacity 
                      style={styles.restockButton}
                      onPress={() => handleNavigate(`/products/edit?id=${product.id}`)}
                    >
                      <Ionicons name="add-circle" size={20} color="#34C759" />
                      <Text style={styles.restockButtonText}>เพิ่มสต็อก</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleNavigate(`/products/edit?id=${product.id}`)}
                    >
                      <Ionicons name="create-outline" size={20} color="#007AFF" />
                      <Text style={styles.editButtonText}>แก้ไข</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="pause-circle" size={64} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>
                {filterBy === 'no-stock' ? 'ไม่มีสินค้าที่หมดสต็อก' : 
                 filterBy === 'low-stock' ? 'ไม่มีสินค้าที่มีสต็อกต่ำ' : 
                 'ไม่มีสินค้าที่ไม่เคลื่อนไหว'}
              </Text>
              <TouchableOpacity 
                style={styles.addProductButton}
                onPress={() => handleNavigate('/products/add')}
              >
                <Text style={styles.addProductButtonText}>เพิ่มสินค้าใหม่</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  backButton: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0056CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: '#0056CC',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#8E8E93',
    borderColor: '#8E8E93',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sortButtonActive: {
    backgroundColor: '#8E8E93',
    borderColor: '#8E8E93',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  productsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  inactivityBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    gap: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 24,
  },
  productCategory: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  productStats: {
    gap: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  suggestionContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  inactivityStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactivityStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  restockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5F5E5',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  restockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 64,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
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
});
