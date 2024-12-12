import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Share } from "react-native";
// @ts-ignore
import { API_URL } from "@env";

const EventDetails = ({ route }) => {
  const { eventId } = route.params;

  interface Event {
    photos: { url: string }[];
    title: string;
    description: string;
    location: string;
    date: string;
  }

  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const url = `${API_URL}/events/${eventId}`;
        const response = await axios.get(url);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
        alert("Impossible de récupérer les détails de l'événement.");
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (!event) {
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
        }\n\nLien : https://smartcities/events/${eventId}`, // Vous pouvez remplacer par une URL réelle
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Image en-tête */}
      <Image
        source={{
          uri: event.photos?.[0]?.url || "https://via.placeholder.com/600",
        }}
        style={styles.image}
      />

      {/* Titre et Actions */}
      <View style={styles.header}>
        <Text style={styles.title}>{event.title || "Titre indisponible"}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.buttonText}>Partager</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
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
                  weekday: "long", // Jour de la semaine
                  year: "numeric", // Année
                  month: "long", // Mois
                  day: "numeric", // Jour
                })
              )
            : "Date non disponible"}
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>
        {event.description || "Description indisponible"}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    marginTop: 50,
    marginBottom: 20,
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
    backgroundColor: "#11998e",
    shadowColor: "#11998e",
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
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
  },
});

export default EventDetails;
