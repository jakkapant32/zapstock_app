import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export const unstable_settings = { initialRouteName: 'change-password', headerShown: false };

const ChangePassword = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // const handleBack = () => {
  //   router.back();
  // };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านปัจจุบัน');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านใหม่');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่ต้องไม่เหมือนกับรหัสผ่านปัจจุบัน');
      return;
    }

    try {
      setLoading(true);
      
      // ดึง token จาก AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบ token การเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่');
        return;
      }

      console.log('🔐 กำลังเปลี่ยนรหัสผ่าน...');
      console.log('👤 User ID:', user?.id);
      console.log('🔑 Token:', token.substring(0, 20) + '...');

      // เรียก API เพื่อเปลี่ยนรหัสผ่าน
      const response = await fetch('http://10.214.162.160:3000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim()
        })
      });

      console.log('📡 Response status:', response.status);
      const result = await response.json();
      console.log('📡 Response result:', result);

      if (response.ok && result.success) {
        Alert.alert(
          'สำเร็จ',
          'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
          [
            {
              text: 'ตกลง',
              onPress: () => {
                // Clear form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                router.back();
              },
            },
          ]
        );
      } else {
        // แสดงข้อความผิดพลาดจาก API
        const errorMessage = result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
        Alert.alert('ข้อผิดพลาด', errorMessage);
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      
      // ตรวจสอบประเภทของ error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      } else {
        Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (currentPassword || newPassword || confirmPassword) {
      Alert.alert(
        'ยกเลิกการเปลี่ยนรหัสผ่าน',
        'คุณต้องการยกเลิกการเปลี่ยนรหัสผ่านหรือไม่? การเปลี่ยนแปลงจะไม่ถูกบันทึก',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ตกลง', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const PasswordInput = ({ 
    value, 
    onChangeText, 
    placeholder, 
    showPassword, 
    onToggleShow, 
    label 
  }: {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    onToggleShow: () => void;
    label: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="next"
          autoCorrect={false}
          autoComplete="off"
          onFocus={() => {}}
          onBlur={() => {}}
          selectTextOnFocus={false}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={onToggleShow}>
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color="#8E8E93" 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เปลี่ยนรหัสผ่าน</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustKeyboardInsets={false}
        nestedScrollEnabled={false}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      >
        {/* Security Icon */}
        <View style={styles.iconSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color="#007AFF" />
          </View>
          <Text style={styles.iconTitle}>เปลี่ยนรหัสผ่าน</Text>
          <Text style={styles.iconSubtitle}>
            กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <PasswordInput
            label="รหัสผ่านปัจจุบัน"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="กรอกรหัสผ่านปัจจุบัน"
            showPassword={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword(!showCurrentPassword)}
          />

          <PasswordInput
            label="รหัสผ่านใหม่"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
            showPassword={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
          />

          <PasswordInput
            label="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </View>

        {/* Password Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.requirementsTitle}>ข้อกำหนดรหัสผ่าน</Text>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={newPassword.length >= 6 ? "#34C759" : "#8E8E93"} 
            />
            <Text style={[styles.requirementText, newPassword.length >= 6 && styles.requirementTextMet]}>
              มีความยาวอย่างน้อย 6 ตัวอักษร
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={newPassword !== currentPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={newPassword !== currentPassword && newPassword.length > 0 ? "#34C759" : "#8E8E93"} 
            />
            <Text style={[styles.requirementText, newPassword !== currentPassword && newPassword.length > 0 && styles.requirementTextMet]}>
              ไม่เหมือนกับรหัสผ่านปัจจุบัน
            </Text>
          </View>
          <View style={styles.requirementItem}>
            <Ionicons 
              name={newPassword === confirmPassword && newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
              size={16} 
              color={newPassword === confirmPassword && newPassword.length > 0 ? "#34C759" : "#8E8E93"} 
            />
            <Text style={[styles.requirementText, newPassword === confirmPassword && newPassword.length > 0 && styles.requirementTextMet]}>
              รหัสผ่านใหม่ตรงกับยืนยันรหัสผ่าน
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity 
            style={[styles.changeButton, loading && styles.changeButtonDisabled]} 
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                <Text style={styles.changeButtonText}>เปลี่ยนรหัสผ่าน</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>ยกเลิก</Text>
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>เคล็ดลับความปลอดภัย</Text>
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
            <Text style={styles.tipText}>ใช้รหัสผ่านที่ซับซ้อนและไม่ซ้ำกับบัญชีอื่น</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
            <Text style={styles.tipText}>เปลี่ยนรหัสผ่านเป็นประจำทุก 3-6 เดือน</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
            <Text style={styles.tipText}>ไม่แชร์รหัสผ่านกับผู้อื่น</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  iconSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  iconSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 12,
  },
  requirementsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  requirementTextMet: {
    color: '#34C759',
  },
  buttonSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  changeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changeButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
});

export default ChangePassword; 