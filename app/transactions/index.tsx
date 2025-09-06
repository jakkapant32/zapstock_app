import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QuickActionsBar from '../../components/QuickActionsBar';

const sampleTransactions = [];

const Transactions = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const handleBack = () => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/dashboard');
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
        <Text style={styles.headerTitle}>ประวัติธุรกรรม</Text>
        <View style={{ width: 32 }} />
      </View>
      {/* Content */}
      <ScrollView style={styles.content}>
        {sampleTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="swap-horizontal" size={64} color="#C7C7CC" />
            <Text style={styles.emptyTitle}>ยังไม่มีธุรกรรม</Text>
            <Text style={styles.emptySubtitle}>จะมีการแสดงประวัติการเบิกเข้า-เบิกออกที่นี่</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {/* map รายการธุรกรรม */}
          </View>
        )}
      </ScrollView>
      {/* Quick Actions */}
      <QuickActionsBar active="transactions" />
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
    marginTop: 16,
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#C7C7CC',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    ...Platform.select({
      ios: {
        paddingBottom: 34,
      },
    }),
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
});

export default Transactions; 