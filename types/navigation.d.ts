import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>;
  Login: undefined;
  Register: undefined;
  ProfileScreen: undefined;
  UserProfileScreen: { userId: string };
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

export type TabParamList = {
  Accueil: undefined;
  Conversations: undefined;
  'Nouveau signalement': undefined;
  Social: undefined;
  Carte: undefined;
};
