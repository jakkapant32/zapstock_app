// constants/MockDataService.ts
// Mock Data Service - ไม่ต้องใช้ server

// Mock Categories
export const mockCategories = [
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

// Mock Products
export const mockProducts = [
  {
    id: '1',
    name: 'ข้าวหอมมะลิ',
    description: 'ข้าวหอมมะลิคุณภาพดี',
    sku: 'RICE001',
    price: 45.00,
    currentStock: 100,
    minStockQuantity: 10,
    categoryId: '2',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
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
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock Dashboard Stats
export const mockDashboardStats = {
  totalProducts: 150,
  lowStockProducts: 8,
  outOfStockProducts: 3,
  totalCategories: 3,
  totalTransactions: 89,
  todayTransactions: 12,
  monthlyTransactions: 67,
  totalValue: 45600.50
};

// Mock Service Functions
export const mockService = {
  // Categories
  getCategories: () => Promise.resolve(mockCategories),
  getCategory: (id: string) => Promise.resolve(mockCategories.find(cat => cat.id === id)),
  
  // Products
  getProducts: () => Promise.resolve(mockProducts),
  getProduct: (id: string) => Promise.resolve(mockProducts.find(prod => prod.id === id)),
  
  // Dashboard
  getDashboardStats: () => Promise.resolve(mockDashboardStats),
  getTopProducts: () => Promise.resolve(mockProducts.slice(0, 5)),
  
  // Profile
  getProfileStats: () => Promise.resolve({
    total_products: 150,
    total_transactions: 89,
    total_users: 12,
    total_revenue: 45600.50
  })
};

console.log('📱 Mock Data Service loaded successfully');
console.log('Categories:', mockCategories.length);
console.log('Products:', mockProducts.length);
