import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
// @ts-ignore
import { API_URL } from "@env";

const ConversationsScreen = ({ navigation, route }: any) => {
  const userId = route.params?.userId;
  console.log("UserId reçu dans ConversationsScreen :", userId);

  interface Conversation {
    id: string;
    participants: number[];
    lastMessage: string;
    otherParticipantName?: string;
    unreadCount?: number; // Indicateur pour les messages non lus
    profilePhoto?: string | null; // Photo de profil du participant
  }

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les détails d'un utilisateur (nom et photo de profil)
  const fetchUserDetails = async (
    userId: number
  ): Promise<{ name: string; profilePhoto: string | null }> => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      const user = response.data;

      const name = user.useFullName
        ? `${user.firstName} ${user.lastName}`
        : user.username || "Utilisateur inconnu";

      const profilePhoto = user.profilePhoto?.url || null;

      return { name, profilePhoto };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails pour l'utilisateur ${userId} :`,
        error
      );
      return { name: "Utilisateur inconnu", profilePhoto: null };
    }
  };

  useEffect(() => {
    if (!userId) {
      console.log(
        "Aucun userId trouvé. Arrêt de la récupération des conversations."
      );
      return;
    }

    console.log(
      "Début de la récupération des conversations pour userId :",
      userId
    );

    const conversationsRef = collection(db, "conversations");
    const q = query(
      conversationsRef,
      where("participants", "array-contains", Number(userId))
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        console.log(
          "Nombre de documents récupérés dans le snapshot :",
          snapshot.docs.length
        );

        const fetchedConversations = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const otherParticipant = data.participants.find(
              (id: number) => id !== Number(userId)
            );
            const { name: otherParticipantName, profilePhoto } =
              otherParticipant
                ? await fetchUserDetails(otherParticipant)
                : { name: "Inconnu", profilePhoto: null };

            // Récupérer les messages non lus pour chaque conversation
            const messagesRef = collection(db, "messages");
            const unreadMessagesQuery = query(
              messagesRef,
              where("receiverId", "==", Number(userId)),
              where("senderId", "==", otherParticipant),
              where("isRead", "==", false)
            );

            const unreadMessagesSnapshot = await new Promise(
              (resolve, reject) => {
                onSnapshot(
                  unreadMessagesQuery,
                  (querySnapshot) => resolve(querySnapshot),
                  (error) => reject(error)
                );
              }
            );

            const unreadCount = (unreadMessagesSnapshot as any).docs.length;

            console.log(
              "Messages non lus pour cette conversation :",
              unreadCount
            );

            return {
              id: doc.id,
              participants: data.participants,
              lastMessage: data.lastMessage,
              otherParticipantName,
              profilePhoto,
              unreadCount,
            };
          })
        );

        console.log(
          "Conversations après récupération des noms et des non lus :",
          fetchedConversations
        );

        setConversations(fetchedConversations);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Erreur lors de la récupération des conversations :",
          error
        );
        setLoading(false);
      }
    );

    return () => {
      console.log("Nettoyage de l'abonnement Firestore.");
      unsubscribe();
    };
  }, [userId]);

  const updateUnreadCount = (receiverId: number) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.participants.includes(receiverId)
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const truncatedMessage =
      item.lastMessage.length > 100
        ? item.lastMessage.substring(0, 100) + "..."
        : item.lastMessage;

    return (
      <TouchableOpacity
      style={[
        styles.conversationItem,
        item.unreadCount && item.unreadCount > 0
          ? styles.unreadConversation
          : null,
      ]}
      onPress={() =>
        navigation.navigate("ChatScreen", {
          senderId: userId,
          receiverId: item.participants.find((id) => id !== Number(userId)),
          onConversationRead: updateUnreadCount, // Passer la fonction
        })
      }
    >
      <View>
        {item.profilePhoto ? (
          <Image
            source={{ uri: item.profilePhoto }}
            style={styles.profilePhoto}
          />
        ) : (
          <View style={styles.defaultProfilePhoto} />
        )}
      </View>
      <View style={styles.conversationDetails}>
        <Text style={styles.conversationTitle}>
          {item.otherParticipantName || "Nom inconnu"}
        </Text>
        <Text style={styles.lastMessage}>
          {typeof truncatedMessage === "string" ? truncatedMessage : "Aucun message"}
        </Text>
      </View>
    
      {item.unreadCount && typeof item.unreadCount === "number" && item.unreadCount > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{String(item.unreadCount)}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
        />
      ) : (
        <Text>Aucune conversation trouvée.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    paddingTop: 120,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  conversationItem: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 50,
    marginBottom: 10,
  },
  unreadConversation: { backgroundColor: "#e6f7ff" },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  defaultProfilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },
  conversationDetails: {
    flex: 1,
    justifyContent: "center",
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 12,
    color: "#666",
  },
  unreadBadge: {
    backgroundColor: "#ff3d00",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
    alignSelf: "center",
  },
  unreadBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
});

export default ConversationsScreen;

