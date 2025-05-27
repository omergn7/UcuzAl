import React, { useState, useEffect, useRef } from 'react';
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

  const getMarketLogo = (marketAdi) => {
    const lower = marketAdi.toLowerCase();
    if (lower.includes("migros")) {
      return "https://sdgmapturkey.com/wp-content/uploads/migros-logo.png";
    } else if (lower.includes("şok") || lower.includes("sok")) {
      return "https://yt3.googleusercontent.com/NgTIYRRcD-9-bUsRBVsx6SXykTtWj8A9drDFsj9Vvh2n8MG8F_2M_Ghj8pgOCKXitXzXMDEbFx8=s900-c-k-c0x00ffffff-no-rj";
    }
    return null;
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scannedOnceRef.current) return;

    scannedOnceRef.current = true;
    setScanned(true);
    setScanning(false);

    const match = data.match(/\b\d{8}\b/);
    if (!match) {
      scannedOnceRef.current = false;
      return;
    }

    const barkod = match[0];
    try {
      const response = await fetch(`http://10.0.18.202:8080/api/urunler/karsilastir?barkod=${barkod}`);
      const json = await response.json();

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

      await fetch('http://10.0.18.202:8080/api/kullanici/tasarruf-ekle', {
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
        const response = await axios.post('http://10.0.18.202:8080/api/tasarruf/ekle', {
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

      const logo = getMarketLogo(k.market);

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
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraContainer: { flex: 1, position: 'relative' },
  closeButton: {
    position: 'absolute', top: 40, right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20
  },
  scanButton: {
    backgroundColor: '#000', padding: 16,
    borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', marginTop: 20
  },
  scanButtonText: { color: 'white', fontSize: 18, marginLeft: 10 },
  content: { alignItems: 'center', padding: 20 },
  resultContainer: { marginTop: 30, width: '100%', alignItems: 'center' },
  urunBaslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  urunGorsel: { width: 120, height: 120, resizeMode: 'contain', marginBottom: 10 },
  ulkeText: { fontSize: 16, fontStyle: 'italic', color: '#555', marginBottom: 12 },
  marketCard: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 12,
    width: '90%',
    marginBottom: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  enUcuzCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  ortaPahaliCard: { backgroundColor: '#fff7cc' },
  pahaliCard: { backgroundColor: '#ffd6d6' },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  marketLogoLarge: {
    width: 40, height: 40,
    resizeMode: 'contain', marginRight: 12,
    borderRadius: 6, backgroundColor: '#fff'
  },
  marketInfo: { flex: 1, justifyContent: 'center' },
  marketText: { fontSize: 16, fontWeight: 'bold' },
  fiyatText: { fontSize: 16 },
  yuzdeText: { fontSize: 14, color: '#555', marginTop: 4 },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cheapestBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  confirmationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmationTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  confirmationText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  savingsText: {
    color: '#4caf50',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
