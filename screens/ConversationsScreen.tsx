import React, { useEffect, useState, useRef, memo, useMemo, useCallback } from "react";
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
  Dimensions,
  Platform,
  StatusBar,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const getDocs = (unreadMessagesQuery: Query<DocumentData>) => {
  return firebaseGetDocs(unreadMessagesQuery);
};

// Définition d'interfaces précises
interface Conversation {
  id: string;
  participants: number[];
  lastMessage: string;
  otherParticipantName?: string;
  lastMessageTimestamp?: string | null;
  unreadCount?: number;
  profilePhoto?: string | null;
}

/**
 * Composant utilitaire pour encapsuler correctement les icônes Ionicons
 * Résout le problème "Text strings must be rendered within a <Text> component"
 */
const IconWrapper = memo(({ 
  name, 
  size, 
  color, 
  style 
}: { 
  name: any; 
  size: number; 
  color: string; 
  style?: any 
}) => (
  <View style={style}>
    <Text>
      <Ionicons name={name} size={size} color={color} />
    </Text>
  </View>
));

/**
 * Composant d'élément de conversation avec animations
 * Optimisé pour les performances avec mémoisation
 */
const ConversationItem = memo(({ 
  item, 
  index, 
  userId, 
  updateUnreadCount, 
  navigation, 
  hideConversation,
  formatLastMessageTime
}: { 
  item: Conversation; 
  index: number; 
  userId: string;
  updateUnreadCount: (receiverId: number) => void;
  navigation: any;
  hideConversation: (id: string) => void;
  formatLastMessageTime: (timestamp: string) => string;
}) => {
  // Animation refs
  const itemFadeAnim = useRef(new Animated.Value(0)).current;
  const itemSlideAnim = useRef(new Animated.Value(15)).current;
  
  // Computed properties
  const hasUnreadMessages = typeof item.unreadCount === 'number' && item.unreadCount > 0;
  const truncatedMessage = item.lastMessage && item.lastMessage.length > 100
    ? item.lastMessage.substring(0, 100) + "..."
    : item.lastMessage || "";
  const lastMessageTime = item.lastMessageTimestamp
    ? formatLastMessageTime(item.lastMessageTimestamp)
    : "N/A";
  const avatarInitial = item.otherParticipantName 
    ? item.otherParticipantName.charAt(0).toUpperCase() 
    : "?";
  
  // Animation sequence
  useEffect(() => {
    const delay = index * 50;
    const animationTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(itemSlideAnim, {
          toValue: 0,
          speed: 15,
          bounciness: 3,
          useNativeDriver: true,
        })
      ]).start();
    }, delay);
    
    return () => clearTimeout(animationTimeout);
  }, [itemFadeAnim, itemSlideAnim, index]);
    
  // Handlers
  const handlePress = useCallback(() => {
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
  }, [item.participants, userId, updateUnreadCount, navigation]);
  
  const handleLongPress = useCallback(() => {
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
    );
  }, [item.id, hideConversation]);

  return (
    <Animated.View style={{
      opacity: itemFadeAnim,
      transform: [{ translateY: itemSlideAnim }]
    }}>
      <TouchableOpacity
        style={[
          styles.conversationItem,
          hasUnreadMessages ? styles.unreadConversation : null
        ]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.profilePhoto ? (
            <Image
              source={{ uri: item.profilePhoto }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.defaultProfilePhoto}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
          
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {String(item.unreadCount)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationDetails}>
          <View style={styles.headingRow}>
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {item.otherParticipantName || "Nom inconnu"}
            </Text>
            <Text style={styles.timestamp}>{lastMessageTime}</Text>
          </View>
          
          <Text 
            style={[
              styles.lastMessage,
              hasUnreadMessages ? styles.unreadText : null
            ]} 
            numberOfLines={2}
          >
            {truncatedMessage || "Aucun message"}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

/**
 * Composant pour afficher une conversation archivée
 */
const ArchivedConversationItem = memo(({ 
  item, 
  recoverConversation 
}: { 
  item: Conversation; 
  recoverConversation: (id: string) => void;
}) => {
  const avatarInitial = item.otherParticipantName 
    ? item.otherParticipantName.charAt(0).toUpperCase() 
    : "?";

  return (
    <View style={styles.hiddenConversationItem}>
      <View style={styles.hiddenUserInfo}>
        {item.profilePhoto ? (
          <Image
            source={{ uri: item.profilePhoto }}
            style={styles.hiddenProfilePhoto}
          />
        ) : (
          <View style={styles.hiddenDefaultPhoto}>
            <Text style={styles.hiddenAvatarText}>{avatarInitial}</Text>
          </View>
        )}

        <Text style={styles.hiddenConversationName} numberOfLines={1}>
          {item.otherParticipantName || "Nom inconnu"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.recoverButton}
        onPress={() => recoverConversation(item.id)}
      >
        <IconWrapper name="refresh-outline" size={16} color="#FFFFFF" />
        <Text style={styles.recoverButtonText}>Récupérer</Text>
      </TouchableOpacity>
    </View>
  );
});

/**
 * Écran principal des conversations
 * Fonctionnalité complète avec animations, archivage et restauration
 */
export default function ConversationsScreen({ navigation, route }: any) {
  const userId = route.params?.userId;
  const insets = useSafeAreaInsets();

  // État
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenConversations, setHiddenConversations] = useState<string[]>([]);
  const [showHiddenConversations, setShowHiddenConversations] = useState(false);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const hiddenSectionAnim = useRef(new Animated.Value(50)).current;

  // Charger les conversations
  useEffect(() => {
    if (!userId) {
      console.log("Aucun userId trouvé. Arrêt de la récupération des conversations.");
      return;
    }

    console.log("Début de la récupération des conversations pour userId:", userId);

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
              lastMessage: data.lastMessage || "",
              lastMessageTimestamp: data.lastMessageTimestamp?.seconds
                ? new Date(data.lastMessageTimestamp.seconds * 1000).toISOString()
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
        
        // Animer l'apparition de la liste
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            speed: 12,
            bounciness: 2,
            useNativeDriver: true,
          })
        ]).start();
      },
      (error) => {
        console.error("Erreur lors de la récupération des conversations:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, hiddenConversations]);

  // Charger les conversations archivées
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
        console.error("Erreur lors du chargement des conversations masquées:", error);
      }
    };

    loadHiddenConversations();
  }, []);

  // Sauvegarder les conversations archivées
  useEffect(() => {
    const saveHiddenConversations = async () => {
      try {
        await AsyncStorage.setItem(
          "hiddenConversations",
          JSON.stringify(hiddenConversations)
        );
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des conversations masquées:", error);
      }
    };

    saveHiddenConversations();
  }, [hiddenConversations]);
  
  // Animation du panneau des conversations archivées
  useEffect(() => {
    if (showHiddenConversations) {
      Animated.spring(hiddenSectionAnim, {
        toValue: 0,
        friction: 8,
        tension: 65,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(hiddenSectionAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showHiddenConversations]);

  // Récupérer les détails d'un utilisateur depuis l'API
  const fetchUserDetails = useCallback(async (
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
        `Erreur lors de la récupération des détails pour l'utilisateur ${userId}:`,
        error
      );
      return { name: "Utilisateur inconnu", profilePhoto: null };
    }
  }, []);

  // Masquer une conversation
  const hideConversation = useCallback((conversationId: string) => {
    setHiddenConversations((prev) => {
      const updatedHiddenConversations = [...prev, conversationId];
 
      setConversations((prevConversations) =>
        prevConversations.filter(
          (conversation) => conversation.id !== conversationId
        )
      );

      return updatedHiddenConversations;
    });
  }, []);

  // Mettre à jour le compteur de messages non lus
  const updateUnreadCount = useCallback((receiverId: number) => {
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
  }, [conversations]);

  // Formater l'horodatage du dernier message
  const formatLastMessageTime = useCallback((timestamp: string) => {
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
  }, []);

  // Récupérer une conversation archivée
  const recoverConversation = useCallback((conversationId: string) => {
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
          "Erreur lors de la mise à jour des conversations masquées:",
          error
        )
      );

      return updated;
    });
  }, [allConversations]);

  // Rendu d'une conversation
  const renderConversation = useCallback(({ item, index }: { item: Conversation, index: number }) => {
    return (
      <ConversationItem
        item={item}
        index={index}
        userId={userId}
        updateUnreadCount={updateUnreadCount}
        navigation={navigation}
        hideConversation={hideConversation}
        formatLastMessageTime={formatLastMessageTime}
      />
    );
  }, [userId, updateUnreadCount, navigation, hideConversation, formatLastMessageTime]);

  // Données des conversations archivées
  const hiddenConversationsData = useMemo(() => 
    allConversations.filter(conversation => 
      hiddenConversations.includes(conversation.id)
    ),
    [allConversations, hiddenConversations]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.titleConversations}>Messages</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowHiddenConversations(!showHiddenConversations)}
          >
            <IconWrapper 
              name={showHiddenConversations ? "close-outline" : "settings-outline"} 
              size={24} 
              color="#062C41" 
            />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subtitle}>
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          {hiddenConversations.length > 0 && !showHiddenConversations && 
            ` • ${hiddenConversations.length} archivée${hiddenConversations.length !== 1 ? 's' : ''}`}
        </Text>
      </View>
      
      {/* Panel des conversations archivées */}
      {showHiddenConversations && (
        <Animated.View 
          style={[
            styles.hiddenPanel,
            {
              opacity: hiddenSectionAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [1, 0]
              }),
              transform: [{ translateY: hiddenSectionAnim }]
            }
          ]}
        >
          <View style={styles.hiddenPanelHeader}>
            <IconWrapper name="archive-outline" size={20} color="#062C41" />
            <Text style={styles.hiddenPanelTitle}>
              Conversations archivées ({hiddenConversationsData.length})
            </Text>
          </View>
          
          {hiddenConversationsData.length > 0 ? (
            <FlatList
              data={hiddenConversationsData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ArchivedConversationItem 
                  item={item}
                  recoverConversation={recoverConversation}
                />
              )}
              ListEmptyComponent={null}
              style={styles.hiddenList}
            />
          ) : (
            <View style={styles.emptyArchiveContainer}>
              <IconWrapper name="folder-open-outline" size={48} color="#A0A0A0" />
              <Text style={styles.emptyArchiveText}>
                Appuyez longuement sur une conversation pour l'archiver
              </Text>
            </View>
          )}
        </Animated.View>
      )}
      
      {/* Liste de conversations principale */}
      <Animated.View style={[
        styles.mainContent,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#062C41" />
            <Text style={styles.loadingText}>Chargement des conversations...</Text>
          </View>
        ) : conversations.length > 0 ? (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            contentContainerStyle={styles.conversationsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <IconWrapper name="chatbubbles-outline" size={70} color="#D1D5DB" />
            <Text style={styles.noConversation}>Aucune conversation</Text>
            <Text style={styles.emptyDescription}>
              Vos conversations apparaîtront ici
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginTop:56,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleConversations: {
    fontSize: 28,
    fontWeight: "700",
    color: "#062C41",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#8A96A8",
    marginTop: 4,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
  },
  conversationsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    marginVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadConversation: {
    backgroundColor: "#F0F7FF",
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F7FA",
  },
  defaultProfilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5EFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  conversationDetails: {
    flex: 1,
    justifyContent: "center",
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#062C41",
    flex: 1,
    marginRight: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  unreadText: {
    color: "#334155",
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 12,
    color: "#94A3B8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#94A3B8",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noConversation: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  hiddenPanel: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    margin: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    maxHeight: height * 0.4,
  },
  hiddenPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  hiddenPanelTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#062C41",
    marginLeft: 8,
  },
  hiddenList: {
    maxHeight: height * 0.3,
  },
  hiddenConversationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  hiddenUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  hiddenProfilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
    marginRight: 12,
  },
  hiddenDefaultPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  hiddenAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  hiddenConversationName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#334155",
    flex: 1,
  },
  recoverButton: {
    backgroundColor: "#10B981",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  recoverButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 4,
  },
  emptyArchiveContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyArchiveText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    color: "#94A3B8",
    lineHeight: 20,
  },
});