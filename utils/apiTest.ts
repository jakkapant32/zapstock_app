// utils/apiTest.ts
// ไฟล์สำหรับทดสอบการเชื่อมต่อ API

import { API_ENDPOINTS, BASE_URL } from '../constants/ApiConfig';

export interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
  error?: string;
}

export const testApiConnection = async (): Promise<ApiTestResult[]> => {
  const results: ApiTestResult[] = [];
  
  console.log('🔍 เริ่มทดสอบการเชื่อมต่อ API...');
  console.log('🌐 Base URL:', BASE_URL);

  // ทดสอบ Health Check
  try {
    console.log('📡 ทดสอบ Health Check...');
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    results.push({
      endpoint: 'Health Check',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? 'Health Check สำเร็จ' : `Health Check ล้มเหลว: ${response.status}`,
      data: response.ok ? data : null,
      error: response.ok ? undefined : data.message || 'Unknown error'
    });
  } catch (error) {
    results.push({
      endpoint: 'Health Check',
      status: 'error',
      message: 'ไม่สามารถเชื่อมต่อ Health Check ได้',
      error: error.message
    });
  }

  // ทดสอบ Database Health
  try {
    console.log('📡 ทดสอบ Database Health...');
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.DB_HEALTH}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    results.push({
      endpoint: 'Database Health',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? 'Database Health สำเร็จ' : `Database Health ล้มเหลว: ${response.status}`,
      data: response.ok ? data : null,
      error: response.ok ? undefined : data.message || 'Unknown error'
    });
  } catch (error) {
    results.push({
      endpoint: 'Database Health',
      status: 'error',
      message: 'ไม่สามารถเชื่อมต่อ Database Health ได้',
      error: error.message
    });
  }

  // ทดสอบ Products API
  try {
    console.log('📡 ทดสอบ Products API...');
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.PRODUCTS}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    results.push({
      endpoint: 'Products API',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? `Products API สำเร็จ (${Array.isArray(data) ? data.length : 0} รายการ)` : `Products API ล้มเหลว: ${response.status}`,
      data: response.ok ? data : null,
      error: response.ok ? undefined : data.message || 'Unknown error'
    });
  } catch (error) {
    results.push({
      endpoint: 'Products API',
      status: 'error',
      message: 'ไม่สามารถเชื่อมต่อ Products API ได้',
      error: error.message
    });
  }

  // ทดสอบ Categories API
  try {
    console.log('📡 ทดสอบ Categories API...');
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    results.push({
      endpoint: 'Categories API',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? `Categories API สำเร็จ (${Array.isArray(data) ? data.length : 0} รายการ)` : `Categories API ล้มเหลว: ${response.status}`,
      data: response.ok ? data : null,
      error: response.ok ? undefined : data.message || 'Unknown error'
    });
  } catch (error) {
    results.push({
      endpoint: 'Categories API',
      status: 'error',
      message: 'ไม่สามารถเชื่อมต่อ Categories API ได้',
      error: error.message
    });
  }

  // สรุปผลการทดสอบ
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log('📊 สรุปผลการทดสอบ:');
  console.log(`✅ สำเร็จ: ${successCount}`);
  console.log(`❌ ล้มเหลว: ${errorCount}`);
  console.log(`📋 ทั้งหมด: ${results.length}`);

  return results;
};

export const testAuthEndpoints = async (): Promise<ApiTestResult[]> => {
  const results: ApiTestResult[] = [];
  
  console.log('🔐 เริ่มทดสอบ Auth Endpoints...');

  // ทดสอบ Login (ด้วยข้อมูลทดสอบ)
  try {
    console.log('📡 ทดสอบ Login API...');
    const response = await fetch(`${BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test123'
      }),
    });
    
    const data = await response.json();
    
    results.push({
      endpoint: 'Login API',
      status: response.ok ? 'success' : 'error',
      message: response.ok ? 'Login API สำเร็จ' : `Login API ล้มเหลว: ${response.status}`,
      data: response.ok ? { hasToken: !!data.token, hasUser: !!data.user } : null,
      error: response.ok ? undefined : data.message || 'Unknown error'
    });
  } catch (error) {
    results.push({
      endpoint: 'Login API',
      status: 'error',
      message: 'ไม่สามารถเชื่อมต่อ Login API ได้',
      error: error.message
    });
  }

  return results;
};

export const runAllTests = async (): Promise<{
  apiTests: ApiTestResult[];
  authTests: ApiTestResult[];
  summary: {
    total: number;
    success: number;
    error: number;
    successRate: number;
  };
}> => {
  console.log('🚀 เริ่มทดสอบ API ทั้งหมด...');
  
  const apiTests = await testApiConnection();
  const authTests = await testAuthEndpoints();
  
  const allTests = [...apiTests, ...authTests];
  const successCount = allTests.filter(t => t.status === 'success').length;
  const errorCount = allTests.filter(t => t.status === 'error').length;
  const successRate = allTests.length > 0 ? (successCount / allTests.length) * 100 : 0;
  
  const summary = {
    total: allTests.length,
    success: successCount,
    error: errorCount,
    successRate: Math.round(successRate * 100) / 100
  };
  
  console.log('📊 สรุปผลการทดสอบทั้งหมด:');
  console.log(`📋 ทั้งหมด: ${summary.total}`);
  console.log(`✅ สำเร็จ: ${summary.success}`);
  console.log(`❌ ล้มเหลว: ${summary.error}`);
  console.log(`📈 อัตราความสำเร็จ: ${summary.successRate}%`);
  
  return {
    apiTests,
    authTests,
    summary
  };
};



