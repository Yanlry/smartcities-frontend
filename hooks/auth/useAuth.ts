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
  
  /**
   * ✅ FONCTION MODIFIÉE - Gère mieux les erreurs du backend
   */
  const handleRegister = async (
    onSuccess: () => void,
    cityData: { 
      nom_commune: string; 
      code_postal: string; 
      latitude: number; 
      longitude: number;
      isMunicipality?: boolean;
      municipalityCity?: string;
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
  
      // Validation des champs de base
      if (!email || !password) {
        Alert.alert("Erreur", "Email et mot de passe sont obligatoires.");
        return;
      }
  
      // Si c'est un CITOYEN, on vérifie nom/prénom/username
      if (!cityData.isMunicipality) {
        if (!lastName || !firstName) {
          Alert.alert("Erreur", "Nom et prénom sont obligatoires pour un compte citoyen.");
          return;
        }
        if (!username) {
          Alert.alert("Erreur", "Le nom d'utilisateur est obligatoire pour un compte citoyen.");
          return;
        }
      }
  
      // Si c'est une MAIRIE, on vérifie les infos de mairie
      if (cityData.isMunicipality) {
        if (!cityData.municipalityCity || !cityData.municipalitySIREN) {
          Alert.alert("Erreur", "Ville de la mairie et numéro SIREN sont obligatoires.");
          return;
        }
      }
  
      // Validation de la localisation
      if (!cityData.nom_commune || !cityData.code_postal || !cityData.latitude || !cityData.longitude) {
        Alert.alert("Erreur", "Veuillez sélectionner une ville valide.");
        return;
      }
  
      // Pour les citoyens, on vérifie la photo
      if (!cityData.isMunicipality && photos.length === 0) {
        Alert.alert("Erreur", "Veuillez ajouter au moins une photo.");
        return;
      }
  
      // Création du FormData
      const formData = new FormData();
      formData.append("email", email.toLowerCase());
      formData.append("password", password);
  
      // Username seulement pour les citoyens
      if (!cityData.isMunicipality) {
        formData.append("username", username);
        console.log(`👤 Username citoyen : "${username}"`);
      } else {
        console.log("🏛️ Mairie : pas de username envoyé (sera généré par le backend)");
      }
  
      // Si c'est une MAIRIE
      if (cityData.isMunicipality) {
        console.log("🏛️ Inscription d'une MAIRIE");
        
        const fullMunicipalityName = `Mairie de ${cityData.municipalityCity}`;
        console.log(`📝 Nom complet généré : "${fullMunicipalityName}"`);
        
        formData.append("isMunicipality", "true");
        formData.append("municipalityName", fullMunicipalityName);
        formData.append("municipalitySIREN", cityData.municipalitySIREN || "");
        formData.append("municipalityPhone", cityData.municipalityPhone || "");
        formData.append("municipalityAddress", cityData.municipalityAddress || "");
        
        formData.append("firstName", fullMunicipalityName);
        formData.append("lastName", "");
      } else {
        // Si c'est un CITOYEN
        console.log("👤 Inscription d'un CITOYEN");
        formData.append("lastName", lastName);
        formData.append("firstName", firstName);
      }
  
      // Ajout des données de localisation
      console.log("📍 Ajout des données de localisation à FormData...");
      formData.append("nom_commune", cityData.nom_commune);
      formData.append("code_postal", cityData.code_postal);
      formData.append("latitude", cityData.latitude.toString());
      formData.append("longitude", cityData.longitude.toString());
  
      // Ajout des photos (seulement pour les citoyens)
      if (photos.length > 0) {
        console.log(`📸 Ajout de ${photos.length} photo(s)`);
        photos.forEach((photo) => {
          formData.append("photos", {
            uri: photo.uri,
            name: photo.uri.split("/").pop(),
            type: photo.type || "image/jpeg",
          } as any);
        });
      }
  
      console.log("✅ Données prêtes à être envoyées au backend");
  
      // 🌐 Envoi de la requête au backend
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        body: formData,
      });

      // ✅ MODIFICATION PRINCIPALE : Meilleure gestion des erreurs
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Inscription réussie :", data);
  
        // Si c'est une MAIRIE
        if (cityData.isMunicipality) {
          Alert.alert(
            "Demande envoyée ✅",
            "Votre demande d'inscription en tant que mairie a été envoyée avec succès.\n\nVous recevrez un email une fois votre compte validé par un administrateur.",
            [{ text: "Compris", style: "default" }]
          );
          onSuccess();
        } else {
          // Pour les CITOYENS, connexion automatique
          const { id, token } = data;
          if (!id || !token) {
            Alert.alert("Erreur", "Problème lors de la récupération des données utilisateur.");
            return;
          }
  
          await setToken(token);
          await setUserId(id);
  
          Alert.alert("Succès 🎉", "Inscription réussie ! Bienvenue dans Smartcities !");
          onSuccess();
        }
      } else {
        // ✅ NOUVELLE GESTION DES ERREURS - On affiche le message du backend
        let errorMessage = "Une erreur s'est produite lors de l'inscription.";
        
        try {
          // On essaie de lire la réponse JSON du backend
          const errorData = await response.json();
          
          // ✅ On récupère le message d'erreur envoyé par le backend
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (jsonError) {
          // Si on ne peut pas parser le JSON, on garde le message par défaut
          console.error("❌ Impossible de parser la réponse d'erreur :", jsonError);
        }
        
        // ✅ On affiche l'erreur à l'utilisateur
        console.log("📢 Affichage de l'erreur à l'utilisateur :", errorMessage);
        Alert.alert(
          "Mot interdit 🚫",
          errorMessage,
          [{ text: "J'ai compris", style: "cancel" }]
        );
      }
    } catch (error) {
      console.error("❌ Erreur pendant l'inscription :", error);
      
      // Afficher un message d'erreur générique en cas de problème réseau
      Alert.alert(
        "Erreur réseau 🌐",
        "Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez.",
        [{ text: "OK", style: "cancel" }]
      );
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