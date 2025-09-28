// Chemin : services/authService.ts

import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';

/**
 * Service d'authentification COMPLET avec vérifications en temps réel
 * Compatible avec votre structure existante
 */

// Fonction de connexion existante (inchangée)
export const login = async (email: string, password: string) => {
  return await axios.post(`${API_URL}/auth/login`, { email, password });
};

// Fonction d'inscription existante (inchangée)
export const register = async (email: string, password: string, lastName: string, firstName: string, username: string, photoUrls: string[], cityData: { nom_commune: string; code_postal: string; latitude: number; longitude: number }) => {
  return await axios.post(`${API_URL}/auth/signup`, {
    email,
    password,
    lastName,
    firstName,
    username,
    photoUrls,
    ...cityData,
  });
};

/**
 * NOUVELLE FONCTION: Vérification de la disponibilité d'un nom d'utilisateur
 * @param username - Le nom d'utilisateur à vérifier
 * @returns Promise<boolean> - true si disponible, false si pris
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    // Validation côté client
    if (!username || username.trim().length < 3) {
      throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
    }

    console.log(`🔍 Vérification disponibilité username: ${username}`);

    // Appel API pour vérifier l'unicité
    const response = await axios.post(`${API_URL}/auth/check-username`, {
      username: username.trim().toLowerCase()
    });

    // Si la requête passe, le username est disponible
    console.log(`✅ Username "${username}" disponible`);
    return true;

  } catch (error: any) {
    
    // Gestion spécifique des erreurs HTTP
    if (error.response) {
      const status = error.response.status;
      
      if (status === 409) {
        // 409 Conflict = nom d'utilisateur déjà pris
        console.log(`❌ Username "${username}" déjà pris`);
        return false;
      } else if (status === 400) {
        // 400 Bad Request = données invalides
        throw new Error('Nom d\'utilisateur invalide');
      } else if (status >= 500) {
        // Erreur serveur
        throw new Error('Erreur serveur. Veuillez réessayer.');
      }
    }
    
    // En cas d'erreur réseau, on peut choisir de retourner true 
    // pour ne pas bloquer l'utilisateur (à ajuster selon vos besoins)
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
      console.warn('Problème de connexion réseau - autorisation par défaut');
      return true;
    }
    
    throw error;
  }
};

/**
 * NOUVELLE FONCTION: Vérification de la disponibilité d'une adresse email
 * @param email - L'email à vérifier
 * @returns Promise<boolean> - true si disponible, false si pris
 */
export const checkEmailAvailability = async (email: string): Promise<boolean> => {
  try {
    // Validation côté client
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }

    console.log(`🔍 Vérification disponibilité email: ${email}`);

    // Appel API pour vérifier l'unicité
    const response = await axios.post(`${API_URL}/auth/check-email`, {
      email: email.trim().toLowerCase()
    });

    // Si la requête passe, l'email est disponible
    console.log(`✅ Email "${email}" disponible`);
    return true;

  } catch (error: any) {
    
    // Gestion spécifique des erreurs HTTP
    if (error.response) {
      const status = error.response.status;
      
      if (status === 409) {
        // 409 Conflict = email déjà utilisé
        console.log(`❌ Email "${email}" déjà utilisé`);
        return false;
      } else if (status === 400) {
        // 400 Bad Request = données invalides
        throw new Error('Adresse email invalide');
      } else if (status >= 500) {
        // Erreur serveur
        throw new Error('Erreur serveur. Veuillez réessayer.');
      }
    }
    
    // En cas d'erreur réseau, on peut choisir de retourner true 
    // pour ne pas bloquer l'utilisateur (à ajuster selon vos besoins)
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
      console.warn('Problème de connexion réseau - autorisation par défaut');
      return true;
    }
    
    throw error;
  }
};

/**
 * NOUVELLE FONCTION: Vérification batch (nom d'utilisateur + email en une seule fois)
 * Utile pour la vérification finale avant inscription
 * @param username - Le nom d'utilisateur
 * @param email - L'email
 * @returns Promise<{usernameAvailable: boolean, emailAvailable: boolean}>
 */
export const checkBothAvailability = async (username: string, email: string): Promise<{
  usernameAvailable: boolean;
  emailAvailable: boolean;
}> => {
  try {
    console.log(`🔍 Vérification groupée username: ${username}, email: ${email}`);

    const response = await axios.post(`${API_URL}/auth/check-both`, {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase()
    });

    const result = {
      usernameAvailable: response.data?.usernameAvailable || false,
      emailAvailable: response.data?.emailAvailable || false,
    };

    console.log('✅ Vérification groupée terminée:', result);
    return result;

  } catch (error: any) {
    console.error('Erreur lors de la vérification groupée:', error);
    
    // En cas d'erreur, faire les vérifications séparément
    console.log('🔄 Fallback: vérifications séparées...');
    
    try {
      const [usernameResult, emailResult] = await Promise.allSettled([
        checkUsernameAvailability(username),
        checkEmailAvailability(email)
      ]);

      return {
        usernameAvailable: usernameResult.status === 'fulfilled' ? usernameResult.value : false,
        emailAvailable: emailResult.status === 'fulfilled' ? emailResult.value : false,
      };
    } catch (fallbackError) {
      console.error('Erreur dans le fallback:', fallbackError);
      
      // En dernier recours, retourner false pour être sûr
      return {
        usernameAvailable: false,
        emailAvailable: false,
      };
    }
  }
};

// Export par défaut d'un objet avec toutes les fonctions
const authService = {
  login,
  register,
  checkUsernameAvailability,
  checkEmailAvailability,
  checkBothAvailability,
};

export default authService;