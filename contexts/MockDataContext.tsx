import React, { createContext, ReactNode, useContext, useState } from 'react';

// Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  status: string;
  sku: string;
  description?: string;
  minStockQuantity?: number;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
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

interface MockDataContextType {
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Dashboard
  dashboardStats: DashboardStats;
  updateDashboardStats: () => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

// Initial Mock Data
const initialCategories: Category[] = [
  {
    id: '1',
    name: 'อาหารสด',
    description: 'ผัก ผลไม้ เนื้อสัตว์ และอาหารสดอื่นๆ',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'อาหารแห้ง',
    description: 'ข้าว เกลือ น้ำตาล และอาหารแห้งอื่นๆ',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'เครื่องดื่ม',
    description: 'น้ำเปล่า น้ำผลไม้ ชา กาแฟ และเครื่องดื่มอื่นๆ',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'ข้าวหอมมะลิ',
    description: 'ข้าวหอมมะลิคุณภาพดี',
    sku: 'RICE001',
    price: 45.00,
    currentStock: 100,
    minStockQuantity: 10,
    categoryId: '2',
    category: 'อาหารแห้ง',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'น้ำส้มคั้น',
    description: 'น้ำส้มคั้นสด 100%',
    sku: 'JUICE001',
    price: 25.00,
    currentStock: 50,
    minStockQuantity: 5,
    categoryId: '3',
    category: 'เครื่องดื่ม',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const initialDashboardStats: DashboardStats = {
  totalProducts: 150,
  lowStockProducts: 8,
  outOfStockProducts: 3,
  totalCategories: 3,
  totalTransactions: 89,
  todayTransactions: 12,
  monthlyTransactions: 67,
  totalValue: 45600.50
};

export const MockDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialDashboardStats);

  // Categories CRUD
  const addCategory = (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id 
        ? { ...cat, ...categoryData, updated_at: new Date().toISOString() }
        : cat
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Products CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(prod => 
      prod.id === id 
        ? { ...prod, ...productData, updatedAt: new Date().toISOString() }
        : prod
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
  };

  // Update Dashboard Stats
  const updateDashboardStats = () => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= (p.minStockQuantity || 5)).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalCategories = categories.length;
    
    setDashboardStats({
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalCategories,
      totalTransactions: 89,
      todayTransactions: 12,
      monthlyTransactions: 67,
      totalValue: 45600.50
    });
  };

  const value: MockDataContextType = {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    dashboardStats,
    updateDashboardStats
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
};
