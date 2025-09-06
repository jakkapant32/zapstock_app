// constants/ApiSimple.ts
// Simple API configuration
export const ANDROID_EMULATOR_URL = 'http://10.214.162.160:3000';
export const IOS_SIMULATOR_URL = 'http://localhost:3000';
export const PRODUCTION_URL = 'https://your-production-api.com';

// สำหรับ iOS Simulator หรือ Web
export const LOCAL_URL = 'http://localhost:3000';

// สำหรับมือถือจริง (ต้องเปลี่ยนเป็น IP ของเครื่อง PC)
export const REAL_DEVICE_URL = 'http://192.168.1.100:3000';

// เลือก URL ตาม platform
import { Platform } from 'react-native';

// สำหรับ development ใช้ 10.0.2.2 เสมอ (รองรับทั้ง Android และ iOS)
export const BASE_URL = __DEV__ 
  ? ANDROID_EMULATOR_URL 
  : (Platform.OS === 'android' ? ANDROID_EMULATOR_URL : LOCAL_URL);

console.log('Platform:', Platform.OS);
console.log('Base URL:', BASE_URL);

// ฟังก์ชันสำหรับเปลี่ยน URL ตามต้องการ
export const setCustomBaseURL = (url: string) => {
  console.log('Setting custom URL:', url);
  // ในอนาคตสามารถเพิ่ม logic สำหรับเปลี่ยน URL ได้
};

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ
export const testConnection = async () => {
  try {
    console.log('Testing connection to:', BASE_URL);
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Connection successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.log('Current BASE_URL:', BASE_URL);
    return false;
  }
};
