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

export default function AddNewReportScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { location, loading } = useLocation();
  const [apiKeys, setApiKeys] = useState<{openCageApiKey: string;} | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategorieVisible, setModalCategorieVisible] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const categories = [
    {
      name: 'Danger',
      icon: 'skull-outline' as const,
      value: 'danger',
      article: 'un danger',
      description: `Signalez tout danger pouvant affecter la sécurité des habitants :

  - Objets dangereux sur la voie publique (ex. câbles tombés, verre brisé)

  - Zones instables ou dangereuses (ex. glissements de terrain, structures menaçant de s'effondrer)

  - Situations à haut risque (ex. incendies, inondations, zones non sécurisées)`,
    },
    {
      name: 'Travaux',
      icon: 'warning-outline' as const,
      value: 'travaux',
      article: 'des travaux',
      description: `Informez sur les travaux publics ou privés susceptibles d'impacter la ville :

  - Fermetures de routes ou rues (ex. travaux de réfection, pose de réseaux souterrains)

  - Perturbations des transports ou déviations (ex. encombrements liés aux chantiers)

  - Travaux générant du bruit ou des nuisances (ex. chantiers de nuit, vibrations excessives)`,
    },
    {
      name: 'Nuisance',
      icon: 'sad-outline' as const,
      value: 'nuisance',
      article: 'une nuisance',

      description: `Rapportez toute nuisance perturbant la tranquillité de la ville :

  - Bruit excessif (ex. travaux nocturnes, fêtes bruyantes)

  - Pollution olfactive ou visuelle (ex. odeurs nauséabondes, graffiti non autorisé)

  - Comportements inappropriés (ex. regroupements bruyants, dégradations dans les espaces publics)`,
    },
    {
      name: 'Pollution',
      icon: 'leaf-outline' as const,
      value: 'pollution',
      article: 'de la pollution',
      description: `Identifiez les sources de pollution affectant l’environnement ou la santé publique :

  - Dépôts sauvages ou décharges illégales (ex. déchets abandonnés, encombrants non ramassés)

  - Émissions toxiques (ex. fumées industrielles, odeurs chimiques)

  - Pollution des ressources naturelles (ex. cours d'eau contaminés, sols pollués)`,
    },
    {
      name: 'Réparation',
      icon: 'construct-outline' as const,
      value: 'reparation',
      article: 'une réparation',
      description: `Déclarez tout problème technique ou infrastructurel nécessitant une réparation ou une maintenance urgente :

  - Pannes d'éclairage public (ex. lampadaires non fonctionnels)

  - Équipements défectueux (ex. feux tricolores en panne, mobiliers urbains endommagés)

  - Infrastructures abîmées (ex. trottoirs fissurés, routes avec nids-de-poule)

  - Espaces publics détériorés (ex. bancs cassés, panneaux de signalisation dégradés)`,
    },
  ];
  const listRef = useRef<FlatList>(null);
  const screenWidth = Dimensions.get('window').width;
  const expandedWidth = screenWidth * 0.4;
  const collapsedWidth = (screenWidth - expandedWidth) / (categories.length - 1);
  
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await axios.get('http://192.168.1.4:3000/config/keys'); // Remplacez localhost par votre domaine si nécessaire
        setApiKeys(response.data); // Stocke directement dans l'état
      } catch (error) {
        console.error('Failed to fetch API keys:', error);
      }
    };
    fetchKeys();
  }, []);

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
      )}&key=${apiKeys?.openCageApiKey}`;
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
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${apiKeys?.openCageApiKey}`;
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
  
      const response = await axios.post('http://192.168.1.4:3000/reports', reportData);
  
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