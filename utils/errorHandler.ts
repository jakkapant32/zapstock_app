// utils/errorHandler.ts
import { Alert } from 'react-native';

export const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  
  if (error.message.includes('หมดเวลา')) {
    return 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่';
  }
  
  if (error.message.includes('404')) {
    return 'ไม่พบข้อมูลที่ต้องการ';
  }
  
  if (error.message.includes('401')) {
    return 'กรุณาเข้าสู่ระบบใหม่';
  }
  
  if (error.message.includes('403')) {
    return 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
  }
  
  if (error.message.includes('500')) {
    return 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่';
  }
  
  if (error.message.includes('Network request failed')) {
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
  }
  
  if (error.message.includes('Failed to fetch')) {
    return 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
  }
  
  return error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
};

export const showErrorAlert = (error: any, title: string = 'เกิดข้อผิดพลาด') => {
  const message = handleApiError(error);
  Alert.alert(title, message, [{ text: 'ตกลง' }]);
};

export const showSuccessAlert = (message: string, title: string = 'สำเร็จ') => {
  Alert.alert(title, message, [{ text: 'ตกลง' }]);
};

export const showConfirmAlert = (
  message: string,
  onConfirm: () => void,
  title: string = 'ยืนยัน'
) => {
  Alert.alert(
    title,
    message,
    [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ยืนยัน', onPress: onConfirm }
    ]
  );
};
