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

export default function ProductTracking() {
  const router = useRouter();
  const { products, categories, refreshData } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('stock'); // 'stock', 'name', 'category'

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  // ฟังก์ชันดึงสินค้าขายดี
  const getTopProducts = () => {
    const sortedProducts = [...products]
      .filter(product => product.currentStock > 0) // แสดงเฉพาะสินค้าที่มีสต็อก
      .sort((a, b) => {
        if (sortBy === 'stock') {
          // เรียงตามสต็อกจากมากไปน้อย
          if (b.currentStock !== a.currentStock) {
            return b.currentStock - a.currentStock;
          }
          // ถ้าสต็อกเท่ากัน เรียงตามชื่อ
          return a.name.localeCompare(b.name, 'th');
        } else if (sortBy === 'name') {
          // เรียงตามชื่อ
          return a.name.localeCompare(b.name, 'th');
        } else if (sortBy === 'category') {
          // เรียงตามหมวดหมู่
          const categoryA = categories.find(cat => cat.id === a.categoryId)?.name || '';
          const categoryB = categories.find(cat => cat.id === b.categoryId)?.name || '';
          return categoryA.localeCompare(categoryB, 'th');
        }
        return 0;
      });
    
    return sortedProducts;
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

  const topProducts = getTopProducts();

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
        <Text style={styles.headerTitle}>สินค้าขายดี</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => {
              const stockStatus = getStockStatus(product.currentStock, product.minStockQuantity);
              return (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
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
                  
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleNavigate(`/products/edit?id=${product.id}`)}
                  >
                    <Ionicons name="create-outline" size={20} color="#007AFF" />
                    <Text style={styles.editButtonText}>แก้ไข</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyStateText}>ยังไม่มีสินค้า</Text>
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
  rankBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
