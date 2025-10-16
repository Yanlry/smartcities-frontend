// Chemin : frontend/screens/PostsScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserProfile } from "../context/UserProfileContext";
import Sidebar from "../components/common/Sidebar";
// @ts-ignore
import { API_URL } from "@env";
import axios from "axios";
import styles from "../styles/screens/PostsScreen.styles";

const { width } = Dimensions.get("window");

/**
 * PostsScreen - Page dédiée aux publications de l'utilisateur
 * Affiche toutes les publications créées par l'utilisateur
 */
const PostsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
 const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const dummyFn = () => {};
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fonction pour récupérer les publications de l'utilisateur
  const fetchUserPosts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      // Utilisation de l'endpoint existant : GET /posts/author/:authorId
      const response = await axios.get(`${API_URL}/posts/author/${user.id}`);
      setPosts(response.data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des publications:", err);
      setError("Impossible de charger vos publications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Charger les publications au montage du composant
  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  // Fonction pour rafraîchir les données
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserPosts();
  }, [fetchUserPosts]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // ✅ MODIFIÉ : Navigation vers SocialScreen avec scroll automatique
  const navigateToPostDetail = useCallback(
    (postId: number) => {
      // Fermer la sidebar si elle est ouverte
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      console.log(`🎯 Navigation vers le post ${postId} dans SocialScreen`);
      
      // On navigue vers SocialScreen (dans le TabNavigator) avec l'ID du post
      navigation.navigate("Main", { 
        screen: "Social",
        params: { scrollToPostId: postId }
      });
    },
    [navigation, isSidebarOpen]
  );

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C6FB" />
        <Text style={styles.loadingText}>Chargement de vos publications...</Text>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={60} color="#F44336" />
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserPosts}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec gradient bleu */}
      <LinearGradient
        colors={["#00C6FB", "#005BEA"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          {/* Bouton menu */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="bars" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Mes Publications</Text>

          {/* Bouton retour */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Contenu avec ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* En-tête avec statistiques */}
        <LinearGradient
          colors={["rgba(0, 198, 251, 0.1)", "rgba(0, 91, 234, 0.05)"]}
          style={styles.statsCard}
        >
          <View style={styles.statsContent}>
            <FontAwesome5 name="image" size={32} color="#00C6FB" />
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsValue}>{posts.length}</Text>
              <Text style={styles.statsLabel}>
                {posts.length > 1 ? "Publications" : "Publication"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Liste des publications */}
        {posts.length === 0 ? (
          // Message si aucune publication
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="image" size={60} color="#D4D4D4" />
            <Text style={styles.emptyTitle}>Aucune publication</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore créé de publication
            </Text>
          </View>
        ) : (
          // Affichage des publications
          posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              activeOpacity={0.8}
              onPress={() => navigateToPostDetail(post.id)}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                style={styles.postCard}
              >
                {/* En-tête de la publication */}
                <View style={styles.postHeader}>
                  <View style={styles.postHeaderLeft}>
                    <FontAwesome5 name="calendar" size={14} color="#737373" />
                    <Text style={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <FontAwesome5
                    name="chevron-right"
                    size={16}
                    color="#00C6FB"
                  />
                </View>

                {/* Contenu de la publication */}
                <Text style={styles.postContent} numberOfLines={3}>
                  {post.content}
                </Text>

                {/* Photos de la publication */}
                {post.photos && post.photos.length > 0 && (
                  <View style={styles.photosContainer}>
                    {post.photos.slice(0, 3).map((photoUrl: string, index: number) => (
                      <Image
                        key={index}
                        source={{ uri: photoUrl }}
                        style={styles.postPhoto}
                      />
                    ))}
                    {post.photos.length > 3 && (
                      <View style={styles.morePhotosOverlay}>
                        <Text style={styles.morePhotosText}>
                          +{post.photos.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Statistiques de la publication */}
                <View style={styles.postStats}>
                  <View style={styles.statItem}>
                    <FontAwesome5 name="heart" size={14} color="#FF416C" />
                    <Text style={styles.statText}>{post.likesCount || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <FontAwesome5 name="comment" size={14} color="#00C6FB" />
                    <Text style={styles.statText}>
                      {post.comments?.length || 0}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}

        {/* Espace en bas */}
        <View style={{ height: 40 }} />
      </ScrollView>

     {/* Sidebar (menu latéral) - VERSION SIMPLIFIÉE */}
     <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
};

export default PostsScreen;