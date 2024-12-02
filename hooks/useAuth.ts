import { useState } from 'react';
import { Alert } from 'react-native';
import { register, login } from '../services/authService';
import { useToken } from './useToken';
// @ts-ignore
import { API_URL, ORS_API_KEY } from '@env';


export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setToken, clearToken, getToken } = useToken(); // Ajout de getToken pour récupérer le token actuel

  const handleLogin = async (onLogin: () => void) => {
    const { setToken, setUserId, getToken, getUserId, clearAll } = useToken(); // Utilise les fonctions de `useToken`
  
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
  
    try {
      console.log('Début de la connexion...');
      console.log('API_URL depuis .env:', API_URL);
      console.log('ORS_API_KEY depuis .env:', ORS_API_KEY);
      setIsLoginClicked(true);
      const lowerCaseEmail = email.toLowerCase();
      const response = await login(lowerCaseEmail, password);
  
      if (response.status === 200 || response.status === 201) {
        const { accessToken, userId } = response.data; // Assure-toi que le backend renvoie `userId`
  
        // Suppression des données existantes
        await clearAll();
  
        // Stockage des nouvelles données
        await setToken(accessToken);
        await setUserId(userId);
          
        setIsAuthenticated(true);
        onLogin();
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    } finally {
      setIsLoginClicked(false);
    }
  };
  
  
  
  
  

  // Fonction d'inscription
  const handleRegister = async (onSuccess: () => void) => {
    console.log('Données d\'inscription:', { email, password, username, firstName, lastName });

    if (!email || !password || !username || !firstName || !lastName) {
      Alert.alert('Erreur', 'Tous les champs doivent être remplis pour continuer');
      return;
    }

    try {
      setIsRegisterClicked(true);
      const response = await register(email, password, username, firstName, lastName);

      if (response.status === 201) {
        Alert.alert('Succès', 'Inscription réussie');
        onSuccess(); // Redirige ou notifie après l'inscription réussie
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur réseau est survenue');
    } finally {
      setIsRegisterClicked(false);
    }
  };

  const logout = async () => {
    console.log('Déconnexion en cours...');
    await clearToken(); // Supprime le token dans AsyncStorage
    setIsAuthenticated(false); // Réinitialise l'état d'authentification
    console.log('Déconnexion réussie, token supprimé.');
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
