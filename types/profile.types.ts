// types/profile.types.ts

/**
 * Types de données utilisés dans le profil utilisateur
 */

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    ranking: number;
    username?: string;
    useFullName?: boolean;
    vote?: { id: number; value: number }[];
    email?: string;
    trustRate?: number;
    followers?: { id: number; username: string; profilePhoto?: string }[];
    following?: { id: number; username: string; profilePhoto?: string }[];
    profilePhoto?: { url: string };
    showEmail?: boolean;
    latitude?: number;
    longitude?: number;
    nomCommune?: string;
    codePostal?: string;
    isSubscribed?: boolean;
    votes: any[];
  }
  
  export interface Post {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    likesCount: number;
    likedByUser: boolean;
    authorId: number;
    authorName: string;
    profilePhoto: string | null;
    nomCommune: string;
    photos: string[];
    comments: Comment[];
  }
  
  export interface Comment {
    id: number;
    text: string;
    createdAt: string;
    userId: number;
    userName: string;
    userProfilePhoto: string;
  }
  
  export interface Report {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    photos?: { url: string }[];
    city: string;
    type: string;
  }
  
  export interface Event {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    photos: { url: string }[];
  }
  
  export interface UserStats {
    votes: any[];
    numberOfComments: number;
    numberOfVotes: number;
    numberOfReports: number;
    numberOfPosts: number;
    numberOfEventsCreated: number;
    numberOfEventsAttended: number;
  }
  
  export type TabType = "info" | "publications" | "signalement" | "evenement";
  
  export interface BadgeStyle {
    title: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    shadowColor: string;
    starsColor: string;
    stars: number;
    icon: string | null;
  }