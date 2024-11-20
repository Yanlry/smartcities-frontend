import React from 'react';
import { View, Text, StyleSheet } from 'react-native';


  export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Écran des rapports</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
  },
});