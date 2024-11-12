import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Pour stocker le token
import axios from 'axios'; // Pour les appels API

export default function LoginScreen({ navigation, onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Pour le développement seulement : Nettoyer le token au démarrage
    const clearAccessToken = async () => {
      await AsyncStorage.removeItem('accessToken');
    };
    clearAccessToken();
  }, []);

  const handleLogin = async () => {
    try {
      const normalizedEmail = email.toLowerCase();
      const response = await axios.post('http://localhost:3000/auth/login', {
        email: normalizedEmail,
        password,
      });
  
      if (response.status === 200 || response.status === 201) {
        const { accessToken } = response.data;
        await AsyncStorage.setItem('accessToken', accessToken);
  
        // Vérifiez que le token est bien stocké
        const storedToken = await AsyncStorage.getItem('accessToken');
        console.log("Token après stockage:", storedToken);
  
        // Appeler la fonction onLogin pour mettre à jour l'état de connexion
        onLogin();
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Page de connexion</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        secureTextEntry
      />
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    width: '100%',
  },
});
