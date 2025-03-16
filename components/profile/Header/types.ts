// components/profile/Header/types.ts

/**
 * Props pour le composant ProfileHeader
 */
export interface ProfileHeaderProps {
    /**
     * Fonction pour basculer l'état du sidebar
     */
    toggleSidebar: () => void;
    
    /**
     * Fonction pour ouvrir le modal de signalement
     */
    openReportModal: () => void;
  }