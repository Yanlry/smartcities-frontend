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
  const { setToken, clearToken, setUserId,  } = useToken(); 

  const steps = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation, veuillez patientez", progress: 1.0 },
  ];
  const handleLogin = async (onLogin: () => void) => {
    const { setToken, setRefreshToken, setUserId, clearAll } = useToken(); 
  
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
  
    try {
      setIsLoginClicked(true);
      const lowerCaseEmail = email.toLowerCase();
      const response = await login(lowerCaseEmail, password);
  
      if (response.status === 200 || response.status === 201) {
        const { accessToken, refreshToken, userId } = response.data; 
  
        await clearAll();
  
        await setToken(accessToken);
        await setRefreshToken(refreshToken); 
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
      console.log("Début de l'inscription...");
      console.log("Données de localisation :", cityData);
  
      setIsRegisterClicked(true);
      setIsLoading(true);
  
      if (!email || !password || !lastName || !firstName || !username) {
        Alert.alert("Erreur", "Tous les champs sont obligatoires.");
        return;
      }
  
      if (!cityData.nom_commune || !cityData.code_postal || !cityData.latitude || !cityData.longitude) {
        Alert.alert("Erreur", "Veuillez sélectionner une ville valide.");
        return;
      }
  
      if (photos.length === 0) {
        Alert.alert("Erreur", "Veuillez ajouter au moins une photo.");
        return;
      }
  
      const formData = new FormData();
      formData.append("email", email.toLowerCase());
      formData.append("password", password);
      formData.append("lastName", lastName);
      formData.append("firstName", firstName);
      formData.append("username", username);
  
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
  
      console.log("Données prêtes à être envoyées :", formData);
  
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Inscription réussie :", data);
  
        const { id, token } = data;
        if (!id || !token) {
          Alert.alert("Erreur", "Problème lors de la récupération des données utilisateur.");
          return;
        }
  
        await setToken(token);
        await setUserId(id);
  
        Alert.alert("Succès", "Inscription réussie !");
        onSuccess();
      } else {
        const errorData = await response.json();
        console.error("Erreur lors de l'inscription :", errorData);
        Alert.alert("Erreur", errorData.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      console.error("Erreur pendant l'inscription :", error);
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    } finally {
      setIsRegisterClicked(false);
      setIsLoading(false);
    }
  };
  
  
  const logout = async () => {
    console.log('Déconnexion en cours...');
    await clearToken();
    setIsAuthenticated(false); 
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

