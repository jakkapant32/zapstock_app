import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { API_ENDPOINTS, BASE_URL } from '../constants/ApiConfig';

const API_BASE_URL = BASE_URL + '/api';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  imageUrl?: string; // เพิ่ม field ใหม่ตาม backend
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  register: (fullName: string, username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (profileData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  uploadProfileImage: (imageBase64: string) => Promise<{ success: boolean; url?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const getStoredToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await getStoredToken();
      if (!token) {
        console.log('❌ No token found, setting loading to false');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Checking auth status with token...');
      
      // ตั้งค่า timeout สำหรับ API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000); // 5 วินาที
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('📡 API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📡 API response result:', result);
        
        if (result.success && result.user) {
          // เก็บข้อมูลรูปภาพเดิมไว้ถ้ามี
          const currentUser = user;
          const existingProfileImage = currentUser?.profileImage;
          
          // Debug: ดูข้อมูลทั้งหมดที่ได้จาก API
          console.log('🔍 Full API response user object:');
          console.log('  - result.user:', result.user);
          console.log('  - result.user keys:', Object.keys(result.user));
          console.log('  - result.user values:', Object.values(result.user));
          
          const userData: User = {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email || '',
            fullName: result.user.fullName || '',
            role: result.user.role,
            phone: result.user.phone || undefined,
            address: result.user.address || undefined,
            profileImage: result.user.image_url || result.user.imageUrl || existingProfileImage || undefined,
            imageUrl: result.user.image_url || result.user.imageUrl || existingProfileImage || undefined,
          };
          
          console.log('📱 User data from API:');
          console.log('  - phone:', result.user.phone);
          console.log('  - address:', result.user.address);
          console.log('  - phone type:', typeof result.user.phone);
          console.log('  - address type:', typeof result.user.address);
          console.log('  - phone length:', result.user.phone?.length || 0);
          console.log('  - address length:', result.user.address?.length || 0);
          console.log('  - phone truthy:', !!result.user.phone);
          console.log('  - address truthy:', !!result.user.address);
          console.log('  - imageUrl:', result.user.image_url || result.user.imageUrl);
          console.log('  - imageUrl type:', typeof (result.user.image_url || result.user.imageUrl));
          
          console.log('🖼️ Profile image handling:');
          console.log('  - From API:', result.user.image_url || result.user.imageUrl);
          console.log('  - Existing:', existingProfileImage);
          console.log('  - Final:', userData.profileImage);
          
          // อัปเดตข้อมูลใน AsyncStorage ด้วย
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
          setUser(userData);
          console.log('✅ User data updated from API:', userData);
        } else {
          console.log('⚠️ API response not successful, keeping existing user data');
          // ไม่ลบข้อมูลออกง่ายๆ ถ้า API ไม่สำเร็จ
        }
      } else {
        console.log('⚠️ API response not ok, keeping existing user data');
        // ไม่ลบข้อมูลออกง่ายๆ ถ้า API ไม่สำเร็จ
      }
    } catch (error) {
      console.error('❌ Failed to check auth status:', error);
      
      if (error.name === 'AbortError') {
        console.log('⏰ API call timeout, setting loading to false');
      } else {
        console.log('⚠️ Error occurred, but keeping existing user data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = await getStoredToken();
      if (token) {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
      }
      
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // แม้จะเกิดข้อผิดพลาดก็ลบข้อมูลในเครื่อง
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    }
  };

  const register = async (fullName: string, username: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email, password }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        return { success: true };
      } else {
        return { success: false, message: result.message || 'สมัครสมาชิกไม่สำเร็จ' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' };
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const token = await getStoredToken();
      if (!token) {
        console.log('❌ No auth token found');
        return { success: false, message: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      if (!user) {
        console.log('❌ No user data found');
        return { success: false, message: 'ไม่พบข้อมูลผู้ใช้' };
      }

      console.log('📝 Updating profile for user ID:', user.id);
      console.log('📝 Profile data to send:', profileData);
      console.log('🔗 API endpoint:', `${API_BASE_URL}/profile/${user.id}`);

      // แปลง field names ให้ตรงกับที่ backend ต้องการ
      const backendProfileData = {
        fullname: profileData.fullName,        // backend ต้องการ 'fullname'
        email: profileData.email,              // backend ต้องการ 'email'
        phone: profileData.phone,              // backend ต้องการ 'phone'
        address: profileData.address,          // backend ต้องการ 'address'
        imageUrl: profileData.imageUrl,        // backend ต้องการ 'imageUrl'
      };

      console.log('🔄 Converted data for backend:', backendProfileData);
      console.log('🔗 Full API URL:', `${API_BASE_URL}/profile/${user.id}`);
      console.log('🔑 Auth token:', token.substring(0, 20) + '...');
      
      // ตรวจสอบข้อมูลที่ส่งไป backend
      console.log('🔍 Backend data validation:');
      console.log('  - fullname:', backendProfileData.fullname, '| type:', typeof backendProfileData.fullname, '| length:', backendProfileData.fullname?.length || 0);
      console.log('  - email:', backendProfileData.email, '| type:', typeof backendProfileData.email, '| length:', backendProfileData.email?.length || 0);
      console.log('  - phone:', backendProfileData.phone, '| type:', typeof backendProfileData.phone, '| length:', backendProfileData.phone?.length || 0);
      console.log('  - address:', backendProfileData.address, '| type:', typeof backendProfileData.address, '| length:', backendProfileData.address?.length || 0);
      console.log('  - imageUrl:', backendProfileData.imageUrl, '| type:', typeof backendProfileData.imageUrl, '| length:', backendProfileData.imageUrl?.length || 0);
      
      // ตรวจสอบว่าข้อมูล undefined หรือไม่
      const undefinedFields = Object.entries(backendProfileData)
        .filter(([key, value]) => value === undefined)
        .map(([key]) => key);
      
      if (undefinedFields.length > 0) {
        console.log('⚠️ Fields with undefined values:', undefinedFields);
      } else {
        console.log('✅ All fields have values');
      }

      // ส่งข้อมูลไปยัง backend
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROFILE.UPDATE}/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendProfileData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response statusText:', response.statusText);

      const result = await response.json();
      console.log('📡 Response body:', result);
      console.log('📡 Response success:', result.success);
      console.log('📡 Response message:', result.message);
      
      // ตรวจสอบ response ที่ละเอียดขึ้น
      if (result.user) {
        console.log('👤 Updated user data from backend:', result.user);
        console.log('🔍 Backend returned fields:');
        Object.entries(result.user).forEach(([key, value]) => {
          console.log(`  - ${key}:`, value, '| type:', typeof value);
        });
      }
      
              if (response.ok && result.success) {
          console.log('✅ Profile updated successfully');
          
          // อัปเดตข้อมูลใน local state รวมถึงรูปภาพ
          const updatedUser = { 
            ...user, 
            ...profileData,
            profileImage: profileData.imageUrl || user.profileImage // อัปเดตรูปภาพ
          };
          setUser(updatedUser);
          
          // อัปเดตข้อมูลใน AsyncStorage
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          
          console.log('👤 Updated user data:', updatedUser);
          return { success: true, message: 'อัปเดตโปรไฟล์สำเร็จ' };
        } else {
        console.log('❌ Profile update failed:', result.message);
        console.log('❌ Full error response:', result);
        return { 
          success: false, 
          message: result.message || 'อัปเดตโปรไฟล์ไม่สำเร็จ' 
        };
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      return { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' 
      };
    }
  };

  const uploadProfileImage = async (imageBase64: string) => {
    try {
      const token = await getStoredToken();
      if (!token) {
        return { success: false, message: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      console.log('📤 Uploading profile image...');
      console.log('🖼️ Image data length:', imageBase64.length);
      console.log('🖼️ Image data type:', typeof imageBase64);
      console.log('🖼️ Image data preview:', imageBase64.substring(0, 50) + '...');

      const requestBody = { 
        imageBase64: imageBase64,  // ใช้ imageBase64 ตามที่ backend ต้องการ
        type: 'profile'  // ระบุประเภทรูปภาพ
      };

      console.log('📤 Request body:', requestBody);

      // อัปโหลดรูปภาพไปยัง backend
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('📡 Response status:', response.status);
      console.log('📡 Response result:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Image uploaded successfully:', result.url);
        return { 
          success: true, 
          url: result.url,
          message: 'อัปโหลดรูปภาพสำเร็จ' 
        };
      } else {
        console.log('❌ Image upload failed:', result.message);
        console.log('❌ Response status:', response.status);
        console.log('❌ Full response:', result);
        return { 
          success: false, 
          message: result.message || 'อัปโหลดรูปภาพไม่สำเร็จ' 
        };
      }
    } catch (error) {
      console.error('❌ Image upload error:', error);
      return { 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' 
      };
    }
  };

  useEffect(() => {
    // โหลดข้อมูลจาก AsyncStorage ก่อน
    const loadStoredUserData = async () => {
      try {
        console.log('🔍 Loading stored user data...');
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          console.log('👤 Loaded user data from storage:', userData);
          console.log('🖼️ Profile image from storage:', userData.profileImage);
          
          // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
          if (userData.id && userData.username && userData.email) {
            setUser(userData);
            console.log('✅ User data loaded from storage successfully');
            setIsLoading(false); // ตั้งค่า loading เป็น false
            return;
          } else {
            console.log('⚠️ Stored data incomplete, calling API...');
          }
        }
        // ถ้าไม่มีข้อมูลใน storage หรือข้อมูลไม่ครบ จึงเรียก API
        console.log('📡 No stored data or incomplete, calling API...');
        checkAuthStatus();
      } catch (error) {
        console.error('Error loading stored user data:', error);
        // ถ้าเกิด error ให้เรียก API
        checkAuthStatus();
      }
    };

    // ตั้งค่า timeout เพื่อป้องกันการค้าง
    const timeoutId = setTimeout(() => {
      console.log('⏰ Auth loading timeout, setting loading to false');
      setIsLoading(false);
    }, 10000); // 10 วินาที

    loadStoredUserData();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
    register,
    updateProfile,
    uploadProfileImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 