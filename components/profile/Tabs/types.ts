// components/profile/Tabs/types.ts

import { TabType } from "../../../types/profile.types";

/**
 * Props pour le composant ProfileTabs
 */
export interface ProfileTabsProps {
  /**
   * Onglet actuellement sélectionné
   */
  selectedTab: TabType;
  
  /**
   * Fonction de rappel lorsqu'un onglet est sélectionné
   */
  onSelectTab: (tab: TabType) => void;
}