import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  Login: undefined;
  Register: undefined;
  ProfileScreen: undefined;
  UserProfileScreen: { userId: string };
  ReportDetailsScreen: { reportId: number };
  CategoryReportsScreen: { category: string };
  EventDetailsScreen: { eventId: string };
  EventsScreen: undefined;
  ReportScreen: undefined;
  NotificationsScreen: undefined; // Ajoutez cette ligne pour résoudre l'erreur
  RankingScreen: undefined; // Ajoutez cette ligne pour résoudre l'erreur
  ConversationsScreen: undefined; // Ajoutez cette ligne pour résoudre l'erreur
};

export type TabParamList = {
  Accueil: undefined;
  Evénements: undefined;
  'Nouveau signalement': undefined;
  Signalements: undefined;
  Carte: undefined;
};
