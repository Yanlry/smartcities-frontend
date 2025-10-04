// components/interactions/CommentsSection/index.ts
export { default } from './CommentsSection';

// Imports explicites des types depuis l'architecture centralisée
export type {
  Comment,
  Reply
} from '../../../types/entities/comment.types';

export type {
  CommentsSectionProps,
  CommentItemProps,
  ReplyItemProps,
  ReplyFormProps,
  ReportModalProps,
  LikeButtonProps
} from '../../../types/entities/comment.types';

// Exports des composants auxiliaires
export { default as CommentItem } from './CommentItem';
export { default as ReplyItem } from './ReplyItem';
export { default as ReplyForm } from './ReplyForm';
export { default as ReportModal } from './ReportModal';
export { default as LikeButton } from './LikeButton';