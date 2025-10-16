// Chemin : frontend/screens/SocialScreen.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import RefreshControl from "../components/common/Loader/RefreshControl";
import RefreshSuccessAnimation from "../components/common/Loader/RefreshSuccessAnimation";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/auth/useToken";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Share } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation/routes.types";
import styles from "../styles/screens/SocialScreen.styles";
/**
 * Type definitions for navigation
 */
type UserProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "UserProfileScreen"
>;

const { width: screenWidth } = Dimensions.get("window");

/**
 * Interface for SocialScreen props
 */
interface SocialScreenProps {
  handleScroll: (event: any) => void;
}

/**
 * Interface for Post
 */
interface Post {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  authorName: string;
  profilePhoto: string | null;
  likesCount: number;
  likedByUser: boolean;
  photos: string[];
  comments: Comment[];
}

/**
 * Interface for Comment
 */
interface Comment {
  id: number;
  text: string;
  createdAt: string;
  userId: number;
  userName: string;
  userProfilePhoto: string | null;
  likedByUser: boolean;
  likesCount: number;
  replies: Reply[];
}

/**
 * Interface for Reply (extends Comment)
 */
interface Reply {
  id: number;
  text: string;
  createdAt: string;
  userId: number;
  userName: string;
  userProfilePhoto: string | null;
  parentId: number;
}

/**
 * Interface for Filter
 */
interface Filter {
  label: string;
  value: boolean;
}

/**
 * SocialScreen component
 * Écran de fil d'actualité pour une application de réseau social
 */
