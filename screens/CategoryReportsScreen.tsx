import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform
} from "react-native";
import * as Location from "expo-location";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { processReports } from "../services/reportService";
import { formatCity } from "../utils/formatters";
import { typeColors, categoryDescriptions } from "../utils/reportHelpers";
import { hexToRgba, calculateOpacity } from "../utils/reductOpacity";
import Ionicons from "react-native-vector-icons/Ionicons";

type CategoryReportsScreenRouteProp = RouteProp<
  RootStackParamList,
  "CategoryReportsScreen"
>;
type CategoryReportsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CategoryReportsScreen"
>;

type Report = {
  id: number;
  title: string;
  description: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: number;
  photos?: { url: string }[];
  createdAt: string;
};

export default function CategoryReportsScreen() {
  const route = useRoute<CategoryReportsScreenRouteProp>();
  const navigation = useNavigation<CategoryReportsScreenNavigationProp>();
  const { category } = route.params;
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const opacity = reports.length > 0 ? calculateOpacity(reports[0].createdAt) : 0.6;  
  const categoryColor = hexToRgba(typeColors[category.toLowerCase()] ?? "#CCCCCC", opacity);
  const categoryDescription = categoryDescriptions[category.toLowerCase()] ?? "Aucune information disponible.";

useEffect(() => {
  const fetchLocationAndReports = async () => {
    setLoading(true);
    try {
      const { category, city } = route.params;  

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Erreur",
          "La localisation est nécessaire pour trier les signalements."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
 
      const enrichedReports = await processReports(latitude, longitude, category, city);

      console.log("📌 Rapports filtrés :", enrichedReports);
      setReports(enrichedReports);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des signalements :", error);
      Alert.alert("Erreur", "Impossible de charger les signalements.");
    } finally {
      setLoading(false);
    }
  };

  fetchLocationAndReports();
}, [category]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#093A3E" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
  <View style={[styles.categoryContainer, { backgroundColor: categoryColor }]}>
        {/* Bouton Retour avec Icône */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={26} color="#FFF" />
        </TouchableOpacity>

        {/* Titre de la catégorie */}
        <Text style={styles.categoryTitle}>{category}</Text>

        {/* Description de la catégorie */}
        <Text style={styles.categoryDescription}>{categoryDescription}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        {reports.length === 0 ? (
          <Text style={styles.noReportsText}>
            Aucun signalement disponible.
          </Text>
        ) : (
          <View style={styles.cardContainer}>
            {reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() =>
                  navigation.navigate("ReportDetailsScreen", {
                    reportId: report.id,
                  })
                }
              >
                <Text style={styles.reportTitle}>
                  {report.title
                    ? report.title.length > 32
                      ? report.title.substring(0, 32) + "..."
                      : report.title
                    : "Sans titre"}
                </Text>

                <Text style={styles.reportDescription}>
                  {report.description
                    ? report.description.length > 40
                      ? report.description.substring(0, 40) + "..."
                      : report.description
                    : "Pas de description"}
                </Text>

                <View style={styles.photosContainer}>
                  {report.photos && report.photos.length > 0 ? (
                    report.photos.map((photo, index) => (
                      <Image
                        key={index}
                        source={{ uri: photo.url }}
                        style={styles.photo}
                        resizeMode="cover"
                      />
                    ))
                  ) : (
                    <View style={styles.placeholder}>
                      <Text style={styles.noPhotosText}>Aucune photo</Text>
                    </View>
                  )}
                </View>

                <View style={styles.footerContainer}>
                  <Text style={styles.reportCity}>
                    {report.city ? formatCity(report.city) : "Ville inconnue"}
                  </Text>
                  <View style={styles.distanceContainer}>
                    <Text style={styles.reportDistance}>
                      {report.distance !== undefined
                        ? `${report.distance.toFixed(2)} km`
                        : "Distance inconnue"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  categoryContainer: {
    paddingTop: 35,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  backButton: {
    position: "absolute",
    top: 45,
    left: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)", 
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    textTransform: "uppercase",
    textAlign: "center",
    marginTop: 5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  categoryDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: "#FFF",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 40,
    opacity: 0.85,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },




  scrollView: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  noReportsText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginTop: 40,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 8,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  reportDescription: {
    fontSize: 14,
    color: "#3A3A3C",
    marginBottom: 12,
    flexGrow: 1,
  },

  footerContainer: {
    marginTop: "auto",
    width: "100%",
    marginVertical: 8,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reportCity: {
    marginTop: 10,
    fontSize: 12,
    color: "#8E8E93",
  },

  photosContainer: {
    width: "100%",
    height: 120,

    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  photo: {
    width: "100%",
    height: "100%",
  },

  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  noPhotosText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
  },

  reportDistance: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF3B30",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },

  distanceContainer: {
    backgroundColor: "#FFF5F5",
    paddingVertical: 4,
    marginTop: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "center",
    shadowColor: "#FF3B30",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    color: "#8E8E93",
  },
});
