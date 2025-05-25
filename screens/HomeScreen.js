import React from 'react';
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

const COLORS = {
  background: '#f5f6fa',
  primary: '#2ecc71',
  white: '#fff',
  text: '#2d3436',
};

const marketData = [
  {
    id: 1,
    name: 'Migros',
    image: 'https://sdgmapturkey.com/wp-content/uploads/migros-logo.png',
    backgroundColor: '#ffeaa7',
  },
  {
    id: 2,
    name: 'ŞOK',
    image: 'https://yt3.googleusercontent.com/NgTIYRRcD-9-bUsRBVsx6SXykTtWj8A9drDFsj9Vvh2n8MG8F_2M_Ghj8pgOCKXitXzXMDEbFx8=s900-c-k-c0x00ffffff-no-rj',
    backgroundColor: '#fab1a0',
  },
  {
    id: 3,
    name: 'A101',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/A101_logo.svg',
    backgroundColor: '#81ecec',
  },
];

const { width } = Dimensions.get('window');

const MarketCard = ({ item }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={[styles.marketCard, { backgroundColor: item.backgroundColor }]}
      onPress={() => navigation.navigate('MarketProducts', { marketId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.marketImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.marketNameContainer}>
        <Text style={styles.marketName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const renderMarketGrid = () => {
    return (
      <View style={styles.marketGrid}>
        {marketData.map((item) => (
          <View key={item.id} style={styles.gridItem}>
            <MarketCard item={item} />
          </View>
        ))}
      </View>
    );
  };

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
  headerImageContainer: {
    backgroundColor: COLORS.primary,
    width: width,
    height: 200,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sliderContainer: {
    marginTop: 10,
    height: 180,
  },
  sliderImage: {
    width: Dimensions.get('window').width * 0.9,
    height: 180,
    borderRadius: 10,
    marginHorizontal: 10,
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