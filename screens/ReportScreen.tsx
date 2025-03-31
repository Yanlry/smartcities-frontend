import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
// @ts-ignore
import { API_URL, OPEN_CAGE_API_KEY } from "@env";
import { useToken } from "../hooks/auth/useToken";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/common/Sidebar";
import PhotoManager from "../components/interactions/PhotoManager";
import { useLocation } from "../hooks/location/useLocation";
import MapView from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { useUserProfile } from "../hooks/user/useUserProfile"; // Ajoutez cette ligne

type Report = {
  id: number;
  title: string;
  description: string;
  city: string;
  createdAt: string;
  updatedAt?: string;
  photos?: { url: string }[];
};

export default function ReportScreen({ navigation }) {
  const { unreadCount } = useNotification();
  const { location, loading } = useLocation();
  const mapRef = useRef<MapView>(null);

  const { getUserId } = useToken();

  const [reports, setReports] = useState<
    { id: number; title: string; description: string; createdAt: string }[]
  >([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isAddressValidated, setIsAddressValidated] = useState(false);

  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();

  const dummyFn = () => {};

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        console.log("ID utilisateur récupéré :", userId);
        const response = await fetch(`${API_URL}/reports?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rapports :", error);
      }
    };

    fetchUserReports();
  }, [currentReport]);

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ReportDetailsScreen", { reportId: item.id })
        }
      >
        {/* Affichage de l'image */}
        {Array.isArray(item.photos) && item.photos.length > 0 && (
          <Image
            source={{ uri: item.photos[0].url }}
            style={styles.reportImage}
          />
        )}

        {/* Titre et description */}
        <Text style={styles.reportTitle}>{item.title}</Text>
        <Text style={styles.reportDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.reportDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Pied de carte */}
        <View style={styles.reportFooter}>
          <TouchableOpacity
            onPress={() => openModal(item)}
            style={styles.changeReport}
          >
            <Text style={styles.changeReportText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Icon name="delete" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du signalement.");
      }

      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== reportId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du signalement :", error);
    }
  };

  const confirmDelete = (reportId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer ce signalement ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => deleteReport(reportId) },
      ]
    );
  };

  const openModal = (report) => {
    setCurrentReport(report);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setCurrentReport(null);
  };

  const updateReportHandler = async (updatedReport) => {
    console.log(
      "Valeur actuelle du rapport avant mise à jour :",
      updatedReport
    );

    const { id, createdAt, votes, trustRate, distance, ...filteredReport } =
      updatedReport;

    console.log("Photos envoyées :", filteredReport.photos);

    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredReport),
      });

      console.log("Statut de la réponse :", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur du serveur :", errorText);
        throw new Error("Erreur lors de la mise à jour du signalement.");
      }

      const data = await response.json();
      console.log("Données renvoyées par le backend :", data);

      setReports((prevReports) =>
        prevReports.map((report) => (report.id === id ? data : report))
      );

      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  const handleUseLocation = async () => {
    if (loading) {
      console.log("Chargement en cours, action ignorée.");
      return;
    }

    if (!location) {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer votre position. Vérifiez vos permissions GPS."
      );
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPEN_CAGE_API_KEY}`;
      console.log("Requête API pour reverse geocoding :", url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted;

        console.log("Adresse récupérée depuis OpenCage Data :", address);

        setSuggestions(data.results);
        setModalVisible(true);
      } else {
        Alert.alert("Erreur", "Impossible de déterminer l'adresse exacte.");
      }
    } catch (error) {
      console.error("Erreur lors du reverse geocoding :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la récupération de l’adresse."
      );
    }
  };

  const handleAddressSearch = async (city) => {
    if (!city || !city.trim()) {
      console.warn("Recherche annulée : champ ville vide.");
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        city
      )}&key=${OPEN_CAGE_API_KEY}`;
      console.log("Requête API pour la recherche :", url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const sortedSuggestions = data.results.sort((a, b) => {
          const postalA = extractPostalCode(a.formatted);
          const postalB = extractPostalCode(b.formatted);
          return postalA - postalB;
        });

        setSuggestions(sortedSuggestions);
        setModalVisible(true);
      } else {
        setSuggestions([]);
        Alert.alert("Erreur", "Aucune adresse correspondante trouvée.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de l’adresse :", error);
      Alert.alert("Erreur", "Impossible de rechercher l’adresse.");
    }
  };

  const extractPostalCode = (address) => {
    const postalCodeMatch = address.match(/\b\d{5}\b/);
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity;
  };

  const handleSuggestionSelect = (item: any) => {
    if (item.geometry) {
      const { lat, lng } = item.geometry;

      const formattedCity = item.formatted.replace(
        /unnamed road/g,
        "Route inconnue"
      );

      setCurrentReport((prevReport) => {
        if (!prevReport) return prevReport;
        return {
          ...prevReport,
          city: formattedCity,
          latitude: lat,
          longitude: lng,
        };
      });

      setIsAddressValidated(true);

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }

    setModalVisible(false);
  };

  const isValidInput = () => {
    return (
      (currentReport?.title?.trim().length ?? 0) > 4 &&
      (currentReport?.description?.trim().length ?? 0) > 4
    );
  };

  const getValidationErrors = (): string[] => {
    const errors: string[] = [];
    if (!isAddressValidated) {
      errors.push(
        "Veuillez sélectionner une adresse en recherchant dans la liste."
      );
    }
    if ((currentReport?.title?.trim().length ?? 0) <= 4) {
      errors.push("Le titre doit contenir au moins 5 caractères.");
    }
    if ((currentReport?.description?.trim().length ?? 0) <= 4) {
      errors.push("La description doit contenir au moins 5 caractères.");
    }
    return errors;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={24}
            color="#FFFFFC"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadgeNav}>
          <Text style={styles.headerTitleNav}>MES SIGNALEMENTS</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={24}
              color={unreadCount > 0 ? "#FFFFFC" : "#FFFFFC"}
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

      {reports.length === 0 ? (
        <View style={styles.noReportsContainer}>
          <Text style={styles.noReportsText}>Aucun signalement trouvé.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reportsList}
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier le signalement</Text>

              {/* Champ Titre */}
              <TextInput
                style={styles.inputTitle}
                placeholder="Titre"
                value={currentReport?.title || ""}
                onChangeText={(text) =>
                  setCurrentReport({ ...currentReport, title: text } as Report)
                }
                multiline={false}
                maxLength={100}
                scrollEnabled={true}
              />

              {/* Champ Description */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={currentReport?.description || ""}
                onChangeText={(text) =>
                  setCurrentReport({
                    ...currentReport,
                    description: text,
                  } as Report)
                }
                multiline
              />
              <View style={styles.inputWithButton}>
                <TextInput
                  style={styles.inputSearch}
                  placeholder="Rechercher une adresse"
                  value={currentReport?.city || ""}
                  placeholderTextColor="#c7c7c7"
                  onChangeText={(text) => {
                    setCurrentReport({
                      ...currentReport,
                      city: text,
                    } as Report);
                    setIsAddressValidated(false);
                  }}
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() =>
                    currentReport && handleAddressSearch(currentReport.city)
                  }
                >
                  <Ionicons name="search-sharp" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rowButtonLocation}
                  onPress={handleUseLocation}
                >
                  <Ionicons name="location-sharp" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              {/* Suggestions d'adresses */}
              <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <ScrollView>
                      {suggestions.map((item, index) => (
                        <TouchableOpacity
                          key={`${item.formatted}-${index}`}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionSelect(item)}
                        >
                          <Text style={styles.suggestionText}>
                            {item.formatted}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
              {/* Gestion des photos */}
              <Text style={styles.photoSectionTitle}>Photos</Text>
              <PhotoManager
                photos={
                  currentReport?.photos?.map((photo, index) => {
                    return { id: index.toString(), uri: photo.url };
                  }) || []
                }
                setPhotos={(newPhotos) => {
                  setCurrentReport({
                    ...currentReport,
                    photos: newPhotos.map((photo) => ({
                      url: photo.uri || photo.uri,
                    })),
                  } as Report);
                }}
              />

              {/* Bouton Enregistrer */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isAddressValidated || !isValidInput()) &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  if (isAddressValidated && isValidInput()) {
                    updateReportHandler(currentReport);
                  } else {
                    const errors = getValidationErrors();
                    Alert.alert("Validation requise", errors.join("\n"));
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>

              {/* Bouton Annuler */}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#062C41",
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#FFFFFC",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc",
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -7,
    right: 2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  reportsList: {
    paddingVertical: 10,
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 10,
  },
  reportImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666666",
    marginBottom: 5,
  },
  reportDescription: {
    fontSize: 14,
    color: "#7A7A7A",
    marginBottom: 10,
  },

  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportDate: {
    fontSize: 12,
    marginBottom: 5,
    color: "#666666",
  },
  changeReport: {
    backgroundColor: "#FF9800",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  changeReportText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  noReportsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReportsText: {
    fontSize: 18,
    color: "#000",
  },

  deleteButton: {
    backgroundColor: "#FFF5F5",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#FF5252",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputTitle: {
    width: "100%",
    height: 50,
    maxHeight: 50,
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingLeft: 30,
    marginBottom: 25,
    fontSize: 16,
    color: "#333",
    overflow: "hidden",
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingLeft: 25,
    paddingTop: 20,
    fontSize: 16,
    color: "#333",
    overflow: "hidden",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#f44336",
    padding: 10,
    alignItems: "center",
    borderRadius: 20,
    marginVertical: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputSearch: {
    height: 50,
    textAlignVertical: "center",
    paddingHorizontal: 10,
    paddingLeft: 20,

    backgroundColor: "#f5f5f5",
    width: "65%",
    borderRadius: 30,
    fontSize: 16,
    color: "#333",
    marginTop: 40,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34495E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 40,
  },
  rowButtonLocation: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDAE49",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    paddingVertical: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  disabledButton: {
    backgroundColor: "#ddd",
  },
});

// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   Alert,
//   Image,
//   Modal,
//   TextInput,
//   ScrollView,
//   StatusBar,
//   Dimensions,
//   ActivityIndicator,
//   Platform,
//   KeyboardAvoidingView,
// } from "react-native";
// // @ts-ignore
// import { API_URL, OPEN_CAGE_API_KEY } from "@env";
// import { useToken } from "../hooks/auth/useToken";
// import { useNotification } from "../context/NotificationContext";
// import Sidebar from "../components/common/Sidebar";
// import PhotoManager from "../components/interactions/PhotoManager";
// import { useLocation } from "../hooks/location/useLocation";
// import MapView, { Marker } from "react-native-maps";
// import { Ionicons } from "@expo/vector-icons";
// import { Keyboard, TouchableWithoutFeedback } from "react-native";

// // Constantes pour le design system
// const { width, height } = Dimensions.get("window");
// const COLORS = {
//   primary: "#062C41",
//   secondary: "#FF9800",
//   danger: "#f44336",
//   success: "#4CAF50",
//   background: "#F8F9FA",
//   card: "#FFFFFF",
//   border: "#E0E0E0",
//   text: {
//     primary: "#333333",
//     secondary: "#666666",
//     light: "#FFFFFF",
//     muted: "#999999",
//   },
// };

// type Report = {
//   id: number;
//   title: string;
//   description: string;
//   city: string;
//   createdAt: string;
//   updatedAt?: string;
//   photos?: { url: string }[];
//   latitude?: number;
//   longitude?: number;
//   votes?: number;
//   trustRate?: number;
//   distance?: number;
// };

// export default function ReportScreen({ navigation }) {
//   const { unreadCount } = useNotification();
//   const { location, loading: locationLoading } = useLocation();
//   const mapRef = useRef<MapView>(null);

//   const { getUserId } = useToken();

//   const [reports, setReports] = useState<Report[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentReport, setCurrentReport] = useState<Report | null>(null);
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [isAddressValidated, setIsAddressValidated] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserReports = async () => {
//       try {
//         setLoading(true);
//         const userId = await getUserId();
//         if (!userId) {
//           console.error("Impossible de récupérer l'ID utilisateur.");
//           return;
//         }

//         const response = await fetch(`${API_URL}/reports?userId=${userId}`);
//         if (!response.ok) {
//           throw new Error(`Erreur HTTP ! statut : ${response.status}`);
//         }
//         const data = await response.json();
//         setReports(data);
//       } catch (error) {
//         console.error("Erreur lors de la récupération des rapports :", error);
//         Alert.alert(
//           "Erreur",
//           "Impossible de charger vos signalements. Veuillez réessayer."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserReports();
//   }, [currentReport]);

//   // Item de rapport sans hooks internes
//   const renderItem = useCallback(({ item }: { item: Report }) => (
//     <View style={styles.reportCard}>
//       <TouchableOpacity
//         style={styles.reportCardTouchable}
//         activeOpacity={0.7}
//         onPress={() => navigation.navigate("ReportDetailsScreen", { reportId: item.id })}
//       >
//         {/* Indicateur visuel de statut */}
//         <View style={styles.statusIndicator} />

//         <View style={styles.reportCardContent}>
//           {/* Section image et informations principales */}
//           <View style={styles.reportCardMainSection}>
//             {/* Affichage de l'image avec placeholder si besoin */}
//             <View style={styles.imageContainer}>
//               {Array.isArray(item.photos) && item.photos.length > 0 ? (
//                 <Image
//                   source={{ uri: item.photos[0].url }}
//                   style={styles.reportImage}
//                   resizeMode="cover"
//                 />
//               ) : (
//                 <View style={styles.placeholderContainer}>
//                   <Ionicons name="image-outline" size={24} color="#CCCCCC" />
//                 </View>
//               )}
//             </View>

//             {/* Informations textuelles */}
//             <View style={styles.reportInfo}>
//               <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
//               <Text style={styles.reportDate}>
//                 {new Date(item.createdAt).toLocaleDateString()}
//               </Text>
//               <Text style={styles.reportDescription} numberOfLines={2}>
//                 {item.description}
//               </Text>
//             </View>
//           </View>

//           {/* Actions */}
//           <View style={styles.reportActions}>
//             <TouchableOpacity
//               style={styles.editButton}
//               onPress={() => openModal(item)}
//             >
//               <Ionicons name="create-outline" size={16} color="#FFFFFF" />
//               <Text style={styles.buttonText}>Modifier</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.deleteButton}
//               onPress={() => confirmDelete(item.id)}
//             >
//               <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
//               <Text style={styles.buttonText}>Supprimer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </View>
//   ), []);

//   const toggleSidebar = useCallback(() => {
//     setIsSidebarOpen((prev) => !prev);
//   }, []);

//   const deleteReport = useCallback(async (reportId: number) => {
//     try {
//       const response = await fetch(`${API_URL}/reports/${reportId}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) {
//         throw new Error("Erreur lors de la suppression du signalement.");
//       }

//       setReports((prevReports) =>
//         prevReports.filter((report) => report.id !== reportId)
//       );
//       Alert.alert("Succès", "Signalement supprimé avec succès");
//     } catch (error) {
//       console.error("Erreur lors de la suppression du signalement :", error);
//       Alert.alert(
//         "Erreur",
//         "Impossible de supprimer le signalement. Veuillez réessayer."
//       );
//     }
//   }, []);

//   const confirmDelete = useCallback((reportId: number) => {
//     Alert.alert(
//       "Confirmer la suppression",
//       "Voulez-vous vraiment supprimer ce signalement ?",
//       [
//         { text: "Annuler", style: "cancel" },
//         {
//           text: "Supprimer",
//           onPress: () => deleteReport(reportId),
//           style: "destructive"
//         },
//       ]
//     );
//   }, [deleteReport]);

//   const openModal = useCallback((report: Report) => {
//     setCurrentReport(report);
//     setIsAddressValidated(true); // Si on modifie un rapport existant, l'adresse est déjà validée
//     setIsModalVisible(true);
//   }, []);

//   const closeModal = useCallback(() => {
//     setIsModalVisible(false);
//     setCurrentReport(null);
//     setIsAddressValidated(false);
//   }, []);

//   const updateReportHandler = useCallback(async (updatedReport: Report) => {
//     if (!updatedReport) return;

//     setIsSubmitting(true);

//     // Filtrer les propriétés non nécessaires pour l'API
//     const { id, createdAt, votes, trustRate, distance, ...filteredReport } = updatedReport;

//     try {
//       const response = await fetch(`${API_URL}/reports/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(filteredReport),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Erreur du serveur :", errorText);
//         throw new Error("Erreur lors de la mise à jour du signalement.");
//       }

//       const data = await response.json();

//       setReports((prevReports) =>
//         prevReports.map((report) => (report.id === id ? data : report))
//       );

//       Alert.alert("Succès", "Signalement mis à jour avec succès");
//       closeModal();
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour :", error);
//       Alert.alert("Erreur", "Impossible de mettre à jour le signalement");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }, [closeModal]);

//   const handleUseLocation = useCallback(async () => {
//     if (locationLoading) {
//       Alert.alert("Chargement", "Récupération de votre position en cours...");
//       return;
//     }

//     if (!location) {
//       Alert.alert(
//         "Erreur",
//         "Impossible de récupérer votre position. Vérifiez vos permissions GPS."
//       );
//       return;
//     }

//     try {
//       const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPEN_CAGE_API_KEY}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.results && data.results.length > 0) {
//         const address = data.results[0].formatted;
//         setSuggestions(data.results);
//         setModalVisible(true);
//       } else {
//         Alert.alert("Erreur", "Impossible de déterminer l'adresse exacte.");
//       }
//     } catch (error) {
//       console.error("Erreur lors du reverse geocoding :", error);
//       Alert.alert(
//         "Erreur",
//         "Une erreur est survenue lors de la récupération de l'adresse."
//       );
//     }
//   }, [location, locationLoading]);

//   const handleAddressSearch = useCallback(async (city: string) => {
//     if (!city || !city.trim()) {
//       Alert.alert("Erreur", "Veuillez entrer une adresse à rechercher");
//       return;
//     }

//     try {
//       const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
//         city
//       )}&key=${OPEN_CAGE_API_KEY}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data.results && data.results.length > 0) {
//         const sortedSuggestions = data.results.sort((a, b) => {
//           const postalA = extractPostalCode(a.formatted);
//           const postalB = extractPostalCode(b.formatted);
//           return postalA - postalB;
//         });

//         setSuggestions(sortedSuggestions);
//         setModalVisible(true);
//       } else {
//         setSuggestions([]);
//         Alert.alert("Erreur", "Aucune adresse correspondante trouvée.");
//       }
//     } catch (error) {
//       console.error("Erreur lors de la recherche de l'adresse :", error);
//       Alert.alert("Erreur", "Impossible de rechercher l'adresse.");
//     }
//   }, []);

//   const extractPostalCode = useCallback((address: string) => {
//     const postalCodeMatch = address.match(/\b\d{5}\b/);
//     return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity;
//   }, []);

//   const handleSuggestionSelect = useCallback((item: any) => {
//     if (!currentReport) return;

//     if (item.geometry) {
//       const { lat, lng } = item.geometry;

//       const formattedCity = item.formatted.replace(
//         /unnamed road/g,
//         "Route inconnue"
//       );

//       setCurrentReport({
//         ...currentReport,
//         city: formattedCity,
//         latitude: lat,
//         longitude: lng,
//       });

//       setIsAddressValidated(true);

//       if (mapRef.current) {
//         mapRef.current.animateToRegion(
//           {
//             latitude: lat,
//             longitude: lng,
//             latitudeDelta: 0.005,
//             longitudeDelta: 0.005,
//           },
//           1000
//         );
//       }
//     }

//     setModalVisible(false);
//   }, [currentReport]);

//   const isValidInput = useCallback(() => {
//     return (
//       (currentReport?.title?.trim().length ?? 0) > 4 &&
//       (currentReport?.description?.trim().length ?? 0) > 4
//     );
//   }, [currentReport]);

//   const getValidationErrors = useCallback((): string[] => {
//     const errors: string[] = [];
//     if (!isAddressValidated) {
//       errors.push(
//         "Veuillez sélectionner une adresse en recherchant dans la liste."
//       );
//     }
//     if ((currentReport?.title?.trim().length ?? 0) <= 4) {
//       errors.push("Le titre doit contenir au moins 5 caractères.");
//     }
//     if ((currentReport?.description?.trim().length ?? 0) <= 4) {
//       errors.push("La description doit contenir au moins 5 caractères.");
//     }
//     return errors;
//   }, [isAddressValidated, currentReport]);

//   // Rendu conditionnel pour l'état de chargement
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={COLORS.primary} />
//         <Text style={styles.loadingText}>Chargement des signalements...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={COLORS.primary}
//         translucent
//       />

//       {/* Header modernisé */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.headerIcon}
//           onPress={toggleSidebar}
//           hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
//         >
//           <Ionicons name="menu-outline" size={24} color={COLORS.text.light} />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>MES SIGNALEMENTS</Text>

//         <TouchableOpacity
//           style={styles.headerIcon}
//           onPress={() => navigation.navigate("NotificationsScreen")}
//           hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
//         >
//           <View>
//             <Ionicons name="notifications-outline" size={24} color={COLORS.text.light} />
//             {unreadCount > 0 && (
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Contenu principal */}
//       <View style={styles.content}>
//         {reports.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Ionicons name="document-text-outline" size={70} color="#CCCCCC" />
//             <Text style={styles.emptyTitle}>Aucun signalement</Text>
//             <Text style={styles.emptySubtitle}>
//               Vous n'avez pas encore créé de signalement
//             </Text>
//             <TouchableOpacity
//               style={styles.emptyButton}
//               onPress={() => navigation.navigate("CreateReportScreen")}
//             >
//               <Text style={styles.emptyButtonText}>Créer un signalement</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <FlatList
//             data={reports}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id.toString()}
//             contentContainerStyle={styles.listContainer}
//             showsVerticalScrollIndicator={false}
//           />
//         )}
//       </View>

