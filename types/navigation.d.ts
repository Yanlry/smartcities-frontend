import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Main: NavigatorScreenParams<TabParamList>; // Si vous avez des onglets
  Login: undefined;
  Register: undefined;
  ProfileScreen: undefined;
  ReportDetails: { reportId: number }; // Typage attendu pour les paramètres
};

export type TabParamList = {
  Accueil: undefined;
  Evénements: undefined;
  'Nouveau signalement': undefined;
  Signalements: undefined;
  Carte: undefined;
};
