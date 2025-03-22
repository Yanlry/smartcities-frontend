// src/components/home/CategoryReportsSection/types.ts
import { ReportCategory } from '../ReportsSection/report.types';

/**
 * Interface pour les props du composant principal CategoryReportsSection
 */
export interface CategoryReportsSectionProps {
  /** Liste des catégories disponibles */
  categories: ReportCategory[];
  /** Callback appelé lorsqu'une catégorie est sélectionnée */
  onCategoryPress: (category: string) => void;
  /** État de visibilité du sélecteur */
  isVisible: boolean;
  /** Fonction pour basculer la visibilité */
  toggleVisibility: () => void;
}

/**
 * Interface pour les props du composant d'en-tête
 */
export interface SectionHeaderProps {
  /** Fonction pour basculer la visibilité */
  onToggle: () => void;
  /** État de rotation de l'icône */
  rotationAnimation: any;
}

/**
 * Interface pour les props de l'item de catégorie
 */
export interface CategoryItemProps {
  /** Données de la catégorie */
  category: ReportCategory;
  /** Si l'item est sélectionné */
  isSelected: boolean;
  /** Position de l'item dans la liste */
  index: number;
  /** Nombre total d'items */
  totalItems: number;
  /** Callback de sélection */
  onSelect: (name: string) => void;
}

/**
 * Interface pour les props du panneau d'information
 */
export interface InfoPanelProps {
  /** Catégorie sélectionnée */
  selectedCategory: ReportCategory | null;
  /** Callback de confirmation */
  onConfirm: () => void;
}

/**
 * Interface pour les options du hook
 */
export interface UseCategorySelectorOptions {
  /** Initialiser avec une catégorie */
  initialCategory?: string | null;
  /** Durée des animations */
  animationDuration?: number;
  /** Callback à appeler lors de la sélection d'une catégorie */
  onCategorySelected?: (category: string) => void;
}

/**
 * Interface pour les valeurs retournées par le hook
 */
export interface UseCategorySelectorResult {
  /** Catégorie actuellement sélectionnée */
  selectedCategory: string | null;
  /** Définir la catégorie sélectionnée */
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  /** Gérer la sélection d'une catégorie */
  handleCategorySelect: (categoryName: string) => void;
  /** Confirmer la sélection */
  handleConfirmSelection: () => void;
  /** Animation de hauteur du conteneur */
  containerHeight: Animated.Value;
  /** Animation d'opacité du contenu */
  contentOpacity: Animated.Value;
  /** Animation de rotation de l'en-tête */
  headerRotation: Animated.Value;
  /** Animation de déplacement du contenu */
  contentTranslateY: Animated.Value;
  /** Animation du slider de progression */
  sliderProgress: Animated.Value;
  /** Animation pour l'effet parallax */
  scrollX: Animated.Value;
}

// Exporter les types nécessaires pour les fichiers importants
import { Animated } from 'react-native';