//       {/* Modal de modification - Amélioration du scroll et du keyboard */}
//       <Modal
//         visible={isModalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={closeModal}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           style={styles.modalContainer}
//         >
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Modifier le signalement</Text>
//               <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
//                 <Ionicons name="close" size={24} color={COLORS.text.primary} />
//               </TouchableOpacity>
//             </View>

//             {/* Barre de défilement réparée */}
//             <ScrollView
//               style={styles.modalScroll}
//               contentContainerStyle={styles.modalScrollContent}
//               showsVerticalScrollIndicator={true}
//               nestedScrollEnabled={true}
//             >
//               {/* Titre */}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Titre</Text>
//                 <View style={styles.inputContainer}>
//                   <Ionicons name="bookmark-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
//                   <TextInput
//                     style={styles.input}
//                     placeholder="Titre du signalement"
//                     placeholderTextColor="#AAAAAA"
//                     value={currentReport?.title || ""}
//                     onChangeText={(text) =>
//                       setCurrentReport(prev => prev ? {...prev, title: text} : null)
//                     }
//                     maxLength={100}
//                   />
//                 </View>
//               </View>

//               {/* Description */}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Description</Text>
//                 <View style={[styles.inputContainer, styles.textAreaContainer]}>
//                   <Ionicons
//                     name="create-outline"
//                     size={20}
//                     color="#AAAAAA"
//                     style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 10}]}
//                   />
//                   <TextInput
//                     style={styles.textArea}
//                     placeholder="Description du problème"
//                     placeholderTextColor="#AAAAAA"
//                     value={currentReport?.description || ""}
//                     onChangeText={(text) =>
//                       setCurrentReport(prev => prev ? {...prev, description: text} : null)
//                     }
//                     multiline
//                     textAlignVertical="top"
//                   />
//                 </View>
//               </View>

