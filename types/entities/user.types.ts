import { ReactNode } from 'react';

/**
 * Représente un utilisateur dans le système
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
export type UserTabType = "info" | "publications" | "signalement" | "evenement"; // Renommé de TabType à UserTabType


/**
 * Statistiques sociales d'un utilisateur
 */
export interface UserSocialStats {
  followers: string;
  following: string;
  posts: string;
  profileProgress: number;
}