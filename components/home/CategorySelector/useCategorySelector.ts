// src/components/home/CategoryReportsSection/useCategorySelector.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { UseCategorySelectorOptions, UseCategorySelectorResult } from './types';

/**
 * Hook personnalisé pour gérer l'état et les animations du sélecteur de catégories
 * Centralise la logique d'état et des animations complexes
 *
 * @param options - Options de configuration du hook
 * @param options.initialCategory - Catégorie initialement sélectionnée
 * @param options.animationDuration - Durée des animations en ms
 * @param options.onCategorySelected - Callback appelé quand une catégorie est sélectionnée
 * @returns Objet contenant les états et animations nécessaires
 */
export const useCategorySelector = ({
  initialCategory = null,
  animationDuration = 300,
  onCategorySelected
}: UseCategorySelectorOptions = {}): UseCategorySelectorResult => {
  // État local pour la catégorie sélectionnée
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  
  // Animations
  const containerHeight = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const headerRotation = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const sliderProgress = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Gérer la sélection d'une catégorie
  const handleCategorySelect = useCallback((categoryName: string) => {
    setSelectedCategory(prev => {
      // Toggle selection if clicking the same category
      const newSelection = prev === categoryName ? null : categoryName;
      
      // Animate the slider progress indicator
      Animated.timing(sliderProgress, {
        toValue: newSelection ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
      
      return newSelection;
    });
  }, [sliderProgress]);
  
  // Gérer la confirmation de la sélection
  const handleConfirmSelection = useCallback(() => {
    if (selectedCategory && onCategorySelected) {
      onCategorySelected(selectedCategory);
    }
  }, [selectedCategory, onCategorySelected]);
  
  // Exposer les animations et états
  return {
    selectedCategory,
    setSelectedCategory,
    handleCategorySelect,
    handleConfirmSelection,
    containerHeight,
    contentOpacity,
    headerRotation,
    contentTranslateY,
    sliderProgress,
    scrollX
  };
};