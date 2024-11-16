import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles/AddNewReportScreen.styles';

export default function AddNewReportScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { location, loading } = useLocation();
  const API_KEY = process.env.OPEN_CAGE_API_KEY;

  const categories = [
    {
      name: 'Danger',
      icon: 'skull-outline' as const,
      value: 'danger',
      description: `Signalez tout danger pouvant affecter la sécurité des habitants :\n
  - Objets dangereux sur la voie publique (ex. câbles tombés, verre brisé)\n
  - Zones instables ou dangereuses (ex. glissements de terrain, structures menaçant de s'effondrer)\n
  - Situations à haut risque (ex. incendies, inondations, zones non sécurisées)`,
    },
    {
      name: 'Travaux',
      icon: 'warning-outline' as const,
      value: 'travaux',
      description: `Informez sur les travaux publics ou privés susceptibles d'impacter la ville :\n
  - Fermetures de routes ou rues (ex. travaux de réfection, pose de réseaux souterrains)\n
  - Perturbations des transports ou déviations (ex. encombrements liés aux chantiers)\n
  - Travaux générant du bruit ou des nuisances (ex. chantiers de nuit, vibrations excessives)`,
    },
    {
      name: 'Nuisance',
      icon: 'sad-outline' as const,
      value: 'nuisance',
      description: `Rapportez toute nuisance perturbant la tranquillité de la ville :\n
  - Bruit excessif (ex. travaux nocturnes, fêtes bruyantes)\n
  - Pollution olfactive ou visuelle (ex. odeurs nauséabondes, graffiti non autorisé)\n
  - Comportements inappropriés (ex. regroupements bruyants, dégradations dans les espaces publics)`,
    },
    {
      name: 'Pollution',
      icon: 'leaf-outline' as const,
      value: 'pollution',
      description: `Identifiez les sources de pollution affectant l’environnement ou la santé publique :\n
  - Dépôts sauvages ou décharges illégales (ex. déchets abandonnés, encombrants non ramassés)\n
  - Émissions toxiques (ex. fumées industrielles, odeurs chimiques)\n
  - Pollution des ressources naturelles (ex. cours d'eau contaminés, sols pollués)`,
    },
    {
      name: 'Réparation',
      icon: 'construct-outline' as const,
      value: 'reparation',
      description: `Déclarez tout problème technique ou infrastructurel nécessitant une réparation ou une maintenance urgente :\n
  - Pannes d'éclairage public (ex. lampadaires non fonctionnels)\n
  - Équipements défectueux (ex. feux tricolores en panne, mobiliers urbains endommagés)\n
  - Infrastructures abîmées (ex. trottoirs fissurés, routes avec nids-de-poule)\n
  - Espaces publics détériorés (ex. bancs cassés, panneaux de signalisation dégradés)`,
    },
  ];

  const screenWidth = Dimensions.get('window').width;
  const expandedWidth = screenWidth * 0.4;
  const collapsedWidth = (screenWidth - expandedWidth) / (categories.length - 1);

  const handleCategorySelect = (value: string) => {
    setSelectedCategory((prev) => (prev === value ? null : value)); // Toggle
  };

  const handleAddressSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse à rechercher.');
      return;
    }

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        query
      )}&key=${API_KEY}`;
      console.log('Requête API pour la recherche :', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length > 0) {
        setSuggestions(data.results);
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
    setQuery(item.formatted);
    setLatitude(item.geometry.lat);
    setLongitude(item.geometry.lng);
    setSuggestions([]);
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
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${location.latitude}+${location.longitude}&key=${API_KEY}`;
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
    if (!title || !description || !query || latitude === null || longitude === null || !selectedCategory) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const reportData = {
      title,
      description,
      address: query,
      latitude,
      longitude,
      category: selectedCategory,
      userId: 1,
    };

    try {
      const response = await fetch('https://ton-domaine.com/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Une erreur est survenue lors de la création du signalement.');
      }

      Alert.alert('Succès', 'Le signalement a été créé avec succès.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le signalement.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.pageTitle}>Choisissez parmi les 5 types</Text>
        <View style={styles.iconRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.iconContainer,
                {
                  width:
                    selectedCategory === category.value
                      ? expandedWidth
                      : collapsedWidth,
                },
              ]}
              onPress={() => handleCategorySelect(category.value)}
            >
              <Ionicons
                name={category.icon}
                size={30}
                color={selectedCategory === category.value ? '#007BFF' : '#666'}
              />
              {selectedCategory === category.value && (
                <View style={styles.selectedIconContainer}>
                  <Text style={styles.iconLabel}>{category.name}</Text>
                  <Text style={styles.description}>{category.description}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.containerSecond}>
          <Text style={styles.title}>Titre</Text>
          <TextInput
            style={styles.input}
            placeholder="Titre"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.title}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={styles.title}>Lieu</Text>
          <TextInput
            style={styles.input}
            placeholder="Rechercher une adresse"
            value={query}
            onChangeText={setQuery}
          />
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.formatted}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionSelect(item)}
                >
                  <Text style={styles.suggestionText}>{item.formatted}</Text>
                </TouchableOpacity>
              )}
              style={styles.suggestionsList}
              nestedScrollEnabled // Pour résoudre le problème
            />
          )}
          
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
