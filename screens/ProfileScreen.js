import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const userInfo = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    totalSavings: '1.250 TL',
    favoriteProducts: [
      { id: '1', name: 'Süt', savings: '15 TL' },
      { id: '2', name: 'Ekmek', savings: '5 TL' },
      { id: '3', name: 'Yumurta', savings: '20 TL' },
    ],
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      setScanning(false);
      Alert.alert('Barkod Okundu', `Tip: ${type}\nKod: ${data}`);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Kamera izni isteniyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Kamera izni reddedildi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'qr', 'code128'],
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setScanning(false)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView>
          <View style={styles.header}>
            <Image
              style={styles.avatar}
              source={{ uri: 'https://via.placeholder.com/150' }}
            />
            <Text style={styles.name}>{userInfo.name}</Text>
            <Text style={styles.email}>{userInfo.email}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statAmount}>{userInfo.totalSavings}</Text>
              <Text style={styles.statLabel}>Toplam Tasarruf</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favori Ürünlerim</Text>
            {userInfo.favoriteProducts.map((product) => (
              <View key={product.id} style={styles.favoriteItem}>
                <Ionicons name="star" size={24} color="#f1c40f" />
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.savings}>Tasarruf: {product.savings}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              setScanned(false);
              setScanning(true);
            }}
          >
            <Ionicons name="barcode" size={28} color="white" />
            <Text style={styles.scanButtonText}>Barkod Tara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Ionicons name="settings-outline" size={24} color="#2ecc71" />
            <Text style={styles.settingsText}>Ayarlar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* AYARLAR MODAL */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ayarlar</Text>

            <TouchableOpacity style={styles.modalButton} onPress={() => alert('Yardım')}>
              <Ionicons name="help-circle-outline" size={20} color="#2ecc71" />
              <Text style={styles.modalButtonText}>Yardım</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={() => alert('Destek')}>
              <Ionicons name="call-outline" size={20} color="#2ecc71" />
              <Text style={styles.modalButtonText}>Destek</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={() => alert('Çıkış yapılıyor...')}>
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={[styles.modalButtonText, { color: 'red' }]}>Çıkış Yap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { marginTop: 20 }]}
              onPress={() => setShowSettingsModal(false)}
            >
              <Ionicons name="close-outline" size={20} color="#2d3436" />
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#2d3436' },
  email: { fontSize: 16, color: '#636e72' },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'center',
  },
  statBox: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 150,
  },
  statAmount: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  statLabel: { fontSize: 14, color: 'white', marginTop: 5 },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#2d3436' },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: { flex: 1, marginLeft: 10, fontSize: 16 },
  savings: { color: '#2ecc71', fontWeight: 'bold' },
  scanButton: {
    backgroundColor: '#000000',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanButtonText: { color: 'white', fontSize: 18, marginLeft: 10 },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
  },
  settingsText: { marginLeft: 10, fontSize: 16, color: '#2d3436' },
  cameraContainer: { flex: 1, position: 'relative' },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000000',
  },
});
