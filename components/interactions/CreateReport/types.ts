/**
 * Types partagés pour le module de signalement
 */
import { Ionicons } from '@expo/vector-icons';

export interface ReportCategory {
  value: string;

  name: string;

  icon: keyof typeof Ionicons.glyphMap; // Restrict icon to valid Ionicons names

  description: string;
  }
  
  export interface LocationCoordinates {
    latitude: number;
    longitude: number;
  }
  
  export interface AddressSuggestion {
    formatted: string;
    geometry: {
      lat: number;
      lng: number;
    };
  }
  
  export interface Photo {
    uri: string;
    type?: string;
  }
  
  export interface ProgressStep {
    label: string;
    progress: number;
  }
  
  export interface ReportFormData {
    title: string;
    description: string;
    address: string;
    coordinates: LocationCoordinates | null;
    category: string | null;
    photos: Photo[];
  }