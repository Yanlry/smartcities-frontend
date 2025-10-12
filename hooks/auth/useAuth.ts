// Chemin : hooks/auth/useAuth.tsx

import { useState } from 'react';
import { Alert } from 'react-native';
import { login } from '../../services/authService';
import { useToken } from '../auth/useToken'
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
  
  // ✅ FONCTION FINALE MODIFIÉE - Accepte les données de mairie dans cityData
  const handleRegister = async (
    onSuccess: () => void,
    cityData: { 
      nom_commune: string; 
      code_postal: string; 
      latitude: number; 
      longitude: number;
      // 🆕 NOUVEAUX CHAMPS pour les mairies (tous optionnels)
      isMunicipality?: boolean;
      municipalityName?: string;
      municipalitySIREN?: string;
      municipalityPhone?: string;
      municipalityAddress?: string;
    }
  ) => {
    try {
      console.log("🚀 Début de l'inscription...");
      console.log("📍 Données de localisation :", cityData);
  
      setIsRegisterClicked(true);
      setIsLoading(true);
  
      // ✅ Validation des champs de base
      if (!email || !password || !username) {
        Alert.alert("Erreur", "Email, mot de passe et nom d'utilisateur sont obligatoires.");
        return;
      }
  
      // ✅ Si c'est un citoyen, on vérifie qu'il a un nom/prénom
      if (!cityData.isMunicipality && (!lastName || !firstName)) {
        Alert.alert("Erreur", "Nom et prénom sont obligatoires pour un compte citoyen.");
        return;
      }
  
      // ✅ Si c'est une mairie, on vérifie les infos de mairie
      if (cityData.isMunicipality && (!cityData.municipalityName || !cityData.municipalitySIREN)) {
        Alert.alert("Erreur", "Nom de la mairie et numéro SIREN sont obligatoires.");
        return;
      }
  
      // ✅ Validation de la localisation
      if (!cityData.nom_commune || !cityData.code_postal || !cityData.latitude || !cityData.longitude) {
        Alert.alert("Erreur", "Veuillez sélectionner une ville valide.");
        return;
      }
  
      // ✅ Pour les citoyens, on vérifie la photo
      if (!cityData.isMunicipality && photos.length === 0) {
        Alert.alert("Erreur", "Veuillez ajouter au moins une photo.");
        return;
      }
  
      // 📦 Création du FormData
      const formData = new FormData();
      formData.append("email", email.toLowerCase());
      formData.append("password", password);
      formData.append("username", username);
  
      // 🆕 Si c'est une MAIRIE, on ajoute les infos de mairie
      if (cityData.isMunicipality) {
        console.log("🏛️ Inscription d'une MAIRIE");
        formData.append("isMunicipality", "true");
        formData.append("municipalityName", cityData.municipalityName || "");
        formData.append("municipalitySIREN", cityData.municipalitySIREN || "");
        formData.append("municipalityPhone", cityData.municipalityPhone || "");
        formData.append("municipalityAddress", cityData.municipalityAddress || "");
        
        // Pour les mairies, on met des valeurs par défaut pour nom/prénom
        formData.append("lastName", "Mairie");
        formData.append("firstName", cityData.municipalityName || "Municipalité");
      } else {
        // 👤 Si c'est un CITOYEN, on ajoute nom/prénom normalement
        console.log("👤 Inscription d'un CITOYEN");
        formData.append("lastName", lastName);
        formData.append("firstName", firstName);
      }
  
      // 📍 Ajout des données de localisation
      console.log("📍 Ajout des données de localisation à FormData...");
      formData.append("nom_commune", cityData.nom_commune);
      formData.append("code_postal", cityData.code_postal);
      formData.append("latitude", cityData.latitude.toString());
      formData.append("longitude", cityData.longitude.toString());
  
      // 📸 Ajout des photos (seulement pour les citoyens)
      if (photos.length > 0) {
        photos.forEach((photo) => {
          formData.append("photos", {
            uri: photo.uri,
            name: photo.uri.split("/").pop(),
            type: photo.type || "image/jpeg",
          } as any);
        });
      }
  
      console.log("✅ Données prêtes à être envoyées");
  
      // 🌐 Envoi de la requête au backend
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Inscription réussie :", data);
  
        // 🆕 SI C'EST UNE MAIRIE, on affiche un message spécial
        if (cityData.isMunicipality) {
          Alert.alert(
            "Demande envoyée",
            "Votre demande d'inscription en tant que mairie a été envoyée. Vous recevrez un email une fois votre compte validé par un administrateur.",
            [{ text: "Compris" }]
          );
          // On ne connecte PAS automatiquement les mairies
          onSuccess();
        } else {
          // Pour les citoyens, connexion automatique
          const { id, token } = data;
          if (!id || !token) {
            Alert.alert("Erreur", "Problème lors de la récupération des données utilisateur.");
            return;
          }
  
          await setToken(token);
          await setUserId(id);
  
          Alert.alert("Succès", "Inscription réussie !");
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        console.error("❌ Erreur lors de l'inscription :", errorData);
        Alert.alert("Erreur", errorData.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      console.error("❌ Erreur pendant l'inscription :", error);
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