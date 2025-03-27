/**
 * Interface pour les paramètres de route du détail d'un signalement
 */
export interface RouteParams {
    reportId: number;
  }
  
  /**
   * Interface pour les propriétés de l'écran de détails d'un signalement
   */
  export interface ReportDetailsProps {
    route: { params: RouteParams };
    navigation: any; // Idéalement, typez ceci avec le type approprié de navigation
  }