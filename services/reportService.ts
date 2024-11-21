import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
import { ORS_API_KEY } from './api';

export interface Report {
  id: number;
  type: string;
  title: string;
  latitude: number;
  longitude: number;
  distance: number;
  city: string;
  createdAt: string;
}

// Fonction pour récupérer les signalements
export const fetchReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {
  const MY_URL = "http://192.168.1.4:3000";

  const response = await axios.get(`${MY_URL}/reports`, {
    params: { latitude, longitude, radiusKm },
  });

  return response.data;
};

export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  try {
    // Vérifie que l'origine est un tableau de deux nombres valides
    if (
      !Array.isArray(origin) ||
      origin.length !== 2 ||
      typeof origin[0] !== 'number' ||
      typeof origin[1] !== 'number'
    ) {
      throw new Error("Origine invalide. 'origin' doit être un tableau de deux nombres.");
    }

    // Vérifie que les destinations sont valides
    if (
      !Array.isArray(destinations) ||
      destinations.length === 0 ||
      !destinations.every(
        (dest) =>
          Array.isArray(dest) &&
          dest.length === 2 &&
          typeof dest[0] === 'number' &&
          typeof dest[1] === 'number'
      )
    ) {
      throw new Error(
        "Destinations invalides. 'destinations' doit être un tableau de tableaux de deux nombres."
      );
    }

    // Effectue la requête si les validations passent
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

    // Vérifie si les distances sont retournées
    if (!response.data?.distances || response.data.distances.length === 0) {
      throw new Error('Aucune distance retournée par le service OpenRouteService.');
    }

    return response.data.distances[0].slice(1); // Exclut la distance vers soi-même
  } catch (error) {
    console.error('Erreur dans fetchDrivingDistances :', error.response?.data || error.message);
    throw error;
  }
};


// Fonction pour traiter les signalements avec une limite de 4
export const processReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {
  try {
    // Étape 1 : Récupérer les signalements
    const rawReports = await fetchReports(latitude, longitude, radiusKm);

    // Étape 2 : Préparer les destinations pour le calcul des distances
    const destinations: [number, number][] = rawReports.map((report) => [
      report.longitude,
      report.latitude,
    ]);

    // Étape 3 : Calculer les distances routières
    const distances = await fetchDrivingDistances([longitude, latitude], destinations);

    // Étape 4 : Enrichir les signalements avec leurs distances
    const enrichedReports = rawReports.map((report, index) => ({
      ...report,
      distance: distances[index] / 1000 || Infinity, // Convertir en kilomètres
    }));

    // Étape 5 : Trier les signalements par distance et limiter à 4
    return enrichedReports
      .sort((a, b) => a.distance - b.distance) // Trier par distance croissante
      .slice(0, 4); // Retourner les 4 premiers signalements
  } catch (error) {
    console.error('Erreur lors du traitement des signalements :', error);
    throw new Error('Impossible de traiter les signalements.');
  }
};

// Fonction pour créer un signalement
export const createReport = async (data: any) => {
  const MY_URL = "http://192.168.1.4:3000";

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
    const response = await axios.post(`${MY_URL}/reports`, reportData, {
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

