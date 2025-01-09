import React, { createContext, useContext, useEffect, useState } from "react";
import { useToken } from "../hooks/useToken"; // Hook pour récupérer le token
// @ts-ignore
import { API_URL } from "@env";

const NotificationContext = createContext({
  unreadCount: 0,
  fetchUnreadCount: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { getToken, refreshAccessToken } = useToken();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const { getToken, refreshAccessToken } = useToken();
  
    try {
      // Récupérer le token initial
      let token = await getToken();
  
      if (!token) {
        console.warn("Aucun token disponible pour fetchWithAuth. Requête ignorée.");
        return null; // Retourne null si aucun token n'est disponible
      }
  
      // Ajouter le token dans les en-têtes
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };
  
      // Effectuer la requête initiale
      let response = await fetch(url, options);
  
      // Gérer le cas où le token a expiré (401 Unauthorized)
      if (response.status === 401) {
        console.warn("Token expiré, tentative de rafraîchissement...");
        token = await refreshAccessToken();
  
        if (!token) {
          console.warn("Rafraîchissement du token échoué. Requête ignorée.");
          return null; // Retourne null si le rafraîchissement échoue
        }
  
        // Ajouter le nouveau token dans les en-têtes
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        };
  
        // Réessayer la requête avec le nouveau token
        response = await fetch(url, options);
      }
  
      // Vérifier si la réponse est valide
      if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        console.warn(
          `Erreur API (${response.status}):`,
          errorDetails.message || response.statusText
        );
        return null; // Retourne null si la réponse est invalide
      }
  
      return response; // Retourne la réponse si tout va bien
    } catch (error: any) {
      console.warn("Erreur silencieuse dans fetchWithAuth :", error.message);
      return null; // Retourne null en cas d'erreur inattendue
    }
  };
  const fetchUnreadCount = async () => {
    console.log("Début de la récupération des notifications non lues...");
    try {
      const response = await fetchWithAuth(`${API_URL}/notifications/unread/count`);
  
      if (!response) {
        console.warn("Aucune réponse valide obtenue pour les notifications non lues.");
        setUnreadCount(0); // Définit le compteur à 0 par défaut
        return;
      }
  
      const { count } = await response.json();
      console.log("Notifications non lues récupérées avec succès :", count);
      setUnreadCount(count);
    } catch (error) {
      // Log discret pour les erreurs inattendues
      console.warn("Erreur inattendue lors de la récupération des notifications :", error.message);
      setUnreadCount(0); // Définit le compteur à 0 en cas d'erreur
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);