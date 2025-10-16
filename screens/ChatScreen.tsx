// ChatScreen.tsx - Design moderne et optimisé pour l'expérience utilisateur
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
  StatusBar,
  Animated,
  ActivityIndicator,
  Platform,
  Dimensions,
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
import { useToken } from "../hooks/auth/useToken";
// @ts-ignore
import { API_URL } from "@env";
import axios from "axios";
import ConversationReportModal from "../components/home/modals/ConversationReportModal"; // ✅ AJOUTE CETTE LIGNE
import styles from "../styles/screens/ChatScreen.styles";

// Types et interfaces
type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: any;
  isRead: boolean;
};

const { width } = Dimensions.get("window");

export default function ChatScreen({ route, navigation }: any) {
  const { receiverId, senderId, onConversationRead } = route.params;
  const { getToken } = useToken();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [lastSentMessage, setLastSentMessage] = useState<Message | null>(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [currentUserProfilePhoto, setCurrentUserProfilePhoto] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<{
    id: string;
    name: string;
    profilePhoto: string | null;
  }>({ id: "", name: "Utilisateur inconnu", profilePhoto: null });
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nouvel état pour le chargement

  // Animation pour les nouveaux messages
  const messageAnimation = useRef(new Animated.Value(0)).current;
  const inputContainerAnim = useRef(new Animated.Value(1)).current;
  

  
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
      try {
        const userDetails = await fetchUserDetails(receiverId);
        const currentUser = await fetchCurrentUserDetails(senderId);
    
        setUserDetails(userDetails);
        setCurrentUserProfilePhoto(currentUser.profilePhoto);
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur :", error);
      } finally {
        setIsLoading(false); // Fin du chargement
      }
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

  // Méthodes de récupération des données utilisateur (inchangées)
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

  const fetchCurrentUserDetails = async (
    userId: string
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

  // Gestion de l'envoi des messages
  const sendMessage = async (): Promise<void> => {
    if (newMessage.trim().length === 0) {
      console.warn("Message vide, envoi annulé.");
      return;
    }
    
    setIsSending(true);
  
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
      
      // Animation du message envoyé
      Animated.sequence([
        Animated.timing(messageAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(messageAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
  
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
      Alert.alert(
        "Erreur",
        "Impossible d'envoyer le message. Veuillez réessayer."
      );
    } finally {
      setIsSending(false);
    }
  };

  const markMessagesAsRead = async (): Promise<void> => {
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

// ✅ NOUVELLE VERSION : Simplement envoyer le signalement au backend
const reportConversation = async (reportReason: string, reportType: string): Promise<void> => {
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
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
    } else {
      console.error("Erreur lors de l'envoi du signalement :", error);
    }
    throw error; // ✅ Le modal gère l'affichage de l'erreur
  }
};

// ✅ Versions simplifiées - le modal gère ses propres animations
const closeReportModal = () => {
  setReportModalVisible(false);
};

const openReportModal = () => {
  setReportModalVisible(true);
};
  // Fonctions pour la gestion du clavier
  const handleInputFocus = () => {
    Animated.timing(inputContainerAnim, {
      toValue: 1.02,
      duration: 200,
      useNativeDriver: true,
    }).start();
    flatListRef.current?.scrollToEnd({ animated: true });
  };
  
  const handleInputBlur = () => {
    Animated.timing(inputContainerAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Formatage des dates pour l'affichage
  const formatMessageDate = (timestamp: any): string => {
    if (!timestamp) return '';
    
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date();
      
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3E64FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.profileContainer}
          onPress={() => navigation.navigate("UserProfileScreen", { userId: userDetails.id })}
        >
          {userDetails.profilePhoto ? (
            <Image
              source={{ uri: userDetails.profilePhoto }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {userDetails.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.headerName}>{userDetails.name}</Text>
            <Text style={styles.userStatus}>
              {messages.length > 0 ? "En ligne" : "Hors ligne"}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={openReportModal}
        >
          <Icon name="more-vert" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Liste des messages */}
      <FlatList
        ref={flatListRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
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
          
          // Vérifier si c'est un message consécutif du même expéditeur
          const isConsecutive = index > 0 && 
            messages[index - 1].senderId === item.senderId && 
            !shouldShowDateHeader;

          return (
            <>
              {shouldShowDateHeader && (
                <View style={styles.dateHeaderContainer}>
                  <View style={styles.dateHeaderLine} />
                  <Text style={styles.dateHeader}>
                    {formatMessageDate(item.timestamp)}
                  </Text>
                  <View style={styles.dateHeaderLine} />
                </View>
              )}

              <View
                style={[
                  styles.messageContainer,
                  isSentByCurrentUser
                    ? styles.sentMessageContainer
                    : styles.receivedMessageContainer,
                  isConsecutive && (isSentByCurrentUser 
                    ? styles.consecutiveSentMessage 
                    : styles.consecutiveReceivedMessage)
                ]}
              >
                {!isSentByCurrentUser && !isConsecutive && userDetails.profilePhoto && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("UserProfileScreen", {
                        userId: userDetails.id,
                      })
                    }
                  >
                    <Image
                      source={{ uri: userDetails.profilePhoto }}
                      style={styles.messageAvatar}
                    />
                  </TouchableOpacity>
                )}
                
                {!isSentByCurrentUser && !isConsecutive && !userDetails.profilePhoto && (
                  <View style={[styles.messageAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>
                      {userDetails.name?.charAt(0).toUpperCase() || "?"}
                    </Text>
                  </View>
                )}

                {/* Espace réservé pour l'avatar sur les messages consécutifs reçus */}
                {!isSentByCurrentUser && isConsecutive && (
                  <View style={styles.avatarSpaceholder} />
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isSentByCurrentUser
                      ? styles.sentMessage
                      : styles.receivedMessage,
                    isConsecutive && (isSentByCurrentUser 
                      ? styles.consecutiveSentBubble 
                      : styles.consecutiveReceivedBubble)
                  ]}
                >
                  <Text style={styles.messageText}>
                    {item.message}
                  </Text>

                  <View style={styles.messageFooter}>
                    <Text style={styles.timestamp}>
                      {currentMessageDate.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    
                    {isSentByCurrentUser && lastSentMessage && item.id === lastSentMessage.id && (
                      <View style={styles.readStatusContainer}>
                        <Icon 
                          name={lastSentMessage.isRead ? "done-all" : "done"} 
                          size={14} 
                          color={lastSentMessage.isRead ? "#4CAF50" : "#9E9E9E"} 
                          style={styles.readIcon}
                        />
                      </View>
                    )}
                  </View>
                </View>

                {isSentByCurrentUser && !isConsecutive && currentUserProfilePhoto && (
                  <Image
                    source={{ uri: currentUserProfilePhoto }}
                    style={styles.messageAvatar}
                  />
                )}
                
                {isSentByCurrentUser && !isConsecutive && !currentUserProfilePhoto && (
                  <View style={[styles.messageAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarInitial}>M</Text>
                  </View>
                )}
                
                {/* Espace réservé pour l'avatar sur les messages consécutifs envoyés */}
                {isSentByCurrentUser && isConsecutive && (
                  <View style={styles.avatarSpaceholder} />
                )}
              </View>
            </>
          );
        }}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Input pour saisir un message */}
      <Animated.View 
        style={[
          styles.inputContainer,
          { transform: [{ scale: inputContainerAnim }] }
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Votre message..."
            placeholderTextColor="#A0A0A0"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Icon name="send" size={22} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

   
  {/* ✅ NOUVEAU MODAL MODERNE */}
<ConversationReportModal
  isVisible={isReportModalVisible}
  onClose={closeReportModal}
  onSendReport={reportConversation}
  conversationWith={userDetails.name}
/>
    </View>
  );
}
