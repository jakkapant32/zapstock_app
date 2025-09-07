// services/ApiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../constants/ApiConfig';

class ApiService {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseURL = BASE_URL;
    this.timeout = 30000; // 30 seconds
    this.retryAttempts = 3;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          await this.clearToken();
          throw new Error('กรุณาเข้าสู่ระบบใหม่');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('การเชื่อมต่อหมดเวลา กรุณาลองใหม่');
      }
      throw error;
    }
  }

  private async requestWithRetry(endpoint: string, options: RequestInit = {}): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.request(endpoint, options);
      } catch (error: any) {
        lastError = error;
        console.log(`🔄 ลองครั้งที่ ${attempt}/${this.retryAttempts}:`, error.message);
        
        if (attempt < this.retryAttempts) {
          // รอ 1 วินาทีก่อนลองใหม่
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError!;
  }

  // Token management
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  private async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Auth methods
  async login(username: string, password: string): Promise<any> {
    const response = await this.requestWithRetry('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.token) {
      await this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData: any): Promise<any> {
    return this.requestWithRetry('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return this.requestWithRetry('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  // Products methods
  async getProducts(): Promise<any> {
    return this.requestWithRetry('/api/products');
  }

  async createProduct(productData: any): Promise<any> {
    return this.requestWithRetry('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(id: string, productData: any): Promise<any> {
    return this.requestWithRetry(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }

  async deleteProduct(id: string): Promise<any> {
    return this.requestWithRetry(`/api/products/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories methods
  async getCategories(): Promise<any> {
    return this.requestWithRetry('/api/categories');
  }

  async createCategory(categoryData: any): Promise<any> {
    return this.requestWithRetry('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id: string, categoryData: any): Promise<any> {
    return this.requestWithRetry(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id: string): Promise<any> {
    return this.requestWithRetry(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Dashboard methods
  async getDashboardStats(): Promise<any> {
    return this.requestWithRetry('/api/dashboard/stats');
  }

  async getTopProducts(): Promise<any> {
    return this.requestWithRetry('/api/dashboard/top-products');
  }

  // Transactions methods
  async getTransactions(): Promise<any> {
    return this.requestWithRetry('/api/transactions');
  }

  async createTransaction(transactionData: any): Promise<any> {
    return this.requestWithRetry('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/api/health');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();
