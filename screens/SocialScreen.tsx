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
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

type UserProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserProfileScreen"
>;

export default function SocialScreen({ handleScroll }) {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const { getUserId } = useToken();

  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [userId, setUserId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyVisibility, setReplyVisibility] = useState({});
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [visibleCommentSection, setVisibleCommentSection] = useState({});
  const [isCityFilterEnabled, setIsCityFilterEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const id = await getUserId();
        setUserId(id);

        const savedFilter = await AsyncStorage.getItem("userFilterPreference");
        const filterEnabled = savedFilter === "true";
        setIsCityFilterEnabled(filterEnabled);

        fetchPosts(filterEnabled);
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error.message);
      }
    };

    initialize();
  }, []);

  const fetchPosts = async (filterByCity = isCityFilterEnabled) => {
    setIsLoading(true);
    try {
      const { getToken, getUserId } = useToken();

      const token = await getToken();
      const userId = await getUserId();

      if (!token || !userId) {
        throw new Error(
          "Impossible de récupérer un token ou un ID utilisateur valide. Veuillez vous reconnecter."
        );
      }

      console.log("ID utilisateur récupéré :", userId);

      const userResponse = await fetch(`${API_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!userResponse.ok) {
        throw new Error(
          "Impossible de récupérer les informations de l'utilisateur."
        );
      }

      const userData = await userResponse.json();

      const userCity = userData.nomCommune;
      if (!userCity) {
        throw new Error("Aucune commune associée à cet utilisateur.");
      }

      const query = filterByCity
        ? `?cityName=${encodeURIComponent(userCity)}`
        : "";

      const response = await fetch(`${API_URL}/posts${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des publications.");
      }

      const data = await response.json();

      const sortedData = data
        .map((post) => ({
          ...post,
          comments: post.comments.map((comment) => ({
            ...comment,
            likedByUser: comment.likedByUser || false,
            likesCount: comment.likesCount || 0,
          })),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setPosts(sortedData);

      const userLikedPosts = sortedData
        .filter((post) => post.likedByUser)
        .map((post) => post.id);

      setLikedPosts(userLikedPosts);
    } catch (error) {
      console.error("Erreur :", error.message);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de charger les publications."
      );
    } finally {
      setIsLoading(false);
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

      setLikedPosts((prevLikedPosts) =>
        prevLikedPosts.includes(postId)
          ? prevLikedPosts.filter((id) => id !== postId)
          : [...prevLikedPosts, postId]
      );

      fetchPosts();
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
        throw new Error("é Erreur lors du like du commentaire");
      }

      const data = await response.json();
      console.log("🔄 Réponse API Like :", data);

      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          comments: post.comments.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  likedByUser: data.liked,
                  likesCount: data.likesCount,
                }
              : comment
          ),
        }))
      );
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

  const toggleCommentsVisibility = (postId) => {
    setVisibleCommentSection((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const toggleBothComments = (postId) => {
    toggleComments(postId);
    toggleCommentsVisibility(postId);
  };

  const renderItem = ({ item }) => {
    const isExpanded = visibleComments[item.id];
    const displayedComments = isExpanded ? item.comments : [];

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
                fetchPosts();
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
                fetchPosts();
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
            postId: item.id,
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
                fetchPosts();
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

    const handlePhotoPress = (photo) => {
      console.log("Photo pressée :", photo);
      setSelectedPhoto(photo);
      setIsModalVisible(true);
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

    return (
      <View style={styles.postContainer}>
        {/* En-tête du post */}
        <TouchableOpacity onPress={() => handleNavigate(item.authorId)}>
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
            {item.authorId === userId && (
              <TouchableOpacity
                style={styles.deleteIcon}
                onPress={() => handleDeletePost(item.id)}
              >
                <Icon name="trash" size={20} color="#656765" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        {/* Contenu du post */}
        <Text style={styles.postText}>
          {item.content || "Contenu indisponible"}
        </Text>

        {/* Carrousel d'images du post */}
        {item.photos && item.photos.length > 0 && (
          <View>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScrollImage}
              scrollEventThrottle={16}
              contentContainerStyle={{ margin: 0, padding: 0 }}
            >
              {item.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePhotoPress(photo)}
                  activeOpacity={1}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.photoCarouselItem}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Indicateurs dynamiques */}
            <View style={styles.indicatorsContainer}>
              {item.photos.map((_, index) => (
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
        {/* Actions du post */}
        <View style={styles.postActions}>
          <TouchableOpacity
            onPress={() => handleLike(item.id)}
            style={[
              styles.likeButton,
              likedPosts.includes(item.id) && styles.likedButton,
            ]}
          >
            <View style={styles.likeButtonContent}>
              <Icon
                name={
                  likedPosts.includes(item.id)
                    ? "thumbs-up"
                    : "thumbs-up-outline"
                }
                size={22}
                color={likedPosts.includes(item.id) ? "#3B90A5" : "#656765"}
                style={styles.likeIcon}
              />
              <Text
                style={[
                  styles.likeButtonText,
                  {
                    color: likedPosts.includes(item.id) ? "#3B90A5" : "#656765",
                  },
                ]}
              >
                {likedPosts.includes(item.id)
                  ? item.likesCount > 1
                    ? `${item.likesCount}`
                    : "1"
                  : item.likesCount > 0
                  ? `${item.likesCount}`
                  : "0"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleBothComments(item.id)}
            style={styles.commentButton}
          >
            <View style={styles.commentButtonContent}>
              {/* Icône de commentaire qui change selon l'état */}
              <Icon
                style={styles.commentIcon}
                name={
                  visibleComments[item.id] ? "chatbubble" : "chatbubble-outline"
                }
                size={22}
                color={visibleComments[item.id] ? "#3B90A5" : "#656765"}
              />

              {/* Nombre de commentaires */}
              <Text
                style={[
                  styles.commentCountText,
                  visibleComments[item.id] && { color: "#3B90A5" },
                ]}
              >
                {item.comments?.length || 0}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Icon name="share-outline" size={22} style={styles.shareIcon} />
          </TouchableOpacity>
        </View>

        {/* Ajouter un commentaire */}
        {visibleCommentSection[item.id] && (
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
        )}
        {/* Section des commentaires */}
        {item.comments?.length > 0 && (
          <View style={styles.commentsSection}>
            {displayedComments.map((comment) => (
              <View key={comment.id}>
                <View style={styles.commentBloc}>
                  {/* Avatar et contenu du commentaire principal */}
                  <Image
                    source={{
                      uri:
                        comment.userProfilePhoto ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.commentAvatar}
                  />

                  <View style={styles.commentContainer}>
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
                </View>
                <View style={styles.actionButton}>
                  <TouchableOpacity
                    onPress={() => handleLikeComment(comment.id)}
                  >
                    <View style={styles.likeCommentButton}>
                      <Icon
                        name={comment.likedByUser ? "heart" : "heart-outline"}
                        size={20}
                        color={comment.likedByUser ? "#FF0000" : "#656765"}
                      />
                      <Text
                        style={[
                          styles.likeCommentText,
                          comment.likedByUser && { color: "#FF0000" },
                        ]}
                      >
                        {comment.likesCount} {/* 👈 Supprime "J'aime" */}
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
                    style={[
                      !replyVisibility[comment.id] &&
                        styles.marginBottomWhenHidden,
                    ]}
                  >
                    <Text style={styles.showMoreTextReply}>
                      {replyVisibility[comment.id]
                        ? `Masquer les réponses`
                        : `Afficher ${comment.replies.length} réponse${
                            comment.replies.length > 1 ? "s" : ""
                          }`}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Bouton de suppression pour les commentaires appartenant à l'utilisateur */}
                {comment.userId === userId && (
                  <TouchableOpacity
                    style={styles.deleteIconComment}
                    onPress={() => handleDeleteComment(comment.id)}
                  >
                    <Icon name="trash" size={16} color="#656765" />
                  </TouchableOpacity>
                )}

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
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleRemovePhoto = (index) => {
    const updatedImages = [...selectedImage];
    updatedImages.splice(index, 1);
    setSelectedImage(updatedImages);
  };

  const handleAddPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Erreur", "Le contenu de la publication est vide.");
      return;
    }

    setIsLoading(true);

    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert("Erreur", "Impossible de récupérer l'ID utilisateur.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("content", newPostContent);
      formData.append("authorId", userId.toString());

      if (selectedImage) {
        selectedImage.forEach((image) => {
          const filename = image.split("/").pop();
          const fileType = filename ? filename.split(".").pop() : "jpg";
          formData.append("photos", {
            uri: image,
            name: filename,
            type: `image/${fileType}`,
          } as any);
        });
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || "Erreur lors de la création de la publication"
        );
      }

      const newPost = await response.json();
      console.log("Publication créée :", newPost);

      setNewPostContent("");
      setSelectedImage([]);

      fetchPosts();

      Alert.alert("Succès", "Votre publication a été créée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la création de la publication :", error);
      Alert.alert(
        "Erreur",
        error.message || "Impossible de créer la publication."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (selectedImage.length >= 5) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez pas sélectionner plus de 5 images."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage((prevImages) => [...prevImages, result.assets[0].uri]);
    }
  };

  const handleScrollImage = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const screenWidth = Dimensions.get("window").width;
    const index = Math.round(contentOffsetX / screenWidth);
    setActiveIndex(index);
  };

  const saveFilterPreference = async (filterByCity) => {
    try {
      await AsyncStorage.setItem(
        "userFilterPreference",
        filterByCity.toString()
      );
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des préférences :",
        error.message
      );
    }
  };

  const handleNavigate = (userId: number) => {
    navigation.navigate("UserProfileScreen", { userId: userId.toString() });
  };

  const handleFilterSelect = (filterValue) => {
    setIsCityFilterEnabled(filterValue);
    saveFilterPreference(filterValue);
    fetchPosts(filterValue);
    setModalVisible(false);
  };
  
  const filters = [
    { label: "Toutes la communauté Smarters", value: false },
    { label: "Publications de ma ville", value: true },
  ];

  const selectedFilter = filters.find(
    (filter) => filter.value === isCityFilterEnabled
  )?.label;

  return (
    <View style={styles.container}>
      <FlatList
        onScroll={handleScroll}
        scrollEventThrottle={16}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View>
            {/* Conteneur pour la publication */}
            <View style={styles.newPostContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.newPostInput}
                  placeholder="Quoi de neuf ?"
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                />
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={handlePickImage}
                >
                  <Icon name="image" size={24} color="#3B90A5" />
                </TouchableOpacity>
              </View>

              <View>
                {selectedImage.length > 0 ? (
                  <>
                    <View style={styles.largeImageContainer}>
                      <Image
                        source={{ uri: selectedImage[0] }}
                        style={styles.largeImage}
                      />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemovePhoto(0)}
                      >
                        <Icon name="trash-outline" size={24} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.smallImagesContainer}>
                      {selectedImage.slice(1).map((uri, index) => (
                        <View key={index} style={styles.smallImageWrapper}>
                          <Image source={{ uri }} style={styles.smallImage} />
                          <TouchableOpacity
                            style={styles.deleteButtonSmall}
                            onPress={() => handleRemovePhoto(index + 1)}
                          >
                            <Icon
                              name="close-circle-outline"
                              size={20}
                              color="#FFF"
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.noImageText}>
                    Enrichissez votre post en sélectionnant jusqu'à 5 photos
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.publishButton}
                onPress={handleAddPost}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.publishButtonText}>Publier</Text>
                )}
              </TouchableOpacity>

              {isLoading && (
                <View style={styles.overlay}>
                  <ActivityIndicator size="large" color="#FFF" />
                </View>
              )}
            </View>

            {/* Conteneur pour les filtres */}
            <View style={styles.filterContainer}>
              {/* Bouton principal */}
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="settings-outline" size={16} />
                <Text style={styles.filterText}>
                  Préférence d'affichage : {selectedFilter}
                </Text>
              </TouchableOpacity>

              {/* Modal pour le menu déroulant */}
              <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setModalVisible(false)}
                >
                  <View style={styles.modalContent}>
                    <FlatList
                      data={filters}
                      keyExtractor={(item) => item.label}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.filterOption,
                            isCityFilterEnabled === item.value &&
                              styles.activeFilter,
                          ]}
                          onPress={() => handleFilterSelect(item.value)}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              isCityFilterEnabled === item.value &&
                                styles.activeFilterOptionText,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
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
    paddingBottom: 80,
  },
  marginBottomWhenHidden: {
    marginBottom: 20,
  },
  largeImageContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  likedButton: {},
  largeImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 20,
  },
  smallImagesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  smallImageWrapper: {
    position: "relative",
  },
  smallImage: {
    width: 75,
    height: 75,
    resizeMode: "cover",
    borderRadius: 10,
  },
  deleteButtonSmall: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 2,
    borderRadius: 15,
  },
  photoCarouselItem: {
    width: Dimensions.get("window").width,
    aspectRatio: 1,
    resizeMode: "contain",
    marginTop: 15,
  },
  newPostContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 100,
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
  },
  userName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 3,
    color: "#666",
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D3D3D3",
    marginHorizontal: 5,
  },
  activeIndicator: {
    backgroundColor: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    paddingTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postText: {
    fontSize: 16,
    marginTop: 5,
    marginLeft: 18,
    fontWeight: "500",
    color: "#444",
  },
  postActions: {
    padding: 10,
    flexDirection: "row",
  },
  shareIcon: {
    color: "#656765",
    marginTop: 17,
    marginLeft: 190,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  commentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentIcon: {
    marginTop: 12,
    marginLeft: 5,
  },
  commentCountText: {
    fontWeight: "bold",
    color: "#656765",
    fontSize: 14,
    marginTop: 12,
    marginLeft: 5,
  },
  actionButton: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 55,
    marginBottom: 15,
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
  replyCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginTop: 3,
  },
  replyCommentText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#656765",
    fontWeight: "bold",
  },
  commentBloc: {
    flexDirection: "row",
  },
  likeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  likeButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  fullscreenPhoto: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 10,
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
  likeIcon: {
    marginRight: 5,
  },
  likeButtonText: {
    color: "#656765",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 2,
  },
  commentsSection: {
    paddingHorizontal: 10,
  },
  noImageText: {
    textAlign: "center",
    fontSize: 12,
    color: "#999",
    marginTop: 10,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  photosRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  photoRowItem: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 10,
  },

  filterContainer: {
    alignItems: "center",
    margin: 10,
  },
  filterButton: {
    flexDirection: "row",
    borderRadius: 30,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#555",
    marginLeft: 5,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  activeFilter: {
    backgroundColor: "#3B90A5",
    borderRadius: 8,
  },
  filterOptionText: {
    fontSize: 16,
    color: "#333",
  },
  activeFilterOptionText: {
    color: "#FFF",
    fontWeight: "bold",
  },

  morePhotosOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "30%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  morePhotosText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
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
    backgroundColor: "#3B90A5",
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  newPostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  iconButton: {
    padding: 5,
  },
  publishButton: {
    backgroundColor: "#3B90A5",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  publishButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  postsList: {
    paddingBottom: 10,
  },
  showMoreTextComment: {
    color: "#555",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5,
  },
  showMoreButton: {
    alignSelf: "flex-start",
    padding: 5,
    marginTop: 5,
    borderRadius: 5,
  },
  showMoreTextReply: {
    color: "#3B90A5",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 55,
  },
  deleteIcon: {
    position: "absolute",
    right: 24,
    top: 5,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
  },
  deleteIconComment: {
    position: "absolute",
    right: 15,
    top: 10,
  },
  deleteIconReply: {
    position: "absolute",
    right: 8,
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

  commentContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    width: "85%",
    padding: 10,
    paddingLeft: 15,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
  },
  repliesSection: {
    marginTop: 10,
  },
  replyContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    marginLeft: 55,
    paddingVertical: 15,
    width: "85%",
    padding: 10,
    backgroundColor: "#eef6ff",
    borderRadius: 20,
    borderLeftWidth: 2,
    borderLeftColor: "#3B90A5",
  },
  addReplyButton: {
    backgroundColor: "#3B90A5",
    borderRadius: 5,
    padding: 8,
    marginTop: 1,
    marginLeft: 20,
    alignItems: "center",
  },
  addReplyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
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
    fontSize: 10,
    color: "#888",
    marginTop: 3,
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  replyButtonText: {
    color: "#555",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
});
