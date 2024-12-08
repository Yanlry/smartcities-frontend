import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
// @ts-ignore
import { API_URL } from "@env";

const EventDetails = ({ route }) => {
  const { id } = route.params; // Récupérer l'ID depuis les paramètres
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
        const response = await axios.get(`${API_URL}/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (!event) {
    return (
      <View style={styles.loading}>
        <Text>Chargement des informations...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: event.photos[0]?.url || "https://via.placeholder.com/600" }}
        style={styles.image}
      />
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Text style={styles.info}>Lieu : {event.location}</Text>
      <Text style={styles.info}>
        Date : {new Date(event.date).toLocaleDateString()} à {new Date(event.date).toLocaleTimeString()}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    marginBottom: 5,
    color: "gray",
  },
});

export default EventDetails;