//               {/* Localisation - Corrigé pour prendre toute la largeur */}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Adresse</Text>
//                 <View style={styles.locationContainer}>
//                   <View style={styles.addressInputWrapper}>
//                     <View style={styles.inputContainer}>
//                       <Ionicons name="location-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
//                       <TextInput
//                         style={styles.input}
//                         placeholder="Adresse du signalement"
//                         placeholderTextColor="#AAAAAA"
//                         value={currentReport?.city || ""}
//                         onChangeText={(text) => {
//                           setCurrentReport(prev => prev ? {...prev, city: text} : null);
//                           setIsAddressValidated(false);
//                         }}
//                       />
//                     </View>
//                   </View>

//                   <View style={styles.locationButtons}>
//                     <TouchableOpacity
//                       style={styles.searchButton}
//                       onPress={() => currentReport && handleAddressSearch(currentReport.city)}
//                     >
//                       <Ionicons name="search" size={18} color="#FFF" />
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.locationButton}
//                       onPress={handleUseLocation}
//                     >
//                       <Ionicons name="locate" size={18} color="#FFF" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>

//                 {isAddressValidated && (
//                   <View style={styles.validatedAddressContainer}>
//                     <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
//                     <Text style={styles.validatedAddressText}>Adresse validée</Text>
//                   </View>
//                 )}
//               </View>

