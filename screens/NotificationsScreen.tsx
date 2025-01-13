import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";
import { useToken } from "../hooks/useToken"; // Hook pour gérer les tokens
import { Swipeable } from "react-native-gesture-handler";
// @ts-ignore
import { API_URL } from "@env";
import { useNotification } from "../context/NotificationContext";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  relatedId: number;
}

export default function NotificationsScreen({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useToken(); // Récupération du token avec le hook
  const { unreadCount } = useNotification(); // Récupération du compteur
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
    
        // Récupérer le token
        const token = await getToken();
        if (!token) {
          console.log("Aucun token disponible. L'utilisateur doit se reconnecter.");
          return; // Arrête l'exécution si le token est manquant
        }
    
        // Appeler l'API pour récupérer les notifications
        const response = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        // Vérifier la réponse
        if (!response.ok) {
          const errorDetails = await response.json();
          console.warn(
            "Erreur de l'API notifications :",
            errorDetails.message || "Erreur inconnue"
          );
          return; // Ignore les erreurs non critiques
        }
    
        // Traiter les données reçues
        const data: Notification[] = await response.json();
        console.log("Notifications reçues :", data);
    
        // Trier les notifications par date
        setNotifications(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (error: any) {
        // Gestion des erreurs
        if (error.message.includes("Token non trouvé")) {
          console.log("Token non valide ou expiré. Aucune action entreprise.");
        } else {
          console.error("Erreur critique lors de la récupération des notifications :", error.message);
          Alert.alert(
            "Erreur",
            "Une erreur inattendue est survenue lors de la récupération des notifications."
          );
        }
      } finally {
        setLoading(false); // Arrêter le spinner de chargement
      }
    };

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
      console.log("Notifications reçues :", data);

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

  // Fonction appelée pour rafraîchir les données
  const onRefresh = async () => {
    console.log("Rafraîchissement des notifications...");
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
      const token = await getToken(); // Récupérer le token depuis le hook
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

      // Mettre à jour l'état des notifications localement
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

      const responseText = await response.text(); // Pour déboguer la réponse brute
      console.log("Réponse brute de l'API :", responseText);

      if (!response.ok) {
        const errorDetails = JSON.parse(responseText);
        console.error("Erreur API :", errorDetails);
        throw new Error(
          errorDetails.message || "Erreur lors de la suppression."
        );
      }

      // Mise à jour locale après suppression réussie
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

    // Marquer la notification comme lue
    try {
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la notification comme lue :",
        error
      );
    }

    // Redirection basée sur le type de notification
    switch (notification.type) {
      case "COMMENT":
        navigation.navigate("ReportDetailsScreen", {
          reportId: notification.relatedId, // Passez l'ID du signalement
        });
        break;

      case "FOLLOW":
        navigation.navigate("UserProfileScreen", {
          userId: notification.relatedId, // Passez l'ID de l'utilisateur qui suit
        });
        break;

      case "VOTE":
        navigation.navigate("ReportDetailsScreen", {
          reportId: notification.relatedId, // Passez l'ID du signalement
        });
        break;

      case "new_message":
        navigation.navigate("ChatScreen", {
          senderId: notification.userId, // Passez l'ID de l'expéditeur
          receiverId: notification.initiatorId, // Passez l'ID du destinataire
        });
        break;

      case "comment":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId, // Passez l'ID du signalement
        });
        break;

      case "post":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId, // Passez l'ID du signalement
        });
        break;

        case "comment_reply":
        navigation.navigate("PostDetailsScreen", {
          postId: notification.relatedId, // Passez l'ID du signalement
        });
        break;

        case "LIKE":
          navigation.navigate("PostDetailsScreen", {
            postId: notification.relatedId, // Passez l'ID du signalement
          });
          break;

      default:
        console.warn("Type de notification inconnu :", notification.type);
    }
  };

  const renderNotification = ({ item }) => {
    // Action à gauche : Marquer comme lu
    const renderLeftActions = () => (
      <TouchableOpacity
        style={styles.markAsReadButton}
        onPress={() => markNotificationAsRead(item.id)}
      >
        <Icon name="done" size={24} color="black" />
        <Text style={styles.markAsReadText}>Marquer comme lu</Text>
      </TouchableOpacity>
    );

    // Action à droite : Supprimer
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
            markNotificationAsRead(item.id); // Marque comme lu
          } else if (direction === "right") {
            // Demander confirmation avant suppression
            Alert.alert(
              "Confirmer la suppression",
              "Voulez-vous vraiment supprimer cette notification ?",
              [
                {
                  text: "Annuler",
                  style: "cancel", // Ferme l'alerte sans supprimer
                },
                {
                  text: "Supprimer",
                  style: "destructive",
                  onPress: () => deleteNotification(item.id), // Supprime la notification
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
            color="#F7F2DE" // Couleur dorée
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
              color={unreadCount > 0 ? "#F7F2DE" : "#F7F2DE"}
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

      <FlatList
        data={notifications}
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
    backgroundColor: "#2A2B2A", // Couleur sombre
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#2A2B2A', // Couleur dorée ou autre
    backgroundColor: '#F7F2DE',
    letterSpacing:2,
    fontWeight: 'bold',
    fontFamily: 'Insanibc', // Utilisez le nom de la police que vous avez défini
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
    backgroundColor: "#FFE033", // Vert pour "Marquer comme lu"
    justifyContent: "center",
    height: "80%",
    marginTop: 10,
    alignItems: "flex-start",
    paddingHorizontal: 20,
    borderRadius: 50,
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
    backgroundColor: "#E71B1B", // Rouge pour supprimer
    flexDirection: "row", // Icône et texte côte à côte
    paddingHorizontal: 10,
    borderRadius: 50,
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
    padding: 20,
    flexGrow: 1, // Pour centrer le contenu si la liste est vide
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  markAllButton: {
    backgroundColor: "#FFE033", // Vert agréable
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25, // Bords arrondis pour un look moderne
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5, // Pour un effet de surbrillance sur Android
  },

  markAllButtonText: {
    color: "#2A2B2A", // Texte blanc
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
    marginVertical: 5,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 5,
    borderLeftColor: "#E71B1B", // Doré pour les notifications non lues
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
});
