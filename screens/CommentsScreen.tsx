// Chemin : frontend/screens/CommentsScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserProfile } from "../context/UserProfileContext";
import Sidebar from "../components/common/Sidebar";
// @ts-ignore
import { API_URL } from "@env";
import axios from "axios";

/**
 * CommentsScreen - Page dédiée aux commentaires de l'utilisateur
 * Affiche tous les commentaires créés par l'utilisateur
 */
const CommentsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
 const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const dummyFn = () => {};
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fonction pour récupérer les commentaires de l'utilisateur
  const fetchUserComments = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      const response = await axios.get(`${API_URL}/users/${user.id}/comments`);
      setComments(response.data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des commentaires:", err);
      setError("Impossible de charger vos commentaires");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserComments();
  }, [fetchUserComments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserComments();
  }, [fetchUserComments]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // ✅ Navigation avec l'ID du post pour scroller automatiquement
  const navigateToPost = useCallback(
    (postId: number) => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }
      
      console.log(`🎯 Navigation vers le post ${postId}`);
      
      // On passe le postId en paramètre pour que SocialScreen sache vers quel post scroller
      navigation.navigate("Main", { 
        screen: "Social",
        params: { scrollToPostId: postId }
      });
    },
    [navigation, isSidebarOpen]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Chargement de vos commentaires...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={60} color="#F44336" />
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserComments}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FF9800", "#F57C00"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="bars" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Mes Commentaires</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <LinearGradient
          colors={["rgba(255, 152, 0, 0.1)", "rgba(245, 124, 0, 0.05)"]}
          style={styles.statsCard}
        >
          <View style={styles.statsContent}>
            <FontAwesome5 name="comments" size={32} color="#FF9800" />
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsValue}>{comments.length}</Text>
              <Text style={styles.statsLabel}>
                {comments.length > 1 ? "Commentaires" : "Commentaire"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="comments" size={60} color="#D4D4D4" />
            <Text style={styles.emptyTitle}>Aucun commentaire</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore créé de commentaire
            </Text>
          </View>
        ) : (
          comments.map((comment) => (
            <TouchableOpacity
              key={comment.id}
              activeOpacity={0.8}
              onPress={() => navigateToPost(comment.post.id)}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                style={styles.commentCard}
              >
                <View style={styles.commentHeader}>
                  <View style={styles.commentHeaderLeft}>
                    <FontAwesome5 name="calendar" size={14} color="#737373" />
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={styles.likesContainer}>
                    <FontAwesome5 name="heart" size={12} color="#FF416C" />
                    <Text style={styles.likesCount}>
                      {comment.likesCount || 0}
                    </Text>
                  </View>
                </View>

                <Text style={styles.commentText}>{comment.text}</Text>

                <View style={styles.postInfoContainer}>
                  <View style={styles.postInfoHeader}>
                    <FontAwesome5 name="reply" size={12} color="#FF9800" />
                    <Text style={styles.postInfoLabel}>
                      Commentaire sur la publication de{" "}
                      <Text style={styles.postAuthor}>
                        {comment.post.authorName}
                      </Text>
                    </Text>
                  </View>
                  <Text style={styles.postContent} numberOfLines={2}>
                    {comment.post.content}
                  </Text>
                </View>

                <View style={styles.viewPostButton}>
                  <Text style={styles.viewPostText}>Voir la publication</Text>
                  <FontAwesome5
                    name="chevron-right"
                    size={12}
                    color="#FF9800"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        )}

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
    borderColor: "rgba(255, 152, 0, 0.2)",
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
  commentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  commentHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentDate: {
    fontSize: 13,
    color: "#737373",
    marginLeft: 8,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 65, 108, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likesCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF416C",
    marginLeft: 6,
  },
  commentText: {
    fontSize: 15,
    color: "#0A0A0A",
    lineHeight: 22,
    marginBottom: 12,
  },
  postInfoContainer: {
    backgroundColor: "rgba(255, 152, 0, 0.05)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  postInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  postInfoLabel: {
    fontSize: 12,
    color: "#737373",
    marginLeft: 6,
  },
  postAuthor: {
    fontWeight: "700",
    color: "#FF9800",
  },
  postContent: {
    fontSize: 13,
    color: "#262626",
    fontStyle: "italic",
  },
  viewPostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
  },
  viewPostText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF9800",
    marginRight: 6,
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
    backgroundColor: "#FF9800",
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

export default CommentsScreen;