//               {/* Carte - Ajoutée pour visualiser la position */}
//               {currentReport?.latitude && currentReport?.longitude && (
//                 <View style={styles.mapContainer}>
//                   <MapView
//                     ref={mapRef}
//                     style={styles.map}
//                     initialRegion={{
//                       latitude: currentReport.latitude,
//                       longitude: currentReport.longitude,
//                       latitudeDelta: 0.005,
//                       longitudeDelta: 0.005,
//                     }}
//                   >
//                     <Marker
//                       coordinate={{
//                         latitude: currentReport.latitude,
//                         longitude: currentReport.longitude,
//                       }}
//                       pinColor="red"
//                       title="Position sélectionnée"
//                     />
//                   </MapView>
//                 </View>
//               )}

//               {/* Photos */}
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Photos</Text>
//                 <PhotoManager
//                   photos={
//                     currentReport?.photos?.map((photo) => ({
//                       uri: photo.url
//                     })) || []
//                   }
//                   setPhotos={(newPhotos) => {
//                     setCurrentReport(prev => prev ? {
//                       ...prev,
//                       photos: newPhotos.map((photo) => ({
//                         url: photo.uri
//                       }))
//                     } : null);
//                   }}
//                 />
//               </View>

//               {/* Actions */}
//               <View style={styles.modalActions}>
//                 <TouchableOpacity
//                   style={[
//                     styles.saveButton,
//                     (!isAddressValidated || !isValidInput() || isSubmitting) && styles.disabledButton
//                   ]}
//                   onPress={() => {
//                     if (isAddressValidated && isValidInput() && !isSubmitting && currentReport) {
//                       updateReportHandler(currentReport);
//                     } else if (!isSubmitting) {
//                       const errors = getValidationErrors();
//                       Alert.alert("Validation requise", errors.join("\n"));
//                     }
//                   }}
//                   disabled={!isAddressValidated || !isValidInput() || isSubmitting}
//                 >
//                   {isSubmitting ? (
//                     <ActivityIndicator color="#FFFFFF" size="small" />
//                   ) : (
//                     <>
//                       <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
//                       <Text style={styles.actionButtonText}>Enregistrer</Text>
//                     </>
//                   )}
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={closeModal}
//                   disabled={isSubmitting}
//                 >
//                   <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
//                   <Text style={styles.actionButtonText}>Annuler</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>

