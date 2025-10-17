// components/interactions/CreateReport/LocationSelectionStep.tsx

import React, { useRef, useState, useCallback } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { LocationCoordinates } from '../../../types/entities/report.types';
import AddressSuggestionModal from './AddressSuggestionModal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Activer LayoutAnimation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  onBack?: () => void;
}

/**
 * Composant pour l'étape de sélection de localisation
 * Intègre une tooltip d'information accessible depuis le header
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
  isSubmitting,
  onBack
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const [mapError, setMapError] = useState<boolean>(false);
  
  // État pour contrôler l'affichage de la tooltip d'information
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  // Animation pour la tooltip
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTranslateY = useRef(new Animated.Value(-20)).current;
  
  /**
   * Gère l'affichage/masquage de la tooltip d'information
   */
  const toggleInfoTooltip = useCallback(() => {
    // Utilise LayoutAnimation pour une transition fluide du reste du contenu
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Configure l'animation de la tooltip
    if (!showInfoTooltip) {
      setShowInfoTooltip(true);
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowInfoTooltip(false);
      });
    }
  }, [showInfoTooltip, tooltipOpacity, tooltipTranslateY]);
  
  /**
   * Gère l'appui sur la carte
   */
  const handleMapPress = (event: any) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onMapPress(latitude, longitude);
      
      // Masque la tooltip si elle est visible
      if (showInfoTooltip) {
        toggleInfoTooltip();
      }
    } catch (error) {
      console.warn("Error handling map press:", error);
    }
  };

  /**
   * Gère l'utilisation de la position actuelle
   */
  const handleUseCurrentLocation = () => {
    onUseCurrentLocation();
    
    // Masque la tooltip si elle est visible
    if (showInfoTooltip) {
      toggleInfoTooltip();
    }
  };

  /**
   * Gère les erreurs de chargement de la carte
   */
  const handleMapError = () => {
    setMapError(true);
  };

  // Ajout d'un hook pour récupérer l'adresse via géocodage inversé
  React.useEffect(() => {
    if (selectedLocation && query === CURRENT_LOCATION_LABEL) {
      (async () => {
        try {
          const [result] = await Location.reverseGeocodeAsync({
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          });
          if (result) {
            // Extraction des données de l'adresse
            const streetAddress = result.name || result.street || '';
            const postal = result.postalCode || '';
            const city = result.city || '';
            // Construction de l'adresse formatée avec une virgule après la rue si possible
            let address = '';
            if (streetAddress) {
              address = `${streetAddress}, ${postal} ${city}`.trim();
            } else {
              address = `${postal} ${city}`.trim();
            }
            if(address) {
              onQueryChange(address);
            }
          }
        } catch (error) {
          console.error("Le géocodage inversé a échoué", error);
        }
      })();
    }
  }, [selectedLocation, query, onQueryChange]);

  return (
    <View style={styles.container}>
      {/* Header avec icône d'information */}
      <View style={styles.header}>

            <TouchableOpacity
              style={styles.infoButton}
              onPress={toggleInfoTooltip}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

        <Text style={styles.headerTitle}>Localisation</Text>
      </View>
      
      {/* Tooltip d'information */}
      {showInfoTooltip && (
        <Animated.View 
          style={[
            styles.infoTooltip, 
            { 
              opacity: tooltipOpacity,
              transform: [{ translateY: tooltipTranslateY }],
              top: Platform.OS === 'ios' ? insets.top + 60 : 50
            }
          ]}
        >
          <Text style={styles.infoTooltipText}>
            Indiquez où se situe le problème. Vous pouvez utiliser la barre de recherche, 
            votre position actuelle, ou appuyer directement sur la carte pour sélectionner 
            un emplacement précis.
          </Text>
          <View style={styles.infoTooltipArrow} />
        </Animated.View>
      )}
      
      <View style={[
        styles.contentContainer,
        // Ajoute un padding supplémentaire si la tooltip est visible
        showInfoTooltip && { paddingTop: 70 }
      ]}>
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
              colors={['#1B5D85', '#0F3460']}
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
                colors={['#27746B', '#1E5A53']}
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
              <ActivityIndicator size="large" color="#1A4B8C" />
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
                    pinColor="#C8372D"
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
                colors={['#27746B', '#1E5A53']}
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
        currentAddress={query}
        onSelect={onSuggestionSelect}
        onClose={onModalClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1B5D85',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftHeaderContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightPlaceholder: {
    width: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoTooltip: {
    position: 'absolute',
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 14,
    zIndex: 1000,
    maxWidth: width * 0.7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  infoTooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  infoTooltipArrow: {
    position: 'absolute',
    top: -10,
    left: 13,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepIndicator: {
    width: 40,
    height: 24,
    backgroundColor: '#1B5D85',
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
        elevation: 3,
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
        elevation: 3,
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
    color: '#1A4B8C',
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
    backgroundColor: 'rgba(26, 75, 140, 0.8)',
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
        shadowColor: 'rgba(39, 116, 107, 0.5)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
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
    backgroundColor: '#27746B',
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