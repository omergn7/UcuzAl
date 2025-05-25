import React, { useState } from 'react';
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
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() !== '') {
      setShoppingList([...shoppingList, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (item) => {
    setShoppingList(shoppingList.filter((i) => i !== item));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Yeni ürün ekle"
            value={newItem}
            onChangeText={setNewItem}
            style={styles.input}
            placeholderTextColor="#000000"
            color="#000000"
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <FlatList
  data={shoppingList}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listText}>{item}</Text>
      <TouchableOpacity onPress={() => removeItem(item)}>
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  )}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color="#000000" />
      <Text style={styles.emptyText}>Alışveriş listeniz boş</Text>
    </View>
  }
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={{ paddingBottom: 20 }}
/>

      </View>
    </KeyboardAvoidingView>
  );
};

export default function FavoritesScreen() {
  const [index, setIndex] = useState(1);
  const [routes] = useState([
    { key: 'favorites', title: 'Favoriler' },
    { key: 'shopping', title: 'Alışveriş Listesi' },
  ]);

  const renderScene = SceneMap({
    favorites: FavoritesRoute,
    shopping: ShoppingRoute,
  });

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
            indicatorStyle={{ backgroundColor: '#000000' }}
            style={{ backgroundColor: '#000000' }}
            renderLabel={({ route, focused }) => (
              <Text
                style={{
                  color: focused ? '#fff' : '#000000',
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
  
});