import React, { useState, useRef } from "react";
import {
  View,
  Button,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getUserIdFromToken } from "../utils/tokenUtils";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../hooks/useLocation";
import MapView, { Marker } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import * as Progress from "react-native-progress";
// @ts-ignore
import { OPEN_CAGE_API_KEY, API_URL } from "@env";
import styles from "./styles/AddNewEventScreen.styles";

export default function CreateEvent({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [query, setQuery] = useState("");
  const { location, loading } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMapExpanded, setIsMapExpanded] = useState(false);


  const steps = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation, veuillez patientez", progress: 1.0 },
  ];

  const handleSelectPhotos = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission requise",
          "Vous devez autoriser l'accès à vos photos."
        );
        return;
      }

      // Vérifier si l'utilisateur a déjà sélectionné 7 photos
      if (photos.length >= 7) {
        Alert.alert(
          "Limite atteinte",
          "Vous pouvez sélectionner jusqu'à 7 photos maximum, veuillez en supprimer pour en ajouter de nouvelles."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true, // Permettre la sélection multiple
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        console.log("Images sélectionnées :", result.assets);

        // Filtrer les photos valides (en excluant celles de taille > 10 Mo)
        const validPhotos = result.assets.filter((photo) => {
          if (photo.fileSize && photo.fileSize > 10 * 1024 * 1024) {
            Alert.alert(
              "Fichier trop volumineux",
              `${
                photo.fileName || "Un fichier"
              } dépasse la limite de 10 Mo et a été ignoré.`
            );
            return false;
          }
          return true;
        });

        // Limiter la sélection à 7 photos maximum
        const newPhotos = [...photos, ...validPhotos];

        // Si le nombre total dépasse 7, on limite à 7 photos
        if (newPhotos.length > 7) {
          Alert.alert(
            "Limite atteinte",
            "Vous pouvez sélectionner jusqu'à 7 photos maximum."
          );
          newPhotos.splice(7); // Garde seulement les 7 premières photos
        }

        setPhotos(newPhotos); // Mettez à jour l'état des photos avec la nouvelle liste
      } else {
        console.log("Sélection annulée");
      }
    } catch (error) {
      console.error("Erreur lors de la sélection des images :", error);
    }
  };

  // Fonction pour supprimer une photo
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index); // Filtrer la photo à supprimer
    setPhotos(updatedPhotos); // Mettre à jour l'état des photos
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log("Coordonnées cliquées :", latitude, longitude);

    setSelectedLocation({ latitude, longitude });

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPEN_CAGE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted;
        setQuery(address);
        Alert.alert("Adresse sélectionnée", `${address}`);
        setIsMapExpanded(false);
      } else {
        Alert.alert("Erreur", "Impossible de trouver l'adresse.");
      }
    } catch (error) {
      console.error("Erreur lors du reverse geocoding :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la récupération de l’adresse."
      );
    }
  };

  const handleUseLocation = async () => {
    if (loading) {
      Alert.alert("Chargement", "Position GPS en cours de récupération...");
      return;
    }
  
    if (!location) {
      Alert.alert(
        "Erreur",
        "Impossible de récupérer votre position. Vérifiez vos permissions GPS."
      );
      return;
    }
  
    setSelectedLocation(location);
  
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPEN_CAGE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.results.length > 0) {
        // Traite l'adresse récupérée pour remplacer "Unnamed Road"
        let address = data.results[0].formatted;
        address = address.replace(/unnamed road/gi, 'Route inconnue'); // Remplace "Unnamed Road"
  
        setQuery(address);
        Alert.alert("Position actuelle sélectionnée", `${address}`);
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
  

  const handleAddressSearch = async () => {
    if (!query.trim()) {
      console.warn("Recherche annulée : champ query vide.");
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
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

const handleSuggestionSelect = (item: any) => {
  const { lat, lng } = item.geometry;

  // Remplace "Unnamed Road" par "Route inconnue" dans l'adresse formatée
  const formattedAddress = item.formatted.replace(/Unnamed Road/gi, 'Route inconnue');

  // Met à jour la localisation sélectionnée
  setSelectedLocation({ latitude: lat, longitude: lng });
  setQuery(formattedAddress); // Utilise l'adresse modifiée
  setModalVisible(false);

  // Anime la carte vers la nouvelle région
  mapRef.current?.animateToRegion({
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
};


  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Vérification de base
    if (
      !title.trim() ||
      !description.trim() ||
      !query.trim() ||
      photos.length === 0
    ) {
      Alert.alert(
        "Erreur",
        "Tous les champs et au moins une photo sont obligatoires."
      );
      return;
    }

    if (!selectedLocation) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner un emplacement sur la carte."
      );
      return;
    }

    setIsSubmitting(true);
    setProgressModalVisible(true);
    setProgress(0);

    try {
      // Étape 1 : Préparation des fichiers
      setProgress(steps[0].progress);
      console.log("Préparation des fichiers...");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulation d'un délai

      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error("Impossible de récupérer l'ID utilisateur.");
      }

      // Préparation du FormData
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date.toISOString());
      formData.append("latitude", String(selectedLocation.latitude));
      formData.append("longitude", String(selectedLocation.longitude));
      formData.append("location", query);
      formData.append("organizerId", String(userId));

      photos.forEach((photo) => {
        if (!photo.uri || !photo.type) {
          throw new Error("Une ou plusieurs photos ne sont pas valides.");
        }

        formData.append(
          "photos",
          {
            uri: photo.uri,
            name: photo.uri.split("/").pop(),
            type: photo.type || "image/jpeg",
          } as any // Cast explicite pour TypeScript
        );
      });

      // Étape 2 : Téléchargement des fichiers
      setProgress(steps[1].progress);
      console.log("Téléchargement en cours...");
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      // Étape 3 : Finalisation
      setProgress(steps[2].progress);
      console.log("Finalisation...");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulation d'un délai

      const data = await response.json();
      Alert.alert("Succès", "L'événement a étais créé avec succès !");
      console.log("Événement créé :", data);
    } catch (error) {
      console.error("Erreur :", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    } finally {
      setProgressModalVisible(false);
      setIsSubmitting(false);
      setTitle("");
      setDescription("");
      setDate(new Date());
      setQuery("");
      setSelectedLocation(null);
      setPhotos([]);
      navigation.navigate('Main')
    }
  };

  const extractPostalCode = (address) => {
    const postalCodeMatch = address.match(/\b\d{5}\b/); // Recherche un code postal à 5 chiffres
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity; // Infinity si pas de code postal
  };

  return (
    <ScrollView style={styles.container}>
      <View>
        <View style={styles.homeTitle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Crée un nouvel événement</Text>
        </View>
        <View style={styles.containerPhoto}>
          <ScrollView horizontal style={styles.photoContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                {/* Afficher la croix rouge */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemovePhoto(index)} // Supprimer la photo en cliquant sur la croix
                >
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>

                {/* Afficher la photo */}
                <Image source={{ uri: photo.uri }} style={styles.photo} />
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.buttonPhoto} onPress={handleSelectPhotos}>
        <Text style={styles.buttonTextPhoto}>Ajouter des photos</Text>
      </TouchableOpacity>
        </View>
        <Text style={styles.label}>Titre</Text>
        <TextInput
          style={[styles.input, { paddingHorizontal: 20 }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Titre"
          placeholderTextColor={"#ccc"}
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[
            styles.input,
            { height: 100, maxHeight: 200, paddingHorizontal: 20 },
          ]} // Limite la hauteur à 100px
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline={true} // Permet plusieurs lignes
          scrollEnabled={true} // Active le défilement
          textAlignVertical="top" // Aligne le texte en haut
          placeholderTextColor={"#ccc"}
        />
        <Text style={styles.label}>Date</Text>
        <View style={styles.dateContainer}>
          <View style={styles.containerDate}>
            <Text style={styles.selectedDate}>{date.toLocaleDateString()}</Text>
          </View>
          <Button
            title="Choisir une nouvelle date"
            onPress={() => setShowDatePicker(true)}
          />
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>Lieu</Text>
        <View style={styles.inputWithButton}>
          <TextInput
            style={styles.inputSearch}
            placeholder="Rechercher une adresse"
            placeholderTextColor={"#ccc"}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleAddressSearch}
          >
            <Ionicons name="search-sharp" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={handleUseLocation}
          >
            <Ionicons name="location-sharp" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#093A3E" />
        ) : (
          <TouchableOpacity
            onPress={() => setIsMapExpanded(true)} // Agrandit la carte au clic
            activeOpacity={1}
          >
            <View
              style={{ position: "relative", marginTop: 20, marginBottom: 20 }}
            >
              {/* Carte */}
              <MapView
                ref={mapRef}
                style={{
                  height: isMapExpanded ? 300 : 100, // Ajuste la hauteur selon l'état
                  borderRadius: 30,
                }}
                initialRegion={{
                  latitude: location ? location.latitude : 48.8566,
                  longitude: location ? location.longitude : 2.3522,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={isMapExpanded} // Rend la carte non interactive lorsqu'elle est réduite
                zoomEnabled={isMapExpanded} // Désactive le zoom lorsqu'elle est réduite
                onPress={isMapExpanded ? handleMapPress : undefined} // Désactive les clics lorsqu'elle est réduite
              >
                {selectedLocation && (
                  <Marker
                    coordinate={selectedLocation}
                    pinColor="red"
                    title="Position choisie"
                    description="Vous avez sélectionné cet endroit."
                  />
                )}
              </MapView>

              {/* Texte indicatif lorsque la carte est réduite */}
              {!isMapExpanded && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Overlay sombre
                    borderRadius: 30,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                  >
                    Cliquez pour ouvrir et placer un point
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}

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
                    <Text style={styles.suggestionText}>{item.formatted}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <View style={styles.submitButtonContainer}>
          {isSubmitting ? (
            <ActivityIndicator size="large" color="#093A3E" />
          ) : (
            <View style={styles.submitButton}>
              <TouchableOpacity
                style={[
                  styles.button, // Style du bouton
                  isSubmitting && styles.buttonDisabled, // Applique un style désactivé si nécessaire
                ]}
                onPress={handleSubmit} // Appelle la fonction de soumission
                disabled={isSubmitting} // Désactive le bouton si déjà en soumission
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Envoi en cours..." : "Créer l'événement"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>



        
        <Modal visible={progressModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {progress < 0.1 && "Préparation des fichiers..."}
                {progress >= 0.1 &&
                  progress < 0.9 &&
                  "Téléchargement en cours..."}
                {progress >= 0.9 && "Finalisation..."}
              </Text>
              <Progress.Bar progress={progress} width={200} color="#2c3e50" />
              <Text style={styles.modalText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

