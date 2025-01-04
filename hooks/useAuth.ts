import { useState } from 'react';
import { Alert } from 'react-native';
import { login } from '../services/authService';
import { useToken } from './useToken';
// @ts-ignore
import { API_URL } from '@env';

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
  const { setToken, clearToken, setUserId,  } = useToken(); // Ajout de getToken pour récupérer le token actuel

  const steps = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation, veuillez patientez", progress: 1.0 },
  ];
  const handleLogin = async (onLogin: () => void) => {
    const { setToken, setRefreshToken, setUserId, clearAll } = useToken(); // Ajout de `setRefreshToken`
  
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
  
    try {
      setIsLoginClicked(true);
      const lowerCaseEmail = email.toLowerCase();
      const response = await login(lowerCaseEmail, password);
  
      if (response.status === 200 || response.status === 201) {
        const { accessToken, refreshToken, userId } = response.data; // Assure-toi que le backend renvoie `refreshToken`
  
        // Suppression des données existantes
        await clearAll();
  
        // Stockage des nouvelles données
        await setToken(accessToken);
        await setRefreshToken(refreshToken); // Stocke le refresh token
        await setUserId(userId);
  
        setIsAuthenticated(true);
        onLogin();
      }
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        "Email ou mot de passe incorrect."
      );
    } finally {
      setIsLoginClicked(false);
    }
  };
  
  const handleRegister = async (
    onSuccess: () => void,
    cityData: { nom_commune: string; code_postal: string; latitude: number; longitude: number }
  ) => {
    try {
      console.log("Inscription en cours...");
      console.log("Données de localisation reçues :", cityData);
  
      setIsRegisterClicked(true);
      setIsLoading(true);
  
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
      formData.append("email", email.toLowerCase());
      formData.append("password", password);
      formData.append("lastName", lastName);
      formData.append("firstName", firstName);
      formData.append("username", username);
  
      // Ajouter les champs de localisation avec des logs pour vérification
      console.log("Ajout des données de localisation à FormData...");
      formData.append("nom_commune", cityData.nom_commune);
      formData.append("code_postal", cityData.code_postal);
      formData.append("latitude", cityData.latitude.toString());
      formData.append("longitude", cityData.longitude.toString());
  
      photos.forEach((photo) => {
        formData.append("photos", {
          uri: photo.uri,
          name: photo.uri.split("/").pop(),
          type: photo.type || "image/jpeg",
        } as any);
      });
  
      console.log("FormData prêt à être envoyé :", formData);
  
      // Requête d'inscription
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });
  
      console.log("Réponse brute du backend :", response);
  
      if (response.ok) {
        const data = await response.json();
        console.log("Données renvoyées par le backend :", data);
  
        const { id, token } = data;
  
        if (!id || !token) {
          Alert.alert("Erreur", "Impossible de récupérer l'ID utilisateur ou le token.");
          return;
        }
  
        await setToken(token);
        await setUserId(id);
  
        Alert.alert("Succès", "Inscription réussie !");
        onSuccess();
      } else {
        const errorData = await response.json();
        console.error("Erreur renvoyée par le backend :", errorData);
        Alert.alert("Erreur", errorData.message || "Erreur lors de l'inscription.");
      }
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
      console.error("Erreur lors de l'inscription :", error);
    } finally {
      setIsRegisterClicked(false);
      setIsLoading(false);
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

