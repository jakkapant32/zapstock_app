import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean; // ตรงกับ backend ที่ส่ง "isActive"
  createdAt?: string; // ตรงกับ backend ที่ส่ง "createdAt"
  updatedAt?: string; // ตรงกับ backend ที่ส่ง "updatedAt"
}

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (categoryData: Partial<Category>) => Promise<void>;
  category?: Category | null;
  loading?: boolean;
}

export default function CategoryModal({ 
  visible, 
  onClose, 
  onSave, 
  category, 
  loading = false 
}: CategoryModalProps) {
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  const handleInputChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };





  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      onClose();
      // Reset form
      setForm({
        name: '',
        description: '',
      });
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการบันทึกหมวดหมู่');
    }
  };

  const handleClose = () => {
    if (category) {
      // Reset form to original values when editing
      setForm({
        name: category.name,
        description: category.description || '',
      });
    } else {
      // Reset form to empty when adding new
      setForm({
        name: '',
        description: '',
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {category ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
          </Text>
        </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Category Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อหมวดหมู่ *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="เช่น มือถือ, คอมพิวเตอร์, หูฟัง"
                value={form.name}
                onChangeText={(value) => handleInputChange('name', value)}
                maxLength={100}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>คำอธิบาย</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="อธิบายเพิ่มเติมเกี่ยวกับหมวดหมู่นี้"
                value={form.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

          </View>

          {/* Save Button */}
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            disabled={loading}
          >
            <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    position: 'relative',
  },
  closeButton: {
    padding: 8,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
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


  formSection: {
    marginBottom: 20,
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
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

