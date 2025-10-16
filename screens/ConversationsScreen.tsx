import React, {
  useEffect,
  useState,
  useRef,
  memo,
  useMemo,
  useCallback,
} from "react";
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
  ArchivedConversationItemProps,
} from "../types/features/conversations/item.types";

// Constantes
import { COLORS } from "../utils/colors";
import { useConversations } from "../hooks/messages/useConversations";
import styles from "../styles/screens/ConversationsScreen.styles";

// Préfixe pour les clés de stockage
const STORAGE_KEY_PREFIX = "conversations";

/**
 * Composant IconWrapper - Évite les re-rendus inutiles pour les icônes
 */
const IconWrapper = memo(
  ({
    name,
    size,
    color,
    style,
  }: {
    name: any;
    size: number;
    color: string;
    style?: any;
  }) => (
    <View style={style}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  )
);

/**
 * Composant ConversationItem - Affiche une conversation dans la liste
 */
const ConversationItem = memo(
  ({
    item,
    index,
    userId,
    onItemPress,
    onItemLongPress,
    onPressIn,
    onPressOut,
    animatedValues,
  }: ConversationItemProps) => {
    // Extraction des valeurs animées
    const { fadeAnim, slideAnim, scaleAnim } = animatedValues;

    // Computed properties
    const hasUnreadMessages =
      typeof item.unreadCount === "number" && item.unreadCount > 0;
    const truncatedMessage =
      item.lastMessage && item.lastMessage.length > 100
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
          }),
        ]).start();
      }, delay);

      return () => clearTimeout(animationTimeout);
    }, [fadeAnim, slideAnim, index]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.conversationItem,
            hasUnreadMessages && styles.unreadConversation,
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
              <View
                style={[
                  styles.defaultProfilePhoto,
                  hasUnreadMessages && styles.unreadDefaultPhoto,
                ]}
              >
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
            )}

            {hasUnreadMessages && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount && item.unreadCount > 99
                    ? "99+"
                    : String(item.unreadCount)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.conversationDetails}>
            <View style={styles.headingRow}>
              <Text
                style={[
                  styles.conversationTitle,
                  hasUnreadMessages && styles.unreadTitle,
                ]}
                numberOfLines={1}
              >
                {item.otherParticipantName || "Nom inconnu"}
              </Text>
              <Text
                style={[
                  styles.timestamp,
                  hasUnreadMessages && styles.unreadTimestamp,
                ]}
              >
                {lastMessageTime}
              </Text>
            </View>

            <Text
              style={[
                styles.lastMessage,
                hasUnreadMessages && styles.unreadText,
              ]}
              numberOfLines={2}
            >
              {truncatedMessage || "Aucun message"}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

/**
 * Composant ArchivedConversationItem - Affiche une conversation archivée
 */
