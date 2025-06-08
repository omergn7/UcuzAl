import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@env';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function CompareScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [urun, setUrun] = useState(null);
  const scannedOnceRef = useRef(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const shakeAnimation = new Animated.Value(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);


  const handleBarCodeScanned = async ({ type, data }) => {
    console.log("📷 Barkod tarandı:", data);

    if (scannedOnceRef.current) return;

    scannedOnceRef.current = true;
    setScanned(true);
    setScanning(false);

    const match = data.match(/\d{8,14}/);

    if (!match) {
      scannedOnceRef.current = false;
      return;
    }

    const barkod = match[0];
    try {
      const response = await fetch(`${API_BASE_URL}/api/urunler/karsilastir?barkod=${barkod}`);
      const json = await response.json();

      console.log("🎯 Backend cevabı:", json);

      if (json?.urunAdi) {
        const sorted = [...json.karsilastirma].sort((a, b) => a.fiyat - b.fiyat);
        setUrun({
          urunAdi: json.urunAdi,
          urunGorsel: json.urunGorsel || null,
          barkod: json.barkod,
          ulke: json.ulke || "Bilinmiyor",
          bayrak: json.bayrak || "\ud83c\udff3\ufe0f",
          karsilastirma: sorted,
        });
      } else {
        setUrun(null);
      }
    } catch (err) {
      console.error('Hata:', err);
      setUrun(null);
    } finally {
      setScanned(false);
      scannedOnceRef.current = false;
    }
  };

  const handleAldiMi = async (enUcuzIndex) => {
    if (!urun || !urun.karsilastirma || urun.karsilastirma.length < 2) return;

    const enUcuzFiyat = urun.karsilastirma[enUcuzIndex].fiyat;
    const enPahaliFiyat = urun.karsilastirma[urun.karsilastirma.length - 1].fiyat;
    const fark = enPahaliFiyat - enUcuzFiyat;

    if (fark <= 0) return;

    const onay = await new Promise((resolve) => {
      Alert.alert(
        "Ürünü aldınız mı?",
        `Bu ürünü gerçekten ${enUcuzFiyat.toFixed(2)}₺'ye aldınız mı?\nTasarruf: ${fark.toFixed(2)}₺`,
        [
          { text: "İptal", style: "cancel", onPress: () => resolve(false) },
          { text: "Evet", onPress: () => resolve(true) },
        ]
      );
    });

    if (!onay) return;

    try {
      const storedUser = await AsyncStorage.getItem("kullanici");
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      const yeniToplam = (parseFloat(parsed.toplamTasarruf || 0) + fark).toFixed(2);
      const yeniAylik = (parseFloat(parsed.aylikTasarruf || 0) + fark).toFixed(2);

      parsed.toplamTasarruf = yeniToplam;
      parsed.aylikTasarruf = yeniAylik;

      await AsyncStorage.setItem("kullanici", JSON.stringify(parsed));

      await fetch(`${API_BASE_URL}/api/kullanici/tasarruf-ekle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kullanici_id: parsed.kullanici_id,
          fark: fark
        })
      });

      Alert.alert("🎉 Tebrikler!", `Tasarruf ettiniz: ${fark.toFixed(2)}₺`);
      setUrun(null);
    } catch (e) {
      console.error("Tasarruf güncellenirken hata:", e);
    }
  };

  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ]).start();
  };

  const handleProductPress = (product) => {
    if (showConfirmation) {
      setShowConfirmation(false);
      setSelectedProduct(null);
    } else {
      setSelectedProduct(product);
      setShowConfirmation(true);
    }
  };

  const handleConfirm = async () => {
    try {
      const userData = await AsyncStorage.getItem('kullanici');
      if (userData) {
        const user = JSON.parse(userData);
        const response = await axios.post(`${API_BASE_URL}/api/tasarruf/ekle`, {
          kullaniciId: user.id,
          urunId: selectedProduct.id,
          tasarrufMiktari: selectedProduct.tasarruf
        });
        
        if (response.data) {
          // Başarılı işlem sonrası
          setShowConfirmation(false);
          setSelectedProduct(null);
        }
      }
    } catch (error) {
      console.error('Tasarruf eklenirken hata:', error);
    }
  };

  const handleReject = () => {
    setShowConfirmation(false);
    setSelectedProduct(null);
  };

  useEffect(() => {
    if (urun && urun.karsilastirma.length > 0) {
      startShakeAnimation();
    }
  }, [urun]);

  const renderFiyatKarsilastirma = () => {
    if (!urun || !urun.karsilastirma || urun.karsilastirma.length === 0) return null;

    const enUcuzFiyat = urun.karsilastirma[0].fiyat;

    return urun.karsilastirma.map((k, index) => {
      const farkYuzde = ((k.fiyat - enUcuzFiyat) / enUcuzFiyat) * 100;
      const isCheapest = index === 0;

      let cardStyle = [styles.marketCard];
      if (isCheapest) {
        cardStyle = [
          styles.marketCard,
          styles.enUcuzCard,
          { transform: [{ translateX: shakeAnimation }] }
        ];
      } else if (farkYuzde <= 5) {
        cardStyle = [styles.marketCard, styles.ortaPahaliCard];
      } else {
        cardStyle = [styles.marketCard, styles.pahaliCard];
      }

      const logo = k.marketGorsel;


      return (
        <Animated.View key={index} style={cardStyle}>
          <TouchableOpacity
            style={styles.marketRow}
            onPress={() => isCheapest && handleProductPress(k)}
          >
            {logo && <Image source={{ uri: logo }} style={styles.marketLogoLarge} />}
            <View style={styles.marketInfo}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketText}>{k.market}</Text>
                {isCheapest && (
                  <View style={styles.cheapestBadge}>
                    <Text style={styles.cheapestText}>En Ucuz</Text>
                  </View>
                )}
              </View>
              <Text style={styles.fiyatText}>{k.fiyat.toFixed(2)} ₺</Text>
              {!isCheapest && (
                <Text style={styles.yuzdeText}>%{farkYuzde.toFixed(1)} daha pahalı</Text>
              )}
            </View>
          </TouchableOpacity>

          {showConfirmation && isCheapest && (
            <View style={styles.confirmationOverlay}>
              <View style={styles.confirmationContent}>
                <View style={styles.confirmationTextContainer}>
                  <Text style={styles.confirmationText}>
                    Bu ürünü {k.fiyat.toFixed(2)}₺'ye aldınız mı?
                  </Text>
                  <Text style={styles.savingsText}>
                    Tasarruf: {(urun.karsilastirma[urun.karsilastirma.length - 1].fiyat - k.fiyat).toFixed(2)}₺
                  </Text>
                </View>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity 
                    style={[styles.confirmButton, styles.acceptButton]} 
                    onPress={() => handleAldiMi(index)}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.confirmButton, styles.rejectButton]} 
                    onPress={handleReject}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      );
    });
  };

  if (hasPermission === null) {
    return <View style={styles.centered}><Text>Kamera izni isteniyor...</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.centered}><Text style={{ color: 'red' }}>Kamera izni reddedildi</Text></View>;
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <View style={styles.cameraContainer}>
          <CameraView
            key={scanning ? 'scanner-active' : 'scanner-idle'}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'qr'] }}
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity style={styles.closeButton} onPress={() => setScanning(false)}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => {
              setScanned(false);
              scannedOnceRef.current = false;
              setScanning(true);
              setUrun(null);
            }}>
            <Ionicons name="barcode" size={28} color="white" />
            <Text style={styles.scanButtonText}>Barkod Tara</Text>
          </TouchableOpacity>

          {urun && (
            <View style={styles.resultContainer}>
              <Text style={styles.urunBaslik}>{urun.urunAdi}</Text>
              {urun.urunGorsel && (
                <Image source={{ uri: urun.urunGorsel }} style={styles.urunGorsel} />
              )}
              {urun.ulke && (
                <Text style={styles.ulkeText}>
                  Menşei: {urun.bayrak} {urun.ulke}
                </Text>
              )}
              {renderFiyatKarsilastirma()}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  cameraContainer: { 
    flex: 1, 
    position: 'relative',
    backgroundColor: '#000'
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButton: {
    backgroundColor: '#000000',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
    justifyContent: 'center',
    shadowColor: '#2196f3', // daha görünür bir gölge
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1.2,
    shadowRadius: 10,
    elevation: 8,
  },
  scanButtonText: { 
    color: 'white', 
    fontSize: 18, 
    marginLeft: 10,
    fontWeight: '600'
  },
  content: { 
    alignItems: 'center', 
    padding: 20,
    paddingTop: 30
  },
  resultContainer: {
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#2196f3', // daha görünür bir gölge
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  urunBaslik: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center',
    color: '#2c3e50'
  },
  urunGorsel: { 
    width: 150, 
    height: 150, 
    resizeMode: 'contain', 
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff'
  },
  ulkeText: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    color: '#666', 
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  marketCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '90%',
    marginBottom: 15,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee'
  },
  enUcuzCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4caf50',
    transform: [{ scale: 1.02 }]
  },
  ortaPahaliCard: { 
    backgroundColor: '#fff8e1',
    borderColor: '#ffc107'
  },
  pahaliCard: { 
    backgroundColor: '#ffebee',
    borderColor: '#f44336'
  },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  marketLogoLarge: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 5
  },
  marketInfo: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  marketText: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  fiyatText: { 
    fontSize: 20,
    fontWeight: '600',
    color: '#2196f3',
    marginTop: 4
  },
  yuzdeText: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 4,
    fontStyle: 'italic'
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cheapestBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#4caf50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cheapestText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  confirmationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
  },
  confirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 16,
  },
  confirmationTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  confirmationText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  savingsText: {
    color: '#4caf50',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
});
