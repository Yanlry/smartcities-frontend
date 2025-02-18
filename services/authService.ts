import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';


export const login = async (email: string, password: string) => {
  return await axios.post(`${API_URL}/auth/login`, { email, password });
};

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