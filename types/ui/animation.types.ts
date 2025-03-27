/**
 * Paramètres standardisés pour les animations
 */
export interface ThemeAnimation {
    duration: AnimationDuration;
    easing: AnimationEasing;
  }
  
  /**
   * Durées standardisées pour les animations
   */
  export interface AnimationDuration {
    fastest: number;
    fast: number;
    normal: number;
    slow: number;
    slowest?: number;
  }
  
  /**
   * Courbes d'accélération standardisées
   */
  export interface AnimationEasing {
    standard: any;
    decelerate?: any;
    accelerate?: any;
    sharp?: any;
    spring?: any;
  }