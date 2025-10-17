// Chemin : frontend/types/entities/user.types.ts

import { ReactNode } from 'react';

/**
 * Représente un utilisateur dans le système
 * ✅ AJOUT : Champs pour les comptes de mairies
 */
export interface User {
  /** Identifiant unique de l'utilisateur */
  id: string;
  /** Date de création du compte utilisateur */
  createdAt?: string;
  /** Prénom de l'utilisateur */
  firstName: string;
  /** Nom de famille de l'utilisateur */
  lastName: string;
  /** Nom d'utilisateur optionnel */
  username?: string;
  /** Si l'utilisateur préfère utiliser son nom complet plutôt que son username */
  useFullName: boolean;
  /** Adresse email de l'utilisateur */
  email: string;
  /** Classement numérique de l'utilisateur dans le système */
  ranking: number;
  /** Taux de confiance accordé à l'utilisateur (pourcentage) */
  trustRate?: number;
  /** Nom de la commune de l'utilisateur */
  nomCommune: string;
  /** Code postal de la commune */
  codePostal?: string;
  /** Coordonnées géographiques - latitude */
  latitude?: number;
  /** Coordonnées géographiques - longitude */
  longitude?: number;
  /** Photo de profil */
  profilePhoto?: { url: string };
  /** Si l'email doit être visible */
  showEmail?: boolean;
  /** Si l'utilisateur est abonné */
  isSubscribed: boolean;
  /** Si l'utilisateur représente une municipalité */
  isMunicipality?: boolean;
  
  // ✅ NOUVEAUX CHAMPS AJOUTÉS POUR LES MAIRIES
  /** Si le compte est vérifié (pour les mairies) */
  isVerified?: boolean;
  /** Nom officiel de la mairie */
  municipalityName?: string;
  /** Numéro SIREN de la mairie */
  municipalitySIREN?: string;
  /** Téléphone de la mairie */
  municipalityPhone?: string;
  /** Adresse de la mairie */
  municipalityAddress?: string;
  /** Statut du compte (active, pending, rejected) */
  accountStatus?: string;
  /** Raison du rejet si le compte est rejeté */
  rejectionReason?: string;
  
  /** Utilisateurs qui suivent cet utilisateur */
  followers?: UserFollower[];
  /** Utilisateurs suivis par cet utilisateur */
  following?: UserFollowing[];
  /** Votes effectués par l'utilisateur */
  votes: UserVote[];
  /** Signalements créés par l'utilisateur */
  reports?: any[];
  /** Commentaires créés par l'utilisateur */
  comments?: any[];
  /** Publications créées par l'utilisateur */
  posts?: any[];
  /** Événements organisés par l'utilisateur */
  organizedEvents?: any[];
  /** Événements auxquels l'utilisateur participe */
  attendedEvents?: any[];
  voteSummary?: { up: number; down: number };
}

/**
 * Version simplifiée de l'utilisateur pour les contextes d'affichage
 */
export interface UserBasic {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  useFullName: boolean;
  profilePhoto?: { url: string };
}

/**
 * Référence à un utilisateur qui suit un autre utilisateur
 */
export interface UserFollower {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  useFullName: boolean;
  profilePhoto?: string;
  displayName?: string;
}

/**
 * Référence à un utilisateur suivi par un autre utilisateur
 */
export interface UserFollowing {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  useFullName: boolean;
  profilePhoto?: string;
  displayName?: string;
}

/**
 * Représente un vote effectué par un utilisateur
 */
export interface UserVote {
  id: string;
  type: 'up' | 'down';
  createdAt: string;
  reportId: string;
}

/**
 * Représente un utilisateur en tête du classement
 */
export interface TopUser {
  id: string;
  username: string;
  photo: string | null;
  ranking: number;
  useFullName: boolean;
  firstName: string;
  lastName: string;
}

/**
 * Interface détaillée pour un utilisateur avec métrique d'intelligence
 */
export interface SmarterUser {
  id: string;
  displayName: string;
  image: { uri: string };
  points?: number;
  bio?: string;
  location?: string;
  reportsCount?: number;
  rank?: number;
}

/**
 * Informations sur le classement d'un utilisateur
 */
export interface UserRanking {
  ranking: number;
  totalUsers: number;
}

/**
 * Statistiques d'un utilisateur
 * ✅ AJOUT : Statistiques pour les mairies
 */
export interface UserStats {
  votes: UserVote[];
  numberOfComments?: number;
  numberOfVotes?: number;
  numberOfReports?: number;
  numberOfPosts?: number;
  numberOfEventsCreated?: number;
  numberOfEventsAttended?: number;
  totalUsers?: number;
  
  // ✅ NOUVEAUX CHAMPS AJOUTÉS POUR LES STATISTIQUES DES MAIRIES
  /** Nombre total de signalements traités par la mairie */
  totalReportsHandled?: number;
  /** Nombre de signalements actuellement en cours de traitement */
  activeReports?: number;
}

/**
 * Style d'un badge utilisateur
 */
export interface BadgeStyle {
  title: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  starsColor: string;
  stars: number;
  icon: ReactNode | string | null;
}

/**
 * Représente une publication utilisateur
 */
export interface Post {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByUser: boolean;
  authorId: number;
  authorName: string;
  profilePhoto: string | null;
  nomCommune: string;
  photos: string[];
  comments: any[];
}

/**
 * Types d'onglets pour le profil utilisateur
 */
export type UserTabType = "info" | "publications" | "signalement" | "evenement";

/**
 * Statistiques sociales d'un utilisateur
 */
export interface UserSocialStats {
  followers: string;
  following: string;
  posts: string;
  profileProgress: number;
}