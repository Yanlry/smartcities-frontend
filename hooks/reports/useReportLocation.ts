// hooks/reports/useReportLocation.ts
import { useLocationSearch, LocationCoordinates, LocationSearchResult } from '../location/useLocationSearch';

/**
 * Interface pour le retour du hook de localisation pour les rapports
 */
export interface ReportLocationHook {
  // Propriétés de base
  suggestions: LocationSearchResult[];
  isLoading: boolean;
  error: string | null;
  
  // Méthodes de recherche
  searchAddresses: (searchQuery: string) => Promise<LocationSearchResult[]>;
  reverseGeocode: (lat: number, lng: number) => Promise<LocationSearchResult | null>;
  clearSuggestions: () => void;
  setSuggestions: (data: LocationSearchResult[]) => void;
  
  // Utilitaires
  extractPostalCode: (address: string) => number;
  normalizeAddress: (address: string) => string;
  
  // États UI spécifiques au formulaire
  query: string;
  setQuery: (text: string) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  selectedLocation: LocationCoordinates | null;
  setSelectedLocation: (location: LocationCoordinates | null) => void;
  
  // Actions UI
  searchAddress: () => Promise<void>;
  handleSuggestionSelect: (suggestion: LocationSearchResult) => void;
  handleMapSelection: (lat: number, lng: number) => Promise<void>;
  useCurrentLocation: (currentLocation: LocationCoordinates) => Promise<void>;
}

/**
 * Hook spécialisé pour la gestion de localisation dans les rapports
 * Active automatiquement le mode formulaire de useLocationSearch
 * 
 * @param onLocationSelect Callback appelé lorsqu'une localisation est sélectionnée
 * @returns Interface complète pour la gestion de localisation en mode formulaire
 */
export function useReportLocation(
  onLocationSelect: (location: LocationCoordinates, address: string) => void
): ReportLocationHook {
  // Utiliser directement useLocationSearch avec le mode formulaire activé
  const locationResult = useLocationSearch({
    enableFormMode: true,
    onLocationSelect,
  });
  
  // L'assertion de type est sûre car nous avons activé enableFormMode
  return locationResult as ReportLocationHook;
}

export default useReportLocation;