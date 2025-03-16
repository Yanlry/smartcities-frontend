// components/profile/EventsTab/types.ts

import { Event } from "../../../types/profile.types";

/**
 * Props pour le composant EventsTab
 */
export interface EventsTabProps {
  /**
   * Liste des événements de l'utilisateur
   */
  events: Event[];
  
  /**
   * Objet de navigation
   */
  navigation: any;
}