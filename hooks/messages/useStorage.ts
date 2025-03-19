// src/hooks/useStorage.ts
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook personnalisé pour la gestion d'AsyncStorage
 * @param keyPrefix Préfixe pour les clés de stockage
 */
export const useStorage = (keyPrefix: string) => {
  /**
   * Récupère des données du stockage
   * @param key Clé de stockage sans préfixe
   * @returns Données stockées ou null si aucune donnée
   */
  const getStoredData = useCallback(async (key: string): Promise<string | null> => {
    try {
      const fullKey = `${keyPrefix}_${key}`;
      return await AsyncStorage.getItem(fullKey);
    } catch (error) {
      console.error(`Erreur lors de la récupération de la clé ${key}:`, error);
      return null;
    }
  }, [keyPrefix]);

  /**
   * Stocke des données
   * @param key Clé de stockage sans préfixe
   * @param value Valeur à stocker
   * @returns true si réussi, false sinon
   */
  const storeData = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      const fullKey = `${keyPrefix}_${key}`;
      await AsyncStorage.setItem(fullKey, value);
      return true;
    } catch (error) {
      console.error(`Erreur lors du stockage pour la clé ${key}:`, error);
      return false;
    }
  }, [keyPrefix]);

  /**
   * Supprime des données du stockage
   * @param key Clé de stockage sans préfixe
   * @returns true si réussi, false sinon
   */
  const removeStoredData = useCallback(async (key: string): Promise<boolean> => {
    try {
      const fullKey = `${keyPrefix}_${key}`;
      await AsyncStorage.removeItem(fullKey);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la clé ${key}:`, error);
      return false;
    }
  }, [keyPrefix]);

  return {
    getStoredData,
    storeData,
    removeStoredData
  };
};