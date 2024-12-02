import axios from 'axios';
// @ts-ignore
import { API_URL } from '@env';


export const login = async (email: string, password: string) => {
  return await axios.post(`${API_URL}/auth/login`, { email, password });
};

export const register = async (email: string, password: string, username: string, lastName:string, firstName: string ) => {
  return await axios.post(`${API_URL}/auth/signup`, { email, password, username, lastName, firstName });
};
