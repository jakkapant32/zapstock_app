// Network Configuration for ZapStock App
// This file manages the base URL for API calls

export const NetworkConfig = {
  // Development URLs
  development: {
    localhost: 'http://localhost:3000',
    emulator: 'http://10.0.2.2:3000',
    lan: 'http://10.214.162.160:3000', // IP หลักที่ใช้สำหรับโทรศัพท์
    hotspot: 'http://192.168.137.1:3000',
    bluetooth: 'http://169.254.41.48:3000'
  },
  
  // Production URL (when deployed)
  production: 'https://your-production-domain.com',
  
  // Current environment
  environment: __DEV__ ? 'development' : 'production'
};

// Function to get the appropriate base URL
export const getBaseUrl = (): string => {
  if (__DEV__) {
    // ใช้ IP หลักสำหรับการเชื่อมต่อจากโทรศัพท์
    return NetworkConfig.development.lan; // Using your LAN IP: 10.214.162.160:3000
  }
  
  return NetworkConfig.production;
};

// Function to get all available URLs for testing
export const getAllUrls = (): string[] => {
  if (__DEV__) {
    return Object.values(NetworkConfig.development);
  }
  
  return [NetworkConfig.production];
};

// Function to test connectivity
export const testConnection = async (url: string): Promise<boolean> => {
  try {
    console.log(`🔍 ทดสอบการเชื่อมต่อ: ${url}`);
    const response = await fetch(`${url}/api/products`);
    
    if (response.ok) {
      console.log(`✅ เชื่อมต่อสำเร็จ: ${url}`);
      return true;
    } else {
      console.log(`❌ เชื่อมต่อไม่สำเร็จ: ${url} - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Connection failed for ${url}:`, error);
    return false;
  }
};

// Function to find working URL
export const findWorkingUrl = async (): Promise<string | null> => {
  if (__DEV__) {
    const urls = getAllUrls();
    
    for (const url of urls) {
      console.log(`🔍 Testing connection to: ${url}`);
      if (await testConnection(url)) {
        console.log(`✅ Working URL found: ${url}`);
        return url;
      }
    }
    
    console.log('❌ No working URL found');
    return null;
  }
  
  return NetworkConfig.production;
};

// ฟังก์ชันสำหรับทดสอบการเชื่อมต่อหลัก
export const testMainConnection = async (): Promise<boolean> => {
  const mainUrl = getBaseUrl();
  console.log(`🚀 ทดสอบการเชื่อมต่อหลัก: ${mainUrl}`);
  return await testConnection(mainUrl);
};

export default NetworkConfig;


