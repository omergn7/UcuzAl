import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CompareScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      setScanning(false);
      Alert.alert('Barkod Okundu', `Tip: ${type}\nKod: ${data}`);
      // Buraya API'ye gönderme yapılabilir
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
              barcodeTypes: [
                'qr',
                'ean8',
                'ean13',
                'upc_a',
                'upc_e',
                'code128',
                'code39',
                'code93',
                'itf14',
                'pdf417',
                'aztec',
                'datamatrix',
              ],
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
            <Text style={styles.title}>Fiyat Karşılaştırma</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Ürünleri karşılaştırmak için barkodu okutun
            </Text>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                setScanned(false);
                setScanning(true);
              }}
            >
              <Ionicons name="barcode" size={32} color="white" />
              <Text style={styles.scanButtonText}>Barkod Tara</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  scanButton: {
    backgroundColor: '#000000',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    marginTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
