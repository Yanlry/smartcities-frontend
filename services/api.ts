import axios from "axios";
import polyline from "@mapbox/polyline";
// @ts-ignore
import { API_URL, ORS_API_KEY } from "@env";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const fetchReportDetails = async (
  reportId: number,
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/reports/${reportId}`, {
      params: {
        latitude,
        longitude,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur dans fetchReportDetails :",
      error.response?.data || error.message
    );
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
  try {
    const response = await axios.post(`${API_URL}/api/votes`, {
      reportId,
      userId,
      type,
      latitude,
      longitude,
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur dans voteOnReport :",
      error.response?.data || error.message
    );
    throw new Error("Impossible d'envoyer le vote.");
  }
};

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
          Authorization: `Bearer ${ORS_API_KEY}`,
        },
      }
    );

    const distanceInMeters = response.data.routes[0].summary.distance;
    return distanceInMeters / 1000;
  } catch (error: any) {
    console.warn(
      "Erreur dans fetchDrivingDistance :",
      error.message || "Erreur inconnue."
    );
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
          Authorization: `Bearer ${ORS_API_KEY}`,
        },
      }
    );

    const decodedCoordinates = polyline
      .decode(response.data.routes[0].geometry, 5)
      .map(([latitude, longitude]) => ({ latitude, longitude }));

    return decodedCoordinates;
  } catch (error: any) {
    console.warn(
      "Erreur dans fetchRoute :",
      error.message || "Erreur inconnue."
    );
    return [];
  }
};
