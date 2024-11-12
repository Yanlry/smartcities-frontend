import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation, onLogout }: any) {
  const handleLogout = async () => {
    try {
      // Supprimer le token d'accès de AsyncStorage
      await AsyncStorage.removeItem('accessToken');

      // Appeler la fonction onLogout pour mettre à jour l'état de connexion
      onLogout();

      // Afficher un message de confirmation
      Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès.');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Confirmation de déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel', // Style par défaut pour annuler
        },
        {
          text: 'Se déconnecter',
          onPress: handleLogout, // Appelle la fonction handleLogout en cas de confirmation
          style: 'destructive', // Style pour indiquer une action négative
        },
      ],
      { cancelable: false } // Empêche de fermer l'alerte en appuyant à côté
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profil de l'utilisateur</Text>
      {/* Ajouter le bouton de déconnexion */}
      <Button title="Déconnexion" onPress={confirmLogout} />
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
    marginBottom: 20,
  },
});
