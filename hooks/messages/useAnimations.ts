// src/hooks/useAnimations.ts
import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * Hook personnalisé pour gérer les animations
 * Optimisé pour éviter la recréation inutile des animations
 */
export const useAnimations = () => {
  // Animations de base
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Animation d'entrée avec fade et slide
   */
  const runFadeInAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        speed: 12,
        bounciness: 2,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  /**
   * Animation d'échelle pour le feedback tactile
   * @param pressed État de pression
   */
  const runScaleAnimation = useCallback((pressed: boolean) => {
    Animated.spring(scaleAnim, {
      toValue: pressed ? 0.97 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  /**
   * Animation séquentielle pour les items de liste avec délai
   * @param index Index de l'item pour le délai
   * @param itemFadeAnim Animation de fondu propre à l'item
   * @param itemSlideAnim Animation de glissement propre à l'item
   */
  const runItemAnimation = useCallback((
    index: number,
    itemFadeAnim: Animated.Value,
    itemSlideAnim: Animated.Value
  ) => {
    const delay = index * 50;
    
    return setTimeout(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(itemSlideAnim, {
          toValue: 0,
          speed: 15,
          bounciness: 3,
          useNativeDriver: true,
        })
      ]).start();
    }, delay);
  }, []);

  return {
    animations: {
      fadeAnim,
      slideAnim,
      scaleAnim
    },
    runFadeInAnimation,
    runScaleAnimation,
    runItemAnimation
  };
};