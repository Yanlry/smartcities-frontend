import axios from 'axios';

export const fetchConfig = async () => {
  try {
    const response = await axios.get('http://localhost:3000/config'); // Adapte l'URL selon ton backend
    const { apiUrl, mapsApiKey } = response.data;

    console.log('API URL:', apiUrl);
    console.log('Maps API Key:', mapsApiKey);

    return { apiUrl, mapsApiKey };
  } catch (error) {
    console.error('Erreur lors de la récupération des variables de configuration:', error);
    throw error;
  }
};
