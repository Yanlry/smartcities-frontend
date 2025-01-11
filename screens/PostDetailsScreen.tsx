import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import { useRoute } from "@react-navigation/native";
// @ts-ignore
import { API_URL } from "@env";
import { RouteProp } from "@react-navigation/native";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";
import { useToken } from "../hooks/useToken";

interface Post {
  id: string;
  profilePhoto?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  content?: string;
  likesCount?: number;
  comments?: Comment[];
  photos?: string[]; // Ajoutez les photos ici
}

interface Comment {
  id: string;
  userProfilePhoto?: string;
  userName?: string;
  createdAt?: string;
  text: string;
  parentId?: string | null;
  userId?: string;
  replies?: Comment[]; // Ajoutez les réponses ici
}

export default function PostDetailsScreen({ navigation }) {
  type PostDetailsRouteProp = RouteProp<
    { params: { postId: string } },
    "params"
  >;

  const route = useRoute<PostDetailsRouteProp>();
  const { postId } = route.params;
  const { getUserId } = useToken();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyVisibility, setReplyVisibility] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { unreadCount } = useNotification(); // Récupération du compteur
  const [userId, setUserId] = useState<number | null>(null);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // Animation infinie
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2, // Le bouton grandit
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1, // Retour à la taille normale
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop(); // Nettoyer à la fin
  }, [scaleValue]);

  const fetchPostDetails = async () => {
    setLoading(true); // Démarre le loader

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`);
      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`);
        setPost(null); // Définit le post à null si le post n'est pas trouvé
        return;
      }

      const data = await response.json();
      console.log("Données récupérées :", data);

      // Vérifie si le post est vide ou invalide
      if (!data || Object.keys(data).length === 0) {
        setPost(null); // Définit le post à null en cas de données invalides
      } else {
        // Ajoute des valeurs par défaut pour éviter des erreurs d'affichage
        const formattedPost = {
          ...data,
          photos: data.photos || [], // Définit un tableau vide si les photos sont absentes
          authorName: data.authorName || "Utilisateur inconnu", // Définit un nom par défaut si absent
          profilePhoto: data.profilePhoto || "https://via.placeholder.com/150", // URL par défaut pour la photo de profil
        };

        setPost(formattedPost); // Met à jour le post avec les données formatées
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du post :", error);
      setPost(null); // Définit le post à null en cas d'erreur
    } finally {
      setLoading(false); // Arrête le loader
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id); // Stockez l'ID utilisateur
    };
    fetchUserId();
    fetchPostDetails();
  }, [postId]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

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
      fetchPostDetails();
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
      fetchPostDetails();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'ajouter le commentaire."
      );
    }
  };

  const handleAddReply = async (parentId) => {
    const userId = await getUserId();
    console.log("Données envoyées au backend :", {
      postId: post?.id,
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
          postId: post?.id, // ID du post auquel la réponse est liée
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

      // Mettre à jour les commentaires localement (optionnel, pour un affichage instantané)
      const newReply = await response.json();
      setPost((prevPost) => {
        if (!prevPost || !prevPost.comments) return prevPost;

        // Trouver le commentaire parent et y ajouter la réponse
        const updatedComments = prevPost.comments.map((comment) => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        });

        return { ...prevPost, comments: updatedComments };
      });

      // Recharge les données depuis le backend (optionnel)
      fetchPostDetails();
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
                throw new Error("Erreur lors de la suppression de la réponse");
              }
              fetchPostDetails(); // Recharger les publications et les commentaires après suppression
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
                  "Erreur lors de la suppression du commentaire."
                );
              }

              fetchPostDetails(); // Recharger les détails du post après suppression
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
              // Recharger les publications après suppression
              fetchPostDetails(); // Si `fetchPosts` est une fonction de rafraîchissement
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

  const renderComment = (comment) => (
    <View key={comment.id} style={styles.commentContainer}>
      {/* Avatar et contenu du commentaire principal */}
      <Image
        source={{
          uri: comment.userProfilePhoto || "https://via.placeholder.com/150",
        }}
        style={styles.commentAvatar}
      />
      {/* Bouton Supprimer pour les commentaires de l'utilisateur connecté */}
      {comment.userId === userId && (
        <TouchableOpacity
          style={styles.deleteIconComment}
          onPress={() => handleDeleteComment(comment.id)}
        >
          <Icon name="delete" size={16} color="red" />
        </TouchableOpacity>
      )}
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
                [comment.id]: !prev[comment.id], // Inverser l'état pour afficher/masquer
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

        {/* Affichage des réponses imbriquées si visible */}
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

                    {/* Bouton Supprimer pour les réponses de l'utilisateur connecté */}
                    {reply.userId === userId && (
                      <TouchableOpacity
                        style={styles.deleteIconReply}
                        onPress={() => handleDeleteReply(reply.id)}
                      >
                        <Icon name="delete" size={16} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/images/sad.png")} // Chemin de votre image
          style={styles.image}
        />
        <Text style={styles.text}>
          Oups ! Ce que vous cherchez semble s’être envolé 😢
        </Text>
        <Text style={styles.subtext}>
          Revenez bientôt ou explorez d'autres contenus intéressants !
        </Text>

        {/* Bouton pour revenir en arrière */}
        <Animated.View
          style={[styles.buttonWrapper, { transform: [{ scale: scaleValue }] }]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()} // Revenir à l'écran précédent
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo); // Stocke l'URI de la photo sélectionnée
    setIsModalVisible(true); // Affiche le modal
  };

  return (
    <View>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#F7F2DE" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>SOCIAL</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={28}
              color={unreadCount > 0 ? "#F7F2DE" : "#F7F2DE"}
              style={{ marginRight: 10 }}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <ScrollView>
        <View style={styles.postContainer}>
          {/* En-tête du post */}
          <View style={styles.postHeader}>
            {/* Avatar de l'auteur */}
            <Image
              source={{
                uri: post.profilePhoto || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />

            {/* Informations sur l'auteur et la date */}
            <View style={styles.postInfo}>
              <Text style={styles.userName}>
                {post.authorName || "Utilisateur inconnu"}
              </Text>
              <Text style={styles.timestamp}>
                {post.createdAt
                  ? new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(post.createdAt))
                  : "Date inconnue"}
              </Text>
            </View>

            {/* Bouton de suppression visible uniquement si l'utilisateur est l'auteur */}
            {post.authorId && userId && `${post.authorId}` === `${userId}` && (
              <TouchableOpacity
                style={styles.deleteIconPost}
                onPress={() => handleDeletePost(post.id)}
              >
                <Icon name="delete" size={20} color="red" />
              </TouchableOpacity>
            )}
          </View>

          {/* Contenu du post */}
          <Text style={styles.postText}>
            {post.content || "Contenu indisponible"}
          </Text>

          {/* Affichage des photos */}
          {post.photos && post.photos.length > 0 && (
            <View style={styles.photosContainer}>
              {post.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePhotoPress(photo)} // Ajouter un agrandissement de l'image
                >
                  <Image source={{ uri: photo }} style={styles.postPhoto} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)} // Ferme le modal avec "Retour"
          >
            <View style={styles.modalBackground}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)} // Ferme le modal
              >
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>
              {selectedPhoto && (
                <Image
                  source={{ uri: selectedPhoto }}
                  style={styles.fullscreenPhoto}
                />
              )}
            </View>
          </Modal>

          {/* Actions du post */}
          <View style={styles.postActions}>
            <TouchableOpacity
              onPress={() => handleLike(post.id)}
              style={styles.likeButton}
            >
              <View style={styles.likeButtonContent}>
                <Icon
                  name="thumb-up"
                  size={16}
                  color="#fff"
                  style={styles.likeIcon}
                />
                <Text style={styles.likeButtonText}>
                  {post.likesCount || 0}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Ajouter un commentaire */}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.addCommentInput}
              placeholder="Écrivez un commentaire..."
              value={commentInputs[post.id] || ""}
              onChangeText={(text) =>
                setCommentInputs((prev) => ({ ...prev, [post.id]: text }))
              }
            />
            <TouchableOpacity
              onPress={() => handleAddComment(post.id)}
              style={styles.addCommentButton}
            >
              <Text style={styles.addCommentButtonText}>Publier</Text>
            </TouchableOpacity>
          </View>

          {/* Section des commentaires */}
          {post.comments && post.comments.length > 0 ? (
            <View style={styles.commentsSection}>
              {post.comments
                .filter((comment) => comment.parentId === null)
                .map((comment) => renderComment(comment))}
            </View>
          ) : (
            <Text style={styles.noPost}>Aucun commentaire pour le moment</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2B2A",
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  postPhoto: {
    width: 315,
    height: 300,
    margin: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2A2B2A", // Couleur sombre
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#2A2B2A", // Couleur dorée ou autre
    backgroundColor: "#F7F2DE",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc", // Utilisez le nom de la police que vous avez défini
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -7,
    right: 2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteIconPost: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 5,
    zIndex: 10, // Priorité d'affichage
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
    marginBottom: 150,
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
    backgroundColor: "#2A2B2A",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  postInfo: {
    flex: 1, // S'étend pour utiliser l'espace restant
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
    backgroundColor: "#2A2B2A",
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
  showMoreText: {
    color: "#2A2B2A",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 5,
  },
  deleteIconComment: {
    position: "absolute",
    right: 15,
    top: 15,
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
    width: "100%", // Utiliser la largeur maximale du parent
    maxWidth: "100%", // Empêcher le dépassement
    padding: 10,
    backgroundColor: "#eef6ff",
    borderRadius: 8,
    paddingRight: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#007bff",
    overflow: "hidden", // Empêche le débordement visible
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  commentContent: {
    width: "100%", // Utiliser toute la largeur disponible
    flexShrink: 1, // Permet de réduire le conteneur si le texte est long
    overflow: "hidden", // Empêche tout débordement visible
  },
  userNameComment: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  timestampComment: {
    fontSize: 10,
    color: "#888",
    marginTop:2,
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  deleteIconReply: {
    position: "absolute",
    right: 0,
    top: 1,
  },
  replyButtonText: {
    color: "#007bff",
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  image: {
    width: 320,
    height: 320,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  subtext: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  button: {
    backgroundColor: "#2A2B2A", // Couleur vive et chaude
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    shadowColor: "#2A2B2A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    textTransform: "uppercase",
  },
  noPost: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fond semi-transparent
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenPhoto: {
    width: "90%",
    height: "70%",
    resizeMode: "contain", // S'assure que l'image ne déborde pas
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  photoInGrid: {
    width: "48%", // Adaptez selon votre style
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
});
