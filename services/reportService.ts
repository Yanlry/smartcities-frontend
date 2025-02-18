import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
// @ts-ignore
import { API_URL, ORS_API_KEY } from "@env";

export interface Photo {
  id: number;
  url: string;
}

export interface Report {
  id: number;
  type: string;
  title: string;
  description: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  distance?: number;
  createdAt: string;
  photos: Photo[];
  upVotes: number;
  downVotes: number;
}

export interface Event {
  id: number;
  location: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  date: string;  
  createdAt: string;
  endDate: string;
  distance?: number;
}

export const fetchAllEventsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
): Promise<Event[]> => {
  try {
    const response = await axios.get(`${API_URL}/events`, {
      params: { latitude, longitude, radiusKm },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur dans fetchAllEventsInRegion :",
      error.response?.data || error.message
    );
    throw new Error("Impossible de récupérer les événements.");
  }
};
  
export const fetchReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
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
    console.error(
      "❌ Erreur dans fetchReports :",
      error.response?.data || error.message
    );
    throw new Error("Impossible de récupérer les signalements.");
  }
};

export const createReport = async (data: any): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      console.warn('Aucun token trouvé dans AsyncStorage.');
      return null;
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
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la création du signalement :",
      error.response?.data || error.message
    );
    throw new Error("Impossible de créer le signalement.");
  }
};

const distanceCache = new Map<string, number[]>();  
 
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
 
export const processReports = async (
  latitude: number,
  longitude: number,
  category?: string,   
  city?: string
): Promise<Report[]> => {
  try {
    let reports = await fetchAllReportsInRegion(latitude, longitude, 2000);
 
    if (category) {
      reports = reports.filter(report => report.type.toLowerCase() === category.toLowerCase());
    }
 
    if (city) {
      reports = reports.filter(report => report.city.toLowerCase().includes(city.toLowerCase()));
    }

    return reports;
  } catch (error: any) {
    console.error("Erreur dans processReports :", error.message);
    throw new Error("Impossible de traiter les signalements.");
  }
};
 
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; 
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;  
};
 
export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  const cacheKey = `${JSON.stringify(origin)}:${JSON.stringify(destinations)}`;

  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey)!;
  }

  try {
    await delay(1500);  

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/matrix/driving-car",
      {
        locations: [origin, ...destinations],
        metrics: ["distance"],
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data?.distances || response.data.distances.length === 0) {
      console.warn("Aucune distance retournée par OpenRouteService.");
      return destinations.map(() => Infinity);  
    }

    const distances = response.data.distances[0].slice(1);  
    distanceCache.set(cacheKey, distances);
    return distances;
  } catch (error: any) {
    console.warn(
      "Erreur dans fetchDrivingDistances :",
      error.message || "Erreur inconnue"
    );
 
    const fallbackDistances = destinations.map(([lon, lat]) =>
      calculateHaversineDistance(origin[1], origin[0], lat, lon)
    );
 
    distanceCache.set(cacheKey, fallbackDistances);
    return fallbackDistances;
  }
};
 
export const fetchAllReportsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
): Promise<Report[]> => {
  try {
    const rawReports = await fetchReports(latitude, longitude, radiusKm);

    if (rawReports.length === 0) {
      console.log("📌 Aucun signalement trouvé dans la région.");
      return [];
    }

    const destinations: [number, number][] = rawReports.map((report) => [
      report.longitude,
      report.latitude,
    ]);

    const distances = await fetchDrivingDistances(
      [longitude, latitude],
      destinations
    );

    const enrichedReports = rawReports.map((report, index) => ({
      ...report,
      distance: distances[index] / 1000 || Infinity,  
    }));

    return enrichedReports.sort((a, b) => a.distance - b.distance);
  } catch (error: any) {
    console.warn(
      "❌ Erreur dans fetchAllReportsInRegion :",
      error.message || "Erreur inconnue."
    );
    return [];
  }
};
