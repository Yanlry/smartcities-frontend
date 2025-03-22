// Chemin: hooks/events/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Event, FeaturedEvent } from '../../components/home/EventsSection/event.types';
// @ts-ignore
import { API_URL } from '@env';

export const useEvents = (userCity: string) => {
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]); // Stocke tous les événements
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charge tous les événements au démarrage
  useEffect(() => {
    const fetchEvents = async () => {
      if (!userCity) return;

      try {
        setLoading(true);
        setError(null);

        // Récupérer tous les événements disponibles
        const response = await axios.get(`${API_URL}/events`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }

        const userCityNormalized = normalizeCityName(userCity);

        // Filtrer les événements pour la ville de l'utilisateur
        const eventsList = response.data
          .filter((event: any) => {
            const eventCity = extractCityAfterPostalCode(event.location);
            const eventCityNormalized = normalizeCityName(eventCity);
            return eventCityNormalized === userCityNormalized;
          });

        // Convertir en événements pour l'affichage des cartes
        const featuredEventsList = eventsList.map((event: any) => ({
          id: event.id,
          title: event.title,
          image: event.photos?.find((photo: any) => photo.isProfile)?.url ||
                 event.photos?.[0]?.url ||
                 "https://via.placeholder.com/300",
          date: event.date
        }));

        // Convertir en événements complets pour le calendrier
        const fullEventsList = eventsList.map((event: any) => ({
          id: event.id,
          title: event.title,
          location: event.location || "Emplacement non spécifié",
          date: event.date,
          description: event.description
        }));
        
        setFeaturedEvents(featuredEventsList);
        setAllEvents(fullEventsList);
      } catch (error: any) {
        console.error("Erreur dans fetchEvents :", error.message || error);
        setError("Impossible de récupérer les événements.");
      } finally {
        setLoading(false);
      }
    };

    if (userCity) {
      fetchEvents();
    }
  }, [userCity]);

  /**
   * Récupère les événements pour une date spécifique
   * @param date - Date au format YYYY-MM-DD
   */
  const fetchEventsByDate = useCallback(async (date: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Option 1: Utiliser l'API si disponible
      try {
        const response = await axios.get<Event[]>(`${API_URL}/events/by-date`, {
          params: { date },
        });
        
        setEvents(response.data);
        return;
      } catch (apiError) {
        console.log("[useEvents] API by-date non disponible, utilisation du cache local");
        // Continuer avec l'option 2 si l'API échoue
      }
      
      // Option 2: Filtrer les événements localement si l'API n'est pas disponible
      const filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        const normalizedEventDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
        return normalizedEventDate === date;
      });
      
      setEvents(filteredEvents);
      
    } catch (error: any) {
      console.error("Erreur lors de la récupération des événements :", error);
      setError("Impossible de charger les événements pour cette date.");
    } finally {
      setLoading(false);
    }
  }, [allEvents]);

  /**
   * Récupère les événements pour un mois spécifique à partir du cache local
   * @param year - Année
   * @param month - Mois (0-11)
   * @returns Les événements du mois
   */
  const getEventsForMonth = useCallback((year: number, month: number): Event[] => {
    const monthEvents = allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    return monthEvents;
  }, [allEvents]);

  /**
   * Génère un objet avec les dates du mois qui ont des événements
   * @param year - Année
   * @param month - Mois (0-11)
   * @returns Objet avec les dates marquées
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

  const extractCityAfterPostalCode = (location: string) => {
    if (!location) return "";
    const match = location.match(/\d{5}\s+([^,]+)/);
    return match ? match[1].trim() : "";
  };

  const normalizeCityName = (cityName: string) => {
    if (!cityName) return "";
    return cityName
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  return {
    featuredEvents,
    events,
    loading,
    error,
    fetchEventsByDate,
    getEventsForMonth,
    getMarkedDatesForMonth  // Nouvelle fonction pour obtenir les dates marquées
  };
};