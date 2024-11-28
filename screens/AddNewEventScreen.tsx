// Chemin : ./screens/AddNewEventScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddNewEventScreen() {
  return (
    <View style={styles.container}>
      <Text>Page pour ajouter un nouvel événement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});