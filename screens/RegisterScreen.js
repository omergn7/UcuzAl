import React, { useState } from 'react';
import { API_BASE_URL } from '@env';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  const [isim, setIsim] = useState('');
  const [soyisim, setSoyisim] = useState('');
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [telefonNo, setTelefonNo] = useState('');
  const [kimlikNo, setKimlikNo] = useState('');
  const [adres, setAdres] = useState('');

  const handleRegister = async () => {
    if (!isim || !soyisim || !email || !parola || !telefonNo) {
      Alert.alert("Eksik Bilgi", "Lütfen * işaretli tüm alanları doldurun.");
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert("Geçersiz E-mail", "Geçerli bir e-posta adresi girin.");
      return;
    }

    if (parola.length < 6) {
      Alert.alert("Kısa Parola", "Parola en az 6 karakter olmalı.");
      return;
    }

    const telefonRegex = /^05\d{9}$/;
    if (!telefonRegex.test(telefonNo)) {
      Alert.alert("Hatalı Telefon", "Telefon numarasını 05xx xxx xxxx formatında girin.");
      return;
    }

    if (kimlikNo && kimlikNo.length !== 11) {
      Alert.alert("Hatalı TC", "TC Kimlik numarası 11 haneli olmalıdır.");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/kullanici/kayit`, {
        isim,
        soyisim,
        email,
        parola,
        telefon_no: telefonNo,
        kimlik_no: kimlikNo || null,
        adres: adres || null,
      });

      Alert.alert("Başarılı", "Hesabınız oluşturuldu");
      navigation.replace('LoginScreen');
    } catch (error) {
      Alert.alert("Hata", error.response?.data || "Sunucu hatası");
    }
  };

  return (
    <LinearGradient colors={['#ffffff', '#f5f5f5', '#ffffff']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Hesap Oluştur</Text>

          {[ 
            ['*İsim', isim, setIsim, false],
            ['*Soyisim', soyisim, setSoyisim, false],
            ['*Email (örnek: kullanici@example.com)', email, setEmail, false],
            ['*Parola (en az 6 karakter)', parola, setParola, true],
            ['*Telefon No (örnek: 05xx xxx xxxx)', telefonNo, setTelefonNo, false],
            ['Kimlik No (opsiyonel)', kimlikNo, setKimlikNo, false],
            ['Adres (opsiyonel)', adres, setAdres, false],
          ].map(([placeholder, value, setter, isPassword], index) => (
            <TextInput
              key={index}
              placeholder={placeholder}
              value={value}
              onChangeText={setter}
              placeholderTextColor="#666"
              secureTextEntry={isPassword}
              style={styles.input}
            />
          ))}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <LinearGradient colors={['#000000', '#333333']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Zaten bir hesabım var</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60, // ✔ başlığı aşağı itmek için
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000000',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
});
