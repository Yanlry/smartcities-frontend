import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";
import { RootStackParamList } from "../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/Ionicons";

export default function CommentsSection({ report }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getToken, getUserId } = useToken();

  const [replyText, setReplyText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(report.comments);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = React.useRef<TextInput>(null);
  const [loadingCommentId, setLoadingCommentId] = useState(null);
  const [likedComments, setLikedComments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'ID utilisateur :",
          error
        );
      }
    })();
  }, []);

  useEffect(() => {
    fetchComments();
  }, [report.id]);

  useEffect(() => {
    fetchComments();  
  }, []);

  const fetchComments = async () => {
    try {
      const { getToken } = useToken();
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
 
      const userLikedComments = data
        .filter((comment) => comment.likedByUser)  
        .map((comment) => comment.id);  

      console.log("Commentaires principale likés :", userLikedComments);

      setLikedComments(userLikedComments);  
    } catch (error) {
      console.error("Erreur :", error.message);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de charger les commentaires."
      );
    }
  };

  const handleLikeComment = async (
    commentId,
    isReply = false,
    parentCommentId = null
  ) => {
    try {
      const userId = await getUserId();
      if (!userId) throw new Error("Utilisateur non authentifié.");

      console.log("Triggering like action for:", {
        commentId,
        isReply,
        parentCommentId,
      });

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
              replies: comment.replies.map((reply) =>
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
    } catch (error) {
      console.error("Erreur lors du like :", error.message);
      Alert.alert("Erreur", error.message || "Action impossible.");
    }
  };

  const submitComment = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const userId = await getUserId();
    const trimmedCommentText = commentText.trim();

    if (!trimmedCommentText) {
      Alert.alert("Erreur", "Le texte du commentaire est vide.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      reportId: report.id,
      userId,
      text: trimmedCommentText,
      latitude: report.latitude,
      longitude: report.longitude,
    };

    try {
      const response = await fetch(`${API_URL}/reports/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du commentaire.");
      }

      const newComment = await response.json();
      console.log("Nouveau commentaire reçu :", newComment);

      setComments((prev) => [newComment, ...prev]);

      setCommentText("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire :", error.message);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReply = async (parentId) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const trimmedReplyText = replyText.trim();
    if (!trimmedReplyText) {
      setIsSubmitting(false);
      return;
    }

    const payload = {
      reportId: report.id,
      userId: currentUserId,
      text: trimmedReplyText,
      parentId,  
    };

    try {
      const response = await fetch(`${API_URL}/reports/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'envoi de la réponse.");

      const newReply = await response.json();
      console.log("Nouvelle réponse créée :", newReply);
 
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );
      setReplyText("");
      Keyboard.dismiss();
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComments = (comments, level = 0) => {
    const sortedComments = [...comments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedComments.map((comment) => (
      <TouchableWithoutFeedback
        key={`${comment.id}-${level}`}
        onLongPress={() => openReportModal(comment.id)}
      >
        <View style={[styles.commentContainer, { marginLeft: level * 10 }]}>
          <View style={styles.userInfoContainer}>
            <Image
              source={{
                uri:
                  comment.user?.profilePhoto ||
                  "https://via.placeholder.com/50",
              }}
              style={styles.userPhoto}
            />
            <TouchableOpacity
              onPress={() => navigateToUserProfile(comment.user?.id)}
            >
              <Text style={styles.userName}>
                {comment.user?.useFullName
                  ? `${comment.user.firstName} ${comment.user.lastName}`
                  : comment.user?.username || "Utilisateur inconnu"}
              </Text>
              <Text style={styles.commentDate}>
                Le {new Date(comment.createdAt).toLocaleDateString()} à{" "}
                {new Date(comment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
            {comment.user?.id === currentUserId && (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Confirmation de suppression",
                    "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
                    [
                      { text: "Annuler", style: "cancel" },
                      {
                        text: "Supprimer",
                        onPress: () => deleteComment(comment.id),
                        style: "destructive",
                      },
                    ]
                  )
                }
                style={styles.deleteIconComment}
                disabled={loadingCommentId === comment.id}
              >
                {loadingCommentId === comment.id ? (
                  <ActivityIndicator size="small" color="#656765" />
                ) : (
                  <Icon name="trash" size={16} color="#656765" />
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Texte du commentaire */}
          <Text style={styles.commentText}>{comment.text}</Text>

          {/* Icône de la bulle pour ouvrir/fermer */}
          <View style={styles.actionButtonsContainer}>
            {/* Bouton pour liker le commentaire */}
            <TouchableOpacity
              onPress={() => handleLikeComment(comment.id)}
              style={[
                styles.likeButton,
                comment.likedByUser && styles.likedButton,
              ]}
            >
              <View style={styles.likeButtonContent}>
                <Icon
                  name={comment.likedByUser ? "thumbs-up" : "thumbs-up-outline"}
                  size={22}
                  color={comment.likedByUser ? "#007bff" : "#656765"}
                />
                <Text
                  style={[
                    styles.likeButtonText,
                    { color: comment.likedByUser ? "#007bff" : "#656765" },
                  ]}
                >
                  {comment.likesCount || 0}
                </Text>
              </View>
            </TouchableOpacity>
            {/* Bouton pour afficher les réponses */}
            {!comment.parentId && (
              <TouchableOpacity
                onPress={() =>
                  setExpandedComments((prev) => ({
                    ...prev,
                    [comment.id]: !prev[comment.id],
                  }))
                }
                style={styles.commentButton}
              >
                <View style={styles.commentButtonContent}>
                  <Icon
                    name={
                      expandedComments[comment.id]
                        ? "chatbubble"
                        : "chatbubble-outline"
                    }
                    size={22}
                    style={styles.commentIcon}
                    color={expandedComments[comment.id] ? "#007bff" : "#656765"}
                  />
                  <Text
                    style={[
                      styles.commentCountText,
                      {
                        color: expandedComments[comment.id]
                          ? "#007bff"
                          : "#656765",
                      },
                    ]}
                  >
                    {comment.replies?.length ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {expandedComments[comment.id] && (
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Écrire une réponse..."
                value={replyText}
                onChangeText={setReplyText}
                multiline={true}
              />
              <TouchableOpacity
                onPress={() => submitReply(comment.id)}
                style={[
                  styles.submitReplyButton,
                  isSubmitting && { backgroundColor: "#ccc" },
                ]}
                disabled={isSubmitting}
              >
                <Text style={styles.submitReplyButtonText}>
                  {isSubmitting ? "..." : "Envoyer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {comment.replies &&
            comment.replies.length > 0 &&
            expandedComments[comment.id] &&
            comment.replies.map((reply) => (
              <View
                key={reply.id}
                style={[styles.replyContainer, { marginLeft: level * 10 }]}
              >
                <View style={styles.userInfoContainer}>
                  <Image
                    source={{
                      uri:
                        reply.user?.profilePhoto ||
                        "https://via.placeholder.com/50",
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
                      Le {new Date(reply.createdAt).toLocaleDateString()} à{" "}
                      {new Date(reply.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
                {/* Bouton pour supprimer la réponse */}
                {reply.user?.id === currentUserId && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Confirmation de suppression",
                        "Êtes-vous sûr de vouloir supprimer cette réponse ?",
                        [
                          { text: "Annuler", style: "cancel" },
                          {
                            text: "Supprimer",
                            onPress: () => deleteComment(reply.id), 
                            style: "destructive",
                          },
                        ]
                      )
                    }
                    style={styles.deleteIconReply} 
                    disabled={loadingCommentId === reply.id}
                  >
                    {loadingCommentId === reply.id ? (
                      <ActivityIndicator size="small" color="#656765" />
                    ) : (
                      <Icon name="trash" size={16} color="#656765" />
                    )}
                  </TouchableOpacity>
                )}
                {/* Texte de la réponse */}
                <Text style={styles.replyText}>{reply.text}</Text>

                {/* Boutons d'actions pour la réponse */}
                <View style={styles.actionButtonsContainer}>
                  {/* Bouton pour liker la réponse */}
                  <TouchableOpacity
                    onPress={() =>
                      handleLikeComment(reply.id, true, comment.id)
                    }  
                    style={[
                      styles.likeButton,
                      reply.likedByUser && styles.likedButton,
                    ]}
                  >
                    <View style={styles.likeButtonContent}>
                      <Icon
                        name={
                          reply.likedByUser ? "thumbs-up" : "thumbs-up-outline"
                        }
                        size={22}
                        color={reply.likedByUser ? "#007bff" : "#656765"}
                      />
                      <Text
                        style={[
                          styles.likeButtonText,
                          { color: reply.likedByUser ? "#007bff" : "#656765" },
                        ]}
                      >
                        {reply.likesCount || 0}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </TouchableWithoutFeedback>
    ));
  };

  const navigateToUserProfile = (userId: string) => {
    navigation.navigate("UserProfileScreen", { userId });
  };

  const deleteComment = async (commentId) => {
    const token = await getToken();
    console.log("Token utilisé pour la suppression :", token);

    setLoadingCommentId(commentId);

    try {
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
          .filter(Boolean)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la suppression."
      );
    } finally {
      setLoadingCommentId(null);
    }
  };

  const openReportModal = (commentId) => {
    setSelectedCommentId(commentId);
    setIsReportModalVisible(true);
  };

  const closeReportModal = () => {
    setSelectedCommentId(null);
    setReportReason("");
    setIsReportModalVisible(false);
  };

  const sendReport = async () => {
    if (!reportReason.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une raison pour le signalement.");
      return;
    }

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

      const result = await response.json();
      console.log("Signalement envoyé :", result);
      Alert.alert("Succès", "Le signalement a été envoyé avec succès.");
      closeReportModal();
    } catch (error) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi du signalement."
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1 }}>
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
                ref={commentInputRef}
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
                disabled={isSubmitting}
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
          {comments.length === 0 ? (
            <Text style={styles.noCommentsText}>Aucun commentaire publié</Text>
          ) : (
            <View key={comments.length}>{renderComments(comments)}</View>
          )}
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isReportModalVisible}
          onRequestClose={closeReportModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Signaler un commentaire</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Quelle est la raison de votre signalement ?"
                placeholderTextColor="#A9A9A9"
                value={reportReason}
                onChangeText={setReportReason}
              />
              <TouchableOpacity
                onPress={async () => {
                  await sendReport();
                  closeReportModal();
                }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Envoyer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={closeReportModal}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
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
  addComment: {
    paddingTop: 10,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  commentContainer: {
    backgroundColor: "",
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
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
  },
  noCommentsText: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 30,
    fontSize: 16,
    color: "gray",
  },
  replyButton: {
    alignSelf: "flex-start",
    backgroundColor: "#007bff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 35,
  },
  replyButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  textInput: {
    borderWidth: 1,
    height: 50,
    width: "100%",
    textAlign: "center",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F2F4F7",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  confirmationButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#57A773",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmationText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "#ff4d4f",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#ff4d4f",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 35,
    alignSelf: "flex-start",
  },
  deleteButtonReply: {
    marginTop: 10,
    backgroundColor: "#ff4d4f",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 35,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    padding: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 30,
    backgroundColor: "#f8f8f8",
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    textAlignVertical: "center",
    minHeight: 20,
  },
  submitReplyButton: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
    marginLeft: 10,
  },
  submitReplyButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
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
  replyText: {
    fontSize: 13,
    color: "#555",
    marginVertical: 5,
    fontWeight: "500",
  },
  replyDate: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
  },
  showMoreButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 35,
    backgroundColor: "#007bff",
  },
  showMoreText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
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
    marginBottom: 20,
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
  deleteIconComment: {
    position: "absolute",
    right: 15,
    top: 10,
  },
  deleteIconReply: {
    position: "absolute",
    right: 25,
    top:15,
  },
  commentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentIcon: {
    marginTop: 12,
  },
  likeButton: {
    marginTop: 2,
  },
  likeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeIcon: {
    marginRight: 5,
  },
  likeCountText: {
    fontSize: 14,
  },
  likedButton: {},
  commentCountText: {
    fontWeight: "bold",
    color: "#656765",
    fontSize: 14,
    marginTop: 12,
    marginLeft: 5,
  },
  likeButtonText: {
    fontWeight: "bold",
    color: "#656765",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },

  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
});
