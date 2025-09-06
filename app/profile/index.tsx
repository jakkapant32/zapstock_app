import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import QuickActionsBar from '../../components/QuickActionsBar';
import { mockService } from '../../constants/MockDataService';
import { useAuth } from '../../contexts/AuthContext';

export const unstable_settings = { initialRouteName: 'index', headerShown: false };

interface ProfileStats {
  totalProducts: number;
  lowStockItems: number;
  expiringItems: number;
  todaySales: number;
  monthlySales: number;
}

const Profile = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, logout, checkAuthStatus } = useAuth();
  
  // States
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalProducts: 0,
    lowStockItems: 0,
    expiringItems: 0,
    todaySales: 0,
    monthlySales: 0,
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load profile stats
  useEffect(() => {
    loadProfileStats();
  }, []);

  // Refresh profile data when component focuses (but not too frequently)
  useEffect(() => {
    let isRefreshing = false;
    let lastRefreshTime = 0;
    const REFRESH_COOLDOWN = 5000; // 5 วินาที
    
    const unsubscribe = navigation.addListener('focus', () => {
      const now = Date.now();
      if (!isRefreshing && (now - lastRefreshTime) > REFRESH_COOLDOWN) {
        isRefreshing = true;
        lastRefreshTime = now;
        refreshProfileData().finally(() => {
          isRefreshing = false;
        });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const loadProfileStats = async () => {
    try {
      // เรียก Mock Service เพื่อดึงข้อมูลสถิติ
      const stats = await mockService.getProfileStats();
      setProfileStats(stats);
    } catch (error) {
      // ใช้ข้อมูลจำลองถ้า API ไม่ทำงาน
      setProfileStats({
        totalProducts: 156,
        lowStockItems: 8,
        expiringItems: 12,
        todaySales: 45250,
        monthlySales: 1250000,
      });
    }
  };



  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.replace('/auth/Login');
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  // เพิ่มฟังก์ชัน refresh ข้อมูลโปรไฟล์
  const refreshProfileData = async () => {
    try {
      // ตรวจสอบว่ามีข้อมูลผู้ใช้อยู่แล้วหรือไม่
      if (!user) {
        return;
      }
      
      // เรียกใช้ checkAuthStatus จาก useAuth hook
      await checkAuthStatus();
    } catch (error) {
      // Handle error silently
    }
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  const handleBackupData = () => {
    Alert.alert(
      'สำรองข้อมูล',
      'คุณต้องการสำรองข้อมูลทั้งหมดหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'สำรอง', onPress: () => {
          Alert.alert('สำเร็จ', 'ข้อมูลถูกสำรองเรียบร้อยแล้ว');
        }},
      ]
    );
  };

  const handleRestoreData = () => {
    Alert.alert(
      'กู้คืนข้อมูล',
      'คุณต้องการกู้คืนข้อมูลจากไฟล์สำรองหรือไม่? การดำเนินการนี้จะแทนที่ข้อมูลปัจจุบัน',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'กู้คืน', style: 'destructive', onPress: () => {
          Alert.alert('สำเร็จ', 'ข้อมูลถูกกู้คืนเรียบร้อยแล้ว');
        }},
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'ส่งออกข้อมูล',
      'เลือกรูปแบบการส่งออกข้อมูล',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'Excel (.xlsx)', onPress: () => Alert.alert('สำเร็จ', 'ส่งออกเป็น Excel เรียบร้อยแล้ว') },
        { text: 'CSV (.csv)', onPress: () => Alert.alert('สำเร็จ', 'ส่งออกเป็น CSV เรียบร้อยแล้ว') },
        { text: 'PDF (.pdf)', onPress: () => Alert.alert('สำเร็จ', 'ส่งออกเป็น PDF เรียบร้อยแล้ว') },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'เกี่ยวกับแอปพลิเคชัน',
      'ระบบจัดการร้านขายของสด\nเวอร์ชัน 1.0.0\n\nพัฒนาโดย: Eazy1 Team\n\n© 2024 All rights reserved',
      [{ text: 'ตกลง' }]
    );
  };

  const handleHelp = () => {
    router.push('/profile/help');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange = () => {},
    danger = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.menuItem, danger && styles.menuItemDanger]} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={danger ? '#FF3B30' : '#007AFF'} 
        />
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
          thumbColor={switchValue ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      ) : null}
    </TouchableOpacity>
  );

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkModeEnabled ? '#000000' : '#F2F2F7' }]}>
      <StatusBar barStyle={darkModeEnabled ? "light-content" : "dark-content"} backgroundColor={darkModeEnabled ? "#000000" : "#FFFFFF"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: darkModeEnabled ? '#1C1C1E' : '#007AFF' }]}>
        <Text style={styles.headerTitle}>โปรไฟล์</Text>
        <TouchableOpacity style={[styles.editButton, { backgroundColor: darkModeEnabled ? '#2C2C2E' : '#FFFFFF' }]} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={28} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={[styles.profileBox, { backgroundColor: darkModeEnabled ? '#1C1C1E' : '#FFFFFF' }]}>
                   <View style={styles.profileAvatar}>
           {user?.profileImage ? (
             <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
           ) : (
             <Ionicons name="person-circle" size={80} color="#007AFF" />
           )}
           <TouchableOpacity style={styles.editAvatarButton}>
             <Ionicons name="camera" size={16} color="#FFFFFF" />
           </TouchableOpacity>
         </View>
          {user ? (
            <>
              <Text style={[styles.profileName, { color: darkModeEnabled ? '#FFFFFF' : '#000000' }]}>{user.fullName || user.username}</Text>
              <Text style={[styles.profileEmail, { color: darkModeEnabled ? '#C7C7CC' : '#8E8E93' }]}>{user.email}</Text>
              <Text style={[styles.profileRole, { color: darkModeEnabled ? '#C7C7CC' : '#8E8E93' }]}>บทบาท: {user.role || 'ผู้จัดการ'}</Text>
              <Text style={[styles.profileStatus, { color: darkModeEnabled ? '#34C759' : '#34C759' }]}>สถานะ: ใช้งาน</Text>
              {user.phone && <Text style={[styles.profilePhone, { color: darkModeEnabled ? '#C7C7CC' : '#8E8E93' }]}>เบอร์โทร: {user.phone}</Text>}
              {user.address && <Text style={[styles.profileAddress, { color: darkModeEnabled ? '#C7C7CC' : '#8E8E93' }]}>ที่อยู่: {user.address}</Text>}
            </>
          ) : (
            <Text style={[styles.profileEmail, { color: darkModeEnabled ? '#C7C7CC' : '#8E8E93' }]}>ไม่ได้เข้าสู่ระบบ</Text>
          )}
        </View>

        {/* Stats Section */}
        <View style={[styles.section, { backgroundColor: darkModeEnabled ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: darkModeEnabled ? '#FFFFFF' : '#000000' }]}>สถิติการทำงาน</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="สินค้าทั้งหมด"
              value={profileStats.totalProducts}
              icon="cube-outline"
              color="#007AFF"
            />
            <StatCard
              title="สินค้าใกล้หมด"
              value={profileStats.lowStockItems}
              icon="warning-outline"
              color="#FF9500"
            />
            <StatCard
              title="สินค้าใกล้หมดอายุ"
              value={profileStats.expiringItems}
              icon="time-outline"
              color="#FF3B30"
            />
            <StatCard
              title="ยอดขายวันนี้"
              value={formatCurrency(profileStats.todaySales)}
              icon="trending-up-outline"
              color="#34C759"
            />
          </View>
        </View>

        {/* Settings Section */}
        <View style={[styles.section, { backgroundColor: darkModeEnabled ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: darkModeEnabled ? '#FFFFFF' : '#000000' }]}>การตั้งค่า</Text>
          
          <View style={styles.menuGroup}>
            <MenuItem
              icon="notifications-outline"
              title="การแจ้งเตือน"
              subtitle="แจ้งเตือนสินค้าใกล้หมด สินค้าใกล้หมดอายุ"
              showSwitch={true}
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
              onPress={() => {}}
            />
            <MenuItem
              icon="moon-outline"
              title="โหมดมืด"
              subtitle="เปลี่ยนธีมแอปพลิเคชัน"
              showSwitch={true}
              switchValue={darkModeEnabled}
              onSwitchChange={setDarkModeEnabled}
              onPress={() => {}}
            />
            <MenuItem
              icon="cloud-upload-outline"
              title="สำรองข้อมูลอัตโนมัติ"
              subtitle="สำรองข้อมูลทุกวัน"
              showSwitch={true}
              switchValue={autoBackupEnabled}
              onSwitchChange={setAutoBackupEnabled}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: darkModeEnabled ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: darkModeEnabled ? '#FFFFFF' : '#000000' }]}>บัญชีผู้ใช้</Text>
          
          <View style={styles.menuGroup}>
            <MenuItem
              icon="person-outline"
              title="แก้ไขโปรไฟล์"
              subtitle="เปลี่ยนข้อมูลส่วนตัว"
              onPress={handleEditProfile}
            />
            <MenuItem
              icon="lock-closed-outline"
              title="เปลี่ยนรหัสผ่าน"
              subtitle="อัปเดตรหัสผ่านใหม่"
              onPress={handleChangePassword}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="ความปลอดภัย"
              subtitle="การตั้งค่าความปลอดภัย"
              onPress={() => router.push('/profile/change-password')}
            />
          </View>
        </View>

        {/* Data Management Section */}
        <View style={[styles.section, { backgroundColor: darkModeEnabled ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: darkModeEnabled ? '#FFFFFF' : '#000000' }]}>จัดการข้อมูล</Text>
          
          <View style={styles.menuGroup}>
            <MenuItem
              icon="cloud-download-outline"
              title="สำรองข้อมูล"
              subtitle="สำรองข้อมูลทั้งหมด"
              onPress={handleBackupData}
            />
            <MenuItem
              icon="cloud-upload-outline"
              title="กู้คืนข้อมูล"
              subtitle="กู้คืนข้อมูลจากไฟล์สำรอง"
              onPress={handleRestoreData}
            />
            <MenuItem
              icon="document-outline"
              title="ส่งออกข้อมูล"
              subtitle="ส่งออกเป็น Excel, CSV, PDF"
              onPress={handleExportData}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>การสนับสนุน</Text>
          
          <View style={styles.menuGroup}>
            <MenuItem
              icon="help-circle-outline"
              title="ช่วยเหลือ"
              subtitle="คู่มือการใช้งาน"
              onPress={handleHelp}
            />
            <MenuItem
              icon="chatbubble-outline"
              title="ติดต่อเรา"
              subtitle="ส่งข้อความถึงทีมพัฒนา"
              onPress={() => router.push('/profile/contact')}
            />
            <MenuItem
              icon="information-circle-outline"
              title="เกี่ยวกับ"
              subtitle="ข้อมูลแอปพลิเคชัน"
              onPress={handleAbout}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Quick Actions */}
      <QuickActionsBar active="profile" />

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="log-out-outline" size={48} color="#FF3B30" />
            <Text style={styles.modalTitle}>ออกจากระบบ</Text>
            <Text style={styles.modalMessage}>
              คุณต้องการออกจากระบบหรือไม่?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={confirmLogout}
              >
                <Text style={styles.modalButtonConfirmText}>ออกจากระบบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 56,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    letterSpacing: 1,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontFamily: 'System',
  },
  editButton: {
    padding: 16,
    marginRight: -8,
    position: 'absolute',
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  profileStatus: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  profilePhone: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  profileAddress: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },

  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 8,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 6,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuItemDanger: {
    borderBottomColor: '#FFE5E5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  menuItemTitleDanger: {
    color: '#FF3B30',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    paddingVertical: 16,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667eea',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F2F2F7',
  },
  modalButtonConfirm: {
    backgroundColor: '#FF3B30',
  },
  modalButtonCancelText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Profile; 