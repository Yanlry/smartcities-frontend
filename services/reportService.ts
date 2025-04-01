// src/api/reportService.ts

import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
// @ts-ignore
import { API_URL, ORS_API_KEY } from "@env";

// Constante pour la détection de positions proches (en degrés)
const POSITION_PROXIMITY_THRESHOLD = 0.0001; // ~11 mètres à l'équateur

/**
 * Interface pour les médias photo
 */
export interface Photo {
  id: number;
  url: string;
}

/**
 * Interface pour les rapports de signalement
 */
export interface Report {
  id: number;
  type: string;
  title: string;
  description: string;
  city: string;
  latitude: number;
  longitude: number;
  category: string;
  distance?: number | null; // Peut être null pour les distances incalculables
  createdAt: string;
  photos: Photo[];
  upVotes: number;
  downVotes: number;
}

/**
 * Interface pour les événements
 */
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
  distance?: number | null; // Peut être null pour les distances incalculables
}

/**
 * Interface pour les coordonnées géographiques
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Cache pour mémoriser les calculs de distance
 * et éviter des appels API répétitifs
 */
const distanceCache = new Map<string, number[]>();

/**
 * Délai d'attente pour limiter le taux d'appels à l'API
 * @param ms Délai en millisecondes
 */
const delay = (ms: number): Promise<void> => 
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Récupère tous les événements dans un rayon donné
 * @param latitude Latitude du point central
 * @param longitude Longitude du point central
 * @param radiusKm Rayon de recherche en kilomètres
 * @returns Liste des événements triés par distance
 */
export const fetchAllEventsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
): Promise<Event[]> => {
  try {
    // Validation des coordonnées
    if (!isValidCoordinate(latitude, longitude)) {
      console.warn("Coordonnées invalides pour la recherche d'événements");
      return [];
    }

    const response = await axios.get(`${API_URL}/events`, {
      params: { latitude, longitude, radiusKm },
    });

    // Vérification de la réponse
    if (!Array.isArray(response?.data)) {
      console.warn("Format de réponse inattendu pour les événements:", response?.data);
      return [];
    }

    // Calcul des distances et enrichissement des événements
    const events = await enrichEventsWithDistance(response.data, latitude, longitude);
    return events;
  } catch (error: any) {
    console.error(
      "Erreur dans fetchAllEventsInRegion :",
      error.response?.data || error.message
    );
    return [];
  }
};

/**
 * Enrichit les événements avec leur distance par rapport à un point
 * @param events Liste des événements bruts
 * @param latitude Latitude du point de référence
 * @param longitude Longitude du point de référence
 * @returns Événements enrichis avec distances et triés
 */
const enrichEventsWithDistance = async (
  events: Event[],
  latitude: number,
  longitude: number
): Promise<Event[]> => {
  if (events.length === 0) return [];
  
  try {
    // Préparation des coordonnées pour le calcul de distance
    const destinations: [number, number][] = events.map((event) => {
      if (!isValidCoordinate(event.latitude, event.longitude)) {
        return [longitude, latitude]; // Utiliser les coordonnées par défaut
      }
      return [event.longitude, event.latitude];
    });

    // Calcul des distances
    const distances = await fetchDrivingDistances(
      [longitude, latitude],
      destinations
    );

    // Enrichissement des événements avec leur distance
    const enrichedEvents = events.map((event, index) => {
      // Vérification si les coordonnées sont quasiment identiques (position actuelle)
      const isCurrentLocation = 
        Math.abs(event.latitude - latitude) < POSITION_PROXIMITY_THRESHOLD && 
        Math.abs(event.longitude - longitude) < POSITION_PROXIMITY_THRESHOLD;
      
      // Récupération de la distance
      const distanceValue = distances[index];
      
      // Gestion spéciale pour la position actuelle ou distance très proche
      if (isCurrentLocation || (typeof distanceValue === 'number' && distanceValue < 10)) {
        return {
          ...event,
          distance: 0 // Distance de 0 km pour la position actuelle
        };
      }
      
      // Conversion normale de mètres en kilomètres
      const distanceInKm = typeof distanceValue === 'number' && isFinite(distanceValue) 
        ? distanceValue / 1000 
        : null;
        
      return {
        ...event,
        distance: distanceInKm
      };
    });

    // Tri par distance croissante
    return sortItemsByDistance(enrichedEvents);
  } catch (error) {
    console.warn("Erreur lors du calcul des distances pour les événements:", error);
    return events;
  }
};
  
