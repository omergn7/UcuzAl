import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';

export default function UrunDetay({ route }) {
  const flagMap = {
    'TÜRKİYE': '🇹🇷',
    'ALMANYA': '🇩🇪',
    'POLONYA': '🇵🇱',
    'FRANSA': '🇫🇷',
    'İTALYA': '🇮🇹',
    'İSPANYA': '🇪🇸',
    'ABD': '🇺🇸',
    // Diğerleri gerekiyorsa buraya eklenir
  };

  const { barkodId, fiyat } = route.params;
  const [urun, setUrun] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://10.0.17.32:8080/api/urunler/detay/${barkodId}`, { timeout: 10000 })
      .then(response => setUrun(response.data))
      .catch(err => console.error('Detay hatası:', err))
      .finally(() => setLoading(false));
  }, [barkodId]);


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (!urun) {
    return (
      <View style={styles.loader}>
        <Text>Ürün bilgisi bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: urun.urunGorsel }} style={styles.image} />

      <Text style={styles.name}>{urun.urunName}</Text>
    

      <Text style={styles.meta}>📦 Kategori: {urun.kategoriAdi} | Ülke: {flagMap[urun.ulkeAdi?.toUpperCase()] || '🌍'} {urun.ulkeAdi}</Text>
      <Text style={styles.price}>💰 Fiyat: {fiyat} TL</Text>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Besin Değerleri (100g):</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Enerji</Text>
            <Text style={styles.cellValue}>{urun.enerjiKcal} kcal</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Yağ</Text>
            <Text style={styles.cellValue}>{urun.yag} g</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Doymuş Yağ</Text>
            <Text style={styles.cellValue}>{urun.doymusYag} g</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Karbonhidrat</Text>
            <Text style={styles.cellValue}>{urun.karbonhidrat} g</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Şeker</Text>
            <Text style={styles.cellValue}>{urun.seker} g</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Protein</Text>
            <Text style={styles.cellValue}>{urun.protein} g</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.cellTitle}>Tuz</Text>
            <Text style={styles.cellValue}>{urun.tuz} g</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İçindekiler:</Text>
        <View style={styles.icerikBox}>
          <Text style={styles.icerikText}>{urun.urunIcerik}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width - 32,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    color: '#2ecc71',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2d3436',
  },
  table: {
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.7,
    borderBottomColor: '#dcdde1',
  },
  cellTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#2d3436',
  },
  cellValue: {
    fontSize: 15,
    color: '#2d3436',
  },
  icerikBox: {
    backgroundColor: '#fceae8',
    padding: 12,
    borderRadius: 8,
  },
  icerikText: {
    fontSize: 15,
    color: '#2d3436',
    lineHeight: 22,
  },
});
