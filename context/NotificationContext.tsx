import React, { createContext, useContext, useEffect, useState } from "react";
import { useToken } from "../hooks/auth/useToken"; 
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
      let token = await getToken();
  
      if (!token) {
        console.warn("Aucun token disponible pour fetchWithAuth. Requête ignorée.");
        return null; 
      }
  
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };
  
      let response = await fetch(url, options);
  
      if (response.status === 401) {
        console.warn("Token expiré, tentative de rafraîchissement...");
        token = await refreshAccessToken();
  
        if (!token) {
          console.warn("Rafraîchissement du token échoué. Requête ignorée.");
          return null; 
        }
  
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        };
  
        response = await fetch(url, options);
      }
  
      if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        console.warn(
          `Erreur API (${response.status}):`,
          errorDetails.message || response.statusText
        );
        return null; 
      }
  
      return response; 
    } catch (error: any) {
      console.warn("Erreur silencieuse dans fetchWithAuth :", error.message);
      return null; 
    }
  };
  const fetchUnreadCount = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/notifications/unread/count`);
  
      if (!response) {
        console.warn("Aucune réponse valide obtenue pour les notifications non lues.");
        setUnreadCount(0); 
        return;
      }
  
      const { count } = await response.json();
      setUnreadCount(count);
    } catch (error) {
      setUnreadCount(0); 
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