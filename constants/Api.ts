import { Platform } from 'react-native';

// API Configuration - ใช้ IP address เดียวกันสำหรับทุก platform
const BASE_URL = __DEV__ 
  ? 'http://10.214.162.160:3000'  // ใช้ IP นี้สำหรับทุก platform ใน development
  : 'https://your-production-api.com'; // Production

// API Endpoints
const API_ENDPOINTS = {
  // Health & Test
  HEALTH: '/api/health',
  TEST: '/api/test',
  
  // Categories
  CATEGORIES: '/api/categories',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_STATS: '/api/product-stats',
  
  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
  TOP_PRODUCTS: '/api/dashboard/top-products',
  
  // Profile
  PROFILE_STATS: '/api/profile/stats',
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  
  // Users
  USERS: '/api/users',
  
  // Fresh Products
  FRESH_PRODUCTS: '/api/fresh-products',
  EXPIRING_PRODUCTS: '/api/expiring-products',
};

// API Service
export const apiService = {
  // Generic request method
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      console.log(`🌐 Full URL: ${url}`);
      console.log(`🌐 BASE_URL: ${BASE_URL}`);
      console.log(`🌐 Platform: ${Platform.OS}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
      console.log(`📡 Response Headers:`, response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      console.error(`❌ Error URL: ${url}`);
      console.error(`❌ Error Type: ${error.constructor.name}`);
      if (error instanceof TypeError) {
        console.error(`❌ Network Error - Check if backend is running on ${BASE_URL}`);
      }
      throw error;
    }
  },

  // Health Check
  async healthCheck() {
    return this.request(API_ENDPOINTS.HEALTH);
  },

  // Test Connection
  async testConnection() {
    return this.request(API_ENDPOINTS.TEST);
  },

  // Categories
  async getCategories() {
    return this.request(API_ENDPOINTS.CATEGORIES);
  },

  async createCategory(categoryData: any) {
    return this.request(API_ENDPOINTS.CATEGORIES, {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  async updateCategory(id: string, categoryData: any) {
    return this.request(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },

  async deleteCategory(id: string) {
    return this.request(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: 'DELETE',
    });
  },

  // Products
  async getProducts() {
    return this.request(API_ENDPOINTS.PRODUCTS);
  },

  async getProduct(id: string) {
    return this.request(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  },

  async createProduct(productData: any) {
    return this.request(API_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, productData: any) {
    return this.request(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  async deleteProduct(id: string) {
    return this.request(`${API_ENDPOINTS.PRODUCTS}/${id}`, {
      method: 'DELETE',
    });
  },

  async getProductStats() {
    return this.request(API_ENDPOINTS.PRODUCT_STATS);
  },

  // Dashboard
  async getDashboardStats() {
    return this.request(API_ENDPOINTS.DASHBOARD_STATS);
  },

  async getTopProducts() {
    return this.request(API_ENDPOINTS.TOP_PRODUCTS);
  },

  // Profile
  async getProfileStats() {
    return this.request(API_ENDPOINTS.PROFILE_STATS);
  },

  async updateProfile(profileData: any) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Transactions
  async getTransactions() {
    return this.request(API_ENDPOINTS.TRANSACTIONS);
  },

  // Fresh Products
  async getFreshProducts() {
    return this.request(API_ENDPOINTS.FRESH_PRODUCTS);
  },

  async getExpiringProducts() {
    return this.request(API_ENDPOINTS.EXPIRING_PRODUCTS);
  },

  // Image Upload
  async uploadImageFromDataUrl(dataUrl: string) {
    return this.request('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image: dataUrl }),
    });
  },
};

export { API_ENDPOINTS, BASE_URL };

