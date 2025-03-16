// hooks/profile/useUserStats.ts

import { useState, useEffect } from "react";
import { UserStats } from "../../types/profile.types";
import axios from "axios";
// @ts-ignore
import { API_URL } from "@env";

/**
 * Hook personnalisé pour récupérer les statistiques d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Données statistiques, état de chargement et erreurs éventuelles
 */
export const useUserStats = (userId: string) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/users/stats/${userId}`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }

        const data = response.data;
        if (!data.votes) {
          data.votes = [];
        }

        setStats(data);
      } catch (error: any) {
        console.error("Erreur dans fetchStats :", error.message || error);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
};