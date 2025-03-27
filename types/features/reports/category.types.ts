import { Animated } from 'react-native';
import { ReportCategory } from '../../entities/report.types';

/**
 * Props pour le composant CategoryReportsSection
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
 * Props pour le composant SectionHeader
 */
export interface SectionHeaderProps {
  /** Fonction pour basculer la visibilité */
  onToggle: () => void;
  /** État de rotation de l'icône */
  rotationAnimation: any;
}

/**
 * Props pour le composant CategoryItem
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
 * Props pour le composant InfoPanel
 */
export interface InfoPanelProps {
  /** Catégorie sélectionnée */
  selectedCategory: ReportCategory | null;
  /** Callback de confirmation */
  onConfirm: () => void;
}

/**
 * Options pour le hook useCategorySelector
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
 * Interface pour les valeurs retournées par le hook useCategorySelector
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

