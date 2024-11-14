import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export default function LoginScreen({ navigation, onLogin }: any) {
  const {
    email, setEmail,
    password, setPassword,
    isLoginClicked,
    handleLogin,
  } = useAuth();

  const handleLoginClick = () => handleLogin(onLogin);

  const [isRegisterClicked, setIsRegisterClicked] = useState(false);

  const handleRegisterNavigation = () => {
    setIsRegisterClicked(true);
    navigation.navigate('Register');
    setTimeout(() => setIsRegisterClicked(false), 500);
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
        onPress={handleLoginClick}
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