//       {/* Modal d'adresses - Amélioré pour une meilleure expérience */}
//       <Modal
//         visible={modalVisible}
//         animationType="fade"
//         transparent={true}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.suggestionsContainer}>
//           <View style={styles.suggestionsContent}>
//             <View style={styles.suggestionsHeader}>
//               <Text style={styles.suggestionsTitle}>Sélectionnez une adresse</Text>
//               <TouchableOpacity
//                 style={styles.closeSuggestionsButton}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Ionicons name="close" size={24} color={COLORS.text.primary} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               style={styles.suggestionsList}
//               contentContainerStyle={suggestions.length === 0 ? styles.emptyContentContainer : null}
//             >
//               {suggestions.length === 0 ? (
//                 <Text style={styles.noSuggestionsText}>Aucune adresse trouvée</Text>
//               ) : (
//                 suggestions.map((item, index) => (
//                   <TouchableOpacity
//                     key={`${item.formatted}-${index}`}
//                     style={styles.suggestionItem}
//                     onPress={() => handleSuggestionSelect(item)}
//                   >
//                     <Ionicons name="location" size={20} color={COLORS.primary} style={{marginRight: 10}} />
//                     <Text style={styles.suggestionText}>{item.formatted}</Text>
//                   </TouchableOpacity>
//                 ))
//               )}
//             </ScrollView>

