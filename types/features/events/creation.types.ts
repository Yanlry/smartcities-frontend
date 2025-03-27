import { EventFormData, LocationData, SubmissionStep, SubmissionResult } from '../../entities/event.types';

/**
 * Props pour le formulaire d'événement
 */
export interface EventFormProps {
  /** Titre de l'événement */
  title: string;
  /** Description de l'événement */
  description: string;
  /** Fonction de mise à jour du titre */
  onTitleChange: (text: string) => void;
  /** Fonction de mise à jour de la description */
  onDescriptionChange: (text: string) => void;
}

/**
 * Props pour le sélecteur de date d'événement
 */
export interface EventDatePickerProps {
  /** Date sélectionnée */
  date: Date;
  /** Fonction de mise à jour de la date */
  onDateChange: (date: Date) => void;
}

/**
 * Props pour le sélecteur de localisation
 */
export interface LocationSelectorProps {
  /** Requête de recherche */
  query: string;
  /** Localisation sélectionnée */
  selectedLocation: LocationData['coordinates'];
  /** Fonction de sélection de localisation */
  onLocationSelect: (location: LocationData) => void;
}

/**
 * Props pour la modal de suggestion d'adresse
 */
export interface AddressSuggestionModalProps {
  /** Visibilité de la modal */
  visible: boolean;
  /** Liste des suggestions */
  suggestions: any[];
  /** Fonction de sélection */
  onSelect: (item: any) => void;
  /** Fonction de fermeture */
  onClose: () => void;
}

/**
 * Props pour la modal de progression
 */
export interface ProgressModalProps {
  /** Visibilité de la modal */
  visible: boolean;
  /** Pourcentage de progression */
  progress: number;
}

// export interface LocationData {
//   query: string;
//   coordinates: {
//     latitude: number;
//     longitude: number;
//   } | null;
// }