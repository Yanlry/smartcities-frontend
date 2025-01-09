import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  Keyboard,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";
import { useToken } from "../hooks/useToken";
// @ts-ignore
import { API_URL, OPEN_CAGE_API_KEY } from "@env";
import DateTimePicker from "@react-native-community/datetimepicker";
import PhotoManager from "../components/PhotoManager";
import { useLocation } from "../hooks/useLocation";
import MapView from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function EventsScreen({ navigation }) {
  const { unreadCount } = useNotification(); // Récupération du compteur
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState<
    {
      id: number;
      title: string;
      description: string;
      createdAt: string;
      photos: { url: string }[];
    }[]
  >([]);
  const { getUserId } = useToken();
  const { location, loading } = useLocation();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal de modification
  const [currentEvent, setCurrentEvent] = useState<{
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    photos: { url: string }[];
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);


  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        console.log("ID utilisateur récupéré :", userId);
        const response = await fetch(`${API_URL}/events?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        const data = await response.json();
        console.log("Données des événements récupérées :", data);
        setEvents(data); // Met à jour tous les événements
      } catch (error) {
        console.error("Erreur lors de la récupération des événements :", error);
      }
    };

    // Requête lorsque `currentEvent` change
    fetchUserEvents();
  }, [currentEvent]);

  const updateEventHandler = async (updatedEvent) => {
    try {
      const {
        id,
        title,
        description,
        date,
        location,
        latitude,
        longitude,
        photos,
      } = updatedEvent;

      // Préparation des données pour le backend
      const eventData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        photos: photos.map((photo) => ({
          url: photo.uri || photo.url, // Assurez-vous d'envoyer les URLs
        })),
      };

      console.log("Données envoyées au backend :", eventData);

      // Requête PUT pour la mise à jour
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Erreur backend :", errorDetails);
        throw new Error("Erreur lors de la mise à jour de l'événement.");
      }

      // Récupération des données mises à jour
      const updatedEventData = await response.json();

      console.log("Événement mis à jour :", updatedEventData);

      // Mise à jour locale des événements dans le state
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === id ? updatedEventData : event))
      );

      // Fermeture du modal après succès
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error.message || error);
      Alert.alert("Erreur", "Impossible de modifier l'événement.");
    }
  };

  const openModal = (event) => {
    setCurrentEvent({
      ...event,
      photos: event.photos || [], // Assurez-vous que les photos sont initialisées
    });
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setCurrentEvent(null);
  };

  const renderItem = ({ item }) => {
    const imageUrl =
      item.photos?.length > 0
        ? item.photos[0].url // Utilise la première photo comme aperçu
        : "https://via.placeholder.com/150"; // Image par défaut si aucune photo

    const eventDate = item.date
      ? new Date(item.date).toLocaleDateString()
      : "Date non disponible";

    return (
      <View style={styles.eventCard}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EventDetailsScreen", { eventId: item.id })
          }
        >
          {/* Image de l'événement */}
          <Image
            source={{
              uri: item.photos?.[0]?.url || "https://via.placeholder.com/150",
            }}
            style={styles.eventImage}
            resizeMode="cover"
          />

          {/* Titre et description */}
          <Text style={styles.eventTitle}>
            {item.title || "Titre non disponible"}
          </Text>
          <Text style={styles.eventDescription} numberOfLines={2}>
            {item.description || "Aucune description disponible"}
          </Text>

          {/* Pied de carte avec la date */}
          <View style={styles.eventFooter}>
            <Text style={styles.eventDate}>
              L'événement est prévu pour le {eventDate}
            </Text>
            <Icon name="chevron-right" size={24} color="#CBCBCB" />
          </View>
        </TouchableOpacity>

        {/* Boutons Modifier et Supprimer */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openModal(item)} // Fonction pour modifier l'événement
          >
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id)} // Fonction pour supprimer l'événement
          >
            <Icon name="delete" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const confirmDelete = (eventId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer cet événement ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => deleteEvent(eventId) },
      ]
    );
  };

  const deleteEvent = async (eventId) => {
    try {
      const userId = await getUserId(); // Récupérer l'ID utilisateur
      if (!userId) {
        console.error("Impossible de récupérer l'ID utilisateur.");
        return;
      }

      const response = await fetch(
        `${API_URL}/events/${eventId}?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'événement.");
      }

      // Supprimer localement l'événement de la liste
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement :", error);
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
  
      // Formate l'adresse pour remplacer "Unnamed Road" par "Route inconnue"
      const formattedLocation = item.formatted.replace(
        /unnamed road/gi,
        "Route inconnue"
      );
  
      // Met à jour l'événement avec les données sélectionnées
      setCurrentEvent((prevEvent) => {
        if (!prevEvent) return prevEvent;
        return {
          ...prevEvent,
          location: formattedLocation, // Met à jour le champ `location`
          latitude: lat,
          longitude: lng,
        };
      });
  
      // Valide l'adresse
      setIsAddressValidated(true);
  
      // Ferme la modal des suggestions
      setModalVisible(false);
    }
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
          <Text style={styles.headerTitleNav}>MES ÉVÉNEMENTS</Text>
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

      {events.length === 0 ? (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>Aucun événement trouvé.</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier l'événement</Text>

              {/* Champ Titre */}
              <TextInput
                style={styles.inputTitle}
                placeholder="Titre"
                value={currentEvent?.title || ""}
                onChangeText={(text) =>
                  setCurrentEvent((prev) =>
                    prev ? { ...prev, title: text } : null
                  )
                }
              />

              {/* Champ Description */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                value={currentEvent?.description || ""}
                onChangeText={(text) =>
                  setCurrentEvent((prev) =>
                    prev ? { ...prev, description: text } : null
                  )
                }
                multiline
              />

              {/* Champ Date */}
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {currentEvent?.date
                    ? new Date(currentEvent.date).toLocaleString()
                    : "Sélectionnez une date"}
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

              {/* Champ Lieu */}
              <View style={styles.inputWithButton}>
  <TextInput
    style={styles.inputSearch}
    placeholder="Rechercher une adresse"
    value={currentEvent?.location || ""} // Remplacez `city` par `location`
    placeholderTextColor="#c7c7c7"
    onChangeText={(text) => {
      setCurrentEvent((prev) =>
        prev ? { ...prev, location: text } : null
      );
      setIsAddressValidated(false); // Réinitialise la validation
    }}
  />
  <TouchableOpacity
    style={styles.searchButton}
    onPress={() =>
      currentEvent && handleAddressSearch(currentEvent.location) // Utilisez `location`
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
                  currentEvent?.photos?.map((photo) => ({
                    uri: photo.url,
                  })) || []
                }
                setPhotos={(newPhotos) => {
                  setCurrentEvent((prev) =>
                    prev
                      ? {
                          ...prev,
                          photos: newPhotos.map((photo) => ({
                            url: photo.uri || photo.url,
                          })),
                        }
                      : null
                  );
                }}
              />
              {/* Boutons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => updateEventHandler(currentEvent)}
                >
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
     
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
    fontFamily: "Starborn", // Utilisez le nom de la police que vous avez défini
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
  eventsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4, // Ombre douce
    borderWidth: 1,
    borderColor: "#E8E8E8", // Légère bordure pour le contraste
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333", // Texte sombre pour un bon contraste
    marginBottom: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666666", // Texte légèrement atténué
    marginBottom: 10,
  },
  eventImage: {
    width: "100%", // Largeur de l'image pour qu'elle occupe tout l'espace disponible
    height: 150, // Hauteur fixe pour un affichage uniforme
    borderRadius: 8, // Coins arrondis pour correspondre au style de la carte
    marginBottom: 10, // Espacement entre l'image et le texte
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    paddingTop: 10,
    marginBottom: 5, // Décalage négatif pour compenser la marge du conteneur parent
  },
  eventDate: {
    fontSize: 12,
    color: "#999999", // Texte discret
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row", // Place les boutons côte à côte
    justifyContent: "space-between", // Espacement entre les boutons
    alignItems: "center", // Aligne les boutons verticalement
    marginTop: 10, // Espacement par rapport au reste de la carte
  },
  editButton: {
    backgroundColor: "#2196F3", // Bleu pour indiquer une action
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FFF5F5",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#FF3B30",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  photoSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
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
  datePickerButton: {
    borderRadius: 30,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: "#f5f5f5",
  },
  datePickerText: {
    color: "#555555",
    fontSize: 14,
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#FF5252",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
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
    marginTop: 10,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34495E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10, // Espace entre le champ et le bouton
    marginTop: 10,
  },
  rowButtonLocation: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDAE49",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10, // Espace entre le champ et le bouton
    marginTop: 10,
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
});
