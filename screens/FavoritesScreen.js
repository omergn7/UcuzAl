import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Ionicons from '@expo/vector-icons/Ionicons';

const initialLayout = { width: Dimensions.get('window').width };

const FavoritesRoute = () => {
  const favoriteData = [];

  return (
    <View style={styles.content}>
      {favoriteData.length === 0 ? (
        <Text style={styles.emptyText}>Henüz favori ürününüz bulunmuyor</Text>
      ) : (
        <FlatList
          data={favoriteData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text>{item.name}</Text>}
        />
      )}
    </View>
  );
};

const ShoppingRoute = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const searchProducts = async (text) => {
    setSearchText(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://172.20.10.2:8080/api/urunler/search?query=${text}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Arama hatası:', error);
    }
  };

  const addItem = (item) => {
    const exists = shoppingList.some(i => i.id === item.id);
    if (!exists) {
      setShoppingList([...shoppingList, item]);
    }
    setSearchText('');
    setSearchResults([]);
  };

  const removeItem = (item) => {
    setShoppingList(shoppingList.filter((i) => i.id !== item.id));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.alisverisContainer}
    >
      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün ara..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={searchProducts}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchText('');
                setSearchResults([]);
              }} 
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {searchResults.length > 0 && (
        <Animated.View 
          style={[
            styles.searchResultsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => addItem(item)}
              >
                <Image
                  source={{ uri: item.urunGorsel }}
                  style={styles.searchResultImage}
                  resizeMode="contain"
                />
                <View style={styles.searchResultContent}>
                  <Text style={styles.searchResultName}>{item.name}</Text>
                  <Text style={styles.searchResultMarket}>{item.market}</Text>
                </View>
                <Text style={styles.searchResultPrice}>₺{item.price}</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}

      <Animated.FlatList
        data={shoppingList}
        keyExtractor={(item) => item.id.toString()}
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.card}>
              <Image
                source={{ uri: item.urunGorsel }}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={styles.urunInfo}>
                    <Text style={styles.urunAdi}>{item.name}</Text>
                    <Text style={styles.marketAdi}>{item.market}</Text>
                  </View>
                  <View style={styles.fiyatContainer}>
                    <Text style={styles.fiyat}>₺{item.price}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeItem(item)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Animated.View 
            style={[
              styles.emptyContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyText}>Henüz alışveriş listesi oluşturulmamış</Text>
          </Animated.View>
        }
      />
    </KeyboardAvoidingView>
  );
};

export default function FavoritesScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'favorites', title: 'Favoriler' },
    { key: 'shopping', title: 'Alışveriş Listesi' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'favorites':
        return <FavoritesRoute />;
      case 'shopping':
        return <ShoppingRoute />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#ffffff' }}
            style={{ backgroundColor: '#000000' }}
            renderLabel={({ route, focused }) => (
              <Text
                style={{
                  color: focused ? '#ffffff' : '#999999',
                  fontWeight: focused ? 'bold' : 'normal',
                  fontSize: 16,
                }}
              >
                {route.title}
              </Text>
            )}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginTop: 30,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#008b00',
  },
  listText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    color: '#000000',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden', // ❗ Dışa taşmayı engeller
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },  
  searchItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#000',
  },  
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },  
  addButton: {
    backgroundColor: '#000000',
    marginLeft: 10,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  alisverisContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 15,
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  urunInfo: {
    flex: 1,
    marginRight: 10,
  },
  urunAdi: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  marketAdi: {
    fontSize: 14,
    color: '#666',
  },
  fiyatContainer: {
    alignItems: 'flex-end',
  },
  fiyat: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  birim: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detayText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchResultsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultContent: {
    flex: 1,
    marginRight: 10,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  searchResultMarket: {
    fontSize: 14,
    color: '#666',
  },
  searchResultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  removeButton: {
    padding: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  searchResultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
});