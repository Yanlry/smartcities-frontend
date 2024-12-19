import React, { useState } from "react";
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
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken"; // Importe le hook pour l'ID utilisateur

const CommentsSection = ({ report }) => {
  const { getUserId } = useToken(); // Récupère l'ID utilisateur actuel
  const [replyTo, setReplyTo] = useState(null); // ID du commentaire parent en cours de réponse
  const [replyText, setReplyText] = useState(""); // Texte de la réponse
  const [commentText, setCommentText] = useState(""); // Texte du nouveau commentaire
  const [comments, setComments] = useState(report.comments); // État local pour les commentaires
  const [expandedComments, setExpandedComments] = useState({}); // État pour savoir quelles réponses sont visibles

  // Fonction pour envoyer un commentaire principal
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
      setComments([...comments, newComment]); // Ajoute le nouveau commentaire en local
      setCommentText(""); // Réinitialise le champ
    } catch (error) {
      console.error(error.message);
    }
  };

  // Fonction pour répondre à un commentaire existant
  const submitReply = async (parentId) => {
    const userId = await getUserId();
    if (!replyText) return;

    const payload = {
      reportId: report.id,
      userId: userId,
      text: replyText,
      latitude: report.latitude,
      longitude: report.longitude,
      parentId: parentId,
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

      // Met à jour les commentaires localement
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
      setReplyText(""); // Réinitialise le champ de réponse
      setReplyTo(null); // Ferme le champ de réponse
    } catch (error) {
      console.error(error.message);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };
  
  const renderComments = (comments, level = 0) => {
    return comments.map((comment) => (
      <View
        key={comment.id}
        style={[
          styles.commentContainer,
          { marginLeft: level * 20 }, // Décale les réponses
        ]}
      >
        {/* Texte du commentaire */}
        <Text style={styles.commentText}>
          {comment.user && comment.user.useFullName
            ? `${comment.user.firstName} ${comment.user.lastName}`
            : comment.user?.username || "Utilisateur inconnu"}
          : {comment.text}
        </Text>
        <Text style={styles.commentDate}>
          Posté le {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
  
        {/* Bouton pour répondre */}
        <TouchableOpacity
          onPress={() => setReplyTo(comment.id)}
          style={styles.replyButton}
        >
          <Text style={styles.replyButtonText}>Répondre</Text>
        </TouchableOpacity>
  
        {/* Champ de saisie pour répondre */}
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
  
        {/* Affichage des réponses */}
        {comment.replies && comment.replies.length > 0 && (
          <>
            {expandedComments[comment.id] && (
              // Si les réponses sont développées, les afficher
              comment.replies.map((reply) => (
                <View
                  key={reply.id}
                  style={[
                    styles.replyContainer,
                    { marginLeft: (level + 1) * 20 },
                  ]}
                >
                  <Text style={styles.replyText}>
                    {reply.user && reply.user.useFullName
                      ? `${reply.user.firstName} ${reply.user.lastName}`
                      : reply.user?.username || "Utilisateur inconnu"}
                    : {reply.text}
                  </Text>
                  <Text style={styles.replyDate}>
                    Posté le {new Date(reply.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
            {/* Bouton pour afficher/masquer les réponses */}
            <TouchableOpacity
              onPress={() => toggleReplies(comment.id)}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>
                {expandedComments[comment.id]
                  ? "Masquer les réponses"
                  : `${comment.replies.length} commentaire - Afficher les réponses`}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    ));
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

          {/* Champ de saisie pour les nouveaux commentaires */}
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
            {/* Rendu des commentaires */}
            {renderComments(comments)}
          </ScrollView>

          <View style={styles.alertContainer}>
            <Text style={styles.alert}>Signalez un commentaire</Text>
          </View>
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
  replyButton: {
    marginTop: 10,
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
    padding: 10,
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
