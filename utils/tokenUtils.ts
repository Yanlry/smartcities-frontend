import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; 


export const getUserIdFromToken = async (): Promise<number | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Token récupéré dans AsyncStorage:', token);

    if (!token) {
      console.error('Aucun token trouvé dans AsyncStorage.');
      return null;
    }
 
    const decoded: { userId: number } = jwtDecode(token);
    console.log('Payload décodé du token:', decoded);

    return decoded.userId || null;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};