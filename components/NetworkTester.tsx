import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BASE_URL, findWorkingUrl, testAllConnections, testMainConnection } from '../constants/ApiConfig';

interface ConnectionResult {
  url: string;
  working: boolean;
}

export default function NetworkTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [mainConnectionStatus, setMainConnectionStatus] = useState<boolean | null>(null);
  const [allConnections, setAllConnections] = useState<ConnectionResult[]>([]);
  const [workingUrl, setWorkingUrl] = useState<string | null>(null);

  // ทดสอบการเชื่อมต่อหลัก
  const testMainConnectionHandler = async () => {
    setIsTesting(true);
    try {
      const isWorking = await testMainConnection();
      setMainConnectionStatus(isWorking);
      
      if (isWorking) {
        Alert.alert('✅ สำเร็จ', `เชื่อมต่อ Backend ได้ที่: ${BASE_URL}`);
      } else {
        Alert.alert('❌ ล้มเหลว', `ไม่สามารถเชื่อมต่อ Backend ได้ที่: ${BASE_URL}`);
      }
    } catch (error) {
      setMainConnectionStatus(false);
      Alert.alert('❌ ข้อผิดพลาด', `เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // ทดสอบการเชื่อมต่อทั้งหมด
  const testAllConnectionsHandler = async () => {
    setIsTesting(true);
    try {
      const results = await testAllConnections();
      setAllConnections(results);
      
      const workingCount = results.filter(r => r.working).length;
      Alert.alert('📊 ผลการทดสอบ', `พบ ${workingCount} จาก ${results.length} IP ที่ทำงานได้`);
    } catch (error) {
      Alert.alert('❌ ข้อผิดพลาด', `เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // ค้นหา URL ที่ทำงานได้
  const findWorkingUrlHandler = async () => {
    setIsTesting(true);
    try {
      const url = await findWorkingUrl();
      setWorkingUrl(url);
      
      if (url) {
        Alert.alert('🎯 พบ URL ที่ทำงานได้', url);
      } else {
        Alert.alert('❌ ไม่พบ URL ที่ทำงานได้', 'กรุณาตรวจสอบการเชื่อมต่อ Wi-Fi และ Backend');
      }
    } catch (error) {
      Alert.alert('❌ ข้อผิดพลาด', `เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // ทดสอบการเชื่อมต่ออัตโนมัติเมื่อเปิดคอมโพเนนต์
  useEffect(() => {
    testMainConnectionHandler();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌐 Network Connection Tester</Text>
        <Text style={styles.subtitle}>ทดสอบการเชื่อมต่อกับ Backend</Text>
      </View>

      {/* สถานะการเชื่อมต่อหลัก */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚀 การเชื่อมต่อหลัก</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.urlText}>URL: {BASE_URL}</Text>
          <View style={styles.statusIndicator}>
            {mainConnectionStatus === null && (
              <Text style={styles.statusText}>⏳ กำลังทดสอบ...</Text>
            )}
            {mainConnectionStatus === true && (
              <Text style={[styles.statusText, styles.successText]}>✅ เชื่อมต่อได้</Text>
            )}
            {mainConnectionStatus === false && (
              <Text style={[styles.statusText, styles.errorText]}>❌ เชื่อมต่อไม่ได้</Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testMainConnectionHandler}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? '🔄 กำลังทดสอบ...' : '🔍 ทดสอบการเชื่อมต่อหลัก'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ทดสอบการเชื่อมต่อทั้งหมด */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 ทดสอบการเชื่อมต่อทั้งหมด</Text>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testAllConnectionsHandler}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? '🔄 กำลังทดสอบ...' : '🔍 ทดสอบทุก IP'}
          </Text>
        </TouchableOpacity>

        {allConnections.length > 0 && (
          <View style={styles.resultsContainer}>
            {allConnections.map((result, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultUrl}>{result.url}</Text>
                <Text style={[
                  styles.resultStatus,
                  result.working ? styles.successText : styles.errorText
                ]}>
                  {result.working ? '✅' : '❌'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ค้นหา URL ที่ทำงานได้ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 ค้นหา URL ที่ทำงานได้</Text>
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={findWorkingUrlHandler}
          disabled={isTesting}
        >
          <Text style={styles.buttonText}>
            {isTesting ? '🔄 กำลังค้นหา...' : '🔍 ค้นหา URL ที่ทำงานได้'}
          </Text>
        </TouchableOpacity>

        {workingUrl && (
          <View style={styles.workingUrlContainer}>
            <Text style={styles.workingUrlTitle}>🎯 URL ที่ทำงานได้:</Text>
            <Text style={styles.workingUrlText}>{workingUrl}</Text>
          </View>
        )}
      </View>

      {/* คำแนะนำ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 คำแนะนำ</Text>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipText}>• ตรวจสอบว่าโทรศัพท์และคอมพิวเตอร์อยู่ใน Wi-Fi เดียวกัน</Text>
          <Text style={styles.tipText}>• ตรวจสอบว่า Backend รันอยู่ที่ port 3000</Text>
          <Text style={styles.tipText}>• ตรวจสอบ Windows Firewall อนุญาต port 3000</Text>
          <Text style={styles.tipText}>• ใช้ IP: 10.214.162.160:3000 สำหรับการเชื่อมต่อหลัก</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  urlText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusIndicator: {
    marginLeft: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    marginBottom: 8,
  },
  resultUrl: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workingUrlContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  workingUrlTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8,
  },
  workingUrlText: {
    fontSize: 14,
    color: '#155724',
    fontFamily: 'monospace',
  },
  tipsContainer: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  tipText: {
    fontSize: 14,
    color: '#004085',
    marginBottom: 8,
    lineHeight: 20,
  },
});

