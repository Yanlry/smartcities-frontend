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
import MapView, { Marker, Polyline, MapType } from "react-native-maps";
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
import CommentsSection from "../components/CommentsSection";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Photo = {
  id: string;
  url: string;
};

export default function ReportDetailsScreen({ route, navigation }: any) {
  const { reportId } = route.params;
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);
  const { getUserId } = useToken();
  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [selectedVote, setSelectedVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    adjustMap();
  }, [routeCoords, report, location]);

  useEffect(() => {
    updateVotes();
  }, [report]);

  const fetchUserId = async () => {
    const userId = await getUserId();
    setCurrentUserId(userId);
  };

  const adjustMap = () => {
    if (mapRef.current && routeCoords.length > 0) {
      mapRef.current.fitToCoordinates(routeCoords, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });

      setTimeout(() => {
        const reportCamera = {
          center: {
            latitude: report.latitude,
            longitude: report.longitude,
          },
        };
        mapRef.current?.animateCamera(reportCamera, { duration: 500 });
      }, 500);

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

    setSelectedVote(type);

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

      setVotes({
        upVotes: result.updatedVotes.upVotes,
        downVotes: result.updatedVotes.downVotes,
      });
    } catch (error) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
      setSelectedVote(null);
    }
  };

  const openModal = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUserId();
      adjustMap();
      updateVotes();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement :", error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleMapType = () => {
    setMapType((prev) => (prev === "hybrid" ? "standard" : "hybrid"));
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#235562" />
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
  
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 10 }}
        >
          <Icon name="arrow-back-outline" size={28} color="#FFFFFC" />
        </TouchableOpacity>
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>{report.type.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <Icon
            name="notifications-outline"
            size={28}
            color="#FFFFFC"
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
            colors={["#235562"]}
            tintColor="#235562"
          />
        }
      >
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType={mapType}
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
                  altitude: 300,
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
              <View style={styles.markerContainer}>
                <Image
                  source={getTypeIcon(report.type)}
                  style={styles.markerIcon}
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

          {/* Bouton pour changer le type de carte */}
          <TouchableOpacity
          style={styles.floatingButtonView}
          onPress={toggleMapType}
        >
          <MaterialCommunityIcons
            name={mapType === "standard" ? "satellite-variant" : "map-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
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
      {/* Boutons superposés */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => handleVote("up")}
          style={[styles.voteButton, styles.upVoteButton]}
        >
          <Ionicons name="thumbs-up-outline" size={40} color="#235562" />
          <Text style={styles.voteTextUp}>{votes.upVotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleVote("down")}
          style={[styles.voteButton, styles.downVoteButton]}
        >
          <Ionicons name="thumbs-down-outline" size={40} color="#235562" />
          <Text style={styles.voteTextDown}>{votes.downVotes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