/**
 * Récupère les signalements bruts depuis l'API
 * @param latitude Latitude du point central
 * @param longitude Longitude du point central
 * @param radiusKm Rayon de recherche en kilomètres
 * @returns Liste des signalements bruts
 */
export const fetchReports = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
): Promise<Report[]> => {
  try {
    if (!isValidCoordinate(latitude, longitude)) {
      console.warn("Coordonnées invalides pour la recherche de signalements:", { latitude, longitude });
      return [];
    }

    console.log("Appel API fetchReports avec paramètres:", { latitude, longitude, radiusKm });
    const response = await axios.get(`${API_URL}/reports`, {
      params: { latitude, longitude, radiusKm },
    });

    if (!Array.isArray(response?.data)) {
      console.warn("Format de réponse inattendu pour les signalements:", response?.data);
      return [];
    }

    console.log("Réponse API fetchReports:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erreur dans fetchReports :", {
      message: error.response?.data || error.message,
      code: error.response?.status,
      stack: error.stack,
      params: { latitude, longitude, radiusKm }
    });
    return [];
  }
};

/**
 * Crée un nouveau signalement
 * @param data Données du signalement à créer
 * @returns Signalement créé ou null en cas d'erreur
 */
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

/**
 * Traite et filtre les signalements selon des critères
 * @param latitude Latitude du point central
 * @param longitude Longitude du point central
 * @param category Catégorie de signalement optionnelle pour filtrer
 * @param city Ville optionnelle pour filtrer
 * @returns Liste des signalements filtrés et triés
 */
