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
  Dimensions,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
// @ts-ignore
import { API_URL } from "@env";
import { RouteProp } from "@react-navigation/native";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";
import { useToken } from "../hooks/useToken";
import { Share } from "react-native";

interface Post {
  likedByUser: any;
  id: string;
  profilePhoto?: string;
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  content?: string;
  likesCount?: number;
  comments?: Comment[];
  photos?: string[];
}

interface Comment {
  id: string;
  userProfilePhoto?: string;
  userName?: string;
  createdAt?: string;
  text: string;
  parentId?: string | null;
  userId?: string;
  replies?: Comment[];
}

type PostDetailsRouteProp = RouteProp<{ params: { postId: string } }, "params">;

export default function PostDetailsScreen({ navigation }) {
  const { unreadCount } = useNotification();
  const route = useRoute<PostDetailsRouteProp>();
  const { postId } = route.params;
  const { getUserId } = useToken();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyVisibility, setReplyVisibility] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [scaleValue]);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchUserId();
    fetchPostDetails();
  }, [postId]);

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const { getToken } = useToken();
      const token = await getToken();
  
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const postData = await response.json();
  
      const sortedComments = postData.comments.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  
      setPost({
        ...postData,
        comments: sortedComments,
      });
    } catch (error) {
      console.error("Erreur :", error.message);
      setPost(null);
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
      fetchPostDetails();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'aimer la publication."
      );
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error("Impossible de récupérer l'ID utilisateur.");
        return;
      }

      console.log(
        `🔄 Tentative de like du commentaire ${commentId} par l'utilisateur ${userId}`
      );

      const response = await fetch(
        `${API_URL}/posts/comments/${commentId}/like`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du like du commentaire");
      }

      const data = await response.json();
      console.log("🔄 Réponse API Like :", data);

      setPost((prevPost) => {
        if (!prevPost || !prevPost.comments) return prevPost;

        const updatedComments = prevPost.comments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likesCount: data.likesCount,
                likedByUser: data.likedByUser,
              }
            : comment
        );

        const sortedComments = updatedComments.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
        return { ...prevPost, comments: sortedComments };
      });
      fetchPostDetails();
    } catch (error) {
      console.error("Erreur :", error.message);
      Alert.alert(
        "Erreur",
        error.message || "Impossible d'aimer le commentaire."
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
          postId: post?.id,
          userId,
          text: replyInputs[parentId],
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de la réponse");
      }

      setReplyInputs((prev) => ({ ...prev, [parentId]: "" }));
      setReplyToCommentId(null);

      const newReply = await response.json();
      setPost((prevPost) => {
        if (!prevPost || !prevPost.comments) return prevPost;

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
              fetchPostDetails();
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

              fetchPostDetails();
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
              fetchPostDetails();
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

  const renderComment = (comment, isLastComment) => (
    <View
      key={comment.id}
      style={[
        styles.commentContainer,
        isLastComment && styles.lastCommentContainer,  
      ]}
    >
      {/* Avatar et contenu du commentaire principal */}
      <View style={styles.commentBloc}>
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
            <Icon name="trash" size={16} color="#656765" />
          </TouchableOpacity>
        )}
        <View style={styles.commentContent}>
          <View style={styles.commentVisible}>
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
          </View>
          {/* Bouton Répondre */}
          <View style={styles.actionButton}>
            <TouchableOpacity onPress={() => handleLikeComment(comment.id)}>
              <View style={styles.likeCommentButton}>
                <Icon
                  name={comment.likedByUser ? "heart" : "heart-outline"}
                  size={20}
                  color={comment.likedByUser ? "#FF0000" : "#656765"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.likeCommentText,
                    comment.likedByUser && { color: "#FF0000" },
                  ]}
                >
                  {comment.likesCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
  
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
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreText}>
                {replyVisibility[comment.id]
                  ? "Masquer les réponses"
                  : `Afficher ${comment.replies.length} réponse${
                      comment.replies.length > 1 ? "s" : ""
                    }`}
              </Text>
            </TouchableOpacity>
          )}
  
          {/* Affichage des réponses imbriquées si visible */}
          {replyVisibility[comment.id] &&
            comment.replies &&
            comment.replies.length > 0 && (
              <View>
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
                          <Icon name="trash" size={16} color="#656765" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
        </View>
      </View>
    </View>
  );

  const handlePhotoPress = (photo) => {
    console.log("Photo pressée :", photo);
    setSelectedPhoto(photo);
    setIsModalVisible(true);
  };

  const handleScrollImage = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const screenWidth = Dimensions.get("window").width;
    const index = Math.round(contentOffsetX / screenWidth);
    setActiveIndex(index);
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Je suis sur que ça peux t'interesser 😉 ! https://smartcities.com/post/123",
        title: "Partager ce post",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Partagé via :", result.activityType);
        } else {
          console.log("Partage réussi !");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Partage annulé");
      }
    } catch (error) {
      console.error("Erreur lors du partage :", error.message);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (!post) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/images/sad.png")}
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
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#FFFFFC"
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
              color={unreadCount > 0 ? "#FFFFFC" : "#FFFFFC"}
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
            <Image
              source={{
                uri: post.profilePhoto || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
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
            {post.authorId && userId && `${post.authorId}` === `${userId}` && (
              <TouchableOpacity
                style={styles.deleteIconPost}
                onPress={() => handleDeletePost(post.id)}
              >
                <Icon name="trash" size={20} color="#656765" />
              </TouchableOpacity>
            )}
          </View>

          {/* Contenu du post */}
          <Text style={styles.postText}>
            {post.content || "Contenu indisponible"}
          </Text>

          {/* Carrousel d'images */}
          {post.photos && post.photos.length > 0 && (
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScrollImage}
                scrollEventThrottle={16}
                contentContainerStyle={{ margin: 0, padding: 0 }}
              >
                {post.photos.map((photo, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handlePhotoPress(photo)}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.photoCarouselItem}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
              >
                <View style={styles.modalBackground}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}
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
              {/* Indicateurs dynamiques */}
              <View style={styles.indicatorsContainer}>
                {post.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      activeIndex === index && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Actions du post */}
          <View style={styles.postActions}>
            <TouchableOpacity
              onPress={() => handleLike(post.id)}
              style={[styles.likeButton, post.likedByUser]}
            >
              <View style={styles.likeButtonContent}>
                <Icon
                  name={post.likedByUser ? "thumbs-up" : "thumbs-up-outline"}
                  size={22}
                  color={post.likedByUser ? "#007bff" : "#656765"}
                  style={styles.likeIcon}
                />
                <Text
                  style={[
                    styles.likeButtonText,
                    { color: post.likedByUser ? "#007bff" : "#656765" },
                  ]}
                >
                  {post.likesCount || 0} {/* Nombre de likes */}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Icon name="share-outline" size={26} style={styles.shareIcon} />
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
                .map((comment, index, array) => renderComment(comment, index === array.length - 1))}
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
  photoCarouselItem: {
    width: Dimensions.get("window").width,
    height: 200,
    resizeMode: "cover",
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
    marginVertical: 5,
  },
  activeIndicator: {
    backgroundColor: "#000",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#235562",
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
    backgroundColor: "#235562",
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
    marginBottom: 10,
  },
  actionButton: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 5,
  },
  replyButtonText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#FFFFFC",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc",
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
    right: 15,
    top: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 5,
    zIndex: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    marginLeft: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 15,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 15,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postText: {
    fontSize: 16,
    marginBottom: 20,
    marginTop: 10,
    marginLeft: 18,
    fontWeight: "500",
    color: "#444",
  },
  shareIcon: {
    color: "#656765",
    marginRight: 15,
  },
  postActions: {
    marginLeft: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  likeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  commentBloc: {
    flexDirection: "row",
  },
  postInfo: {
    flex: 1,
  },
  likeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeIcon: {
    marginRight: 3,
  },
  likeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 3,
    marginTop: 3,
  },
  commentsSection: {
    marginTop: 5,
    paddingHorizontal: 10,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 15,
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
    backgroundColor: "#235562",
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
    color: "#007bff",
    fontWeight: "bold",
    fontSize: 14,
  },
  showMoreButton: {
    alignSelf: "flex-start",
    padding: 5,
    marginTop: 10,
    borderRadius: 5,
  },
  deleteIconComment: {
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 99,
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
    marginLeft: 15,
    marginTop: 1,
    alignItems: "center",
  },
  addReplyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  commentContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 5,
    borderRadius: 8,
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    width: "100%",
    maxWidth: "100%",
    padding: 10,
    paddingVertical: 15,
    backgroundColor: "#eef6ff",
    borderRadius: 20,
    paddingRight: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#007bff",
    overflow: "hidden",
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 5,
  },
  commentContent: {
    width: "100%",
    flexShrink: 1,
    overflow: "hidden",
  },
  commentVisible: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 20,
  },
  userNameComment: {
    fontWeight: "bold",
    fontSize: 14,
    paddingLeft: 5,
    color: "#333",
  },
  timestampComment: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
    marginBottom: 5,
    paddingLeft: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    paddingLeft: 5,
  },
  deleteIconReply: {
    position: "absolute",
    right: 0,
    top: 1,
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
    backgroundColor: "#235562",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    shadowColor: "#235562",
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
    marginTop: 15,
    marginBottom: 20,
  },
  fullscreenPhoto: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 10,
  },
  lastCommentContainer: {
    marginBottom: 20,  
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
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
    width: "48%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  likeCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 5,
    marginTop: 5,
  },
  likeCommentText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#656765",
    fontWeight: "bold",
  },
});
