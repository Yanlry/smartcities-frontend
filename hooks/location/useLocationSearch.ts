// src/hooks/location/useLocationSearch.ts

import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
// @ts-ignore
import { OPEN_CAGE_API_KEY } from '@env';

// Constante pour le libellé de la position actuelle
export const CURRENT_LOCATION_LABEL = "Ma position";

/**
 * Interface pour les coordonnées géographiques
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Interface pour le résultat d'une recherche de localisation
 * Compatible avec la structure retournée par l'API OpenCage
 */
export interface LocationSearchResult {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
  [key: string]: any; // Propriétés additionnelles retournées par l'API
}

/**
 * Options de configuration pour useLocationSearch
 */
export interface LocationSearchOptions {
  /** Active le mode avancé avec états UI supplémentaires pour les formulaires */
  enableFormMode?: boolean;
  /** Fonction appelée lorsqu'une localisation est sélectionnée */
  onLocationSelect?: (location: LocationCoordinates, address: string) => void;
  /** Localisation initiale pour la recherche */
  initialLocation?: LocationCoordinates | null;
  /** Adresse initiale pour la recherche */
  initialAddress?: string;
}

/**
 * Hook qui encapsule les fonctionnalités de recherche géographique
 * et centralise les appels à l'API de géocodage.
 */