const ArchivedConversationItem = memo(
  ({
    item,
    onRecover,
    onPressIn,
    onPressOut,
    scaleAnim,
  }: ArchivedConversationItemProps) => {
    const avatarInitial = item.otherParticipantName
      ? item.otherParticipantName.charAt(0).toUpperCase()
      : "?";

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
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
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);

/**
 * Écran principal des conversations
 */
const ConversationsScreen = ({ navigation, route }: any) => {
  const userId = route.params?.userId;
  const insets = useSafeAreaInsets();

  // Hook personnalisé pour les conversations
  const { conversations: allConversations, loading } = useConversations(userId, db);

  // Nouvel état local pour gérer les mises à jour en mémoire des conversations
  const [localConversations, setLocalConversations] = useState<Conversation[]>(allConversations);

  // États
  const [hiddenConversations, setHiddenConversations] = useState<string[]>([]);
  const [showHiddenConversations, setShowHiddenConversations] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Nouvel état pour le loader
  // Animations globales
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const hiddenSectionAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animation pour les items
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Hook personnalisé pour la gestion du stockage
  const { getStoredData, storeData } = useStorage(STORAGE_KEY_PREFIX);

  useEffect(() => {
    setLocalConversations(allConversations);
  }, [allConversations]);

  // Conversations visibles
  const visibleConversations = useMemo(
    () =>
      localConversations.filter(
        (conversation) => !hiddenConversations.includes(conversation.id)
      ),
    [localConversations, hiddenConversations]
  );

  const archivedConversations = useMemo(
    () =>
      localConversations.filter((conversation) =>
        hiddenConversations.includes(conversation.id)
      ),
    [localConversations, hiddenConversations]
  );

  // Icône de rotation pour les archives
  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Chargement des conversations archivées
  useEffect(() => {
    if (!userId) return;

    const loadArchivedConversations = async () => {
      try {
        const storedHiddenConversations = await getStoredData(
          `hidden_${userId}`
        );
        if (storedHiddenConversations) {
          setHiddenConversations(JSON.parse(storedHiddenConversations));
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des conversations archivées:",
          error
        );
      }
    };

    loadArchivedConversations();
  }, [userId, getStoredData]);

  // Persistance des conversations archivées
  useEffect(() => {
    if (!userId) return;

    const persistHiddenConversations = async () => {
      try {
        if (hiddenConversations.length === 0) {
          // Supprimez la clé si aucune conversation n'est archivée
          await storeData(`hidden_${userId}`, "");
        } else {
          // Sinon, mettez à jour le stockage
          await storeData(
            `hidden_${userId}`,
            JSON.stringify(hiddenConversations)
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la persistance des conversations archivées:",
          error
        );
      }
    };

    persistHiddenConversations();
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
      }),
    ]).start();
  }, [showHiddenConversations, hiddenSectionAnim, rotateAnim]);

  // Animation d'entrée de la liste principale
  useEffect(() => {
    if (!loading) {
      setTimeout(() => setIsLoaded(true), 500); // Simule un délai pour afficher les conversations
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
        }),
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

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      const receiverId = conversation.participants.find(
        (id) => id !== Number(userId)
      );

      if (receiverId) {
        // Marquer comme lu localement
        const updatedConversations = localConversations.map((conv) =>
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        );

        // Mettre à jour l'état local avec les conversations modifiées
        setLocalConversations(updatedConversations);

        // Naviguer vers l'écran de chat
        navigation.navigate("ChatScreen", {
          senderId: userId,
          receiverId: receiverId,
        });
      }
    },
    [userId, navigation, localConversations]
  );


  const handleConversationLongPress = useCallback(
    (conversation: Conversation) => {
      Alert.alert(
        "Êtes-vous sûr ?",
        `Si vous masquez cette conversation, vous ne pourrez plus recevoir de messages de ${conversation.otherParticipantName || "cet utilisateur"}, mais vous pouvez toujours la récupérer plus tard.`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Archiver",
            onPress: () => {
              setHiddenConversations((prev) => [...prev, conversation.id]);
            },
            style: "destructive",
          },
        ]
      );
    },
    []
  );

  const handleRecoverConversation = useCallback((conversationId: string) => {
    setHiddenConversations((prev) =>
      prev.filter((id) => id !== conversationId)
    );
  }, []);

  const toggleArchiveVisibility = useCallback(() => {
    setShowHiddenConversations((prev) => !prev);
  }, []);

  // Rendu de la liste de conversations
  const renderConversation = useCallback(
    ({ item, index }: { item: Conversation; index: number }) => (
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
          scaleAnim,
        }}
      />
    ),
    [
      userId,
      handleConversationPress,
      handleConversationLongPress,
      handlePressIn,
      handlePressOut,
      scaleAnim,
    ]
  );

  // Rendu de l'écran
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Loader global */}
      {!isLoaded && (
        <View style={styles.globalLoader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            Chargement des conversations...
          </Text>
        </View>
      )}

      {isLoaded && (
        <>
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
                <Animated.View
                  style={{ transform: [{ rotate: iconRotation }] }}
                >
                  <IconWrapper
                    name={
                      showHiddenConversations
                        ? "close-outline"
                        : "archive-outline"
                    }
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
                <IconWrapper
                  name="archive-outline"
                  size={14}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.archiveInfo}>
                  {archivedConversations.length} conversation
                  {archivedConversations.length !== 1 ? "s" : ""} archivée
                  {archivedConversations.length !== 1 ? "s" : ""}
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
                    outputRange: [1, 0],
                  }),
                  transform: [{ translateY: hiddenSectionAnim }],
                },
              ]}
            >
              <View style={styles.hiddenPanelHeader}>
                <View style={styles.hiddenHeaderLeft}>
                  <IconWrapper
                    name="archive-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.hiddenHeaderIcon}
                  />
                  <Text style={styles.hiddenPanelTitle}>Archives</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeCount}>
                    {archivedConversations.length}
                  </Text>
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
                  removeClippedSubviews={Platform.OS === "android"}
                  ListEmptyComponent={null}
                  style={styles.hiddenList}
                  contentContainerStyle={styles.hiddenListContent}
                />
              ) : (
                <View style={styles.emptyArchiveContainer}>
                  <View style={styles.emptyIconContainer}>
                    <IconWrapper
                      name="archive-outline"
                      size={40}
                      color={COLORS.inactive}
                    />
                  </View>
                  <Text style={styles.emptyArchiveTitle}>Aucune archive</Text>
                  <Text style={styles.emptyArchiveText}>
                    Appuyez longuement sur une conversation pour la masquer et ne plus recevoir de messages de cet utilisateur.
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Liste principale */}
          <Animated.View
            style={[
              styles.mainContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {visibleConversations.length > 0 ? (
              <FlatList
                data={visibleConversations}
                keyExtractor={(item) => item.id}
                renderItem={renderConversation}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={Platform.OS === "android"}
                contentContainerStyle={styles.conversationsList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyImageContainer}>
                  <IconWrapper
                    name="chatbubbles-outline"
                    size={70}
                    color={COLORS.inactive}
                  />
                </View>
                <Text style={styles.noConversation}>
                  Pas encore de messages
                </Text>
                <Text style={styles.emptyDescription}>
                  Vos conversations apparaîtront ici
                </Text>
              </View>
            )}
          </Animated.View>
        </>
      )}
    </View>
  );
};

export default ConversationsScreen;
