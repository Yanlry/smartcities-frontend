import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore
import { API_URL } from "@env";

const isTokenExpired = (token: string): boolean => {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload)); 
    return Date.now() >= exp * 1000; 
  } catch (error) {
    console.error("Erreur lors de la vérification de l'expiration du token :", error);
    return true; 
  }
};

export function useToken() {
  const setToken = async (token: string) => {
    console.log("Stockage du token d'accès :", token);
    await AsyncStorage.setItem('authToken', token);
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
  
    if (token && !isTokenExpired(token)) {
      return token;
    }
  
    console.log("Token expiré ou non disponible, tentative de rafraîchissement...");
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      return refreshedToken;
    }
  
    console.warn("Impossible de récupérer un token valide."); 
    return null;
  };

  const clearToken = async () => {
    console.log("Suppression de l'access token.");
    await AsyncStorage.removeItem('authToken');
  };

  const setRefreshToken = async (refreshToken: string) => {
    await AsyncStorage.setItem('refreshToken', refreshToken);
  };

  const getRefreshToken = async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.warn("Aucun refresh token disponible pour rafraîchir le token d'accès."); 
    } else {
      console.log("Refresh token récupéré");
    }
    return refreshToken;
  };

  const clearRefreshToken = async () => {
    console.log("Suppression du refresh token.");
    await AsyncStorage.removeItem('refreshToken');
  };

  const refreshAccessToken = async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.warn('Aucun refresh token disponible pour rafraîchir le token d\'accès.'); 
      return null;
    }
  
    try {
      console.log("Envoi du refresh token au backend...");
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
  
      if (!response.ok) {
        console.warn('Échec du rafraîchissement du token d\'accès, réponse non OK.'); 
        return null;
      }
  
      const { accessToken, refreshToken: newRefreshToken } = await response.json();
  
      await setToken(accessToken);
      if (newRefreshToken) {
        await setRefreshToken(newRefreshToken);
      }
  
      return accessToken;
    } catch (error) {
      console.warn('Erreur lors du rafraîchissement du token d\'accès :', error); 
      return null;
    }
  };
  const setUserId = async (userId: number) => {
    console.log('Stockage du userId dans AsyncStorage :', userId);
    await AsyncStorage.setItem('userId', userId.toString());
  };

  const getUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : null;
  };

  const clearUserId = async () => {
    console.log("Suppression de l'ID utilisateur.");
    await AsyncStorage.removeItem('userId');
  };

  const clearAll = async () => {
    console.log("Suppression de toutes les données stockées.");
    await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userId']);
  };

  return {
    setToken,
    getToken,
    clearToken,
    setRefreshToken,
    getRefreshToken,
    clearRefreshToken,
    refreshAccessToken,
    setUserId,
    getUserId,
    clearUserId,
    clearAll,
  };
}