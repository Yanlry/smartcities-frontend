import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReplyItemProps } from './types';
import LikeButton from './LikeButton';

const ReplyItem: React.FC<ReplyItemProps> = memo(({ 
  reply, 
  parentId, 
  currentUserId, 
  onLike, 
  onDelete, 
  onReport,
  isLoading
}) => {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = formatDateTime(reply.createdAt);
  const isOwnReply = reply.user?.id === currentUserId;

  const handleDeletePress = () => {
    Alert.alert(
      "Confirmation de suppression",
      "Êtes-vous sûr de vouloir supprimer cette réponse ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => onDelete(reply.id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.replyContainer}>
      <View style={styles.userInfoContainer}>
        <Image
          source={{
            uri: reply.user?.profilePhoto?.url || "https://via.placeholder.com/50",
          }}
          style={styles.userPhoto}
        />
        <View>
          <Text style={styles.userName}>
            {reply.user?.useFullName
              ? `${reply.user.firstName} ${reply.user.lastName}`
              : reply.user?.username || "Utilisateur inconnu"}
          </Text>
          <Text style={styles.replyDate}>
            Le {date} à {time}
          </Text>
        </View>
      </View>
      
      {isOwnReply && (
        <TouchableOpacity
          onPress={handleDeletePress}
          style={styles.deleteIconReply}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#656765" />
          ) : (
            <Ionicons name="trash" size={16} color="#656765" />
          )}
        </TouchableOpacity>
      )}
      
      <Text style={styles.replyText}>{reply.text}</Text>

      <View style={styles.actionButtonsContainer}>
        <LikeButton 
          count={reply.likesCount} 
          isLiked={reply.likedByUser}
          onPress={() => onLike(reply.id, true, parentId)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  replyContainer: {
    marginTop: 10,
    marginLeft: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 38,
    borderLeftWidth: 3,
    borderLeftColor: "#007bff",
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
  replyDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
  },
  replyText: {
    fontSize: 13,
    color: "#555",
    marginVertical: 5,
    fontWeight: "500",
  },
  deleteIconReply: {
    position: "absolute",
    right: 25,
    top: 15,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
  },
});

export default ReplyItem;