export const processReports = async (
  latitude: number,
  longitude: number,
  category?: string,   
  city?: string
): Promise<Report[]> => {
  try {
    let reports = await fetchAllReportsInRegion(latitude, longitude, 2000);
    
    if (reports.length === 0) {
      return [];
    }

    // Application des filtres si spécifiés
    if (category) {
      reports = reports.filter(report => 
        report.type.toLowerCase() === category.toLowerCase()
      );
    }
 
    if (city) {
      reports = reports.filter(report => 
        report.city.toLowerCase().includes(city.toLowerCase())
      );
    }

    return reports;
  } catch (error: any) {
    console.error("Erreur dans processReports :", error.message);
    return [];
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
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Vérification si les coordonnées sont quasiment identiques
  if (
    Math.abs(lat1 - lat2) < POSITION_PROXIMITY_THRESHOLD && 
    Math.abs(lon1 - lon2) < POSITION_PROXIMITY_THRESHOLD
  ) {
    return 0; // Distance nulle pour des points très proches
  }

  // Validation des entrées
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    console.warn("Coordonnées invalides pour le calcul de distance Haversine");
    return Infinity;
  }

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

/**
 * Récupère les distances de conduite entre un point d'origine et plusieurs destinations
 * @param origin Point d'origine [longitude, latitude]
 * @param destinations Liste des points de destination [longitude, latitude]
 * @returns Liste des distances en mètres
 */
export const fetchDrivingDistances = async (
  origin: [number, number],
  destinations: [number, number][]
): Promise<number[]> => {
  // Vérification des entrées
  if (!Array.isArray(destinations) || destinations.length === 0) {
    console.warn("Liste de destinations vide ou invalide");
    return [];
  }

  // Vérification des coordonnées
  if (!isValidLonLat(origin) || !destinations.every(isValidLonLat)) {
    console.warn("Coordonnées [lon, lat] invalides");
    return destinations.map(() => Infinity);
  }

  // Pré-traitement pour détecter les points à distance nulle (position actuelle)
  const processedDistances = destinations.map((dest) => {
    if (
      Math.abs(dest[0] - origin[0]) < POSITION_PROXIMITY_THRESHOLD &&
      Math.abs(dest[1] - origin[1]) < POSITION_PROXIMITY_THRESHOLD
    ) {
      return 0; // Distance nulle pour la position actuelle
    }
    return null; // Valeur à calculer par l'API
  });

  // Si toutes les distances sont déjà déterminées, pas besoin d'appel API
  if (processedDistances.every(d => d !== null)) {
    return processedDistances as number[];
  }

  // Création de la clé de cache
  const cacheKey = `${JSON.stringify(origin)}:${JSON.stringify(destinations)}`;

  // Vérification du cache
  if (distanceCache.has(cacheKey)) {
    const cachedDistances = distanceCache.get(cacheKey);
    if (cachedDistances && cachedDistances.length === destinations.length) {
      return cachedDistances;
    }
  }

  try {
    // Limitation du taux d'appels
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

    // Vérification et transformation de la réponse
    if (!response.data?.distances || !Array.isArray(response.data.distances) || response.data.distances.length === 0) {
      console.warn("Aucune distance retournée par OpenRouteService.");
      throw new Error("Réponse API invalide");
    }

    const apiDistances = response.data.distances[0].slice(1);
    
    // Fusion des distances pré-calculées (position actuelle) avec les résultats de l'API
    const mergedDistances = processedDistances.map((preCalc, index) => {
      if (preCalc !== null) return preCalc;
      
      const apiDistance = apiDistances[index];
      return (typeof apiDistance === 'number' && isFinite(apiDistance) && apiDistance >= 0) 
        ? apiDistance 
        : Infinity;
    });
    
    // Mise en cache des résultats
    distanceCache.set(cacheKey, mergedDistances);
    return mergedDistances;
  } catch (error) {
    console.warn(
      "Erreur dans fetchDrivingDistances, utilisation de la méthode Haversine en fallback:",
      error instanceof AxiosError ? error.message : "Erreur inconnue"
    );

    // Calcul de la distance Haversine en secours
    const fallbackDistances = destinations.map((dest, index) => {
      // Utiliser la distance pré-calculée si disponible
      if (processedDistances[index] !== null) {
        return processedDistances[index] as number;
      }
      
      const [lon, lat] = dest;
      const distance = calculateHaversineDistance(
        origin[1], // latitude
        origin[0], // longitude
        lat,       // latitude destination
        lon        // longitude destination
      ) * 1000;    // Conversion en mètres pour être cohérent avec l'API
      
      return isFinite(distance) ? distance : Infinity;
    });

    // Mise en cache des distances calculées
    distanceCache.set(cacheKey, fallbackDistances);
    return fallbackDistances;
  }
};

/**
 * Récupère tous les signalements dans une région avec calcul de distance
 * @param latitude Latitude du point central
 * @param longitude Longitude du point central
 * @param radiusKm Rayon de recherche en kilomètres
 * @returns Liste des signalements enrichis avec leur distance
 */
export const fetchAllReportsInRegion = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 2000
): Promise<Report[]> => {
  try {
    // Validation des coordonnées
    if (!isValidCoordinate(latitude, longitude)) {
      console.warn("Coordonnées invalides pour la recherche régionale");
      return [];
    }

    // Récupération des signalements bruts
    const rawReports = await fetchReports(latitude, longitude, radiusKm);

    if (rawReports.length === 0) {
      console.log("📌 Aucun signalement trouvé dans la région.");
      return [];
    }

    // Préparation des coordonnées pour le calcul de distance
    const destinations: [number, number][] = rawReports.map((report) => {
      // Validation des coordonnées du rapport
      if (!isValidCoordinate(report.latitude, report.longitude)) {
        console.warn(`Coordonnées invalides pour le rapport ${report.id}`);
        return [longitude, latitude]; // Utiliser les coordonnées par défaut
      }
      return [report.longitude, report.latitude];
    });

    // Calcul des distances
    const distances = await fetchDrivingDistances(
      [longitude, latitude], // Origine [lon, lat]
      destinations           // Destinations [lon, lat]
    );

    // Enrichissement des rapports avec leur distance
    const enrichedReports = rawReports.map((report, index) => {
      // Vérification si les coordonnées sont quasiment identiques (position actuelle)
      const isCurrentLocation = 
        Math.abs(report.latitude - latitude) < POSITION_PROXIMITY_THRESHOLD && 
        Math.abs(report.longitude - longitude) < POSITION_PROXIMITY_THRESHOLD;
      
      // Récupération de la distance
      const distanceValue = distances[index];
      
      // Gestion spéciale pour la position actuelle ou distance très proche
      if (isCurrentLocation || (typeof distanceValue === 'number' && distanceValue < 10)) {
        return {
          ...report,
          distance: 0 // Distance de 0 km pour la position actuelle
        };
      }
      
      // Conversion normale de mètres en kilomètres
      const distanceInKm = typeof distanceValue === 'number' && isFinite(distanceValue) 
        ? distanceValue / 1000 
        : null; // Utiliser null au lieu de Infinity pour les distances incalculables
        
      return {
        ...report,
        distance: distanceInKm
      };
    });

    // Tri par distance croissante
    return sortItemsByDistance(enrichedReports);
  } catch (error: any) {
    console.warn(
      "❌ Erreur dans fetchAllReportsInRegion :",
      error.message || "Erreur inconnue."
    );
    return [];
  }
};

