// src/types/conversation.types.ts
import { Animated } from 'react-native';

/**
 * Représente une conversation entre utilisateurs
 */
export interface Conversation {
  id: string;
  participants: number[];
  lastMessage: string;
  otherParticipantName?: string;
  lastMessageTimestamp?: string | null;
  unreadCount?: number;
  profilePhoto?: string | null;
}

/**
 * Props du composant ConversationItem
 */
export interface ConversationItemProps {
  item: Conversation;
  index: number;
  userId: string;
  onItemPress: (conversation: Conversation) => void;
  onItemLongPress: (conversation: Conversation) => void;
  onPressIn: () => void;
  onPressOut: () => void;
  animatedValues: {
    fadeAnim: Animated.Value;
    slideAnim: Animated.Value;
    scaleAnim: Animated.Value;
  };
}

/**
 * Props du composant ArchivedConversationItem
 */
export interface ArchivedConversationItemProps {
  item: Conversation;
  onRecover: (id: string) => void;
  onPressIn: () => void;
  onPressOut: () => void;
  scaleAnim: Animated.Value;
}