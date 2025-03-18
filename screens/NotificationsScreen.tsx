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
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/common/Sidebar";
import { useToken } from "../hooks/auth/useToken";
import { Swipeable } from "react-native-gesture-handler";
// @ts-ignore
import { API_URL } from "@env";
import { useNotification } from "../context/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  relatedId: number;
  initiator?: {
    profilePhoto?: string;
  };
  initiatorDetails?: {
    profilePhoto?: {
      url?: string;
    };
  };
}

export default function NotificationsScreen({ navigation }) {
  const { getToken } = useToken();
  const { unreadCount } = useNotification();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const defaultPreferences = {
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
  const [preferences, setPreferences] = useState(defaultPreferences);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

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
      } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de la notification ${notificationId} :`,
        error.message
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    console.log("Notification cliquée :", notification);

    try {
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la notification comme lue :",
        error
      );
    }

    switch (notification.type) {
      case "COMMENT":
        navigation.navigate("ReportDetailsScreen", {
          reportId: notification.relatedId,
        });
        break;

      case "FOLLOW":
        navigation.navigate("UserProfileScreen", {
          userId: notification.relatedId,
        });
        break;

      case "VOTE":
        navigation.navigate("ReportDetailsScreen", {
          reportId: notification.relatedId,
        });
        break;

      case "new_message":
        navigation.navigate("ChatScreen", {
          senderId: notification.userId,
          receiverId: notification.initiatorId,
        });
        break;

      case "comment":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId,
        });
        break;

      case "post":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId,
        });
        break;

      case "NEW_POST":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId,
        });
        break;

      case "comment_reply":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId,
        });
        break;

      case "LIKE":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId,
        });
        break;

      default:
        console.warn("Type de notification inconnu :", notification.type);
    }
  };

  // Utility function for relative time formatting
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} j`;
    
    return date.toLocaleDateString();
  };

  // Interface for NotificationItem props
  interface NotificationItemProps {
    item: Notification;
    index: number;
    onPress: (notification: any) => void;
    onMarkAsRead: (notificationId: number) => void;
    onDelete: (notificationId: number) => void;
  }

  // Separate component for NotificationItem to properly use hooks
  const NotificationItem = React.memo(({ item, index, onPress, onMarkAsRead, onDelete }: NotificationItemProps) => {
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
          { opacity: itemFadeAnim, transform: [{ translateY: itemSlideAnim }] },
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
                  {getRelativeTime(item.createdAt)}
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
  });

  // Render function for FlatList
  const renderNotification = ({ item, index }: { item: Notification; index: number }) => (
    <NotificationItem 
      item={item}
      index={index}
      onPress={handleNotificationClick}
      onMarkAsRead={markNotificationAsRead}
      onDelete={deleteNotification}
    />
  );

  const getNotificationTypeIcon = (type) => {
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
  const [tempPreferences, setTempPreferences] = useState(preferences);
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

  const toggleTempPreference = useCallback((type) => {
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
     // Remplacement de l'ancien modal par une version avec un ScrollView accessible plus facilement
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
    {/* Zone vide pour fermer le modal */}
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
      {/* On supprime le TouchableWithoutFeedback englobant pour ne pas interférer avec le scroll */}
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
            Configurez les types de notifications que vous souhaitez recevoir
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
                    <Text style={styles.preferenceLabel}>{item.label}</Text>
                  </View>
                  <Switch
                    value={tempPreferences[item.type]}
                    onValueChange={() => toggleTempPreference(item.type)}
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
          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
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
        <StatusBar barStyle="light-content" backgroundColor="#062C41" />
        <View style={styles.loadingContent}>
          <Icon name="notifications" size={50} color="#4A90E2" />
          <Text style={styles.loadingText}>Chargement des notifications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#062C41" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={toggleSidebar}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
          style={styles.headerButton}
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
      </View>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

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
          <Text style={styles.markAllButtonTextMini}>
            Tout marquer lu
          </Text>
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
                Vous n'avez pas encore de notifications ou elles ont été filtrées.
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

// Obtenir dimensions de l'écran pour le responsive
const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';
const statusBarHeight = StatusBar.currentHeight || 0;
const safeTop = isIOS ? 44 : statusBarHeight;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#062C41",
    paddingTop: safeTop,
    paddingBottom: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonText: {
    marginLeft: 4,
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 14,
  },
  markAllButtonMini: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllButtonTextMini: {
    marginLeft: 4,
    color: "#4A90E2",
    fontWeight: "600",
    fontSize: 14,
  },
  iconStyle: {
    marginRight: 4,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  flatListContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  notificationItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  unreadNotification: {
    backgroundColor: "#F0F7FF",
  },
  unreadIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#4A90E2",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhotoContainer: {
    position: "relative",
    marginRight: 12,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
  },
  notificationTypeIcon: {
    position: "absolute",
    bottom: 0,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  chevronIcon: {
    marginLeft: 8,
  },
  markAsReadButton: {
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "87%",
    marginVertical: 6,
    marginLeft: 12,
    borderRadius: 12,
  },
  markAsReadText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#FF5252",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "87%",
    marginVertical: 6,
    marginRight: 12,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    marginTop: height * 0.1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  markAllButtonContainer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  markAllButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
  
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 84,
  },
  modalContainer: {
    width: width * 0.92,
    maxWidth: 450,
    maxHeight: height * 0.95,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.25,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  modalCloseButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  modalScrollView: {
    maxHeight: Math.min(550, height * 0.5),
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryDivider: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.25,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F7",
  },
  preferenceTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  preferenceLabel: {
    fontSize: 15,
    color: "#333333",
    lineHeight: 20,
  },
  preferenceSwitch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});