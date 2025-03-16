// components/profile/ReportsTab/types.ts

import { Report } from "../../../types/profile.types";

/**
 * Props pour le composant ReportsTab
 */
export interface ReportsTabProps {
  /**
   * Liste des signalements de l'utilisateur
   */
  reports: Report[];
  
  /**
   * Objet de navigation
   */
  navigation: any;
}