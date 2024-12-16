import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // Corrigez l'import ici si nécessaire

export const getUserIdFromToken = async (): Promise<number | null> => {
  try {
    // Récupérer le token depuis AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    console.log('Token récupéré dans AsyncStorage:', token);

    if (!token) {
      console.error('Aucun token trouvé dans AsyncStorage.');
      return null;
    }

    // Décoder le token JWT
    const decoded: { sub: number } = jwtDecode(token);
    console.log('Payload décodé du token:', decoded);

    // Retourner l'ID utilisateur depuis le champ "sub"
    return decoded.sub || null;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};