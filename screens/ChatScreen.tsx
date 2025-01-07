import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Image,
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
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useToken } from "../hooks/useToken";
// @ts-ignore
import { API_URL } from "@env";
import axios from "axios";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
  isRead: boolean;
};

const ChatScreen = ({ route, navigation }: any) => {
  const { getToken } = useToken();

  const { receiverId, senderId, onConversationRead } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  // Variable d'état pour suivre l'ID du dernier message envoyé
  const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    id: string;
    name: string;
    profilePhoto: string | null;
  }>({ id: "", name: "Utilisateur inconnu", profilePhoto: null });
  const [currentUserProfilePhoto, setCurrentUserProfilePhoto] = useState("");

  // Fonction pour récupérer les détails d'un utilisateur (nom et photo de profil)
  const fetchUserDetails = async (
    userId: number
  ): Promise<{ id: string; name: string; profilePhoto: string | null }> => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      const user = response.data;

      const name = user.useFullName
        ? `${user.firstName} ${user.lastName}`
        : user.username || "Utilisateur inconnu";

      const profilePhoto = user.profilePhoto?.url || null;

      return { id: user.id, name, profilePhoto };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails pour l'utilisateur ${userId} :`,
        error
      );
      return { id: "", name: "Utilisateur inconnu", profilePhoto: null };
    }
  };

  const fetchCurrentUserDetails = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}`);
      const user = response.data;

      const name = user.useFullName
        ? `${user.firstName} ${user.lastName}`
        : user.username || "Utilisateur inconnu";

      const profilePhoto = user.profilePhoto?.url || null;

      return { id: user.id, name, profilePhoto };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails pour l'utilisateur ${userId} :`,
        error
      );
      return { id: "", name: "Utilisateur inconnu", profilePhoto: null };
    }
  };

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

      // Mettre à jour le dernier message envoyé
      const lastMessageSent = fetchedMessages
        .filter((msg) => msg.senderId === senderId)
        .pop(); // Récupère le dernier message envoyé
      setLastSentMessage(lastMessageSent || null);

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

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await fetchUserDetails(receiverId);
      setUserDetails(details);
    };

    fetchDetails();
  }, [receiverId]);

  useEffect(() => {
    if (route.params && route.params.receiverId) {
      const { receiverId } = route.params;

      navigation.setOptions({
        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {userDetails.profilePhoto && (
              <Image
                source={{ uri: userDetails.profilePhoto }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              />
            )}
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
              {userDetails.name}
            </Text>
          </View>
        ),
        onConversationRead: () => {
          console.log(`Marquer la conversation avec ${receiverId} comme lue`);
          if (onConversationRead) {
            onConversationRead(receiverId);
          }
        },
      });
    }
  }, [navigation, route.params, userDetails]);

  useEffect(() => {
    if (route.params && route.params.receiverId) {
      const { receiverId } = route.params;

      navigation.setOptions({
        onConversationRead: () => {
          console.log(`Marquer la conversation avec ${receiverId} comme lue`);
          if (onConversationRead) {
            onConversationRead(receiverId);
          }
        },
      });
    }
  }, [navigation, route.params]);

  useEffect(() => {
    const fetchCurrentUserProfilePhoto = async () => {
      const currentUserDetails = await fetchCurrentUserDetails(senderId);
      setCurrentUserProfilePhoto(currentUserDetails.profilePhoto);
    };

    fetchCurrentUserProfilePhoto();
  }, []);

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
      docRef = await addDoc(messagesRef, {
        senderId,
        receiverId,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false,
      });

      console.log("Message ajouté avec succès :", docRef.id);

      // Mettre à jour le dernier message envoyé
      const sentMessage = {
        id: docRef.id,
        senderId,
        receiverId,
        message: newMessage.trim(),
        timestamp: { seconds: Date.now() / 1000 }, // Simulez un timestamp
        isRead: false,
      };
      setLastSentMessage(sentMessage);

      // Mettre à jour la conversation
      const conversationDocRef = doc(conversationsRef, conversationId);
      await updateDoc(conversationDocRef, {
        lastMessage: newMessage.trim(),
        lastMessageTimestamp: serverTimestamp(),
      });

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

        // Si un callback est passé pour mettre à jour le badge
        if (onConversationRead) {
          onConversationRead(receiverId);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des messages :", error);
      }
    }
  };

  // Fonction pour signaler une conversation
  const reportConversation = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une raison pour le signalement.");
      return;
    }

    try {
      const reporterId = senderId; // L'utilisateur actuel
      const conversationId = [senderId, receiverId].sort().join("_");

      const response = await fetch(`${API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`, // Assurez-vous que getToken est défini
        },
        body: JSON.stringify({
          to: "yannleroy23@gmail.com", // Adresse email du support
          subject: "Signalement d'une conversation",
          text: `Une conversation a été signalée avec l'ID: ${conversationId}. 
                 Signalée par l'utilisateur avec l'ID: ${reporterId}. 
                 Raison: ${reportReason}`,
          html: `<p><strong>Une conversation a été signalée.</strong></p>
                 <p>ID de la conversation: ${conversationId}</p>
                 <p>Signalée par l'utilisateur avec l'ID: ${reporterId}</p>
                 <p>Raison: ${reportReason}</p>`,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du signalement de la conversation.");
      }

      const result = await response.json();
      console.log("Signalement de conversation envoyé :", result);
      Alert.alert("Succès", "Le signalement de la conversation a été envoyé.");
      setReportReason(""); // Réinitialiser le champ de raison
      setReportModalVisible(false);
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du signalement de la conversation :",
        error
      );
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi du signalement."
      );
    }
  };

  const openReportModal = () => setReportModalVisible(true);

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportReason("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={28}
            color="#CBCBCB"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("UserProfileScreen", { userId: userDetails.id })
          }
        >
          <View style={styles.typeBadge}>
            <Text style={styles.headerTitle}>{userDetails.name}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={openReportModal}>
          <Icon
            name="error"
            size={28}
            color="#CBCBCB"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isReportModalVisible}
        onRequestClose={closeReportModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Signaler ce profil</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Indiquez la raison ainsi que le maximum d'informations (ex: heures, dates, etc...)"
                value={reportReason}
                onChangeText={setReportReason}
                multiline={true}
              />
              <TouchableOpacity
                onPress={reportConversation}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Envoyer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeReportModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        ref={flatListRef}
        style={{ padding: 10 }}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const currentMessageDate = item.timestamp?.seconds
            ? new Date(item.timestamp.seconds * 1000)
            : new Date();

          const previousMessageDate =
            index > 0 && messages[index - 1].timestamp?.seconds
              ? new Date(messages[index - 1].timestamp.seconds * 1000)
              : null;

          const shouldShowDateHeader =
            !previousMessageDate ||
            currentMessageDate.toDateString() !==
              previousMessageDate.toDateString();

          const isSentByCurrentUser = item.senderId === senderId;

          return (
            <View>
              {shouldShowDateHeader && (
                <Text style={styles.dateHeader}>
                  {currentMessageDate.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year:
                      currentMessageDate.getFullYear() !==
                      new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                  })}
                </Text>
              )}

              <View
                style={[
                  styles.messageContainer,
                  isSentByCurrentUser
                    ? styles.sentMessageContainer
                    : styles.receivedMessageContainer,
                ]}
              >
                {!isSentByCurrentUser && userDetails.profilePhoto && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("UserProfileScreen", {
                        userId: userDetails.id,
                      })
                    }
                  >
                    <Image
                      source={{ uri: userDetails.profilePhoto }}
                      style={styles.profilePhoto}
                    />
                  </TouchableOpacity>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isSentByCurrentUser
                      ? styles.sentMessage
                      : styles.receivedMessage,
                  ]}
                >
                  <Text
                    style={
                      isSentByCurrentUser
                        ? styles.sentMessageText
                        : styles.receivedMessageText
                    }
                  >
                    {item.message}
                  </Text>

                  <View
                    style={[
                      styles.infoMessage,
                      isSentByCurrentUser
                        ? styles.sentInfoMessage
                        : styles.receivedInfoMessage,
                    ]}
                  >
                    {lastSentMessage && item.id === lastSentMessage.id && (
                      <Text style={styles.messageStatus}>
                        {lastSentMessage.isRead ? "Lu - " : "Non lu - "}
                      </Text>
                    )}
                    <Text style={styles.timestamp}>
                      {currentMessageDate.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>

                {isSentByCurrentUser && currentUserProfilePhoto && (
                  <Image
                    source={{ uri: currentUserProfilePhoto }}
                    style={styles.profilePhoto}
                  />
                )}
              </View>
            </View>
          );
        }}
        onContentSizeChange={() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }}
        onLayout={() => {
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
    backgroundColor: "#535353", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
    fontFamily: 'Starborn', // Utilisez le nom de la police que vous avez défini

  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0, // Occupe toute la hauteur
    left: 0,
    right: 0,
    bottom: 0, // Occupe toute la hauteur
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Toujours au-dessus
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10, // Ombre pour un effet surélevé
  },
  textInput: {
    borderWidth: 1,
    height: 90,
    width: "100%",
    borderColor: "#ccc", // Light gray border
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    backgroundColor: "#f9f9f9", // Subtle off-white background
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700", // Titre plus bold
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#ff4d4f",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  messageBubble: { padding: 10, borderRadius: 10, marginVertical: 5 },
  sentMessage: {
    backgroundColor: "#e1ffc7",
    alignSelf: "flex-end",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginLeft: 50,
  },
  receivedMessage: {
    backgroundColor: "#f1f1f1",
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 50,
  },
  messageText: { fontSize: 18 },
  infoMessage: {
    flexDirection: "row", // Aligne les éléments horizontalement
    alignItems: "center",
    marginTop: 5,
  },
  sentInfoMessage: {
    justifyContent: "flex-end", // Aligne les infos des messages envoyés à droite
  },
  receivedInfoMessage: {
    justifyContent: "flex-start", // Aligne les infos des messages reçus à gauche
  },
  timestamp: {
    fontSize: 10,
    color: "#888",
  },
  messageStatus: {
    fontSize: 10,
    color: "#888",
    fontWeight: "bold",
  },
  sentMessageText: {
    fontSize: 16,
    color: "#000000", // Texte blanc pour les messages envoyés
  },
  dateHeader: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
  },
  receivedMessageText: {
    fontSize: 16,
    color: "#000000", // Texte noir pour les messages reçus
  },
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
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 5,
  },
  sentMessageContainer: {
    justifyContent: "flex-end",
  },
  receivedMessageContainer: {
    justifyContent: "flex-start",
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  sendButtonText: { color: "#fff", fontWeight: "bold" },
});

export default ChatScreen;
