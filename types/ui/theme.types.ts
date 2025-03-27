import { ThemeAnimation } from './animation.types';

/**
 * Système de design pour interfaces de type réseau social
 */
export interface SocialTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  animation: ThemeAnimation;
}

  
  /**
   * Palette de couleurs organisée par fonction
   */
  export interface ThemeColors {
    primary: ColorSet;
    secondary: ColorSet;
    accent: ColorSet;
    tertiary?: ColorSet;
    neutral: NeutralColors;
    overlay: TransparencyColors;
    glass: TransparencyColors;
  }
  
  /**
   * Ensemble de variations pour une couleur principale
   */
  export interface ColorSet {
    gradient: string[];
    dark: string;
    main: string;
    light: string;
    ultraLight?: string;
  }
  
  /**
   * Échelle de gris pour la hiérarchie visuelle
   */
  export interface NeutralColors {
    darkest?: string;
    dark: string;
    medium: string;
    light: string;
    lightest?: string;
    white: string;
  }
  
  /**
   * Couleurs semi-transparentes pour effets visuels
   */
  export interface TransparencyColors {
    dark: string;
    medium?: string;
    light: string;
    ultraLight?: string;
  }
  
  /**
   * Système d'espacements cohérents
   */
  export interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl?: number;
  }
  
  /**
   * Système de rayons de bordure cohérents
   */
  export interface ThemeBorderRadius {
    xs?: number;
    sm: number;
    md: number;
    lg: number;
    xl?: number;
    round: number;
  }