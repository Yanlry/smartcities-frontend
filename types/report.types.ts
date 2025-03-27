// src/types/reports.ts

/**
 * Interface pour les photos associées à un signalement
 */
export interface Photo {
    id: string;
    url: string;
  }
  
  /**
   * Interface pour les informations utilisateur
   */
  export interface User {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    useFullName: boolean;
  }
  
  /**
   * Interface principale pour un signalement
   */
  export interface Report {
    id: number;
    title: string;
    description: string;
    type: string;
    latitude: number;
    longitude: number;
    city: string;
    createdAt: string;
    upVotes: number;
    downVotes: number;
    photos: Photo[];
    user: User;
    gpsDistance?: number;
    comments: any[];
  }
  
  /**
   * Interface pour les paramètres de route
   */
  export interface RouteParams {
    reportId: number;
  }
  
  /**
   * Interface pour les propriétés de l'écran de détails
   */
  export interface ReportDetailsProps {
    route: { params: RouteParams };
    navigation: any; // Idéalement, typez ceci avec le type approprié de navigation
  }
  
  /**
   * Type pour les votes
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
   * Type pour les onglets disponibles
   */
  export const TABS = ['Détails', 'Carte', 'Commentaires'] as const;
  export type TabType = typeof TABS[number];