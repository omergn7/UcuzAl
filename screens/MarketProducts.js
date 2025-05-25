import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
export default function MarketProducts({ route }) {
  const flagMap = {
    'TÜRKİYE': '🇹🇷',
    'ALMANYA': '🇩🇪',
    'POLONYA': '🇵🇱',
    'FRANSA': '🇫🇷',
    'İTALYA': '🇮🇹',
    'İSPANYA': '🇪🇸',
    'ABD': '🇺🇸',
  };
  const { marketId } = route.params;
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // ✅ BURAYA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://10.0.17.81:8080/api/market-urun/ozet/${marketId}`, {
          timeout: 10000
        });

        // null/undefined barkodId'leri filtrele
        const temizUrunler = response.data.filter(item => item.barkodId != null);
        setUrunler(temizUrunler);
      } catch (error) {
        console.error('Ürünleri çekerken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [marketId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (!urunler.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Ürün bulunamadı.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const ulke = item.ulkeAdi?.toUpperCase();
    const bayrak = flagMap[ulke] || '🌍';
  
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate('UrunDetay', {
            barkodId: item.barkodId,
            fiyat: item.fiyat,
          });
        }}
      >
        <View style={styles.flagBox}>
          <Text style={styles.flagText}>{bayrak} {ulke}</Text>
        </View>
  
        <Image source={{ uri: item.urunGorsel }} style={styles.image} />
  
        <View style={styles.info}>
          <Text style={styles.name}>{item.urunName}</Text>
          <Text style={styles.price}>{item.fiyat} TL</Text>
        </View>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <FlatList
  data={urunler}
  numColumns={2} // ⭐️ 2’li kare grid görünüm
  keyExtractor={(item, index) => `${item.barkodId}-${item.fiyat}-${index}`}
  renderItem={renderItem}
  contentContainerStyle={styles.gridContainer}
/>


    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  card: {
    width: (width - 40) / 2, // 2 kolon için ekranı böl
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 5,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    borderRadius: 8,
    marginBottom: 10,
  },
  info: {
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  price: {
    fontSize: 13,
    color: '#2ecc71',
    marginTop: 4,
  },
  flagBox: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  flagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  
});

