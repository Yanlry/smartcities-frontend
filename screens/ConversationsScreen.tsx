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
import { db } from "../firebaseConfig";
import { useStorage } from "../hooks/messages/useStorage"; // Hook personnalisé pour AsyncStorage
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Types
import { 
  Conversation, 
  ConversationItemProps, 
  ArchivedConversationItemProps 
} from "../types/conversation.types";

// Constantes
import { COLORS } from "../utils/colors";
import { useConversations } from "../hooks/messages/useConversations";
const { width } = Dimensions.get("window");


// Préfixe pour les clés de stockage
const STORAGE_KEY_PREFIX = "conversations";



/**
 * Composant IconWrapper - Évite les re-rendus inutiles pour les icônes
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
    <Ionicons name={name} size={size} color={color} />
  </View>
));

/**
 * Composant ConversationItem - Affiche une conversation dans la liste
 */
const ConversationItem = memo(({ 
  item, 
  index, 
  userId, 
  onItemPress,
  onItemLongPress,
  onPressIn,
  onPressOut,
  animatedValues
}: ConversationItemProps) => {
  // Extraction des valeurs animées
  const { fadeAnim, slideAnim, scaleAnim } = animatedValues;
  
  // Computed properties
  const hasUnreadMessages = typeof item.unreadCount === 'number' && item.unreadCount > 0;
  const truncatedMessage = item.lastMessage && item.lastMessage.length > 100
    ? item.lastMessage.substring(0, 100) + "..."
    : item.lastMessage || "";
  
  // Formater l'horodatage du dernier message
  const formatLastMessageTime = (timestamp: string) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday =
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear();
      
    const isYesterday =
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (isYesterday) {
      return "Hier";
    } else {
      return messageDate.toLocaleDateString([], {
        day: "numeric",
        month: "short",
      });
    }
  };
  
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
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          speed: 15,
          bounciness: 3,
          useNativeDriver: true,
        })
      ]).start();
    }, delay);
    
    return () => clearTimeout(animationTimeout);
  }, [fadeAnim, slideAnim, index]);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim }
      ]
    }}>
      <TouchableOpacity
        style={[
          styles.conversationItem,
          hasUnreadMessages && styles.unreadConversation
        ]}
        onPress={() => onItemPress(item)}
        onLongPress={() => onItemLongPress(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={styles.avatarContainer}>
          {item.profilePhoto ? (
            <Image
              source={{ uri: item.profilePhoto }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={[
              styles.defaultProfilePhoto,
              hasUnreadMessages && styles.unreadDefaultPhoto
            ]}>
              <Text style={styles.avatarText}>{avatarInitial}</Text>
            </View>
          )}
          
          {hasUnreadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {item.unreadCount && item.unreadCount > 99 ? '99+' : String(item.unreadCount)}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationDetails}>
          <View style={styles.headingRow}>
            <Text 
              style={[
                styles.conversationTitle,
                hasUnreadMessages && styles.unreadTitle
              ]} 
              numberOfLines={1}
            >
              {item.otherParticipantName || "Nom inconnu"}
            </Text>
            <Text style={[
              styles.timestamp,
              hasUnreadMessages && styles.unreadTimestamp
            ]}>
              {lastMessageTime}
            </Text>
          </View>
          
          <Text 
            style={[
              styles.lastMessage,
              hasUnreadMessages && styles.unreadText
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
 * Composant ArchivedConversationItem - Affiche une conversation archivée
 */
const ArchivedConversationItem = memo(({ 
  item, 
  onRecover,
  onPressIn,
  onPressOut,
  scaleAnim
}: ArchivedConversationItemProps) => {
  const avatarInitial = item.otherParticipantName 
    ? item.otherParticipantName.charAt(0).toUpperCase() 
    : "?";

  return (
    <Animated.View style={{
      transform: [{ scale: scaleAnim }]
    }}>
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
          onPress={() => onRecover(item.id)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
        >
          <IconWrapper name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={styles.recoverButtonText}>Récupérer</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

/**
 * Écran principal des conversations
 */
const ConversationsScreen = ({ navigation, route }: any) => {
  const userId = route.params?.userId;
  const insets = useSafeAreaInsets();
  
  // Hook personnalisé pour les conversations
  const { 
    conversations: allConversations, 
    loading 
  } = useConversations(userId, db);
  
  // États 
  const [hiddenConversations, setHiddenConversations] = useState<string[]>([]);
  const [showHiddenConversations, setShowHiddenConversations] = useState(false);
  
  // Animations globales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const hiddenSectionAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animation pour les items
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Hook personnalisé pour la gestion du stockage
  const { 
    getStoredData, 
    storeData 
  } = useStorage(STORAGE_KEY_PREFIX);
  
  // Conversations visibles
  const visibleConversations = useMemo(() => 
    allConversations.filter(
      conversation => !hiddenConversations.includes(conversation.id)
    ),
    [allConversations, hiddenConversations]
  );
  
  // Conversations archivées
  const archivedConversations = useMemo(() => 
    allConversations.filter(
      conversation => hiddenConversations.includes(conversation.id)
    ),
    [allConversations, hiddenConversations]
  );
  
  // Icône de rotation pour les archives
  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  // Chargement des conversations archivées
  useEffect(() => {
    if (!userId) return;
    
    const loadArchivedConversations = async () => {
      try {
        const storedHiddenConversations = await getStoredData(`hidden_${userId}`);
        if (storedHiddenConversations) {
          setHiddenConversations(JSON.parse(storedHiddenConversations));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des conversations archivées:", error);
      }
    };
    
    loadArchivedConversations();
  }, [userId, getStoredData]);
  
  // Persistance des conversations archivées
  useEffect(() => {
    if (!userId || hiddenConversations.length === 0) return;
    
    storeData(`hidden_${userId}`, JSON.stringify(hiddenConversations));
  }, [hiddenConversations, userId, storeData]);
  
  // Animation du panneau des archives
  useEffect(() => {
    Animated.parallel([
      Animated.timing(hiddenSectionAnim, {
        toValue: showHiddenConversations ? 0 : 50,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: showHiddenConversations ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [showHiddenConversations, hiddenSectionAnim, rotateAnim]);
  
  // Animation d'entrée de la liste principale
  useEffect(() => {
    if (!loading) {
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
    }
  }, [loading, fadeAnim, slideAnim]);
  
  // Handlers
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handleConversationPress = useCallback((conversation: Conversation) => {
    const receiverId = conversation.participants.find(
      (id) => id !== Number(userId)
    );
    
    if (receiverId) {
      // Marquer comme lu localement
      const updatedConversations = allConversations.map(conv => 
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      );
      
      // Naviguer vers l'écran de chat
      navigation.navigate("ChatScreen", {
        senderId: userId,
        receiverId: receiverId,
      });
    }
  }, [userId, navigation, allConversations]);
  
  const handleConversationLongPress = useCallback((conversation: Conversation) => {
    Alert.alert(
      "Archiver cette conversation",
      `Voulez-vous archiver cette conversation avec ${conversation.otherParticipantName || "cet utilisateur"} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Archiver",
          onPress: () => {
            setHiddenConversations(prev => [...prev, conversation.id]);
          },
          style: "destructive",
        },
      ]
    );
  }, []);
  
  const handleRecoverConversation = useCallback((conversationId: string) => {
    setHiddenConversations(prev => 
      prev.filter(id => id !== conversationId)
    );
  }, []);
  
  const toggleArchiveVisibility = useCallback(() => {
    setShowHiddenConversations(prev => !prev);
  }, []);
  
  // Rendu de la liste de conversations
  const renderConversation = useCallback(({ item, index }: { item: Conversation, index: number }) => (
    <ConversationItem
      item={item}
      index={index}
      userId={userId}
      onItemPress={handleConversationPress}
      onItemLongPress={handleConversationLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      animatedValues={{
        fadeAnim: new Animated.Value(0),
        slideAnim: new Animated.Value(15),
        scaleAnim
      }}
    />
  ), [userId, handleConversationPress, handleConversationLongPress, handlePressIn, handlePressOut, scaleAnim]);
  
  // Rendu de l'écran
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleConversations}>Messages</Text>
          </View>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleArchiveVisibility}
          >
            <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
              <IconWrapper 
                name={showHiddenConversations ? "close-outline" : "archive-outline"} 
                size={24} 
                color={COLORS.primary} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        {archivedConversations.length > 0 && !showHiddenConversations && (
          <TouchableOpacity 
            style={styles.archiveInfoContainer}
            onPress={toggleArchiveVisibility}
            activeOpacity={0.7}
          >
            <IconWrapper name="archive-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.archiveInfo}>
              {archivedConversations.length} conversation{archivedConversations.length !== 1 ? 's' : ''} archivée{archivedConversations.length !== 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
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
            <View style={styles.hiddenHeaderLeft}>
              <IconWrapper name="archive-outline" size={20} color={COLORS.primary} style={styles.hiddenHeaderIcon} />
              <Text style={styles.hiddenPanelTitle}>
                Archives
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeCount}>{archivedConversations.length}</Text>
            </View>
          </View>
          
          {archivedConversations.length > 0 ? (
            <FlatList
              data={archivedConversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ArchivedConversationItem 
                  item={item}
                  onRecover={handleRecoverConversation}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  scaleAnim={scaleAnim}
                />
              )}
              initialNumToRender={8}
              maxToRenderPerBatch={5}
              windowSize={10}
              removeClippedSubviews={Platform.OS === 'android'}
              ListEmptyComponent={null}
              style={styles.hiddenList}
              contentContainerStyle={styles.hiddenListContent}
            />
          ) : (
            <View style={styles.emptyArchiveContainer}>
              <View style={styles.emptyIconContainer}>
                <IconWrapper name="archive-outline" size={40} color={COLORS.inactive} />
              </View>
              <Text style={styles.emptyArchiveTitle}>Aucune archive</Text>
              <Text style={styles.emptyArchiveText}>
                Les conversations archivées apparaîtront ici
              </Text>
            </View>
          )}
        </Animated.View>
      )}
      
      {/* Liste principale */}
      <Animated.View style={[
        styles.mainContent,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Chargement des conversations...</Text>
          </View>
        ) : visibleConversations.length > 0 ? (
          <FlatList
            data={visibleConversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={10}
            removeClippedSubviews={Platform.OS === 'android'}
            contentContainerStyle={styles.conversationsList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyImageContainer}>
              <IconWrapper name="chatbubbles-outline" size={70} color={COLORS.inactive} />
            </View>
            <Text style={styles.noConversation}>Pas encore de messages</Text>
            <Text style={styles.emptyDescription}>
              Vos conversations apparaîtront ici
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

// Styles améliorés
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header
  header: {
    marginTop: 60,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleConversations: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  archiveInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  archiveInfo: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Liste principale
  mainContent: {
    flex: 1,
  },
  conversationsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    backgroundColor: COLORS.card,
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
    backgroundColor: COLORS.unread,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.unreadIndicator,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  profilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  defaultProfilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  unreadDefaultPhoto: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  unreadBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.accent,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.background,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  conversationDetails: {
    flex: 1,
    justifyContent: "center",
  },
  headingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: "700",
    color: COLORS.primary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  unreadTimestamp: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  unreadText: {
    fontWeight: "500",
    color: COLORS.text,
  },
  // États de chargement et vide
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 20,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    paddingBottom: 100,
  },
  emptyImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.cardDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  noConversation: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "80%",
  },
  // Section archivée
  hiddenPanel: {
    backgroundColor: COLORS.cardDark,
    borderRadius: 20,
    margin: 16,
    marginTop: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  hiddenPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  hiddenHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  hiddenHeaderIcon: {
    marginRight: 8,
  },
  hiddenPanelTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  hiddenList: {
    maxHeight: 300,
  },
  hiddenListContent: {
    paddingVertical: 8,
  },
  hiddenConversationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  hiddenUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  hiddenProfilePhoto: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  hiddenDefaultPhoto: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  hiddenAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  hiddenConversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  recoverButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recoverButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyArchiveContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.cardDark,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyArchiveTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyArchiveText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 20,
  },
});

export default ConversationsScreen;