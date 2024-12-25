import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
// @ts-ignore
import { API_URL } from "@env";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
  isRead: boolean;
};

const ChatScreen = ({ route, navigation }: any) => {
  const { receiverId, senderId, onConversationRead } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  // Variable d'état pour suivre l'ID du dernier message envoyé
  const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null);

  useEffect(() => {
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("senderId", "in", [senderId, receiverId]),
      where("receiverId", "in", [receiverId, senderId]),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(fetchedMessages);

      // Scroller vers le bas
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }

      // Marquer les messages non lus comme "lus"
      const unreadMessages = snapshot.docs.filter(
        (doc) => doc.data().receiverId === senderId && !doc.data().isRead
      );

      console.log("Messages non lus détectés :", unreadMessages.length);

      if (unreadMessages.length > 0) {
        try {
          await Promise.all(
            unreadMessages.map((doc) => updateDoc(doc.ref, { isRead: true }))
          );

          // Mettre à jour l'état localement
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              unreadMessages.find((unread) => unread.id === msg.id)
                ? { ...msg, isRead: true }
                : msg
            )
          );

          console.log("Mise à jour locale des messages non lus réussie.");
        } catch (error) {
          console.error("Erreur lors de la mise à jour des messages :", error);
        }
      }
    });

    return () => unsubscribe();
  }, [receiverId, senderId]);
  
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim().length === 0) {
      console.warn("Message vide, envoi annulé.");
      return;
    }

    try {
      const messagesRef = collection(db, "messages");
      const conversationsRef = collection(db, "conversations");
      const conversationId = [senderId, receiverId].sort().join("_");

      let docRef;

      // Ajouter le message à Firestore
      try {
        console.log("Ajout du message à Firestore...");
        docRef = await addDoc(messagesRef, {
          senderId,
          receiverId,
          message: newMessage.trim(),
          timestamp: serverTimestamp(),
          isRead: false,
        });
        console.log("Message ajouté avec succès :", docRef.id);
      } catch (error) {
        console.error("Erreur lors de l'ajout du message à Firestore :", error);
        throw new Error("Échec de l'ajout du message à Firestore.");
      }

      // Mettre à jour la conversation
      try {
        console.log("Mise à jour de la conversation...");
        const conversationDocRef = doc(conversationsRef, conversationId);
        await updateDoc(conversationDocRef, {
          lastMessage: newMessage.trim(),
          lastMessageTimestamp: serverTimestamp(),
        });
        console.log("Conversation mise à jour avec succès.");
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la conversation :",
          error
        );
        throw new Error("Échec de la mise à jour de la conversation.");
      }

      setNewMessage("");
      // Scroller vers le bas après l'envoi du message
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
      // Récupérer les informations de l'utilisateur expéditeur via l'API REST
      let senderName = "Un utilisateur"; // Valeur par défaut
      try {
        console.log(
          `Récupération des informations de l'utilisateur avec l'ID : ${senderId}`
        );
        const userResponse = await fetch(`${API_URL}/users/${senderId}`);
        if (!userResponse.ok) {
          throw new Error(
            `Erreur API utilisateur : ${userResponse.statusText}`
          );
        }

        const userData = await userResponse.json();
        console.log("Données utilisateur récupérées :", userData);

        // Construire le nom à utiliser dans la notification
        senderName = userData.useFullName
          ? `${userData.firstName} ${userData.lastName}`
          : userData.username;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des informations utilisateur :",
          error
        );
      }

      // Envoyer une requête vers votre route createNotification
      try {
        console.log("Envoi de la notification via l'API...");
        const bodyData = {
          userId: receiverId,
          message: `Nouveau message de ${senderName}`,
          type: "new_message",
          relatedId: String(docRef.id), // Assurez-vous que relatedId est une chaîne
          initiatorId: senderId,
        };

        console.log("Données envoyées à l'API createNotification :", bodyData);

        const response = await fetch(`${API_URL}/notifications/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyData),
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          console.error("Erreur API lors de la création de la notification :", {
            status: response.status,
            statusText: response.statusText,
            body: errorDetails,
          });
          throw new Error(
            `Échec de la requête API : ${response.statusText} (Status: ${response.status})`
          );
        }

        const responseData = await response.json();
        console.log("Notification créée avec succès :", responseData);
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
      }
    } catch (error) {
      console.error("Erreur lors du processus d'envoi du message :", error);
    }
  };

  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(
      (msg) => msg.receiverId === senderId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      try {
        await Promise.all(
          unreadMessages.map((msg) =>
            updateDoc(doc(db, "messages", msg.id), { isRead: true })
          )
        );

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            unreadMessages.find((unread) => unread.id === msg.id)
              ? { ...msg, isRead: true }
              : msg
          )
        );

        // Appeler onConversationRead pour notifier le parent
        if (onConversationRead) {
          onConversationRead(receiverId); // Passer l'ID du participant concerné
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des messages :", error);
      }
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={28}
            color="#BEE5BF"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>CHAT</Text>
        </View>

        <TouchableOpacity onPress={() => Alert.alert("Signaler")}>
          <Icon
            name="warning"
            size={28}
            color="#BEE5BF"
            style={{ marginRight: 10, marginTop: 2 }}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        style={{ padding: 10 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.senderId === senderId
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
            {lastSentMessage && item.id === lastSentMessage.id && (
              <Text style={styles.messageStatus}>
                {lastSentMessage.isRead ? "Lu" : "En attente de lecture"}
              </Text>
            )}
          </View>
        )}
        onContentSizeChange={() => {
          // Scroller vers le bas lorsque le contenu change (par exemple, à l'ouverture de la page)
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
          // Scroller vers le bas lors du rendu initial de la page
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Tapez un message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5 },
  sentMessage: { backgroundColor: "#e1ffc7", alignSelf: "flex-end",  borderRadius: 20, paddingHorizontal: 15, marginLeft: 50 },
  receivedMessage: { backgroundColor: "#f1f1f1", alignSelf: "flex-start", borderRadius: 20, paddingHorizontal: 15, marginRight: 50 },
  messageText: { fontSize: 18 },
  messageStatus: { fontSize: 12, color: "#666", marginTop: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
  },
  sendButton: {
    backgroundColor: "#4BAB57",
    padding: 10,
    borderRadius: 30,
    marginLeft: 10,
  },
  timestamp: {
    fontSize: 8,
    color: "#888",
    marginTop: 5,
    alignSelf: "flex-end", // Alignement à droite pour les messages envoyés
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ChatScreen;
