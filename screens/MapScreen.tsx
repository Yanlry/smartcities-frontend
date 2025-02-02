import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import MapView, { Marker, Camera, Region } from "react-native-maps";
import { useLocation } from "../hooks/useLocation";
import {
  fetchAllReportsInRegion,
  Report,
  fetchAllEventsInRegion,
  Event as ReportEvent,
} from "../services/reportService";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { getTypeIcon, typeIcons } from "../utils/typeIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { formatDate } from "../utils/formatters";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

const TYPE_LABELS: Record<string, string> = {
  reparation: "Réparation",
  nuisance: "Nuisance",
  travaux: "Travaux",
  danger: "Danger",
  pollution: "Pollution",
};

export default function MapScreen() {
  const { location, loading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<ReportEvent[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [mapType, setMapType] = useState<
    "standard" | "satellite" | "hybrid" | "terrain"
  >("standard");
  const [filter, setFilter] = useState<"all" | "reports" | "events">("all");
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [selectedReport, setSelectedReport] = useState<
    Report | ReportEvent | null
  >(null);

  const fetchDataInRegion = async (region?: Region) => {
    const regionToUse =
      region ||
      mapRegion ||
      (location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        : null);

    if (!regionToUse) {
      console.error("❌ Aucune région valide pour récupérer les données !");
      return;
    }

    console.log("🔄 Chargement des données pour :", regionToUse);
    setLoadingReports(true);

    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } =
        regionToUse;
      const radiusKm = Math.max(latitudeDelta * 111, longitudeDelta * 111, 5);

      const [reportsData, eventsData] = await Promise.all([
        fetchAllReportsInRegion(latitude, longitude, radiusKm),
        fetchAllEventsInRegion(latitude, longitude, radiusKm),
      ]);

      console.log("✅ Signalements chargés :", reportsData.length);
      console.log("✅ Événements chargés :", eventsData.length);

      setReports(reportsData);
      setEvents(eventsData);

      if (!isReady) {
        console.log("🚀 Première mise à jour de la carte");
        setIsReady(true);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données :", error);
      Alert.alert("Erreur", "Impossible de récupérer les données.");
    } finally {
      setLoadingReports(false);
      console.log("✅ Fin du chargement des données");
    }
  };

  useEffect(() => {
    if (location) {
      const initialRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      console.log("📍 Initialisation de la carte :", initialRegion);
      setMapRegion(initialRegion);

      mapRef.current?.animateCamera(
        { center: location, zoom: 16 },
        { duration: 2000 }
      );

      fetchDataInRegion(initialRegion);
    }
  }, [location]);

  useEffect(() => {
    if (selectedReport) {
      translateY.value = withTiming(0, { duration: 200 });
    }
  }, [selectedReport]);

  const translateY = useSharedValue(0);

  const handleGesture = (event) => {
    if (event.nativeEvent.translationY > 50) {
      translateY.value = withTiming(0, { duration: 100 });
      setTimeout(() => {
        setSelectedReport(null);
        translateY.value = withTiming(0, { duration: 0 });
      }, 200);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (loading || !isReady) {
    console.log("⏳ En attente du chargement...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#093A3E" />
      </View>
    );
  }

  const filteredMarkers = (): (Report | ReportEvent)[] => {
    if (filter === "reports") return reports;
    if (filter === "events") return events;
    return [...reports, ...events];
  };

  const toggleMapType = () => {
    setMapType((prevType) =>
      prevType === "standard" ? "satellite" : "standard"
    );
  };

  const isReport = (item: Report | ReportEvent): item is Report =>
    (item as Report).type !== undefined;

  if (loading || loadingReports) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#093A3E" />
      </View>
    );
  }

  if (!location) {
    Alert.alert(
      "Localisation indisponible",
      "Impossible de récupérer votre position actuelle."
    );
    return (
      <View style={styles.errorContainer}>
        <Text>Localisation indisponible</Text>
      </View>
    );
  }

  const formatType = (type: string): string => {
    return TYPE_LABELS[type] || "Type inconnu";
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion || undefined}
        onRegionChangeComplete={(region) => setMapRegion(region)}
        mapType={mapType}
        showsBuildings={false}
        pitchEnabled={false}
        rotateEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        showsCompass={false}
      >
        {/* 🔹 Marqueurs de signalements et événements */}
        {filteredMarkers().map((item, index) => {
          const isReport = (item: Report | ReportEvent): item is Report =>
            (item as Report).type !== undefined;

          return (
            <Marker
              key={`${item.id}-${index}`}
              coordinate={{
                latitude: item.latitude,
                longitude: item.longitude,
              }}
              onPress={() => setSelectedReport(item)}
            >
              <View style={styles.markerContainer}>
                <Image
                  source={
                    isReport(item)
                      ? getTypeIcon(item.type)
                      : require("../assets/icons/event.png")
                  }
                  style={styles.markerIcon}
                />
              </View>
            </Marker>
          );
        })}

        {/* 🔹 Pin de la position actuelle de l'utilisateur */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          >
            <View style={styles.userMarkerContainer}>
              <Image
                source={require("../assets/icons/location.png")}
                style={styles.userMarkerIcon}
              />
            </View>
          </Marker>
        )}
      </MapView>

      <View style={styles.legendContainer}>
        {Object.keys(typeIcons).map((key) => (
          <View key={key} style={styles.legendItem}>
            <Image source={typeIcons[key].icon} style={styles.legendIcon} />
            <Text style={styles.legendText}>{typeIcons[key].label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.floatingButtonContainer}>
        {/* Bouton basculer le type de carte */}
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

        {/* Bouton rechercher les signalements */}
        <TouchableOpacity
          style={styles.floatingButtonSearch}
          onPress={() => fetchDataInRegion(mapRegion || undefined)}
        >
          <MaterialCommunityIcons name="magnify" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <MaterialCommunityIcons
            name="format-list-bulleted"
            size={16}
            color={filter === "all" ? "#093A3E" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "reports" && styles.activeFilter,
          ]}
          onPress={() => setFilter("reports")}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={16}
            color={filter === "reports" ? "#093A3E" : "white"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "events" && styles.activeFilter,
          ]}
          onPress={() => setFilter("events")}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={16}
            color={filter === "events" ? "#093A3E" : "white"}
          />
        </TouchableOpacity>
      </View>

      {selectedReport && (
        <PanGestureHandler onGestureEvent={handleGesture}>
          <Animated.View style={[styles.previewContainer, animatedStyle]}>
            {/* Icone de fermeture (Swipe vers le bas) */}
            <View style={styles.closeIcon}>
              <View style={styles.closeIconBar} />
            </View>

            {/* Image et type */}
            <View style={styles.previewHeader}>
              <Image
                source={
                  isReport(selectedReport)
                    ? getTypeIcon(selectedReport.type)
                    : require("../assets/icons/event.png")
                }
                style={styles.previewImage}
              />
              <View>
                <Text
                  style={styles.previewTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {isReport(selectedReport)
                    ? selectedReport.title.length > 32
                      ? `${selectedReport.title.slice(0, 32)}...`
                      : selectedReport.title
                    : selectedReport.title.length > 32
                    ? `${selectedReport.title.slice(0, 32)}...`
                    : selectedReport.title}
                </Text>
                <Text style={styles.previewType}>
                  {isReport(selectedReport)
                    ? formatType(selectedReport.type)
                    : "Événement spécial"}
                </Text>
              </View>
            </View>

            {/* 📷 Image du report (si disponible) */}
            {isReport(selectedReport) && selectedReport.photos?.length > 0 && (
              <Image
                source={{ uri: selectedReport.photos[0].url }}
                style={styles.previewImageLarge}
                resizeMode="cover"
              />
            )}

            {/* Informations */}
            <View style={styles.previewInfo}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.previewText}>
                {isReport(selectedReport) && selectedReport.createdAt
                  ? formatDate(selectedReport.createdAt)
                  : !isReport(selectedReport) && selectedReport.createdAt
                  ? formatDate(selectedReport.createdAt)
                  : "Date inconnue"}
              </Text>
            </View>

            <View style={styles.previewInfo}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={16}
                color="#666"
              />
              <Text style={styles.previewText}>
                {selectedReport.distance !== undefined &&
                selectedReport.distance !== null
                  ? `${selectedReport.distance.toFixed(2)} km`
                  : (!isReport(selectedReport) && selectedReport.location) ||
                    "Lieu inconnu"}
              </Text>
            </View>

            {/* Description */}
            <Text style={styles.previewDescription}>
              {selectedReport.description || "Aucune description disponible"}
            </Text>

            {/* Bouton Voir Plus */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                if (isReport(selectedReport)) {
                  navigation.navigate("ReportDetailsScreen", {
                    reportId: selectedReport.id,
                  });
                } else {
                  navigation.navigate("EventDetailsScreen", {
                    eventId: selectedReport.id.toString(),
                  });
                }
                setSelectedReport(null);
              }}
            >
              <Text style={styles.detailsButtonText}>Voir plus</Text>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: "center",
  },
  markerText: {
    backgroundColor: "white",
    padding: 4,
    borderRadius: 5,
    fontSize: 10,
  },
  markerIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  markerIconEvent: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  legendContainer: {
    position: "absolute",
    top: 100,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: "contain",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapTypeButton: {
    position: "absolute",
    top: 640,
    left: "35%",
    backgroundColor: "#fff",
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  mapTypeButtonText: {
    color: "#000",
  },

  searchButton: {
    position: "absolute",
    top: 685,
    left: "50%",
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: "#093A3E",
    borderRadius: 30,
    padding: 10,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  filterContainer: {
    position: "absolute",
    top: 100,
    right: 10,
    flexDirection: "column",
    backgroundColor: "white",
    padding: 8,
    borderRadius: 25,
    elevation: 5,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginBottom: 5,
    backgroundColor: "#093A3E",
    justifyContent: "center",
    alignItems: "center",
  },
  activeFilter: {
    backgroundColor: "white",
    borderColor: "#093A3E",
    borderWidth: 2,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    alignItems: "center",
  },
  floatingButtonView: {
    backgroundColor: "#093A3E",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingButtonSearch: {
    backgroundColor: "#E43737",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  previewContainer: {
    position: "absolute",
    bottom: 70,
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  closeIcon: {
    alignSelf: "center",
    marginBottom: 10,
  },
  closeIconBar: {
    width: 40,
    height: 5,
    backgroundColor: "#CCC",
    borderRadius: 10,
  },

  previewImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 10,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    width: "100%",
    flexShrink: 1,
    textAlign: "left",
  },
  previewHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  previewType: {
    fontSize: 14,
    color: "#666",
  },
  previewInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  previewText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  previewDescription: {
    fontSize: 14,
    color: "#444",
    marginVertical: 10,
  },
  detailsButton: {
    backgroundColor: "#093A3E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  previewImageLarge: {
    width: "100%",
    height: 100,
    borderRadius: 20,
    marginBottom: 10,
  },
  userMarkerIcon: {
    width: 40,
    height: 40,
  },
});
