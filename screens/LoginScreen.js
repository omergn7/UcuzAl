import React, { useState } from 'react';
import {
  View, TextInput, Button, Text, Alert, StyleSheet
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://10.0.17.32:8080/api/kullanici/giris', {
        email,
        parola
      });

      await AsyncStorage.setItem('kullanici', JSON.stringify(res.data));
      navigation.replace('MainTabs');
    } catch (error) {
      Alert.alert('Giriş Başarısız', error.response?.data || 'Sunucu hatası');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş Yap</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Parola"
        value={parola}
        onChangeText={setParola}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Giriş Yap" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});


