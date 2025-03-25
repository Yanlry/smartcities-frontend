// Chemin : components/Sidebar/types.ts

import React from 'react';

/**
 * SidebarProps - Propriétés principales du composant Sidebar
 * 
 * @interface SidebarProps
 * @property {boolean} isOpen - État d'ouverture/fermeture du sidebar
 * @property {() => void} toggleSidebar - Méthode pour basculer l'état du sidebar
 */
export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

/**
 * SidebarItemProps - Propriétés pour chaque élément de menu
 * 
 * @interface SidebarItemProps
 * @property {React.ReactNode} icon - Élément d'icône à afficher
 * @property {string} label - Texte de l'élément de menu
 * @property {() => void} onPress - Action à exécuter au clic
 */
export interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

/**
 * UserSocialStats - Structure de données pour les statistiques utilisateur
 * Utilisée pour afficher les métriques sociales dans le header du sidebar
 * 
 * @interface UserSocialStats
 */
export interface UserSocialStats {
  followers: string;
  following: string;
  posts: string;
  profileProgress: number;
}

/**
 * SocialTheme - Système de design pour interfaces de type réseau social
 * Structure organisée en catégories fonctionnelles
 * 
 * @interface SocialTheme
 */
export interface SocialTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  animation: ThemeAnimation;
}

/**
 * ThemeColors - Palette de couleurs organisée par fonction
 * 
 * @interface ThemeColors
 */
interface ThemeColors {
  primary: ColorSet;
  secondary: ColorSet;
  accent: ColorSet;
  tertiary?: ColorSet;
  neutral: NeutralColors;
  overlay: TransparencyColors;
  glass: TransparencyColors;
}

/**
 * ColorSet - Ensemble de variations pour une couleur principale
 * 
 * @interface ColorSet
 */
interface ColorSet {
  gradient: string[];
  dark: string;
  main: string;
  light: string;
  ultraLight?: string;
}

/**
 * NeutralColors - Échelle de gris pour la hiérarchie visuelle
 * 
 * @interface NeutralColors
 */
interface NeutralColors {
  darkest?: string;
  dark: string;
  medium: string;
  light: string;
  lightest?: string;
  white: string;
}

/**
 * TransparencyColors - Couleurs semi-transparentes pour effets visuels
 * 
 * @interface TransparencyColors
 */
interface TransparencyColors {
  dark: string;
  medium?: string;
  light: string;
  ultraLight?: string;
}

/**
 * ThemeSpacing - Système d'espacements cohérents
 * 
 * @interface ThemeSpacing
 */
interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl?: number;
}

/**
 * ThemeBorderRadius - Système de rayons de bordure cohérents
 * 
 * @interface ThemeBorderRadius
 */
interface ThemeBorderRadius {
  xs?: number;
  sm: number;
  md: number;
  lg: number;
  xl?: number;
  round: number;
}

/**
 * ThemeAnimation - Paramètres standardisés pour les animations
 * 
 * @interface ThemeAnimation
 */
interface ThemeAnimation {
  duration: {
    fastest: number;
    fast: number;
    normal: number;
    slow: number;
    slowest?: number;
  };
  easing: {
    standard: any;
    decelerate?: any;
    accelerate?: any;
    sharp?: any;
    spring?: any;
  };
}