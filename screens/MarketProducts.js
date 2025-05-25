import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MarketProducts({ route }) {
  const { marketId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Market ID: {marketId}</Text>
      <Text style={styles.text}>Ürünler buraya gelecek!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});
