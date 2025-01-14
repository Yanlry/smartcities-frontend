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

export interface Event {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
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
    console.error("Erreur dans fetchAllEventsInRegion :", error.response?.data || error.message);
    throw new Error("Impossible de récupérer les événements.");
  }
};

/**
 * Récupère les signalements dans un rayon donné.
 */
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
    console.error("Erreur dans fetchReports :", error.response?.data || error.message);
    throw new Error("Impossible de récupérer les signalements.");
  }
};

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

const distanceCache = new Map<string, number[]>(); // Cache global pour les distances
/**
 * Calcule les distances de conduite en utilisant OpenRouteService.
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// FONCTION ORIGINALE --------------------
// export const fetchDrivingDistances = async (
//   origin: [number, number],
//   destinations: [number, number][]
// ): Promise<number[]> => {
//   const cacheKey = `${JSON.stringify(origin)}:${JSON.stringify(destinations)}`;
  
//   if (distanceCache.has(cacheKey)) {
//     console.log("Distances récupérées depuis le cache.");
//     return distanceCache.get(cacheKey)!;
//   }

//   try {
//     await delay(1500); // Délai pour respecter les quotas API

//     const response = await axios.post(
//       'https://api.openrouteservice.org/v2/matrix/driving-car',
//       {
//         locations: [origin, ...destinations],
//         metrics: ['distance'],
//       },
//       {
//         headers: {
//           Authorization: ORS_API_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (!response.data?.distances || response.data.distances.length === 0) {
//       throw new Error("Aucune distance retournée par OpenRouteService.");
//     }

//     const distances = response.data.distances[0].slice(1); // Exclut l'origine
//     distanceCache.set(cacheKey, distances);
//     return distances;
//   } catch (error: any) {
//     console.error("Erreur dans fetchDrivingDistances :", error.response?.data || error.message);

//     if (error.response?.data?.error === "Quota exceeded") {
//       console.warn("Quota dépassé pour OpenRouteService. Retour par défaut.");
//       return destinations.map(() => Infinity); // Fallback
//     }

//     throw new Error("Impossible de calculer les distances.");
//   }
// };

// FONCTION ORIGINALE  --------------------
// export const fetchAllReportsInRegion = async (
//   latitude: number,
//   longitude: number,
//   radiusKm: number = 2000
// ): Promise<Report[]> => {
//   try {
//     const rawReports = await fetchReports(latitude, longitude, radiusKm);

//     if (rawReports.length === 0) {
//       console.log("Aucun signalement trouvé dans la région.");
//       return [];
//     }

//     const destinations: [number, number][] = rawReports.map((report) => [
//       report.longitude,
//       report.latitude,
//     ]);

//     const distances = await fetchDrivingDistances([longitude, latitude], destinations);

//     const enrichedReports = rawReports.map((report, index) => ({
//       ...report,
//       distance: distances[index] / 1000 || Infinity, // Convertit en km
//     }));

//     return enrichedReports.sort((a, b) => a.distance - b.distance); // Trie par distance
//   } catch (error: any) {
//     console.error("Erreur dans fetchAllReportsInRegion :", error.message);
//     throw new Error("Impossible de charger les signalements enrichis.");
//   }
// };

// CALCUER LA DISTANCE ENTRE DEUX POINTS APPROXIMATIVE

// Traite les signalements et retourne les plus proches.
export const processReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000,
  limit: number = 10
): Promise<Report[]> => {
  try {
    const enrichedReports = await fetchAllReportsInRegion(latitude, longitude, radiusKm);

    return enrichedReports.slice(0, limit); // Limite les résultats
  } catch (error: any) {
    console.error("Erreur dans processReports :", error.message);
    throw new Error("Impossible de traiter les signalements.");
  }
};

// FONCTION DE REMPLACEMENT 1
// export const fetchDrivingDistances = async (
//   origin: [number, number],
//   destinations: [number, number][]
// ): Promise<number[]> => {
//   const cacheKey = `${JSON.stringify(origin)}:${JSON.stringify(destinations)}`;
  
//   if (distanceCache.has(cacheKey)) {
//     console.log("Distances récupérées depuis le cache.");
//     return distanceCache.get(cacheKey)!;
//   }

//   try {
//     await delay(1500); // Délai pour respecter les quotas API

//     const response = await axios.post(
//       'https://api.openrouteservice.org/v2/matrix/driving-car',
//       {
//         locations: [origin, ...destinations],
//         metrics: ['distance'],
//       },
//       {
//         headers: {
//           Authorization: ORS_API_KEY,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (!response.data?.distances || response.data.distances.length === 0) {
//       throw new Error("Aucune distance retournée par OpenRouteService.");
//     }

//     const distances = response.data.distances[0].slice(1); // Exclut l'origine
//     distanceCache.set(cacheKey, distances);
//     return distances;
//   } catch (error: any) {
//     console.error("Erreur dans fetchDrivingDistances :", error.response?.data || error.message);

//     // Vérification du quota dépassé
//     if (error.response?.data?.error === "Quota exceeded") {
//       console.warn("Quota dépassé pour OpenRouteService. Utilisation des distances infinies comme fallback.");
//       return destinations.map(() => Infinity); // Fallback : toutes les distances à l'infini
//     }

//     // Vérification d'une erreur 502
//     if (error.response?.status === 502) {
//       console.warn("502 Bad Gateway : ORS est temporairement indisponible. Fallback avec distances infinies.");
//       return destinations.map(() => Infinity); // Fallback
//     }

//     throw new Error("Impossible de calculer les distances.");
//   }
// };

// CALCUER LA DISTANCE ENTRE DEUX POINTS APPROXIMATIVE
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
};

// FONCTION DE REMPLACEMENT APPROX
export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  const cacheKey = `${JSON.stringify(origin)}:${JSON.stringify(destinations)}`;

  if (distanceCache.has(cacheKey)) {
    console.log("Distances récupérées depuis le cache.");
    return distanceCache.get(cacheKey)!;
  }

  try {
    await delay(1500); // Respect des quotas API

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
      console.warn("Aucune distance retournée par OpenRouteService.");
      return destinations.map(() => Infinity); // Fallback
    }

    const distances = response.data.distances[0].slice(1); // Exclut l'origine
    distanceCache.set(cacheKey, distances);
    return distances;
  } catch (error: any) {
    console.warn("Erreur dans fetchDrivingDistances :", error.message || "Erreur inconnue");

    // Utiliser le fallback Haversine
    const fallbackDistances = destinations.map(([lon, lat]) =>
      calculateHaversineDistance(origin[1], origin[0], lat, lon)
    );

    // Mettre en cache les distances fallback
    distanceCache.set(cacheKey, fallbackDistances);
    return fallbackDistances;
  }
};

// FONCTION DE REMPLACEMENT APPROX
export const fetchAllReportsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
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
    console.warn("Erreur dans fetchAllReportsInRegion :", error.message || "Erreur inconnue.");
    return []; // Retourner une liste vide en cas d'échec
  }
};