import axios from 'axios';

const api = axios.create({
  baseURL: 'http://ton-api-backend.com',  // Remplace par l'URL de ton backend
  timeout: 10000,
});

export default api;