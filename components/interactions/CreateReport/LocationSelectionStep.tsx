// components/interactions/CreateReport/LocationSelectionStep.tsx

import React, { useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { LocationCoordinates } from './types';
import AddressSuggestionModal from './AddressSuggestionModal';

// Constante pour le libellé de la position actuelle
export const CURRENT_LOCATION_LABEL = "Ma position";

interface LocationSelectionStepProps {
  query: string;
  onQueryChange: (text: string) => void;
  onSearchAddress: () => void;
  onUseCurrentLocation: () => void;
  onMapPress: (lat: number, lng: number) => void;
  selectedLocation: LocationCoordinates | null;
  initialLocation: LocationCoordinates | null;
  isLoading: boolean;
  modalVisible: boolean;
  suggestions: any[];
  onSuggestionSelect: (suggestion: any) => void;
  onModalClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

/**
 * Composant pour l'étape de sélection de localisation
 */
const LocationSelectionStep: React.FC<LocationSelectionStepProps> = ({
  query,
  onQueryChange,
  onSearchAddress,
  onUseCurrentLocation,
  onMapPress,
  selectedLocation,
  initialLocation,
  isLoading,
  modalVisible,
  suggestions,
  onSuggestionSelect,
  onModalClose,
  onSubmit,
  isSubmitting
}) => {
  const mapRef = useRef<MapView>(null);
  
  /**
   * Gère l'appui sur la carte
   */
  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onMapPress(latitude, longitude);
  };

  /**
   * Gère l'utilisation de la position actuelle
   * Point d'entrée central pour la fonctionnalité "Ma position"
   */
  const handleUseCurrentLocation = () => {
    // Ne pas mettre à jour la barre de recherche ici
    // Laisser cette responsabilité au parent pour éviter les incohérences
    
    // Appeler le handler pour obtenir la position
    onUseCurrentLocation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Étape 3 : Tapez une adresse ou ajouter un point</Text>
      
      <View style={styles.addressSearchContainer}>
        <View style={styles.inputWithButton}>
          <TextInput
            style={styles.inputSearch}
            placeholder="Rechercher une adresse"
            value={query}
            placeholderTextColor="#c7c7c7"
            onChangeText={onQueryChange}
          />
          <TouchableOpacity style={styles.searchButton} onPress={onSearchAddress}>
            <Ionicons name="search-sharp" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.locationButton} 
            onPress={handleUseCurrentLocation}
            accessibilityLabel="Utiliser ma position actuelle"
          >
            <Ionicons name="location-sharp" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#062C41" />
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: initialLocation?.latitude || 48.8566,
              longitude: initialLocation?.longitude || 2.3522,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                pinColor="red"
                title="Position choisie"
                description={query === CURRENT_LOCATION_LABEL ? "Votre position actuelle" : "Vous avez sélectionné cet endroit."}
              />
            )}
          </MapView>
        </View>
      )}
      
      <View style={styles.submitButtonContainer}>
        {isSubmitting ? (
          <ActivityIndicator size="large" color="#062C41" />
        ) : (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Envoi en cours..." : "Signalez le problème"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <AddressSuggestionModal
        visible={modalVisible}
        suggestions={suggestions}
        onSelect={onSuggestionSelect}
        onClose={onModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addressSearchContainer: {
    marginBottom: 15,
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputSearch: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchButton: {
    backgroundColor: '#3498db',
    padding: 13,
    borderRadius: 8,
    marginLeft: 8,
  },
  locationButton: {
    backgroundColor: '#2ecc71',
    padding: 13,
    borderRadius: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 350,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  submitButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#d81b60',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default React.memo(LocationSelectionStep);