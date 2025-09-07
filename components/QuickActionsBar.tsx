import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionsBarProps {
  onAddPress?: () => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onAddPress,
  onEditPress,
  onDeletePress,
  showAdd = true,
  showEdit = true,
  showDelete = true,
}) => {
  return (
    <View style={styles.container}>
      {showAdd && (
        <TouchableOpacity style={styles.actionButton} onPress={onAddPress}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>เพิ่ม</Text>
        </TouchableOpacity>
      )}
      
      {showEdit && (
        <TouchableOpacity style={styles.actionButton} onPress={onEditPress}>
          <Ionicons name="create" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>แก้ไข</Text>
        </TouchableOpacity>
      )}
      
      {showDelete && (
        <TouchableOpacity style={styles.actionButton} onPress={onDeletePress}>
          <Ionicons name="trash" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>ลบ</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default QuickActionsBar;
