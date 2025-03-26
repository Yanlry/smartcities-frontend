// components/profile/Photo/types.ts

/**
 * Props pour le composant ProfilePhoto
 */
export interface ProfilePhotoProps {
  /**
   * URL de la photo de profil
   */
  photoUrl?: string;

  ranking: number;
  isSubmitting: boolean;
  createdAt?: string;
  username?: string;
  isFollowing: boolean;
  bio?: string;
  onFollow: () => Promise<void>;
  
  /**
   * Fonction pour arrêter de suivre l'utilisateur
   */
  onUnfollow: () => Promise<void>;
  stats?: {
    posts: number;

    followers: number;

    following: number;
  };
}
