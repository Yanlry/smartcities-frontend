// components/interactions/CreateEvent/index.ts
/**
 * Module de création d'événements
 * Exporte les composants UI et les types associés
 */

// Export des composants UI
export { default as EventForm } from './EventForm';
export { default as EventDatePicker } from './EventDatePicker';
export { default as LocationSelector } from './LocationSelector';
export { default as AddressSuggestionModal } from './AddressSuggestionModal';
export { default as ProgressModal } from './ProgressModal';

// Export des types de modèle de données
export type { 
  EventFormData, 
  LocationData,
  SubmissionStep,
  SubmissionResult
} from '../../../types/entities/event.types';

// Export des types de props de composants
export type {
  EventFormProps,
  EventDatePickerProps,
  LocationSelectorProps,
  AddressSuggestionModalProps,
  ProgressModalProps
} from '../../../types/features/events/creation.types';