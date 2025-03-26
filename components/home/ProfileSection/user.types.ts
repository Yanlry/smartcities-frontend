export interface User {
    id: string;
    createdAt?: string;
    ranking: string;
    firstName: string;
    lastName: string;
    username?: string;
    useFullName: boolean;
    nomCommune: string;
    email: string;
    trustRate?: number;
    followers?: UserFollower[];
    following?: UserFollowing[];
    reports?: any[];
    comments?: any[];
    posts?: any[];
    organizedEvents?: any[];
    attendedEvents?: any[];
    latitude?: number;
    longitude?: number;
    profilePhoto?: { url: string };
    isSubscribed: boolean;
    isMunicipality: boolean;
    votes: UserVote[];
  }
  
  export interface UserFollower {
    id: string;
    displayName?: string; // optionnel si la donnée peut être absente
    profilePhoto?: string;
    firstName: string;
    lastName: string;
    username?: string;
    useFullName: boolean;
  }
  
  export interface UserFollowing {
    id: string;
    displayName?: string; // optionnel si la donnée peut être absente
    profilePhoto?: string;
    firstName: string;
    lastName: string;
    username?: string;
    useFullName: boolean;
  }
  
  
  export interface UserVote {
    id: string;
    type: 'up' | 'down';
    createdAt: string;
    reportId: string;
  }
  
  export interface TopUser {
    id: string;
    username: string;
    photo: string | null;
    ranking: number;
    useFullName: boolean;
    firstName: string;
    lastName: string;
  }
  
  export interface SmarterUser {
    id: string;
    displayName: string;
    image: { uri: string };
    points?: number;
    bio?: string;
    location?: string;
    reportsCount?: number;
    rank?: number;
  }
  
  export interface UserRanking {
    ranking: number;
    totalUsers: number;
  }
  
  export interface UserStats {
    votes: UserVote[];
  }
  
  export interface BadgeStyle {
    title: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
    starsColor: string;
    stars: number;
    icon: React.ReactNode | null;
  }
  