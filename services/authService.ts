import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.4:3000';

export const login = async (email: string, password: string) => {
  return await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
};

export const register = async (email: string, password: string, name: string) => {
  return await axios.post(`${API_BASE_URL}/auth/signup`, { email, password, name });
};
