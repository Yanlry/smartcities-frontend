// src/components/home/MayorInfoSection/hooks/useTabNavigation.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
import { TabType } from './MayorInfoSection';

const { width } = Dimensions.get('window');
const INDICATOR_WIDTH = 30;

/**
 * Hook personnalisé pour gérer la navigation entre les onglets
 * et les animations associées
 */
export const useTabNavigation = () => {
  // État local pour l'onglet actif
  const [activeTab, setActiveTab] = useState<TabType>('news');
  
  // Animation de l'indicateur d'onglet actif
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Changement d'onglet
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);
  
  // Position interpolée de l'indicateur d'onglet
  const indicatorTranslate = indicatorPosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, width / 3, (width / 3) * 2]
  });
  
  // Animation de l'indicateur d'onglet actif
  useEffect(() => {
    let position = 0;
    
    if (activeTab === 'mayor') position = 1;
    else if (activeTab === 'contact') position = 2;
    
    Animated.timing(indicatorPosition, {
      toValue: position,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [activeTab, indicatorPosition]);
  
  return {
    activeTab,
    indicatorPosition,
    indicatorTranslate,
    handleTabChange
  };
};