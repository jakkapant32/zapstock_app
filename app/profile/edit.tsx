import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_ENDPOINTS, BASE_URL } from '../../constants/ApiConfig';
import { useAuth } from '../../contexts/AuthContext';

export const unstable_settings = { initialRouteName: 'edit', headerShown: false };

const EditProfile = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    if (user) {
      // ใช้ข้อมูลจาก user object หรือ fallback เป็น username
      setFullName((user as any).fullName || (user as any).fullname || user.username || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setAddress((user as any).address || '');
      
      // โหลดข้อมูลโปรไฟล์จาก API
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user || !user.id) return;

    try {
      console.log('Loading profile data for user:', user.id);
      
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.PROFILE.UPDATE}/${user.id}`);
      const result = await response.json();
      
      console.log('Profile API Response:', result);
      
      if (result.success && result.data) {
        const profileData = result.data;
        setFullName(profileData.full_name || profileData.fullname || '');
        setEmail(profileData.email || '');
        setPhone(profileData.phone || '');
        setAddress(profileData.address || '');
        
        if (profileData.image_url) {
          setProfileImage(profileData.image_url);
        }
        
        console.log('Profile data loaded:', profileData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // const handleBack = () => {
  //   router.back();
  // };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ-นามสกุล');
      return;
    }

    if (!email.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมล');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลให้ถูกต้อง');
      return;
    }

    try {
      setLoading(true);
      
      if (!user || !user.id) {
        Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้');
        return;
      }

      const profileData = {
        fullname: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        imageUrl: profileImage || (user as any).imageUrl || '',
      };

      console.log('Sending profile data to API:', profileData);
      console.log('User ID:', user.id);

      // เรียก API อัปเดตโปรไฟล์
      const response = await fetch(`${BASE_URL}${API_ENDPOINTS.PROFILE.UPDATE}/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        Alert.alert(
          'สำเร็จ',
          'อัปเดตโปรไฟล์เรียบร้อยแล้ว',
          [
            {
              text: 'ตกลง',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('ข้อผิดพลาด', result.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'ยกเลิกการแก้ไข',
      'คุณต้องการยกเลิกการแก้ไขหรือไม่? การเปลี่ยนแปลงจะไม่ถูกบันทึก',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', onPress: () => router.back() },
      ]
    );
  };

  const handleChangePhoto = async () => {
    console.log('เริ่มต้น handleChangePhoto');
    try {
      // ขอสิทธิ์เข้าถึงแกลเลอรี่
      console.log('ขอสิทธิ์เข้าถึงแกลเลอรี่...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('สถานะสิทธิ์:', status);
      
      if (status !== 'granted') {
        Alert.alert('ข้อผิดพลาด', 'กรุณาอนุญาตให้เข้าถึงแกลเลอรี่');
        return;
      }

      // เปิดแกลเลอรี่
      console.log('เปิดแกลเลอรี่...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('ผลลัพธ์ ImagePicker:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
        console.log('รูปภาพถูกเลือก:', result.assets[0].uri);
        Alert.alert('สำเร็จ', 'รูปภาพถูกเลือกแล้ว');
      } else {
        console.log('ไม่มีการเลือกรูปภาพ');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเลือกรูปภาพ: ' + errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Ionicons name="person-circle" size={100} color="#007AFF" />
            )}
            <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoText}>แตะเพื่อเปลี่ยนรูปโปรไฟล์</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ชื่อ-นามสกุล *</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="กรอกชื่อ-นามสกุล"
              placeholderTextColor="#8E8E93"
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>อีเมล *</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="กรอกอีเมล"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="กรอกเบอร์โทรศัพท์"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ที่อยู่</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="กรอกที่อยู่"
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>การตั้งค่าเพิ่มเติม</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
              <Text style={styles.settingText}>เปลี่ยนรหัสผ่าน</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
              <Text style={styles.settingText}>การตั้งค่าความปลอดภัย</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color="#007AFF" />
              <Text style={styles.settingText}>การแจ้งเตือน</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={styles.dangerSection}>
          <Text style={styles.sectionTitle}>การตั้งค่าขั้นสูง</Text>
          
          <TouchableOpacity style={styles.dangerItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              <Text style={styles.dangerText}>ลบบัญชีผู้ใช้</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  photoSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    fontSize: 14,
    color: '#8E8E93',
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
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
  },
  dangerSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dangerText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 12,
  },
});

export default EditProfile; 