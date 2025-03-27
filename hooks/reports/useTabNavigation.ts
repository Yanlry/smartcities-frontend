// src/hooks/reports/useTabNavigation.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { Dimensions } from 'react-native';
import { TABS } from '../../types/report.types';

const { width } = Dimensions.get('window');

/**
 * Hook personnalisé pour gérer la navigation par onglets
 */
export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  // Animation de l'indicateur d'onglet
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // Mettre à jour la position de l'indicateur lors du changement d'onglet
  useEffect(() => {
    Animated.timing(indicatorPosition, {
      toValue: activeTab * (width / TABS.length),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [activeTab, indicatorPosition]);

  /**
   * Change l'onglet actif
   * 
   * @param index Index de l'onglet à activer
   */
  const changeTab = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  /**
   * Marque la carte comme prête
   */
  const handleMapReady = useCallback(() => {
    setMapReady(true);
  }, []);

  return {
    activeTab,
    mapReady,
    indicatorPosition,
    changeTab,
    handleMapReady,
  };
};