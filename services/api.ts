import axios from "axios";
import polyline from "@mapbox/polyline";
const MY_URL = process.env.MY_URL;
export const ORS_API_KEY =  process.env.ORS_API_KEY;

export const api = axios.create({
  baseURL: `${MY_URL}`, // Base URL de votre API
  timeout: 10000, // Timeout en millisecondes
});


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
          Authorization: ORS_API_KEY,
        },
      }
    );

    const distanceInMeters = response.data.routes[0].summary.distance;
    return distanceInMeters / 1000; // Convertir en kilomètres
  } catch (error) {
    console.error("Erreur lors de la récupération de la distance GPS :", error);
    return null;
  }
};

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
          Authorization: ORS_API_KEY,
        },
      }
    );

    const decodedCoordinates = polyline
      .decode(response.data.routes[0].geometry, 5)
      .map(([latitude, longitude]) => ({ latitude, longitude }));

    return decodedCoordinates;
  } catch (error) {
    console.error("Erreur lors de la récupération du tracé :", error);
    throw new Error("Impossible de récupérer le tracé de trajet.");
  }
};

export const fetchReportDetails = async (
  reportId: number,
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    const response = await axios.get(
      `${MY_URL}/reports/${reportId}`,
      {
        params: {
          latitude,
          longitude,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
    throw new Error("Impossible de récupérer les détails du signalement.");
  }
};

export const voteOnReport = async (
  reportId: number,
  userId: number,
  type: string,
  latitude: number,
  longitude: number
) => {
  const response = await axios.post(`/api/votes`, {
    reportId,
    userId,
    type,
    latitude,
    longitude,
  });

  return response.data;
};
