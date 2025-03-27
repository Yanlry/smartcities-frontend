import { useState } from 'react';
import { Alert } from 'react-native';
import { getUserIdFromToken } from '../../utils/tokenUtils';
import { ReportFormData, LocationCoordinates, Photo } from '../../types/entities';
// @ts-ignore - Ignorer l'erreur d'importation des variables d'environnement
import { API_URL } from '@env';

/**
 * Hook personnalisé pour gérer le formulaire de création de signalement
 * @returns Méthodes et états pour la gestion du formulaire et sa soumission
 */
export const useReportForm = (onSuccess: () => void) => {
  // États du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  
  // États de progression
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  // Étapes de progression
  const progressSteps = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation, veuillez patientez", progress: 1.0 },
  ];

  // Navigation entre les étapes
  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Mise à jour des coordonnées
  const updateCoordinates = (lat: number, lng: number) => {
    setCoordinates({ latitude: lat, longitude: lng });
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!title.trim() || !description.trim() || !address.trim()) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires.");
      return false;
    }

    if (!coordinates || isNaN(coordinates.latitude) || isNaN(coordinates.longitude)) {
      Alert.alert("Erreur", "Les coordonnées ne sont pas valides.");
      return false;
    }

    return true;
  };

  // Soumission du formulaire
  const submitReport = async (): Promise<void> => {
    if (isSubmitting) return;
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setProgressModalVisible(true);
    setProgress(0);
  
    try {
      // Étape 1: Préparation des fichiers
      setProgress(progressSteps[0].progress);
      await new Promise((resolve) => setTimeout(resolve, 1000));
  
      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error("Impossible de récupérer l'ID utilisateur.");
      }
  
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("city", address);
      formData.append("latitude", String(coordinates?.latitude));
      formData.append("longitude", String(coordinates?.longitude));
      
      if (category) {
        formData.append("type", category);
      }
      
      formData.append("userId", String(userId));
  
      // Ajout des photos
      photos.forEach((photo) => {
        if (!photo.uri) {
          throw new Error("Une ou plusieurs photos ne sont pas valides.");
        }
  
        formData.append(
          "photos",
          {
            uri: photo.uri,
            name: photo.uri.split("/").pop(),
            type: photo.type || "image/jpeg",
          } as any
        );
      });
  
      // Étape 2: Téléchargement
      setProgress(progressSteps[1].progress);
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }
  
      // Étape 3: Finalisation
      setProgress(progressSteps[2].progress);
      await new Promise((resolve) => setTimeout(resolve, 500));
  
      const data = await response.json();
      Alert.alert("Succès", "Le signalement a été créé avec succès !");
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    } finally {
      setProgressModalVisible(false);
      setIsSubmitting(false);
    }
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAddress("");
    setCoordinates(null);
    setCategory(null);
    setPhotos([]);
    setStep(1);
  };

  // État du formulaire consolidé
  const formData: ReportFormData = {
    title,
    description,
    address,
    coordinates,
    category,
    photos
  };

  return {
    // États
    formData,
    step,
    isSubmitting,
    progress,
    progressModalVisible,
    progressSteps,
    
    // Setters
    setTitle,
    setDescription,
    setAddress,
    setCategory,
    setPhotos,
    updateCoordinates,
    
    // Actions
    nextStep,
    prevStep,
    submitReport,
    setProgressModalVisible,
  };
};