import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Interface ที่ตรงกับ Backend
interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryModalProps {
  visible: boolean;
  category?: Category | null;
  onSave: (categoryData: { name: string; description: string }) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  category,
  onSave,
  onClose,
  loading = false
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (visible) {
      if (category) {
        // Edit mode
        setName(category.name || '');
        setDescription(category.description || '');
      } else {
        // Add mode
        setName('');
        setDescription('');
      }
    }
  }, [visible, category]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('แจ้งเตือน', 'ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร');
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        description: description.trim()
      });
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={handleClose}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {category ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
          </Text>
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

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>ชื่อหมวดหมู่ *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="กรอกชื่อหมวดหมู่"
                placeholderTextColor="#8E8E93"
                value={name}
                onChangeText={setName}
                maxLength={50}
                editable={!loading}
              />
              <Text style={styles.characterCount}>{name.length}/50</Text>
            </View>

            {/* Description Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>คำอธิบาย</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="กรอกคำอธิบายหมวดหมู่ (ไม่บังคับ)"
                placeholderTextColor="#8E8E93"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={200}
                editable={!loading}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{description.length}/200</Text>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
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
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
    marginTop: 4,
  },
});

export default CategoryModal;
