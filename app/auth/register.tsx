import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const API_URL = 'http://10.214.162.160:3000/api/auth/register';

interface RegisterErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const unstable_settings = { initialRouteName: 'index', headerShown: false };

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
    }
  };

  const validate = () => {
    const newErrors: RegisterErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!username.trim()) newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    if (!email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    if (!password.trim()) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
    if (password && password.length < 6) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (password && confirmPassword && password !== confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('สำเร็จ', 'สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setFullName('');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('ผิดพลาด', data.message || 'เกิดข้อผิดพลาด');
      }
    } catch {
      Alert.alert('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
      
      {/* Background */}
      <View style={styles.background}>
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.mainContainer}>
              <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/images/Screenshot 2025-09-03 155904.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.brandTitle}>ZapStock</Text>
              </View>
              
              <View style={styles.formContainer}>
                <View style={styles.formBox}>
                  <Text style={styles.formTitle}>สมัครสมาชิก</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ชื่อ-นามสกุล"
                      value={fullName}
                      onChangeText={setFullName}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {errors.fullName && <Text style={styles.error}>{errors.fullName}</Text>}
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-circle" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ชื่อผู้ใช้"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {errors.username && <Text style={styles.error}>{errors.username}</Text>}
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="อีเมล"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {errors.email && <Text style={styles.error}>{errors.email}</Text>}
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {errors.password && <Text style={styles.error}>{errors.password}</Text>}
                  
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#6B7280" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ยืนยันรหัสผ่าน"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
                  
                  <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.registerButtonText}>สมัครสมาชิก</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/auth/Login')}>
                  <Text style={styles.linkButtonText}>มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1E3A8A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  background: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: -20,
  },
  formBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E3A8A',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#374151',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 16,
  },
  registerButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default Register;