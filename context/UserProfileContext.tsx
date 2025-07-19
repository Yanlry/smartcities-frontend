// Chemin : context/UserProfileContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';
// ✅ UTILISATION de vos types existants
import { User, UserStats } from '../types/entities/user.types';

/**
 * Configuration des clés de stockage (synchronisée avec useAuth)
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'smartcity_auth_token',
  REFRESH_TOKEN: 'smartcity_refresh_token',
  USER_ID: 'smartcity_user_id',
} as const;

/**
 * Interface pour le résumé des votes (utilise le type existant)
 */
interface VoteSummary {
  up: number;
  down: number;
}

/**
 * Interface pour le contexte du profil utilisateur
 * Utilise vos types existants sans redéfinition
 */
interface UserProfileContextType {
  user: User | null;
  displayName: string;
  voteSummary: VoteSummary;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  // ✅ Signature compatible avec vos types Sidebar
  updateProfileImage: (uri: string) => Promise<boolean>;
  updateUserDisplayPreference: (useFullName: boolean) => Promise<boolean>;
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
  updateProfileImage: async () => false,
  updateUserDisplayPreference: async () => false,
  refreshUserData: async () => {},
  updateUserCity: async () => {},
});

// Custom hook to use the context
export const useUserProfile = () => useContext(UserProfileContext);

/**
 * Utilitaires de gestion des tokens (synchronisés avec useAuth)
 */
const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  },

  async getUserId(): Promise<number | null> {
    try {
      const userIdStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      return userIdStr ? parseInt(userIdStr, 10) : null;
    } catch (error) {
      console.error('❌ Erreur récupération userId:', error);
      return null;
    }
  },

  async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Validation basique du format JWT
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Vérification de l'expiration
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime < payload.exp;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      return false;
    }
  }
};

/**
 * Utilitaires pour le calcul des données utilisateur
 * Compatible avec vos types existants
 */
const UserUtils = {
  /**
   * Génère le nom d'affichage selon les préférences
   */
  getDisplayName(user: User | null): string {
    if (!user) return '';
    return user.useFullName 
      ? `${user.firstName} ${user.lastName}`.trim()
      : user.username || `${user.firstName} ${user.lastName}`.trim();
  },

  /**
   * Calcule le résumé des votes à partir des données utilisateur
   */
  calculateVoteSummary(user: User | null): VoteSummary {
    if (!user || !user.votes) {
      return { up: 0, down: 0 };
    }

    // Utilise voteSummary s'il existe déjà, sinon calcule
    if (user.voteSummary) {
      return user.voteSummary;
    }

    return user.votes.reduce(
      (summary, vote) => {
        if (vote.type === 'up') summary.up++;
        else if (vote.type === 'down') summary.down++;
        return summary;
      },
      { up: 0, down: 0 }
    );
  }
};

