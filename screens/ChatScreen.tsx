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
  getDoc,
  setDoc,
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

export default function ChatScreen ({ route, navigation }: any){
  const { receiverId, senderId, onConversationRead } = route.params;
  const { getToken } = useToken();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [currentUserProfilePhoto, setCurrentUserProfilePhoto] = useState("");
  const [userDetails, setUserDetails] = useState<{
    id: string;
    name: string;
    profilePhoto: string | null;
  }>({ id: "", name: "Utilisateur inconnu", profilePhoto: null });

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
  
      setLastSentMessage(
        fetchedMessages.filter((msg) => msg.senderId === senderId).pop() || null
      );
  
      flatListRef.current?.scrollToEnd({ animated: true });
  
      const unreadMessages = snapshot.docs.filter(
        (doc) => doc.data().receiverId === senderId && !doc.data().isRead
      );
  
      if (unreadMessages.length > 0) {
        try {
          await Promise.all(
            unreadMessages.map((doc) => updateDoc(doc.ref, { isRead: true }))
          );
          console.log("📩 Messages non lus mis à jour !");
        } catch (error) {
          console.error("❌ Erreur lors de la mise à jour des messages :", error);
        }
      }
    });
  
    return () => unsubscribe();
  }, [receiverId, senderId]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const userDetails = await fetchUserDetails(receiverId);
      const currentUser = await fetchCurrentUserDetails(senderId);
  
      setUserDetails(userDetails);
      setCurrentUserProfilePhoto(currentUser.profilePhoto);
    };
  
    fetchUserData();
  }, [receiverId, senderId]);
  
  useEffect(() => {
    if (!route.params?.receiverId) return;
  
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
        onConversationRead?.(receiverId);
      },
    });
  }, [navigation, route.params, userDetails]);

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

  const sendMessage = async () => {
    if (newMessage.trim().length === 0) {
      console.warn("Message vide, envoi annulé.");
      return;
    }
  
    try {
      const messagesRef = collection(db, "messages");
      const conversationsRef = collection(db, "conversations");
      const conversationId = [senderId, receiverId].sort().join("_");
  
      const docRef = await addDoc(messagesRef, {
        senderId,
        receiverId,
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false,
      });
  
      console.log("Message ajouté avec succès :", docRef.id);
  
      const conversationDocRef = doc(conversationsRef, conversationId);
      const conversationSnapshot = await getDoc(conversationDocRef);
  
      if (!conversationSnapshot.exists()) {
        await setDoc(conversationDocRef, {
          participants: [senderId, receiverId],
          lastMessage: newMessage.trim(),
          lastMessageTimestamp: serverTimestamp(),
        });
        console.log("Nouvelle conversation créée :", conversationId);
      } else {
        await updateDoc(conversationDocRef, {
          lastMessage: newMessage.trim(),
          lastMessageTimestamp: serverTimestamp(),
        });
        console.log("Conversation mise à jour :", conversationId);
      }
  
      setNewMessage("");
  
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
  
      let senderName = "Un utilisateur"; 
      try {
        const userResponse = await fetch(`${API_URL}/users/${senderId}`);
        if (!userResponse.ok) throw new Error(`Erreur API utilisateur : ${userResponse.statusText}`);
        const userData = await userResponse.json();
        senderName = userData.useFullName
          ? `${userData.firstName} ${userData.lastName}`
          : userData.username;
      } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur :", error);
      }
  
      try {
        const bodyData = {
          userId: receiverId,
          message: `Nouveau message de ${senderName}`,
          type: "new_message",
          relatedId: String(docRef.id),
          initiatorId: senderId,
        };
  
        const response = await fetch(`${API_URL}/notifications/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

        if (onConversationRead) {
          onConversationRead(receiverId);
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour des messages :", error);
      }
    }
  };

  const reportConversation = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une raison pour le signalement.");
      return;
    }
  
    try {
      const reporterId = senderId; 
      const conversationId = [senderId, receiverId].sort().join("_");
  
      const payload = {
        to: "yannleroy23@gmail.com",
        subject: "Signalement d'une conversation",
        conversationId, 
        reporterId,
        reportReason,
      };
  
      console.log("Payload envoyé au backend :", payload);
  
      const response = await fetch(`${API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur renvoyée par l'API :", errorData);
        throw new Error(errorData.message || "Erreur lors du signalement.");
      }
  
      const result = await response.json();
      console.log("Signalement envoyé :", result);
      Alert.alert("Succès", "Le signalement a été envoyé.");
      setReportReason("");
      setReportModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
      Alert.alert("Erreur", "Une erreur s'est produite lors du signalement.");
    }
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setReportReason("");
  };

  const openReportModal = () => setReportModalVisible(true);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={24}
            color="#FFFFFC"
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
            size={24}
            color="#FFFFFC"
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
                placeholderTextColor="#777777" 
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
    backgroundColor: "#235562", 
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#FFFFFC', 
    letterSpacing:2,
    fontWeight: 'bold',
    fontFamily: 'Insanibc',
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0, 
    left: 0,
    right: 0,
    bottom: 0, 
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, 
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
    elevation: 10,
  },
  textInput: {
    borderWidth: 1,
    height: 90,
    width: "100%",
    borderColor: "#ccc", 
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    backgroundColor: "#F2F4F7", 
    marginBottom: 20,
    color: "#333", 
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
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
    flexDirection: "row", 
    alignItems: "center",
    marginTop: 5,
  },
  sentInfoMessage: {
    justifyContent: "flex-end", 
  },
  receivedInfoMessage: {
    justifyContent: "flex-start", 
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
    color: "#000000", 
  },
  dateHeader: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    fontWeight: "bold",
  },
  receivedMessageText: {
    fontSize: 16,
    color: "#000000", 
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


