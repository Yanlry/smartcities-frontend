// hooks/profile/useUserProfile.ts

import { useState, useEffect, useCallback } from "react";
import { User } from "../../types/profile.types";
import { getUserIdFromToken } from "../../utils/tokenUtils";
// @ts-ignore
import { API_URL } from "@env";

/**
 * Hook personnalisé pour gérer les données et actions du profil utilisateur
 * @param userId ID de l'utilisateur à afficher
 * @returns Données du profil et fonctions pour interagir
 */
export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Effet pour charger les données du profil utilisateur
  useEffect(() => {
    async function fetchData() {
      try {
        const userIdFromToken = await getUserIdFromToken();
        setCurrentUserId(userIdFromToken);

        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données utilisateur");
        }

        const data = await response.json();
        setUser(data);

        const isCurrentlyFollowing: boolean =
          data.followers?.some(
            (follower: { id: number }) => follower.id === userIdFromToken
          ) || false;

        setIsFollowing(isCurrentlyFollowing);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données :", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  /**
   * Fonction pour suivre un utilisateur
   */
  const handleFollow = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du suivi de cet utilisateur.");
      }

      setIsFollowing(true);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followers: [
                ...(prevUser.followers || []),
                {
                  id: currentUserId,
                  username: "Vous",
                  profilePhoto: undefined,
                },
              ],
            }
          : prevUser
      );
    } catch (error: any) {
      console.error(error.message);
    }
  }, [currentUserId, userId]);

  /**
   * Fonction pour se désabonner d'un utilisateur
   */
  const handleUnfollow = useCallback(async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`${API_URL}/users/${userId}/unfollow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du désuivi de cet utilisateur.");
      }

      setIsFollowing(false);
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              followers: (prevUser.followers || []).filter(
                (follower) => follower.id !== currentUserId
              ),
            }
          : null
      );
    } catch (error: any) {
      console.error(error.message);
    }
  }, [currentUserId, userId]);

  return {
    user,
    loading,
    error,
    isFollowing,
    currentUserId,
    handleFollow,
    handleUnfollow
  };
};