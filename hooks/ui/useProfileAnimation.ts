// Chemin: hooks/ui/useProfileAnimation.ts

import { useRef, useCallback } from 'react';
import { Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

/**
 * Hook personnalisé pour gérer les animations du profil utilisateur
 * - Fade in/out du header lors du défilement
 * - Gestion des interactions tactiles
 */
export const useProfileAnimation = () => {
  // Valeur animée pour l'opacité du header
  const headerOpacity = useRef(new Animated.Value(1)).current;
  
  // Position Y du dernier scroll pour détecter la direction
  const lastScrollY = useRef(0);
  
  /**
   * Gère l'événement de défilement et anime l'opacité du header
   * @param event Événement de défilement
   */
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // Déterminer si on défile vers le haut ou le bas
    const isScrollingDown = currentScrollY > lastScrollY.current;
    lastScrollY.current = currentScrollY;
    
    // Animation du header en fonction de la direction du défilement
    if (isScrollingDown && currentScrollY > 50) {
      // Défilement vers le bas: masquer progressivement le header
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else if (!isScrollingDown || currentScrollY < 20) {
      // Défilement vers le haut ou en haut de page: afficher le header
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [headerOpacity]);

  /**
   * Handler simplifié pour les interactions tactiles dans le profil
   */
  const scrollHandler = useCallback(() => {
    Animated.timing(headerOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [headerOpacity]);
  
  return {
    headerOpacity,
    handleScroll,
    scrollHandler,
  };
};