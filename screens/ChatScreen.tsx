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
  const [reportReason, setReportReason] = useState("");
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
  
  // Animation pour le modal de rapport
  const reportModalAnim = useRef(new Animated.Value(0)).current;
  
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

  const reportConversation = async (): Promise<void> => {
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
      if (error instanceof Error) {
        console.error("Erreur lors de l'envoi du signalement :", error.message);
      } else {
        console.error("Erreur lors de l'envoi du signalement :", error);
      }
      Alert.alert("Erreur", "Une erreur s'est produite lors du signalement.");
    }
  };

  const closeReportModal = () => {
    // Animation de fermeture du modal
    Animated.timing(reportModalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setReportModalVisible(false);
      setReportReason("");
    });
  };

  const openReportModal = () => {
    setReportModalVisible(true);
    Animated.timing(reportModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
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

      {/* Modal de signalement */}
      <Modal
        animationType="none"
        transparent={true}
        visible={isReportModalVisible}
        onRequestClose={closeReportModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  opacity: reportModalAnim,
                  transform: [{
                    translateY: reportModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Signaler cette conversation</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeReportModal}
                >
                  <Icon name="close" size={24} color="#757575" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <Text style={styles.modalDescription}>
                  Veuillez expliquer la raison de votre signalement. Notre équipe examinera votre signalement dans les plus brefs délais.
                </Text>
                
                <TextInput
                  style={styles.reportInput}
                  placeholder="Décrivez le problème..."
                  placeholderTextColor="#A0A0A0"
                  value={reportReason}
                  onChangeText={setReportReason}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeReportModal}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    !reportReason.trim() && styles.confirmButtonDisabled
                  ]}
                  onPress={reportConversation}
                  disabled={!reportReason.trim()}
                >
                  <Text style={styles.confirmButtonText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Styles modernisés et optimisés pour une meilleure expérience utilisateur
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#062C41",
    paddingTop: Platform.OS === 'ios' ? 50 : 38,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    backgroundColor: "#C4C4C4",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userInfoContainer: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  userStatus: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  reportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Liste de messages
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContainer: {
    paddingTop: 10,
    paddingBottom: 16,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: "500",
    color: "#757575",
    marginHorizontal: 8,
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sentMessageContainer: {
    justifyContent: "flex-end",
  },
  receivedMessageContainer: {
    justifyContent: "flex-start",
  },
  consecutiveSentMessage: {
    marginTop: -2,
    marginBottom: 2,
  },
  consecutiveReceivedMessage: {
    marginTop: -2,
    marginBottom: 2,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  avatarSpaceholder: {
    width: 32,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sentMessage: {
    backgroundColor: "#E6F2FF",
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  consecutiveSentBubble: {
    borderBottomRightRadius: 18,
  },
  consecutiveReceivedBubble: {
    borderBottomLeftRadius: 18,
  },
  messageText: {
    fontSize: 16,
    color: "#333333",
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  readStatusContainer: {
    marginLeft: 6,
  },
  readIcon: {
    marginTop: 1,
  },
  // Input container
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 16,
    color: "#333333",
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3E64FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#CACACA",
  },
  // Modal de signalement
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.08)",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 16,
    lineHeight: 20,
  },
  reportInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    padding: 12,
    fontSize: 16,
    height: 120,
    color: "#333333",
  },
  modalFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    padding: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#FF5252",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#FFCDD2",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});