// Chemin : frontend/screens/ReportScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
// @ts-ignore
import { API_URL, OPEN_CAGE_API_KEY } from "@env";
import { useToken } from "../hooks/auth/useToken";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/common/Sidebar";
import PhotoManager from "../components/interactions/PhotoManager";
import { useLocation } from "../hooks/location/useLocation";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { useUserProfile } from "../hooks/user/useUserProfile";

// Constantes pour le design system
const { width, height } = Dimensions.get("window");
const COLORS = {
  primary: "#062C41",
  secondary: "#1B5D85",
  danger: "#f44336",
  success: "#4CAF50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E0E0E0",
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#FFFFFF",
    muted: "#999999",
  },
};

// Interfaces
interface Report {
  id: number;
  title: string;
  description: string;
  city: string;
  createdAt: string;
  updatedAt?: string;
  photos?: { url: string }[];
  latitude?: number;
  longitude?: number;
  votes?: number;
  trustRate?: number;
  distance?: number;
}

interface AddressSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

export default function ReportScreen({ navigation }: { navigation: any }) {
  const { unreadCount } = useNotification();
  const { location, loading: locationLoading } = useLocation();
  
  // ✅ CORRECTION 1: Utilisation du bon type pour la référence de MapView
  // Au lieu de <MapView>, on utilise React.ElementRef<typeof MapView>
  const mapRef = useRef<any>(null);
  
  const { getUserId } = useToken();

  // États
  const [reports, setReports] = useState<Report[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
    
  // Chargement des données au démarrage
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoading(true);
        const userId = await getUserId();
        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        const response = await fetch(`${API_URL}/reports?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rapports :", error);
        Alert.alert(
          "Erreur",
          "Impossible de charger vos signalements. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, []);

  // Functions
  const dummyFn = () => {};

  // Rendu de chaque élément de rapport
  const renderItem = useCallback(({ item }: { item: Report }) => (
    <View style={styles.reportCard}>
      <TouchableOpacity
        style={styles.reportCardTouchable}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("ReportDetailsScreen", { reportId: item.id })}
      >
        {/* Indicateur visuel de statut */}
        <View style={styles.statusIndicator} />

        <View style={styles.reportCardContent}>
          {/* Section image et informations principales */}
          <View style={styles.reportCardMainSection}>
            {/* Affichage de l'image avec placeholder si besoin */}
            <View style={styles.imageContainer}>
              {Array.isArray(item.photos) && item.photos.length > 0 ? (
                <Image
                  source={{ uri: item.photos[0].url }}
                  style={styles.reportImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={24} color="#CCCCCC" />
                </View>
              )}
            </View>

            {/* Informations textuelles */}
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.reportDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.reportDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.reportActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => openModal(item)}
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  ), []);

  // Gestion du sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Suppression d'un signalement
  const deleteReport = useCallback(async (reportId: number) => {
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
      Alert.alert("Succès", "Signalement supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du signalement :", error);
      Alert.alert(
        "Erreur",
        "Impossible de supprimer le signalement. Veuillez réessayer."
      );
    }
  }, []);

  // Confirmation de suppression
  const confirmDelete = useCallback((reportId: number) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer ce signalement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => deleteReport(reportId),
          style: "destructive"
        },
      ]
    );
  }, [deleteReport]);

  // Ouverture du modal de modification
  const openModal = useCallback((report: Report) => {
    setCurrentReport(report);
    setIsAddressValidated(true); // Si on modifie un rapport existant, l'adresse est déjà validée
    setIsModalVisible(true);
  }, []);

  // Fermeture du modal de modification
  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setCurrentReport(null);
    setIsAddressValidated(false);
    // Assurez-vous que le modal de suggestion est également fermé lors de la fermeture du modal principal
    setModalVisible(false);
  }, []);

  // Mise à jour d'un signalement
  const updateReportHandler = useCallback(async (updatedReport: Report) => {
    if (!updatedReport) return;

    setIsSubmitting(true);

    // Filtrer les propriétés non nécessaires pour l'API
    const { id, createdAt, votes, trustRate, distance, ...filteredReport } = updatedReport;

    try {
      const response = await fetch(`${API_URL}/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredReport),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur du serveur :", errorText);
        throw new Error("Erreur lors de la mise à jour du signalement.");
      }

      const data = await response.json();

      setReports((prevReports) =>
        prevReports.map((report) => (report.id === id ? data : report))
      );

      Alert.alert("Succès", "Signalement mis à jour avec succès");
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le signalement");
    } finally {
      setIsSubmitting(false);
    }
  }, [closeModal]);

  // Utilisation de la position actuelle
  const handleUseLocation = useCallback(async () => {
    if (locationLoading) {
      Alert.alert("Chargement", "Récupération de votre position en cours...");
      return;
    }

    if (!location) {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer votre position. Vérifiez vos permissions GPS."
      );
      return;
    }

    // D'abord ouvrir le modal avec l'indicateur de chargement
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setModalVisible(true);
    
    try {
      // Attendre un court délai pour garantir que le modal s'affiche avec le loader
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPEN_CAGE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
        Alert.alert("Erreur", "Impossible de déterminer l'adresse exacte.");
      }
    } catch (error) {
      console.error("Erreur lors du reverse geocoding :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la récupération de l'adresse."
      );
      setModalVisible(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [location, locationLoading]);

  // Recherche d'adresse
  const handleAddressSearch = useCallback(async (city: string) => {
    if (!city || !city.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une adresse à rechercher");
      return;
    }

    // D'abord ouvrir le modal avec l'indicateur de chargement
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setModalVisible(true);
    
    try {
      // Attendre un court délai pour garantir que le modal s'affiche avec le loader
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        city
      )}&key=${OPEN_CAGE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // ✅ CORRECTION 2 & 3: Ajout du type explicite AddressSuggestion pour a et b
        const sortedSuggestions = data.results.sort((a: AddressSuggestion, b: AddressSuggestion) => {
          const postalA = extractPostalCode(a.formatted);
          const postalB = extractPostalCode(b.formatted);
          return postalA - postalB;
        });

        setSuggestions(sortedSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Erreur lors de la recherche de l'adresse :", error);
      Alert.alert("Erreur", "Impossible de rechercher l'adresse.");
      setModalVisible(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Extraction du code postal
  const extractPostalCode = useCallback((address: string) => {
    const postalCodeMatch = address.match(/\b\d{5}\b/);
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity;
  }, []);

  // Sélection d'une suggestion d'adresse
  const handleSuggestionSelect = useCallback((item: AddressSuggestion) => {
    if (!currentReport) return;

    if (item.geometry) {
      const { lat, lng } = item.geometry;

      const formattedCity = item.formatted.replace(
        /unnamed road/g,
        "Route inconnue"
      );

      setCurrentReport({
        ...currentReport,
        city: formattedCity,
        latitude: lat,
        longitude: lng,
      });

      setIsAddressValidated(true);

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          },
          1000
        );
      }
    }

    setModalVisible(false);
  }, [currentReport]);

  // Validation des entrées
  const isValidInput = useCallback(() => {
    return (
      (currentReport?.title?.trim().length ?? 0) > 4 &&
      (currentReport?.description?.trim().length ?? 0) > 4
    );
  }, [currentReport]);

  // Obtention des erreurs de validation
  const getValidationErrors = useCallback((): string[] => {
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
  }, [isAddressValidated, currentReport]);

  // Rendu conditionnel pour l'état de chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des signalements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />

      {/* Header modernisé */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={toggleSidebar}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.8}
        >
          <Ionicons name="menu-outline" size={26} color={COLORS.text.light} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MES SIGNALEMENTS</Text>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate("NotificationsScreen")}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.8}
        >
          <View>
            <Ionicons name="notifications-outline" size={26} color={COLORS.text.light} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={90} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Aucun signalement</Text>
            <Text style={styles.emptySubtitle}>
              Vous n'avez pas encore créé de signalement dans votre espace personnel
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("CreateReportScreen")}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Créer un signalement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>

      {/* Modal de modification */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le signalement</Text>
              <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {/* Titre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="bookmark-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Titre du signalement"
                    placeholderTextColor="#AAAAAA"
                    value={currentReport?.title || ""}
                    onChangeText={(text) =>
                      setCurrentReport(prev => prev ? {...prev, title: text} : null)
                    }
                    maxLength={100}
                  />
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <Ionicons
                    name="create-outline"
                    size={20}
                    color="#AAAAAA"
                    style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 10}]}
                  />
                  <TextInput
                    style={styles.textArea}
                    placeholder="Description du problème"
                    placeholderTextColor="#AAAAAA"
                    value={currentReport?.description || ""}
                    onChangeText={(text) =>
                      setCurrentReport(prev => prev ? {...prev, description: text} : null)
                    }
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Localisation */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse</Text>
                <View style={styles.locationContainer}>
                  <View style={styles.addressInputWrapper}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Adresse du signalement"
                        placeholderTextColor="#AAAAAA"
                        value={currentReport?.city || ""}
                        onChangeText={(text) => {
                          if (currentReport) {
                            // Mise à jour du texte sans ouvrir le modal
                            setCurrentReport({...currentReport, city: text});
                            
                            // Ne réinitialise l'état de validation que si le texte change vraiment
                            if (text !== currentReport.city) {
                              setIsAddressValidated(false);
                            }
                          }
                        }}
                        // Désactiver l'auto-correction et les suggestions pour éviter les problèmes
                        autoCorrect={false}
                        autoCapitalize="none"
                        // Désactiver la soumission automatique
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <View style={styles.locationButtons}>
                    <TouchableOpacity
                      style={styles.searchButton}
                      onPress={() => {
                        if (currentReport && currentReport.city.trim()) {
                          handleAddressSearch(currentReport.city);
                        } else {
                          Alert.alert("Erreur", "Veuillez entrer une adresse à rechercher");
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="search" size={18} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.locationButton}
                      onPress={handleUseLocation}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="locate" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {isAddressValidated ? (
                    <>
                    <View style={styles.validatedAddressContainer}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.validatedAddressText}>Adresse validée</Text>
                      </View>
                    </>
                  ) : (
                    <>
                    <View style={styles.validatedAddressContainer}>
                      <Ionicons name="close-circle" size={16} color={COLORS.danger} />
                      <Text style={styles.invalidAddressText}>Adresse non validée</Text>
                      </View>
                    </>
                  )}
              </View>

              {/* Carte */}
              {currentReport?.latitude && currentReport?.longitude && (
                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                      latitude: currentReport.latitude,
                      longitude: currentReport.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: currentReport.latitude,
                        longitude: currentReport.longitude,
                      }}
                      pinColor="red"
                      title="Position sélectionnée"
                    />
                  </MapView>
                </View>
              )}

              {/* Photos */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Photos</Text>
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
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!isAddressValidated || !isValidInput() || isSubmitting) && styles.disabledButton
                  ]}
                  onPress={() => {
                    if (isAddressValidated && isValidInput() && !isSubmitting && currentReport) {
                      updateReportHandler(currentReport);
                    } else if (!isSubmitting) {
                      const errors = getValidationErrors();
                      Alert.alert("Validation requise", errors.join("\n"));
                    }
                  }}
                  disabled={!isAddressValidated || !isValidInput() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                      <Text style={styles.actionButtonText}>Enregistrer</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={isSubmitting}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                  <Text style={styles.actionButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {/* Modal d'adresses - Maintenant à l'intérieur du modal principal pour un meilleur z-index */}
        {modalVisible && (
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.addressModalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.suggestionsContent}>
                  <View style={styles.suggestionsHeader}>
                    <Text style={styles.suggestionsTitle}>Sélectionnez une adresse</Text>
                    <TouchableOpacity
                      style={styles.closeSuggestionsButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Ionicons name="close" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    style={styles.suggestionsList}
                    contentContainerStyle={suggestions.length === 0 ? styles.emptyContentContainer : null}
                    showsVerticalScrollIndicator={false}
                  >
                    {isLoadingSuggestions && (
                      <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Recherche d'adresses...</Text>
                      </View>
                    )}
                    
                    {!isLoadingSuggestions && suggestions.length === 0 ? (
                      <View style={styles.emptyContentContainer}>
                        <Ionicons name="location-outline" size={56} color="#CCCCCC" />
                        <Text style={styles.noSuggestionsText}>
                          Aucune adresse trouvée pour cette recherche
                        </Text>
                      </View>
                    ) : (
                      !isLoadingSuggestions && suggestions.map((item, index) => (
                        <TouchableOpacity
                          key={`${item.formatted}-${index}`}
                          style={[
                            styles.suggestionItem,
                            index % 2 === 0 ? {backgroundColor: "#FFFFFF"} : {backgroundColor: "#FAFAFA"}
                          ]}
                          onPress={() => handleSuggestionSelect(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.suggestionIconContainer}>
                            <Ionicons name="location" size={20} color="#FFFFFF" />
                          </View>
                          <Text style={styles.suggestionText}>{item.formatted}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>

                  <TouchableOpacity
                    style={styles.closeModalFullButton}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.closeModalButtonText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateReportScreen")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // État de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    height: 200,
  },
  loaderText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },

  // Header styles - modernisés
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === 'ios' ? 55 : 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerIcon: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COLORS.text.light,
    letterSpacing: 1,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  // Content & List styles - améliorés
  content: {
    flex: 1,
    backgroundColor: '#F2F5F8', // Légère teinte bleutée pour le fond
  },
  listContainer: {
    padding: 20,
    paddingBottom: 90, // Espace pour le FAB
  },

  // Report card styles - Nouveau design modernisé
  reportCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  reportCardTouchable: {
    backgroundColor: COLORS.card,
  },
  statusIndicator: {
    height: 5,
    backgroundColor: COLORS.secondary,
    width: '40%',
    borderBottomRightRadius: 8,
  },
  reportCardContent: {
    padding: 16,
  },
  reportCardMainSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  reportImage: {
    width: "100%",
    height: "100%",
  },
  reportInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  reportDate: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 8,
    paddingLeft: 20,
    position: 'relative',
  },
  reportDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 21,
  },
  reportActions: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: COLORS.secondary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: 8,
  },
  emptyButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    paddingVertical: 3,
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },

  // Modal principal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  closeModalButton: {
    padding: 4,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    maxHeight: height * 0.8,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Styles pour l'overlay du modal d'adresses (nouveau)
  addressModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  // Form styles
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    height: 50,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: COLORS.text.primary,
  },
  textAreaContainer: {
    height: 120,
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    textAlignVertical: "top",
    height: "100%",
    width: "100%",
  },
  // Style pour l'icône de suggestion d'adresse
  suggestionIconContainer: {
    width: 32, 
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // Location styles
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
  },
  addressInputWrapper: {
    flex: 1,
  },
  locationButtons: {
    flexDirection: "row",
    marginLeft: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  validatedAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  validatedAddressText: {
    fontSize: 13,
    color: COLORS.success,
    marginLeft: 6,
  },
  invalidAddressText: {
    fontSize: 13,
    color: "red",
    marginLeft: 6,
  },

  // Carte dans le modal
  mapContainer: {
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  map: {
    width: '100%',
    height: '100%',
  },

  // Action buttons
  modalActions: {
    marginVertical: 16,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#BBBBBB",
  },

  // Suggestions modal - Avec z-index élevé et style amélioré
  suggestionsContent: {
    width: width * 0.92,
    maxHeight: height * 0.7,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 1100,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
  },
  suggestionsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  closeSuggestionsButton: {
    padding: 4,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
  },
  suggestionsList: {
    maxHeight: height * 0.5,
    paddingTop: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    paddingHorizontal: 20,
  },
  noSuggestionsText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  closeModalFullButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
});