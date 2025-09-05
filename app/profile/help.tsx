import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const unstable_settings = { initialRouteName: 'help', headerShown: false };

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const Help = () => {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "วิธีการเพิ่มสินค้าใหม่",
      answer: "1. ไปที่หน้า 'สินค้า' 2. แตะปุ่ม '+' 3. กรอกข้อมูลสินค้า 4. เลือกหมวดหมู่ 5. แตะ 'บันทึก'",
      category: "สินค้า"
    },
    {
      id: 2,
      question: "วิธีการแก้ไขข้อมูลสินค้า",
      answer: "1. ไปที่หน้า 'สินค้า' 2. แตะที่สินค้าที่ต้องการแก้ไข 3. แตะไอคอนแก้ไข 4. แก้ไขข้อมูล 5. แตะ 'บันทึก'",
      category: "สินค้า"
    },
    {
      id: 3,
      question: "วิธีการเพิ่มรายการสต็อก",
      answer: "1. ไปที่หน้า 'รายการสต็อก' 2. แตะปุ่ม '+' 3. เลือกประเภท 'รับเข้า' 4. เลือกสินค้าและกรอกจำนวน 5. แตะ 'บันทึก'",
      category: "สต็อก"
    },
    {
      id: 4,
      question: "วิธีการขายสินค้า",
      answer: "1. ไปที่หน้า 'รายการสต็อก' 2. แตะปุ่ม '+' 3. เลือกประเภท 'ขาย' 4. เลือกสินค้าและกรอกจำนวน 5. แตะ 'บันทึก'",
      category: "สต็อก"
    },
    {
      id: 5,
      question: "วิธีการดูรายงานยอดขาย",
      answer: "1. ไปที่หน้า 'แดชบอร์ด' 2. ดูสถิติยอดขายในส่วนต่างๆ 3. แตะที่รายการเพื่อดูรายละเอียด",
      category: "รายงาน"
    },
    {
      id: 6,
      question: "วิธีการตั้งค่าการแจ้งเตือน",
      answer: "1. ไปที่หน้า 'โปรไฟล์' 2. แตะ 'การตั้งค่า' 3. เปิด/ปิดการแจ้งเตือนตามต้องการ",
      category: "การตั้งค่า"
    },
    {
      id: 7,
      question: "วิธีการสำรองข้อมูล",
      answer: "1. ไปที่หน้า 'โปรไฟล์' 2. แตะ 'จัดการข้อมูล' 3. แตะ 'สำรองข้อมูล' 4. เลือกตำแหน่งที่ต้องการบันทึก",
      category: "ข้อมูล"
    },
    {
      id: 8,
      question: "วิธีการส่งออกรายงาน",
      answer: "1. ไปที่หน้า 'โปรไฟล์' 2. แตะ 'จัดการข้อมูล' 3. แตะ 'ส่งออกข้อมูล' 4. เลือกรูปแบบไฟล์ (Excel, CSV, PDF)",
      category: "รายงาน"
    }
  ];

  const categories = ['ทั้งหมด', 'สินค้า', 'สต็อก', 'รายงาน', 'การตั้งค่า', 'ข้อมูล'];
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  const handleBack = () => {
    router.back();
  };

  const handleContactSupport = () => {
    Alert.alert(
      'ติดต่อเรา',
      'คุณต้องการติดต่อทีมสนับสนุนหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'อีเมล', onPress: () => {
          Alert.alert('อีเมล', 'support@eazy1.com');
        }},
        { text: 'โทรศัพท์', onPress: () => {
          Alert.alert('โทรศัพท์', '02-123-4567');
        }},
      ]
    );
  };

  const handleFAQPress = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const filteredFAQ = selectedCategory === 'ทั้งหมด' 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory);

  const FAQItem = ({ item }: { item: FAQItem }) => (
    <TouchableOpacity 
      style={styles.faqItem} 
      onPress={() => handleFAQPress(item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons 
          name={expandedFAQ === item.id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#8E8E93" 
        />
      </View>
      {expandedFAQ === item.id && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
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
        <Text style={styles.headerTitle}>ช่วยเหลือ</Text>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
          <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <Text style={styles.searchPlaceholder}>ค้นหาคำถามที่ต้องการ...</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>การดำเนินการด่วน</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickActionText}>เพิ่มสินค้า</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="trending-up-outline" size={24} color="#34C759" />
              </View>
              <Text style={styles.quickActionText}>รายงาน</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="settings-outline" size={24} color="#FF9500" />
              </View>
              <Text style={styles.quickActionText}>การตั้งค่า</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionItem}>
              <View style={styles.quickActionIcon}>
                <Ionicons name="cloud-upload-outline" size={24} color="#AF52DE" />
              </View>
              <Text style={styles.quickActionText}>สำรองข้อมูล</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>หมวดหมู่</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>คำถามที่พบบ่อย</Text>
          <View style={styles.faqList}>
            {filteredFAQ.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>ยังไม่พบคำตอบที่ต้องการ?</Text>
          <TouchableOpacity style={styles.contactCard} onPress={handleContactSupport}>
            <View style={styles.contactIcon}>
              <Ionicons name="headset-outline" size={32} color="#007AFF" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>ติดต่อทีมสนับสนุน</Text>
              <Text style={styles.contactSubtitle}>เราพร้อมช่วยเหลือคุณ 24/7</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfoSection}>
          <Text style={styles.appInfoText}>ระบบจัดการร้านขายของสด</Text>
          <Text style={styles.appVersionText}>เวอร์ชัน 1.0.0</Text>
          <Text style={styles.appCopyrightText}>© 2024 Eazy1 Team. All rights reserved.</Text>
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
  contactButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 8,
  },
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  faqSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  appInfoSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  appVersionText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  appCopyrightText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});

export default Help; 