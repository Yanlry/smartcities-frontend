import { useState, useEffect } from 'react';
import axios from 'axios';
import { Event, FeaturedEvent } from '../../components/home/EventsSection/event.types';
// @ts-ignore
import { API_URL } from '@env';

export const useEvents = (userCity: string) => {
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!userCity) return;

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/events`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }

        const userCityNormalized = normalizeCityName(userCity);

        const filteredEvents = response.data
          .filter((event: any) => {
            const eventCity = extractCityAfterPostalCode(event.location);
            const eventCityNormalized = normalizeCityName(eventCity);

            return eventCityNormalized === userCityNormalized;
          })
          .map((event: any) => ({
            id: event.id,
            title: event.title,
            image:
              event.photos.find((photo: any) => photo.isProfile)?.url ||
              event.photos[0]?.url ||
              "https://via.placeholder.com/300",
          }));

        setFeaturedEvents(filteredEvents);
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

  const fetchEventsByDate = async (date: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<Event[]>(`${API_URL}/events/by-date`, {
        params: { date },
      });
      
      setEvents(response.data);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des événements :", error);
      setError("Impossible de charger les événements pour cette date.");
    } finally {
      setLoading(false);
    }
  };

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
    fetchEventsByDate
  };
};