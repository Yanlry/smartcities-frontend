import { Photo } from './photo.types';
import { Ionicons } from '@expo/vector-icons';

/**
 * Représente un signalement dans le système
 */
export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  useFullName: boolean;
  
}

export interface Report {
  /** Identifiant unique du signalement */
  id: number;
 user: User;

  /** Titre du signalement */
  title: string;
  /** Description détaillée du signalement */
  description: string;
  /** Type ou catégorie du signalement */
  type: string;
  /** Statut actuel du signalement */
  status?: string;
  /** Date de création du signalement */
  createdAt: string;
  /** Date de dernière mise à jour */
  updatedAt?: string;
  /** Ville où se situe le signalement */
  city: string;
  /** Coordonnée géographique - latitude */
  latitude: number;
  /** Coordonnée géographique - longitude */
  longitude: number;
  /** Distance par rapport à l'utilisateur (en mètres) */
  distance?: number;
  /** Photos associées au signalement */
  photos: Photo[];
  /** ID de l'utilisateur ayant créé le signalement */
  userId?: string;
  /** Commentaires sur le signalement */
  comments: any[];
  /** Votes sur le signalement */
  votes?: any[];
  /** Nombre de votes positifs */
  upVotes: number;
  /** Nombre de votes négatifs */
  downVotes: number;
  gpsDistance?: number;

}

/**
 * Représente une catégorie de signalement
 */
export interface ReportCategory {
  name: string;
  label: string;
  color: string;
  value: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap; // Restrict icon to valid Ionicons names

  //   description: string;
}

/**
 * Type pour les votes sur un signalement
 */
export type VoteType = "up" | "down" | null;

/**
 * Interface pour les résultats de vote mis à jour
 */
export interface VoteResult {
  updatedVotes: {
    upVotes: number;
    downVotes: number;
  };
}

/**
 * Type pour les onglets disponibles dans la vue de détail
 */
export const TABS = ['Détails', 'Carte', 'Commentaires'] as const;
export type ReportTabType = typeof TABS[number]; 

/**
 * Données pour la création d'un nouveau signalement
 */
export interface ReportFormData {
  title: string;
  description: string;
  address: string;
  coordinates: LocationCoordinates | null;
  category: string | null;
  photos: Photo[];
}

/**
 * Coordonnées géographiques pour un signalement
 */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Suggestion d'adresse pour la localisation d'un signalement
 */
export interface AddressSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

/**
 * Étape de progression pour le processus de signalement
 */
export interface ProgressStep {
  label: string;
  progress: number;
}

