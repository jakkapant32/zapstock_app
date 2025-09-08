 


// constants/ApiConfig.ts
// Configuration หลักสำหรับ API ที่ตรงกับ Backend

// ตรวจสอบ platform และ environment
import { Platform } from 'react-native';

// ===== IP ADDRESSES ที่รองรับ =====
export const API_URLS = {
  // IP หลักที่ใช้สำหรับโทรศัพท์ (ต้องอยู่ใน Wi-Fi เดียวกัน)
  MAIN: 'https://zapstock-backend.onrender.com',
  
  // IP สำรอง (กรณี IP หลักไม่ทำงาน)
  BACKUP: {
    LOCALHOST: 'http://localhost:3000',
    EMULATOR: 'http://10.0.2.2:3000',
    HOTSPOT: 'http://192.168.137.1:3000',
    BLUETOOTH: 'http://169.254.41.48:3000'
  }
};

// ===== BASE_URL หลัก =====
export const BASE_URL = API_URLS.MAIN;

// ===== API ENDPOINTS ที่ตรงกับ Backend =====
export const API_ENDPOINTS = {
  // Health & Test
  HEALTH: '/api/health',
  DB_HEALTH: '/api/db-health',
  
  // Auth (ตรงกับ backend)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
    CHANGE_PASSWORD: '/api/auth/change-password',
    PROFILE_STATS: '/api/auth/profile/stats',
    PROFILE: '/api/auth/profile'
  },
  
  // Categories (ตรงกับ backend)
  CATEGORIES: '/api/categories',
  
  // Products (ตรงกับ backend)
  PRODUCTS: '/api/products',
  
  // Dashboard (ตรงกับ backend)
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
    OVERVIEW: '/api/dashboard/overview',
    RECENT_TRANSACTIONS: '/api/dashboard/recent-transactions',
    LOW_STOCK: '/api/dashboard/low-stock',
    TOP_PRODUCTS: '/api/dashboard/top-products'
  },
  
  // Profile (ตรงกับ backend)
  PROFILE: {
    STATS: '/api/profile/stats',
    UPDATE: '/api/profile'
  },
  
  // Transactions (ตรงกับ backend)
  TRANSACTIONS: '/api/transactions',
  
  // Fresh Products (ตรงกับ backend)
  FRESH_PRODUCTS: '/api/fresh-products',
  
  // Suppliers (ตรงกับ backend)
  SUPPLIERS: '/api/suppliers',
  
  // Upload (ตรงกับ backend)
  UPLOAD: '/api/upload'
};

// ===== ฟังก์ชันสำหรับเปลี่ยน BASE_URL =====
export const setBaseURL = (newURL: string) => {
  console.log('🔄 เปลี่ยน BASE_URL เป็น:', newURL);
  // ในอนาคตสามารถเพิ่ม logic สำหรับเปลี่ยน URL ได้
};

// ===== ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ =====
export const testConnection = async (url: string = BASE_URL): Promise<boolean> => {
  try {
    console.log(`🔍 ทดสอบการเชื่อมต่อ Backend: ${url}`);
    const response = await fetch(`${url}/api/products`);
    
    if (response.ok) {
      console.log('✅ เชื่อมต่อ Backend สำเร็จ!');
      return true;
    } else {
      console.log('❌ Backend ตอบกลับด้วย status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ เชื่อมต่อ Backend ไม่ได้:', error.message);
    return false;
  }
};

// ===== ฟังก์ชันสำหรับทดสอบการเชื่อมต่อหลัก =====
export const testMainConnection = async (): Promise<boolean> => {
  return await testConnection(BASE_URL);
};

// ===== ฟังก์ชันสำหรับทดสอบการเชื่อมต่อทั้งหมด =====
export const testAllConnections = async (): Promise<{ url: string; working: boolean }[]> => {
  const results = [];
  
  // ทดสอบ IP หลัก
  const mainWorking = await testConnection(API_URLS.MAIN);
  results.push({ url: API_URLS.MAIN, working: mainWorking });
  
  // ทดสอบ IP สำรอง
  for (const [name, url] of Object.entries(API_URLS.BACKUP)) {
    const working = await testConnection(url);
    results.push({ url, working });
  }
  
  return results;
};

// ===== ฟังก์ชันสำหรับหา URL ที่ทำงานได้ =====
export const findWorkingUrl = async (): Promise<string | null> => {
  console.log('🔍 ค้นหา URL ที่ทำงานได้...');
  
  // ทดสอบ IP หลักก่อน
  if (await testConnection(API_URLS.MAIN)) {
    console.log('✅ IP หลักทำงานได้:', API_URLS.MAIN);
    return API_URLS.MAIN;
  }
  
  // ทดสอบ IP สำรอง
  for (const [name, url] of Object.entries(API_URLS.BACKUP)) {
    if (await testConnection(url)) {
      console.log(`✅ IP สำรองทำงานได้: ${name} - ${url}`);
      return url;
    }
  }
  
  console.log('❌ ไม่พบ URL ที่ทำงานได้');
  return null;
};

// ===== Log การตั้งค่า =====
console.log('🌐 ===== API Configuration =====');
console.log('📱 Platform:', Platform.OS);
console.log('🔧 Development mode:', __DEV__);
console.log('🚀 BASE_URL หลัก:', BASE_URL);
console.log('💡 ใช้ IP นี้เพื่อให้โทรศัพท์เชื่อมต่อได้:', BASE_URL);
console.log('📋 IP สำรอง:', Object.values(API_URLS.BACKUP));
console.log('================================');
