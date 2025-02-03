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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";
import { useToken } from "../hooks/useToken";
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

  const renderNotification = ({ item }) => {
    const renderLeftActions = () => (
      <TouchableOpacity
        style={styles.markAsReadButton}
        onPress={() => markNotificationAsRead(item.id)}
      >
        <Icon name="done" size={24} color="black" />
        <Text style={styles.markAsReadText}>Marquer comme lu</Text>
      </TouchableOpacity>
    );

    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Icon name="delete" size={24} color="#FFF" />
        <Text style={styles.deleteButtonText}>Supprimer</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => {
          if (direction === "left") {
            markNotificationAsRead(item.id);
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
                  onPress: () => deleteNotification(item.id),
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
          onPress={() => handleNotificationClick(item)}
        >
          <View style={styles.notificationContent}>
            {/* Afficher la photo de profil */}
            <Image
              source={{
                uri:
                  item.initiator?.profilePhoto ||
                  item.initiatorDetails?.profilePhoto?.url ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profilePhoto}
            />
            {/* Texte de la notification */}
            <View style={styles.notificationTextContainer}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.notificationDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const NotificationPreferencesModal = () => {
    const [tempPreferences, setTempPreferences] = useState(preferences);

    useEffect(() => {
      if (isModalVisible) {
        console.log("Ouverture du modal : synchronisation des préférences");
        setTempPreferences(preferences);
      }
    }, [isModalVisible, preferences]);

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

        setModalVisible(false);
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
          { type: "LIKE", label: "Mentions J’aime sur mes publications" },
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
          animationType="slide"
          onRequestClose={() => {
            console.log("Fermeture forcée via onRequestClose");
            setModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Préférences de notification</Text>

              {/* Affichage des catégories et switches */}
              {groupedNotificationTypes.map((group) => (
                <View key={group.category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{group.category}</Text>
                  {group.items.map((item) => (
                    <View key={item.type} style={styles.preferenceItem}>
                      <Text style={styles.preferenceLabel}>{item.label}</Text>
                      <Switch
                        value={tempPreferences[item.type]}
                        onValueChange={() => toggleTempPreference(item.type)}
                        trackColor={{ false: "#d3d3d3", true: "#235562" }}
                        ios_backgroundColor="#3e3e3e"
                      />
                    </View>
                  ))}
                </View>
              ))}

              {/* Boutons d'action */}
              <View>
                <View>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={savePreferences}
                  >
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      console.log("Annulation et fermeture du modal");
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
        <Text>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={24}
            color="#FFFFFC"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>NOTIFICATIONS</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={24}
              color={unreadCount > 0 ? "#FFFFFC" : "#FFFFFC"}
              style={{ marginRight: 10 }}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => {
          Vibration.vibrate();
          console.log("Ouverture du modal");
          setModalVisible(true);
        }}
      >
        <Ionicons
          name="options"
          size={20}
          color="#555"
          style={styles.iconStyle}
        />
        <Text style={styles.filterButtonText}>Filtre</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4caf50"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>
              Aucune notification disponible.
            </Text>
          </View>
        }
        contentContainerStyle={styles.flatListContent}
      />
      <NotificationPreferencesModal />

      {/* Bouton de notifications avec compteur */}
      <View style={styles.markAllButtonContainer}>
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllButtonText}>
            Tout marquer comme lu ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
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
    color: "#FFFFFC",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -7,
    right: 2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  markAsReadButton: {
    width: 150,
    backgroundColor: "#FFE033",
    justifyContent: "center",
    height: "80%",
    marginTop: 10,
    alignItems: "flex-start",
    paddingHorizontal: 20,
    borderRadius: 20,
  },

  markAsReadText: {
    color: "black",
    textTransform: "uppercase",
    fontSize: 14,
  },

  deleteButton: {
    width: 150,
    marginTop: 10,
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E71B1B",
    flexDirection: "row",
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  markAllButtonContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  flatListContent: {
    padding: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  markAllButton: {
    backgroundColor: "#FFE033",
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },

  markAllButtonText: {
    color: "#235562",
    fontSize: 12,
    textTransform: "uppercase",
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationItem: {
    paddingHorizontal: 10,
    paddingRight: 20,
    padding: 15,
    backgroundColor: "#FFF",
    marginVertical: 3,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: "#E71B1B",
  },
  notificationMessage: {
    fontSize: 16,
    color: "#333",
  },
  notificationDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconStyle: { marginRight: 8 },
  filterButtonText: { color: "#555", fontWeight: "bold" },
  notificationText: { fontSize: 14 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#235562",
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4caf50",
    marginBottom: 10,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#235562",
    padding: 10,
    borderRadius: 30,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
