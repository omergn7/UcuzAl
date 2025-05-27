import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@env';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const COLORS = {
  background: '#f5f6fa',
  primary: '#2ecc71',
  white: '#fff',
  text: '#2d3436',
};

const MarketCard = ({ item }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={[styles.marketCard, { backgroundColor: '#ffffff' }]}
      onPress={() => navigation.navigate('MarketProducts', { marketId: item.marketId })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.marketGorsel }}
          style={styles.marketImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.marketNameContainer}>
        <Text style={styles.marketName}>{item.marketName}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/marketler`)
      .then(res => res.json())
      .then(setMarketData)
      .catch(err => console.error('Market verisi alinamadi', err));
  }, []);

  const renderMarketGrid = () => (
    <View style={styles.marketGrid}>
      {marketData.map((item) => (
        <View key={item.marketId} style={styles.gridItem}>
          <MarketCard item={item} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.sliderContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Image
              source={{ uri: 'https://img.freepik.com/free-photo/shopping-cart-filled-with-coins-copy-space_23-2148305919.jpg' }}
              style={styles.sliderImage}
            />
            <Image
              source={{ uri: 'https://img.freepik.com/premium-photo/sale-discount-banner_88281-1663.jpg' }}
              style={styles.sliderImage}
            />
            <Image
              source={{ uri: 'https://img.freepik.com/premium-vector/shopping-concept-illustration_23-2148474173.jpg' }}
              style={styles.sliderImage}
            />
          </ScrollView>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Merhaba!</Text>
          <Text style={styles.welcomeText}>
            Bugün akıllı alışveriş yaparak tasarruf etmeye hazır mısınız? En uygun fiyatlı 
            ürünleri sizin için bulalım!
          </Text>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Marketler</Text>
        </View>

        {renderMarketGrid()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sliderContainer: {
    marginTop: 10,
    height: 180,
  },
  sliderImage: {
    width: width * 0.9,
    height: 180,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  sectionTitleContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  marketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  gridItem: {
    width: '48%',
    marginBottom: 15,
  },
  marketCard: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
  },
  marketImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  marketNameContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
