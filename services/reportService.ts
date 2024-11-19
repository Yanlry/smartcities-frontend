import axios from 'axios';
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
  const response = await axios.get('http://192.168.1.4:3000/reports', {
    params: { latitude, longitude, radiusKm },
  });
  
  return response.data;
};

// Fonction pour calculer les distances routières
export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  try {
    console.log('Envoi des données à OpenRouteService :', { origin, destinations });

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

    console.log('Réponse de OpenRouteService :', response.data);
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
    throw new Error("Impossible de traiter les signalements.");
  }
};
