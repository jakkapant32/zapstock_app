import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import QuickActionsBar from '../../components/QuickActionsBar';
import { useData } from '../../contexts/DataContext';

const { width } = Dimensions.get('window');

const Dashboard = () => {
    const router = useRouter();
    const navigation = useNavigation();
  const { dashboardStats, products, loading, error } = useData();
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
    }, 1000);

        return () => clearInterval(timer);
    }, []);

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

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('th-TH');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount);
    };

  const getTopProducts = () => {
    // เรียงตามลำดับความสำคัญ: สินค้าที่มีสต็อกมากก่อน
    const sortedProducts = [...products]
      .filter(product => product.currentStock > 0) // แสดงเฉพาะสินค้าที่มีสต็อก
      .sort((a, b) => {
        // เรียงตามสต็อกจากมากไปน้อย
        if (b.currentStock !== a.currentStock) {
          return b.currentStock - a.currentStock;
        }
        // ถ้าสต็อกเท่ากัน เรียงตามชื่อ
        return a.name.localeCompare(b.name, 'th');
      });
    
    return sortedProducts.slice(0, 5);
  };

  // ฟังก์ชันดึงสินค้าขายไม่ดี
  const getPoorSellingProducts = () => {
    const poorProducts = [...products]
      .filter(product => product.currentStock > 0) // แสดงเฉพาะสินค้าที่มีสต็อก
      .sort((a, b) => {
        if (a.currentStock !== b.currentStock) {
          return a.currentStock - b.currentStock; // เรียงจากน้อยไปมาก
        }
        return a.name.localeCompare(b.name, 'th');
      });
    
    return poorProducts.slice(0, 10); // แสดง 10 รายการแรก
  };

  // ฟังก์ชันดึงสินค้าที่ไม่เคลื่อนไหว
  const getInactiveProducts = () => {
    const inactiveProducts = [...products]
      .filter(product => {
        // สินค้าที่มีสต็อกต่ำมากหรือไม่มีสต็อก
        return product.currentStock <= 5 || product.currentStock === 0;
      })
      .sort((a, b) => {
        if (a.currentStock !== b.currentStock) {
          return a.currentStock - b.currentStock;
        }
        return a.name.localeCompare(b.name, 'th');
      });
    
    return inactiveProducts.slice(0, 10); // แสดง 10 รายการแรก
  };

  const getOutOfStockProducts = () => {
    return products.filter(product => product.currentStock === 0).slice(0, 3);
  };

  const getLowStockProducts = () => {
    return products.filter(product => 
      product.currentStock > 0 && 
      product.currentStock <= product.minStockQuantity
    ).slice(0, 3);
  };

  const StatCard = ({ title, value, icon, color, onPress }: {
        title: string;
    value: string | number;
    icon: string;
    color: string;
        onPress?: () => void;
    }) => (
        <TouchableOpacity 
            style={[styles.statCard, { borderLeftColor: color }]} 
            onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statTitle}>{title}</Text>
            </View>
        </TouchableOpacity>
    );

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }: {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
    }) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
                            </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
                        </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const TopProductCard = ({ product, index }: { product: any; index: number }) => (
    <View style={styles.topProductCard}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                        <Text style={styles.productCategory}>{product.categoryName}</Text>
        <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
      </View>
      <View style={styles.productStock}>
        <Text style={styles.stockLabel}>คงเหลือ</Text>
        <Text style={styles.stockValue}>{product.currentStock}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {currentTime.toLocaleDateString('th-TH', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
                    </View>
        <View style={styles.headerRight}>
          <Text style={styles.currentTime}>
            {currentTime.toLocaleTimeString('th-TH', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </Text>
                    </View>
            </View>

            <View style={styles.content}>
            <ScrollView 
                    showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                >


                    {/* Stock Alerts - ออกแบบใหม่ให้ดูดีและทันสมัย */}
                    {(getOutOfStockProducts().length > 0 || getLowStockProducts().length > 0) && (
                      <View style={styles.stockAlertsContainer}>
                        {/* Header with gradient background */}
                        <View style={styles.stockAlertsHeader}>
                          <View style={styles.stockAlertsHeaderContent}>
                            <View style={styles.stockAlertsIconContainer}>
                              <Ionicons name="alert-circle" size={28} color="#FFFFFF" />
                            </View>
                            <View style={styles.stockAlertsTitleContainer}>
                              <Text style={styles.stockAlertsTitle}>แจ้งเตือนสต็อก</Text>
                              <Text style={styles.stockAlertsSubtitle}>
                                ต้องจัดการด่วน {getOutOfStockProducts().length + getLowStockProducts().length} รายการ
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Out of Stock Products - Red Alert */}
                        {getOutOfStockProducts().length > 0 && (
                          <View style={styles.alertCardContainer}>
                            <View style={styles.alertCardHeader}>
                              <View style={styles.alertCardIconContainer}>
                                <Ionicons name="close-circle" size={24} color="#FF3B30" />
                              </View>
                              <View style={styles.alertCardTitleContainer}>
                                <Text style={styles.alertCardTitle}>สินค้าหมด</Text>
                                <Text style={styles.alertCardCount}>{getOutOfStockProducts().length} รายการ</Text>
                              </View>
                              <View style={styles.alertCardPriority}>
                                <Text style={styles.alertCardPriorityText}>ด่วน</Text>
                              </View>
                            </View>
                            
                            <View style={styles.alertProductsGrid}>
                              {getOutOfStockProducts().map((product, index) => (
                                <View key={product.id} style={styles.alertProductCard}>
                                  <View style={styles.alertProductImageContainer}>
                                    <Image source={{ uri: product.image }} style={styles.alertProductImage} />
                                    <View style={styles.alertProductStockBadge}>
                                      <Text style={styles.alertProductStockBadgeText}>หมด</Text>
                                    </View>
                                  </View>
                                  <View style={styles.alertProductInfo}>
                                    <Text style={styles.alertProductName} numberOfLines={2}>
                                      {product.name}
                                    </Text>
                                    <Text style={styles.alertProductCategory}>
                                      {product.categoryName || 'ไม่ระบุหมวดหมู่'}
                                    </Text>
                                    <View style={styles.alertProductStockInfo}>
                                      <Ionicons name="cube-outline" size={16} color="#FF3B30" />
                                      <Text style={styles.alertProductStockText}>
                                        สต็อก: 0
                                      </Text>
                                    </View>
                                  </View>
                                  <TouchableOpacity 
                                    style={styles.restockButtonNew}
                                    onPress={() => handleNavigate(`/products/edit?id=${product.id}`)}
                                  >
                                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.restockButtonTextNew}>เติมสต็อก</Text>
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Low Stock Products - Orange Alert */}
                        {getLowStockProducts().length > 0 && (
                          <View style={styles.alertCardContainer}>
                            <View style={styles.alertCardHeader}>
                              <View style={styles.alertCardIconContainer}>
                                <Ionicons name="warning" size={24} color="#FF9500" />
                              </View>
                              <View style={styles.alertCardTitleContainer}>
                                <Text style={styles.alertCardTitle}>สินค้าใกล้หมด</Text>
                                <Text style={styles.alertCardCount}>{getLowStockProducts().length} รายการ</Text>
                              </View>
                              <View style={styles.alertCardPriorityWarning}>
                                <Text style={styles.alertCardPriorityTextWarning}>เตือน</Text>
                              </View>
                            </View>
                            
                            <View style={styles.alertProductsGrid}>
                              {getLowStockProducts().map((product, index) => (
                                <View key={product.id} style={styles.alertProductCard}>
                                  <View style={styles.alertProductImageContainer}>
                                    <Image source={{ uri: product.image }} style={styles.alertProductImage} />
                                    <View style={styles.alertProductStockBadgeLow}>
                                      <Text style={styles.alertProductStockBadgeTextLow}>
                                        {product.currentStock}
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.alertProductInfo}>
                                    <Text style={styles.alertProductName} numberOfLines={2}>
                                      {product.name}
                                    </Text>
                                    <Text style={styles.alertProductCategory}>
                                      {product.categoryName || 'ไม่ระบุหมวดหมู่'}
                                    </Text>
                                    <View style={styles.alertProductStockInfo}>
                                      <Ionicons name="cube-outline" size={16} color="#FF9500" />
                                      <Text style={styles.alertProductStockText}>
                                        สต็อก: {product.currentStock} / {product.minStockQuantity}
                                      </Text>
                                    </View>
                                  </View>
                                  <TouchableOpacity 
                                    style={styles.restockButtonNewLow}
                                    onPress={() => handleNavigate(`/products/edit?id=${product.id}`)}
                                  >
                                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.restockButtonTextNew}>เติมสต็อก</Text>
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    )}

                                                            {/* ติดตามสินค้า - เปลี่ยนจากสถิติภาพรวม */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>📈 ติดตามสินค้า</Text>
                      
                      {/* แถวที่ 1: สินค้าขายดี + สินค้าขายไม่ดี */}
                      <View style={styles.statsRow}>
                        <StatCard
                          title="สินค้าขายดี"
                          value={formatNumber(getTopProducts().length)}
                          icon="trending-up"
                          color="#FF6B35"
                          onPress={() => handleNavigate('/product-tracking')}
                        />
                        <StatCard
                          title="สินค้าขายไม่ดี"
                          value={formatNumber(getPoorSellingProducts().length)}
                          icon="trending-down"
                          color="#FF3B30"
                          onPress={() => handleNavigate('/poor-selling-products')}
                        />
                      </View>
                      
                      {/* แถวที่ 2: ติดตามสินค้า + ไม่เคลื่อนไหว */}
                      <View style={styles.statsRow}>
                        <StatCard
                          title="ติดตามสินค้า"
                          value={formatNumber(products.filter(p => p.isTracked).length)}
                          icon="eye"
                          color="#9C27B0"
                          onPress={() => handleNavigate('/product-monitoring')}
                        />
                        <StatCard
                          title="ไม่เคลื่อนไหว"
                          value={formatNumber(getInactiveProducts().length)}
                          icon="pause-circle"
                          color="#8E8E93"
                          onPress={() => handleNavigate('/inactive-products')}
                        />
                </View>
                </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>การดำเนินการด่วน</Text>
                        <View style={styles.quickActionsGrid}>
                            <QuickActionCard
                                title="เพิ่มสินค้า"
                                subtitle="เพิ่มสินค้าใหม่"
                                icon="add-circle-outline"
                                color="#007AFF"
                                onPress={() => handleNavigate('/products/add')}
                            />
                            <QuickActionCard
                                title="เพิ่มหมวดหมู่"
                                subtitle="สร้างหมวดหมู่ใหม่"
                                icon="folder-open-outline"
                                color="#34C759"
                                onPress={() => handleNavigate('/categories')}
                            />
                            <QuickActionCard
                                title="จัดการสต็อก"
                                subtitle="ตรวจสอบสินค้า"
                                icon="analytics-outline"
                                color="#FF9500"
                                onPress={() => handleNavigate('/products')}
                            />
                            <QuickActionCard
                                title="รายงาน"
                                subtitle="ดูสถิติต่างๆ"
                                icon="bar-chart-outline"
                                color="#AF52DE"
                                onPress={() => handleNavigate('/dashboard')}
                            />
                        </View>
                    </View>

                {/* Top Products */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>สินค้าขายดี</Text>
                            <TouchableOpacity onPress={() => handleNavigate('/products')}>
                                <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
                        </TouchableOpacity>
                        </View>
                        <View style={styles.topProductsList}>
                            {getTopProducts().length > 0 ? (
                              getTopProducts().map((product, index) => (
                                <TopProductCard key={product.id} product={product} index={index} />
                              ))
                            ) : (
                              <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={48} color="#C7C7CC" />
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
                    </View>

                    {/* Summary Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>สรุปภาพรวม</Text>
                        <View style={styles.summaryGrid}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>มูลค่าสินค้าทั้งหมด</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(dashboardStats?.totalValue || 0)}</Text>
                                </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>สินค้าที่มีสต็อก</Text>
                                <Text style={styles.summaryValue}>{formatNumber(products.filter(p => p.currentStock > 0).length)}</Text>
                                </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>สินค้าใกล้หมด</Text>
                                <Text style={[styles.summaryValue, { color: '#FF9500' }]}>
                                    {formatNumber(getLowStockProducts().length)}
                                </Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>สินค้าหมด</Text>
                                <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>
                                    {formatNumber(getOutOfStockProducts().length)}
                                </Text>
                                </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
            </View>

      {/* Quick Actions Bar */}
            <QuickActionsBar active="dashboard" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
    justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerLeft: {
    flex: 1,
    },
    headerTitle: {
    fontSize: 24,
    fontWeight: '700',
        color: '#000',
    marginBottom: 4,
    },
    headerSubtitle: {
    fontSize: 14,
        color: '#8E8E93',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  currentTime: {
    fontSize: 18,
        fontWeight: '600',
    color: '#007AFF',
    },
    content: {
        flex: 1,
    },
  section: {
        marginTop: 16,
        paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  seeAllText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
        paddingHorizontal: 16,
        marginTop: 16,
    },
    statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 16,
    },
    statCard: {
    flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
        shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    color: '#000',
        marginBottom: 4,
    },
  statTitle: {
        fontSize: 12,
        color: '#8E8E93',
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 48) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
        shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 14,
        fontWeight: '600',
        color: '#000',
    marginBottom: 2,
  },
  quickActionSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
  },
  topProductsList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
        shadowRadius: 4,
    elevation: 3,
  },
  topProductCard: {
        flexDirection: 'row',
        alignItems: 'center',
    padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
  rankText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
        flex: 1,
    },
  productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
  productCategory: {
        fontSize: 12,
        color: '#8E8E93',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  productStock: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 10,
    color: '#8E8E93',
        marginBottom: 2,
    },
  stockValue: {
        fontSize: 14,
        fontWeight: '600',
    color: '#000',
    },
  summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    marginBottom: 12,
        alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
        fontSize: 12,
        color: '#8E8E93',
    marginBottom: 8,
        textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
        textAlign: 'center',
    },
    
    // Stock Alerts Styles - ออกแบบใหม่
    stockAlertsContainer: {
      marginBottom: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      overflow: 'hidden',
    },
    stockAlertsHeader: {
      backgroundColor: '#FF3B30',
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    stockAlertsHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    stockAlertsIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    stockAlertsTitleContainer: {
      flex: 1,
    },
    stockAlertsTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    stockAlertsSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
    },
    alertCardContainer: {
      margin: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E5E5EA',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    alertCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F2F2F7',
    },
    alertCardIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    alertCardTitleContainer: {
      flex: 1,
    },
    alertCardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1C1C1E',
      marginBottom: 2,
    },
    alertCardCount: {
      fontSize: 14,
      color: '#8E8E93',
      fontWeight: '500',
    },
    alertCardPriority: {
      backgroundColor: '#FF3B30',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    alertCardPriorityWarning: {
      backgroundColor: '#FFD700',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    alertCardPriorityText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    alertCardPriorityTextWarning: {
      color: '#000000',
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    alertProductsGrid: {
      padding: 16,
      gap: 16,
    },
    alertProductCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      gap: 16,
      borderWidth: 1,
      borderColor: '#E5E5EA',
    },
    alertProductImageContainer: {
      position: 'relative',
    },
    alertProductImage: {
      width: 60,
      height: 60,
      borderRadius: 12,
    },
    alertProductStockBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#FF3B30',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 32,
      alignItems: 'center',
    },
    alertProductStockBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    alertProductStockBadgeLow: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: '#FF9500',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 32,
      alignItems: 'center',
    },
    alertProductStockBadgeTextLow: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    alertProductInfo: {
      flex: 1,
      gap: 6,
    },
    alertProductName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1C1C1E',
      lineHeight: 22,
    },
    alertProductCategory: {
      fontSize: 14,
      color: '#8E8E93',
      fontWeight: '500',
    },
    alertProductStockInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    alertProductStockText: {
      fontSize: 13,
      color: '#FF3B30',
      fontWeight: '600',
    },
    restockButtonNew: {
      backgroundColor: '#FF3B30',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 100,
      justifyContent: 'center',
      shadowColor: '#FF3B30',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    restockButtonNewLow: {
      backgroundColor: '#FF9500',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 100,
      justifyContent: 'center',
      shadowColor: '#FF9500',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    restockButtonTextNew: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    
    // Empty State Styles
    emptyState: {
      alignItems: 'center',
      padding: 32,
    },
    emptyStateText: {
      fontSize: 16,
      color: '#8E8E93',
      marginTop: 12,
      marginBottom: 16,
    },
    addProductButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    addProductButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
});

export default Dashboard;