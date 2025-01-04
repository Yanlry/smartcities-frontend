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
    let token = await getToken();
  
    if (!token) {
      console.error("Aucun token disponible pour la requête.");
      return null;
    }
  
    options.headers = {
      ...(options.headers || {}), // Fusionne avec les en-têtes existants, s'il y en a
      Authorization: `Bearer ${token}`,
    };
  
    let response = await fetch(url, options);
  
    if (response.status === 401) {
      console.log("Token expiré, tentative de rafraîchissement...");
      token = await refreshAccessToken();
      if (!token) {
        console.error("Impossible de rafraîchir le token.");
        return null;
      }
  
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };
      response = await fetch(url, options);
    }
  
    return response;
  };

  const fetchUnreadCount = async () => {
    console.log("Début de la récupération des notifications non lues...");
    try {
      const response = await fetchWithAuth(`${API_URL}/notifications/unread/count`);
      if (!response || !response.ok) {
        console.error("Erreur lors de la récupération des notifications non lues");
        return;
      }

      const { count } = await response.json();
      console.log("Notifications récupérées avec succès :", count);
      setUnreadCount(count);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error.message);
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