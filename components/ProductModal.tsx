import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Product {
  id?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  currentStock?: number;
  minStockQuantity?: number;
  price?: number;
}

interface Category {
  id: string;
  name: string;
}

interface ProductForm {
  name: string;
  description: string;
  categoryId: string;
  currentStock: string;
  minStockQuantity: string;
  price: string;
}

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  product?: Product | null;
  categories: Category[];
}

export default function ProductModal({ visible, onClose, onSave, product, categories }: ProductModalProps) {
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    categoryId: '',
    currentStock: '',
    minStockQuantity: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId?.toString() || '',
        currentStock: product.currentStock?.toString() || '',
        minStockQuantity: product.minStockQuantity?.toString() || '',
        price: product.price?.toString() || '',
      });
    } else {
      setForm({ name: '', description: '', categoryId: (Array.isArray(categories) && categories[0]?.id?.toString()) || '', currentStock: '', minStockQuantity: '', price: '' });
    }
  }, [product, categories]);

  const handleSave = async () => {
    console.log('form:', form);
    console.log('categories:', categories);
    // ตรวจสอบว่า categoryId ตรงกับ uuid จริงใน categories
    const validCategory = (Array.isArray(categories) ? categories : []).some(cat => cat.id?.toString() === form.categoryId);
    if (!validCategory) {
      Alert.alert('กรุณาเลือกหมวดหมู่ให้ถูกต้อง');
      return;
    }
    if (
      !form.name.trim() ||
      form.currentStock === '' || isNaN(Number(form.currentStock)) ||
      form.minStockQuantity === '' || isNaN(Number(form.minStockQuantity)) ||
      form.price === '' || isNaN(Number(form.price))
    ) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบและถูกต้อง');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        currentStock: Number(form.currentStock),
        minStockQuantity: Number(form.minStockQuantity),
        price: Number(form.price),
        categoryId: form.categoryId,
      });
      onClose();
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      Alert.alert('ผิดพลาด', err.message || 'บันทึกสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>{product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</Text>
          <TextInput style={styles.input} placeholder="ชื่อสินค้า" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} keyboardType="default" />
          <TextInput style={styles.input} placeholder="รายละเอียด" value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} multiline numberOfLines={2} />
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={form.categoryId}
              onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}
              style={{ flex: 1 }}>
                             {(Array.isArray(categories) ? categories : []).map(cat => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id.toString()} />
              ))}
            </Picker>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="จำนวนสต็อก" value={form.currentStock} onChangeText={v => setForm(f => ({ ...f, currentStock: v.replace(/[^0-9]/g, '') }))} keyboardType="number-pad" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="สต็อกขั้นต่ำ" value={form.minStockQuantity} onChangeText={v => setForm(f => ({ ...f, minStockQuantity: v.replace(/[^0-9]/g, '') }))} keyboardType="number-pad" />
          </View>
          <TextInput style={styles.input} placeholder="ราคา (บาท)" value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v.replace(/[^0-9.]/g, '') }))} keyboardType="decimal-pad" />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
              <Text style={styles.saveBtnText}>{product ? 'อัปเดต' : 'เพิ่มสินค้า'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Ionicons name="close" size={20} color="#888" />
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', borderRadius: 18, padding: 22, width: '90%', elevation: 8 },
  header: { fontSize: 20, fontWeight: '700', color: '#222', marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#F8FAFC', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  pickerBox: { backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 10 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  saveBtn: { flex: 1, backgroundColor: '#007AFF', borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', padding: 14 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15, marginLeft: 8 },
  cancelBtn: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', padding: 14 },
  cancelBtnText: { color: '#888', fontWeight: '600', fontSize: 15, marginLeft: 8 },
}); 