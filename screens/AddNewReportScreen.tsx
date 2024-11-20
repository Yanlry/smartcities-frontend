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
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/AddNewReportScreen.styles';
import axios from 'axios';
import { getUserIdFromToken } from '../utils/tokenUtils';
import { categories } from '../utils/reportHelpers';

export default function AddNewReportScreen() {
  const openCageApiKey = process.env.OPEN_CAGE_API_KEY; 
  const MY_URL =  process.env.MY_URL;

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

  const handleAddressSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse à rechercher.');
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
        setSuggestions(data.results);
        setModalVisible(true);
      } else {
        setSuggestions([]);
        Alert.alert('Erreur', 'Aucune adresse correspondante trouvée.');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l’adresse :', error);
      Alert.alert('Erreur', 'Impossible de rechercher l’adresse.');
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
  
  const handleUseLocation = async () => {
    if (loading) {
      Alert.alert('Chargement', 'Nous récupérons votre position. Veuillez patienter.');
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
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        const address = data.results[0].formatted;
        setQuery(address);
        Alert.alert('Localisation réussie', `Adresse détectée : ${address}`);
      } else {
        Alert.alert('Erreur', "Impossible de déterminer l'adresse exacte.");
      }
    } catch (error) {
      console.error('Erreur lors du reverse geocoding :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la récupération de l’adresse.');
    }
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
            style={styles.input}
            placeholder="Titre"
            placeholderTextColor="#c7c7c7"
            value={title}
            onChangeText={setTitle}
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
          <TextInput
            style={styles.input}
            placeholder="Rechercher une adresse"
            value={query}
            placeholderTextColor="#c7c7c7"
            onChangeText={setQuery}
          />
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
            <TouchableOpacity style={styles.rowButtonSearch} onPress={handleAddressSearch}>
              <Ionicons name="search-sharp" size={18} color="#fff" />
              <Text style={styles.buttonText}>Rechercher</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rowButtonLocation} onPress={handleUseLocation}>
              <Ionicons name="location-sharp" size={18} color="#fff" />
              <Text style={styles.buttonText}>Ma position</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Soumettre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}