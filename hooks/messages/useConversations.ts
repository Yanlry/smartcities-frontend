// src/hooks/useConversations.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Firestore, collection, query, where, onSnapshot, 
  getDocs as firebaseGetDocs
} from 'firebase/firestore';
import { useApi } from './useApi';

/**
 * Interface pour une conversation
 */
interface Conversation {
  id: string;
  participants: number[];
  lastMessage: string;
  lastMessageTimestamp: string | null;
  otherParticipantName: string;
  profilePhoto: string | null;
  unreadCount: number;
}

/**
 * Hook personnalisé pour gérer les conversations d'un utilisateur
 * @param userId ID de l'utilisateur connecté
 * @param db Instance Firestore
 * @returns Objet contenant les conversations et l'état de chargement
 */
export const useConversations = (userId: string, db: Firestore) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Référence pour éviter les memory leaks
  const isComponentMounted = useRef(true);
  
  // Cache des détails utilisateurs pour optimiser les performances
  const userDetailsCache = useRef(new Map<number, { name: string; profilePhoto: string | null }>());
  
  // Custom hook pour les appels API
  const { fetchData: fetchUserDetails } = useApi();

  // Fonction pour récupérer les détails utilisateur avec cache
  const getUserDetails = useCallback(async (participantId: number) => {
    // Vérifier si les détails sont déjà en cache
    if (userDetailsCache.current.has(participantId)) {
      return userDetailsCache.current.get(participantId);
    }
    
    // Sinon, récupérer les détails via l'API
    const details = await fetchUserDetails(participantId);
    
    // Mettre en cache pour les futures utilisations
    if (details) {
      userDetailsCache.current.set(participantId, details);
    }
    
    return details;
  }, [fetchUserDetails]);

  // Fonction pour calculer le nombre de messages non lus
  const getUnreadMessagesCount = useCallback(async (otherParticipant: number) => {
    try {
      const unreadMessagesQuery = query(
        collection(db, "messages"),
        where("receiverId", "==", Number(userId)),
        where("senderId", "==", otherParticipant),
        where("isRead", "==", false)
      );
      
      const unreadMessagesSnapshot = await firebaseGetDocs(unreadMessagesQuery);
      return unreadMessagesSnapshot.docs.length;
    } catch (error) {
      console.error("Erreur lors du calcul des messages non lus:", error);
      return 0;
    }
  }, [userId, db]);

  // Effet pour charger et écouter les conversations
  useEffect(() => {
    // Vérification de l'ID utilisateur
    if (!userId) {
      console.log("Aucun userId trouvé pour les conversations");
      setLoading(false);
      setError("ID utilisateur manquant");
      return () => {};
    }

    console.log("Initialisation des conversations pour userId:", userId);
    setLoading(true);
    setError(null);
    
    try {
      // Création de la requête
      const conversationsRef = collection(db, "conversations");
      const q = query(
        conversationsRef,
        where("participants", "array-contains", Number(userId))
      );

      // Listener pour les mises à jour en temps réel
      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          try {
            if (!isComponentMounted.current) return;
            
            // Traitement par lots pour optimiser les performances
            const batchSize = 5;
            const docs = snapshot.docs;
            const totalDocs = docs.length;
            const conversationsData: Conversation[] = [];
            
            // Traitement des conversations par lots
            for (let i = 0; i < totalDocs; i += batchSize) {
              const batch = docs.slice(i, i + batchSize);
              const batchResults = await Promise.all(
                batch.map(async (doc) => {
                  const data = doc.data();
                  const otherParticipant = data.participants.find(
                    (id: number) => id !== Number(userId)
                  );

                  // Obtenir les détails utilisateur avec le cache
                  const userDetails = await getUserDetails(otherParticipant);
                  
                  // Obtenir le nombre de messages non lus
                  const unreadCount = await getUnreadMessagesCount(otherParticipant);

                  return {
                    id: doc.id,
                    participants: data.participants,
                    lastMessage: data.lastMessage || "",
                    lastMessageTimestamp: data.lastMessageTimestamp?.seconds
                      ? new Date(data.lastMessageTimestamp.seconds * 1000).toISOString()
                      : null,
                    otherParticipantName: userDetails?.name || "Utilisateur inconnu",
                    profilePhoto: userDetails?.profilePhoto || null,
                    unreadCount,
                  };
                })
              );
              
              conversationsData.push(...batchResults);
            }

            // Tri par date de dernier message (plus récent en premier)
            const sortedConversations = conversationsData.sort((a, b) => {
              if (!a.lastMessageTimestamp) return 1;
              if (!b.lastMessageTimestamp) return -1;
              return new Date(b.lastMessageTimestamp).getTime() - 
                     new Date(a.lastMessageTimestamp).getTime();
            });

            // Mettre à jour l'état des conversations
            if (isComponentMounted.current) {
              setConversations(sortedConversations);
              setLoading(false);
            }
          } catch (error) {
            console.error("Erreur lors du traitement des conversations:", error);
            if (isComponentMounted.current) {
              setError("Erreur lors du chargement des conversations");
              setLoading(false);
            }
          }
        },
        (error) => {
          console.error("Erreur firestore avec les conversations:", error);
          if (isComponentMounted.current) {
            setError("Erreur de connexion à la base de données");
            setLoading(false);
          }
        }
      );

      // Nettoyage du listener lors du démontage
      return () => {
        isComponentMounted.current = false;
        unsubscribe();
      };
    } catch (error) {
      console.error("Erreur lors de l'initialisation des conversations:", error);
      setError("Erreur lors de l'initialisation");
      setLoading(false);
      return () => {};
    }
  }, [userId, db, getUserDetails, getUnreadMessagesCount]);

  // Retourne les données et l'état
  return {
    conversations,
    loading,
    error,
    // Fonction pour rafraîchir manuellement les conversations (utile pour les tests)
    refresh: useCallback(() => {
      setLoading(true);
    }, [])
  };
};