// components/profile/InfoTab/types.ts

import { User, UserStats } from "../../../types/profile.types";

/**
 * Props pour le composant UserInfoTab
 */
export interface UserInfoTabProps {
  /**
   * Données de l'utilisateur
   */
  user: User | null;
  
  /**
   * Statistiques de l'utilisateur
   */
  stats: UserStats | null;
  
  /**
   * Indique si l'utilisateur actuel suit le profil affiché
   */
  isFollowing: boolean;
  
  /**
   * Fonction pour suivre l'utilisateur
   */
  onFollow: () => Promise<void>;
  
  /**
   * Fonction pour arrêter de suivre l'utilisateur
   */
  onUnfollow: () => Promise<void>;
  
  /**
   * ID de l'utilisateur actuellement connecté
   */
  currentUserId: number | null;
  
  /**
   * ID de l'utilisateur dont le profil est affiché
   */
  userId: string;
  
  /**
   * Objet de navigation
   */
  navigation: any;
  
  /**
   * Indique si une action est en cours d'exécution
   */
  isSubmitting: boolean;
}