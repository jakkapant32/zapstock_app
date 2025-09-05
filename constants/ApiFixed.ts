// constants/ApiFixed.ts
// Fixed API configuration for testing
export const BASE_URL = 'http://10.214.162.160:3000';

console.log('🔧 Using fixed BASE_URL:', BASE_URL);

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อ
export const testConnection = async () => {
  try {
    console.log('🧪 Testing connection to:', BASE_URL);
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

// ฟังก์ชันสำหรับเปลี่ยน URL ตามต้องการ
export const setCustomBaseURL = (url: string) => {
  console.log('🔄 Setting custom URL:', url);
  // ในอนาคตสามารถเพิ่ม logic สำหรับเปลี่ยน URL ได้
};
