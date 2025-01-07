import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";
import { useToken } from "../hooks/useToken";
// @ts-ignore
import { API_URL } from "@env";

export default function EventsScreen({ navigation }) {
  const { unreadCount } = useNotification(); // Récupération du compteur
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState<{ id: number; title: string; description: string; createdAt: string }[]>([]);
  const {getUserId} = useToken();

  useEffect(() => {
    const fetchUserEvent = async () => {
      try {
        // Résolution de la promesse pour récupérer le userId
        const userId = await getUserId();

        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        // Requête fetch avec le userId
        const response = await fetch(`${API_URL}/events?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    fetchUserEvent();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.eventCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("EventDetailsScreen", { eventId: item.id })
        }
      >
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.eventFooter}>
          <Text style={styles.eventDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Icon name="chevron-right" size={24} color="#CBCBCB" />
        </View>
      </TouchableOpacity>
      {/* Bouton de suppression */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Icon name="delete" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const confirmDelete = (eventId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => deleteEvent(eventId) },
      ]
    );
  };

  const deleteEvent = async (eventId) => {
    try {
      const userId = await getUserId(); // Récupérer l'ID utilisateur
      if (!userId) {
        console.error("Impossible de récupérer l'ID utilisateur.");
        return;
      }
  
      const response = await fetch(`${API_URL}/events/${eventId}?userId=${userId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'événement.");
      }
  
      // Supprimer localement l'événement de la liste
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement :", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#CBCBCB" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadgeNav}>
          <Text style={styles.headerTitleNav}>MES ÉVÉNEMENTS</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={28}
              color={unreadCount > 0 ? "#CBCBCB" : "#CBCBCB"}
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

      {events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>Aucun événement trouvé.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#535353", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
    fontFamily: 'Starborn', // Utilisez le nom de la police que vous avez défini
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  title:{
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  eventsList: {
    paddingVertical: 10,
  },
  eventCard: {
    backgroundColor: "#2A2A3B",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#CBCBCB",
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: "#B0B0C3",
    marginBottom: 10,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventDate: {
    fontSize: 12,
    color: "#6F6F81",
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 18,
    color: "#666",
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
});
