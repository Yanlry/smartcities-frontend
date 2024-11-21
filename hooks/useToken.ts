import AsyncStorage from '@react-native-async-storage/async-storage';

export function useToken() {
  // Gestion du token
  const setToken = async (token: string) => {
    console.log('Stockage du token dans AsyncStorage :', token);
    await AsyncStorage.setItem('authToken', token);
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    console.log('Token récupéré depuis AsyncStorage :', token);
    return token;
  };

  const clearToken = async () => {
    console.log('Suppression du token dans AsyncStorage...');
    await AsyncStorage.removeItem('authToken');
  };

  // Gestion de l'userId
  const setUserId = async (userId: number) => {
    console.log('Stockage du userId dans AsyncStorage :', userId);
    await AsyncStorage.setItem('userId', userId.toString());
  };

  const getUserId = async () => {
    const userId = await AsyncStorage.getItem('userId');
    console.log('userId récupéré depuis AsyncStorage :', userId);
    return userId ? parseInt(userId, 10) : null;
  };

  const clearUserId = async () => {
    console.log('Suppression du userId dans AsyncStorage...');
    await AsyncStorage.removeItem('userId');
  };

  // Nettoyage global
  const clearAll = async () => {
    console.log('Suppression de tous les tokens et identifiants...');
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userId');
  };

  return {
    setToken,
    getToken,
    clearToken,
    setUserId,
    getUserId,
    clearUserId,
    clearAll,
  };
}
