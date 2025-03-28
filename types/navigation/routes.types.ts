import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Paramètres de navigation pour la pile principale
 */
export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  Login: undefined;
  Register: undefined;
  UserProfileScreen: { userId: string };
  ProfileScreen: { userId: string };
  ReportDetailsScreen: { reportId: number };
  CategoryReportsScreen: { category: string; city?: string }; 
  EventDetailsScreen: { eventId: string };
  EventsScreen: undefined;
  ReportScreen: undefined;
  NotificationsScreen: undefined; 
  RankingScreen: undefined; 
  ConversationsScreen: undefined; 
  CityScreen: undefined; 
  PostDetailsScreen: { postId: number };

};

/**
 * Paramètres de navigation pour les onglets
 */
export type TabParamList = {
  Accueil: undefined;
  Conversations: undefined;
  'Nouveau signalement': undefined;
  Social: undefined;
  Carte: undefined;
};