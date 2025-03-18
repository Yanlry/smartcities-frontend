// components/interactions/CreateReport/LocationSelectionStep.tsx

import React, { useRef, useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { LocationCoordinates } from './types';
import AddressSuggestionModal from './AddressSuggestionModal';
import { LinearGradient } from 'expo-linear-gradient';

// Constante pour le libellé de la position actuelle
export const CURRENT_LOCATION_LABEL = "Ma position";

const { width } = Dimensions.get('window');

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
  const [mapError, setMapError] = useState<boolean>(false);
  
  /**
   * Gère l'appui sur la carte
   */
  const handleMapPress = (event: any) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onMapPress(latitude, longitude);
    } catch (error) {
      console.warn("Error handling map press:", error);
    }
  };

  /**
   * Gère l'utilisation de la position actuelle
   */
  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
  };

  /**
   * Gère les erreurs de chargement de la carte
   */
  const handleMapError = () => {
    setMapError(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
              <Text style={styles.pageTitle}>Localisation</Text>
            </View>
            <Text style={styles.pageSubtitle}>Indiquez où se situe le problème</Text>
      
      <View style={styles.contentContainer}>
        <View style={styles.searchCard}>
          <View style={styles.inputContainer}>
            <Ionicons name="search-outline" size={22} color="#8E8E93" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Rechercher une adresse..."
              value={query}
              placeholderTextColor="#8E8E93"
              onChangeText={onQueryChange}
              returnKeyType="search"
              onSubmitEditing={onSearchAddress}
            />
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onSearchAddress}
            >
              <LinearGradient
                colors={['#3498db', '#2980b9']}
                style={styles.buttonGradient}
              >
                <Ionicons name="search" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.locationButton]}
              onPress={handleUseCurrentLocation}
              accessibilityLabel="Utiliser ma position actuelle"
            >
              <LinearGradient
                colors={['#2ecc71', '#27ae60']}
                style={styles.buttonGradient}
              >
                <Ionicons name="location" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.mapSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#062C41" />
              <Text style={styles.loadingText}>Localisation en cours...</Text>
            </View>
          ) : mapError ? (
            <View style={styles.mapErrorContainer}>
              <Ionicons name="map-outline" size={48} color="#cbd5e1" />
              <Text style={styles.mapErrorTitle}>Carte indisponible</Text>
              <Text style={styles.mapErrorText}>
                Vous pouvez toujours rechercher une adresse ou utiliser votre position actuelle
              </Text>
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
                    pinColor="#d81b60"
                    title="Position choisie"
                    description={query === CURRENT_LOCATION_LABEL ? "Votre position actuelle" : "Vous avez sélectionné cet endroit."}
                  />
                )}
              </MapView>
              
              <View style={styles.mapOverlay}>
                <Text style={styles.mapInstructions}>
                  Appuyez sur la carte pour sélectionner manuellement un emplacement
                </Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.submitSection}>
          {isSubmitting ? (
            <View style={styles.loadingSubmitContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingSubmitText}>Traitement en cours...</Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.submitButton, 
                (!selectedLocation || isSubmitting) && styles.disabledButton
              ]}
              onPress={onSubmit}
              disabled={!selectedLocation || isSubmitting}
            >
              <LinearGradient
                colors={['#1DB681', '#1DB681']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  Signaler le problème
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {!selectedLocation && (
            <Text style={styles.helpText}>
              Veuillez sélectionner une localisation pour continuer
            </Text>
          )}
        </View>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db', // Couleur bleu vif et moderne
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stepIndicator: {
    width: 40,
    height: 24,
    backgroundColor: '#062C41',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#64748B',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  locationButton: {
    marginLeft: 8,
  },
  buttonGradient: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSection: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#062C41',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mapErrorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  mapErrorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
  },
  mapErrorText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width * 0.7,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  mapInstructions: {
    backgroundColor: 'rgba(6, 44, 65, 0.8)',
    color: '#fff',
    padding: 8,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: width * 0.8,
    overflow: 'hidden',
  },
  submitSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#d81b60',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loadingSubmitContainer: {
    width: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSubmitText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default React.memo(LocationSelectionStep);