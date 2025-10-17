// Chemin : frontend/components/interactions/CreateEvent/LocationSelector.tsx

import React, { useState, useRef, useCallback, memo } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, Alert, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../../hooks/location/useLocation';
import { useLocationSearch } from '../../../hooks/location/useLocationSearch';
// @ts-ignore
import { OPEN_CAGE_API_KEY } from '@env';
import { LocationSelectorProps } from '../../../types/features/events/creation.types';
import { LocationData } from '../../../types/entities/event.types';
import AddressSuggestionModal from './AddressSuggestionModal';

/**
 * Composant pour la sélection d'un emplacement sur une carte
 */
const LocationSelector: React.FC<LocationSelectorProps> = memo(({
  query,
  selectedLocation,
  onLocationSelect
}) => {
  // ✅ SOLUTION FINALE : On utilise 'any' car react-native-maps a des problèmes de typage
  // C'est la solution la plus simple et la plus fiable pour ce composant tiers
  const mapRef = useRef<any>(null);
  
  const { location, loading } = useLocation();
  
  // Utiliser le hook de recherche de localisation
  const { 
    searchAddresses, 
    reverseGeocode, 
    suggestions, 
    isLoading: locationSearchLoading,
    error: locationSearchError,
    normalizeAddress
  } = useLocationSearch();
  
  const [localQuery, setLocalQuery] = useState(query);
  const [modalVisible, setModalVisible] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Rechercher des adresses
  const handleAddressSearch = useCallback(async () => {
    if (!localQuery.trim()) {
      return;
    }

    const results = await searchAddresses(localQuery);
    
    if (results.length > 0) {
      setModalVisible(true);
    } else if (locationSearchError) {
      Alert.alert("Erreur", locationSearchError);
    }
  }, [localQuery, searchAddresses, locationSearchError]);

  // Utiliser la position actuelle
  const handleUseLocation = useCallback(async () => {
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

    const result = await reverseGeocode(location.latitude, location.longitude);
    
    if (result) {
      const address = result.formatted;
      setLocalQuery(address);
      
      const locationData: LocationData = {
        query: address,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };
      
      onLocationSelect(locationData);
      
      // Maintenant mapRef.current.animateToRegion fonctionne !
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } else if (locationSearchError) {
      Alert.alert("Erreur", locationSearchError);
    }
  }, [location, loading, reverseGeocode, locationSearchError, onLocationSelect]);

  // Gérer un clic sur la carte
  const handleMapPress = useCallback(async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    const result = await reverseGeocode(latitude, longitude);
    
    if (result) {
      const address = result.formatted;
      setLocalQuery(address);
      
      const locationData: LocationData = {
        query: address,
        coordinates: { latitude, longitude }
      };
      
      onLocationSelect(locationData);
      setIsMapExpanded(false);
    } else if (locationSearchError) {
      Alert.alert("Erreur", locationSearchError);
    }
  }, [reverseGeocode, locationSearchError, onLocationSelect]);

  // Gérer une sélection de suggestion
  const handleSuggestionSelect = useCallback((item: any) => {
    const { lat, lng } = item.geometry;
    const formattedAddress = normalizeAddress(item.formatted);

    setLocalQuery(formattedAddress);
    
    const locationData: LocationData = {
      query: formattedAddress,
      coordinates: { 
        latitude: lat, 
        longitude: lng 
      }
    };
    
    onLocationSelect(locationData);
    setModalVisible(false);

    // Maintenant mapRef.current.animateToRegion fonctionne !
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [onLocationSelect, normalizeAddress]);
  
  // Synchroniser l'état local avec les props
  const handleQueryChange = useCallback((text: string) => {
    setLocalQuery(text);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Lieu</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Rechercher une adresse"
          placeholderTextColor="#ccc"
          value={localQuery}
          onChangeText={handleQueryChange}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleAddressSearch}
          disabled={locationSearchLoading}
        >
          <Ionicons name="search-sharp" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseLocation}
          disabled={loading || locationSearchLoading}
        >
          <Ionicons name="location-sharp" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {(loading || locationSearchLoading) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1B5D85" />
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsMapExpanded(true)}
          activeOpacity={1}
          style={styles.mapContainer}
        >
          <MapView
            ref={mapRef}
            style={{
              height: isMapExpanded ? 300 : 100,
              borderRadius: 30,
            }}
            initialRegion={{
              latitude: selectedLocation?.latitude || location?.latitude || 48.8566,
              longitude: selectedLocation?.longitude || location?.longitude || 2.3522,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={isMapExpanded}
            zoomEnabled={isMapExpanded}
            onPress={isMapExpanded ? handleMapPress : undefined}
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

          {!isMapExpanded && (
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>
                Cliquez pour ouvrir et placer un point
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      <AddressSuggestionModal
        visible={modalVisible}
        suggestions={suggestions}
        onSelect={handleSuggestionSelect}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1B5D85',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginLeft: 10,
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1B5D85',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginLeft: 10,
  },
  mapContainer: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 30,
    overflow: 'hidden',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
  },
  mapOverlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationSelector;