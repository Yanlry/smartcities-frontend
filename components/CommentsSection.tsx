import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";
import { RootStackParamList } from "../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const CommentsSection = ({ report }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { getToken, getUserId } = useToken();
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(report.comments);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const userId = await getUserId();
      setCurrentUserId(userId);
    })();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `${API_URL}/reports/${report.id}/comments`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();
        console.log("Données des commentaires :", data);
        setComments(data); // Assure-toi que la structure des données est respectée
      } catch (error) {
        console.error("Erreur lors du chargement des commentaires :", error);
      }
    };
    fetchComments();
  }, [report.id]);

  const navigateToUserProfile = (userId: string) => {
    navigation.navigate("UserProfileScreen", { userId });
  };

  const refreshComments = async () => {
    try {
      const response = await fetch(`${API_URL}/comments/${report.id}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires :", error);
    }
  };

  const submitComment = async () => {
    const userId = await getUserId();
    if (!commentText) return;

    const payload = {
      reportId: report.id,
      userId: userId,
      text: commentText,
      latitude: report.latitude,
      longitude: report.longitude,
    };

    try {
      const response = await fetch(`${API_URL}/reports/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok)
        throw new Error("Erreur lors de l'envoi du commentaire.");

      const newComment = await response.json();
      console.log("Nouveau commentaire reçu dans le front :", newComment); // Ajoutez ce log

      // Ajoutez un utilisateur local si absent
      const enrichedComment = {
        ...newComment,
        user: newComment.user || {
          id: userId,
          username: "Utilisateur inconnu",
        },
      };

      setComments([...comments, enrichedComment]); // Ajoute le commentaire enrichi en local
      setCommentText(""); // Réinitialise le champ
    } catch (error) {
      console.error(error.message);
    }
  };

  const submitReply = async (parentId) => {
    if (!replyText) return;

    const payload = {
      reportId: report.id,
      userId: currentUserId,
      text: replyText,
      latitude: report.latitude,
      longitude: report.longitude,
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

      // Met à jour la liste des commentaires avec la réponse
      const updateComments = (commentsList) =>
        commentsList.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return {
            ...comment,
            replies: comment.replies ? updateComments(comment.replies) : [],
          };
        });

      setComments(updateComments(comments));
      setReplyText("");
      setReplyTo(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/reports/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du commentaire.");
      }

      // Met à jour l'état local pour refléter la suppression
      const updateComments = (commentsList) =>
        commentsList
          .map((comment) => {
            if (comment.id === commentId) {
              // Supprime les commentaires principaux
              return null;
            }
            if (comment.replies) {
              // Supprime les réponses liées
              const updatedReplies = comment.replies.filter(
                (reply) => reply.id !== commentId
              );
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          })
          .filter(Boolean); // Retire les éléments null de la liste

      const updatedComments = updateComments(comments);
      console.log(
        "Mise à jour des commentaires après suppression :",
        updatedComments
      ); // Vérifiez ici
      setComments(updatedComments);
    } catch (error) {
      console.error("Erreur:", error.message);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const renderComments = (comments, level = 0) => {
    return comments.map((comment) => {
      // Log pour la photo du commentaire principal
      console.log(
        "Photo URL (commentaire principal):",
        comment.user?.photos?.[0]?.url || "https://via.placeholder.com/50"
      );

      return (
        <View
          key={comment.id}
          style={[styles.commentContainer, { marginLeft: level * 20 }]}
        >
          <View style={styles.userInfoContainer}>
            {/* Photo de profil */}
            <Image
  source={{
    uri: comment.user?.profilePhoto || "https://via.placeholder.com/50",
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
            </TouchableOpacity>
          </View>

          <Text style={styles.commentText}>{comment.text}</Text>
          <Text style={styles.commentDate}>
            Posté le {new Date(comment.createdAt).toLocaleDateString()}
          </Text>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              onPress={() => setReplyTo(comment.id)}
              style={styles.replyButton}
            >
              <Text style={styles.replyButtonText}>Répondre</Text>
            </TouchableOpacity>

            {comment.user?.id === currentUserId && (
              <TouchableOpacity
                onPress={() => deleteComment(comment.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            )}
          </View>

          {replyTo === comment.id && (
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.replyInput}
                placeholder="Écrire une réponse..."
                value={replyText}
                onChangeText={setReplyText}
              />
              <TouchableOpacity
                onPress={() => submitReply(comment.id)}
                style={styles.submitReplyButton}
              >
                <Text style={styles.submitReplyButtonText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <>
              {expandedComments[comment.id] &&
                comment.replies.map((reply) => {
                  // Log pour la photo de réponse
                  console.log(
                    "Photo URL (réponse):",
                    reply.user?.photos?.[0]?.url ||
                      "https://via.placeholder.com/50"
                  );

                  return (
                    <View
                      key={reply.id}
                      style={[
                        styles.replyContainer,
                        { marginLeft: (level + 1) * 20 },
                      ]}
                    >
                      <View style={styles.userInfoContainer}>
                        <Image
                          source={{
                            uri:
                              reply.user?.photos?.[0]?.url ||
                              "https://via.placeholder.com/50", // Utiliser la première photo disponible
                          }}
                          style={styles.userPhoto}
                        />
                        <TouchableOpacity
                          onPress={() => navigateToUserProfile(reply.user?.id)}
                        >
                          <Text style={styles.userName}>
                            {reply.user?.useFullName
                              ? `${reply.user.firstName} ${reply.user.lastName}`
                              : reply.user?.username || "Utilisateur inconnu"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.replyText}>{reply.text}</Text>
                      <Text style={styles.replyDate}>
                        Posté le{" "}
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </Text>

                      {reply.user?.id === currentUserId && (
                        <TouchableOpacity
                          onPress={() => deleteComment(reply.id)}
                          style={styles.deleteButtonReply}
                        >
                          <Text style={styles.deleteButtonText}>Supprimer</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              <TouchableOpacity
                onPress={() => toggleReplies(comment.id)}
                style={styles.showMoreButton}
              >
                <Text style={styles.showMoreText}>
                  {expandedComments[comment.id]
                    ? "Masquer les réponses"
                    : `${comment.replies.length} réponse(s) - Afficher`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      );
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.addComment}>
            <Text style={styles.title}>Commentaires :</Text>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Ajouter un commentaire..."
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                onPress={submitComment}
                style={styles.submitCommentButton}
              >
                <Text style={styles.submitCommentText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={styles.card}>
            {renderComments(comments)}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 5,
    paddingHorizontal: 15,
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
    padding: 10,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  commentContainer: {
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  commentText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  userName: {
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
  },
  actionButtonsContainer: {
    flexDirection: "row", // Place les boutons en ligne
    gap: 10, // Espacement entre les boutons
    alignItems: "center", // Aligne les boutons verticalement
    marginTop: 10, // Espacement au-dessus des boutons
  },
  replyButton: {
    alignSelf: "flex-start",
    backgroundColor: "#4CAF50",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 35,
  },
  replyButtonText: {
    color: "#fff",
    fontSize: 12,
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
  },
  submitReplyButton: {
    backgroundColor: "#4CAF50",
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 38,
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  replyText: {
    fontSize: 13,
    color: "#555",
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
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 35,
    backgroundColor: "#f9f9f9",
  },
  submitCommentButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 35,
    marginLeft: 10,
  },
  submitCommentText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  alertContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  alert: {
    fontSize: 14,
    color: "#f00",
    fontWeight: "bold",
  },
});

export default CommentsSection;