//             <TouchableOpacity
//               style={styles.closeModalFullButton}
//               onPress={() => setModalVisible(false)}
//             >
//               <Text style={styles.closeModalButtonText}>Fermer</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Floating Action Button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => navigation.navigate("CreateReportScreen")}
//       >
//         <Ionicons name="add" size={24} color="#FFFFFF" />
//       </TouchableOpacity>

//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },

//   // État de chargement
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: COLORS.text.secondary,
//   },

//   // Header styles
//   header: {
//     backgroundColor: COLORS.primary,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: Platform.OS === 'ios' ? 50 : 40,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   headerIcon: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.1)",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.text.light,
//     letterSpacing: 1,
//   },
//   badge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     backgroundColor: COLORS.danger,
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: COLORS.primary,
//   },
//   badgeText: {
//     color: "#FFFFFF",
//     fontSize: 10,
//     fontWeight: "bold",
//   },

//   // Content styles
//   content: {
//     flex: 1,
//   },
//   listContainer: {
//     padding: 16,
//     paddingBottom: 80, // Add space for FAB
//   },

//   // Report card styles
//   reportCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   reportCardTouchable: {
//     backgroundColor: COLORS.card,
//   },
//   statusIndicator: {
//     height: 4,
//     backgroundColor: COLORS.secondary,
//   },
//   reportCardContent: {
//     padding: 16,
//   },
//   reportCardMainSection: {
//     flexDirection: "row",
//   },
//   imageContainer: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//     overflow: "hidden",
//     backgroundColor: "#F5F5F5",
//   },
//   placeholderContainer: {
//     width: "100%",
//     height: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F5F5F5",
//   },
//   reportImage: {
//     width: "100%",
//     height: "100%",
//   },
//   reportInfo: {
//     flex: 1,
//     marginLeft: 16,
//   },
//   reportTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: COLORS.text.primary,
//     marginBottom: 4,
//   },
//   reportDate: {
//     fontSize: 12,
//     color: COLORS.text.secondary,
//     marginBottom: 6,
//   },
//   reportDescription: {
//     fontSize: 14,
//     color: COLORS.text.secondary,
//     lineHeight: 20,
//   },
//   reportActions: {
//     flexDirection: "row",
//     marginTop: 16,
//   },
//   editButton: {
//     backgroundColor: COLORS.secondary,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   deleteButton: {
//     backgroundColor: COLORS.danger,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "500",
//     marginLeft: 6,
//   },

