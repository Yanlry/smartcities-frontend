import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
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
import { useToken } from "../hooks/useToken";
import { Alert } from "react-native";
import styles from "./styles/ReportDetailsScreen.styles";
import { Ionicons } from "@expo/vector-icons";

type Photo = {
  id: string;
  url: string;
};

export default function ReportDetailsScreen({ route, navigation }: any) {
  const API_URL = "http://192.168.1.100:3000";
  const { reportId } = route.params;
  const { getUserId } = useToken(); // Importe la fonction pour récupérer l'ID utilisateur
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);

  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Stocke l'ID utilisateur
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const openModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  useEffect(() => {
    (async () => {
      const userId = await getUserId(); // Récupère le userId depuis AsyncStorage
      setCurrentUserId(userId); // Met à jour l'état local
      console.log("userId récupéré :", userId);
    })();
  }, []);

  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  useEffect(() => {
    if (report) {
      setUserVote(report.userVote || null);
      setVotes({
        upVotes: report.upVotes,
        downVotes: report.downVotes,
      });
    }
  }, [report]);

  const handleVote = async (type: "up" | "down") => {
    if (!location || !report || !currentUserId) return;

    try {
      const payload = {
        reportId: report.id,
        userId: currentUserId,
        type,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const response = await fetch(`${API_URL}/reports/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Vote failed");
      }

      const result = await response.json();

      // Mise à jour immédiate des votes
      setVotes({
        upVotes: result.updatedVotes.upVotes,
        downVotes: result.updatedVotes.downVotes,
      });

      // Facultatif : pour désactiver les boutons si besoin
      setUserVote(type);
    } catch (error) {
      Alert.alert(
        "Vous avez déjà voté",
        "Vous avez déja utiliser votre droit de vote pour cette annonce."
      );
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
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Signalement introuvable. Veuillez réessayer.
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
          <Ionicons name="location-sharp" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomReport}
          onPress={() => handleZoom(report.latitude, report.longitude)}
        >
          <Text style={styles.zoomReprotText}>GO</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.cardTitle}>
          <Text style={styles.title}>{report.title}</Text>
        </View>

        {/* Système de vote */}
        <View style={styles.voteSection}>
          <Text style={styles.votePrompt}>Avez-vous constaté le report ?</Text>
          <View style={styles.voteContainer}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Confirmer le vote",
                  "Vous vous apprêtez à voter POUR et à confirmer la présence de l'événement. Cette action est irréversible. Êtes-vous sûr ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Confirmer",
                      onPress: () => handleVote("up"),
                    },
                  ]
                );
              }}
              style={[styles.voteButton, styles.upVoteButton]}
            >
              <Text style={styles.voteText}>👍 {votes.upVotes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Confirmer le vote",
                  "Vous vous apprêtez à voter CONTRE et à invalider cet événement. Cette action est irréversible. Êtes-vous sûr ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Confirmer",
                      onPress: () => handleVote("down"),
                    },
                  ]
                );
              }}
              style={[styles.voteButton, styles.downVoteButton]}
            >
              <Text style={styles.voteText}>👎 {votes.downVotes}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.description}>{report.description}</Text>
      </View>


      <View style={styles.detailCardPhoto}> 
        <View style={styles.detailContainer}>
        <Text style={styles.detailLabel}>📸 Photos :</Text>
        {report.photos && report.photos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {report.photos.map((photo: Photo) => (
              <TouchableOpacity
              key={photo.id}
              onPress={() => openModal(photo.url)}
              >
              <Image
                source={{ uri: photo.url }}
                style={styles.photo}
                resizeMode="cover"
              />
              </TouchableOpacity>
            ))}
            </ScrollView>
        ) : (
          <Text style={styles.noPhotosText}>Aucune photo disponible.</Text>
        )}
        </View>
        {selectedPhoto && (
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.modalPhoto}
                resizeMode="contain"
              />
            </View>
          </Modal>
        )}
    </View>



      <View style={[styles.card, styles.detailCard]}>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>📏 Distance en voiture : </Text>
          <Text style={styles.detailValue}>
            {report.gpsDistance
              ? `${report.gpsDistance.toFixed(2)} km`
              : "Indisponible"}
          </Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>📍 Localisation : </Text>
          <Text
            style={styles.detailValue}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatCity(report.city)}
          </Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>📅 Créé le : </Text>
          <Text style={styles.detailValue}>
            Créé le : {formatDate(report.createdAt)}
          </Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.detailLabel}>🕺 Publiée par : </Text>
          <Text style={styles.detailValue}>{report.user.username}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
