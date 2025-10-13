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
   * ✅ FONCTION MODIFIÉE - Gère l'inscription des citoyens ET des mairies
   * 
   * DIFFÉRENCES ENTRE CITOYENS ET MAIRIES :
   * 
   * CITOYENS :
   * - Doivent avoir : email, password, username, firstName, lastName
   * - Le username est choisi par l'utilisateur et vérifié côté frontend
   * 
   * MAIRIES :
   * - Doivent avoir : email, password, municipalityCity, municipalitySIREN
   * - PAS DE USERNAME à saisir ! Le backend génère automatiquement "mairie-ville"
   * - Le firstName devient "Mairie de [Ville]" pour l'affichage
   */
  const handleRegister = async (
    onSuccess: () => void,
    cityData: { 
      nom_commune: string; 
      code_postal: string; 
      latitude: number; 
      longitude: number;
      // 🏛️ Champs pour les mairies (tous optionnels)
      isMunicipality?: boolean;
      municipalityCity?: string; // Juste la ville (ex: "Haubourdin")
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
  
      // ✅ MODIFICATION 1 : Validation différente selon le type de compte
      if (!email || !password) {
        Alert.alert("Erreur", "Email et mot de passe sont obligatoires.");
        return;
      }
  
      // ✅ Si c'est un CITOYEN, on vérifie nom/prénom/username
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
  
      // ✅ Si c'est une MAIRIE, on vérifie les infos de mairie (PAS de username !)
      if (cityData.isMunicipality) {
        if (!cityData.municipalityCity || !cityData.municipalitySIREN) {
          Alert.alert("Erreur", "Ville de la mairie et numéro SIREN sont obligatoires.");
          return;
        }
      }
  
      // ✅ Validation de la localisation (obligatoire pour tous)
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
  
      // ✅ MODIFICATION 2 : Username seulement pour les citoyens
      if (!cityData.isMunicipality) {
        // 👤 CITOYEN : on envoie le username choisi par l'utilisateur
        formData.append("username", username);
        console.log(`👤 Username citoyen : "${username}"`);
      } else {
        // 🏛️ MAIRIE : on n'envoie PAS de username, le backend le générera automatiquement
        console.log("🏛️ Mairie : pas de username envoyé (sera généré par le backend)");
      }
  
      // 🏛️ Si c'est une MAIRIE
      if (cityData.isMunicipality) {
        console.log("🏛️ Inscription d'une MAIRIE");
        
        // ✅ Construction du nom complet de la mairie
        const fullMunicipalityName = `Mairie de ${cityData.municipalityCity}`;
        console.log(`📝 Nom complet généré : "${fullMunicipalityName}"`);
        
        formData.append("isMunicipality", "true");
        formData.append("municipalityName", fullMunicipalityName); // ← Nom complet pour la BDD
        formData.append("municipalitySIREN", cityData.municipalitySIREN || "");
        formData.append("municipalityPhone", cityData.municipalityPhone || "");
        formData.append("municipalityAddress", cityData.municipalityAddress || "");
        
        // ✅ Pour l'affichage dans l'app, on met le nom complet dans firstName
        formData.append("firstName", fullMunicipalityName);
        formData.append("lastName", ""); // ← Vide pour les mairies
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
  
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Inscription réussie :", data);
  
        // 🏛️ SI C'EST UNE MAIRIE
        if (cityData.isMunicipality) {
          Alert.alert(
            "Demande envoyée ✅",
            "Votre demande d'inscription en tant que mairie a été envoyée avec succès.\n\nVous recevrez un email une fois votre compte validé par un administrateur.",
            [{ text: "Compris", style: "default" }]
          );
          // On ne connecte PAS automatiquement les mairies
          onSuccess();
        } else {
          // 👤 Pour les CITOYENS, connexion automatique
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
        const errorData = await response.json();
        console.error("❌ Erreur lors de l'inscription :", errorData);
        
        // Message d'erreur personnalisé selon le type d'erreur
        let errorMessage = "Une erreur s'est produite.";
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        Alert.alert("Erreur d'inscription", errorMessage);
      }
    } catch (error) {
      console.error("❌ Erreur pendant l'inscription :", error);
      Alert.alert(
        "Erreur réseau",
        "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
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