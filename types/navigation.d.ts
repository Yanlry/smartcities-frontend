import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>; // Si vous avez des onglets
  Login: undefined;
  Register: undefined;
  ProfileScreen: undefined;
  UserProfileScreen: { userId: string };
  ReportDetails: { reportId: number }; // Typage attendu pour les paramètres
  CategoryReports: { category: string }; // Ajout pour gérer la navigation vers la page des rapports par catégorie
};

export type TabParamList = {
  Accueil: undefined;
  Evénements: undefined;
  'Nouveau signalement': undefined;
  Signalements: undefined;
  Carte: undefined;
};
