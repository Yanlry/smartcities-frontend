import axios from 'axios';
const MY_URL =  "http://192.168.1.100:3000";


export const login = async (email: string, password: string) => {
  return await axios.post(`${MY_URL}/auth/login`, { email, password });
};

export const register = async (email: string, password: string, username: string, lastName:string, firstName: string ) => {
  return await axios.post(`${MY_URL}/auth/signup`, { email, password, username, lastName, firstName });
};
