import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../constants/Api';

// Types - ปรับให้ตรงกับ Backend Response
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;  // backend ส่งเป็น "imageUrl"
  isActive?: boolean;         // backend ส่งเป็น "isActive"
  createdAt?: string;         // backend ส่งเป็น "createdAt"
  updatedAt?: string;         // backend ส่งเป็น "updatedAt"
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  currentStock: number;        // backend ส่งเป็น "currentStock"
  minStockQuantity: number;    // backend ส่งเป็น "minStockQuantity"
  price: number;
  categoryId: string | null;   // backend ส่งเป็น "categoryId"
  categoryName: string | null; // backend ส่งเป็น "categoryName"
  image: string | null;        // backend ส่งเป็น "image"
  createdAt: string;           // backend ส่งเป็น "createdAt"
  updatedAt: string;           // backend ส่งเป็น "updatedAt"
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCategories: number;
  totalTransactions: number;
  todayTransactions: number;
  monthlyTransactions: number;
  totalValue: number;
}

interface DataContextType {
  // State
  categories: Category[];
  products: Product[];
  dashboardStats: DashboardStats;
  loading: boolean;
  error: string | null;
  
  // Categories CRUD
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Products CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Data Loading
  loadCategories: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Fallback Mock Data - ปรับให้ตรงกับ interface ใหม่
const fallbackCategories: Category[] = [
  {
    id: '1',
    name: 'อาหารสด',
    description: 'ผัก ผลไม้ เนื้อสัตว์ และอาหารสดอื่นๆ',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'ข้าวหอมมะลิ',
    description: 'ข้าวหอมมะลิคุณภาพดี',
    sku: 'RICE001',
    currentStock: 100,
    minStockQuantity: 10,
    price: 45.00,
    categoryId: '1',
    categoryName: 'อาหารสด',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const fallbackDashboardStats: DashboardStats = {
  totalProducts: 1,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  totalCategories: 1,
  totalTransactions: 0,
  todayTransactions: 0,
  monthlyTransactions: 0,
  totalValue: 45.00
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(fallbackDashboardStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    refreshAll();
  }, []);

  // Load Categories
  const loadCategories = async () => {
    try {
      setError(null);
      console.log('🔄 Loading categories from API...');
      console.log('🌐 API URL:', 'http://10.214.162.160:3000/api/categories');
      
      const data = await apiService.getCategories();
      console.log('📊 Categories API Response:', data);
      console.log('📊 Response type:', typeof data);
      console.log('📊 Is Array:', Array.isArray(data));
      console.log('📊 Length:', Array.isArray(data) ? data.length : 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Using real categories data from API');
        console.log('✅ Categories data:', data);
        setCategories(data);
      } else {
        console.warn('⚠️ API returned empty or invalid categories, using fallback');
        console.warn('⚠️ Fallback data:', fallbackCategories);
        setCategories(fallbackCategories);
      }
    } catch (error: any) {
      console.error('❌ Error loading categories:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      setError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
      console.log('🔄 Using fallback categories due to error');
      setCategories(fallbackCategories);
    }
  };

  // Load Products
  const loadProducts = async () => {
    try {
      setError(null);
      console.log('🔄 Loading products from API...');
      console.log('🌐 API URL:', 'http://10.214.162.160:3000/api/products');
      
      const data = await apiService.getProducts();
      console.log('📊 Products API Response:', data);
      console.log('📊 Response type:', typeof data);
      console.log('📊 Is Array:', Array.isArray(data));
      console.log('📊 Length:', Array.isArray(data) ? data.length : 'N/A');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Using real products data from API');
        console.log('✅ Products data:', data);
        setProducts(data);
      } else {
        console.warn('⚠️ API returned empty or invalid products, using fallback');
        console.warn('⚠️ Fallback data:', fallbackProducts);
        setProducts(fallbackProducts);
      }
    } catch (error: any) {
      console.error('❌ Error loading products:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      setError('ไม่สามารถโหลดข้อมูลสินค้าได้');
      console.log('🔄 Using fallback products due to error');
      setProducts(fallbackProducts);
    }
  };

  // Load Dashboard Stats
  const loadDashboardStats = async () => {
    try {
      setError(null);
      const data = await apiService.getDashboardStats();
      if (data && typeof data === 'object') {
        setDashboardStats(data);
      } else {
        console.warn('API returned invalid dashboard stats, using fallback');
        setDashboardStats(fallbackDashboardStats);
      }
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      setError('ไม่สามารถโหลดสถิติ Dashboard ได้');
      setDashboardStats(fallbackDashboardStats);
    }
  };

  // Refresh All Data
  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadProducts(),
        loadDashboardStats()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Categories CRUD
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newCategory = await apiService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      Alert.alert('สำเร็จ', 'เพิ่มหมวดหมู่สำเร็จ');
    } catch (error: any) {
      console.error('Error adding category:', error);
      setError('ไม่สามารถเพิ่มหมวดหมู่ได้');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มหมวดหมู่ได้');
      throw error;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    try {
      setError(null);
      const updatedCategory = await apiService.updateCategory(id, categoryData);
      setCategories(prev => prev.map(cat => 
        cat.id === id ? updatedCategory : cat
      ));
      Alert.alert('สำเร็จ', 'อัปเดตหมวดหมู่สำเร็จ');
    } catch (error: any) {
      console.error('Error updating category:', error);
      setError('ไม่สามารถอัปเดตหมวดหมู่ได้');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตหมวดหมู่ได้');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      Alert.alert('สำเร็จ', 'ลบหมวดหมู่สำเร็จ');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError('ไม่สามารถลบหมวดหมู่ได้');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบหมวดหมู่ได้');
      throw error;
    }
  };

  // Products CRUD
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newProduct = await apiService.createProduct(productData);
      setProducts(prev => [...prev, newProduct]);
      Alert.alert('สำเร็จ', 'เพิ่มสินค้าสำเร็จ');
    } catch (error: any) {
      console.error('Error adding product:', error);
      setError('ไม่สามารถเพิ่มสินค้าได้');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มสินค้าได้');
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setError(null);
      const updatedProduct = await apiService.updateProduct(id, productData);
      setProducts(prev => prev.map(prod => 
        prod.id === id ? updatedProduct : prod
      ));
      Alert.alert('สำเร็จ', 'อัปเดตสินค้าสำเร็จ');
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError('ไม่สามารถอัปเดตสินค้าได้');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสินค้าได้');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      await apiService.deleteProduct(id);
      setProducts(prev => prev.filter(prod => prod.id !== id));
      Alert.alert('สำเร็จ', 'ลบสินค้าสำเร็จ');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setError('ไม่สามารถลบสินค้าได้');
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถลบสินค้าได้');
      throw error;
    }
  };

  const value: DataContextType = {
    // State
    categories,
    products,
    dashboardStats,
    loading,
    error,
    
    // Categories CRUD
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Products CRUD
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Data Loading
    loadCategories,
    loadProducts,
    loadDashboardStats,
    refreshAll
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
