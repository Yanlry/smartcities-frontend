import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useLocation } from "../hooks/useLocation";
import { useFetchReportDetails } from "../hooks/useFetchReportDetails";
import { formatCity, formatDate } from "../utils/formatters";
import { getTypeIcon } from "../utils/typeIcons";
import Icon from "react-native-vector-icons/Ionicons";
import { handleVote } from "../utils/reportHelpers";

export default function ReportDetailsScreen({ route, navigation }: any) {
  const { reportId } = route.params;
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);

  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  const [upVotes, setUpVotes] = useState(report?.upVotes);
  const [downVotes, setDownVotes] = useState(report?.downVotes);

  useEffect(() => {
    if (report) {
      setUpVotes((prev: number | undefined) =>
        prev !== undefined ? prev : report.upVotes
      );
      setDownVotes((prev: number | undefined) =>
        prev !== undefined ? prev : report.downVotes
      );
    }
  }, [report]);
  

  
  useEffect(() => {
    console.log("Upvotes:", upVotes);
    console.log("Downvotes:", downVotes);
  }, [upVotes, downVotes]);

  
  useEffect(() => {
    if (report && report.id && report.userId) {
      checkExistingVote();
    }
  }, [report, location]);

  const checkExistingVote = async () => {
    try {
      const payload = {
        reportId: report.id,
        userId: report.userId,
        latitude: location?.latitude, // Ajoutez la latitude
        longitude: location?.longitude, // Ajoutez la longitude
      };

      console.log("Payload envoyé au backend :", payload);

      const response = await fetch(`http://192.168.1.4:3000/reports/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Vote existant :", data);
    } catch (error) {
      console.error("Erreur lors de la vérification du vote existant :", error);
    }
  };

  const handleZoom = (latitude: number, longitude: number) => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      },
      1000
    );
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          Chargement des données de localisation...
        </Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>
          Chargement des détails du signalement...
        </Text>
      </View>
    );
  }

  const latitudeMiddle = (location.latitude + report.latitude) / 2;
  const longitudeMiddle = (location.longitude + report.longitude) / 2;

  const LATITUDE_DELTA = Math.abs(location.latitude - report.latitude) * 2;
  const LONGITUDE_DELTA = Math.abs(location.longitude - report.longitude) * 2;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back-outline" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.typeBadge}>
          {/* Image dynamique en fonction du type de signalement */}
          <Image source={getTypeIcon(report.type)} style={styles.icon} />
          <Text style={styles.typeText}>{report.type.toUpperCase()}</Text>
          <Image source={getTypeIcon(report.type)} style={styles.icon} />
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="alert-circle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: latitudeMiddle,
            longitude: longitudeMiddle,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          {/* Marqueur pour la position actuelle */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Votre position"
            pinColor="red"
          />

          {/* Marqueur pour le signalement avec style */}
          <Marker
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.title}
          >
            <View
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={getTypeIcon(report.type)} // Dynamique selon le type de signalement
                style={{ width: 40, height: 40, resizeMode: "contain" }}
              />
            </View>
          </Marker>

          {/* Ligne de tracé */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#1E90FF" // Couleur du tracé
              strokeWidth={5} // Épaisseur du tracé
            />
          )}
        </MapView>

        {/* Boutons de zoom */}
        <TouchableOpacity
          style={styles.zoomPosition}
          onPress={() => handleZoom(location.latitude, location.longitude)}
        >
          <Text style={styles.zoomPositionText}>Zoom sur ma position</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomReport}
          onPress={() => handleZoom(report.latitude, report.longitude)}
        >
          <Text style={styles.zoomReprotText}>Zoom sur l'événement</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{report.title}</Text>
        </View>

        {/* Système de vote */}
        <View style={styles.voteContainer}>
        <TouchableOpacity
  onPress={() =>
    handleVote(
      report.id,
      report.userId,
      "up",
      location.latitude,
      location.longitude,
      upVotes, // Passer les votes actuels ici
      setUpVotes
    )
  }
  style={styles.voteButton}
>
  <Text style={styles.voteText}>👍 {upVotes}</Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() =>
    handleVote(
      report.id,
      report.userId,
      "down",
      location.latitude,
      location.longitude,
      downVotes, // Passer les votes actuels ici
      setDownVotes
    )
  }
  style={styles.voteButton}
>
  <Text style={styles.voteText}>👎 {downVotes}</Text>
</TouchableOpacity>

        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.description}>{report.description}</Text>
      </View>
      <View style={[styles.card, styles.detailCard]}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>📏 Distance en voiture : </Text>
          <Text style={styles.detailValue}>
            {report.gpsDistance
              ? `${report.gpsDistance.toFixed(2)} km`
              : "Indisponible"}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>📍 Localisation : </Text>
          <Text
            style={styles.detailValue}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatCity(report.city)}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>📅 Créé le : </Text>
          <Text style={styles.detailValue}>
            Créé le : {formatDate(report.createdAt)}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Publiée par : </Text>
          <Text style={styles.detailValue}>{report.user.username}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 50,
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 15,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
  backButton: {
    padding: 5,
  },
  mapContainer: {
    height: 500, // Donne à la carte une hauteur spécifique
  },
  map: {
    flex: 1,
  },
  zoomPosition: {
    position: "absolute",
    bottom: 20,
    right: 5, // Position à droite
    backgroundColor: "#3185FC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    width: "45%",
    justifyContent: "center", // Centre le texte verticalement
    alignItems: "center", // Centre le texte horizontalement
  },
  zoomPositionText: {
    color: "#FFF",
    fontSize: 12, // Ajusté pour correspondre à la taille du bouton
    fontWeight: "bold",
  },
  zoomReport: {
    position: "absolute",
    bottom: 20,
    left: 5, // Position à gauche
    backgroundColor: "#E84855",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    width: "45%",
    justifyContent: "center", // Centre le texte verticalement
    alignItems: "center", // Centre le texte horizontalement
  },
  zoomReprotText: {
    color: "#FFF",
    fontSize: 12, // Ajusté pour correspondre à la taille du bouton
    fontWeight: "bold",
  },
  content: {
    padding: 16,
    backgroundColor: "#f4f4f9",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  detailCard: {
    display: "flex",
    flexDirection: "column",
    borderRadius: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
  },
  detailsContainer: {
    alignItems: "center",
    marginBottom: 8,
    padding: 8,
    borderRadius: 30,
    backgroundColor: "#e6e6f0",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginRight: 4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#555",
    flex: 1, // Permet au texte de s'étendre
    flexWrap: "wrap", // Autorise le retour à la ligne
    lineHeight: 18, // Ajoute un peu d'espace entre les lignes
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  voteButton: {
    padding: 10,
    backgroundColor: "#f4f4f9",
    borderRadius: 30,
    marginHorizontal: 10,
  },
  voteText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
