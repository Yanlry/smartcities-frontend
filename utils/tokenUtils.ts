import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

export const getUserIdFromToken = async (): Promise<number | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken'); // Corrige la clé ici
    console.log('Token récupéré dans AsyncStorage:', token);

    if (!token) {
      console.error('Aucun token trouvé dans AsyncStorage.');
      return null;
    }

    const decoded: { userId: number } = jwtDecode(token); // Décoder le token JWT
    console.log('Payload décodé du token:', decoded);

    return decoded.userId; // Retourne l'ID utilisateur
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};