/**
 * Provider component avec types harmonisés
 */
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ États typés avec vos interfaces existantes
  const [user, setUser] = useState<User | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary>({ up: 0, down: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Référence pour éviter les fuites mémoire
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef<AbortController | null>(null);

  // ✅ Utilise UserUtils pour le nom d'affichage
  const displayName = UserUtils.getDisplayName(user);

  /**
   * Mise à jour sécurisée de l'état (évite les updates sur composant démonté)
   */
  const safeStateUpdate = useCallback((updater: () => void) => {
    if (mountedRef.current) {
      updater();
    }
  }, []);

  /**
   * Configuration axios avec intercepteur automatique
   */
  const setupAxiosInterceptors = useCallback(() => {
    // Intercepteur de requête pour ajouter automatiquement le token
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const token = await TokenManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse pour gérer les erreurs d'authentification
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('🔒 Token expiré, déconnexion automatique');
          await handleAuthenticationError();
        }
        return Promise.reject(error);
      }
    );

    // Retourner une fonction de nettoyage
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  /**
   * Gestion des erreurs d'authentification
   */
  const handleAuthenticationError = useCallback(async () => {
    safeStateUpdate(() => {
      setIsAuthenticated(false);
      setUser(null);
      setVoteSummary({ up: 0, down: 0 });
      setError('Session expirée');
      setLoading(false);
    });

    // Nettoyer les données d'authentification
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_ID,
      ]);
      console.log('🧹 Données d\'authentification nettoyées après erreur');
    } catch (cleanupError) {
      console.error('❌ Erreur nettoyage après auth error:', cleanupError);
    }
  }, [safeStateUpdate]);

  /**
   * Vérification de l'état d'authentification
   */
  const checkAuthenticationStatus = useCallback(async (): Promise<boolean> => {
    try {
      const [token, userId, isValid] = await Promise.all([
        TokenManager.getToken(),
        TokenManager.getUserId(),
        TokenManager.isTokenValid(),
      ]);

      const isAuthenticated = !!(token && userId && isValid);

      safeStateUpdate(() => {
        setIsAuthenticated(isAuthenticated);
      });

      return isAuthenticated;
    } catch (error) {
      console.error('❌ Erreur vérification authentification:', error);
      safeStateUpdate(() => {
        setIsAuthenticated(false);
      });
      return false;
    }
  }, [safeStateUpdate]);

  /**
   * Récupération des données utilisateur avec gestion d'erreurs robuste
   */
  const fetchUserProfile = useCallback(async (userId: number): Promise<void> => {
    try {
      console.log(`🔍 UserProfile - Récupération profil pour userId: ${userId}`);
      
      safeStateUpdate(() => {
        setLoading(true);
        setError(null);
      });

      // Annuler la requête précédente si elle existe
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }

      // Nouvelle instance AbortController
      fetchControllerRef.current = new AbortController();
      const { signal } = fetchControllerRef.current;

      // Vérifier la disponibilité du token
      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Aucun token d\'authentification disponible');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Requêtes parallèles pour optimiser les performances
      const [userResponse, statsResponse] = await Promise.allSettled([
        fetch(`${API_URL}/users/${userId}`, { signal, headers }),
        fetch(`${API_URL}/users/stats/${userId}`, { signal, headers }),
      ]);

      // Traitement de la réponse utilisateur
      if (userResponse.status === 'fulfilled') {
        if (!userResponse.value.ok) {
          if (userResponse.value.status === 401) {
            await handleAuthenticationError();
            return;
          }
          throw new Error(`Erreur HTTP ${userResponse.value.status}: Impossible de récupérer les données utilisateur`);
        }
        
        const userData: User = await userResponse.value.json();
        
        // ✅ Les données sont déjà typées correctement selon votre interface User
        safeStateUpdate(() => {
          setUser(userData);
          // Calculer le résumé des votes
          const summary = UserUtils.calculateVoteSummary(userData);
          setVoteSummary(summary);
        });
        
        console.log('✅ UserProfile - Données utilisateur récupérées');
      } else {
        throw new Error('Échec de récupération des données utilisateur');
      }

      // Traitement de la réponse statistiques (non critique)
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        try {
          const statsData: UserStats = await statsResponse.value.json();
          
          // Mettre à jour le résumé des votes avec les stats si disponibles
          if (statsData.votes) {
            const summary = statsData.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'up') acc.up++;
                else if (vote.type === 'down') acc.down++;
                return acc;
              },
              { up: 0, down: 0 }
            );
            
            safeStateUpdate(() => {
              setVoteSummary(summary);
            });
          }
          
          console.log('✅ UserProfile - Statistiques récupérées');
        } catch (statsError) {
          console.warn('⚠️ UserProfile - Erreur traitement stats:', statsError);
        }
      } else {
        console.warn('⚠️ UserProfile - Échec récupération stats, utilisation valeurs par défaut');
      }

      safeStateUpdate(() => {
        setLoading(false);
      });

    } catch (error: any) {
      console.error('❌ UserProfile - Erreur récupération:', error);

      if (error.name === 'AbortError') {
        console.log('🚫 UserProfile - Requête annulée');
        return;
      }

      const errorMessage = error.message || "Erreur lors de la récupération du profil";
      safeStateUpdate(() => {
        setError(errorMessage);
        setLoading(false);
      });
    }
  }, [safeStateUpdate, handleAuthenticationError]);

  /**
   * Initialisation et gestion du cycle de vie
   */
  const initializeUserProfile = useCallback(async () => {
    try {
      console.log('🚀 UserProfile - Initialisation');

      const isAuth = await checkAuthenticationStatus();
      
      if (isAuth) {
        const userId = await TokenManager.getUserId();
        if (userId) {
          await fetchUserProfile(userId);
        } else {
          throw new Error('UserId non disponible malgré l\'authentification');
        }
      } else {
        console.log('ℹ️ UserProfile - Utilisateur non authentifié');
        safeStateUpdate(() => {
          setUser(null);
          setVoteSummary({ up: 0, down: 0 });
          setLoading(false);
          setError(null);
        });
      }
    } catch (error) {
      console.error('❌ UserProfile - Erreur initialisation:', error);
      safeStateUpdate(() => {
        setError('Erreur d\'initialisation du profil utilisateur');
        setLoading(false);
      });
    }
  }, [checkAuthenticationStatus, fetchUserProfile, safeStateUpdate]);

  /**
   * Function to refresh user data
   */
  const refreshUserData = useCallback(async () => {
    try {
      const isAuth = await checkAuthenticationStatus();
      
      if (isAuth) {
        const userId = await TokenManager.getUserId();
        if (userId) {
          await fetchUserProfile(userId);
        }
      } else {
        console.log('⚠️ UserProfile - refreshUserData: Utilisateur non authentifié');
        await handleAuthenticationError();
      }
    } catch (error) {
      console.error('❌ UserProfile - Erreur refreshUserData:', error);
      safeStateUpdate(() => {
        setError('Impossible de rafraîchir les données utilisateur');
      });
    }
  }, [checkAuthenticationStatus, fetchUserProfile, handleAuthenticationError, safeStateUpdate]);

  /**
   * ✅ Update profile image avec signature compatible Sidebar
   */
  const updateProfileImage = useCallback(async (uri: string): Promise<boolean> => {
    const userId = await TokenManager.getUserId();
    
    if (!userId) {
      console.error('❌ UserProfile - Aucun userId pour mise à jour image');
      return false;
    }
    
    try {
      console.log('📸 UserProfile - Mise à jour image de profil');
      
      const token = await TokenManager.getToken();
      
      if (!token) {
        console.error('❌ UserProfile - Aucun token d\'authentification');
        return false;
      }

      const formData = new FormData();
      formData.append("profileImage", {
        uri: uri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);
    
      const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: fetchControllerRef.current?.signal,
      });
    
      if (!response.ok) {
        if (response.status === 401) {
          await handleAuthenticationError();
          return false;
        }
        
        const errorBody = await response.text();
        console.error("❌ UserProfile - Response body:", errorBody);
        throw new Error(`HTTP ${response.status}: Échec de la mise à jour de la photo de profil`);
      }
    
      const updatedUser: User = await response.json();
      safeStateUpdate(() => {
        setUser(updatedUser);
      });
      
      console.log('✅ UserProfile - Image de profil mise à jour');
      return true;
      
    } catch (error: any) {
      console.error("❌ UserProfile - Erreur upload image:", error);
      safeStateUpdate(() => {
        setError(error.message);
      });
      return false;
    }
  }, [safeStateUpdate, handleAuthenticationError]);

  /**
   * ✅ Update user display preference avec retour boolean
   */
  const updateUserDisplayPreference = useCallback(async (useFullName: boolean): Promise<boolean> => {
    if (!user) {
      console.warn('⚠️ UserProfile - Aucun utilisateur pour mise à jour préférence');
      return false;
    }
    
    try {
      console.log('🔄 UserProfile - Mise à jour préférence affichage:', useFullName);
      
      const token = await TokenManager.getToken();
      
      if (!token) {
        console.error('❌ UserProfile - Aucun token d\'authentification');
        return false;
      }
      
      const response = await fetch(`${API_URL}/users/display-preference`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          useFullName
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await handleAuthenticationError();
          return false;
        }
        throw new Error("Erreur lors de la mise à jour de la préférence.");
      }

      safeStateUpdate(() => {
        setUser((prevUser) => ({
          ...prevUser!,
          useFullName
        }));
      });
      
      console.log('✅ UserProfile - Préférence mise à jour');
      return true;
      
    } catch (error) {
      console.error("❌ UserProfile - Erreur mise à jour préférence:", error);
      safeStateUpdate(() => {
        setError('Erreur lors de la mise à jour de la préférence');
      });
      return false;
    }
  }, [user, safeStateUpdate, handleAuthenticationError]);

  /**
   * Update user city
   */
  const updateUserCity = useCallback(async (nomCommune: string, codePostal: string): Promise<void> => {
    try {
      if (!user?.id || !isAuthenticated) return;

      const token = await TokenManager.getToken();
      
      if (!token) {
        throw new Error('Aucun token d\'authentification');
      }
      
      await axios.put(`${API_URL}/users/${user.id}`, {
        nomCommune,
        codePostal,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // Update local state immediately to reflect changes across the app
      safeStateUpdate(() => {
        setUser(prev => prev ? { ...prev, nomCommune, codePostal } : null);
      });
      console.log('✅ UserProfile - Ville mise à jour');
    } catch (error) {
      console.error('❌ UserProfile - Erreur mise à jour ville:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await handleAuthenticationError();
        return;
      }
      
      throw new Error('Failed to update city');
    }
  }, [user, isAuthenticated, safeStateUpdate, handleAuthenticationError]);

  /**
   * Effet d'initialisation avec nettoyage
   */
  useEffect(() => {
    // Configuration des intercepteurs axios
    const cleanupInterceptors = setupAxiosInterceptors();
    
    // Initialisation du profil utilisateur
    initializeUserProfile();

    // Nettoyage lors du démontage
    return () => {
      mountedRef.current = false;
      cleanupInterceptors();
      
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
        fetchControllerRef.current = null;
      }
    };
  }, [setupAxiosInterceptors, initializeUserProfile]);

  /**
   * Effet pour surveiller les changements d'authentification
   * Écoute les changements dans AsyncStorage (par exemple depuis useAuth)
   */
  useEffect(() => {
    const checkAuthPeriodically = () => {
      const interval = setInterval(async () => {
        if (mountedRef.current) {
          const currentAuth = await checkAuthenticationStatus();
          
          // Si l'état d'authentification a changé
          if (currentAuth !== isAuthenticated) {
            if (currentAuth) {
              // Nouvelle authentification détectée
              await initializeUserProfile();
            } else {
              // Déconnexion détectée
              await handleAuthenticationError();
            }
          }
        }
      }, 5000); // Vérification toutes les 5 secondes

      return () => clearInterval(interval);
    };

    const cleanup = checkAuthPeriodically();
    return cleanup;
  }, [isAuthenticated, checkAuthenticationStatus, initializeUserProfile, handleAuthenticationError]);

  // ✅ Context value avec signatures parfaitement compatibles
  const value: UserProfileContextType = {
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