import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import { API_URL } from '@env';
import { useToken } from '../../../hooks/auth/useToken';
import { CommentsSectionProps, Comment } from './types';
import CommentItem from './CommentItem';
import ReportModal from './ReportModal';

const CommentsSection: React.FC<CommentsSectionProps> = memo(({ report }) => {
  const navigation = useNavigation();
  const { getToken, getUserId } = useToken();

  const [comments, setComments] = useState<Comment[]>(report.comments || []);
  const [commentText, setCommentText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCommentId, setLoadingCommentId] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(Number(userId));
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur :", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [report.id]);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await getToken();

      if (!token) {
        throw new Error("Impossible de récupérer un token valide.");
      }

      const response = await fetch(`${API_URL}/reports/${report.id}/comments`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des commentaires.");
      }

      const data = await response.json();
      setComments(data);
    } catch (error: any) {
      console.error("Erreur :", error.message);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de charger les commentaires."
      );
    } finally {
      setIsLoading(false);
    }
  }, [report.id, getToken]);


  const handleLikeComment = useCallback(async (
    commentId: number,
    isReply: boolean = false,
    parentCommentId: number | null = null
  ) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Utilisateur non authentifié.");

      const response = await fetch(
        `${API_URL}/reports/comments/${commentId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) throw new Error("Erreur lors du like/unlike.");

      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (!isReply && comment.id === commentId) {
            return {
              ...comment,
              likesCount: comment.likedByUser
                ? comment.likesCount - 1
                : comment.likesCount + 1,
              likedByUser: !comment.likedByUser,
            };
          }

          if (isReply && comment.id === parentCommentId) {
            return {
              ...comment,
              replies: comment.replies?.map((reply) =>
                reply.id === commentId
                  ? {
                      ...reply,
                      likesCount: reply.likedByUser
                        ? reply.likesCount - 1
                        : reply.likesCount + 1,
                      likedByUser: !reply.likedByUser,
                    }
                  : reply
              ),
            };
          }

          return comment;
        })
      );
    } catch (error: any) {
      console.error("Erreur lors du like :", error.message);
      Alert.alert("Erreur", error.message || "Action impossible.");
    }
  }, [getUserId]);


  const submitComment = useCallback(async () => {
    if (isSubmitting) return;

    const trimmedCommentText = commentText.trim();
    if (!trimmedCommentText) {
      Alert.alert("Erreur", "Le texte du commentaire est vide.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await getUserId();
      
      const payload = {
        reportId: report.id,
        userId,
        text: trimmedCommentText,
        latitude: report.latitude,
        longitude: report.longitude,
      };

      const response = await fetch(`${API_URL}/reports/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du commentaire.");
      }

      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du commentaire :", error.message);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [commentText, report.id, report.latitude, report.longitude, isSubmitting, getUserId]);


  const submitReply = useCallback(async (parentId: number, text: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const userId = await getUserId();
      
      const payload = {
        reportId: report.id,
        userId,
        text,
        parentId,
      };

      const response = await fetch(`${API_URL}/reports/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'envoi de la réponse.");

      const newReply = await response.json();

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentId
            ? { 
                ...comment, 
                replies: [...(comment.replies || []), newReply] 
              }
            : comment
        )
      );
      
      Keyboard.dismiss();
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  }, [report.id, isSubmitting, getUserId]);

  const deleteComment = useCallback(async (commentId: number) => {
    setLoadingCommentId(commentId);

    try {
      const token = await getToken();
      
      const response = await fetch(`${API_URL}/reports/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Erreur API :", error);
        throw new Error(error.message || "Erreur lors de la suppression.");
      }

      setComments((prevComments) =>
        prevComments
          .map((comment) => {
            if (comment.id === commentId) return null;
            if (comment.replies) {
              const updatedReplies = comment.replies.filter(
                (reply) => reply.id !== commentId
              );
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          })
          .filter(Boolean) as Comment[]
      );
    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la suppression."
      );
    } finally {
      setLoadingCommentId(null);
    }
  }, [getToken]);


  const openReportModal = useCallback((commentId: number) => {
    setSelectedCommentId(commentId);
    setIsReportModalVisible(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setSelectedCommentId(null);
    setIsReportModalVisible(false);
  }, []);

  const sendReport = useCallback(async (reportReason: string) => {
    try {
      const userId = await getUserId();

      const response = await fetch(`${API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          to: "yannleroy23@gmail.com",
          subject: "Signalement d'un commentaire",
          reportReason,
          reporterId: userId,
          commentId: selectedCommentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du signalement du commentaire.");
      }

      Alert.alert("Succès", "Le signalement a été envoyé avec succès.");
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi du signalement."
      );
    }
  }, [selectedCommentId, getToken, getUserId]);


  const toggleCommentExpansion = useCallback((commentId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ScrollView
          style={styles.card}
          scrollEnabled={!isReportModalVisible}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.addComment}>
            <Text style={styles.title}>Commentaires :</Text>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Ajouter un commentaire..."
                value={commentText}
                onChangeText={setCommentText}
                multiline={true}
              />
              <TouchableOpacity
                onPress={submitComment}
                style={[
                  styles.submitCommentButton,
                  isSubmitting && { backgroundColor: "#ccc" },
                ]}
                disabled={isSubmitting || !commentText.trim()}
              >
                <Text style={styles.submitCommentText}>
                  {isSubmitting ? "..." : "Envoyer"}
                </Text>
              </TouchableOpacity>
            </View>

            {comments.length > 0 && (
              <View style={styles.alertContainer}>
                <Text style={styles.alert}>
                  Rester appuyer sur un commentaire pour le signaler
                </Text>
              </View>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#102542" />
              <Text style={styles.loadingText}>Chargement des commentaires...</Text>
            </View>
          ) : comments.length === 0 ? (
            <Text style={styles.noCommentsText}>Aucun commentaire publié</Text>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onLike={handleLikeComment}
                onDelete={deleteComment}
                onReply={submitReply}
                onReport={openReportModal}
                expanded={!!expandedComments[comment.id]}
                toggleExpanded={() => toggleCommentExpansion(comment.id)}
                isSubmitting={isSubmitting}
              />
            ))
          )}
        </ScrollView>

        <ReportModal 
          isVisible={isReportModalVisible}
          onClose={closeReportModal}
          onSubmit={async (reason) => {
            await sendReport(reason);
            closeReportModal();
          }}
        />
      </View>
    </TouchableWithoutFeedback>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    marginTop: 10,
  },
  addComment: {
    paddingTop: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: "#333",
  },
  submitCommentButton: {
    marginLeft: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#007bff",
    borderRadius: 30,
  },
  submitCommentText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  alertContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  alert: {
    fontSize: 12,
    color: "#f00",
    fontWeight: "bold",
  },
  noCommentsText: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 30,
    fontSize: 16,
    color: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#656765",
  },
});

export default CommentsSection;