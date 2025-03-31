import React from 'react';


/**
 * Props pour le composant Sidebar
 */
export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  user: User | null;
  displayName: string;
  voteSummary: { up: number; down: number };
  onShowNameModal: () => void;
  onShowVoteInfoModal: () => void;
  onNavigateToCity: () => void;
  updateProfileImage: (uri: string) => Promise<boolean>;
  stats?: any;
  navigation?: any;
  unreadCount?: number;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;


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


