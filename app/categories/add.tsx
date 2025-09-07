import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useData } from '../../contexts/DataContext';

interface CategoryForm {
  name: string;
  description: string;
}

export default function AddCategory() {
  const router = useRouter();
  const navigation = useNavigation();
  const { categories, addCategory } = useData();
  
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CategoryForm>({
    name: '',
    description: '',
  });

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🚀 AddCategory component mounted');
    console.log('📊 Categories available:', categories?.length || 0);
  }, [categories]);

  const handleBack = () => {
    console.log('🔙 Back button pressed');
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/categories');
    }
  };

  const handleInputChange = (field: keyof CategoryForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อหมวดหมู่');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const categoryData = {
        name: form.name.trim(),
        description: form.description.trim() || null
      };

      console.log('📁 Saving category with data:', categoryData);

      // Create category using context
      await addCategory(categoryData);
      
      Alert.alert('สำเร็จ', 'เพิ่มหมวดหมู่สำเร็จ', [
        { text: 'ตกลง', onPress: () => router.replace('/categories') }
      ]);
    } catch (error: any) {
      console.error('❌ Error saving category:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เพิ่มหมวดหมู่ใหม่</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.saveButtonText, styles.loadingText]}>กำลังบันทึก...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>บันทึก</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Category Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อหมวดหมู่ *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="กรอกชื่อหมวดหมู่"
                value={form.name}
                onChangeText={(value) => handleInputChange('name', value)}
                maxLength={200}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>คำอธิบาย</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="คำอธิบายหมวดหมู่"
                value={form.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

          </View>

          {/* Bottom spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});
