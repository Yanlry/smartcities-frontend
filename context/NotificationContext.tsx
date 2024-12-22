import React, { createContext, useContext, useEffect, useState } from "react";
import { useToken } from "../hooks/useToken"; // Hook pour récupérer le token
// @ts-ignore
import { API_URL } from "@env";

// Création du contexte
const NotificationContext = createContext({
  unreadCount: 0,
  fetchUnreadCount: () => {},
});

// Fournisseur de contexte
export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { getToken } = useToken();

  // Fonction pour récupérer le nombre de notifications non lues
  const fetchUnreadCount = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error("Erreur lors de la récupération des notifications non lues");
        return;
      }

      const { count } = await response.json();
      setUnreadCount(count);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications :", error.message);
    }
  };

  // Récupère les notifications toutes les 10 secondes
  useEffect(() => {
    fetchUnreadCount(); // Chargement initial
    const interval = setInterval(fetchUnreadCount, 10000); // Mise à jour toutes les 10 secondes
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook pour utiliser le contexte
export const useNotification = () => useContext(NotificationContext);
