import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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

export const unstable_settings = { initialRouteName: 'edit', headerShown: false };

const EditCategory = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { categories, updateCategory } = useData();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<CategoryForm>({
    name: '',
    description: '',
  });

  // Find category by ID
  const category = categories.find(c => c.id === id);

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
      });
    }
  }, [category]);

  const handleBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/categories');
    }
  };

  const handleInputChange = (field: keyof CategoryForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!category) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลหมวดหมู่');
      return;
    }

    // Validation
    if (!form.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: form.name.trim(),
        description: form.description.trim() || null
      };

      console.log('📁 Updating category with data:', categoryData);

      // Update category using context
      await updateCategory(category.id, categoryData);
      Alert.alert('สำเร็จ', 'อัปเดตหมวดหมู่สำเร็จ', [
        { text: 'ตกลง', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการอัปเดตหมวดหมู่');
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>แก้ไขหมวดหมู่</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Text>
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

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
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
  saveButtonTextDisabled: {
    color: '#8E8E93',
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
});

export default EditCategory;
