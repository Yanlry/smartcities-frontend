import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
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

/**
 * Récupère les signalements dans un rayon donné.
 */
export const fetchReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {
  try {
    if (!latitude || !longitude) {
      throw new Error("Coordonnées invalides.");
    }

    const response = await axios.get(`${API_URL}/reports`, {
      params: { latitude, longitude, radiusKm },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur dans fetchReports :", error.response?.data || error.message);
    throw new Error("Impossible de récupérer les signalements.");
  }
};

const distanceCache = new Map<string, number[]>(); // Cache global pour les distances
/**
 * Calcule les distances de conduite en utilisant OpenRouteService.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  console.log("fetchDrivingDistances - Origin :", origin);
  console.log("fetchDrivingDistances - Destinations :", destinations);

  if (!destinations || destinations.length === 0) {
    console.log("Aucune destination pour le calcul des distances.");
    return [];
  }

  const uniqueDestinations = Array.from(new Set(destinations.map((d) => JSON.stringify(d)))).map((d) => JSON.parse(d));
  console.log("fetchDrivingDistances - Unique destinations :", uniqueDestinations);

  try {
    // Ajoutez un délai avant chaque requête pour limiter la fréquence
    await delay(1500); // 1,5 seconde entre les requêtes

    const response = await axios.post(
      'https://api.openrouteservice.org/v2/matrix/driving-car',
      {
        locations: [origin, ...uniqueDestinations],
        metrics: ['distance'],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("fetchDrivingDistances - Response :", response.data);

    if (!response.data?.distances || response.data.distances.length === 0) {
      throw new Error("Aucune distance retournée par OpenRouteService.");
    }

    return response.data.distances[0].slice(1); // Exclut l'origine
  } catch (error: any) {
    console.error("Erreur dans fetchDrivingDistances :", error.response?.data || error.message);

    if (error.response?.data?.error === "Quota exceeded") {
      console.warn("Quota dépassé pour OpenRouteService. Calcul approximatif des distances.");
      return destinations.map(() => Infinity); // Approximations
    }

    throw new Error("Impossible de calculer les distances.");
  }
};

/**
 * Récupère et enrichit les signalements dans une région donnée.
 */
export const fetchAllReportsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Report[]> => {
  try {
    const rawReports = await fetchReports(latitude, longitude, radiusKm);

    if (rawReports.length === 0) {
      console.log("Aucun signalement trouvé dans la région.");
      return [];
    }

    const destinations: [number, number][] = rawReports.map((report) => [
      report.longitude,
      report.latitude,
    ]);

    const distances = await fetchDrivingDistances([longitude, latitude], destinations);

    const enrichedReports = rawReports.map((report, index) => ({
      ...report,
      distance: distances[index] / 1000 || Infinity, // Convertit en km
    }));

    return enrichedReports.sort((a, b) => a.distance - b.distance); // Trie par distance
  } catch (error: any) {
    console.error("Erreur dans fetchAllReportsInRegion :", error.message);
    throw new Error("Impossible de charger les signalements enrichis.");
  }
};

/**
 * Traite les signalements et retourne les plus proches.
 */
export const processReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  limit: number = 4
): Promise<Report[]> => {
  try {
    const enrichedReports = await fetchAllReportsInRegion(latitude, longitude, radiusKm);

    return enrichedReports.slice(0, limit); // Limite les résultats
  } catch (error: any) {
    console.error("Erreur dans processReports :", error.message);
    throw new Error("Impossible de traiter les signalements.");
  }
};

/**
 * Crée un nouveau signalement.
 */
export const createReport = async (data: any): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      console.error("Aucun token trouvé dans AsyncStorage.");
      throw new Error("Utilisateur non connecté.");
    }

    const decoded: any = jwtDecode(token);
    const userId = decoded?.userId;

    if (!userId) {
      console.error("ID utilisateur introuvable dans le token.");
      throw new Error("Utilisateur non valide.");
    }

    const reportData = {
      ...data,
      userId,
    };

    const response = await axios.post(`${API_URL}/reports`, reportData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la création du signalement :", error.response?.data || error.message);
    throw new Error("Impossible de créer le signalement.");
  }
};