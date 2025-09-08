import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export const unstable_settings = { initialRouteName: 'contact', headerShown: false };

const Contact = () => {
  const router = useRouter();
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSendMessage = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ');
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

    if (!subject.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกหัวข้อ');
      return;
    }

    if (!message.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกข้อความ');
      return;
    }

    try {
      setLoading(true);
      
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'ส่งข้อความสำเร็จ',
        'ข้อความของคุณถูกส่งเรียบร้อยแล้ว เราจะติดต่อกลับภายใน 24 ชั่วโมง',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              // Clear form
              setName('');
              setEmail('');
              setPhone('');
              setSubject('');
              setMessage('');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการส่งข้อความ');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    Alert.alert(
      'โทรศัพท์',
      'คุณต้องการโทรหาทีมสนับสนุนหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'โทร', onPress: () => {
          Linking.openURL('tel:021234567');
        }},
      ]
    );
  };

  const handleEmail = () => {
    Alert.alert(
      'อีเมล',
      'คุณต้องการส่งอีเมลถึงทีมสนับสนุนหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ส่งอีเมล', onPress: () => {
          Linking.openURL('mailto:support@eazy1.com?subject=คำถามเกี่ยวกับระบบจัดการร้านขายของสด');
        }},
      ]
    );
  };

  const handleWhatsApp = () => {
    Alert.alert(
      'WhatsApp',
      'คุณต้องการส่งข้อความผ่าน WhatsApp หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ส่งข้อความ', onPress: () => {
          const message = encodeURIComponent('สวัสดีครับ ผมมีคำถามเกี่ยวกับระบบจัดการร้านขายของสด');
          Linking.openURL(`whatsapp://send?phone=66812345678&text=${message}`);
        }},
      ]
    );
  };

  const handleLine = () => {
    Alert.alert(
      'Line',
      'คุณต้องการส่งข้อความผ่าน Line หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ส่งข้อความ', onPress: () => {
          Linking.openURL('https://line.me/ti/p/@eazy1support');
        }},
      ]
    );
  };

  const ContactMethod = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color: string;
  }) => (
    <TouchableOpacity style={styles.contactMethod} onPress={onPress}>
      <View style={[styles.contactMethodIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.contactMethodInfo}>
        <Text style={styles.contactMethodTitle}>{title}</Text>
        <Text style={styles.contactMethodSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ติดต่อเรา</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Info */}
        <View style={styles.contactInfoSection}>
          <View style={styles.contactInfoHeader}>
            <Ionicons name="chatbubbles" size={48} color="#007AFF" />
            <Text style={styles.contactInfoTitle}>ติดต่อทีมสนับสนุน</Text>
            <Text style={styles.contactInfoSubtitle}>
              เราพร้อมช่วยเหลือคุณทุกวัน 24 ชั่วโมง
            </Text>
          </View>
        </View>

        {/* Quick Contact Methods */}
        <View style={styles.quickContactSection}>
          <Text style={styles.sectionTitle}>ช่องทางการติดต่อด่วน</Text>
          
          <ContactMethod
            icon="call-outline"
            title="โทรศัพท์"
            subtitle="02-123-4567"
            onPress={handleCall}
            color="#34C759"
          />
          
          <ContactMethod
            icon="mail-outline"
            title="อีเมล"
            subtitle="support@eazy1.com"
            onPress={handleEmail}
            color="#007AFF"
          />
          
          <ContactMethod
            icon="logo-whatsapp"
            title="WhatsApp"
            subtitle="081-234-5678"
            onPress={handleWhatsApp}
            color="#25D366"
          />
          
          <ContactMethod
            icon="chatbubble-outline"
            title="Line"
            subtitle="@eazy1support"
            onPress={handleLine}
            color="#00B900"
          />
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>ส่งข้อความถึงเรา</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ชื่อ *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="กรอกชื่อของคุณ"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>อีเมล *</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="กรอกอีเมลของคุณ"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="กรอกเบอร์โทรศัพท์ (ไม่บังคับ)"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>หัวข้อ *</Text>
            <TextInput
              style={styles.textInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="กรอกหัวข้อของข้อความ"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ข้อความ *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="กรอกรายละเอียดของข้อความ"
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.sendButtonText}>ส่งข้อความ</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Office Info */}
        <View style={styles.officeSection}>
          <Text style={styles.sectionTitle}>สำนักงานของเรา</Text>
          
          <View style={styles.officeCard}>
            <View style={styles.officeIcon}>
              <Ionicons name="location" size={24} color="#007AFF" />
            </View>
            <View style={styles.officeInfo}>
              <Text style={styles.officeTitle}>Eazy1 Office</Text>
              <Text style={styles.officeAddress}>
                123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110
              </Text>
              <Text style={styles.officeHours}>
                จันทร์ - ศุกร์: 8:00 - 18:00 น.
              </Text>
              <Text style={styles.officeHours}>
                เสาร์ - อาทิตย์: 9:00 - 17:00 น.
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Link */}
        <View style={styles.faqSection}>
          <TouchableOpacity style={styles.faqCard} onPress={() => router.push('/profile/help')}>
            <View style={styles.faqIcon}>
              <Ionicons name="help-circle-outline" size={24} color="#FF9500" />
            </View>
            <View style={styles.faqInfo}>
              <Text style={styles.faqTitle}>คำถามที่พบบ่อย</Text>
              <Text style={styles.faqSubtitle}>ค้นหาคำตอบที่คุณต้องการ</Text>
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
  contactInfoSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  contactInfoHeader: {
    alignItems: 'center',
  },
  contactInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  contactInfoSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  quickContactSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  contactMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactMethodInfo: {
    flex: 1,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  contactMethodSubtitle: {
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
    height: 100,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  officeSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  officeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  officeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  officeInfo: {
    flex: 1,
  },
  officeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  officeAddress: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
    lineHeight: 20,
  },
  officeHours: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  faqInfo: {
    flex: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  faqSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default Contact; 