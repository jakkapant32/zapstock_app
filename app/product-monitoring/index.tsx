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
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useData } from '../../contexts/DataContext';

const { width } = Dimensions.get('window');

export default function ProductMonitoring() {
  const router = useRouter();
  const { products, categories, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'tracked', 'untracked'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'category', 'stock'

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // ฟังก์ชันดึงสินค้าตามการกรอง
  const getFilteredProducts = () => {
    let filteredProducts = [...products];
    
    // กรองตามสถานะการติดตาม
    if (filterBy === 'tracked') {
      filteredProducts = filteredProducts.filter(product => product.isTracked);
    } else if (filterBy === 'untracked') {
      filteredProducts = filteredProducts.filter(product => !product.isTracked);
    }
    
    // เรียงลำดับ
    filteredProducts.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, 'th');
      } else if (sortBy === 'category') {
        const categoryA = categories.find(cat => cat.id === a.categoryId)?.name || '';
        const categoryB = categories.find(cat => cat.id === b.categoryId)?.name || '';
        return categoryA.localeCompare(categoryB, 'th');
      } else if (sortBy === 'stock') {
        if (b.currentStock !== a.currentStock) {
          return b.currentStock - a.currentStock;
        }
        return a.name.localeCompare(b.name, 'th');
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

  const getStockStatus = (currentStock: number, minStock: number) => {
    if (currentStock === 0) return { text: 'หมด', color: '#FF3B30', bgColor: '#FFE5E5' };
    if (currentStock <= minStock) return { text: 'ใกล้หมด', color: '#FF9500', bgColor: '#FFF5E5' };
    if (currentStock <= minStock * 2) return { text: 'ปานกลาง', color: '#FFD700', bgColor: '#FFFDE5' };
    return { text: 'เพียงพอ', color: '#34C759', bgColor: '#E5F5E5' };
  };

  const toggleTracking = (productId: number) => {
    // ในที่นี้ควรมีการอัปเดตฐานข้อมูล
    // สำหรับตอนนี้เราจะแสดง UI เท่านั้น
    console.log('Toggle tracking for product:', productId);
  };

  const filteredProducts = getFilteredProducts();
  const trackedCount = products.filter(p => p.isTracked).length;
  const untrackedCount = products.filter(p => !p.isTracked).length;

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
        <Text style={styles.headerTitle}>ติดตามสินค้า</Text>
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
              <Ionicons name="eye" size={24} color="#9C27B0" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(trackedCount)}</Text>
              <Text style={styles.statLabel}>สินค้าที่ติดตาม</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="eye-off" size={24} color="#8E8E93" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{formatNumber(untrackedCount)}</Text>
              <Text style={styles.statLabel}>สินค้าที่ไม่ติดตาม</Text>
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
                ทั้งหมด ({products.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'tracked' && styles.filterButtonActive]}
              onPress={() => setFilterBy('tracked')}
            >
              <Text style={[styles.filterButtonText, filterBy === 'tracked' && styles.filterButtonTextActive]}>
                ติดตาม ({trackedCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'untracked' && styles.filterButtonActive]}
              onPress={() => setFilterBy('untracked')}
            >
              <Text style={[styles.filterButtonText, filterBy === 'untracked' && styles.filterButtonTextActive]}>
                ไม่ติดตาม ({untrackedCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>เรียงตาม:</Text>
          <View style={styles.sortButtons}>
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
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'stock' && styles.sortButtonActive]}
              onPress={() => setSortBy('stock')}
            >
              <Text style={[styles.sortButtonText, sortBy === 'stock' && styles.sortButtonTextActive]}>
                สต็อก
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products List */}
        <View style={styles.productsContainer}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.currentStock, product.minStockQuantity);
              return (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    <View style={[styles.trackingBadge, { backgroundColor: product.isTracked ? '#9C27B0' : '#8E8E93' }]}>
                      <Ionicons 
                        name={product.isTracked ? 'eye' : 'eye-off'} 
                        size={12} 
                        color="#FFFFFF" 
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
                        <Ionicons name="trending-up" size={16} color="#8E8E93" />
                        <Text style={styles.statText}>
                          ราคา: {formatCurrency(product.price)}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.stockStatusBadge, { backgroundColor: stockStatus.bgColor }]}>
                      <Text style={[styles.stockStatusText, { color: stockStatus.color }]}>
                        {stockStatus.text}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productActions}>
                    <View style={styles.trackingToggle}>
                      <Text style={styles.trackingLabel}>
                        {product.isTracked ? 'ติดตาม' : 'ไม่ติดตาม'}
                      </Text>
                      <Switch
                        value={product.isTracked}
                        onValueChange={() => toggleTracking(product.id)}
                        trackColor={{ false: '#E5E5EA', true: '#9C27B0' }}
                        thumbColor={product.isTracked ? '#FFFFFF' : '#FFFFFF'}
                      />
                    </View>
                    
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
              <Ionicons name="eye-off" size={64} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>
                {filterBy === 'tracked' ? 'ยังไม่มีสินค้าที่ติดตาม' : 
                 filterBy === 'untracked' ? 'สินค้าทั้งหมดถูกติดตามแล้ว' : 
                 'ยังไม่มีสินค้า'}
              </Text>
              <TouchableOpacity 
                style={styles.addProductButton}
                onPress={() => handleNavigate('/products/add')}
              >
                <Text style={styles.addProductButtonText}>เพิ่มสินค้าแรก</Text>
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
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
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
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
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
  trackingBadge: {
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
  stockStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  trackingToggle: {
    alignItems: 'center',
    gap: 4,
  },
  trackingLabel: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
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
