// hooks/index.ts
// Ré-exporter tous les hooks avec leurs domaines pour une meilleure visibilité

// Auth hooks
export { useAuth, useToken } from './auth';

// User hooks
export { useUserProfile, useUserRanking } from './user';

// API hooks
export { useFetch, useFetchStatistics } from './api';

// Location hooks
export { useLocation, useLocationSearch } from './location';

// Reports hooks
export { useFetchReportDetails, useNearbyReports } from './reports';

// Events hooks
export { useEvents, useEventSubmission } from './events';

// Media hooks
export { usePhotoSelection } from './media';

// UI hooks
export { useBadge } from './ui';