//   // Empty state
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 32,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: COLORS.text.primary,
//     marginTop: 16,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: COLORS.text.secondary,
//     textAlign: "center",
//     marginTop: 8,
//   },
//   emptyButton: {
//     backgroundColor: COLORS.primary,
//     marginTop: 24,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   emptyButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },

//   // Modal styles - Améliorations pour résoudre les problèmes de scroll
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "flex-end",
//   },
//   modalContent: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//     maxHeight: "90%",
//   },
//   modalHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderBottomWidth: 1,
//     borderBottomColor: "#EFEFEF",
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.text.primary,
//   },
//   closeModalButton: {
//     padding: 4,
//     height: 40,
//     width: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   modalScroll: {
//     maxHeight: height * 0.8, // Limite la hauteur du scroll à 80% de l'écran
//   },
//   modalScrollContent: {
//     padding: 16,
//     paddingBottom: 40, // Ajoute un espace en bas du scroll
//   },

//   // Form styles - Optimisations
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: COLORS.text.primary,
//     marginBottom: 8,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F8F8",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#EFEFEF",
//     height: 50,
//     paddingHorizontal: 12,
//   },
//   inputIcon: {
//     marginRight: 8,
//   },
//   input: {
//     flex: 1,
//     height: "100%",
//     fontSize: 16,
//     color: COLORS.text.primary,
//   },
//   textAreaContainer: {
//     height: 120,
//     alignItems: "flex-start",
//     paddingVertical: 10,
//   },
//   textArea: {
//     flex: 1,
//     fontSize: 16,
//     color: COLORS.text.primary,
//     textAlignVertical: "top",
//     height: "100%",
//     width: "100%",
//   },

