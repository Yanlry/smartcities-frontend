import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
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
// @ts-ignore
import { API_URL } from "@env";
import CommentsSection from "../components/CommentsSection"; // Remplacez par le bon chemin
type Photo = {
  id: string;
  url: string;
};

export default function ReportDetailsScreen({ route, navigation }: any) {
  const { reportId } = route.params;
  const { getUserId } = useToken(); // Importe la fonction pour récupérer l'ID utilisateur
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Stocke l'ID utilisateur
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    adjustMap();
  }, [routeCoords, report, location]);

  useEffect(() => {
    updateVotes();
  }, [report]);
  // Récupère l'utilisateur actuel
  const fetchUserId = async () => {
    const userId = await getUserId();
    setCurrentUserId(userId);
  };

  // Gère le positionnement de la carte
  const adjustMap = () => {
    if (mapRef.current && routeCoords.length > 0) {
      // Ajuster les limites pour voir tout le tracé
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });

      // Zoomer sur le report après un délai
      setTimeout(() => {
        const reportCamera = {
          center: {
            latitude: report.latitude,
            longitude: report.longitude,
          },
        };
        mapRef.current?.animateCamera(reportCamera, { duration: 500 });
      }, 500);

      // Zoomer doucement vers la position de l'utilisateur après un autre délai
      setTimeout(() => {
        if (location?.latitude && location?.longitude) {
          const userCamera = {
            center: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          };
          mapRef.current?.animateCamera(userCamera, { duration: 1000 });
        }
      }, 2000);
    }
  };

  // Met à jour les votes
  const updateVotes = () => {
    if (report) {
      setVotes({
        upVotes: report.upVotes,
        downVotes: report.downVotes,
      });
    }
  };

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
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
    }
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#093A3E" />
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

  const openModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true); // Active le spinner de rafraîchissement
    try {
      await fetchUserId(); // Récupère l'utilisateur
      adjustMap(); // Ajuste la carte
      updateVotes(); // Met à jour les votes
    } catch (error) {
      console.error("Erreur lors du rafraîchissement :", error.message);
    } finally {
      setRefreshing(false); // Désactive le spinner
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }} // Alignement gauche
        >
          <Icon name="arrow-back-outline" size={28} color="#F7F2DE" />
        </TouchableOpacity>
        <View style={styles.typeBadge}>
          <Image source={getTypeIcon(report.type)} style={styles.icon} />
          <Text style={styles.headerTitle}>{report.type.toUpperCase()}</Text>
          <Image source={getTypeIcon(report.type)} style={styles.icon} />
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <Icon
            name="notifications-outline"
            size={28}
            color="#F7F2DE" // Couleur dorée
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#093A3E"]}
            tintColor="#093A3E"
          />
        }
      >
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType="hybrid"
            onMapReady={() => {
              if (mapRef.current) {
                const camera = {
                  center: {
                    latitude: report.latitude,
                    longitude: report.longitude,
                  },
                  pitch: 5,
                  heading: 0,
                  zoom: 15,
                  altitude: 100,
                };
                mapRef.current.setCamera(camera);
              }
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

            {/* Marqueur pour le signalement */}
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
                  source={getTypeIcon(report.type)}
                  style={{ width: 40, height: 40, resizeMode: "contain" }}
                />
              </View>
            </Marker>

            {/* Ligne de tracé */}
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#357DED"
                strokeWidth={5}
              />
            )}
          </MapView>

          {/* Titre superposé */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleTextMap}>
              Avez-vous vu cet événement ?
            </Text>
          </View>

          {/* Boutons superposés */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => handleVote("up")}
              style={[styles.voteButton, styles.upVoteButton]}
            >
              <Ionicons name="thumbs-up" size={28} color="#57A773" />
              <Text style={styles.voteTextUp}>{votes.upVotes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleVote("down")}
              style={[styles.voteButton, styles.downVoteButton]}
            >
              <Ionicons name="thumbs-down" size={28} color="#ff4d4f" />
              <Text style={styles.voteTextDown}>{votes.downVotes}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.separator}>
          <Text style={styles.separatorText}></Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>✏️ Titre du signalement :</Text>
          <Text style={styles.titleText}>{report.title}</Text>
        </View>

        <View style={styles.detailCardPhoto}>
          <View>
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
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Icon name="close" size={24} color="#FFFFFF" />
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

        <View style={styles.card}>
          <Text style={styles.detailLabel}>✏️ Description :</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>

        <View style={[styles.card, styles.detailCard]}>
          <Text style={styles.detailLabelInfo}>ℹ️ Informations :</Text>
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
              {formatDate(report.createdAt)}
            </Text>
          </View>
          <View style={styles.detailContainer}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("UserProfileScreen", {
                  userId: report.user.id,
                })
              }
            >
              <Text style={styles.detailLabel}>🕺 Publiée par : </Text>
              <Text style={styles.detailValue}>
                {report.user && report.user.useFullName
                  ? `${report.user.firstName} ${report.user.lastName}`
                  : report.user?.username || "Nom non disponible"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardComment}>
          {/* Autres sections de votre écran */}
          <CommentsSection key={report.id} report={report} />
        </View>
      </ScrollView>
    </View>
  );
}
