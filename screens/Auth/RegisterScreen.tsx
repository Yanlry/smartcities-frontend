import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth'; // Import du hook personnalisé
import { useState } from 'react';

export default function RegisterScreen({ navigation, onLogin }: any) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    lastName,
    setLastName,
    firstName,
    setFirstName,
    isRegisterClicked,
    handleRegister,
  } = useAuth();

  const handleRegisterClick = () => handleRegister(onLogin);

  const [isLoginClicked, setIsLoginClicked] = useState(false);

  const handleLogin = () => {
    setIsLoginClicked(true);
    navigation.navigate('Login');
    setTimeout(() => setIsLoginClicked(false), 500);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#3498db" />
      </TouchableOpacity>

      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Inscrivez-vous pour rejoindre notre communauté</Text>

      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={setLastName}
        placeholder="Nom"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={setFirstName}
        placeholder="Prénom"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Nom d'utilisateur"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#999"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        secureTextEntry
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.registerButton, isRegisterClicked && styles.buttonClicked]}
        onPress={handleRegisterClick}
      >
        <Text style={styles.registerButtonText}>S'inscrire</Text>
      </TouchableOpacity>

      <View style={styles.loginLink}>
        <Text style={styles.loginText}>Déjà un inscrit ?</Text>
        <TouchableOpacity
          style={[styles.loginButton, isLoginClicked && styles.buttonClicked]}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9fb',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  registerButton: {
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
  buttonClicked: {
    backgroundColor: '#28a745',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 16,
    marginRight: 5,
  },
  loginButton: {
    borderColor: '#3498db',
    borderWidth: 1,
    borderRadius: 10,
    marginLeft: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
  },
});