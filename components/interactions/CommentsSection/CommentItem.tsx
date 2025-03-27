import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommentItemProps } from '../../../types/entities/comment.types';
import ReplyItem from './ReplyItem';
import ReplyForm from './ReplyForm';
import LikeButton from './LikeButton';

const CommentItem: React.FC<CommentItemProps> = memo(({
  comment,
  currentUserId,
  onLike,
  onDelete,
  onReply,
  onReport,
  expanded,
  toggleExpanded,
  isSubmitting
}) => {
  const [replyText, setReplyText] = useState("");
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(comment.createdAt);
  const isOwnComment = comment.user?.id === currentUserId;

  const handleDeletePress = async () => {
    Alert.alert(
      "Confirmation de suppression",
      "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: async () => {
            setIsLoadingDelete(true);
            await onDelete(comment.id);
            setIsLoadingDelete(false);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onLongPress={() => onReport(comment.id)}>
      <View style={styles.commentContainer}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{
              uri: comment.user?.profilePhoto?.url || "https://via.placeholder.com/50",
            }}
            style={styles.userPhoto}
          />
          <View>
            <Text style={styles.userName}>
              {comment.user?.useFullName
                ? `${comment.user.firstName} ${comment.user.lastName}`
                : comment.user?.username || "Utilisateur inconnu"}
            </Text>
            <Text style={styles.commentDate}>
              Le {date} à {time}
            </Text>
          </View>
        </View>

        {isOwnComment && (
          <TouchableOpacity
            onPress={handleDeletePress}
            style={styles.deleteIconComment}
            disabled={isLoadingDelete}
          >
            {isLoadingDelete ? (
              <ActivityIndicator size="small" color="#656765" />
            ) : (
              <Ionicons name="trash" size={16} color="#656765" />
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.commentText}>{comment.text}</Text>

        <View style={styles.actionButtonsContainer}>
          <LikeButton 
            count={comment.likesCount} 
            isLiked={comment.likedByUser}
            onPress={() => onLike(comment.id, false)}
          />
          
          <TouchableOpacity
            onPress={toggleExpanded}
            style={styles.commentButton}
          >
            <View style={styles.commentButtonContent}>
              <Ionicons
                name={expanded ? "chatbubble" : "chatbubble-outline"}
                size={22}
                style={styles.commentIcon}
                color={expanded ? "#007bff" : "#656765"}
              />
              <Text
                style={[
                  styles.commentCountText,
                  { color: expanded ? "#007bff" : "#656765" },
                ]}
              >
                {comment.replies?.length ?? 0}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {expanded && (
          <>
            <ReplyForm 
              parentId={comment.id}
              onSubmit={onReply}
              isSubmitting={isSubmitting}
            />

            {comment.replies && comment.replies.length > 0 && (
              <>
                {comment.replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    parentId={comment.id}
                    currentUserId={currentUserId}
                    onLike={onLike}
                    onDelete={onDelete}
                    onReport={onReport}
                    isLoading={isLoadingDelete}
                  />
                ))}
              </>
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  commentContainer: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: 20,
    paddingHorizontal: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  deleteIconComment: {
    position: "absolute",
    right: 15,
    top: 10,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  commentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentIcon: {
    marginTop: 12,
  },
  commentCountText: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 12,
    marginLeft: 5,
  },
});

export default CommentItem;