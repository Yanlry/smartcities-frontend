import { useState } from 'react';
import { Alert } from 'react-native';
import { register, login } from '../services/authService';
import { useToken } from './useToken';
// @ts-ignore
import { API_URL, ORS_API_KEY } from '@env';
import { getUserIdFromToken } from '../utils/tokenUtils';


export function useAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);

  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);  
  const { setToken, clearToken, getToken,  } = useToken(); // Ajout de getToken pour récupérer le token actuel

  const steps = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation, veuillez patientez", progress: 1.0 },
  ];

  const handleLogin = async (onLogin: () => void) => {
    const { setToken, setUserId, clearAll, getToken, getUserId } = useToken(); // Utilise les fonctions de `useToken`
  
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
  
  const handleRegister = async (onSuccess: () => void) => {
    try {
      console.log("Inscription en cours...");
  
      // Validation locale des champs obligatoires
      if (!email || !password || !lastName || !firstName || !username) {
        Alert.alert("Champs erroné ou vide", "Tous les champs sont obligatoires.");
        return;
      }
  
      // Validation des photos
      for (const photo of photos) {
        if (!photo.uri || !photo.type) {
          Alert.alert("Erreur", "Une ou plusieurs photos ne sont pas valides.");
          return;
        }
      }
  
      // Préparation des données du formulaire
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("lastName", lastName);
      formData.append("firstName", firstName);
      formData.append("username", username);
  
      photos.forEach((photo) => {
        formData.append(
          "photos",
          {
            uri: photo.uri,
            name: photo.uri.split("/").pop(),
            type: photo.type || "image/jpeg",
          } as any // Cast explicite pour TypeScript
        );
      });
  
      // Requête d'inscription
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });
  
      // Gestion des réponses serveur
      if (response.status === 201) {
        Alert.alert("Succès", "Inscription réussie !");
        onSuccess(); // Callback pour gérer la redirection ou autre logique
      } else if (response.status === 400) {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Données invalides.");
      } else if (response.status === 500) {
        Alert.alert("Erreur", "Erreur interne du serveur. Veuillez réessayer plus tard.");
      } else {
        Alert.alert("Erreur", `Erreur inattendue : ${response.status}`);
      }
    } catch (error: any) {
      // Gestion des erreurs réseau ou autres exceptions
      console.error("Erreur lors de l'inscription :", error);
      Alert.alert("Erreur", "Impossible de se connecter au serveur. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false); // Fin du chargement
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
    photos,
    setPhotos,
    progress,
    progressModalVisible,
    isSubmitting,
    setIsSubmitting,
    isLoading,
  };
}
