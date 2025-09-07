// constants/ApiConfig.ts
// Configuration หลักสำหรับ API ที่ยืดหยุ่น

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

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
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
