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

// Styles du composant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 198, 251, 0.2)",
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsTextContainer: {
    marginLeft: 16,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  statsLabel: {
    fontSize: 14,
    color: "#737373",
    marginTop: 4,
  },
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  postHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  postDate: {
    fontSize: 13,
    color: "#737373",
    marginLeft: 8,
  },
  postContent: {
    fontSize: 15,
    color: "#0A0A0A",
    lineHeight: 22,
    marginBottom: 12,
  },
  photosContainer: {
    flexDirection: "row",
    marginBottom: 12,
    position: "relative",
  },
  postPhoto: {
    width: (width - 80) / 3,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  morePhotosOverlay: {
    position: "absolute",
    right: 8,
    top: 0,
    width: (width - 80) / 3,
    height: 100,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  morePhotosText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  postStats: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: "#737373",
    marginLeft: 6,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#737373",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F44336",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#737373",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#00C6FB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PostsScreen;