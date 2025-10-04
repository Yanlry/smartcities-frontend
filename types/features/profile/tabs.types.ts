import { User, UserStats, Post, UserTabType } from '../../entities/user.types';
import { Report } from '../../entities/report.types';
import { Event } from '../../entities/event.types';

/**
 * Props pour le composant ProfileTabs
 */
export interface ProfileTabsProps {
  /** Onglet actuellement sélectionné */
  selectedTab: UserTabType;
  /** Fonction de rappel lorsqu'un onglet est sélectionné */
  onSelectTab: (tab: UserTabType) => void;
}

/**
 * Props pour le composant ProfileHeader
 */
export interface ProfileHeaderProps {
  /** Fonction pour basculer l'état du sidebar */
  toggleSidebar: () => void;
  /** Fonction pour ouvrir le modal de signalement */
  openReportModal: () => void;
}

/**
 * Props pour le composant UserInfoTab
 */
export interface UserInfoTabProps {
  /** Données de l'utilisateur */
  user: User | null;
  /** Statistiques de l'utilisateur */
  stats: UserStats | null;
  /** Indique si l'utilisateur actuel suit le profil affiché */
  isFollowing: boolean;
  /** Fonction pour suivre l'utilisateur */
  onFollow: () => Promise<void>;
  /** Fonction pour arrêter de suivre l'utilisateur */
  onUnfollow: () => Promise<void>;
  /** ID de l'utilisateur actuellement connecté */
  currentUserId: number | null;
  /** ID de l'utilisateur dont le profil est affiché */
  userId: string;
  /** Objet de navigation */
  navigation: any;
  /** Indique si une action est en cours d'exécution */
  isSubmitting: boolean;
}

/**
 * Props pour le composant ProfilePhoto
 */
export interface ProfilePhotoProps {
  /** URL de la photo de profil */
  photoUrl?: string;
  /** Classement de l'utilisateur */
  ranking: number;
  /** Indique si une action est en cours */
  isSubmitting: boolean;
  /** Date de création du compte */
  createdAt?: string;
  /** Nom d'utilisateur */
  username?: string;
  /** Indique si l'utilisateur actuel suit le profil affiché */
  isFollowing: boolean;
  /** Biographie de l'utilisateur */
  bio?: string;
  /** Fonction pour suivre l'utilisateur */
  onFollow: () => Promise<void>;
  /** Fonction pour arrêter de suivre l'utilisateur */
  onUnfollow: () => Promise<void>;
  /** Statistiques sociales */
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

/**
 * Props pour le composant PostsTab
 */
export interface PostsTabProps {
  /** Liste des publications de l'utilisateur */
  posts: Post[];
  /** Objet de navigation */
  navigation: any;
}

/**
 * Props pour le composant ReportsTab
 */
export interface ReportsTabProps {
  /** Liste des signalements de l'utilisateur */
  reports: Report[];
  /** Objet de navigation */
  navigation: any;
}

/**
 * Props pour le composant EventsTab
 */
export interface EventsTabProps {
  /** Liste des événements de l'utilisateur */
  events: Event[];
  /** Objet de navigation */
  navigation: any;
}