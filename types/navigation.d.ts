import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  Login: undefined;
  Register: undefined;
  ProfileScreen: undefined;
  UserProfileScreen: { userId: string };
  ReportDetails: { reportId: number };
  CategoryReports: { category: string };
  EventDetailsScreen: { eventId: string };
  EventsScreen: undefined; // Ajout de la route "EventsScreen"
  ReportsScreen: undefined; // Ajout de la route "EventsScreen"
};

export type TabParamList = {
  Accueil: undefined;
  Evénements: undefined;
  'Nouveau signalement': undefined;
  Signalements: undefined;
  Carte: undefined;
};
