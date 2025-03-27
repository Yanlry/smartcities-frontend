// src/hooks/reports/useTooltip.ts

import { useState, useCallback, useRef } from 'react';
import { Animated, Easing, LayoutChangeEvent } from 'react-native';

interface TooltipLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Hook personnalisé pour gérer l'affichage et l'animation des tooltips
 */
export const useTooltip = () => {
  const [titleTooltipVisible, setTitleTooltipVisible] = useState(false);
  const titleLayout = useRef<TooltipLayout>({ x: 0, y: 0, width: 0, height: 0 });
  
  // Valeurs d'animation
  const animatedTooltipOpacity = useRef(new Animated.Value(0)).current;
  const animatedTooltipScale = useRef(new Animated.Value(0.9)).current;

  /**
   * Affiche le tooltip avec animation
   */
  const showTooltip = useCallback(() => {
    setTitleTooltipVisible(true);
    
    // Animation d'entrée du tooltip
    Animated.parallel([
      Animated.timing(animatedTooltipOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(animatedTooltipScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      })
    ]).start();
  }, [animatedTooltipOpacity, animatedTooltipScale]);

  /**
   * Masque le tooltip avec animation
   */
  const hideTooltip = useCallback(() => {
    // Animation de sortie du tooltip
    Animated.parallel([
      Animated.timing(animatedTooltipOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(animatedTooltipScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      setTitleTooltipVisible(false);
    });
  }, [animatedTooltipOpacity, animatedTooltipScale]);

  /**
   * Mesure la position du titre pour le placement du tooltip
   */
  const measureLayout = useCallback((event: LayoutChangeEvent) => {
    if (!event || !event.nativeEvent) return;
    
    const { layout } = event.nativeEvent;
    const handle = event.target as unknown as { measure?: Function };
    
    if (handle && handle.measure) {
      handle.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        titleLayout.current = { x: pageX, y: pageY, width, height };
      });
    }
  }, []);

  return {
    titleTooltipVisible,
    titleLayout: titleLayout.current,
    animatedTooltipOpacity,
    animatedTooltipScale,
    showTooltip,
    hideTooltip,
    measureLayout,
  };
};