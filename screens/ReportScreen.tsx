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
import { useToken } from "../hooks/useToken";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";
import PhotoManager from "../components/PhotoManager";
import { useLocation } from "../hooks/useLocation";
import MapView from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

export default function ReportScreen({ navigation }) {
  const { unreadCount } = useNotification();
  const [reports, setReports] = useState<
    { id: number; title: string; description: string; createdAt: string }[]
  >([]);
  const { getUserId } = useToken();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const { location, loading } = useLocation();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);
  const [isAddressValidated, setIsAddressValidated] = useState(false);

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
        console.log("Données des rapports récupérées :", data);
        setReports(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rapports :", error);
      }
    };

    fetchUserReports();
  }, [currentReport]); // Dépendance ajoutée

  type Report = {
    id: number;
    title: string;
    description: string;
    city: string;
    createdAt: string;
    updatedAt?: string; // facultatif
    photos?: { url: string }[]; // facultatif
  };

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

      // Supprimer localement le signalement de la liste
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

    // Log des photos envoyées
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

        setSuggestions(data.results); // Remplit les suggestions avec les résultats
        setModalVisible(true); // Ouvre directement la liste des suggestions
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
        // Trier les suggestions par code postal
        const sortedSuggestions = data.results.sort((a, b) => {
          const postalA = extractPostalCode(a.formatted);
          const postalB = extractPostalCode(b.formatted);
          return postalA - postalB; // Trie croissant
        });

        setSuggestions(sortedSuggestions); // Affiche les suggestions triées
        setModalVisible(true); // Ouvre la liste des résultats
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
    const postalCodeMatch = address.match(/\b\d{5}\b/); // Recherche un code postal à 5 chiffres
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity; // Infinity si pas de code postal
  };

  const handleSuggestionSelect = (item: any) => {
    if (item.geometry) {
      const { lat, lng } = item.geometry;

      // Traite le texte de la ville pour remplacer "Unnamed Road"
      const formattedCity = item.formatted.replace(
        /unnamed road/g,
        "Route inconnue"
      );

      // Met à jour le rapport avec l'adresse sélectionnée
      setCurrentReport((prevReport) => {
        if (!prevReport) return prevReport;
        return {
          ...prevReport,
          city: formattedCity, // Utilise la version formatée de la ville
          latitude: lat,
          longitude: lng,
        };
      });

      // Valide l'adresse
      setIsAddressValidated(true);

      // Zoom sur la nouvelle région
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
            size={28}
            color="#CBCBCB" // Couleur dorée
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
              size={28}
              color={unreadCount > 0 ? "#CBCBCB" : "#CBCBCB"}
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
                    setIsAddressValidated(false); // Réinitialise la validation
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
                  currentReport?.photos?.map((photo) => {
                    // Assurez-vous que chaque photo a une propriété `uri` attendue par `Image`
                    return { uri: photo.url };
                  }) || []
                }
                setPhotos={(newPhotos) => {
                  setCurrentReport({
                    ...currentReport,
                    photos: newPhotos.map((photo) => ({
                      // Transformez les nouvelles photos en objets avec `url` si nécessaire
                      url: photo.uri || photo.url,
                    })),
                  } as Report);
                }}
              />

              {/* Bouton Enregistrer */}
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isAddressValidated || !isValidInput()) &&
                    styles.disabledButton, // Désactiver si invalide
                ]}
                onPress={() => {
                  if (isAddressValidated && isValidInput()) {
                    updateReportHandler(currentReport);
                  } else {
                    const errors = getValidationErrors();
                    Alert.alert(
                      "Validation requise",
                      errors.join("\n") // Affiche toutes les erreurs sur des lignes séparées
                    );
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

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
    backgroundColor: "#535353", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
    fontFamily: "Starborn",
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#CBCBCB",
    textAlign: "center",
    marginBottom: 10,
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
    width: "100%", // Prend toute la largeur du conteneur
    height: 200, // Hauteur fixe
    borderRadius: 8, // Coins arrondis
    marginBottom: 8, // Espacement avec les autres éléments
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
    backgroundColor: "#FF9800", // Vert moderne pour un bouton positif
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Ombre pour Android
  },
  changeReportText: {
    color: "#FFFFFF", // Texte blanc pour le contraste
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
    height: 50, // Hauteur fixe (peut être ajustée)
    maxHeight: 50, // Empêche l'agrandissement vertical
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingLeft: 30,
    marginBottom: 25, // Espacement avec l'élément suivant
    fontSize: 16,
    color: "#333",
    overflow: "hidden", // Empêche le débordement
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingVertical: 10, // Ajustez en fonction de votre design
    paddingHorizontal: 15,
    paddingLeft: 25,
    paddingTop: 20,
    fontSize: 16,
    color: "#333",
    overflow: "hidden", // Empêche le débordement
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
    height: 50, // Assurez une hauteur uniforme
    textAlignVertical: "center", // Centre le texte verticalement
    paddingHorizontal: 10, // Ajoute un espace pour le texte à gauche et à droite
    paddingLeft: 20, // Ajoutez un espacement à gauche

    backgroundColor: "#f5f5f5",
    width: "65%",
    borderRadius: 30, // Ajoutez un arrondi aux coins
    fontSize: 16, // Ajustez la taille de la police
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
    marginLeft: 10, // Espace entre le champ et le bouton
    marginTop: 40,
  },
  rowButtonLocation: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDAE49",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10, // Espace entre le champ et le bouton
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    paddingVertical: 50,
    justifyContent: "center", // Centre verticalement
    alignItems: "center", // Centre horizontalement
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
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
