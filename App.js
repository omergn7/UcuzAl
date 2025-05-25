import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Sayfa bileşenleri
import HomeScreen from './screens/HomeScreen';
import CompareScreen from './screens/CompareScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import MarketProducts from './screens/MarketProducts'; // ✅ Detay ekran

// Navigatorlar
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Ana Sayfa') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Karşılaştır') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Favoriler') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Karşılaştır" component={CompareScreen} />
      <Tab.Screen name="Favoriler" component={FavoritesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Alt menü tab'ları */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Market ürün detay ekranı */}
        <Stack.Screen
          name="MarketProducts"
          component={MarketProducts}
          options={{ title: 'Market Ürünleri' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
