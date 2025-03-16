// components/profile/PostsTab/types.ts

import { Post } from "../../../types/profile.types";

/**
 * Props pour le composant PostsTab
 */
export interface PostsTabProps {
  /**
   * Liste des publications de l'utilisateur
   */
  posts: Post[];
  
  /**
   * Objet de navigation
   */
  navigation: any;
}