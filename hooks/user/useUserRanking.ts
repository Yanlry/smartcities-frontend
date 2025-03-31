import { useState, useEffect } from 'react';
import { SmarterUser, TopUser } from '../../types/entities/user.types';
import { getUserIdFromToken } from '../../utils/tokenUtils';
// @ts-ignore
import { API_URL } from '@env';

export const useUserRanking = (cityName: string) => {
  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [topUsers, setTopUsers] = useState<SmarterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankingData = async () => {
      if (!cityName) return;
      
      try {
        setLoading(true);
        setError(null);

        const userId = await getUserIdFromToken();
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur.");
        }

        const rankingResponse = await fetch(
          `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(cityName)}`
        );
        
        if (!rankingResponse.ok) {
          throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
        }

        const rankingData = await rankingResponse.json();
        setRanking(rankingData.ranking);
        setTotalUsers(rankingData.totalUsers);

        const topUsersResponse = await fetch(
          `${API_URL}/users/top10?cityName=${encodeURIComponent(cityName)}`
        );
        
        if (!topUsersResponse.ok) {
          throw new Error("Erreur lors de la récupération des utilisateurs populaires");
        }

        const topUsersData: TopUser[] = await topUsersResponse.json();

        const formattedData = topUsersData.map((user) => ({
          id: user.id,
          username: user.username || "",
          displayName: user.useFullName
            ? `${user.firstName} ${user.lastName}`
            : user.username || "",
          ranking: user.ranking,
          image: { uri: user.photo || "default-image-url" },
        }));

        formattedData.sort((a, b) => a.ranking - b.ranking);
        setTopUsers(formattedData);
      } catch (error: any) {
        console.warn("Erreur lors de la récupération du classement :", error.message || error);
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [cityName]);

  const getRankingSuffix = (rank: number | null) => {
    if (!rank) return "";
    return rank === 1 ? "er" : "ème";
  };

  return {
    ranking,
    totalUsers,
    topUsers,
    loading,
    error,
    getRankingSuffix
  };
};