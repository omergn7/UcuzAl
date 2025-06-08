// 📄 ChatbotScreen.js (güncellenmiş - sağlık verisi API'den alınır, yorumlar renklidir)
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatbotScreen() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [kullaniciVerisi, setKullaniciVerisi] = useState(null);

  useEffect(() => {
    const fetchSaglikVerisi = async () => {
      const stored = await AsyncStorage.getItem("kullanici");
      if (!stored) return;
      const parsed = JSON.parse(stored);

      try {
        const response = await axios.get(`http://localhost:8080/api/saglik/getir?kullaniciId=${parsed.kullanici_id}`);
        const saglik = response.data;
        const guncelKullanici = {
          ...parsed,
          hastaliklar: saglik.hastaliklar,
          alerjenler: saglik.alerjenler
        };
        await AsyncStorage.setItem("kullanici", JSON.stringify(guncelKullanici));
        setKullaniciVerisi(guncelKullanici);
      } catch (err) {
        console.error("Sağlık bilgisi alınamadı:", err);
      }
    };
    fetchSaglikVerisi();
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    if (!kullaniciVerisi) {
      Alert.alert("Hata", "Kullanıcı bilgisi alınamadı.");
      return;
    }

    const payload = {
      hastaliklar: kullaniciVerisi.hastaliklar || [],
      alerjenler: kullaniciVerisi.alerjenler || []
    };

    try {
      const response = await axios.post(`http://localhost:8080/api/ai/yorum?urunId=${userInput}`, payload);
      const yeniMesaj = {
        key: Date.now().toString(),
        urun: response.data.urun,
        yorumlar: response.data.yorumlar
      };
      setChatHistory([...chatHistory, yeniMesaj]);
      setUserInput('');
    } catch (error) {
      console.error("Hata:", error);
      Alert.alert("Hata", error.response?.data?.error || "Bir şeyler yanlış gitti");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chatHistory}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <Text style={styles.urunName}>{item.urun}</Text>
            {item.yorumlar.map((y, idx) => {
              const isOlumlu = y.includes("✅");
              const isUyari = y.includes("⚠️");
              const kutuStyle = isUyari
                ? styles.uyariBox
                : isOlumlu
                  ? styles.olumluBox
                  : styles.olumsuzBox;

              return (
                <View key={idx} style={[styles.yorumBox, kutuStyle]}>
                  <Text style={styles.yorumText}>{y}</Text>
                </View>
              );
            })}
          </View>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ürün ID gir (örn: 10508)"
          value={userInput}
          onChangeText={setUserInput}
          keyboardType="numeric"
        />
        <Button title="Gönder" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#f0f0f0'
  },
  messageContainer: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 10
  },
  urunName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5
  },
  yorumBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 5
  },
  olumluBox: {
    backgroundColor: '#d0f0c0'
  },
  olumsuzBox: {
    backgroundColor: '#fcdede'
  },
  uyariBox: {
    backgroundColor: '#fff3cd'
  },
  yorumText: {
    fontSize: 14
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10
  }
});
