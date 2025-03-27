import React from 'react';
import { UserSocialStats } from '../../entities/user.types';

/**
 * Props pour le composant Sidebar
 */
export interface SidebarProps {
  /** État d'ouverture/fermeture du sidebar */
  isOpen: boolean;
  /** Méthode pour basculer l'état du sidebar */
  toggleSidebar: () => void;
  
}

/**
 * Props pour chaque élément de menu du sidebar
 */
export interface SidebarItemProps {
  /** Élément d'icône à afficher */
  icon: React.ReactNode;
  /** Texte de l'élément de menu */
  label: string;
  /** Action à exécuter au clic */
  onPress: () => void;
}