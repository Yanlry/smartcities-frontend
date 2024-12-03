import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
// @ts-ignore
import { API_URL, ORS_API_KEY } from "@env"; // Import des variables depuis .env


export interface Photo {
  id: number;
  url: string;
}

export interface Report {
  id: number;
  type: string;
  title: string;
  latitude: number;
  longitude: number;
  distance: number;
  city: string;
  createdAt: string;
  photos: Photo[]; // Ajouter les photos
}

export const fetchReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {

  const response = await axios.get(`${API_URL}/reports`, {
    params: { latitude, longitude, radiusKm },
  });

  // Pas de transformation nécessaire, les photos sont déjà incluses
  return response.data;
};

export const fetchAllReportsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {
  try {
    const rawReports = await fetchReports(latitude, longitude, radiusKm);

    // Vérifier si aucun signalement n'a été trouvé
    if (rawReports.length === 0) {
      console.log('Aucun signalement trouvé dans la région.');
      return []; // Retourne un tableau vide
    }

    const destinations: [number, number][] = rawReports.map((report) => [
      report.longitude,
      report.latitude,
    ]);

    const distances = await fetchDrivingDistances([longitude, latitude], destinations);

    const enrichedReports = rawReports.map((report, index) => ({
      ...report,
      distance: distances[index] / 1000 || Infinity,
    }));

    return enrichedReports.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Erreur lors du chargement des signalements :', error);
    throw new Error('Impossible de récupérer tous les signalements.');
  }
};


export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  try {
    // Si destinations est vide, retourne un tableau vide
    if (!destinations || destinations.length === 0) {
      console.log("Aucune destination pour le calcul des distances.");
      return [];
    }

    const response = await axios.post(
      'https://api.openrouteservice.org/v2/matrix/driving-car',
      {
        locations: [origin, ...destinations],
        metrics: ['distance'],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data?.distances || response.data.distances.length === 0) {
      throw new Error('Aucune distance retournée par le service OpenRouteService.');
    }

    return response.data.distances[0].slice(1);
  } catch (error) {
    console.error('Erreur dans fetchDrivingDistances :', error.response?.data || error.message);
    throw error;
  }
};


export const processReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {
  try {
    const rawReports = await fetchReports(latitude, longitude, radiusKm);

    // Vérifier si aucun signalement n'a été trouvé
    if (rawReports.length === 0) {
      console.log('Aucun signalement à traiter.');
      return []; // Retourne un tableau vide
    }

    const destinations: [number, number][] = rawReports.map((report) => [
      report.longitude,
      report.latitude,
    ]);

    const distances = await fetchDrivingDistances([longitude, latitude], destinations);

    const enrichedReports = rawReports.map((report, index) => ({
      ...report,
      distance: distances[index] / 1000 || Infinity,
    }));

    return enrichedReports
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);
  } catch (error) {
    console.error('Erreur lors du traitement des signalements :', error);
    throw new Error('Impossible de traiter les signalements.');
  }
};


// Fonction pour créer un signalement
export const createReport = async (data: any) => {

  try {
    // Étape 1 : Récupérer le token depuis AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.error('Aucun token trouvé dans AsyncStorage.');
      throw new Error('Utilisateur non connecté');
    }

    console.log('Token utilisé pour la requête :', token);

    // Étape 2 : Décoder le token pour obtenir userId
    const decoded: any = jwtDecode(token);
    const userId = decoded.userId;

    console.log('ID utilisateur récupéré du token :', userId);

    // Étape 3 : Préparer les données à envoyer
    const reportData = {
      ...data,
      userId, // Utilise toujours l'userId depuis le token
    };

    console.log('Données envoyées au backend :', reportData);

    // Étape 4 : Envoyer la requête au backend
    const response = await axios.post(`${API_URL}/reports`, reportData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Réponse du backend :', response.data);

    return response.data; // Retourne les données de la réponse
  } catch (error) {
    console.error('Erreur lors de la création du signalement :', error.response?.data || error.message);
    throw error;
  }
};

