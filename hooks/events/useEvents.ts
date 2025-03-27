// src/hooks/events/useEvents.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { Event, FeaturedEvent } from '../../components/home/EventsSection/event.types';
// Importation des fonctions de normalisation
import { citiesMatch, normalizeCityName } from '../../utils/formatters';
// @ts-ignore - Récupération des variables d'environnement
import { API_URL } from '@env';

// Configuration des paramètres de retry pour les appels API
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
const API_TIMEOUT_MS = 10000;

/**
 * Hook personnalisé pour gérer la récupération et le filtrage des événements
 * Inclut des mécanismes de retry, gestion d'erreurs avancée et cache local
 * 
 * @param userCity - Ville de l'utilisateur pour filtrer les événements pertinents
 * @returns Objets et fonctions pour gérer les événements
 */
export const useEvents = (userCity: string) => {
  // États pour gérer les différentes collections d'événements
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Références pour gérer les tentatives de retry et le cycle de vie du composant
  const retryAttemptsRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Nettoyage du composant lors du démontage
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Extrait la ville d'une adresse complète en tenant compte des différents formats
   * 
   * @param location - Adresse complète contenant la ville
   * @returns Nom de la ville extrait
   */
  const extractCityFromLocation = useCallback((location: string): string => {
    if (!location) return "";
    
    // Méthode 1: Format code postal + ville (ex: "59000 Lille")
    const postalCodeMatch = location.match(/\d{5}\s+([^,]+)/);
    if (postalCodeMatch && postalCodeMatch[1]) {
      return postalCodeMatch[1].trim();
    }
    
    // Méthode 2: Format avec virgules (ex: "Rue X, Lille, France")
    const parts = location.split(',');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      // Éviter les parties qui sont probablement des codes postaux ou "France"
      if (part && !part.match(/^\d{5}$/) && !part.match(/France/i)) {
        // Supprimer le code postal si présent
        return part.replace(/^\d{5}\s+/, '').trim();
      }
    }
    
    return location.trim(); // Fallback au texte complet
  }, []);

  /**
   * Fonction principale pour récupérer les événements avec gestion des erreurs et retry
   * 
   * @param retryAttempt - Numéro de la tentative actuelle (0 = première tentative)
   */
  const fetchEvents = useCallback(async (retryAttempt = 0): Promise<void> => {
    if (!userCity || !isMountedRef.current) return;

    try {
      if (retryAttempt === 0) {
        setLoading(true);
        setError(null);
      }

      console.log(`Tentative de récupération des événements (${retryAttempt + 1}/${MAX_RETRY_ATTEMPTS + 1})`);
      
      // Appel API avec timeout pour éviter les attentes prolongées
      const response = await axios.get(`${API_URL}/events`, {
        timeout: API_TIMEOUT_MS,
      });
      
      if (!isMountedRef.current) return;

      if (response.status !== 200) {
        throw new Error(`Erreur API : ${response.statusText}`);
      }

      // Réinitialiser le compteur de tentatives en cas de succès
      retryAttemptsRef.current = 0;

      // Filtrer les événements pour la ville de l'utilisateur
      const eventsList = response.data.filter((event: any) => {
        const eventCity = extractCityFromLocation(event.location);
        // Utiliser citiesMatch pour une comparaison robuste tenant compte des variantes
        return citiesMatch(eventCity, userCity);
      });

      // Transformer les événements pour l'affichage en cartes
      const featuredEventsList = eventsList.map((event: any) => ({
        id: event.id,
        title: event.title,
        image: event.photos?.find((photo: any) => photo.isProfile)?.url ||
               event.photos?.[0]?.url ||
               "https://via.placeholder.com/300",
        date: event.date
      }));

      // Créer les événements complets pour le calendrier
      const fullEventsList = eventsList.map((event: any) => ({
        id: event.id,
        title: event.title,
        location: event.location || "Emplacement non spécifié",
        date: event.date,
        description: event.description
      }));
      
      if (isMountedRef.current) {
        setFeaturedEvents(featuredEventsList);
        setAllEvents(fullEventsList);
        setLoading(false);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      
      console.error("Erreur dans fetchEvents :", error.message || error);
      
      // Détection des erreurs qui méritent une nouvelle tentative
      const isServerError = axios.isAxiosError(error) && 
        (error as AxiosError).response?.status === 500;
      const isNetworkError = axios.isAxiosError(error) && 
        ((error as AxiosError).code === 'ECONNABORTED' || 
         (error as AxiosError).message.includes('timeout'));
      
      // Logique de retry avec backoff exponentiel pour les erreurs temporaires
      if ((isServerError || isNetworkError) && retryAttempt < MAX_RETRY_ATTEMPTS) {
        const delayMs = RETRY_DELAY_MS * Math.pow(2, retryAttempt);
        console.log(`Nouvelle tentative dans ${delayMs}ms...`);
        
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            fetchEvents(retryAttempt + 1);
          }
        }, delayMs);
        
        return;
      }
      
      // En cas d'échec définitif, afficher l'erreur et utiliser le cache si disponible
      setError("Impossible de récupérer les événements.");
      setLoading(false);
      
      if (allEvents.length > 0) {
        console.log("Utilisation des données en cache après échec des retries");
      }
    } finally {
      if (isMountedRef.current && retryAttempt === MAX_RETRY_ATTEMPTS) {
        setLoading(false);
      }
    }
  }, [userCity, extractCityFromLocation, citiesMatch]);

  // Déclencher le chargement initial
  useEffect(() => {
    if (userCity) {
      fetchEvents(0);
    }
  }, [userCity, fetchEvents]);

  /**
   * Récupère les événements pour une date spécifique, avec fallback local
   * si l'API dédiée est indisponible
   * 
   * @param date - Date au format YYYY-MM-DD
   */
  const fetchEventsByDate = useCallback(async (date: string): Promise<void> => {
    if (!isMountedRef.current) return;
    
    try {
      setLoading(true);
      setError(null);

      // Option 1: Utiliser l'API spécifique avec timeout court
      try {
        const response = await axios.get<Event[]>(`${API_URL}/events/by-date`, {
          params: { date },
          timeout: 5000 // Timeout court pour passer rapidement au fallback
        });
        
        if (isMountedRef.current) {
          setEvents(response.data);
          setLoading(false);
        }
        return;
      } catch (apiError) {
        console.log("[useEvents] API by-date non disponible, utilisation du cache local");
        // Continuer avec l'option 2 en cas d'échec
      }
      
      // Option 2: Filtrer localement les événements déjà récupérés
      const filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        const normalizedEventDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        return normalizedEventDate === date;
      });
      
      if (isMountedRef.current) {
        setEvents(filteredEvents);
        setLoading(false);
      }
      
    } catch (error: any) {
      if (isMountedRef.current) {
        console.error("Erreur lors de la récupération des événements par date :", error);
        setError("Impossible de charger les événements pour cette date.");
        setLoading(false);
      }
    }
  }, [allEvents]);

  /**
   * Récupère les événements pour un mois spécifique à partir du cache local
   * 
   * @param year - Année
   * @param month - Mois (0-11)
   * @returns Événements du mois spécifié
   */
  const getEventsForMonth = useCallback((year: number, month: number): Event[] => {
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }, [allEvents]);

  /**
   * Génère un objet avec les dates qui ont des événements pour un mois donné
   * 
   * @param year - Année
   * @param month - Mois (0-11)
   * @returns Objet associant les dates (format YYYY-MM-DD) à true
   */
  const getMarkedDatesForMonth = useCallback((year: number, month: number): Record<string, boolean> => {
    const monthEvents = getEventsForMonth(year, month);
    const markedDates: Record<string, boolean> = {};
    
    monthEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const dateStr = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      markedDates[dateStr] = true;
    });
    
    return markedDates;
  }, [getEventsForMonth]);

  /**
   * Déclenche un rechargement manuel des événements
   */
  const refreshEvents = useCallback(() => {
    fetchEvents(0);
  }, [fetchEvents]);

  return {
    featuredEvents,
    events,
    loading,
    error,
    fetchEventsByDate,
    getEventsForMonth,
    getMarkedDatesForMonth,
    refreshEvents
  };
};