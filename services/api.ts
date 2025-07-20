// Chemin : src/services/api.ts

import axios, { AxiosError, AxiosResponse } from "axios";
import polyline from "@mapbox/polyline";
// @ts-ignore
import { API_URL, ORS_API_KEY } from "@env";

/**
 * Configuration de l'instance Axios principale
 */
export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Augmenté pour de meilleures performances
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Configuration Axios pour OpenRouteService
 */
const orsApi = axios.create({
  baseURL: 'https://api.openrouteservice.org/v2',
  timeout: 15000,
  headers: {
    'Authorization': `Bearer ${ORS_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Interface pour les détails d'un signalement
 */
export interface ReportDetails {
  id: number;
  type: string;
  title: string;
  description: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  distance?: number | null;
  createdAt: string;
  photos: Array<{ id: number; url: string }>;
  upVotes: number;
  downVotes: number;
}

/**
 * Interface pour les coordonnées de route
 */
export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Interface pour les résultats de vote
 */
export interface VoteResult {
  success: boolean;
  newUpVotes: number;
  newDownVotes: number;
  userVote: string | null;
}

/**
 * Cache pour les distances calculées
 */
const distanceCache = new Map<string, number>();
const routeCache = new Map<string, RouteCoordinate[]>();

/**
 * Délai pour limiter les appels API
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validation des coordonnées
 */
const isValidCoordinate = (lat: number, lon: number): boolean => {
  return (
    typeof lat === 'number' && 
    typeof lon === 'number' && 
    isFinite(lat) && 
    isFinite(lon) && 
    lat >= -90 && 
    lat <= 90 && 
    lon >= -180 && 
    lon <= 180
  );
};

/**
 * Récupère les détails d'un signalement
 * @param reportId ID du signalement
 * @param latitude Latitude de l'utilisateur
 * @param longitude Longitude de l'utilisateur
 * @returns Détails du signalement avec distance calculée
 */
export const fetchReportDetails = async (
  reportId: number,
  latitude: number,
  longitude: number
): Promise<ReportDetails> => {
  try {
    if (!isValidCoordinate(latitude, longitude)) {
      throw new Error("Coordonnées utilisateur invalides");
    }

    console.log(`📡 Récupération détails signalement ${reportId}...`);
    
    const response: AxiosResponse<ReportDetails> = await api.get(`/reports/${reportId}`, {
      params: { latitude, longitude },
    });

    // Calcul de la distance si les coordonnées du rapport sont valides
    if (isValidCoordinate(response.data.latitude, response.data.longitude)) {
      try {
        const distance = await fetchDrivingDistance(
          latitude,
          longitude,
          response.data.latitude,
          response.data.longitude
        );
        response.data.distance = distance;
      } catch (distanceError) {
        console.warn("⚠️ Impossible de calculer la distance:", distanceError);
        response.data.distance = null;
      }
    }

    console.log("✅ Détails signalement récupérés avec succès");
    return response.data;
    
  } catch (error: any) {
    console.error("❌ Erreur dans fetchReportDetails:", {
      reportId,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    
    if (error.response?.status === 404) {
      throw new Error("Signalement introuvable");
    } else if (error.response?.status >= 500) {
      throw new Error("Erreur serveur, veuillez réessayer");
    } else {
      throw new Error("Impossible de récupérer les détails du signalement");
    }
  }
};

/**
 * Envoie un vote sur un signalement
 * @param reportId ID du signalement
 * @param userId ID de l'utilisateur
 * @param type Type de vote ('up' ou 'down')
 * @param latitude Latitude de l'utilisateur
 * @param longitude Longitude de l'utilisateur
 * @returns Résultat du vote
 */
export const voteOnReport = async (
  reportId: number,
  userId: number,
  type: 'up' | 'down',
  latitude: number,
  longitude: number
): Promise<VoteResult> => {
  try {
    if (!isValidCoordinate(latitude, longitude)) {
      throw new Error("Coordonnées utilisateur invalides");
    }

    if (!['up', 'down'].includes(type)) {
      throw new Error("Type de vote invalide");
    }

    console.log(`🗳️ Envoi vote ${type} pour signalement ${reportId}...`);

    const response: AxiosResponse<VoteResult> = await api.post('/api/votes', {
      reportId,
      userId,
      type,
      latitude,
      longitude,
    });

    console.log("✅ Vote enregistré avec succès");
    return response.data;
    
  } catch (error: any) {
    console.error("❌ Erreur dans voteOnReport:", {
      reportId,
      userId,
      type,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    
    if (error.response?.status === 400) {
      throw new Error("Données de vote invalides");
    } else if (error.response?.status === 409) {
      throw new Error("Vous avez déjà voté sur ce signalement");
    } else {
      throw new Error("Impossible d'envoyer le vote");
    }
  }
};

/**
 * Calcule la distance de conduite entre deux points
 * @param startLat Latitude de départ
 * @param startLon Longitude de départ
 * @param endLat Latitude d'arrivée
 * @param endLon Longitude d'arrivée
 * @returns Distance en kilomètres ou null en cas d'erreur
 */
export const fetchDrivingDistance = async (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<number | null> => {
  try {
    // Validation des coordonnées
    if (!isValidCoordinate(startLat, startLon) || !isValidCoordinate(endLat, endLon)) {
      console.warn("❌ Coordonnées invalides pour le calcul de distance");
      return null;
    }

    // Vérification si les points sont très proches (distance quasi-nulle)
    const proximityThreshold = 0.0001; // ~11 mètres
    if (
      Math.abs(startLat - endLat) < proximityThreshold &&
      Math.abs(startLon - endLon) < proximityThreshold
    ) {
      return 0; // Distance nulle
    }

    // Vérification du cache
    const cacheKey = `${startLat},${startLon}-${endLat},${endLon}`;
    if (distanceCache.has(cacheKey)) {
      console.log("💾 Distance trouvée dans le cache");
      return distanceCache.get(cacheKey)!;
    }

    // Vérification de la clé API
    if (!ORS_API_KEY) {
      console.warn("🔑 Clé API OpenRouteService manquante");
      return calculateHaversineDistance(startLat, startLon, endLat, endLon);
    }

    console.log("🌐 Calcul distance avec OpenRouteService...");

    // Délai pour respecter les limites de taux
    await delay(1500);

    const response = await orsApi.post("/directions/driving-car", {
      coordinates: [
        [startLon, startLat],
        [endLon, endLat],
      ],
    });

    const distanceInMeters = response.data.routes?.[0]?.summary?.distance;
    
    if (typeof distanceInMeters === 'number' && isFinite(distanceInMeters)) {
      const distanceInKm = distanceInMeters / 1000;
      
      // Mise en cache
      distanceCache.set(cacheKey, distanceInKm);
      
      console.log(`✅ Distance calculée: ${distanceInKm.toFixed(2)} km`);
      return distanceInKm;
    } else {
      throw new Error("Distance invalide retournée par l'API");
    }
    
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    console.warn("⚠️ Erreur OpenRouteService:", {
      status: axiosError.response?.status,
      message: axiosError.message
    });

    // Fallback vers calcul Haversine
    console.log("🔄 Utilisation du calcul Haversine en secours...");
    return calculateHaversineDistance(startLat, startLon, endLat, endLon);
  }
};

/**
 * Récupère un itinéraire de conduite entre deux points
 * @param startLat Latitude de départ
 * @param startLon Longitude de départ
 * @param endLat Latitude d'arrivée
 * @param endLon Longitude d'arrivée
 * @returns Tableau de coordonnées de l'itinéraire
 */
export const fetchRoute = async (
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<RouteCoordinate[]> => {
  try {
    // Validation des coordonnées
    if (!isValidCoordinate(startLat, startLon) || !isValidCoordinate(endLat, endLon)) {
      console.warn("❌ Coordonnées invalides pour le calcul d'itinéraire");
      return [];
    }

    // Vérification du cache
    const cacheKey = `route-${startLat},${startLon}-${endLat},${endLon}`;
    if (routeCache.has(cacheKey)) {
      console.log("💾 Itinéraire trouvé dans le cache");
      return routeCache.get(cacheKey)!;
    }

    // Vérification de la clé API
    if (!ORS_API_KEY) {
      console.warn("🔑 Clé API OpenRouteService manquante");
      return [
        { latitude: startLat, longitude: startLon },
        { latitude: endLat, longitude: endLon }
      ];
    }

    console.log("🗺️ Calcul itinéraire avec OpenRouteService...");

    // Délai pour respecter les limites de taux
    await delay(1500);

    const response = await orsApi.post("/directions/driving-car", {
      coordinates: [
        [startLon, startLat],
        [endLon, endLat],
      ],
    });

    const geometry = response.data.routes?.[0]?.geometry;
    
    if (!geometry) {
      throw new Error("Géométrie d'itinéraire non trouvée");
    }

    // Décodage de la polyline
    const decodedCoordinates: RouteCoordinate[] = polyline
      .decode(geometry, 5)
      .map(([latitude, longitude]: [number, number]) => ({ latitude, longitude }));

    // Validation du résultat
    if (decodedCoordinates.length === 0) {
      throw new Error("Itinéraire vide");
    }

    // Mise en cache
    routeCache.set(cacheKey, decodedCoordinates);
    
    console.log(`✅ Itinéraire calculé: ${decodedCoordinates.length} points`);
    return decodedCoordinates;
    
  } catch (error: any) {
    const axiosError = error as AxiosError;
    
    console.warn("⚠️ Erreur calcul itinéraire:", {
      status: axiosError.response?.status,
      message: axiosError.message
    });

    // Fallback vers itinéraire simple (ligne droite)
    console.log("🔄 Utilisation d'un itinéraire simple en secours...");
    return [
      { latitude: startLat, longitude: startLon },
      { latitude: endLat, longitude: endLon }
    ];
  }
};

/**
 * Calcule la distance entre deux points avec la formule de Haversine
 * @param lat1 Latitude du premier point
 * @param lon1 Longitude du premier point
 * @param lat2 Latitude du second point
 * @param lon2 Longitude du second point
 * @returns Distance en kilomètres
 */
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
  return R * c;
};

/**
 * Nettoie les caches (utile pour libérer de la mémoire)
 */
export const clearCaches = (): void => {
  distanceCache.clear();
  routeCache.clear();
  console.log("🧹 Caches nettoyés");
};

/**
 * Diagnostique la configuration OpenRouteService
 */
export const diagnoseORS = async (): Promise<{
  hasKey: boolean;
  apiWorking: boolean;
  error?: string;
}> => {
  const result = {
    hasKey: !!ORS_API_KEY,
    apiWorking: false,
    error: undefined as string | undefined
  };

  if (!ORS_API_KEY) {
    result.error = "Clé API manquante";
    return result;
  }

  try {
    // Test simple avec l'endpoint health ou une requête basique
    await orsApi.get('/health');
    result.apiWorking = true;
  } catch (error: any) {
    result.error = `Erreur API: ${error.response?.status || error.message}`;
  }

  return result;
};

/**
 * Statistiques des caches
 */
export const getCacheStats = (): {
  distanceCache: number;
  routeCache: number;
} => {
  return {
    distanceCache: distanceCache.size,
    routeCache: routeCache.size
  };
};