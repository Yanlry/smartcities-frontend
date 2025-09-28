// hooks/user/useUserProfile.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, UserStats } from '../../types/entities/user.types';
import { getUserIdFromToken } from '../../utils/tokenUtils';
// @ts-ignore
import { API_URL } from '@env';

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await getUserIdFromToken();
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur.");
        }

        const userResponse = await fetch(`${API_URL}/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error("Impossible de récupérer les données utilisateur.");
        }
        const userData = await userResponse.json();
        setUser(userData);

        const statsResponse = await axios.get(`${API_URL}/users/stats/${userId}`);
        if (statsResponse.status !== 200) {
          throw new Error(`Erreur API : ${statsResponse.statusText}`);
        }

        const statsData = statsResponse.data;
        if (!statsData.votes) {
          statsData.votes = [];
        }
        
        setStats(statsData);
      } catch (error: any) {
        console.warn("Erreur lors de la récupération du profil :", error.message || error);
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const updateUserDisplayPreference = async (useFullName: boolean) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}/users/display-preference`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          useFullName
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la préférence.");
      }

      setUser((prevUser) => ({
        ...prevUser!,
        useFullName
      }));
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la préférence", error);
      return false;
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("ID utilisateur non trouvé");
    
      const formData = new FormData();
      formData.append("profileImage", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);
    
      const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
        method: "POST",
        body: formData,
      });
    
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("Response body:", errorBody);
        throw new Error("Échec de la mise à jour de la photo de profil");
      }
    
      const updatedUser = await response.json();
      setUser(updatedUser);
      
      return true;
    } catch (err: any) {
      console.error("Erreur lors de l'upload :", err.message);
      setError(err.message);
      return false;
    }
  };

  const calculateVoteSummary = (votes: UserStats['votes'] = []) => {
    return votes.reduce(
      (acc, vote) => {
        if (vote.type === "up") acc.up++;
        else acc.down++;
        return acc;
      },
      { up: 0, down: 0 }
    );
  };

  const calculateYearsSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    let days = now.getDate() - date.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 1) {
      return `${years} ans`;
    } else if (years === 1) {
      return `1 an et ${months} mois`;
    } else if (months > 1) {
      return `${months} mois`;
    } else if (months === 1) {
      return `1 mois et ${days} jours`;
    } else if (days > 1) {
      return `${days} jours`;
    } else {
      return "moins d'un jour";
    }
  };

  const voteSummary = stats?.votes ? calculateVoteSummary(stats.votes) : { up: 0, down: 0 };
  const memberSince = user?.createdAt ? calculateYearsSince(user.createdAt) : "";

  const displayName = user?.useFullName 
    ? `${user.lastName} ${user.firstName}` 
    : user?.username || "";

  

  return {
    user,
    stats,
    loading,
    error,
    voteSummary,
    memberSince,
    displayName,
    updateUserDisplayPreference,
    updateProfileImage
  };
};