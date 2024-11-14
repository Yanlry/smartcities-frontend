import AsyncStorage from '@react-native-async-storage/async-storage';

export const useToken = () => {
  const setToken = async (token: string) => {
    await AsyncStorage.setItem('accessToken', token);
  };

  const getToken = async () => {
    return await AsyncStorage.getItem('accessToken');
  };

  const clearToken = async () => {
    await AsyncStorage.removeItem('accessToken');
  };

  return { setToken, getToken, clearToken };
};
