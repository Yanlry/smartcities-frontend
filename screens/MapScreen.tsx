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
import { getTypeIcon } from "../utils/typeIcons";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

export default function MapScreen() {
  const { location, loading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<ReportEvent[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [mapType, setMapType] = useState<
    "standard" | "satellite" | "hybrid" | "terrain"
  >("standard");
  const [filter, setFilter] = useState<"all" | "reports" | "events">("all");
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();
  const DEFAULT_RADIUS_KM = 5;
  
  const fetchReportsInRegion = async () => {
    if (!mapRegion) return;
  
    setLoadingReports(true);
    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
      
      // Fixer un rayon minimal (5 km) pour éviter une zone trop grande/petite
      const radiusKm = Math.max(latitudeDelta * 111, longitudeDelta * 111, 5);
  
      const result = await fetchAllReportsInRegion(latitude, longitude, radiusKm);
      setReports(result);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements :", error);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les signalements dans cette zone."
      );
    } finally {
      setLoadingReports(false);
    }
  };
  
  const fetchEventsInRegion = async () => {
    if (!mapRegion) return;
  
    setLoadingReports(true);
    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
  
      // Fixer un rayon minimal (5 km) pour éviter une zone trop grande/petite
      const radiusKm = Math.max(latitudeDelta * 111, longitudeDelta * 111, 5);
  
      const result = await fetchAllEventsInRegion(latitude, longitude, radiusKm);
      setEvents(result);
    } catch (error) {
      console.error("Erreur lors du chargement des événements :", error);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les événements dans cette zone."
      );
    } finally {
      setLoadingReports(false);
    }
  };
  
  const fetchDataInRegion = async () => {
    if (!mapRegion) return;
  
    setLoadingReports(true);
    try {
      // Appel simultané des deux fonctions
      await Promise.all([fetchReportsInRegion(), fetchEventsInRegion()]);
    } catch (error) {
      console.error("Erreur lors du chargement des données :", error);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les données dans cette zone."
      );
    } finally {
      setLoadingReports(false);
    }
  };

  const filteredMarkers = (): (Report | ReportEvent)[] => {
    if (filter === "reports") return reports;
    if (filter === "events") return events;
    return [...reports, ...events];
  };

  useEffect(() => {
    if (location) {
      const initialRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
  
      setMapRegion(initialRegion);
  
      // Appelez fetchDataInRegion après avoir défini la région
      fetchDataInRegion();
  
      if (mapRef.current) {
        const camera: Camera = {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 60,
          heading: 0,
          zoom: 19,
          altitude: 1000,
        };
        mapRef.current.animateCamera(camera, { duration: 2000 });
      }
    }
  }, [location]);

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
  };

  const toggleMapType = () => {
    setMapType((prevType) => {
      switch (prevType) {
        case "standard":
          return "satellite";
        case "satellite":
          return "hybrid";
        case "hybrid":
          return "terrain";
        default:
          return "standard";
      }
    });
  };

  if (loading || loadingReports) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#535353" />
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

  return (
    <View style={styles.container}>
      <MapView
  ref={mapRef}
  style={styles.map}
  region={mapRegion || undefined}
  onRegionChangeComplete={handleRegionChangeComplete}
  mapType={mapType}
  showsBuildings={false} // Désactive les bâtiments 3D
  pitchEnabled={false} // Désactive l'inclinaison
  rotateEnabled={false} // Désactive la rotation
  showsCompass={true} // (Optionnel) Affiche la boussole si rotation désactivée
>
        {filteredMarkers().map((item) => {
  // Vérifie si l'élément est un rapport
  const isReport = (item: Report | ReportEvent): item is Report =>
    (item as Report).type !== undefined;

  return (
    <Marker
      key={item.id}
      coordinate={{
        latitude: item.latitude,
        longitude: item.longitude,
      }}
      onPress={() => {
        // Affiche le titre lorsque l'utilisateur clique
        if (isReport(item)) {
          navigation.navigate("ReportDetailsScreen", { reportId: item.id });
        } else {
          navigation.navigate("EventDetailsScreen", { eventId: item.id.toString() });
        }
      }}
    >
      <View style={{ alignItems: "center" }}>
        {/* Affiche le titre au-dessus de l'image */}
        <Text style={{ backgroundColor: "white", padding: 4, borderRadius: 5,fontSize:10 }}>
          {isReport(item) ? item.title : item.name}
        </Text>
        {/* Image du marqueur */}
        <Image
          source={
            isReport(item)
              ? getTypeIcon(item.type)
              : require("../assets/images/1.jpg")
          }
          style={{ width: 40, height: 40, resizeMode: "contain" }}
        />
      </View>
    </Marker>
  );
})}
      </MapView>

      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Text style={styles.mapTypeButtonText}>
          {mapType === "standard"
            ? "Vue Satellite"
            : mapType === "satellite"
            ? "Vue Hybride"
            : mapType === "hybrid"
            ? "Vue Terrain"
            : "Vue Standard"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={fetchDataInRegion} // Appelle les deux fonctions en même temps
      >
        <Text style={styles.searchButtonText}>Rechercher dans cette zone</Text>
      </TouchableOpacity>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={styles.filterText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "reports" && styles.activeFilter,
          ]}
          onPress={() => setFilter("reports")}
        >
          <Text style={styles.filterText}>Signalements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "events" && styles.activeFilter,
          ]}
          onPress={() => setFilter("events")}
        >
          <Text style={styles.filterText}>Événements</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: "#CA483F",
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
    bottom: 600,
    right: 10,
    justifyContent: "space-around",
    width: "22%",
    textAlign: "center",
  },
  filterButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#A3A3A3",
    borderRadius: 30,
    marginBottom: 2,
    backgroundColor: "#A3A3A3",
  },
  activeFilter: { backgroundColor: "#CA483F", borderColor: "#CA483F", fontWeight: "bold"},
  filterText: { color: "#fff", fontSize : 10, textAlign : "center" },
});
