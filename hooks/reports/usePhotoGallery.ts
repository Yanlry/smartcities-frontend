// src/hooks/reports/usePhotoGallery.ts

import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer la galerie photo et son modal
 */
export const usePhotoGallery = () => {
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  /**
   * Ouvre le modal avec l'image sélectionnée
   * 
   * @param index Index de la photo dans la collection
   */
  const openPhotoModal = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalVisible(true);
  }, []);

  /**
   * Ferme le modal
   */
  const closePhotoModal = useCallback(() => {
    setPhotoModalVisible(false);
    // Réinitialiser l'index après une courte période pour permettre l'animation de fermeture
    setTimeout(() => {
      setSelectedPhotoIndex(null);
    }, 300);
  }, []);

  return {
    photoModalVisible,
    selectedPhotoIndex,
    openPhotoModal,
    closePhotoModal,
  };
};