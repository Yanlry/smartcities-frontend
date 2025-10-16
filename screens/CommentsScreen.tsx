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
import styles from "../styles/screens/CommentsScreen.styles";
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

export default CommentsScreen;