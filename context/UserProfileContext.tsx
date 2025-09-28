// Chemin : context/UserProfileContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';
import { User, UserStats } from '../types/entities/user.types';

/**
 * 🔧 Configuration des clés de stockage (EXACTEMENT les mêmes que useToken)
 * ⚠️ IMPORTANT: Ces clés correspondent à celles dans useToken
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken', 
  USER_ID: 'userId',
} as const;

/**
 * 📊 Interface pour le résumé des votes
 */
interface VoteSummary {
  up: number;
  down: number;
}

/**
 * 🎭 Interface pour le contexte du profil utilisateur
 */
interface UserProfileContextType {
  user: User | null;
  displayName: string;
  voteSummary: VoteSummary;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  updateProfileImage: (uri: string) => Promise<boolean>;
  updateUserDisplayPreference: (useFullName: boolean) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  updateUserCity: (nomCommune: string, codePostal: string) => Promise<void>;
}

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

export const useUserProfile = () => useContext(UserProfileContext);

/**
 * 🔐 Gestionnaire de tokens harmonisé avec useToken
 */
const TokenManager = {
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('🔍 Token récupéré:', token ? `Présent (${token.substring(0, 20)}...)` : 'Absent');
      return token;
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  },

  async getUserId(): Promise<number | null> {
    try {
      const userIdStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      console.log('🆔 UserId récupéré:', userId);
      return userId;
    } catch (error) {
      console.error('❌ Erreur récupération userId:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      console.log('🔄 Refresh token:', refreshToken ? 'Présent' : 'Absent');
      return refreshToken;
    } catch (error) {
      console.error('❌ Erreur récupération refresh token:', error);
      return null;
    }
  },

  /**
   * 🛡️ Validation simplifiée du token (le serveur fait la vraie validation)
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.log('⚠️ Aucun token trouvé');
        return false;
      }

      // ✅ Validation basique du format JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('⚠️ Format token invalide');
        return false;
      }

      try {
        // ✅ Tentative de décodage du payload (mais on ne fait pas de validation d'expiration côté client)
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        console.log('✅ Token format valide, payload décodé');
        
        // ⚠️ On ne vérifie PAS l'expiration côté client car cela peut causer des problèmes
        // Le serveur s'occupera de valider l'expiration
        return true;
      } catch (decodeError) {
        console.log('⚠️ Erreur décodage payload:', decodeError);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      return false;
    }
  },

  /**
   * 🧹 Nettoyage complet des données d'authentification
   */
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_ID,
      ]);
      console.log('🧹 Données d\'authentification nettoyées');
    } catch (error) {
      console.error('❌ Erreur nettoyage données auth:', error);
    }
  }
};

/**
 * 🔧 Utilitaires pour le calcul des données utilisateur
 */
