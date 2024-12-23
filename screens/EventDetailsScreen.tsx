import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator, 
  Alert
} from "react-native";
import axios from "axios";
import { Share } from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";
import { RootStackParamList } from "../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";
import { useNotification } from "../context/NotificationContext";

export default function EventDetails({ route }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { eventId } = route.params;
  const [isRegistered, setIsRegistered] = useState(false);
  const { getUserId } = useToken(); // Importe la fonction pour récupérer l'ID utilisateur
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { unreadCount } = useNotification(); // Récupération du compteur
  const [isLoading, setIsLoading] = useState(true); 

  interface Event {
    photos: { url: string }[];
    title: string;
    description: string;
    location: string;
    date: string;
    attendees: { user: Participant }[]; // Liste des participants
    organizer: Participant; // Organisateur de l'événement
    useFullName: boolean;
  }

  interface Participant {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    photos: { url: string }[];
    useFullName: boolean;
  }

  const [event, setEvent] = useState<Event | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Stocke l'ID utilisateur

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getUserId(); // Récupère le userId depuis AsyncStorage
        console.log(`ID utilisateur récupéré depuis AsyncStorage : ${userId}`);
        setCurrentUserId(userId); // Met à jour l'état local
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
        alert("Impossible de récupérer l'utilisateur. Veuillez réessayer.");
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const url = `${API_URL}/events/${eventId}`;
        const response = await axios.get(url);
        setEvent(response.data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des détails de l'événement :",
          error
        );
        alert("Impossible de récupérer les détails de l'événement.");
      }
    };

    const checkRegistration = async () => {
      if (!currentUserId) return; // Attend que currentUserId soit défini

      try {
        const url = `${API_URL}/events/${eventId}/is-registered?userId=${currentUserId}`;
        const response = await axios.get(url);
        setIsRegistered(response.data.isRegistered);
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'inscription :",
          error
        );
      }
    };

    fetchEventDetails();

    if (currentUserId) {
      checkRegistration();
    }
  }, [eventId, currentUserId]);

  if (!event || currentUserId === null) {
    return (
      <View style={styles.loading}>
        <Text>Chargement des informations...</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Découvrez cet événement : ${event.title}\n\nDescription : ${
          event.description
        }\n\nLieu : ${event.location}\n\nDate : ${
          event.date
            ? `${new Date(event.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : "Date non disponible"
        }\n\nLien : https://smartcities.com/events/${eventId}`, // Vous pouvez remplacer par une URL réelle
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Partagé via :", result.activityType);
        } else {
          console.log("Partage réussi !");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Partage annulé");
      }
    } catch (error) {
      console.error("Erreur lors du partage :", error.message);
      alert("Une erreur est survenue lors du partage.");
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const registerForEvent = async () => {
    if (!currentUserId) {
      alert("Erreur : utilisateur non identifié.");
      return;
    }

    try {
      console.log(
        `Tentative d'inscription avec eventId: ${eventId}, userId: ${currentUserId}`
      );

      // Inscription à l'événement
      await axios.post(`${API_URL}/events/${eventId}/join`, {
        userId: currentUserId,
      });

     // Afficher une alerte personnalisée
    Alert.alert(
      "Inscription réussie", // Titre de l'alerte
      "Votre inscription est confirmée, profitez bien de l’événement !", // Message de l'alerte
      [
        {
          text: "OK", // Bouton de confirmation
          onPress: () => console.log("OK Pressed"), // Optionnel : action au clic
        },
      ],
      { cancelable: false } // L'utilisateur ne peut pas fermer l'alerte en cliquant en dehors (facultatif)
    );

      setIsRegistered(true); // Met à jour l'état pour refléter l'inscription

      // Met à jour les détails de l'événement pour inclure les participants
      const updatedEventResponse = await axios.get(
        `${API_URL}/events/${eventId}`
      );
      setEvent(updatedEventResponse.data); // Remplace l'événement dans l'état
    } catch (error) {
      if (error.response?.status === 404) {
        alert("Événement ou utilisateur introuvable.");
      } else if (error.response?.status === 400) {
        alert(
          "Erreur lors de l'inscription : Vous êtes peut-être déjà inscrit."
        );
      } else {
        alert("Une erreur est survenue. Veuillez réessayer.");
      }
      console.error("Erreur lors de l'inscription :", error);
    }
  };

  const unregisterFromEvent = async () => {
    if (!currentUserId) {
      alert("Erreur : utilisateur non identifié.");
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/events/${eventId}/leave`,
        {
          data: { userId: currentUserId },
        }
      );

       // Afficher une alerte personnalisée
    Alert.alert(
      "Désinscription enregistrée", // Titre de l'alerte
      "N’hésitez pas à vous réinscrire si vous changez d’avis !", // Message de l'alerte
      [
        {
          text: "OK", // Bouton de confirmation
          onPress: () => console.log("OK Pressed"), // Optionnel : action au clic
        },
      ],
      { cancelable: false } // L'utilisateur ne peut pas fermer l'alerte en cliquant en dehors (facultatif)
    );
      setIsRegistered(false);

      // Supprimer l'utilisateur de la liste des participants
      setEvent((prevEvent) => {
        if (!prevEvent) return prevEvent;
        return {
          ...prevEvent,
          attendees: prevEvent.attendees.filter(
            (attendee) => attendee.user.id !== currentUserId
          ),
          photos: prevEvent.photos || [], // Ensure photos is always defined
        };
      });
    } catch (error) {
      console.error("Erreur lors de la désinscription :", error);
      alert("Une erreur est survenue lors de la désinscription.");
    }
  };

  const navigateToUserProfile = (userId: string) => {
    navigation.navigate("UserProfileScreen", { userId });
  };

  const getDisplayName = (user) => {
    if (user.useFullName) {
      return `${user.firstName} ${user.lastName}`; // Affiche le nom complet
    }
    return `${user.username}`; // Sinon, affiche le username
  };

  return (
    <View>
      <View style={styles.headerNav}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#BEE5BF" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitleNav}>MON PROFIL</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={28}
              color={unreadCount > 0 ? "#BEE5BF" : "#BEE5BF"}
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
      <ScrollView contentContainerStyle={styles.container}>
        {/* Image en-tête */}
        <View style={styles.imageContainer}>
      {isLoading && (
        <ActivityIndicator
          size="large"
          color="#29524A"
          style={styles.loader}
        />
      )}
      <Image
        source={{
          uri: event.photos?.[0]?.url || "https://via.placeholder.com/600",
        }}
        style={styles.image}
        onLoad={() => setIsLoading(false)} // Une fois l'image chargée
      />
    </View>

        {/* Titre et Actions */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {event.title || "Titre indisponible"}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.buttonText}>Partager</Text>
            </TouchableOpacity>

            {isRegistered ? (
              <TouchableOpacity
                style={styles.buttonLeave}
                onPress={unregisterFromEvent}
              >
                <Text style={styles.buttonText}>Se désinscrire</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={registerForEvent}
              >
                <Text style={styles.buttonText}>S'inscrire</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Informations Clés */}
        <View style={styles.infoContainer}>
          <Text style={styles.info}>
            📍 {event.location || "Localisation non précisée"}
          </Text>
          <Text style={styles.info}>
            📅{" "}
            {event.date
              ? capitalizeFirstLetter(
                  new Date(event.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                )
              : "Date non disponible"}
          </Text>
          <Text style={styles.info}>
            👤 Organisé par :{" "}
            {event.organizer
              ? event.organizer.useFullName
                ? `${event.organizer.firstName} ${event.organizer.lastName}`
                : event.organizer.username
              : "Organisateur non disponible"}
          </Text>
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {event.description || "Description indisponible"}
        </Text>

        {/* Liste des participants */}
        <Text style={styles.sectionMember}>Liste des participants</Text>
        {event.attendees.length > 0 ? (
          event.attendees.map((attendee, index) => (
            <TouchableOpacity
              key={index}
              style={styles.participant}
              onPress={() => navigateToUserProfile(attendee.user.id.toString())} // Navigation au clic
            >
              <Image
                source={{
                  uri:
                    attendee.user.photos?.[0]?.url ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.participantPhoto}
              />
              <Text style={styles.participantName}>
                {getDisplayName(attendee.user)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noParticipants}>
            Aucun participant inscrit pour le moment.
          </Text>
        )}
      </ScrollView>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    height: "100%",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 200, // Ajustez selon vos besoins
    backgroundColor: "#f5f5f5", // Couleur de fond pendant le chargement
    position: "relative",
    marginTop: 40,
    marginBottom: 40,
  },
  loader: {
    position: "absolute", // Place le loader au-dessus de l'image
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  participantList: {
    marginTop: 10,
  },
  participant: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  participantPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  participantName: {
    color: "#004FA3",
    fontWeight: "bold",
    fontSize: 17,
  },
  noParticipants: {
    fontStyle: "italic",
    color: "gray",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  shareButton: {
    backgroundColor: "#6DB3C5",
    shadowColor: "#6DB3C5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 30,
  },
  button: {
    backgroundColor: "#29524A",
    shadowColor: "#29524A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonLeave: {
    backgroundColor: "#E84855",
    shadowColor: "#E84855",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 30,
  },
  infoContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  sectionMember: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
    color: "#333",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
});
