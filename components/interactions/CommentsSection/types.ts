export interface User {
  id: string | number;
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  useFullName?: boolean;
  profilePhoto?: { url: string } | null;
}

export interface Reply {
  id: number;
  user?: User;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByUser: boolean;
}

export interface Comment {
  id: number;
  user?: User;
  text: string;
  createdAt: string;
  likesCount: number;
  likedByUser: boolean;
  replies?: Reply[];
  parentId?: number;
}

export interface CommentsSectionProps {
  report: {

    id: string;

    latitude: number;

    longitude: number;

    comments: any[];

  };
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

export interface LikeButtonProps {
  count: number;
  isLiked: boolean;
  onPress: () => void;
  disabled?: boolean;
}