const UserUtils = {
  getDisplayName(user: User | null): string {
    if (!user) return '';
    return user.useFullName 
      ? `${user.lastName} ${user.firstName}`.trim()
      : user.username || `${user.firstName} ${user.lastName}`.trim();
  },

  calculateVoteSummary(user: User | null): VoteSummary {
    if (!user || !user.votes) {
      return { up: 0, down: 0 };
    }

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
 * 🚀 Provider component ultra-optimisé
 */
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [voteSummary, setVoteSummary] = useState<VoteSummary>({ up: 0, down: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const mountedRef = useRef(true);
  const fetchControllerRef = useRef<AbortController | null>(null);
  const displayName = UserUtils.getDisplayName(user);

  /**
   * 🔒 Mise à jour sécurisée de l'état
   */
  const safeStateUpdate = useCallback((updater: () => void) => {
    if (mountedRef.current) {
      updater();
    }
  }, []);

  /**
   * 🌐 Configuration axios avec intercepteur automatique
   */
  const setupAxiosInterceptors = useCallback(() => {
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

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('🔒 Token expiré détecté par le serveur');
          await handleAuthenticationError();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  /**
   * ⚠️ Gestion des erreurs d'authentification
   */
  const handleAuthenticationError = useCallback(async () => {
    console.log('🚨 Gestion erreur authentification');
    
    safeStateUpdate(() => {
      setIsAuthenticated(false);
      setUser(null);
      setVoteSummary({ up: 0, down: 0 });
      setError('Session expirée');
      setLoading(false);
    });

    await TokenManager.clearAuthData();
  }, [safeStateUpdate]);

  /**
   * 🔍 Vérification d'authentification SIMPLIFIÉE
   */
  const checkAuthenticationStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Vérification du statut d\'authentification...');
      
      const [token, userId] = await Promise.all([
        TokenManager.getToken(),
        TokenManager.getUserId(),
      ]);

      // ✅ Vérification simple : token ET userId présents
      const hasCredentials = !!(token && userId);
      
      if (hasCredentials) {
        // ✅ Validation basique du format du token
        const isTokenFormatValid = await TokenManager.isTokenValid();
        
        if (isTokenFormatValid) {
          console.log('✅ Authentification valide');
          safeStateUpdate(() => setIsAuthenticated(true));
          return true;
        } else {
          console.log('❌ Format token invalide');
          await TokenManager.clearAuthData();
        }
      } else {
        console.log('❌ Credentials manquants');
      }

      safeStateUpdate(() => setIsAuthenticated(false));
      return false;
    } catch (error) {
      console.error('❌ Erreur vérification authentification:', error);
      safeStateUpdate(() => setIsAuthenticated(false));
      return false;
    }
  }, [safeStateUpdate]);

  /**
   * 📡 Récupération des données utilisateur optimisée
   */
  const fetchUserProfile = useCallback(async (userId: number): Promise<void> => {
    try {
      console.log(`🔍 UserProfile - Récupération profil pour userId: ${userId}`);
      
      safeStateUpdate(() => {
        setLoading(true);
        setError(null);
      });

      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }

      fetchControllerRef.current = new AbortController();
      const { signal } = fetchControllerRef.current;

      const token = await TokenManager.getToken();
      if (!token) {
        throw new Error('Aucun token d\'authentification disponible');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      console.log('📡 Envoi de la requête vers:', `${API_URL}/users/${userId}`);

      // 🚀 Requêtes parallèles optimisées
      const [userResponse, statsResponse] = await Promise.allSettled([
        fetch(`${API_URL}/users/${userId}`, { signal, headers }),
        fetch(`${API_URL}/users/stats/${userId}`, { signal, headers }),
      ]);

      // 📊 Traitement de la réponse utilisateur
      if (userResponse.status === 'fulfilled') {
        console.log('📡 Réponse utilisateur reçue:', userResponse.value.status);
        
        if (!userResponse.value.ok) {
          if (userResponse.value.status === 401) {
            console.log('🔒 Erreur 401 - Token invalide');
            await handleAuthenticationError();
            return;
          }
          throw new Error(`Erreur HTTP ${userResponse.value.status}`);
        }
        
        const userData: User = await userResponse.value.json();
        console.log('✅ Données utilisateur récupérées:', userData.firstName);
        
        safeStateUpdate(() => {
          setUser(userData);
          const summary = UserUtils.calculateVoteSummary(userData);
          setVoteSummary(summary);
        });
      } 

      // 📈 Traitement des statistiques (non critique)
      if (statsResponse.status === 'fulfilled' && statsResponse.value.ok) {
        try {
          const statsData: UserStats = await statsResponse.value.json();
          console.log('📈 Statistiques récupérées');
          
          if (statsData.votes) {
            const summary = statsData.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'up') acc.up++;
                else if (vote.type === 'down') acc.down++;
                return acc;
              },
              { up: 0, down: 0 }
            );
            
            safeStateUpdate(() => setVoteSummary(summary));
          }
        } catch (statsError) {
          console.warn('⚠️ Erreur traitement stats:', statsError);
        }
      }

      safeStateUpdate(() => setLoading(false));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Requête annulée');
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
   * 🚀 Initialisation du profil utilisateur
   */
  const initializeUserProfile = useCallback(async () => {
    try {
      console.log('🚀 UserProfile - Initialisation...');

      const isAuth = await checkAuthenticationStatus();
      
      if (isAuth) {
        const userId = await TokenManager.getUserId();
        if (userId) {
          await fetchUserProfile(userId);
        } else {
          console.error('❌ UserId manquant malgré l\'authentification');
          await handleAuthenticationError();
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
  }, [checkAuthenticationStatus, fetchUserProfile, safeStateUpdate, handleAuthenticationError]);

  /**
   * 🔄 Rafraîchissement des données utilisateur
   */
  const refreshUserData = useCallback(async () => {
    try {
      console.log('🔄 UserProfile - Rafraîchissement des données...');
      
      const isAuth = await checkAuthenticationStatus();
      
      if (isAuth) {
        const userId = await TokenManager.getUserId();
        if (userId) {
          await fetchUserProfile(userId);
        } else {
          console.error('❌ UserId manquant lors du refresh');
          await handleAuthenticationError();
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
   * 📸 Mise à jour de l'image de profil
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
   * ⚙️ Mise à jour des préférences d'affichage
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
   * 🏙️ Mise à jour de la ville
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
   * 🎯 Effet d'initialisation avec nettoyage optimisé
   */
  useEffect(() => {
    const cleanupInterceptors = setupAxiosInterceptors();
    initializeUserProfile();

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
   * 👂 Écoute des changements dans AsyncStorage pour détecter les nouveaux tokens
   */
  useEffect(() => {
    let pollingInterval: ReturnType<typeof setInterval>;
    
    const checkForTokenChanges = async () => {
      if (!mountedRef.current) return;
      
      try {
        const [currentToken, currentUserId] = await Promise.all([
          TokenManager.getToken(),
          TokenManager.getUserId(),
        ]);
        
        // Si on détecte un nouveau token et qu'on n'était pas authentifié
        if (currentToken && currentUserId && !isAuthenticated) {
          console.log('🔄 Nouveau token détecté - réinitialisation du profil');
          await initializeUserProfile();
        }
        // Si le token a disparu et qu'on était authentifié
        else if (!currentToken && isAuthenticated) {
          console.log('🚫 Token supprimé détecté - déconnexion');
          await handleAuthenticationError();
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification des tokens:', error);
      }
    };

    // Vérification toutes les 2 secondes (optimisé pour la réactivité)
    pollingInterval = setInterval(checkForTokenChanges, 2000);
    
    // Vérification immédiate
    checkForTokenChanges();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isAuthenticated, initializeUserProfile, handleAuthenticationError]);

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