/**
 * Trie une liste d'items (rapports ou événements) par distance
 * avec une gestion spéciale des valeurs nulles
 * @param items Liste d'items à trier
 * @returns Liste triée par distance
 */
function sortItemsByDistance<T extends { distance?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // Position actuelle (distance 0) toujours en premier
    if (a.distance === 0) return -1;
    if (b.distance === 0) return 1;
    
    // Gestion des valeurs spéciales (null, undefined, Infinity)
    if (a.distance === null || a.distance === undefined || !isFinite(a.distance)) return 1;
    if (b.distance === null || b.distance === undefined || !isFinite(b.distance)) return -1;
    
    // Tri normal par distance
    return a.distance - b.distance;
  });
}

/**
 * Vérifie si les coordonnées [latitude, longitude] sont valides
 * @param lat Latitude (-90 à 90)
 * @param lon Longitude (-180 à 180)
 * @returns Vrai si les coordonnées sont valides
 */
function isValidCoordinate(lat: number, lon: number): boolean {
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
}

/**
 * Vérifie si les coordonnées [longitude, latitude] sont valides
 * @param coordinates Tuple [longitude, latitude]
 * @returns Vrai si les coordonnées sont valides
 */
function isValidLonLat(coordinates: [number, number]): boolean {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  const [lon, lat] = coordinates;
  return isValidCoordinate(lat, lon);
}

/**
 * Utilitaire pour formater l'affichage des distances
 * Peut être utilisé dans les composants d'UI
 * @param distance Valeur de distance (km, null ou undefined)
 * @returns Chaîne formatée pour l'affichage
 */
export function formatDistance(distance: number | null | undefined): string {
  if (distance === 0) {
    return "À votre position";
  }
  
  if (distance === null || distance === undefined || !isFinite(distance)) {
    return "Distance inconnue";
  }
  
  // Distance < 1km : afficher en mètres
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  
  // Distance >= 1km : afficher en km avec 1 décimale
  return `${distance.toFixed(1)} km`;
}