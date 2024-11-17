import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { register, login } from '../services/authService';
import { useToken } from './useToken';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setToken, clearToken } = useToken();

  // Vérifie si un token existe pour maintenir la session
  const checkAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        setToken(storedToken); // Configure le token dans le hook `useToken`
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du token :', error);
    }
  };

  // Appelle `checkAuth` au démarrage
  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (onLogin: () => void) => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoginClicked(true);
      const lowerCaseEmail = email.toLowerCase();
      const response = await login(lowerCaseEmail, password);

      if (response.status === 200 || response.status === 201) {
        const { accessToken, userId } = response.data; // Récupère accessToken et userId
        await AsyncStorage.setItem('userToken', accessToken); // Stocke le token JWT dans AsyncStorage
        await AsyncStorage.setItem('userId', String(userId)); // Stocke l'ID utilisateur
        setToken(accessToken); // Configure le token dans le hook `useToken`
        setIsAuthenticated(true); // L'utilisateur est connecté
        onLogin(); // Notifie le succès de la connexion
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } finally {
      setIsLoginClicked(false);
    }
  };

  const handleRegister = async (onSuccess: () => void) => {
    if (!email || !password || !username || !firstName || !lastName) {
      Alert.alert('Erreur', 'Tous les champs doivent être remplis pour continuer');
      return;
    }

    try {
      setIsRegisterClicked(true);
      const response = await register(email, password, username, firstName, lastName);

      if (response.status === 201) {
        Alert.alert('Succès', 'Inscription réussie');
        onSuccess();
      }
    } catch (error: any) {
      if (__DEV__) {
        console.error("Erreur lors de l'inscription:", error);
      }

      if (error.response) {
        if (error.response.status === 409) {
          Alert.alert('Erreur', error.response.data.message);
        } else {
          Alert.alert('Erreur', error.response.data.message || "Une erreur est survenue lors de l'inscription");
        }
      } else {
        Alert.alert('Erreur', "Une erreur réseau est survenue, veuillez vérifier votre connexion");
      }
    } finally {
      setIsRegisterClicked(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken'); // Supprime le token du stockage
      await AsyncStorage.removeItem('userId'); // Supprime l'ID utilisateur
      clearToken(); // Réinitialise le token dans le hook `useToken`
      setIsAuthenticated(false); // L'utilisateur n'est plus connecté
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  return {
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
    isLoginClicked,
    isRegisterClicked,
    isAuthenticated,
    handleLogin,
    handleRegister,
    logout,
  };
}
