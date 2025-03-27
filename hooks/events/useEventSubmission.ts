// components/hooks/useEventSubmission.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
// @ts-ignore
import { API_URL } from '@env';
import { getUserIdFromToken } from '../../utils/tokenUtils';
// Chemin corrigé
import { EventFormData, SubmissionStep } from '../../types/entities/event.types';

/**
 * Hook gérant la soumission des événements à l'API
 */
export const useEventSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressVisible, setProgressVisible] = useState(false);

  const steps: SubmissionStep[] = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation", progress: 1.0 },
  ];

  const submitEvent = useCallback(async (eventData: EventFormData): Promise<boolean> => {
    if (isSubmitting) return false;
    
    setIsSubmitting(true);
    setProgressVisible(true);
    setProgress(0);

    try {
      // Étape 1: Préparation
      setProgress(steps[0].progress);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Récupérer l'ID utilisateur
      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error("Impossible de récupérer l'ID utilisateur.");
      }

      // Créer le FormData
      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("description", eventData.description);
      formData.append("date", eventData.date.toISOString());
      
      if (eventData.location.coordinates) {
        formData.append("latitude", String(eventData.location.coordinates.latitude));
        formData.append("longitude", String(eventData.location.coordinates.longitude));
      }
      
      formData.append("location", eventData.location.query);
      formData.append("organizerId", String(userId));

      // Ajouter les photos
      eventData.photos.forEach((photo) => {
        formData.append("photos", {
          uri: photo.uri,
          name: photo.uri.split("/").pop(),
          type: photo.type || "image/jpeg",
        } as any);
      });

      // Étape 2: Téléchargement
      setProgress(steps[1].progress);
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
      }

      // Étape 3: Finalisation
      setProgress(steps[2].progress);
      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await response.json();
      Alert.alert("Succès", "L'événement a été créé avec succès !");
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors de la création de l'événement:", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la création de l'événement.");
      return false;
    } finally {
      setProgressVisible(false);
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return {
    submitEvent,
    isSubmitting,
    progress,
    progressVisible,
    setProgressVisible
  };
};