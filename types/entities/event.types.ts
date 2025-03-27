import { Photo } from './photo.types';

/**
 * Représente un événement dans le système
 */
export interface Event {
  /** Identifiant unique de l'événement */
  id: string;
  /** Titre de l'événement */
  title: string;
  /** Description détaillée de l'événement */
  description: string;
  /** Date de l'événement */
  date: string;
  /** Date de création de l'événement */
  createdAt?: string;
  /** Localisation de l'événement */
  location: string;
  /** Photos associées à l'événement */
  photos: Photo[];
}

/**
 * Événement mis en avant
 */
export interface FeaturedEvent {
  id: string;
  title: string;
  image: string;
  date?: string;
}

export interface PhotoItem {
  uri: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
  width?: number;
  height?: number;
}
/**
 * Données pour la création d'un événement
 */
export interface EventFormData {
   title: string;
  description: string;
  date: Date;
  location: LocationData;
  photos: PhotoItem[];
}

/**
 * Données de localisation
 */
export interface LocationData {
  query: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
}

/**
 * Étape de soumission pour la création d'événement
 */
export interface SubmissionStep {
  label: string;
  progress: number;
}

/**
 * Résultat de la soumission d'un événement
 */
export interface SubmissionResult {
  success: boolean;
  error?: string;
}