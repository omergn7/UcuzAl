import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CompareScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [urun, setUrun] = useState(null);
  const scannedOnceRef = useRef(false);

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
      const response = await fetch(`http://10.0.17.32:8080/api/urunler/karsilastir?barkod=${barkod}`);
      const json = await response.json();

      if (json?.urunAdi) {
        const sorted = [...json.karsilastirma].sort((a, b) => a.fiyat - b.fiyat);
        setUrun({
          urunAdi: json.urunAdi,
          urunGorsel: json.urunGorsel || null,
          barkod: json.barkod,
          ulke: json.ulke || "Bilinmiyor",
          bayrak: json.bayrak || "🏳️",
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

  const renderFiyatKarsilastirma = () => {
    if (!urun || !urun.karsilastirma || urun.karsilastirma.length === 0) return null;

    const enUcuzFiyat = urun.karsilastirma[0].fiyat;

    return urun.karsilastirma.map((k, index) => {
      const farkYuzde = ((k.fiyat - enUcuzFiyat) / enUcuzFiyat) * 100;

      let cardStyle = styles.marketCard;
      if (index === 0) cardStyle = [styles.marketCard, styles.enUcuzCard];
      else if (farkYuzde <= 5) cardStyle = [styles.marketCard, styles.ortaPahaliCard];
      else cardStyle = [styles.marketCard, styles.pahaliCard];

      const logo = getMarketLogo(k.market);

      return (
        <View key={index} style={cardStyle}>
          <View style={styles.marketRow}>
            {logo && <Image source={{ uri: logo }} style={styles.marketLogoLarge} />}
            <View style={styles.marketInfo}>
              <Text style={styles.marketText}>{k.market}</Text>
              <Text style={styles.fiyatText}>{k.fiyat.toFixed(2)} ₺</Text>
              {index > 0 && (
                <Text style={styles.yuzdeText}>%{farkYuzde.toFixed(1)} daha pahalı</Text>
              )}
            </View>
          </View>
        </View>
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
  ulkeText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 12,
  },
  marketCard: {
    backgroundColor: '#f0f0f0', padding: 15,
    borderRadius: 10, width: '90%', marginBottom: 10,
    alignItems: 'center'
  },
  enUcuzCard: { backgroundColor: '#d1f7c4' },
  ortaPahaliCard: { backgroundColor: '#fff7cc' },
  pahaliCard: { backgroundColor: '#ffd6d6' },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  marketLogoLarge: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  marketInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  marketText: { fontSize: 16, fontWeight: 'bold' },
  fiyatText: { fontSize: 16 },
  yuzdeText: { fontSize: 14, color: '#555', marginTop: 4 },
});
