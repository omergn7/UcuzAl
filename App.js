import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Sayfalar
import HomeScreen from './screens/HomeScreen';
import CompareScreen from './screens/CompareScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MarketProducts from './screens/MarketProducts';
import UrunDetay from './screens/UrunDetay';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Alt sekmeler (giriş gerekmeyenler dahil)
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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Ana sekmeler */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Profil yönlendirmeler */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Ürün detay ve market ürünleri */}
        <Stack.Screen name="MarketProducts" component={MarketProducts} options={{ headerShown: true, title: 'Market Ürünleri' }} />
        <Stack.Screen name="UrunDetay" component={UrunDetay} options={{ headerShown: true, title: 'Ürün Detayı' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
