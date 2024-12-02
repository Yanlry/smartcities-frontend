import axios from "axios";
import polyline from "@mapbox/polyline";
// @ts-ignore
import { API_URL, ORS_API_KEY } from "@env"; // Import des variables depuis .env

// Création de l'instance Axios avec la base URL de l'API
export const api = axios.create({
  baseURL: API_URL, // Base URL provenant de .env
  timeout: 10000, // Timeout en millisecondes
});

// Fonction pour récupérer la distance de conduite
export const fetchDrivingDistance = async (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<number | null> => {
  try {

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [
          [startLon, startLat],
          [endLon, endLat],
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${ORS_API_KEY}`, // Ajout de "Bearer" pour l'en-tête
        },
      }
    );

    const distanceInMeters = response.data.routes[0].summary.distance;
    return distanceInMeters / 1000; // Convertir en kilomètres
  } catch (error: any) {
    console.error("Erreur dans fetchDrivingDistance :", error.response?.data || error.message);
    return null;
  }
};

// Fonction pour récupérer les coordonnées du trajet
export const fetchRoute = async (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<Array<{ latitude: number; longitude: number }>> => {
  try {

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car",
      {
        coordinates: [
          [startLon, startLat],
          [endLon, endLat],
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${ORS_API_KEY}`, // Ajout de "Bearer" pour l'en-tête
        },
      }
    );

    const decodedCoordinates = polyline
      .decode(response.data.routes[0].geometry, 5)
      .map(([latitude, longitude]) => ({ latitude, longitude }));

    return decodedCoordinates;
  } catch (error: any) {
    console.error("Erreur dans fetchRoute :", error.response?.data || error.message);
    throw new Error("Impossible de récupérer le tracé de trajet.");
  }
};

// Fonction pour récupérer les détails d'un signalement
export const fetchReportDetails = async (
  reportId: number,
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_URL}/reports/${reportId}`,
      {
        params: {
          latitude,
          longitude,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Erreur dans fetchReportDetails :", error.response?.data || error.message);
    throw new Error("Impossible de récupérer les détails du signalement.");
  }
};

// Fonction pour voter sur un signalement
export const voteOnReport = async (
  reportId: number,
  userId: number,
  type: string,
  latitude: number,
  longitude: number
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/votes`,
      {
        reportId,
        userId,
        type,
        latitude,
        longitude,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Erreur dans voteOnReport :", error.response?.data || error.message);
    throw new Error("Impossible d'envoyer le vote.");
  }
};
