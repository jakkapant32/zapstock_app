// Mock Data Service for development and testing
export const mockService = {
  // Mock authentication
  auth: {
    login: async (email: string, password: string) => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            token: 'mock-token-123',
            user: {
              id: 1,
              email: email,
              name: 'Mock User',
            },
          });
        }, 1000);
      });
    },
    
    register: async (userData: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            token: 'mock-token-456',
            user: userData,
          });
        }, 1000);
      });
    },
  },

  // Mock products
  products: {
    getAll: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: [
              {
                id: 1,
                name: 'Mock Product 1',
                price: 100,
                stock: 50,
                category: 'Electronics',
              },
              {
                id: 2,
                name: 'Mock Product 2',
                price: 200,
                stock: 30,
                category: 'Clothing',
              },
            ],
          });
        }, 500);
      });
    },
  },

  // Mock categories
  categories: {
    getAll: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: [
              { id: 1, name: 'Electronics' },
              { id: 2, name: 'Clothing' },
              { id: 3, name: 'Books' },
            ],
          });
        }, 300);
      });
    },
  },

  // Mock dashboard stats
  dashboard: {
    getStats: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              totalProducts: 150,
              totalCategories: 10,
              lowStockProducts: 5,
              totalValue: 50000,
            },
          });
        }, 400);
      });
    },
  },
};

export default mockService;
