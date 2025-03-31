import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; 


export const getUserIdFromToken = async (): Promise<number | null> => {
  try {
    const token = await AsyncStorage.getItem('authToken');

    if (!token) {
      console.warn('Aucun token trouvé dans AsyncStorage.');
      return null;
    }
 
    const decoded: { userId: number } = jwtDecode(token);

    return decoded.userId || null;
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    return null;
  }
};