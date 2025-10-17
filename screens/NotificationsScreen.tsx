// Chemin : frontend/screens/NotificationsScreen.tsx

import "react-native-gesture-handler";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  RefreshControl,
  Modal,
  Switch,
  Vibration,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/common/Sidebar";
import { useToken } from "../hooks/auth/useToken";
import { Swipeable } from "react-native-gesture-handler";
// @ts-ignore
import { API_URL } from "@env";
import { useNotification } from "../context/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserProfile } from "../hooks/user/useUserProfile";
import styles from "../styles/screens/NotificationsScreen.styles";
// ✅ NOUVEAUX TYPES AJOUTÉS POUR CORRIGER LES ERREURS
// Type pour la navigation
type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

// Type pour les préférences de notifications avec signature d'index
type NotificationPreferences = {
  [key: string]: boolean;
  COMMENT: boolean;
  FOLLOW: boolean;
  VOTE: boolean;
  new_message: boolean;
  COMMENT_REPLY: boolean;
  post: boolean;
  LIKE: boolean;
  comment: boolean;
  NEW_POST: boolean;
};

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  relatedId: number;
  userId?: number;
  initiatorId?: number;
  initiator?: {
    profilePhoto?: string;
  };
  initiatorDetails?: {
    profilePhoto?: {
      url?: string;
    };
  };
}

