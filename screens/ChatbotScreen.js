import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, Image,
  KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ChatbotScreen() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [kullaniciVerisi, setKullaniciVerisi] = useState(null);
  const [aramaSonuclari, setAramaSonuclari] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchSaglikVerisi = async () => {
        const stored = await AsyncStorage.getItem("kullanici");
        if (!stored) return;
        const parsed = JSON.parse(stored);
  
        try {
          const response = await axios.get(`${API_BASE_URL}/api/saglik/getir?kullaniciId=${parsed.kullanici_id}`);
          const saglik = response.data;
          const guncelKullanici = {
            ...parsed,
            hastaliklar: saglik.hastaliklar || [],
            alerjenler: saglik.alerjenler || []
          };
          await AsyncStorage.setItem("kullanici", JSON.stringify(guncelKullanici));
          setKullaniciVerisi(guncelKullanici);
        } catch (err) {
          console.error("Sağlık bilgisi alınamadı:", err);
        }
      };
  
      fetchSaglikVerisi();
    }, [])
  );

  const handleArama = async (text) => {
    setUserInput(text);
    if (text.length >= 3) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/urunler/search?query=${text}`);
        setAramaSonuclari(response.data);
      } catch (err) {
        console.log("Autocomplete hatası:", err);
        setAramaSonuclari([]);
      }
    } else {
      setAramaSonuclari([]);
    }
  };

  const handleUrunSec = async (urun) => {
    setUserInput('');
    setAramaSonuclari([]);

    const payload = {
      hastaliklar: kullaniciVerisi?.hastaliklar || [],
      alerjenler: kullaniciVerisi?.alerjenler || []
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ai/yorum?urunId=${urun.id}`, payload);
      const yeniMesaj = {
        key: Date.now().toString(),
        urun: urun.name,
        urunGorsel: urun.urunGorsel,
        yorumlar: response.data.yorumlar
      };
      setChatHistory([yeniMesaj]);
    } catch (error) {
      console.error("Hata:", error);
      alert("Hata: " + (error.response?.data?.error || "Bir şeyler yanlış gitti"));
    }
  };

  return (
    <View style={styles.container}>
      {/* Arama kutusu en üstte sabit */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Ürün ismi (örn: eti)"
          style={styles.input}
          value={userInput}
          onChangeText={handleArama}
        />
        {aramaSonuclari.length > 0 && (
          <ScrollView style={styles.dropdown}>
            {aramaSonuclari.map((urun) => (
              <TouchableOpacity
                key={urun.id}
                onPress={() => handleUrunSec(urun)}
                style={styles.dropdownItem}
              >
                {urun.urunGorsel && (
                  <Image source={{ uri: urun.urunGorsel }} style={styles.dropdownImage} />
                )}
                <Text>{urun.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Sohbet geçmişi */}
      <FlatList
        data={chatHistory}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingBottom: 50 }}
        renderItem={({ item }) => (
          <View style={styles.messageContainer}>
            <View style={styles.urunHeader}>
              {item.urunGorsel && (
                <Image source={{ uri: item.urunGorsel }} style={styles.urunImage} />
              )}
              <Text style={styles.urunName}>{item.urun}</Text>
            </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa'
  },
  inputContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000'
  },
  dropdown: {
    marginTop: 8,
    maxHeight: 200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownImage: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000'
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    margin: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#2196f3', // daha görünür bir gölge
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
  },
  urunHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexWrap: 'wrap'
  },
  urunImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000'
  },
  urunName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    flexWrap: 'wrap'
  },
  yorumBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1
  },
  olumluBox: { 
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50'
  },
  olumsuzBox: { 
    backgroundColor: '#ffebee',
    borderColor: '#f44336'
  },
  uyariBox: { 
    backgroundColor: '#fff3e0',
    borderColor: '#ff9800'
  },
  yorumText: { 
    fontSize: 15,
    lineHeight: 22,
    color: '#000000'
  }
});
