// hooks/profile/useUserContent.ts

import { useState, useEffect } from "react";
import { Post, Report, Event } from "../../types/profile.types";
import axios from "axios";
// @ts-ignore
import { API_URL } from "@env";

/**
 * Hook personnalisé pour récupérer le contenu lié à l'utilisateur (posts, signalements, événements)
 * @param userId ID de l'utilisateur
 * @returns Publications, signalements, événements et états de chargement
 */
export const useUserContent = (userId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserContent = async () => {
      try {
        // Récupération des publications
        const postsPromise = axios.get<Post[]>(`${API_URL}/posts/author/${userId}`)
          .then(response => setPosts(response.data))
          .catch(err => {
            console.error("Erreur lors de la récupération des publications :", err);
            throw new Error("Erreur lors de la récupération des publications");
          });

        // Récupération des signalements
        const reportsPromise = fetch(`${API_URL}/reports?userId=${userId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Erreur HTTP ! statut : ${response.status}`);
            }
            return response.json();
          })
          .then(data => setReports(data))
          .catch(error => {
            console.error("Erreur lors de la récupération des rapports :", error);
          });

        // Récupération des événements
        const eventsPromise = fetch(`${API_URL}/events?userId=${userId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Erreur HTTP ! statut : ${response.status}`);
            }
            return response.json();
          })
          .then(data => setEvents(data))
          .catch(error => {
            console.error("Erreur lors de la récupération des événements :", error);
          });

        // Attendre que toutes les requêtes soient terminées
        await Promise.all([postsPromise, reportsPromise, eventsPromise]);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };

    fetchUserContent();
  }, [userId]);

  return { posts, reports, events, loading, error };
};