import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';

// Define User Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePhoto?: {
    url: string;
  };
  nomCommune?: string;
  codePostal?: string;
  useFullName?: boolean;
  showEmail: boolean;
  followers?: any[];
  following?: any[];
  reports?: any[];
  comments?: any[];
  posts?: any[];
  organizedEvents?: any[];
  attendedEvents?: any[];
  isSubscribed?: boolean;
  isMunicipality?: boolean;
}

interface VoteSummary {
  up: number;
  down: number;
}

// Interface for user stats
interface UserStats {
  numberOfReports: number;
  trustRate: number;
  numberOfVotes: number;
  numberOfComments: number;
  numberOfEventsCreated: number;
  numberOfPosts: number;
  numberOfEventsAttended: number;
  votes: {
    type: 'up' | 'down';
    reportId: number;
    createdAt: string;
  }[];
}

interface UserProfileContextType {
  user: User | null;
  displayName: string;
  voteSummary: VoteSummary;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean; // Ajout d'un état d'authentification explicite
  updateProfileImage: (imageUrl: string) => Promise<void>;
  updateUserDisplayPreference: (useFullName: boolean) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUserCity: (nomCommune: string, codePostal: string) => Promise<void>;
}

// Create context with default values
const UserProfileContext = createContext<UserProfileContextType>({
  user: null,
  displayName: '',
  voteSummary: { up: 0, down: 0 },
  loading: false,
  error: null,
  isAuthenticated: false,
  updateProfileImage: async () => {},
  updateUserDisplayPreference: async () => {},
  refreshUserData: async () => {},
  updateUserCity: async () => {},
});

// Custom hook to use the context
export const useUserProfile = () => useContext(UserProfileContext);

// Provider component
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary>({ up: 0, down: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Compute display name from user data
  const displayName = user 
    ? user.useFullName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username
    : '';

  // Vérifier la validité du token JWT
  const isTokenValid = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // convertir en millisecondes
      return Date.now() < expirationTime;
    } catch (error) {
      return false;
    }
  };

  // Get user ID from token with improved error handling
  const getUserIdFromToken = async (): Promise<{ userId: string | null; isValid: boolean }> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Aucun token trouvé, l'utilisateur n'est pas connecté (ce n'est pas une erreur)
      if (!token) {
        return { userId: null, isValid: false };
      }
      
      // Vérifier si le token est valide
      if (!isTokenValid(token)) {
        return { userId: null, isValid: false };
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { userId: payload.userId, isValid: true };
    } catch (error) {
      // Une erreur dans la lecture ou le décodage du token
      console.warn('Erreur lors de l\'extraction de l\'ID utilisateur du token:', error);
      return { userId: null, isValid: false };
    }
  };

  // Transform votes array to voteSummary format
  const transformVotes = (votes: UserStats['votes']): VoteSummary => {
    const summary = { up: 0, down: 0 };
    
    if (!votes || !Array.isArray(votes)) {
      return summary;
    }
    
    // Count up and down votes
    votes.forEach(vote => {
      if (vote.type === 'up') summary.up += 1;
      if (vote.type === 'down') summary.down += 1;
    });
    
    return summary;
  };

  // Configuration axios avec intercepteur pour ajouter le token
  const setupAxiosInterceptors = useCallback(async () => {
    axios.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }, []);

  // Function to refresh user data with improved error handling
  const refreshUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier l'état d'authentification
      const { userId, isValid } = await getUserIdFromToken();
      
      // Si pas de token valide, ne pas générer d'erreur, juste indiquer que l'utilisateur n'est pas connecté
      if (!userId || !isValid) {
        setIsAuthenticated(false);
        setUser(null);
        setVoteSummary({ up: 0, down: 0 });
        return;
      }

      // L'utilisateur est authentifié
      setIsAuthenticated(true);

      // Fetch user data
      const response = await axios.get(`${API_URL}/users/${userId}`);
      setUser(response.data);

      // Fetch user stats which includes votes
      try {
        const statsResponse = await axios.get<UserStats>(`${API_URL}/users/stats/${userId}`);
        
        if (statsResponse.data && statsResponse.data.votes) {
          // Transform votes to summary format
          const summary = transformVotes(statsResponse.data.votes);
          setVoteSummary(summary);
        } else {
          setVoteSummary({ up: 0, down: 0 });
        }
      } catch (statsError: any) {
        // Gestion silencieuse des erreurs de stats
        if (statsError.response && statsError.response.status === 404) {
          setVoteSummary({ up: 0, down: 0 });
        } else {
          // Log l'erreur mais ne perturbe pas l'expérience utilisateur
          console.warn('Erreur lors de la récupération des statistiques utilisateur:', statsError);
        }
      }

    } catch (error) {
      // Erreur seulement pour les cas où l'utilisateur est authentifié mais une erreur survient
      if (isAuthenticated) {
        console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
        setError('Impossible de charger le profil utilisateur');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Update profile image
  const updateProfileImage = async (imageUrl: string) => {
    try {
      if (!user?.id) return;

      // This is a placeholder - you'll need to implement the actual image upload logic
      // For now, just refreshing the user data
      await refreshUserData();
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  // Update user display preference
  const updateUserDisplayPreference = async (useFullName: boolean) => {
    if (!user) return;
    
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_URL}/users/display-preference`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
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
      
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la préférence", error);
    }
  };

  // Update user city with improved error handling
  const updateUserCity = async (nomCommune: string, codePostal: string) => {
    try {
      if (!user?.id || !isAuthenticated) return;

      const token = await AsyncStorage.getItem('authToken');
      
      await axios.put(`${API_URL}/users/${user.id}`, {
        nomCommune,
        codePostal,
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        }
      });

      // Update local state immediately to reflect changes across the app
      setUser(prev => prev ? { ...prev, nomCommune, codePostal } : null);
    } catch (error) {
      console.error('Error updating city:', error);
      throw new Error('Failed to update city');
    }
  };

  // Initial setup
  useEffect(() => {
    setupAxiosInterceptors();
    refreshUserData();
    
    // Ajouter un listener pour les changements d'état d'authentification
    const checkAuthStatusInterval = setInterval(() => {
      // Vérifier périodiquement si l'état d'authentification a changé
      getUserIdFromToken().then(({ userId, isValid }) => {
        const newAuthState = !!(userId && isValid);
        if (newAuthState !== isAuthenticated) {
          // Si l'état a changé, rafraîchir les données
          refreshUserData();
        }
      });
    }, 60000); // Vérifier toutes les minutes
    
    return () => {
      clearInterval(checkAuthStatusInterval);
    };
  }, [refreshUserData, setupAxiosInterceptors, isAuthenticated]);

  // Context value
  const value = {
    user,
    displayName,
    voteSummary,
    loading,
    error,
    isAuthenticated,
    updateProfileImage,
    updateUserDisplayPreference,
    refreshUserData,
    updateUserCity,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};