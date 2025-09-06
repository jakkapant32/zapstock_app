// constants/ApiLocal.ts
// Local API configuration - ใช้ localhost สำหรับ development

// ใช้ IP ที่ถูกต้องสำหรับโทรศัพท์จริงผ่าน Expo
export const BASE_URL = 'http://192.168.137.1:3000';

console.log('🏠 Using localhost BASE_URL:', BASE_URL);

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
