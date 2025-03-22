// src/components/home/MayorInfoSection/hooks/useAnimatedVisibility.ts
import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing, LayoutAnimation } from 'react-native';

interface AnimatedVisibilityOptions {
  isVisible: boolean;
  newsCount: number;
  animationDuration: number;
}

/**
 * Hook personnalisé pour gérer les animations de visibilité
 * du composant MayorInfoSection
 */
export const useAnimatedVisibility = ({ 
  isVisible, 
  newsCount, 
  animationDuration 
}: AnimatedVisibilityOptions) => {
  // Animations
  const contentHeight = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const tabsFadeAnim = useRef(new Animated.Value(0)).current;
  
  // Animation d'ouverture/fermeture
  useEffect(() => {
    // Configuration de l'animation de layout
    LayoutAnimation.configureNext({
      duration: animationDuration,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    
    // Séquence d'animation pour un effet élégant
    if (isVisible) {
      Animated.sequence([
        // Animer la hauteur en premier
        Animated.timing(contentHeight, {
          toValue: 450,
          duration: animationDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        // Puis faire apparaître les tabs avec un léger délai
        Animated.timing(tabsFadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Enfin faire apparaître le contenu
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Inverser l'ordre pour la fermeture
      Animated.sequence([
        // Masquer le contenu en premier
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        // Puis masquer les tabs
        Animated.timing(tabsFadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        // Enfin, réduire la hauteur
        Animated.timing(contentHeight, {
          toValue: 0,
          duration: animationDuration - 100,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [isVisible, contentHeight, contentOpacity, tabsFadeAnim, animationDuration]);
  
  // Animation de pulsation pour le badge
  useEffect(() => {
    if (newsCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ])
      ).start();
    }

    // Nettoyage de l'animation lors du démontage du composant
    return () => {
      badgePulse.stopAnimation();
    };
  }, [newsCount, badgePulse]);
  
  // Animation de pression pour le header
  const handleHeaderPressIn = useCallback(() => {
    Animated.timing(headerScaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [headerScaleAnim]);

  const handleHeaderPressOut = useCallback(() => {
    Animated.timing(headerScaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [headerScaleAnim]);
  
  return {
    contentHeight,
    contentOpacity,
    headerScaleAnim,
    badgePulse,
    tabsFadeAnim,
    handleHeaderPressIn,
    handleHeaderPressOut
  };
};