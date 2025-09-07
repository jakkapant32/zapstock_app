import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    View,
} from 'react-native';
import { useData } from '../../contexts/DataContext';

interface Category {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  description: string;
  sku: string;
  price: string;
  currentStock: string;
  minStockQuantity: string;
  categoryId: string;
  imageUrl: string;
}

export default function AddProduct() {
  const router = useRouter();
  const navigation = useNavigation();
  const { categories, addProduct } = useData();
  
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    sku: '',
    price: '',
    currentStock: '',
    minStockQuantity: '',
    categoryId: '',
    imageUrl: '',
  });

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🚀 AddProduct component mounted');
    console.log('📊 Categories available:', categories?.length || 0);
  }, [categories]);

  const handleBack = () => {
    console.log('🔙 Back button pressed');
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.replace('/products');
    }
  };

  const handleInputChange = (field: keyof ProductForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const requestPermissions = async () => {
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      Alert.alert('ต้องการสิทธิ์', 'แอปต้องการสิทธิ์ในการเข้าถึงรูปภาพเพื่อเลือกรูปสินค้า');
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setImageLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        if (selectedAsset.base64) {
          const imageDataUri = `data:image/jpeg;base64,${selectedAsset.base64}`;
          setForm(prev => ({ ...prev, imageUrl: imageDataUri }));
          console.log('✅ Image converted to base64 successfully');
          console.log('🖼️ Image data length:', imageDataUri.length);
        } else {
          setForm(prev => ({ ...prev, imageUrl: selectedAsset.uri }));
          console.log('⚠️ Using URI instead of base64:', selectedAsset.uri);
        }
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเลือกรูปภาพได้');
    } finally {
      setImageLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อสินค้า');
      return false;
    }

    if (!form.currentStock.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกจำนวนสต็อกปัจจุบัน');
      return false;
    }

    if (!form.minStockQuantity.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกจำนวนสต็อกขั้นต่ำ');
      return false;
    }

    if (!form.price.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกราคา');
      return false;
    }

    const currentStock = parseInt(form.currentStock);
    const minStock = parseInt(form.minStockQuantity);
    const price = parseFloat(form.price);

    if (isNaN(currentStock) || currentStock < 0) {
      Alert.alert('ข้อผิดพลาด', 'จำนวนสต็อกปัจจุบันต้องเป็นตัวเลขและมากกว่าหรือเท่ากับ 0');
      return false;
    }

    if (isNaN(minStock) || minStock < 0) {
      Alert.alert('ข้อผิดพลาด', 'จำนวนสต็อกขั้นต่ำต้องเป็นตัวเลขและมากกว่าหรือเท่ากับ 0');
      return false;
    }

    if (isNaN(price) || price < 0) {
      Alert.alert('ข้อผิดพลาด', 'ราคาต้องเป็นตัวเลขและมากกว่าหรือเท่ากับ 0');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // ตรวจสอบว่ามีรูปภาพหรือไม่
      const imageToSave = form.imageUrl.trim() || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop';
      
      // สร้าง productData ตามที่ backend ต้องการ
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        sku: form.sku.trim() || null,
        price: parseFloat(form.price),
        currentStock: parseInt(form.currentStock),
        minStockQuantity: parseInt(form.minStockQuantity),
        categoryId: selectedCategory?.id || null,
        categoryName: selectedCategory?.name || null,
        image: imageToSave, // ใช้ field 'image' ตามที่ backend ต้องการ
      };

      console.log('📦 Saving product with data:', productData);
      console.log('🖼️ Image data type:', typeof imageToSave);
      console.log('🖼️ Image data length:', imageToSave.length);

      // Create product using context
      await addProduct(productData);
      
      Alert.alert('สำเร็จ', 'เพิ่มสินค้าสำเร็จ', [
        { text: 'ตกลง', onPress: () => router.replace('/products') }
      ]);
    } catch (error: any) {
      console.error('❌ Error saving product:', error);
      Alert.alert('ข้อผิดพลาด', error.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (value: string) => {
    // อนุญาตให้กรอกได้เฉพาะตัวเลขและจุดทศนิยม
    const numericValue = value.replace(/[^0-9.]/g, '');
    // ตรวจสอบว่ามีจุดทศนิยมมากกว่า 1 จุดหรือไม่
    const dotCount = (numericValue.match(/\./g) || []).length;
    if (dotCount <= 1) {
      handleInputChange('price', numericValue);
    }
  };

  const handleStockChange = (field: 'currentStock' | 'minStockQuantity', value: string) => {
    // อนุญาตให้กรอกได้เฉพาะตัวเลข
    const numericValue = value.replace(/[^0-9]/g, '');
    handleInputChange(field, numericValue);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>เพิ่มสินค้าใหม่</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
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
          {/* Product Image */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              {form.imageUrl ? (
                <Image source={{ uri: form.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={48} color="#C7C7CC" />
                  <Text style={styles.imagePlaceholderText}>ไม่มีรูปภาพ</Text>
                </View>
              )}
              {imageLoading && (
                <View style={styles.imageLoadingOverlay}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.changeImageButton} 
              onPress={handleImagePicker}
              disabled={imageLoading}
            >
              <Ionicons name="camera-outline" size={20} color="#007AFF" style={styles.cameraIcon} />
              <Text style={styles.changeImageText}>
                {imageLoading ? 'กำลังประมวลผล...' : 'เลือกรูปจากแกลเลอรี่'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อสินค้า *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="กรอกชื่อสินค้า"
                value={form.name}
                onChangeText={(value) => handleInputChange('name', value)}
                maxLength={200}
              />
            </View>

            {/* SKU */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SKU</Text>
              <TextInput
                style={styles.textInput}
                placeholder="รหัสสินค้า (ไม่บังคับ)"
                value={form.sku}
                onChangeText={(value) => handleInputChange('sku', value)}
                maxLength={50}
                autoCapitalize="characters"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รายละเอียด</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="รายละเอียดสินค้า"
                value={form.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>หมวดหมู่</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={[styles.pickerButtonText, !selectedCategory && styles.placeholderText]}>
                  {selectedCategory ? selectedCategory.name : 'เลือกหมวดหมู่'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8E8E93" />
              </TouchableOpacity>
              
              {showCategoryPicker && (
                <View style={styles.categoryPicker}>
                  <ScrollView 
                    style={styles.categoryScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    <TouchableOpacity 
                      style={styles.categoryOption}
                      onPress={() => {
                        setSelectedCategory(null);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.categoryOptionText}>ไม่ระบุ</Text>
                    </TouchableOpacity>
                    {(categories || []).map((category) => (
                      <TouchableOpacity 
                        key={category.id}
                        style={styles.categoryOption}
                        onPress={() => {
                          setSelectedCategory(category);
                          setShowCategoryPicker(false);
                        }}
                      >
                        <Text style={styles.categoryOptionText}>{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ราคา (บาท) *</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={[styles.textInput, styles.priceInput]}
                  placeholder="0.00"
                  value={form.price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.currencyText}>บาท</Text>
              </View>
            </View>

            {/* Current Stock */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>จำนวนสต็อกปัจจุบัน *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                value={form.currentStock}
                onChangeText={(value) => handleStockChange('currentStock', value)}
                keyboardType="numeric"
              />
            </View>

            {/* Minimum Stock */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>จำนวนสต็อกขั้นต่ำ *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0"
                value={form.minStockQuantity}
                onChangeText={(value) => handleStockChange('minStockQuantity', value)}
                keyboardType="numeric"
              />
            </View>

            {/* Image URL (Optional for manual input) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL รูปภาพ (ไม่บังคับ)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://example.com/image.jpg หรือเลือกรูปจากแกลเลอรี่ด้านบน"
                value={form.imageUrl}
                onChangeText={(value) => handleInputChange('imageUrl', value)}
                keyboardType="url"
                autoCapitalize="none"
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
  headerSpacer: {
    width: 40,
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
  imageSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  cameraIcon: {
    marginRight: 8,
  },
  changeImageText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
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
  placeholderText: {
    color: '#8E8E93',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  categoryPicker: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    zIndex: 1000,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryScrollView: {
    maxHeight: 300,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#000',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    marginRight: 8,
  },
  currencyText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  bottomContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButtonBottom: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
  },
});