//   // Location styles - CORRIGÉ pour la mise en page de l'adresse
//   locationContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: '100%',
//   },
//   addressInputWrapper: {
//     flex: 1, // Prend tout l'espace disponible
//   },
//   locationButtons: {
//     flexDirection: "row",
//     marginLeft: 8,
//   },
//   searchButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   locationButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 8,
//     backgroundColor: COLORS.secondary,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   validatedAddressContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//   },
//   validatedAddressText: {
//     fontSize: 13,
//     color: COLORS.success,
//     marginLeft: 6,
//   },

//   // Carte dans le modal
//   mapContainer: {
//     height: 200,
//     marginBottom: 20,
//     borderRadius: 8,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#EFEFEF',
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },

//   // Action buttons
//   modalActions: {
//     marginVertical: 16,
//   },
//   saveButton: {
//     backgroundColor: COLORS.success,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   cancelButton: {
//     backgroundColor: COLORS.danger,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 14,
//     borderRadius: 8,
//   },
//   actionButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   disabledButton: {
//     backgroundColor: "#BBBBBB",
//   },

//   // Suggestions modal - Amélioré pour une meilleure expérience utilisateur
//   suggestionsContainer: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//   },
//   suggestionsContent: {
//     width: "100%",
//     maxHeight: "80%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   suggestionsHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderBottomWidth: 1,
//     borderBottomColor: "#EFEFEF",
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//   },
//   suggestionsTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: COLORS.text.primary,
//   },
//   closeSuggestionsButton: {
//     padding: 4,
//     height: 40,
//     width: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   suggestionsList: {
//     maxHeight: height * 0.5, // Limite la hauteur de la liste
//   },
//   suggestionItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#EFEFEF",
//   },
//   suggestionText: {
//     flex: 1,
//     fontSize: 14,
//     color: COLORS.text.primary,
//   },
//   emptyContentContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 150,
//   },
//   noSuggestionsText: {
//     fontSize: 16,
//     color: COLORS.text.secondary,
//     textAlign: 'center',
//   },
//   closeModalFullButton: {
//     backgroundColor: COLORS.primary,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginHorizontal: 16,
//     marginVertical: 16,
//     borderRadius: 8,
//   },
//   closeModalButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   // FAB
//   fab: {
//     position: "absolute",
//     right: 20,
//     bottom: 20,
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: COLORS.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 6,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//   },
// });
