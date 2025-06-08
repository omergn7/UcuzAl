// ProfileScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@env';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  Animated,
  Easing,
  Dimensions,
  Platform
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('weekly');
  const [chartData, setChartData] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkUserAndPermissions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchKullanici = async () => {
        const stored = await AsyncStorage.getItem("kullanici");
        if (!stored) return;
        const parsed = JSON.parse(stored);
      
        try {
          const [kullaniciRes, aylikRes, chartRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/kullanici/${parsed.kullanici_id}`),
            fetch(`${API_BASE_URL}/api/kullanici/${parsed.kullanici_id}/aylik-tasarruf`),
            fetch(`${API_BASE_URL}/api/kullanici/${parsed.kullanici_id}/grafik-verisi`)
          ]);
      
          const kullaniciJson = await kullaniciRes.json();
          const aylikJson = await aylikRes.json();
          const chartJson = await chartRes.json();
      
          const fullUser = {
            ...kullaniciJson,
            aylikTasarruf: aylikJson?.aylikTasarruf != null ? aylikJson.aylikTasarruf.toFixed(2) : "0.00"
          };
      
          setUserInfo(fullUser);
          await AsyncStorage.setItem("kullanici", JSON.stringify(fullUser));
      
          const gunMap = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      
          const now = new Date();
          const thisMonth = now.getMonth();
          const thisYear = now.getFullYear();
      
          const monday = new Date();
          monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Pazartesi
      
          let weeklyMap = {};
          let monthlyMap = {};
      
          Object.entries(chartJson).forEach(([dateStr, val]) => {
            const date = new Date(dateStr);
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            const dayOfWeek = date.getDay();
      
            // Haftalık kontrol
            const isSameWeek =
              date >= monday &&
              date < new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
      
            if (isSameWeek) {
              const label = gunMap[dayOfWeek];
              weeklyMap[label] = val;
            }
      
            if (month === thisMonth && year === thisYear) {
              monthlyMap[day] = val;
            }
          });
      
          // Verileri sırala
          const sortedWeekly = gunMap.map(gun => ({
            label: gun,
            value: weeklyMap[gun] ?? 0
          }));
      
          const sortedMonthly = Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            return {
              label: `${day}`,
              value: monthlyMap[day] ?? 0
            };
          }).filter(item => item.value > 0);
      
          setChartData({
            weekly: {
              labels: sortedWeekly.map(x => x.label),
              data: sortedWeekly.map(x => x.value)
            },
            monthly: {
              labels: sortedMonthly.map(x => x.label),
              data: sortedMonthly.map(x => x.value)
            }
          });
        } catch (err) {
          console.error("Veriler alınamadı", err);
        }
      };
      
      
      fetchKullanici();
    }, [])
  );

  const checkUserAndPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      const storedUser = await AsyncStorage.getItem('kullanici');
      if (storedUser) {
        setUserInfo(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
    await AsyncStorage.removeItem('kullanici');
      setUserInfo(null);
    Alert.alert("Çıkış Yapıldı");
    navigation.replace('LoginScreen');
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu");
    }
  };

  const animateCharts = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  };

  useEffect(() => {
    if (!loading && userInfo) {
      animateCharts();
    }
  }, [loading, userInfo]);

  const handleChartPress = (type) => {
    setSelectedChart(type);
  };

  const renderChart = () => {


    const chartConfig = {
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#000000"
      },
      propsForLabels: {
        rotation: 45,
        fontSize: 10
      }
    };

    const screenWidth = Dimensions.get("window").width - 60;

    // Sadece gerçekten veri yoksa varsayılan veriyi göster
    let displayData = {
      labels: [],
      datasets: [{ data: [] }]
    };
    
    if (chartData) {
      if (selectedChart === 'weekly' && chartData.weekly?.data.length > 0) {
        displayData = {
          labels: chartData.weekly.labels,
          datasets: [{ data: chartData.weekly.data }]
        };
      } else if (selectedChart === 'monthly' && chartData.monthly?.data.length > 0) {
        displayData = {
          labels: chartData.monthly.labels,
          datasets: [{ data: chartData.monthly.data }]
        };
      }
    }
    
   
    const isChartEmpty = displayData.datasets[0].data.every((val) => val === 0);
    
    
    


    return (
      <Animated.View style={[
        styles.chartContainer,
        {
          opacity: chartAnim,
          transform: [{ scale: chartAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1]
          })}]
        }
      ]}>
        <View style={styles.chartHeader}>
        <TouchableOpacity 
  style={[styles.chartTab, selectedChart === 'weekly' && styles.selectedChartTab]}
  onPress={() => handleChartPress('weekly')}
>
  <Text style={[styles.chartTabText, selectedChart === 'weekly' && styles.selectedChartTabText]}>
    Haftalık
  </Text>
</TouchableOpacity>

<TouchableOpacity 
  style={[styles.chartTab, selectedChart === 'monthly' && styles.selectedChartTab]}
  onPress={() => handleChartPress('monthly')}
>
  <Text style={[styles.chartTabText, selectedChart === 'monthly' && styles.selectedChartTabText]}>
    Aylık
  </Text>
</TouchableOpacity>

        </View>
        <LineChart
          data={displayData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          fromZero={true}
          segments={5}
          renderDotContent={({ x, y, index, indexData }) => (
            <View key={index} style={[styles.dotLabel, { left: x - 20, top: y - 30 }]}>
              <Text style={styles.dotLabelText}>₺{indexData}</Text>
            </View>
          )}
          
        />
        {isChartEmpty && (
  <View style={styles.emptyChartMessage}>
    <Text style={styles.emptyChartText}>
      Henüz tasarruf verisi bulunmuyor. Ürün tarayarak tasarrufunuzu takip etmeye başlayın!
    </Text>
      </View>
)}

      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <LinearGradient
        colors={['#ffffff', '#f8f9fa', '#ffffff']}
        style={styles.container}
      >
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeEmoji}>✨</Text>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
          <Text style={styles.welcomeText}>
            Tasarruf yolculuğunuza başlamak için giriş yapın
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <LinearGradient
                colors={['#000000', '#333333']}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>Giriş Yap</Text>
              </LinearGradient>
            </TouchableOpacity>

          
        <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
        >
              <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
        </TouchableOpacity>
      </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', '#f8f9fa', '#ffffff']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Animated.View style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={['#000000', '#333333']}
                style={styles.profileImageGradient}
              >
                <Text style={styles.profileInitial}>
                  {userInfo.isim?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </LinearGradient>
            </View>
            <View style={styles.profileInfoContainer}>
              <Text style={styles.profileName}>{userInfo.isim} {userInfo.soyisim}</Text>
              <Text style={styles.profileEmail}>{userInfo.email}</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[
          styles.statsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₺{userInfo.toplamTasarruf || '0.00'}</Text>
            <Text style={styles.statLabel}>Toplam Tasarruf</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₺{userInfo.aylikTasarruf || '0.00'}</Text>
            <Text style={styles.statLabel}>Aylık Tasarruf</Text>
          </View>
        </Animated.View>

        {renderChart()}

        <Animated.View style={[
          styles.menuContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Favorites')}>
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>⭐</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Favori Ürünler</Text>
                <Text style={styles.menuSubtitle}>Kaydettiğiniz ürünleri görüntüleyin</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HastalikSecim')}>
            <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>🩺</Text>
          </View>
          <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>Hastalıklarım</Text>
           <Text style={styles.menuSubtitle}>AI yorumları için sağlık bilgilerini belirle</Text>
             </View>
           <Ionicons name="chevron-forward" size={24} color="#666" />
             </View>
        </TouchableOpacity>


          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>⚙️</Text>
          </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Ayarlar</Text>
                <Text style={styles.menuSubtitle}>Hesap ve uygulama ayarları</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#666" />
          </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
                <Ionicons name="log-out-outline" size={24} color="#dc3545" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, styles.logoutText]}>Çıkış Yap</Text>
                <Text style={styles.menuSubtitle}>Hesabınızdan güvenli çıkış yapın</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
        </ScrollView>

      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ayarlar</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
              <Text style={styles.modalEmoji}>🚪</Text>
              <Text style={[styles.modalButtonText, { color: '#000000' }]}>Çıkış Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { marginTop: 20 }]} onPress={() => setShowSettingsModal(false)}>
              <Text style={styles.modalEmoji}>✖️</Text>
              <Text style={styles.modalButtonText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#000000' },
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 15,
  },
  profileImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileImageGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 40,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  profileInfoContainer: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#000000',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#000000',
  },
  chartHeader: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#000000',
  },
  chartTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedChartTab: {
    backgroundColor: '#000',
  },
  chartTabText: {
    fontSize: 14,
    color: '#666',
  },
  selectedChartTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 15,
    paddingRight: 20,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#000000',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutIconContainer: {
    backgroundColor: '#fff5f5',
  },
  logoutText: {
    color: '#dc3545',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  loginButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#ffffff', padding: 20,
    borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000', marginBottom: 15, textAlign: 'center' },
  modalButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  modalEmoji: { fontSize: 24, marginRight: 10 },
  modalButtonText: { fontSize: 16, color: '#000000' },
  dotLabel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dotLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyChartMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 20,
  },
  emptyChartText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
