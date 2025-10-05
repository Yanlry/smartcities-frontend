// Chemin : frontend/types/entities/comment.types.ts

/**
 * Représente un commentaire dans le système
 */
export interface Comment {
  /** Identifiant unique du commentaire */
  id: number;
  /** Utilisateur ayant créé le commentaire */
  user?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    username?: string;
    useFullName?: boolean;
    profilePhoto?: { url: string } | null;
  };
  /** Texte du commentaire */
  text: string;
  /** Date de création du commentaire */
  createdAt: string;
  /** Nombre de likes sur le commentaire */
  likesCount: number;
  /** Si l'utilisateur courant a liké le commentaire */
  likedByUser: boolean;
  /** Réponses au commentaire */
  replies?: Reply[];
  /** ID du commentaire parent (si c'est une réponse) */
  parentId?: number;
}

/**
 * Représente une réponse à un commentaire
 */
export interface Reply {
  /** Identifiant unique de la réponse */
  id: number;
  /** Utilisateur ayant créé la réponse */
  user?: {
    id: string | number;
    firstName?: string;
    lastName?: string;
    username?: string;
    useFullName?: boolean;
    profilePhoto?: { url: string } | null;
  };
  /** Texte de la réponse */
  text: string;
  /** Date de création de la réponse */
  createdAt: string;
  /** Nombre de likes sur la réponse */
  likesCount: number;
  /** Si l'utilisateur courant a liké la réponse */
  likedByUser: boolean;
}

export interface CommentItemProps {
comment: Comment;
currentUserId: number | null;
onLike: (commentId: number, isReply: boolean, parentCommentId?: number | null) => Promise<void>;
onDelete: (commentId: number) => Promise<void>;
onReply: (parentId: number, text: string) => Promise<void>;
onReport: (commentId: number) => void;
expanded: boolean;
toggleExpanded: () => void;
isSubmitting: boolean;
}

export interface CommentsSectionProps {
report: {
  id: number;        // ← CHANGÉ : était "string", maintenant "number"
  latitude: number;
  longitude: number;
  comments: any[];
};
}

export interface LikeButtonProps {
count: number;
isLiked: boolean;
onPress: () => void;
disabled?: boolean;
}

export interface ReplyItemProps {
reply: Reply;
parentId: number;
currentUserId: number | null;
onLike: (commentId: number, isReply: boolean, parentCommentId: number) => Promise<void>;
onDelete: (commentId: number) => Promise<void>;
onReport: (commentId: number) => void;
isLoading: boolean;
}

export interface ReplyFormProps {
parentId: number;
onSubmit: (parentId: number, text: string) => Promise<void>;
isSubmitting: boolean;
}

export interface ReportModalProps {
isVisible: boolean;
onClose: () => void;
onSubmit: (reason: string) => Promise<void>;
}