import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Animated,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
  Query,
  getDocs as firebaseGetDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import axios from "axios";
// @ts-ignore
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const getDocs = (unreadMessagesQuery: Query<DocumentData>) => {
  return firebaseGetDocs(unreadMessagesQuery);
};

const ConversationsScreen = ({ navigation, route }: any) => {
  const userId = route.params?.userId;
  console.log("UserId reçu dans ConversationsScreen :", userId);

  interface Conversation {
    id: string;
    participants: number[];
    lastMessage: string;
    otherParticipantName?: string;
    lastMessageTimestamp?: string | null;
    unreadCount?: number;
    profilePhoto?: string | null;
  }

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenConversations, setHiddenConversations] = useState<string[]>([]);
  const [showHiddenConversations, setShowHiddenConversations] = useState(false);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);

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
        const fetchedConversations = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const otherParticipant = data.participants.find(
              (id: number) => id !== Number(userId)
            );
  
            const unreadMessagesQuery = query(
              collection(db, "messages"),
              where("receiverId", "==", Number(userId)),
              where("senderId", "==", otherParticipant),
              where("isRead", "==", false)
            );
  
            const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
            const unreadCount = unreadMessagesSnapshot.docs.length;
  
            return {
              id: doc.id,
              participants: data.participants,
              lastMessage: data.lastMessage,
              lastMessageTimestamp: data.lastMessageTimestamp?.seconds
                ? new Date(
                    data.lastMessageTimestamp.seconds * 1000
                  ).toISOString()
                : null,
              otherParticipantName: otherParticipant
                ? (await fetchUserDetails(otherParticipant)).name
                : "Inconnu",
              profilePhoto: otherParticipant
                ? (await fetchUserDetails(otherParticipant)).profilePhoto
                : null,
              unreadCount,
            };
          })
        );
  
        const sortedConversations = fetchedConversations.sort((a, b) => {
          if (!a.lastMessageTimestamp) return 1; 
          if (!b.lastMessageTimestamp) return -1;
          return new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime();
        });
  
        setAllConversations(sortedConversations);
  
        const visibleConversations = sortedConversations.filter(
          (conversation) => !hiddenConversations.includes(conversation.id)
        );
  
        setConversations(visibleConversations);
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
      unsubscribe();
    };
  }, [userId, hiddenConversations]);

  useEffect(() => {
    const loadHiddenConversations = async () => {
      try {
        const savedHidden = await AsyncStorage.getItem("hiddenConversations");
        if (savedHidden) {
          const parsedHidden = JSON.parse(savedHidden);
          setHiddenConversations(parsedHidden);
 
          setConversations((prevConversations) =>
            prevConversations.filter(
              (conversation) => !parsedHidden.includes(conversation.id)
            )
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des conversations masquées :",
          error
        );
      }
    };

    loadHiddenConversations();
  }, []);

  useEffect(() => {
    const saveHiddenConversations = async () => {
      try {
        await AsyncStorage.setItem(
          "hiddenConversations",
          JSON.stringify(hiddenConversations)
        );
      } catch (error) {
        console.error(
          "Erreur lors de la sauvegarde des conversations masquées :",
          error
        );
      }
    };

    saveHiddenConversations();
  }, [hiddenConversations]);

  const hideConversation = (conversationId: string) => {
    setHiddenConversations((prev) => {
      const updatedHiddenConversations = [...prev, conversationId];
 
      setConversations((prevConversations) =>
        prevConversations.filter(
          (conversation) => conversation.id !== conversationId
        )
      );

      return updatedHiddenConversations;
    });
  };

  const updateUnreadCount = (receiverId: number) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.participants.includes(receiverId)
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );

    return conversations.filter((conversation) =>
      conversation.participants.includes(receiverId)
    );
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const truncatedMessage =
      item.lastMessage.length > 100
        ? item.lastMessage.substring(0, 100) + "..."
        : item.lastMessage;

    const lastMessageTime = item.lastMessageTimestamp
      ? formatLastMessageTime(item.lastMessageTimestamp)
      : "N/A";

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          item.unreadCount && item.unreadCount > 0
            ? styles.unreadConversation
            : null,
        ]}
        onPress={() => {
          const receiverId = item.participants.find(
            (id) => id !== Number(userId)
          );
          if (receiverId !== undefined) {
            updateUnreadCount(receiverId);
          }

          navigation.navigate("ChatScreen", {
            senderId: userId,
            receiverId: item.participants.find((id) => id !== Number(userId)),
          });
        }}
        onLongPress={() =>
          Alert.alert(
            "Masquer la conversation",
            "Voulez-vous vraiment masquer cette conversation ?",
            [
              { text: "Annuler", style: "cancel" },
              {
                text: "Masquer",
                onPress: () => hideConversation(item.id),  
                style: "destructive",
              },
            ]
          )
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
            {typeof truncatedMessage === "string"
              ? truncatedMessage
              : "Aucun message"}
          </Text>
        </View>
        <Text style={styles.timestamp}>{lastMessageTime}</Text>
        {item.unreadCount &&
        typeof item.unreadCount === "number" &&
        item.unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {String(item.unreadCount)}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const formatLastMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();

    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const recoverConversation = (conversationId: string) => {
    setHiddenConversations((prev) => {
      const updated = prev.filter((id) => id !== conversationId);
 
      const recoveredConversation = allConversations.find(
        (conv) => conv.id === conversationId
      );

      if (recoveredConversation) {
        setConversations((prevConversations) => [
          ...prevConversations,
          recoveredConversation,
        ]);
      }
 
      AsyncStorage.setItem(
        "hiddenConversations",
        JSON.stringify(updated)
      ).catch((error) =>
        console.error(
          "Erreur lors de la mise à jour des conversations masquées :",
          error
        )
      );

      return updated;
    });
  };


  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleConversations}>Conversations récentes</Text>
  
        <TouchableOpacity
          style={styles.showHiddenButton}
          onPress={() => setShowHiddenConversations(!showHiddenConversations)}
        >
          <Ionicons name="settings-outline" size={24} color="#093A3E" style={styles.icon} />
        </TouchableOpacity>
      </View>
  
      {showHiddenConversations && (
        <>
          {hiddenConversations.length > 0 ? (
            <>
              {/* Message explicatif */}
              <Text style={styles.tooltip}>
                Vous pouvez récupérer les conversations masquées ci-dessous.
              </Text>
  
              {/* Liste des conversations masquées */}
              <FlatList
              style={styles.hiddenList}
                data={allConversations.filter((conversation) =>
                  hiddenConversations.includes(conversation.id)
                )}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.hiddenConversationItem}>
                    <View style={styles.profileContainer}>
                      {item.profilePhoto ? (
                        <Image
                          source={{ uri: item.profilePhoto }}
                          style={styles.profilePhoto}
                        />
                      ) : (
                        <View style={styles.defaultProfilePhoto} />
                      )}
  
                      <Text style={styles.hiddenConversationName}>
                        {item.otherParticipantName || "Nom inconnu"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.recoverButton}
                      onPress={() => recoverConversation(item.id)}
                    >
                      <Text style={styles.recoverButtonText}>Récupérer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          ) : ( 
            <Text style={styles.noHiddenConversations}>
              Appuyez longuement sur une conversation pour la masquer, puis récupérez-la ici à tout moment !
            </Text>
          )}
        </>
      )}
  
      {/* Liste principale */}
      {loading ? (
        <ActivityIndicator size="large" color="#093A3E" />
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
        />
      ) : (
        <Text style={styles.noConversation}>Aucune conversation trouvée.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: "#F2F4F7",
    paddingTop: 90,
    paddingHorizontal: 10,
    paddingBottom: 100,

  },
  icon: {
    marginRight: 10,
    marginTop:3,
  },
  conversationItem: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderRadius: 50,
    marginBottom: 10,
  },
  unreadConversation: {
    backgroundColor: "#e6f7ff",
  },
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
  titleConversations: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#093A3E",
    marginLeft: 10,
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
  noHiddenConversations: {
    color: "#555",  
    fontSize: 14,
    textAlign: "center",
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: "#FDD1D1", 
    padding: 10,
    borderRadius: 8,
    fontStyle: "italic",  
  },
  tooltip: {
    color: "#093A3E", 
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
    backgroundColor: "#E8F1F2",  
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hiddenList: {
    borderWidth : 1,
    borderColor: "#ccc",
    backgroundColor: "#E5EFF0", 
    borderRadius: 20,
    height:"100%",
    marginTop: 10,
    marginBottom: 20,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  noConversation: {
    marginTop: 20,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    alignSelf: "flex-end",
    marginRight: 10,
    marginBottom: 17,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  showHiddenButton: {
    flexDirection: "row",
    borderRadius: 5,
    alignItems: "center",
  },
  hiddenConversation: {
    fontSize: 12,
    color: "#093A3E",
    marginRight: 10,
    fontWeight: "bold",
  },
  showHiddenButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  hiddenConversationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC",
  },
  hiddenConversationName: {
    fontSize: 16,
  },
  recoverButton: {
    backgroundColor: "#28A745",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 30,
  },
  recoverButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default ConversationsScreen;
