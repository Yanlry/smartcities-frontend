// Chemin : frontend/screens/EventsScreen.tsx

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
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../styles/screens/EventsScreen.styles";

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

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
  photos?: { url: string }[];
  latitude?: number;
  longitude?: number;
}

interface AddressSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

export default function EventsScreen({ navigation }: { navigation: any }) {
  const { unreadCount } = useNotification();
  const { location, loading: locationLoading } = useLocation();
  const mapRef = useRef<any>(null);
  const { getUserId } = useToken();

  // États
  const [events, setEvents] = useState<Event[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [shouldRefreshEvents, setShouldRefreshEvents] = useState(true);

  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
    
  // Chargement des événements
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        // ✅ On récupère l'userId ICI
        const userId = await getUserId();
        if (!userId) {
          console.error("❌ Impossible de récupérer l'ID utilisateur.");
          Alert.alert(
            "Erreur",
            "Impossible de récupérer vos informations. Veuillez vous reconnecter."
          );
          return;
        }

        console.log("✅ ID utilisateur récupéré:", userId);

        const response = await fetch(`${API_URL}/events?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des événements :", error);
        Alert.alert(
          "Erreur",
          "Impossible de charger vos événements. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
        setShouldRefreshEvents(false);
      }
    };

    if (shouldRefreshEvents) {
      fetchUserEvents();
    }
  }, [shouldRefreshEvents, getUserId]);

  const dummyFn = () => {};

  const renderItem = useCallback(({ item }: { item: Event }) => (
    <View style={styles.eventCard}>
      <TouchableOpacity
        style={styles.eventCardTouchable}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("EventDetailsScreen", { eventId: item.id })}
      >
        <View style={styles.statusIndicator} />

        <View style={styles.eventCardContent}>
          <View style={styles.eventCardMainSection}>
            <View style={styles.imageContainer}>
              {Array.isArray(item.photos) && item.photos.length > 0 ? (
                <Image
                  source={{ uri: item.photos[0].url }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="calendar-outline" size={24} color="#CCCCCC" />
                </View>
              )}
            </View>

            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.eventDate}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>

          <View style={styles.eventActions}>
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // 🔧 FONCTION DE SUPPRESSION CORRIGÉE
  const deleteEvent = useCallback(async (eventId: number) => {
    try {
      console.log("🗑️ Début de la suppression pour l'événement:", eventId);

      // ✅ CORRECTION : On récupère l'userId DIRECTEMENT ici
      const userId = await getUserId();
      
      // ✅ Vérification avec logs détaillés
      if (!userId) {
        console.error("❌ userId est null ou undefined");
        Alert.alert(
          "Erreur d'authentification",
          "Impossible de récupérer vos informations. Veuillez vous reconnecter à l'application.",
          [
            {
              text: "OK",
              onPress: () => {
                // Optionnel : rediriger vers l'écran de connexion
                // navigation.navigate("LoginScreen");
              }
            }
          ]
        );
        return;
      }

      console.log("✅ userId récupéré:", userId);
      console.log("📤 Envoi de la requête DELETE...");

      // ✅ On envoie la requête avec l'userId
      const response = await fetch(`${API_URL}/events/${eventId}?userId=${userId}`, {
        method: "DELETE",
      });

      console.log("📥 Réponse reçue, status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Erreur serveur:", errorData);
        
        if (response.status === 403) {
          Alert.alert(
            "Action interdite",
            "Vous n'êtes pas autorisé à supprimer cet événement. Seul le créateur peut le supprimer."
          );
        } else if (response.status === 404) {
          Alert.alert(
            "Événement introuvable",
            "Cet événement n'existe plus ou a déjà été supprimé."
          );
        } else {
          Alert.alert(
            "Erreur",
            errorData.message || "Une erreur est survenue lors de la suppression."
          );
        }
        return;
      }

      console.log("✅ Événement supprimé avec succès !");

      // ✅ On retire l'événement de la liste
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );

      Alert.alert("Succès", "Événement supprimé avec succès");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      Alert.alert(
        "Erreur réseau",
        "Impossible de supprimer l'événement. Vérifiez votre connexion internet et réessayez."
      );
    }
  }, [getUserId]); // ✅ IMPORTANT : getUserId dans les dépendances

  const confirmDelete = useCallback((eventId: number) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => deleteEvent(eventId),
          style: "destructive"
        },
      ]
    );
  }, [deleteEvent]);

  const openModal = useCallback((event: Event) => {
    setCurrentEvent(event);
    setIsAddressValidated(true);
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setCurrentEvent(null);
    setIsAddressValidated(false);
    setModalVisible(false);
  }, []);

  const updateEventHandler = useCallback(async (updatedEvent: Event) => {
    if (!updatedEvent) return;

    setIsSubmitting(true);

    try {
      const eventData = {
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: new Date(updatedEvent.date).toISOString(),
        location: updatedEvent.location,
        latitude: updatedEvent.latitude,
        longitude: updatedEvent.longitude,
        photos: updatedEvent.photos?.map((photo) => ({
          url: photo.url,
        })),
      };

      const response = await fetch(`${API_URL}/events/${updatedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur du serveur :", errorText);
        throw new Error("Erreur lors de la mise à jour de l'événement.");
      }

      const data = await response.json();

      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === updatedEvent.id ? data : event))
      );

      Alert.alert("Succès", "Événement mis à jour avec succès");
      closeModal();
      setShouldRefreshEvents(true);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour l'événement");
    } finally {
      setIsSubmitting(false);
    }
  }, [closeModal]);

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

    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setModalVisible(true);
    
    try {
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

  const handleAddressSearch = useCallback(async (city: string) => {
    if (!city || !city.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une adresse à rechercher");
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setModalVisible(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        city
      )}&key=${OPEN_CAGE_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
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

  const extractPostalCode = useCallback((address: string) => {
    const postalCodeMatch = address.match(/\b\d{5}\b/);
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity;
  }, []);

  const handleSuggestionSelect = useCallback((item: AddressSuggestion) => {
    if (!currentEvent) return;

    if (item.geometry) {
      const { lat, lng } = item.geometry;

      const formattedLocation = item.formatted.replace(
        /unnamed road/g,
        "Route inconnue"
      );

      setCurrentEvent({
        ...currentEvent,
        location: formattedLocation,
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
  }, [currentEvent]);

  const isValidInput = useCallback(() => {
    return (
      (currentEvent?.title?.trim().length ?? 0) > 4 &&
      (currentEvent?.description?.trim().length ?? 0) > 4 &&
      !!currentEvent?.date &&
      isAddressValidated
    );
  }, [currentEvent, isAddressValidated]);

  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];
    if (!isAddressValidated) {
      errors.push(
        "Veuillez sélectionner une adresse en recherchant dans la liste."
      );
    }
    if ((currentEvent?.title?.trim().length ?? 0) <= 4) {
      errors.push("Le titre doit contenir au moins 5 caractères.");
    }
    if ((currentEvent?.description?.trim().length ?? 0) <= 4) {
      errors.push("La description doit contenir au moins 5 caractères.");
    }
    if (!currentEvent?.date) {
      errors.push("Veuillez sélectionner une date pour l'événement.");
    }
    return errors;
  }, [isAddressValidated, currentEvent]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des événements...</Text>
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

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={toggleSidebar}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.8}
        >
          <Ionicons name="menu-outline" size={26} color={COLORS.text.light} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>MES ÉVÉNEMENTS</Text>

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

      <View style={styles.content}>
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={90} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptySubtitle}>
              Vous n'avez pas encore créé d'événement dans votre espace personnel
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("CreateEventScreen")}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Créer un événement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        )}
      </View>

      {/* Modal de modification - inchangé */}
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
              <Text style={styles.modalTitle}>Modifier l'événement</Text>
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
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Titre</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="bookmark-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Titre de l'événement"
                    placeholderTextColor="#AAAAAA"
                    value={currentEvent?.title || ""}
                    onChangeText={(text) =>
                      setCurrentEvent(prev => prev ? {...prev, title: text} : null)
                    }
                    maxLength={100}
                  />
                </View>
              </View>

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
                    placeholder="Description de l'événement"
                    placeholderTextColor="#AAAAAA"
                    value={currentEvent?.description || ""}
                    onChangeText={(text) =>
                      setCurrentEvent(prev => prev ? {...prev, description: text} : null)
                    }
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date de l'événement</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                  <Text style={styles.datePickerText}>
                    {currentEvent?.date 
                      ? new Date(currentEvent.date).toLocaleString() 
                      : "Sélectionnez une date et heure"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(currentEvent?.date || Date.now())}
                    mode="datetime"
                    display="default"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        setCurrentEvent((prev) =>
                          prev ? { ...prev, date: date.toISOString() } : null
                        );
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Adresse</Text>
                <View style={styles.locationContainer}>
                  <View style={styles.addressInputWrapper}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location-outline" size={20} color="#AAAAAA" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Adresse de l'événement"
                        placeholderTextColor="#AAAAAA"
                        value={currentEvent?.location || ""}
                        onChangeText={(text) => {
                          if (currentEvent) {
                            setCurrentEvent({...currentEvent, location: text});
                            
                            if (text !== currentEvent.location) {
                              setIsAddressValidated(false);
                            }
                          }
                        }}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="done"
                      />
                    </View>
                  </View>

                  <View style={styles.locationButtons}>
                    <TouchableOpacity
                      style={styles.searchButton}
                      onPress={() => {
                        if (currentEvent && currentEvent.location.trim()) {
                          handleAddressSearch(currentEvent.location);
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

                <View style={styles.validatedAddressContainer}>
                  {isAddressValidated ? (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.validatedAddressText}>Adresse validée</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={16} color={COLORS.danger} />
                      <Text style={styles.invalidAddressText}>Adresse non validée</Text>
                    </>
                  )}
                </View>
              </View>

              {currentEvent?.latitude && currentEvent?.longitude && (
                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                      latitude: currentEvent.latitude,
                      longitude: currentEvent.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: currentEvent.latitude,
                        longitude: currentEvent.longitude,
                      }}
                      pinColor="red"
                      title="Position de l'événement"
                    />
                  </MapView>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Photos</Text>
                <PhotoManager
                  photos={
                    currentEvent?.photos?.map((photo, index) => {
                      return { id: index.toString(), uri: photo.url };
                    }) || []
                  }
                  setPhotos={(newPhotos) => {
                    setCurrentEvent({
                      ...currentEvent,
                      photos: newPhotos.map((photo) => ({
                        url: photo.uri || photo.url,
                      })),
                    } as Event);
                  }}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!isValidInput() || isSubmitting) && styles.disabledButton
                  ]}
                  onPress={() => {
                    if (isValidInput() && !isSubmitting && currentEvent) {
                      updateEventHandler(currentEvent);
                    } else if (!isSubmitting) {
                      const errors = getValidationErrors();
                      Alert.alert("Validation requise", errors.join("\n"));
                    }
                  }}
                  disabled={!isValidInput() || isSubmitting}
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateEventScreen")}
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
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
}
