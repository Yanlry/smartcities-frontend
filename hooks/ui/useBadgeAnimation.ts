// Chemin: hooks/ui/useBadgeAnimation.ts

import { useRef, useCallback } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Hook personnalisé pour gérer les animations du badge utilisateur
 * - Effet de mise à l'échelle
 * - Effet de brillance (shine)
 */
export const useBadgeAnimation = () => {
  // Valeur d'échelle animée (pour l'effet de "bounce")
  const scale = useRef(new Animated.Value(1)).current;
  
  // Valeur pour l'effet de brillance
  const shine = useRef(new Animated.Value(0)).current;
  
  /**
   * Déclenche l'animation du badge
   * - Scale up/down bounce
   * - Shine effect
   */
  const triggerBadgeAnimation = useCallback(() => {
    // Reset shine position
    shine.setValue(0);
    
    // Animation séquentielle
    Animated.parallel([
      // Animation de "bounce"
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 120,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.cubic),
        }),
      ]),
      
      // Animation de brillance
      Animated.timing(shine, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start();
  }, [scale, shine]);
  
  return {
    scale,
    shine,
    triggerBadgeAnimation,
  };
};