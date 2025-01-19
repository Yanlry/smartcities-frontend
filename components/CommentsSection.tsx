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
  const [replyTo, setReplyTo] = useState(null);
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

  useEffect(() => {
    (async () => {
      try {
        const userId = await getUserId();
        console.log("Utilisateur actuel :", userId);
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
  }, [comments]);

  useEffect(() => {
    fetchComments();
  }, [report.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_URL}/reports/${report.id}/comments`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur API : ${response.status}`);
      }

      const data = await response.json();

      const formattedData = data.map((comment) => ({
        ...comment,
        user: {
          ...comment.user,
          profilePhoto:
            comment.user?.photos?.[0]?.url || "https://via.placeholder.com/50",
        },
      }));

      console.log("Commentaires formatés :", formattedData);
      setComments(formattedData);
    } catch (error) {
      console.error(
        "Erreur lors du chargement des commentaires :",
        error.message
      );
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

      // Mise à jour immédiate de l'état local
      setComments((prev) => [newComment, ...prev]);

      // Réinitialisation du champ de saisie
      setCommentText("");

    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire :", error.message);
      Alert.alert("Erreur", "Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReply = async (parentId) => {
    if (isSubmitting) return; // Empêche une nouvelle soumission pendant le chargement

    setIsSubmitting(true); // Active le loader

    const trimmedReplyText = replyText.trim();
    if (!trimmedReplyText) {
      setIsSubmitting(false); // Désactive le loader si le texte est vide
      return;
    }

    const payload = {
      reportId: report.id,
      userId: currentUserId,
      text: trimmedReplyText,
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
      console.log("Nouvelle réponse créée :", newReply);

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === parentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );

      setReplyText("");
      setReplyTo(null);
      Keyboard.dismiss();

      // Afficher une confirmation
      Alert.alert("Succès", "Votre réponse a été publiée avec succès.", [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error.message);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false); // Désactive le loader à la fin
    }
  };

  const renderComments = (comments, level = 0) => {
    // Trier les commentaires par date décroissante
    const sortedComments = [...comments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedComments.map((comment) => (
      <TouchableWithoutFeedback
        key={`${comment.id}-${level}`} // Clé unique par ID et niveau
        onLongPress={() => openReportModal(comment.id)}
      >
        <View style={[styles.commentContainer, { marginLeft: level * 10 }]}>
          {/* Informations de l'utilisateur */}
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
              >
                <Icon name="trash" size={16} color="#656765" />
              </TouchableOpacity>
            )}
          </View>

          {/* Texte du commentaire */}
          <Text style={styles.commentText}>{comment.text}</Text>

          {/* Boutons d'actions */}
          <View style={styles.actionButtonsContainer}>
            {!comment.parentId && (
              <TouchableOpacity
                onPress={() => setReplyTo(comment.id)}
                style={styles.commentButton}
              >
                <View style={styles.commentButtonContent}>
                  <Icon
                    name="chatbubble-outline"
                    size={22}
                    style={styles.commentIcon}
                    color={"#656765"}
                  />
                  <Text style={styles.commentCountText}>
                    {comment.replies?.length ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Champ de réponse */}
          {replyTo === comment.id && (
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
                  {isSubmitting ? "Envoi..." : "Envoyer"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Réponses imbriquées */}
          {comment.replies && comment.replies.length > 0 && (
            <>
              {expandedComments[comment.id] &&
                renderComments(comment.replies, level + 1)}
              <TouchableOpacity
                onPress={() =>
                  setExpandedComments((prev) => ({
                    ...prev,
                    [comment.id]: !expandedComments[comment.id],
                  }))
                }
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
      </TouchableWithoutFeedback>
    ));
  };

  
  const navigateToUserProfile = (userId: string) => {
    navigation.navigate("UserProfileScreen", { userId });
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
      const userId = await getUserId(); // Récupération de l'ID de l'utilisateur

      const response = await fetch(`${API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          to: "yannleroy23@gmail.com", // Adresse mail du destinataire
          subject: "Signalement d'un commentaire",
          reportReason,
          reporterId: userId,
          commentId: selectedCommentId, // Ajouter le champ commentId
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
          {/* ScrollView principal */}
          <ScrollView
            style={styles.card}
            scrollEnabled={!isReportModalVisible}
            keyboardShouldPersistTaps="handled" // Important pour gérer les taps
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.addComment}>
              <Text style={styles.title}>Commentaires :</Text>
              <View style={styles.commentInputContainer}>
                <TextInput
                  ref={commentInputRef} // Ajout de la référence ici
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
                    isSubmitting && { backgroundColor: "#ccc" }, // Grise le bouton
                  ]}
                  disabled={isSubmitting} // Désactive le bouton
                >
                  <Text style={styles.submitCommentText}>
                    {isSubmitting ? "Envoi..." : "Envoyer"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {comments.length === 0 ? (
              <Text style={styles.noCommentsText}>
                Aucun commentaire publié
              </Text>
            ) : (
              <View key={comments.length}>{renderComments(comments)}</View>
            )}
          </ScrollView>

          {/* Modal pour le signalement */}
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

          {comments.length > 0 && (
            <View style={styles.alertContainer}>
              <Text style={styles.alert}>
                Rester appuyer sur un commentaire pour le signaler
              </Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
  );
};

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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginTop: 15,
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
    flexDirection: "row", // Place les boutons en ligne
    gap: 10, // Espacement entre les boutons
    alignItems: "center", // Aligne les boutons verticalement
    marginTop: 10, // Espacement au-dessus des boutons
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
    backgroundColor: "#4CAF50",
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
    top: 0, // Occupe toute la hauteur
    left: 0,
    right: 0,
    bottom: 0, // Occupe toute la hauteur
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, // Toujours au-dessus
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
    elevation: 10, // Ombre pour un effet surélevé
  },
  textInput: {
    borderWidth: 1,
    height: 50,
    width: "100%",
    textAlign: "center",
    borderColor: "#ccc", // Light gray border
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F2F4F7", // Subtle off-white background
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700", // Titre plus bold
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
    textAlignVertical: "center", // Centre le texte verticalement
    minHeight: 20, // Hauteur minimale pour assurer un alignement correct
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
    marginVertical: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 35,
    backgroundColor: "#ffffff",
  },
  submitCommentButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    marginVertical: 15,

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
  commentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentIcon: {
    marginTop: 12,
    marginLeft: 5, // Espacement entre l'icône et le texte
  },
  commentCountText: {
    fontWeight: "bold",
    color: "#656765",
    fontSize: 14,
    marginTop: 12,
    marginLeft: 5,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
});

