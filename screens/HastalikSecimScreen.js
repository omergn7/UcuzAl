// 📄 HastalikSecimScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function HastalikSecimScreen({ navigation }) {
  const [secilenHastaliklar, setSecilenHastaliklar] = useState([]);
  const [secilenAlerjenler, setSecilenAlerjenler] = useState([]);
  const [tumHastaliklar, setTumHastaliklar] = useState([]);
  const [tumAlerjenler, setTumAlerjenler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const veriYukle = async () => {
      try {
        const stored = await AsyncStorage.getItem("kullanici");
        const parsed = stored ? JSON.parse(stored) : {};
  
        const kullaniciId = parsed.kullanici_id || parsed.id; // 👈 Güvenli kontrol
  
        if (!kullaniciId) {
          console.warn("Kullanıcı ID bulunamadı.");
          return;
        }
  
        // Verileri çek
        const [hastalikRes, alerjenRes, seciliRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/saglik/hastaliklar`),
          axios.get(`${API_BASE_URL}/api/saglik/alerjenler`),
          axios.get(`${API_BASE_URL}/api/saglik/getir?kullaniciId=${kullaniciId}`)
        ]);
  
        setTumHastaliklar(hastalikRes.data);
        setTumAlerjenler(alerjenRes.data);
  
        const secili = seciliRes.data;
        const seciliHastaliklar = secili.hastaliklar.map(h => h.id);
        const seciliAlerjenler = secili.alerjenler.map(a => a.id);
  
        setSecilenHastaliklar(seciliHastaliklar);
        setSecilenAlerjenler(seciliAlerjenler);
  
        // AsyncStorage'ı güncelle
        parsed.hastaliklar = seciliHastaliklar;
        parsed.alerjenler = seciliAlerjenler;
        await AsyncStorage.setItem("kullanici", JSON.stringify(parsed));
  
        setLoading(false);
      } catch (err) {
        console.error("Veriler alınamadı:", err);
        Alert.alert("Hata", "Veriler alınamadı.");
      }
    };
  
    veriYukle();
  }, []);
  


  const toggleSelection = (id, list, setList) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const kaydet = async () => {
    try {
      const stored = await AsyncStorage.getItem("kullanici");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      const kullaniciId = parsed.kullanici_id;

      const body = {
        hastaliklar: secilenHastaliklar,
        alerjenler: secilenAlerjenler
      };

      const res = await fetch(`${API_BASE_URL}/api/saglik/kaydet?kullaniciId=${kullaniciId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        Alert.alert("Sunucu hatası", "Sağlık bilgileri kaydedilemedi.");
        return;
      }

      parsed.hastaliklar = secilenHastaliklar;
      parsed.alerjenler = secilenAlerjenler;
      await AsyncStorage.setItem("kullanici", JSON.stringify(parsed));

      Alert.alert("✔️ Kaydedildi", "Sağlık bilgilerin başarıyla güncellendi.");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Hata:", err);
      Alert.alert("Hata", "İşlem sırasında sorun oluştu.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} color="#007AFF" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🩺 Hastalık Seçimi</Text>
      {tumHastaliklar.map((h) => (
        <TouchableOpacity
          key={h.id}
          style={[styles.checkboxContainer, secilenHastaliklar.includes(h.id) && styles.selectedRow]}
          onPress={() => toggleSelection(h.id, secilenHastaliklar, setSecilenHastaliklar)}>
          <Checkbox value={secilenHastaliklar.includes(h.id)} onValueChange={() => toggleSelection(h.id, secilenHastaliklar, setSecilenHastaliklar)} />
          <Text style={styles.label}>{h.adi}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.title}>⚠️ Alerjen Seçimi</Text>
      {tumAlerjenler.map((a) => (
        <TouchableOpacity
          key={a.id}
          style={[styles.checkboxContainer, secilenAlerjenler.includes(a.id) && styles.selectedRow]}
          onPress={() => toggleSelection(a.id, secilenAlerjenler, setSecilenAlerjenler)}>
          <Checkbox value={secilenAlerjenler.includes(a.id)} onValueChange={() => toggleSelection(a.id, secilenAlerjenler, setSecilenAlerjenler)} />
          <Text style={styles.label}>{a.adi}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.kaydetButton} onPress={kaydet}>
        <Text style={styles.kaydetButtonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'stretch'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  selectedRow: {
    backgroundColor: '#e0f7fa'
  },
  label: {
    marginLeft: 10,
    fontSize: 16
  },
  kaydetButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#007AFF',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 5
  },
  kaydetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
