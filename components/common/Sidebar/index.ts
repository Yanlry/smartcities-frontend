/**
 * Point d'entrée principal du module Sidebar
 * Exporte le composant Sidebar par défaut et ses composants associés
 */

// Export du composant principal
export { default } from './Sidebar';

// Export des composants auxiliaires
export { default as SidebarItem } from './SidebarItem';

// Export des types depuis leur nouvel emplacement
export { 
  SidebarProps, 
  SidebarItemProps 
} from '../../../types/components/common/sidebar.types';