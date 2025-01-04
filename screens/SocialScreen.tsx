import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";
import Icon from "react-native-vector-icons/FontAwesome";

export default function SocialScreen() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { getUserId } = useToken();
  const [commentInputs, setCommentInputs] = useState({});
  const [visibleComments, setVisibleComments] = useState({}); // Pour gérer les commentaires visibles
  const [userId, setUserId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyVisibility, setReplyVisibility] = useState({});

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id); // Stockez l'ID utilisateur
    };
    fetchUserId();
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des publications");
      }
      let data = await response.json();

      // Trier les posts du plus récent au plus ancien
      data = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(data);
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de charger les publications."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error("Impossible de récupérer l'ID utilisateur.");
        return;
      }
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors du like de la publication");
      }
      fetchPosts();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'aimer la publication."
      );
    }
  };

  const handleAddComment = async (postId) => {
    const userId = await getUserId();
    console.log("Données envoyées au backend :", {
      postId,
      userId,
      text: commentInputs[postId],
    });

    if (!userId || !commentInputs[postId]?.trim()) {
      Alert.alert(
        "Erreur",
        "Le texte du commentaire est vide ou l'ID utilisateur est introuvable."
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId,
          text: commentInputs[postId],
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du commentaire");
      }

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'ajouter le commentaire."
      );
    }
  };

  const toggleComments = (postId) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const renderItem = ({ item }) => {
    const isExpanded = visibleComments[item.id];
    const displayedComments = isExpanded
      ? item.comments // Affiche tous les commentaires si "isExpanded" est vrai
      : []; // Aucun commentaire n'est affiché par défaut

    const handleDeletePost = async (postId) => {
      Alert.alert(
        "Confirmation",
        "Êtes-vous sûr de vouloir supprimer cette publication ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await fetch(`${API_URL}/posts/${postId}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                  throw new Error(
                    "Erreur lors de la suppression de la publication"
                  );
                }
                fetchPosts(); // Recharger les publications après suppression
              } catch (error) {
                Alert.alert(
                  "Erreur",
                  error.message || "Impossible de supprimer la publication."
                );
              }
            },
          },
        ]
      );
    };

    const handleDeleteComment = async (commentId) => {
      Alert.alert(
        "Confirmation",
        "Êtes-vous sûr de vouloir supprimer ce commentaire ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await fetch(
                  `${API_URL}/posts/comments/${commentId}`,
                  {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                  }
                );
                if (!response.ok) {
                  throw new Error(
                    "Erreur lors de la suppression du commentaire"
                  );
                }
                fetchPosts(); // Recharger les publications après suppression
              } catch (error) {
                Alert.alert(
                  "Erreur",
                  error.message || "Impossible de supprimer le commentaire."
                );
              }
            },
          },
        ]
      );
    };

    const handleAddReply = async (parentId) => {
      const userId = await getUserId();
      console.log("Données envoyées au backend :", {
        postId: item.id,
        userId,
        text: replyInputs[parentId],
        parentId,
      });

      if (!userId || !replyInputs[parentId]?.trim()) {
        Alert.alert(
          "Erreur",
          "Le texte de la réponse est vide ou l'ID utilisateur est introuvable."
        );
        return;
      }

      try {
        const response = await fetch(`${API_URL}/posts/comment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: item.id, // ID du post auquel le commentaire est lié
            userId, // ID de l'utilisateur actuel
            text: replyInputs[parentId], // Texte de la réponse
            parentId, // ID du commentaire parent
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout de la réponse");
        }

        // Réinitialiser l'input pour la réponse
        setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
        setReplyToCommentId(null); // Fermer le champ de réponse

        // Mettre à jour les commentaires via fetchPosts ou une autre fonction locale
        fetchPosts();
      } catch (error) {
        Alert.alert(
          "Erreur",
          error.message || "Impossible d'ajouter la réponse."
        );
      }
    };

    const handleDeleteReply = async (replyId) => {
      Alert.alert(
        "Confirmation",
        "Êtes-vous sûr de vouloir supprimer cette réponse ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await fetch(
                  `${API_URL}/posts/comments/${replyId}`,
                  {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                  }
                );
                if (!response.ok) {
                  throw new Error(
                    "Erreur lors de la suppression de la réponse"
                  );
                }
                fetchPosts(); // Recharger les publications et les commentaires après suppression
              } catch (error) {
                Alert.alert(
                  "Erreur",
                  error.message || "Impossible de supprimer la réponse."
                );
              }
            },
          },
        ]
      );
    };

    return (
      <View style={styles.postContainer}>
        {/* En-tête du post */}
        <View style={styles.postHeader}>
          <Image
            source={{
              uri: item.profilePhoto || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>
              {item.authorName || "Utilisateur inconnu"}
            </Text>
            <Text style={styles.timestamp}>
              {item.createdAt
                ? new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(item.createdAt))
                : "Date inconnue"}
            </Text>
          </View>
          {/* Bouton de suppression */}
          {item.authorId === userId && ( // Vérifiez si l'utilisateur est l'auteur
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDeletePost(item.id)}
            >
              <Icon name="trash" size={20} color="red" />
            </TouchableOpacity>
          )}
        </View>

        {/* Contenu du post */}
        <Text style={styles.postText}>
          {item.content || "Contenu indisponible"}
        </Text>

        {/* Actions du post */}
        <View style={styles.postActions}>
          <TouchableOpacity
            onPress={() => handleLike(item.id)}
            style={styles.likeButton}
          >
            <View style={styles.likeButtonContent}>
              <Icon
                name="thumbs-up"
                size={16}
                color="#fff"
                style={styles.likeIcon}
              />
              <Text style={styles.likeButtonText}>{item.likesCount || 0}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Ajouter un commentaire */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.addCommentInput}
            placeholder="Écrivez un commentaire..."
            value={commentInputs[item.id] || ""}
            onChangeText={(text) =>
              setCommentInputs((prev) => ({ ...prev, [item.id]: text }))
            }
          />
          <TouchableOpacity
            onPress={() => handleAddComment(item.id)}
            style={styles.addCommentButton}
          >
            <Text style={styles.addCommentButtonText}>Publier</Text>
          </TouchableOpacity>
        </View>

        {/* Section des commentaires */}
        {item.comments?.length > 0 && (
          <View style={styles.commentsSection}>
            {displayedComments.map((comment) => (
              <View key={comment.id} style={styles.commentContainer}>
                {/* Avatar et contenu du commentaire principal */}
                <Image
                  source={{
                    uri:
                      comment.userProfilePhoto ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentContent}>
                  <Text style={styles.userNameComment}>
                    {comment.userName || "Utilisateur inconnu"}
                  </Text>
                  <Text style={styles.timestampComment}>
                    {comment.createdAt
                      ? `${new Intl.DateTimeFormat("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(comment.createdAt))}`
                      : "Date inconnue"}
                  </Text>
                  <Text style={styles.commentText}>{comment.text}</Text>

                  {/* Bouton Répondre */}
                  <TouchableOpacity
                    onPress={() =>
                      setReplyToCommentId((prev) =>
                        prev === comment.id ? null : comment.id
                      )
                    }
                  >
                    <Text style={styles.replyButtonText}>Répondre</Text>
                  </TouchableOpacity>

                  {/* Champ de réponse conditionnel */}
                  {replyToCommentId === comment.id && (
                    <View style={styles.replyContainer}>
                      <TextInput
                        style={styles.replyInput}
                        placeholder="Écrivez une réponse..."
                        value={replyInputs[comment.id] || ""}
                        onChangeText={(text) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [comment.id]: text,
                          }))
                        }
                      />
                      <TouchableOpacity
                        onPress={() => handleAddReply(comment.id)}
                        style={styles.addReplyButton}
                      >
                        <Text style={styles.addReplyButtonText}>Publier</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Bouton pour afficher/masquer les réponses */}
                  {comment.replies && comment.replies.length > 0 && (
                    <TouchableOpacity
                      onPress={() =>
                        setReplyVisibility((prev) => ({
                          ...prev,
                          [comment.id]: !prev[comment.id],
                        }))
                      }
                    >
                      <Text style={styles.showMoreText}>
                        {replyVisibility[comment.id]
                          ? "Masquer les réponses"
                          : "Afficher les réponses"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Bouton de suppression pour les commentaires appartenant à l'utilisateur */}
                {comment.userId === userId && (
                  <TouchableOpacity
                    style={styles.deleteIconComment}
                    onPress={() => handleDeleteComment(comment.id)}
                  >
                    <Icon name="trash" size={16} color="red" />
                  </TouchableOpacity>
                )}

                {/* Afficher/Masquer les réponses */}
                {/* Afficher/Masquer les réponses */}
                {replyVisibility[comment.id] &&
                  comment.replies &&
                  comment.replies.length > 0 && (
                    <View style={styles.repliesSection}>
                      {comment.replies.map((reply) => (
                        <View key={reply.id} style={styles.replyContainer}>
                          <Image
                            source={{
                              uri:
                                reply.userProfilePhoto ||
                                "https://via.placeholder.com/150",
                            }}
                            style={styles.commentAvatar}
                          />
                          <View style={styles.commentContent}>
                            <Text style={styles.userNameComment}>
                              {reply.userName || "Utilisateur inconnu"}
                            </Text>
                            <Text style={styles.timestampComment}>
                              {reply.createdAt
                                ? `${new Intl.DateTimeFormat("fr-FR", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }).format(new Date(reply.createdAt))}`
                                : "Date inconnue"}
                            </Text>
                            <Text style={styles.commentText}>{reply.text}</Text>

                            {/* Bouton de suppression pour les réponses */}
                            {reply.userId === userId && (
                              <TouchableOpacity
                                style={styles.deleteIconComment}
                                onPress={() => handleDeleteReply(reply.id)}
                              >
                                <Icon name="trash" size={16} color="red" />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
              </View>
            ))}

            {/* Afficher/Cacher les commentaires */}
            {item.comments.length >= 1 && (
              <TouchableOpacity
                onPress={() => toggleComments(item.id)}
                style={styles.showMoreButton}
              >
                <Text style={styles.showMoreText}>
                  {isExpanded
                    ? "Cacher les commentaires"
                    : `Afficher ${item.comments.length} commentaires`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const handleAddPost = async () => {
    if (newPostContent.trim()) {
      try {
        const userId = await getUserId();
        const response = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: newPostContent,
            authorId: userId,
          }),
        });
        if (!response.ok) {
          throw new Error("Erreur lors de la création de la publication");
        }
        setNewPostContent("");
        fetchPosts();
      } catch (error) {
        Alert.alert(
          "Erreur",
          error.message || "Impossible de créer la publication."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.newPostContainer}>
            <TextInput
              style={styles.newPostInput}
              placeholder="Quoi de neuf ?"
              value={newPostContent}
              onChangeText={setNewPostContent}
            />
            <TouchableOpacity
              style={styles.newPostButton}
              onPress={handleAddPost}
            >
              <Text style={styles.newPostButtonText}>Publier</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.postsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingTop: 110,
    paddingBottom: 90,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postText: {
    fontSize: 14,
    marginBottom: 10,
    color: "#444",
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  likeButton: {
    backgroundColor: "#29524A",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  likeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeIcon: {
    marginRight: 5, // Espace entre l'icône et le texte
  },
  likeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10,
  },
  addCommentInput: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 10,
    paddingLeft: 15,
    borderRadius: 38,
    marginRight: 10,
    fontSize: 14,
  },
  addCommentButton: {
    backgroundColor: "#29524A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addCommentButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  newPostContainer: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 30,
  },
  newPostInput: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 38,
    marginBottom: 10,
  },
  newPostButton: {
    backgroundColor: "#29524A",
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  newPostButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  postsList: {
    paddingBottom: 10, // Conteneur pour les posts
  },
  showMoreText: {
    color: "#29524A",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 5,
  },
  showMoreButton: {
    alignSelf: "flex-start",
    padding: 5,
    marginTop: 5,
    borderRadius: 5,
  },
  deleteIcon: {
    marginLeft: "auto",
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
  },
  deleteIconComment: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "70%",
    padding: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  addReplyButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    padding: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  addReplyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentContainer: {
    flexDirection: "column", // Permet d'empiler les réponses sous le commentaire principal
    alignItems: "flex-start",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
  },
  repliesSection: {
    marginTop: 10,
    marginLeft: 20, // Décalage des réponses pour indiquer la hiérarchie
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    width: "100%",
    padding: 10,
    backgroundColor: "#eef6ff",
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#007bff",
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  commentContent: {
    flex: 1,
  },
  userNameComment: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  timestampComment: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  replyButtonText: {
    color: "#007bff",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  deleteIconReply: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 5,
  },
});