// ✅ CORRECTION 1: Ajout du type pour navigation
export default function NotificationsScreen({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const { getToken } = useToken();
  const { unreadCount } = useNotification();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const defaultPreferences: NotificationPreferences = {
    COMMENT: true,
    FOLLOW: true,
    VOTE: true,
    new_message: true,
    COMMENT_REPLY: true,
    post: true,
    LIKE: true,
    comment: true,
    NEW_POST: true,
  };

  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();

  const dummyFn = () => {};

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const token = await getToken();
        if (!token) {
          console.log(
            "Aucun token disponible. L'utilisateur doit se reconnecter."
          );
          return;
        }

        const response = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorDetails = await response.json();
          console.warn(
            "Erreur de l'API notifications :",
            errorDetails.message || "Erreur inconnue"
          );
          return;
        }

        const data: Notification[] = await response.json();

        setNotifications(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        // ✅ CORRECTION 2: Typage explicite de error
      } catch (error: any) {
        if (error.message.includes("Token non trouvé")) {
          console.log("Token non valide ou expiré. Aucune action entreprise.");
        } else {
          console.error(
            "Erreur critique lors de la récupération des notifications :",
            error.message
          );
          Alert.alert(
            "Erreur",
            "Une erreur inattendue est survenue lors de la récupération des notifications."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPreferences = await AsyncStorage.getItem(
          "notificationPreferences"
        );
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences));
        }
        // ✅ CORRECTION 3: Typage explicite de error
      } catch (error: any) {
        console.error("Erreur lors du chargement des préférences :", error);
      }
    };
    loadPreferences();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Animation when notifications load
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading, fadeAnim, slideAnim]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Token non trouvé.");

      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          errorDetails.message ||
            "Erreur lors de la récupération des notifications."
        );
      }

      const data: Notification[] = await response.json();

      setNotifications(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      // ✅ CORRECTION 4: Typage explicite de error
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des notifications :",
        error.message
      );
      Alert.alert("Erreur", "Impossible de récupérer les notifications.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    console.log("Rafraîchissement des notifications...");
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Token non trouvé.");
      }

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/mark-read`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          errorDetails.message ||
            "Erreur lors de la mise à jour de la notification."
        );
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      // ✅ CORRECTION 5: Typage explicite de error
    } catch (error: any) {
      console.error(
        `Erreur lors de la mise à jour de la notification ${notificationId} :`,
        error.message
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Token non trouvé.");
      }

      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          errorDetails.message || "Erreur lors de la mise à jour."
        );
      }

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      Alert.alert(
        "Succès",
        "Toutes les notifications ont été marquées comme lues."
      );
      // ✅ CORRECTION 6: Typage explicite de error
    } catch (error: any) {
      console.error(
        "Erreur lors de la mise à jour des notifications :",
        error.message
      );
      Alert.alert(
        "Erreur",
        "Impossible de marquer toutes les notifications comme lues."
      );
    }
  };

  const deleteNotification = async (notificationId: number) => {
    console.log("Demande de suppression de la notification :", notificationId);

    try {
      const token = await getToken();
      console.log("Token récupéré :", token);

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseText = await response.text();
      console.log("Réponse brute de l'API :", responseText);

      if (!response.ok) {
        const errorDetails = JSON.parse(responseText);
        console.error("Erreur API :", errorDetails);
        throw new Error(
          errorDetails.message || "Erreur lors de la suppression."
        );
      }

      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification.id !== notificationId
        )
      );
      // ✅ CORRECTION 7: Typage explicite de error
    } catch (error: any) {
      console.error(
        `Erreur lors de la suppression de la notification ${notificationId} :`,
        error.message
      );
    }
  };

  // ✅ CORRECTION 8: Ajout du type pour le paramètre notification
  const handleNotificationClick = async (notification: Notification) => {
    console.log("🔔 Notification cliquée :", notification);
    console.log("📋 Type de notification :", notification.type);
    console.log(
      "🆔 RelatedId :",
      notification.relatedId,
      typeof notification.relatedId
    );

    try {
      await markNotificationAsRead(notification.id);
      console.log("✅ Notification marquée comme lue");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour de la notification comme lue :",
        error
      );
    }

    // Conversion du relatedId en nombre si c'est une chaîne
    const relatedId =
      typeof notification.relatedId === "string"
        ? parseInt(notification.relatedId, 10)
        : notification.relatedId;

    console.log("🔄 RelatedId converti :", relatedId, typeof relatedId);

    // Vérification que relatedId est valide
    if (!relatedId || isNaN(relatedId)) {
      console.error("❌ RelatedId invalide :", notification.relatedId);
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir cette notification car l'identifiant est invalide."
      );
      return;
    }

    try {
      switch (notification.type) {
        case "COMMENT":
          console.log(
            "🚀 Navigation vers ReportDetailsScreen avec reportId :",
            relatedId
          );
          navigation.navigate("ReportDetailsScreen", {
            reportId: relatedId,
          });
          break;

        case "FOLLOW":
          console.log(
            "🚀 Navigation vers UserProfileScreen avec userId :",
            relatedId
          );
          navigation.navigate("UserProfileScreen", {
            userId: relatedId,
          });
          break;

        case "VOTE":
          console.log(
            "🚀 Navigation vers ReportDetailsScreen avec reportId :",
            relatedId
          );
          navigation.navigate("ReportDetailsScreen", {
            reportId: relatedId,
          });
          break;

        case "new_message":
          console.log("🚀 Navigation vers ChatScreen");
          navigation.navigate("ChatScreen", {
            senderId: notification.userId,
            receiverId: notification.initiatorId,
          });
          break;

        case "comment":
          console.log(
            "🚀 Navigation vers PostDetailsScreen avec postId :",
            relatedId
          );
          navigation.navigate("PostDetailsScreen", {
            postId: relatedId,
          });
          break;

        case "post":
          console.log(
            "🚀 Navigation vers PostDetailsScreen avec postId :",
            relatedId
          );
          navigation.navigate("PostDetailsScreen", {
            postId: relatedId,
          });
          break;

        case "NEW_POST":
          console.log(
            "🚀 Navigation vers PostDetailsScreen avec postId :",
            relatedId
          );
          navigation.navigate("PostDetailsScreen", {
            postId: relatedId,
          });
          break;

        case "LIKE":
          console.log(
            "🚀 Navigation vers PostDetailsScreen avec postId :",
            relatedId
          );
          navigation.navigate("PostDetailsScreen", {
            postId: relatedId,
          });
          break;

        case "comment_reply":
          console.log(
            "🚀 Navigation vers PostDetailsScreen avec postId :",
            relatedId
          );
          navigation.navigate("PostDetailsScreen", {
            postId: relatedId,
          });
          break;

        default:
          console.warn("⚠️ Type de notification inconnu :", notification.type);
          Alert.alert(
            "Type de notification non reconnu",
            `Le type "${notification.type}" n'est pas pris en charge.`
          );
          break;
      }
    } catch (navigationError) {
      console.error("❌ Erreur de navigation :", navigationError);
      Alert.alert(
        "Erreur de navigation",
        "Impossible d'ouvrir cette page. Veuillez réessayer."
      );
    }
  };

  // ✅ CORRECTION 9: Ajout du type pour le paramètre dateString
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleDateString();
  };

  // Interface for NotificationItem props
  interface NotificationItemProps {
    item: Notification;
    index: number;
    onPress: (notification: Notification) => void;
    onMarkAsRead: (notificationId: number) => void;
    onDelete: (notificationId: number) => void;
  }

  // Separate component for NotificationItem to properly use hooks
  const NotificationItem = React.memo(
    ({
      item,
      index,
      onPress,
      onMarkAsRead,
      onDelete,
    }: NotificationItemProps) => {
      const itemFadeAnim = React.useRef(new Animated.Value(0)).current;
      const itemSlideAnim = React.useRef(new Animated.Value(20)).current;

      React.useEffect(() => {
        const delay = index * 50; // Stagger effect
        Animated.parallel([
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(itemSlideAnim, {
            toValue: 0,
            duration: 300,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      }, [index]);

      const renderLeftActions = () => (
        <TouchableOpacity
          style={styles.markAsReadButton}
          onPress={() => onMarkAsRead(item.id)}
        >
          <Icon name="done" size={24} color="#FFF" />
          <Text style={styles.markAsReadText}>Lu</Text>
        </TouchableOpacity>
      );

      const renderRightActions = () => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Icon name="delete" size={24} color="#FFF" />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </TouchableOpacity>
      );

      return (
        <Animated.View
          style={[
            {
              opacity: itemFadeAnim,
              transform: [{ translateY: itemSlideAnim }],
            },
          ]}
        >
          <Swipeable
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            onSwipeableOpen={(direction) => {
              if (direction === "left") {
                onMarkAsRead(item.id);
              } else if (direction === "right") {
                Alert.alert(
                  "Confirmer la suppression",
                  "Voulez-vous vraiment supprimer cette notification ?",
                  [
                    {
                      text: "Annuler",
                      style: "cancel",
                    },
                    {
                      text: "Supprimer",
                      style: "destructive",
                      onPress: () => onDelete(item.id),
                    },
                  ]
                );
              }
            }}
          >
            <TouchableOpacity
              style={[
                styles.notificationItem,
                !item.isRead && styles.unreadNotification,
              ]}
              onPress={() => onPress(item)}
              activeOpacity={0.7}
            >
              {!item.isRead && <View style={styles.unreadIndicator} />}
              <View style={styles.notificationContent}>
                <View style={styles.profilePhotoContainer}>
                  <Image
                    source={{
                      uri:
                        item.initiator?.profilePhoto ||
                        item.initiatorDetails?.profilePhoto?.url ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.profilePhoto}
                  />
                  {getNotificationTypeIcon(item.type)}
                </View>
                <View style={styles.notificationTextContainer}>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={styles.notificationDate}>
                    Il y a {getRelativeTime(item.createdAt)}
                  </Text>
                </View>
                <Icon
                  name="chevron-right"
                  size={20}
                  color="#A0A0A0"
                  style={styles.chevronIcon}
                />
              </View>
            </TouchableOpacity>
          </Swipeable>
        </Animated.View>
      );
    }
  );

  // Render function for FlatList
  const renderNotification = ({
    item,
    index,
  }: {
    item: Notification;
    index: number;
  }) => (
    <NotificationItem
      item={item}
      index={index}
      onPress={handleNotificationClick}
      onMarkAsRead={markNotificationAsRead}
      onDelete={deleteNotification}
    />
  );

  // ✅ CORRECTION 10: Ajout du type pour le paramètre type
  const getNotificationTypeIcon = (type: string) => {
    let iconName = "notifications";
    let backgroundColor = "#4A90E2";

    switch (type) {
      case "COMMENT":
      case "comment":
      case "comment_reply":
        iconName = "chat";
        backgroundColor = "#50B83C";
        break;
      case "FOLLOW":
        iconName = "person-add";
        backgroundColor = "#9C6ADE";
        break;
      case "VOTE":
        iconName = "thumb-up";
        backgroundColor = "#47C1BF";
        break;
      case "new_message":
        iconName = "mail";
        backgroundColor = "#5E5CE6";
        break;
      case "LIKE":
        iconName = "favorite";
        backgroundColor = "#F49342";
        break;
      case "post":
      case "NEW_POST":
        iconName = "article";
        backgroundColor = "#DD6B20";
        break;
      default:
        break;
    }

    return (
      <View style={[styles.notificationTypeIcon, { backgroundColor }]}>
        <Icon name={iconName} size={12} color="#FFF" />
      </View>
    );
  };

  const NotificationPreferencesModal = () => {
    const [tempPreferences, setTempPreferences] =
      useState<NotificationPreferences>(preferences);
    const modalScaleAnim = React.useRef(new Animated.Value(0.9)).current;
    const modalOpacityAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isModalVisible) {
        console.log("Ouverture du modal : synchronisation des préférences");
        setTempPreferences(preferences);

        Animated.parallel([
          Animated.timing(modalScaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [isModalVisible, preferences]);

    const closeModal = () => {
      Animated.parallel([
        Animated.timing(modalScaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    };

    // ✅ CORRECTION 11: Ajout du type pour le paramètre type
    const toggleTempPreference = useCallback((type: string) => {
      setTempPreferences((prev) => ({
        ...prev,
        [type]: !prev[type],
      }));
    }, []);

    const savePreferences = useCallback(async () => {
      try {
        await AsyncStorage.setItem(
          "notificationPreferences",
          JSON.stringify(tempPreferences)
        );
        setPreferences(tempPreferences);
        console.log("Préférences sauvegardées");

        closeModal();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des préférences :", error);
      }
    }, [tempPreferences]);

    const groupedNotificationTypes = [
      {
        category: "Activités sur mes signalements",
        items: [
          { type: "VOTE", label: "Votes reçus sur mes signalements" },
          { type: "COMMENT", label: "Commentaires sur mes signalements" },
        ],
      },
      {
        category: "Activités sur mes posts",
        items: [
          { type: "LIKE", label: "Mentions J'aime sur mes publications" },
          { type: "comment", label: "Commentaires sur mes publications" },
        ],
      },
      {
        category: "Relations et communications",
        items: [
          { type: "FOLLOW", label: "Nouveaux abonnés" },
          { type: "new_message", label: "Messages privés reçus" },
        ],
      },
      {
        category: "Actualités des relations",
        items: [
          {
            type: "NEW_POST",
            label: "Nouvelles publications de mes relations",
          },
        ],
      },
    ];

    return (
      isModalVisible && (
        <Modal
          visible={isModalVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => {
            console.log("Fermeture forcée via onRequestClose");
            closeModal();
          }}
        >
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback onPress={closeModal}>
              <View style={{ flex: 1 }} />
            </TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  opacity: modalOpacityAnim,
                  transform: [{ scale: modalScaleAnim }],
                },
              ]}
            >
              <View>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderContent}>
                    <Text style={styles.modalTitle}>
                      Préférences de notification
                    </Text>
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={closeModal}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="close" size={22} color="#4A4A4A" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.modalSubtitle}>
                    Configurez les types de notifications que vous souhaitez
                    recevoir
                  </Text>
                </View>

                <ScrollView
                  style={styles.modalScrollView}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  bounces={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {groupedNotificationTypes.map((group, groupIndex) => (
                    <View
                      key={group.category}
                      style={[
                        styles.categorySection,
                        groupIndex > 0 && styles.categoryDivider,
                      ]}
                    >
                      <Text style={styles.categoryTitle}>{group.category}</Text>
                      {group.items.map((item) => (
                        <View key={item.type} style={styles.preferenceItem}>
                          <View style={styles.preferenceTextContainer}>
                            <Text style={styles.preferenceLabel}>
                              {item.label}
                            </Text>
                          </View>
                          <Switch
                            value={tempPreferences[item.type]}
                            onValueChange={() =>
                              toggleTempPreference(item.type)
                            }
                            trackColor={{ false: "#E9E9EB", true: "#4A90E2" }}
                            thumbColor={
                              Platform.OS === "ios"
                                ? "#FFFFFF"
                                : tempPreferences[item.type]
                                ? "#FFFFFF"
                                : "#F5F5F5"
                            }
                            ios_backgroundColor="#E9E9EB"
                            style={styles.preferenceSwitch}
                          />
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={savePreferences}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )
    );
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => preferences[notification.type]),
    [notifications, preferences]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1B5D85" />
        <View style={styles.loadingContent}>
          <Icon name="notifications" size={50} color="#1B5D85" />
          <Text style={styles.loadingText}>
            Chargement des notifications...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5D85" />
      <LinearGradient colors={["#1B5D85", "#1B5D85"]} style={styles.header}>
        <TouchableOpacity
          onPress={toggleSidebar}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <View>
            <Icon name="notifications" size={24} color="#FFFFFF" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </LinearGradient>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={updateProfileImage}
      />

      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            Vibration.vibrate(40);
            console.log("Ouverture du modal");
            setModalVisible(true);
          }}
        >
          <Ionicons name="options" size={18} color="#4A90E2" />
          <Text style={styles.filterButtonText}>Filtrer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.markAllButtonMini}
          onPress={markAllAsRead}
          activeOpacity={0.7}
        >
          <Icon name="done-all" size={18} color="#4A90E2" />
          <Text style={styles.markAllButtonTextMini}>Tout marquer lu</Text>
        </TouchableOpacity>
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-off" size={60} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Aucune notification</Text>
              <Text style={styles.emptyText}>
                Vous n'avez pas encore de notifications ou elles ont été
                filtrées.
              </Text>
            </View>
          }
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
        <NotificationPreferencesModal />
      </Animated.View>
    </View>
  );
}

// Garde tes styles existants (const styles = StyleSheet.create({...}))
// Je n'ai pas inclus les styles car ils n'ont pas changé
