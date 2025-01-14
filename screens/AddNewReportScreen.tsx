import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/AddNewReportScreen.styles';
import { getUserIdFromToken } from '../utils/tokenUtils';
import { categories } from '../utils/reportHelpers';
import MapView, { Marker } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Progress from 'react-native-progress';
import PhotoManager from '../components/PhotoManager';
// @ts-ignore
import { API_URL , OPEN_CAGE_API_KEY } from '@env';

export default function AddNewReportScreen({navigation}) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { location, loading } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<any[]>([]);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null); 
  const listRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const expandedWidth = screenWidth * 0.4;
  const mapRef = useRef<MapView>(null);

  const steps = [
    { label: "Préparation des fichiers", progress: 0.2 },
    { label: "Téléchargement en cours", progress: 0.7 },
    { label: "Finalisation, veuillez patientez", progress: 1.0 },
  ];

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: categories.length * expandedWidth,
      animated: false,
    });
  }, []);

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleMapPress = async (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;

    // Efface les pins précédents et met à jour
    setSelectedLocation({ latitude: lat, longitude: lng });
    setLatitude(lat);
    setLongitude(lng);

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPEN_CAGE_API_KEY}`;
      console.log('Requête API de reverse geocoding :', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted;
        setQuery(address);
        Alert.alert('Localisation sélectionnée', `Adresse : ${address}`);
      } else {
        Alert.alert('Erreur', "Impossible de trouver l'adresse.");
      }
    } catch (error) {
      console.error('Erreur lors du reverse geocoding :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération de l’adresse.');
    }
  };

  const handleUseLocation = async () => {
    if (loading) {
      console.log('Chargement en cours, action ignorée.');
      return;
    }

    if (!location) {
      Alert.alert('Erreur', "Impossible de récupérer votre position. Vérifiez vos permissions GPS.");
      return;
    }

    setLatitude(location.latitude);
    setLongitude(location.longitude);

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${OPEN_CAGE_API_KEY}`;
      console.log('Requête API pour reverse geocoding :', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted;

        console.log('Adresse récupérée depuis OpenCage Data :', address);

        setQuery(address); // Met automatiquement à jour le champ d'adresse
        setSuggestions(data.results); // Remplit les suggestions avec les résultats
        setModalVisible(true); // Ouvre directement la liste des suggestions
      } else {
        Alert.alert('Erreur', "Impossible de déterminer l'adresse exacte.");
      }
    } catch (error) {
      console.error('Erreur lors du reverse geocoding :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération de l’adresse.');
    }
  };

  const handleAddressSearch = async () => {
    if (!query.trim()) {
      console.warn('Recherche annulée : champ query vide.');
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${OPEN_CAGE_API_KEY}`;
      console.log('Requête API pour la recherche :', url);

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
        Alert.alert('Erreur', 'Aucune adresse correspondante trouvée.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l’adresse :', error);
      Alert.alert('Erreur', 'Impossible de rechercher l’adresse.');
    }
  };

  const extractPostalCode = (address) => {
    const postalCodeMatch = address.match(/\b\d{5}\b/); // Recherche un code postal à 5 chiffres
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity; // Infinity si pas de code postal
  };

  const handleSuggestionSelect = (item: any) => {
    if (item.geometry) {
      const { lat, lng } = item.geometry;
  
      // Met à jour la localisation sélectionnée
      setSelectedLocation({ latitude: lat, longitude: lng });
      setLatitude(lat);
      setLongitude(lng);
  
      // Zoom sur la nouvelle région
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005, // Zoom précis
          longitudeDelta: 0.005,
        },
        1000 // Durée de l'animation en millisecondes
      );
    }
  
    // Remplace "Unnamed Road" par "Route inconnue" dans l'adresse formatée
    const formattedAddress = item.formatted.replace(/unnamed road/gi, 'Route inconnue');
  
    setQuery(formattedAddress); // Met à jour avec l'adresse modifiée
    setModalVisible(false); // Ferme le modal des suggestions
  };
  

  const handleSubmit = async () => {
    if (isSubmitting) return;
  
    // Vérification des champs requis
    if (
      !title.trim() ||
      !description.trim() ||
      !query.trim() 
    ) {
      Alert.alert(
        "Erreur",
        "Tous les champs et au moins une photo sont obligatoires."
      );
      return;
    }
  
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      Alert.alert("Erreur", "Les coordonnées ne sont pas valides.");
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
      formData.append("city", query);
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      if (expandedCategory) {
        formData.append("type", expandedCategory);
      }
      formData.append("userId", String(userId));
  
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
      const response = await fetch(`${API_URL}/reports`, {
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
      Alert.alert("Succès", "Le signalement a été créé avec succès !");
      console.log("Signalement créé :", data);
    } catch (error) {
      console.error("Erreur :", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue.");
    } finally {
      setProgressModalVisible(false);
      setIsSubmitting(false);
      setTitle("");
      setDescription("");
      setQuery("");
      setLatitude(null);
      setLongitude(null);
      setExpandedCategory(null);
      setPhotos([]);
      navigation.navigate("Main");
    }
  };

  const toggleCategoryExpansion = (value: string) => {
    setExpandedCategory(prev => (prev === value ? null : value));
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true} // Active la gestion pour Android
      extraHeight={100} // Ajoute un espace pour éviter que le clavier cache le champ
      keyboardShouldPersistTaps="handled" // Permet de toucher à l'extérieur pour fermer le clavier
    >
      <View style={styles.container}>
        <ScrollView
          horizontal={false}
          contentContainerStyle={{ flexGrow: 1, width: '100%', overflow: 'hidden' }}
        >      
          {step === 1 && (
            <View style={{ flex: 1 }}>
              <View style={styles.homeTitle}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
              <Text style={styles.pageTitle}>Étape 1 : Choisissez le type</Text>
              </View>
              <ScrollView
                contentContainerStyle={styles.categoriesContainer}
                showsVerticalScrollIndicator={false}
              >
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.card,
                      expandedCategory === category.value && styles.expandedCard,
                      index === categories.length - 1 && styles.lastCard, 
                    ]}
                    onPress={() => toggleCategoryExpansion(category.value)}
                  >
                    <Ionicons name={category.icon} size={40} color="#2c3e50" />
                    <Text style={styles.cardTitle}>{category.name}</Text>
                    {expandedCategory === category.value && (
                      <Text style={styles.cardDescription}>
                        {category.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Étape 2 */}
          {step === 2 && (
            <View style={styles.containerSecond}>
              <Text style={styles.pageTitle}>Étape 2 : Décrivez le problème</Text>
              <View style={styles.containerInput}>
                <Text style={styles.title}>Titre</Text>
                <TextInput
                  style={styles.inputTitle}
                  placeholder="Expliquer brièvement le problème"
                  placeholderTextColor="#c7c7c7"
                  value={title}
                  onChangeText={setTitle}
                  multiline={false}
                  maxLength={100}
                  scrollEnabled={true}
                />
                <Text style={styles.title}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Expliquer brièvement le problème ( max. 500 caractères)"
                  placeholderTextColor="#c7c7c7"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
                <Text style={styles.titlePhoto}>Ajouter des photos ( optionnel ) </Text>
                <PhotoManager photos={photos} setPhotos={setPhotos} />

              </View>
            </View>
          )}

          {/* Étape 3 */}
          {step === 3 && (
            <View style={styles.containerThird}>
              <Text style={styles.pageTitle}>Étape 3 : Tapez une adresse ou ajouter un point</Text>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={styles.inputSearch}
                  placeholder="Rechercher une adresse"
                  value={query}
                  placeholderTextColor="#c7c7c7"
                  onChangeText={setQuery}
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleAddressSearch}>
                  <Ionicons name="search-sharp" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowButtonLocation} onPress={handleUseLocation}>
                  <Ionicons name="location-sharp" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
              {loading ? (
                <ActivityIndicator size="large" color="#093A3E" />
              ) : (
                <View style={{  height: 450, marginVertical: 20 }}>
                  <MapView
                    ref={mapRef} // Connectez la référence
                    style={{ flex: 1, borderRadius: 50 }}
                    initialRegion={{
                      latitude: location ? location.latitude : 48.8566, // Paris par défaut
                      longitude: location ? location.longitude : 2.3522,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onPress={handleMapPress} // Ajoute un pin rouge à chaque clic
                  >
                    {selectedLocation && (
                      <Marker
                        coordinate={{
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                        }}
                        pinColor="red"
                        title="Position choisie"
                        description="Vous avez sélectionné cet endroit."
                      />
                    )}
                  </MapView>


                </View>
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
              {/* Bouton de soumission */}
              <View style={styles.submitButtonContainer}>
          {isSubmitting ? (
            <ActivityIndicator size="large" color="#093A3E" />
          ) : (
            <View style={styles.submitButton}>
              <TouchableOpacity
                style={[
                  styles.buttonSubmit, // Style du bouton
                  isSubmitting && styles.buttonDisabled, // Applique un style désactivé si nécessaire
                ]}
                onPress={handleSubmit} // Appelle la fonction de soumission
                disabled={isSubmitting} // Désactive le bouton si déjà en soumission
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Envoi en cours..." : "Signalez le problème"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
       
            </View>
          )}
          
        </ScrollView>

        {/* Boutons de navigation fixes */}
        <View style={styles.navigation}>
          {step > 1 && (
            <TouchableOpacity style={styles.navButtonLeft} onPress={prevStep}>
              <Ionicons name="arrow-back-circle" size={50} color="#34495E" />
            </TouchableOpacity>
          )}
          {step < 3 && (
            <TouchableOpacity style={styles.navButtonRight} onPress={nextStep}>
              <Ionicons name="arrow-forward-circle" size={50} color="#34495E" />
            </TouchableOpacity>
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
              <Progress.Bar progress={progress} width={200} color="#d81b60" />
              <Text style={styles.modalText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        </Modal>
      </View>

    </KeyboardAwareScrollView>
  );
}