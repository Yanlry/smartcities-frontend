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
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/AddNewReportScreen.styles';
import axios from 'axios';
import { getUserIdFromToken } from '../utils/tokenUtils';
import { categories } from '../utils/reportHelpers';
import MapView, { Marker } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AddNewReportScreen() {
  const openCageApiKey = "2e3d9bbd1aae4961a1d011a87410d13f";
  const MY_URL = "http://192.168.1.4:3000";

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { location, loading } = useLocation();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategorieVisible, setModalCategorieVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const listRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const expandedWidth = screenWidth * 0.4;

  useEffect(() => {
    // Position initiale pour simuler l'infini
    listRef.current?.scrollToOffset({
      offset: categories.length * expandedWidth, // Centre de la liste
      animated: false,
    });
  }, []);

  const [mapRegion, setMapRegion] = useState({
    latitude: 48.8566, // Par défaut (ex. Paris)
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleOpenMap = () => {
    // Centrer la carte sur le pin existant ou sur la localisation actuelle
    if (latitude && longitude) {
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert('Erreur', 'Impossible de récupérer votre localisation actuelle.');
    }
  
    setIsMapVisible(true);
  };

  const handleSelectLocation = async (event: any) => {
    const { latitude: lat, longitude: lng } = event.nativeEvent.coordinate;
 // Met à jour les coordonnées et la région de la carte
 setLatitude(lat);
 setLongitude(lng);
 setMapRegion({
   latitude: lat,
   longitude: lng,
   latitudeDelta: 0.01,
   longitudeDelta: 0.01,
 });

    try {
      // Appel à l'API OpenCage pour reverse geocoding
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${openCageApiKey}`;
      console.log('Requête API de reverse geocoding :', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted; // Adresse formatée
        setQuery(address); // Met à jour le champ de recherche
        Alert.alert('Localisation sélectionnée', `Adresse : ${address}`);
      } else {
        Alert.alert('Erreur', "Impossible de trouver l'adresse.");
      }
    } catch (error) {
      console.error('Erreur lors du reverse geocoding :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération de l’adresse.');
    }

    setIsMapVisible(false); // Ferme la carte après la sélection
  };


  const handleAddressSearch = async () => {
    if (!query.trim()) {
      console.warn('Recherche annulée : champ query vide.');
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${openCageApiKey}`;
      console.log('Requête API pour la recherche :', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        setSuggestions(data.results); // Affiche les suggestions
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
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${openCageApiKey}`;
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

  const handleSuggestionSelect = (item: any) => {
    setQuery(item.formatted); // Met à jour l'input avec l'adresse sélectionnée

    // Met à jour la latitude et la longitude à partir de l'adresse sélectionnée
    if (item.geometry) {
      setLatitude(item.geometry.lat);
      setLongitude(item.geometry.lng);
    }

    setModalVisible(false); // Ferme le modal après la sélection
  };

  const handleSubmit = async () => {
    if (!expandedCategory) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie.');
      return;
    }

    const userId = await getUserIdFromToken(); // Récupère l'ID utilisateur dynamique
    console.log('ID utilisateur récupéré:', userId);

    if (!userId) {
      Alert.alert('Erreur', 'Impossible de récupérer votre ID utilisateur.');
      return;
    }

    if (!title || !description || !query || latitude === null || longitude === null || !expandedCategory) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const reportData = {
      title,
      description,
      city: query,
      latitude,
      longitude,
      type: expandedCategory,
      userId,
    };

    try {
      console.log('Données envoyées :', reportData);

      const response = await axios.post(`${MY_URL}/reports`, reportData);

      if (response.status === 201) {
        Alert.alert('Succès', 'Le signalement a été créé avec succès.');
        setTitle('');
        setDescription('');
        setQuery('');
        setLatitude(null);
        setLongitude(null);
        setExpandedCategory(null);
      } else {
        Alert.alert('Erreur', 'Une erreur est survenue lors de la création du signalement.');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission :', error);
      Alert.alert('Erreur', 'Impossible de créer le signalement.');
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
        <Text style={styles.pageTitle}>Choisissez le types de signalement</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setModalCategorieVisible(!modalCategorieVisible)}
        >
          <Text style={styles.dropdownText}>
            {expandedCategory ? (
              <>
                <Text style={styles.selectedCategory}>Je souhaite signaler {' '}</Text><Text style={styles.boldText}>{categories.find(cat => cat.value === expandedCategory)?.article || ''}</Text>
              </>
            ) : (
              'Que voulez-vous rapporter ?'
            )}
          </Text>



          <Ionicons
            name={modalVisible ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>

        {/* Modal pour afficher les catégories */}
        <Modal
          visible={modalCategorieVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalCategorieVisible(false)}
        >
          <View style={styles.modalOverlayCategorie}>
            <View style={styles.modalContentCategorie}>
              <ScrollView>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.card,
                      expandedCategory === category.value && styles.expandedCard,
                    ]}
                    onPress={() => toggleCategoryExpansion(category.value)}
                  >

                    <Ionicons
                      name={category.icon}
                      size={40}
                      color="#007BFF"
                    />
                    <Text style={styles.cardTitle}>{category.name}</Text>
                    {expandedCategory === category.value && (
                      <Text style={styles.cardDescription}>
                        {category.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalCategorieVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.containerSecond}>
          <Text style={styles.title}>Titre</Text>
          <TextInput
            style={styles.inputTitle}
            placeholder="Expliquer brivément le problème"
            placeholderTextColor="#c7c7c7"
            value={title}
            onChangeText={setTitle}
            multiline={false} // Empêche l'agrandissement vertical
            maxLength={100} // Limite le texte à 100 caractères
            scrollEnabled={true} // Permet de faire défiler le texte
          />
          <Text style={styles.title}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="#c7c7c7"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={styles.title}>Lieu</Text>

          {/* Conteneur pour le champ de recherche et le bouton */}
          <View style={styles.inputWithButton}>
            <TextInput
              style={styles.input}
              placeholder="Rechercher une adresse"
              value={query}
              placeholderTextColor="#c7c7c7"
              onChangeText={setQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleAddressSearch}>
              <Ionicons name="search-sharp" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Modal pour afficher les suggestions */}
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
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeModalButtonText}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.rowButtonMap} onPress={handleOpenMap}>
            <Ionicons name="map-outline" size={18} color="white" />
            <Text style={styles.buttonText}>Ouvrir la carte</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.rowButtonLocation} onPress={handleUseLocation}>
              <Ionicons name="location-sharp" size={18} color="#fff" />
              <Text style={styles.buttonText}>Ma position</Text>
            </TouchableOpacity>
          </View>
          {/* Bouton pour ouvrir la carte */}
          

          {/* Modal avec la carte */}
          <Modal visible={isMapVisible} animationType="slide">
            <View style={{ flex: 1, backgroundColor: '#007BFF' }}>
            <MapView
              style={{ flex: 1 }}
              region={mapRegion} // Région mise à jour dynamiquement
              onPress={handleSelectLocation} // Permet de sélectionner une nouvelle localisation
            >
              {/* Pin rouge : Position actuelle */}
              {location && (
                <Marker
                  coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                  pinColor="red" // Couleur rouge pour la position actuelle
                  title="Ma position actuelle"
                  description="Ceci est votre position actuelle."
                />
              )}

              {/* Pin bleu : Position choisie */}
              {latitude && longitude && (
                <Marker
                  coordinate={{ latitude, longitude }}
                  pinColor="blue" // Couleur bleue pour le pin sélectionné
                  title="Position choisie"
                  description="Voici l'emplacement sélectionné."
                />
              )}
            </MapView>

              <View style={styles.buttonMap}>
                <TouchableOpacity
                  style={styles.closeButtonMap}
                  onPress={() => setIsMapVisible(false)}
                >
                  <Text style={styles.closeButtonTextMap}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Soumettre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    </KeyboardAwareScrollView>
  );
}