export default function SocialScreen({ handleScroll }: SocialScreenProps) {
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const route = useRoute();
  const { getUserId, getToken } = useToken();

  // State management
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {}
  );
  const [visibleComments, setVisibleComments] = useState<
    Record<number, boolean>
  >({});
  const [userId, setUserId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyVisibility, setReplyVisibility] = useState<
    Record<number, boolean>
  >({});
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [visibleCommentSection, setVisibleCommentSection] = useState<
    Record<number, boolean>
  >({});
  const [isCityFilterEnabled, setIsCityFilterEnabled] =
    useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [expandedPostContent, setExpandedPostContent] = useState<
    Record<number, boolean>
  >({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showRefreshSuccess, setShowRefreshSuccess] = useState<boolean>(false);

  const flatListRef = useRef<any>(null);

  /**
   * Initialize component on mount
   */
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
        console.error(
          "Erreur d'initialisation:",
          error instanceof Error ? error.message : "Erreur inconnue"
        );
      }
    };

    initialize();
  }, []);

   // ✅ NOUVEAU : Effet pour scroller vers le post quand on arrive depuis CommentsScreen
   useEffect(() => {
    // On récupère le paramètre scrollToPostId depuis la navigation
    const scrollToPostId = (route.params as any)?.scrollToPostId;
    
    if (scrollToPostId && posts.length > 0 && flatListRef.current) {
      console.log(`🎯 Scroll automatique vers le post ${scrollToPostId}`);
      
      // On attend un peu que la liste soit bien rendue
      setTimeout(() => {
        // On trouve l'index du post dans la liste
        const postIndex = posts.findIndex(post => post.id === scrollToPostId);
        
        if (postIndex !== -1) {
          // On scrolle vers ce post
          flatListRef.current?.scrollToIndex({
            index: postIndex,
            animated: true,
            viewPosition: 0.1, // Position du post à 10% du haut de l'écran
          });
          
          // On ouvre automatiquement les commentaires de ce post
          setVisibleComments(prev => ({
            ...prev,
            [scrollToPostId]: true
          }));
          
          setVisibleCommentSection(prev => ({
            ...prev,
            [scrollToPostId]: true
          }));
          
          console.log(`✅ Scroll terminé et commentaires ouverts pour le post ${scrollToPostId}`);
        } else {
          console.log(`⚠️ Post ${scrollToPostId} non trouvé dans la liste`);
        }
      }, 500); // Délai pour laisser le temps à la FlatList de se rendre
    }
  }, [route.params, posts]); 

  const uploadImage = async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<string> => {
    // Exemple d'implémentation : retourner directement l'URI pour le débogage
    return file.uri;
  };

  /**
   * Create a new post
   */
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

      // Préparation des images uploadées en amont
      let uploadedPhotoUrls: string[] = [];
      if (selectedImage.length > 0) {
        uploadedPhotoUrls = await Promise.all(
          selectedImage.map(async (image) => {
            const filename = image.split("/").pop();
            const fileType = filename ? filename.split(".").pop() : "jpg";
            // uploadImage est une fonction prédéfinie qui upload l'image et renvoie l'URL finale
            return await uploadImage({
              uri: image,
              name: filename || "default.jpg",
              type: `image/${fileType}`,
            });
          })
        );
      }

      // Construction d'une publication locale optimiste
      const userProfilePhoto = "https://via.placeholder.com/150"; // à remplacer par la photo réelle si disponible
      const userName = "Chargement ..."; // à remplacer par le nom réel de l'utilisateur
      const optimisticPost: Post = {
        id: Math.floor(Math.random() * 100000), // ID temporaire en nombre
        content: newPostContent,
        photos: uploadedPhotoUrls,
        authorId: userId,
        profilePhoto: userProfilePhoto,
        authorName: userName,
        comments: [],
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedByUser: false,
      };

      // Mise à jour immédiate de l'état local
      setPosts((prevPosts) => [optimisticPost, ...prevPosts]);
      setNewPostContent("");
      setSelectedImage([]);

      // Envoi de la publication vers le backend
      const formData = new FormData();
      formData.append("content", optimisticPost.content);
      formData.append("authorId", userId.toString());
      if (selectedImage.length > 0) {
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
      // Optionnel : rafraîchir toute la liste pour être sûr d'avoir les données mises à jour
      fetchPosts();
      Alert.alert("Succès", "Votre publication a été créée avec succès !");
    } catch (error) {
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible de créer la publication."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle adding a new comment to a post
   */
  const handleAddComment = async (postId: number) => {
    try {
      const userId = await getUserId();
      const commentText = commentInputs[postId]?.trim();

      if (!userId || !commentText) {
        Alert.alert(
          "Erreur",
          "Le texte du commentaire est vide ou l'ID utilisateur est introuvable."
        );
        return;
      }

      // Construction d'un commentaire optimiste
      const userProfilePhoto = "https://via.placeholder.com/150"; // à remplacer par la photo réelle si disponible
      const userName = "Chargement ..."; // à remplacer par le nom réel de l'utilisateur
      const optimisticComment: Comment = {
        id: Math.floor(Math.random() * 100000), // ID temporaire en nombre
        text: commentText,
        userId,
        userName,
        userProfilePhoto,
        replies: [],
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedByUser: false,
      };

      // Mise à jour immédiate sur le post correspondant
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), optimisticComment],
              }
            : post
        )
      );
      // Réinitialisation de l'input
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

      // Envoi du commentaire vers le backend
      const response = await fetch(`${API_URL}/posts/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          userId,
          text: commentText,
        }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout du commentaire");
      }
      // Optionnel : rafraîchir le post pour récupérer le commentaire avec l'ID définitif, etc.
      fetchPosts();
    } catch (error) {
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible d'ajouter le commentaire."
      );
    }
  };

  /**
   * Fetch posts from API with optional city filtering
   */
  const fetchPosts = async (filterByCity = isCityFilterEnabled) => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const userId = await getUserId();

      if (!token || !userId) {
        throw new Error(
          "Impossible de récupérer un token ou un ID utilisateur valide. Veuillez vous reconnecter."
        );
      }

      // Get user data to determine city
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

      if (!userCity && filterByCity) {
        throw new Error("Aucune commune associée à cet utilisateur.");
      }

      // Build query for city filtering
      const query = filterByCity
        ? `?cityName=${encodeURIComponent(userCity)}`
        : "";

      // Fetch posts
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

      // Process and sort data
      // ✅ CORRECTION: Ajout du type explicite pour les paramètres
      const sortedData = data
        .map((post: Post) => ({
          ...post,
          comments: post.comments
            .map((comment: Comment) => ({
              ...comment,
              likedByUser: comment.likedByUser || false,
              likesCount: comment.likesCount || 0,
              replies: comment.replies
                ? comment.replies.sort(
                    (a: Reply, b: Reply) =>
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                  )
                : [],
            }))
            .sort(
              (a: Comment, b: Comment) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            ),
        }))
        .sort(
          (a: Post, b: Post) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setPosts(sortedData);

      // Update liked posts
      // ✅ CORRECTION: Ajout du type explicite pour le paramètre 'post'
      const userLikedPosts = sortedData
        .filter((post: Post) => post.likedByUser)
        .map((post: Post) => post.id);

      setLikedPosts(userLikedPosts);
    } catch (error) {
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible de charger les publications."
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle post like action
   */
  const handleLike = async (postId: number) => {
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

      // Update liked posts state for immediate UI feedback
      setLikedPosts((prevLikedPosts) =>
        prevLikedPosts.includes(postId)
          ? prevLikedPosts.filter((id) => id !== postId)
          : [...prevLikedPosts, postId]
      );

      // Update posts with optimistic response
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const isLiked = likedPosts.includes(postId);
            return {
              ...post,
              likedByUser: !isLiked,
              likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
            };
          }
          return post;
        })
      );
    } catch (error) {
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible d'aimer la publication."
      );
    }
  };

  /**
   * Handle comment like action
   */
  const handleLikeComment = async (commentId: number) => {
    try {
      const userId = await getUserId();
      if (!userId) {
        console.error("Impossible de récupérer l'ID utilisateur.");
        return;
      }

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

      // Update posts with like information
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
      Alert.alert(
        "Erreur",
        error instanceof Error
          ? error.message
          : "Impossible d'aimer le commentaire."
      );
    }
  };

  /**
   * Toggle visibility of comments section
   */
  const toggleComments = (postId: number) => {
    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  /**
   * Toggle visibility of comment input section
   */
  const toggleCommentsVisibility = (postId: number) => {
    setVisibleCommentSection((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  /**
   * Toggle both comments and comment input section
   */
  const toggleBothComments = (postId: number) => {
    toggleComments(postId);
    toggleCommentsVisibility(postId);
  };

  /**
   * Toggle expanded view for post content
   */
  const toggleExpandedContent = (postId: number) => {
    setExpandedPostContent((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  /**
   * Delete a post
   */
  const handleDeletePost = async (postId: number) => {
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
              setIsLoading(true);
              const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
              });

              if (!response.ok) {
                throw new Error(
                  "Erreur lors de la suppression de la publication"
                );
              }

              // Remove post from state
              setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== postId)
              );
              setIsLoading(false);
            } catch (error) {
              setIsLoading(false);
              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : "Impossible de supprimer la publication."
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Delete a comment
   */
  const handleDeleteComment = async (commentId: number) => {
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

              // Remove comment from state
              setPosts((prevPosts) =>
                prevPosts.map((post) => ({
                  ...post,
                  comments: post.comments.filter(
                    (comment) => comment.id !== commentId
                  ),
                }))
              );
            } catch (error) {
              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : "Impossible de supprimer le commentaire."
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Delete a reply
   */
  const handleDeleteReply = async (replyId: number) => {
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

              // Remove reply from state
              setPosts((prevPosts) =>
                prevPosts.map((post) => ({
                  ...post,
                  comments: post.comments.map((comment) => ({
                    ...comment,
                    replies: comment.replies.filter(
                      (reply) => reply.id !== replyId
                    ),
                  })),
                }))
              );
            } catch (error) {
              Alert.alert(
                "Erreur",
                error instanceof Error
                  ? error.message
                  : "Impossible de supprimer la réponse."
              );
            }
          },
        },
      ]
    );
  };

  /**
   * Handle photo press to show full screen
   */
  const handlePhotoPress = (photo: string) => {
    setSelectedPhoto(photo);
    setIsModalVisible(true);
  };

  /**
   * Share post functionality
   */
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          "Découvrez cette publication intéressante ! https://smartcities.com/post/123",
        title: "Partager cette publication",
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Partagé via:", result.activityType);
        } else {
          console.log("Partage réussi !");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Partage annulé");
      }
    } catch (error) {
      console.error(
        "Erreur lors du partage:",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
    }
  };

  /**
   * Handle image selection for new post
   */
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

  /**
   * Remove selected photo at index
   */
  const handleRemovePhoto = (index: number) => {
    const updatedImages = [...selectedImage];
    updatedImages.splice(index, 1);
    setSelectedImage(updatedImages);
  };

  /**
   * Handle image carousel scroll
   */
  const handleScrollImage = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setActiveIndex(index);
  };

  /**
   * Save user filter preference
   */
  const saveFilterPreference = async (filterByCity: boolean) => {
    try {
      await AsyncStorage.setItem(
        "userFilterPreference",
        filterByCity.toString()
      );
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des préférences:",
        error instanceof Error ? error.message : "Erreur inconnue"
      );
    }
  };

  /**
   * Navigate to user profile
   */
  const handleNavigate = (userId: number) => {
    navigation.navigate("UserProfileScreen", { userId: userId.toString() });
  };

  /**
   * Handle filter selection
   */
  const handleFilterSelect = (filterValue: boolean) => {
    setIsCityFilterEnabled(filterValue);
    saveFilterPreference(filterValue);
    fetchPosts(filterValue);
    setModalVisible(false);
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulez un délai afin d'afficher l'animation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // Rafraîchissez vos données ici, par exemple :
    fetchPosts();
    setRefreshing(false);
    setShowRefreshSuccess(true);
    setTimeout(() => {
      setShowRefreshSuccess(false);
    }, 1000);
  }, [fetchPosts]);

  // Available filters
  const filters: Filter[] = useMemo(
    () => [
      { label: "Toute la communauté Smarters", value: false },
      { label: "Publications de ma ville", value: true },
    ],
    []
  );

  // Get selected filter label
  const selectedFilter = useMemo(
    () =>
      filters.find((filter) => filter.value === isCityFilterEnabled)?.label ||
      filters[0].label,
    [filters, isCityFilterEnabled]
  );

  /**
   * Render post item
   */
  const renderItem = ({ item }: { item: Post }) => {
    const isExpanded = visibleComments[item.id];
    const displayedComments = isExpanded ? item.comments : [];
    const isContentExpanded = expandedPostContent[item.id];

    // Function to format date
    const formatDate = (dateString: string) => {
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateString));
    };

    // Check if post content is long enough to need expansion
    const isLongContent = item.content && item.content.length > 150;
    const displayContent =
      isLongContent && !isContentExpanded
        ? `${item.content.substring(0, 150)}...`
        : item.content;

    return (
      <View style={styles.postContainer}>
        {/* Post Header */}
        <TouchableOpacity
          onPress={() => handleNavigate(item.authorId)}
          style={styles.postHeader}
        >
          <Image
            source={{
              uri: item.profilePhoto || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.authorName || "Utilisateur inconnu"}
            </Text>
            <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Delete button (visible only to post author) */}
          {item.authorId === userId && (
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDeletePost(item.id)}
            >
              <Icon name="trash-outline" size={16} color="#656765" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Post Content */}
        <View style={styles.postContent}>
          <Text style={styles.postText}>{displayContent}</Text>

          {isLongContent && (
            <TouchableOpacity
              onPress={() => toggleExpandedContent(item.id)}
              style={styles.readMoreButton}
            >
              <Text style={styles.readMoreText}>
                {isContentExpanded ? "Voir moins" : "Lire la suite"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Image Carousel */}
        {item.photos && item.photos.length > 0 && (
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScrollImage}
              scrollEventThrottle={16}
              contentContainerStyle={styles.carouselContent}
            >
              {item.photos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handlePhotoPress(photo)}
                  activeOpacity={0.9}
                  style={styles.photoTouchable}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.photoCarouselItem}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Pagination Indicators */}
            {item.photos.length > 1 && (
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
            )}
          </View>
        )}

        {/* Full Screen Image Modal */}
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
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.fullscreenPhoto}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            onPress={() => handleLike(item.id)}
            style={styles.actionButton}
          >
            <View style={styles.actionButtonContent}>
              <Icon
                name={likedPosts.includes(item.id) ? "heart" : "heart-outline"}
                size={22}
                color={likedPosts.includes(item.id) ? "#E53935" : "#656765"}
                style={styles.actionIcon}
              />
              <Text
                style={[
                  styles.actionText,
                  likedPosts.includes(item.id) && styles.likedText,
                ]}
              >
                {item.likesCount > 0 ? item.likesCount : ""}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleBothComments(item.id)}
            style={styles.actionButton}
          >
            <View style={styles.actionButtonContent}>
              <Icon
                name={
                  visibleComments[item.id] ? "chatbubble" : "chatbubble-outline"
                }
                size={22}
                color={visibleComments[item.id] ? "#1976D2" : "#656765"}
                style={styles.actionIcon}
              />
              <Text
                style={[
                  styles.actionText,
                  visibleComments[item.id] && styles.activeCommentText,
                ]}
              >
                {item.comments?.length > 0 ? item.comments.length : ""}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Icon
                name="share-social-outline"
                size={22}
                color="#656765"
                style={styles.actionIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Add Comment Input */}
        {visibleCommentSection[item.id] && (
          <View style={styles.addCommentContainer}>
            <View style={styles.inputWrapper}>
              <Image
                source={{
                  uri: "https://via.placeholder.com/150", // Replace with user's avatar
                }}
                style={styles.userAvatar}
              />
                <TextInput
                  style={styles.addCommentInput}
                  placeholder="Écrivez un commentaire..."
                  placeholderTextColor="#999"
                  value={commentInputs[item.id] || ""}
                  onChangeText={(text) =>
                    setCommentInputs((prev) => ({ ...prev, [item.id]: text }))
                  }
                />
                <TouchableOpacity
                  onPress={() => handleAddComment(item.id)}
                  style={[
                    styles.addCommentButton,
                    (!commentInputs[item.id] ||
                      !commentInputs[item.id].trim()) &&
                      styles.disabledButton,
                  ]}
                  disabled={
                    !commentInputs[item.id] || !commentInputs[item.id].trim()
                  }
                >
                  <Icon name="send" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Comments Section */}
        {item.comments?.length > 0 && visibleComments[item.id] && (
          <View style={styles.commentsSection}>
            {displayedComments.map((comment) => (
              <View key={comment.id} style={styles.commentWrapper}>
                <View style={styles.commentBloc}>
                  {/* Comment Avatar */}
                  <TouchableOpacity
                    onPress={() => handleNavigate(comment.userId)}
                  >
                    <Image
                      source={{
                        uri:
                          comment.userProfilePhoto ||
                          "https://via.placeholder.com/150",
                      }}
                      style={styles.userAvatar}
                    />
                  </TouchableOpacity>

                  {/* Comment Content */}
                  <View style={styles.commentContainer}>
                    <View style={styles.commentHeader}>
                      <TouchableOpacity
                        onPress={() => handleNavigate(comment.userId)}
                      >
                        <Text style={styles.commentUserName}>
                          {comment.userName || "Utilisateur inconnu"}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          onPress={() => handleLikeComment(comment.id)}
                          style={styles.commentAction}
                        >
                          <Icon
                            name={
                              comment.likedByUser ? "heart" : "heart-outline"
                            }
                            size={18}
                            color={comment.likedByUser ? "#E53935" : "#656765"}
                          />
                          {comment.likesCount > 0 && (
                            <Text
                              style={[
                                styles.commentActionText,
                                comment.likedByUser && styles.likedText,
                              ]}
                            >
                              {comment.likesCount}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>

                    {/* Comment Actions */}
                    <View style={styles.commentActions}>
                      <Text style={styles.commentTimestamp}>
                        {formatDate(comment.createdAt)}
                      </Text>
                      {/* Delete Comment Button */}
                      {comment.userId === userId && (
                        <TouchableOpacity
                          style={styles.deleteCommentIcon}
                          onPress={() => handleDeleteComment(comment.id)}
                        >
                          <Icon
                            name="trash-outline"
                            size={15}
                            color="#656765"
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  /**
   * Handle animated scroll
   */
  const handleAnimatedScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false, listener: handleScroll }
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <RefreshControl
        refreshing={refreshing}
        scrollY={scrollY}
        onRefreshStarted={onRefresh}
      />
      <RefreshSuccessAnimation
        visible={showRefreshSuccess}
        message="Succès !"
      />
      <Animated.FlatList
      ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        onScroll={handleAnimatedScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.feedContainer}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Post Creation Card */}
            <View style={styles.createPostContainer}>
              <TextInput
                style={styles.createPostInput}
                placeholder="Quoi de neuf dans votre quartier ?"
                placeholderTextColor="#999"
                multiline
                value={newPostContent}
                onChangeText={setNewPostContent}
              />
              {selectedImage.length > 0 && (
                <View style={styles.selectedImagesContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectedImagesScroll}
                  >
                    {selectedImage.map((uri, index) => (
                      <View key={index} style={styles.selectedImageWrapper}>
                        <Image source={{ uri }} style={styles.selectedImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => handleRemovePhoto(index)}
                        >
                          <Icon name="close-circle" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.mediaButton}
                  onPress={handlePickImage}
                >
                  <Icon name="image-outline" size={22} color="#1976D2" />
                  <Text style={styles.mediaButtonText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.postButton,
                    !newPostContent.trim() &&
                      selectedImage.length === 0 &&
                      styles.disabledButton,
                  ]}
                  onPress={handleAddPost}
                  disabled={
                    !newPostContent.trim() && selectedImage.length === 0
                  }
                >
                  <Text style={styles.postButtonText}>Publier</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filter Options */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setModalVisible(true)}
              >
                <Icon name="filter-outline" size={16} color="#656765" />
                <Text style={styles.filterText}>{selectedFilter}</Text>
                <Icon name="chevron-down" size={16} color="#656765" />
              </TouchableOpacity>

              {/* Filter Modal */}
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
                  <BlurView intensity={10} style={styles.blurView}>
                    <View style={styles.modalContent}>
                      {filters.map((filter, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.filterOption,
                            isCityFilterEnabled === filter.value &&
                              styles.activeFilter,
                          ]}
                          onPress={() => handleFilterSelect(filter.value)}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              isCityFilterEnabled === filter.value &&
                                styles.activeFilterText,
                            ]}
                          >
                            {filter.label}
                          </Text>
                          {isCityFilterEnabled === filter.value && (
                            <Icon name="checkmark" size={20} color="#FFFFFF" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </BlurView>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>
        }
      />

      {/* Loading Overlay */}
      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1976D2" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
