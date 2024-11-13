import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Pour stocker le token
import axios from 'axios'; // Pour les appels API

export default function LoginScreen({ navigation, onLogin }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);

  useEffect(() => {
    // Pour le développement seulement : Nettoyer le token au démarrage
    const clearAccessToken = async () => {
      await AsyncStorage.removeItem('accessToken');
    };
    clearAccessToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoginClicked(true); // Change l'état après le clic
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
    } finally {
      setIsLoginClicked(false); // Réinitialiser l'état après le clic
    }
  };

  const handleRegisterNavigation = () => {
    setIsRegisterClicked(true);
    navigation.navigate('Register');
    setTimeout(() => setIsRegisterClicked(false), 500); // Réinitialiser après 500 ms pour indiquer l'action
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue !</Text>
      <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Adresse Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        placeholderTextColor="#888"
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.loginButton, isLoginClicked && styles.buttonClicked]}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Se connecter</Text>
      </TouchableOpacity>
      <Text style={styles.registerText}>Pas de compte ?</Text>
      <TouchableOpacity
        style={[styles.registerButton, isRegisterClicked && styles.buttonClicked]}
        onPress={handleRegisterNavigation}
      >
        <Text style={styles.registerButtonText}>S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // Pour Android, donne un effet d'ombre
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  registerButton: {
    marginTop: 10,
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  buttonClicked: {
    backgroundColor: '#28a745', // Vert agréable pour indiquer que le bouton a été cliqué
  },
  registerButtonText: {
    color: '#3498db',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

