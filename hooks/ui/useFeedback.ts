// Chemin: hooks/ui/useFeedback.ts

import { useCallback } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Types d'intensité de feedback
 */
type FeedbackIntensity = 'light' | 'medium' | 'heavy';

/**
 * Hook personnalisé pour gérer les retours haptiques dans l'application
 * - Compatibilité cross-platform
 * - Optimisé pour les performances
 */
export const useFeedback = () => {
  /**
   * Déclenche un retour haptique avec l'intensité spécifiée
   * @param intensity Intensité du feedback (light, medium, heavy)
   */
  const triggerFeedback = useCallback((intensity: FeedbackIntensity = 'medium') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        switch (intensity) {
          case 'light':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (error) {
        // Échec silencieux pour éviter les crashs sur les appareils ne supportant pas les haptics
        console.debug('Haptic feedback not supported on this device');
      }
    }
  }, []);

  /**
   * Déclenche une notification haptique (pour les événements importants)
   * @param type Type de notification (success, warning, error)
   */
  const triggerNotification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        switch (type) {
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          default:
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (error) {
        console.debug('Notification haptic feedback not supported on this device');
      }
    }
  }, []);

  return {
    triggerFeedback,
    triggerNotification
  };
};