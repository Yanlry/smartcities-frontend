import React from 'react';
import { UserSocialStats } from '../../entities/user.types';

/**
 * Props pour le composant Sidebar
 */
export interface SidebarProps {
  
  isOpen: boolean;
  navigation: any;
  toggleSidebar: () => void;
  // Propriétés de profil utilisateur
  user: User | null;
  stats: UserStats | null;
  displayName: string;
  voteSummary: { up: number; down: number };
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  onShowNameModal: () => void;
  onShowVoteInfoModal: () => void;
  onNavigateToCity: () => void;
  updateProfileImage: (uri: string) => Promise<boolean>;
  unreadCount: number;
  onLogout: () => any;
  onNavigateToSettings: () => any;
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

import { User, UserStats } from "../../../types/entities/user.types";


