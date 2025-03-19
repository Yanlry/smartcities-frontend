// src/hooks/useApi.ts
import { useCallback } from 'react';
import axios from 'axios';
// @ts-ignore
import { API_URL } from "@env";

/**
 * Hook personnalisé pour les appels API
 * Optimisé pour éviter les re-rendus inutiles
 */
export const useApi = () => {
  /**
   * Récupère les détails d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Objet contenant le nom et la photo de profil
   */
  const fetchData = useCallback(async (
    userId: number
  ): Promise<{ name: string; profilePhoto: string | null } | null> => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      const user = response.data;

      if (!user) return null;

      const name = user.useFullName
        ? `${user.firstName} ${user.lastName}`
        : user.username || "Utilisateur inconnu";

      const profilePhoto = user.profilePhoto?.url || null;

      return { name, profilePhoto };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails pour l'utilisateur ${userId}:`,
        error
      );
      return null;
    }
  }, []);

  return { fetchData };
};