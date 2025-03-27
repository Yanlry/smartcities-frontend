// components/interactions/CreateReport/index.ts
/**
 * Export des composants du module de signalement
 */

export { default as CategorySelection } from './CategorySelection';
export { default as ReportDetailsForm } from './ReportDetailsForm';
export { default as LocationSelectionStep } from './LocationSelectionStep';
export { default as AddressSuggestionModal } from './AddressSuggestionModal';
export { default as ProgressModal } from './ProgressModal';
export { default as StepNavigation } from './StepNavigation';

// Exporter tous les types nécessaires directement depuis report.types.ts
export {
  ReportCategory,
  ReportFormData,
  LocationCoordinates,
  AddressSuggestion,
  ProgressStep
} from '../../../types/entities/report.types';