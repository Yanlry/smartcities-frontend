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
    ? item.comments
    : item.comments.slice(0, 1); // Affiche un seul commentaire par défaut

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
                  throw new Error("Erreur lors de la suppression de la publication");
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
                  throw new Error("Erreur lors de la suppression du commentaire");
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
                  {item.createdAt
                    ? `${new Intl.DateTimeFormat("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(item.createdAt))}`
                    : "Date inconnue"}
                </Text>
                <Text style={styles.commentText}>{comment.text}</Text>
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
            </View>
          ))}
          {item.comments.length > 1 && (
            <TouchableOpacity
              onPress={() => toggleComments(item.id)}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>
                {isExpanded
                  ? "Cacher les commentaires"
                  : `Afficher ${item.comments.length - 1} commentaires`}
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

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_URL}/posts/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du commentaire");
      }

      // Recharger les publications après suppression du commentaire
      fetchPosts();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de supprimer le commentaire."
      );
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

  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userName: { fontWeight: "bold", fontSize: 14 },
  timestamp: { fontSize: 12, color: "#666" },
  userNameComment: { fontWeight: "bold", fontSize: 14 },
  timestampComment: { fontSize: 12, color: "#666", marginBottom: 5 },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 30,
  },
  postText: { fontSize: 14, marginBottom: 10 },
  postActions: { flexDirection: "row", justifyContent: "space-between" },
  likeButton: {
    backgroundColor: "#4267B2",
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
  commentsSection: { marginTop: 10 },
  commentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  commentContent: {
    backgroundColor: "#f0f2f5",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  commentUser: { fontWeight: "bold", marginBottom: 5 },
  commentText: { fontSize: 14 },
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
    backgroundColor: "#4267B2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  addCommentButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
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
    backgroundColor: "#4267B2",
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  newPostButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  postsList: { paddingBottom: 10 }, // Conteneur pour les posts
  showMoreText: {
    color: "#4267B2",
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
});