export function useLocationSearch(options: LocationSearchOptions = {}) {
  const {
    enableFormMode = false,
    onLocationSelect,
    initialLocation = null,
    initialAddress = '',
  } = options;

  // États de base
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);

  // États supplémentaires pour le mode formulaire
  const [query, setQuery] = useState<string>(initialAddress);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(initialLocation);
  const [isCurrentLocation, setIsCurrentLocation] = useState<boolean>(false);

  /**
   * Recherche d'adresses à partir d'une chaîne de texte
   */
  const searchAddresses = useCallback(async (searchQuery: string): Promise<LocationSearchResult[]> => {
    // Ne pas rechercher si le texte est "Ma position"
    if (searchQuery === CURRENT_LOCATION_LABEL) {
      setSuggestions([]);
      return [];
    }
    
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        searchQuery
      )}&key=${OPEN_CAGE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.status?.message || 'Erreur de serveur';
        throw new Error(errorMsg);
      }

      if (data.results.length > 0) {
        const sortedSuggestions = data.results.sort((a: LocationSearchResult, b: LocationSearchResult) => {
          const postalA = extractPostalCode(a.formatted);
          const postalB = extractPostalCode(b.formatted);
          return postalA - postalB;
        });

        setSuggestions(sortedSuggestions);
        return sortedSuggestions;
      } else {
        setError("Aucune adresse correspondante trouvée");
        setSuggestions([]);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error("Erreur lors de la recherche d'adresse:", errorMessage);
      setError("Impossible de rechercher l'adresse");
      setSuggestions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Recherche une adresse à partir du texte dans le champ de recherche
   */
  const searchAddress = useCallback(async () => {
    if (!enableFormMode) {
      console.warn('searchAddress est uniquement disponible en mode formulaire');
      return;
    }

    // Ne pas rechercher si c'est "Ma position"
    if (query === CURRENT_LOCATION_LABEL) {
      return;
    }

    if (!query.trim()) {
      return;
    }

    try {
      const results = await searchAddresses(query);
      if (results.length > 0) {
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
    }
  }, [enableFormMode, query, searchAddresses]);

  /**
   * Effectue un géocodage inversé pour obtenir une adresse à partir de coordonnées
   */
  const reverseGeocode = useCallback(async (
    lat: number,
    lng: number
  ): Promise<LocationSearchResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPEN_CAGE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.status?.message || 'Erreur de serveur';
        throw new Error(errorMsg);
      }

      if (data.results.length > 0) {
        const result = data.results[0];
        // Normaliser l'adresse (remplacer "unnamed road" par "Route inconnue")
        result.formatted = normalizeAddress(result.formatted);
        return result;
      } else {
        setError("Impossible de déterminer l'adresse exacte");
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error("Erreur lors du reverse geocoding:", errorMessage);
      setError("Une erreur est survenue lors de la récupération de l'adresse");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Gère la sélection d'une suggestion d'adresse
   */
  const handleSuggestionSelect = useCallback((suggestion: LocationSearchResult) => {
    if (!enableFormMode) {
      console.warn('handleSuggestionSelect est uniquement disponible en mode formulaire');
      return;
    }

    if (suggestion.geometry) {
      const { lat, lng } = suggestion.geometry;
      const newLocation = { latitude: lat, longitude: lng };
      
      setSelectedLocation(newLocation);
      setIsCurrentLocation(false);
      
      // Normaliser l'adresse formatée
      const formattedAddress = normalizeAddress(suggestion.formatted);
      setQuery(formattedAddress);
      
      // Notifier le parent de la sélection si callback fourni
      if (onLocationSelect) {
        onLocationSelect(newLocation, formattedAddress);
      }
    }
    
    setModalVisible(false);
  }, [enableFormMode, onLocationSelect]);

  /**
   * Gère la sélection d'un point sur la carte
   */
  const handleMapSelection = useCallback(async (lat: number, lng: number) => {
    if (!enableFormMode) {
      console.warn('handleMapSelection est uniquement disponible en mode formulaire');
      return;
    }

    const newLocation = { latitude: lat, longitude: lng };
    setSelectedLocation(newLocation);
    setIsCurrentLocation(false);
    
    const result = await reverseGeocode(lat, lng);
    if (result) {
      const address = normalizeAddress(result.formatted);
      setQuery(address);
      
      if (onLocationSelect) {
        onLocationSelect(newLocation, address);
      }
    }
  }, [enableFormMode, reverseGeocode, onLocationSelect]);

  /**
   * Utilise la position actuelle de l'utilisateur
   */
  const useCurrentLocation = useCallback(async (currentLocation: LocationCoordinates) => {
    if (!enableFormMode) {
      console.warn('useCurrentLocation est uniquement disponible en mode formulaire');
      return;
    }

    if (!currentLocation) {
      Alert.alert('Erreur', 'Impossible de récupérer votre position.');
      return;
    }

    // Mettre à jour le texte de la barre de recherche immédiatement
    setQuery(CURRENT_LOCATION_LABEL);
    
    // Mettre à jour la localisation et le flag
    setSelectedLocation(currentLocation);
    setIsCurrentLocation(true);
    
    // Créer une suggestion "Ma position" pour l'afficher dans le modal
    const currentLocationSuggestion: LocationSearchResult = {
      formatted: CURRENT_LOCATION_LABEL,
      geometry: {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      },
      components: {
        city: "Position actuelle",
        country: "Position actuelle",
        _type: "current_location"
      }
    };
    
    // Mettre à jour les suggestions et ouvrir le modal
    setSuggestions([currentLocationSuggestion]);
    setModalVisible(true);
    
    // Effectuer le géocodage inversé en arrière-plan pour obtenir l'adresse réelle
    const result = await reverseGeocode(currentLocation.latitude, currentLocation.longitude);
    
    if (result && onLocationSelect) {
      // Utiliser l'adresse réelle pour le serveur mais conserver "Ma position" pour l'UI
      const realAddress = normalizeAddress(result.formatted);
      onLocationSelect(currentLocation, realAddress);
    }
  }, [enableFormMode, reverseGeocode, onLocationSelect]);

  /**
   * Extrait le code postal d'une adresse formatée
   */
  const extractPostalCode = useCallback((address: string): number => {
    const postalCodeMatch = address.match(/\b\d{5}\b/);
    return postalCodeMatch ? parseInt(postalCodeMatch[0], 10) : Infinity;
  }, []);

  /**
   * Normalise une adresse en remplaçant certains termes génériques
   */
  const normalizeAddress = useCallback((address: string): string => {
    return address.replace(/unnamed road/gi, "Route inconnue");
  }, []);

  /**
   * Efface la liste des suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  /**
   * Définit manuellement la liste des suggestions
   */
  const setSuggestionsData = useCallback((data: LocationSearchResult[]) => {
    setSuggestions(data);
  }, []);

  // Retourne différentes propriétés en fonction du mode
  return useMemo(() => {
    // Base API - toujours disponible
    const baseApi = {
      // États
      suggestions,
      isLoading,
      error,
      
      // Méthodes principales
      searchAddresses,
      reverseGeocode,
      clearSuggestions,
      setSuggestions: setSuggestionsData,
      
      // Utilitaires
      extractPostalCode,
      normalizeAddress
    };

    // Si mode formulaire activé, ajouter états et méthodes UI
    if (enableFormMode) {
      return {
        ...baseApi,
        // États UI
        query,
        setQuery,
        modalVisible,
        setModalVisible,
        selectedLocation,
        setSelectedLocation,
        isCurrentLocation,

        // Méthodes UI
        searchAddress,
        handleSuggestionSelect,
        handleMapSelection,
        useCurrentLocation,
      };
    }

    return baseApi;
  }, [
    suggestions, isLoading, error, searchAddresses, reverseGeocode, clearSuggestions, 
    setSuggestionsData, extractPostalCode, normalizeAddress, enableFormMode,
    query, setQuery, modalVisible, setModalVisible, selectedLocation, setSelectedLocation,
    isCurrentLocation, searchAddress, handleSuggestionSelect, handleMapSelection, useCurrentLocation
  ]);
}

export default useLocationSearch;