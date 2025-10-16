// Chemin : frontend/screens/VotesScreen.tsx

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
import styles from "../styles/screens/VotesScreen.styles";

const { width } = Dimensions.get("window");

/**
 * Interface pour un vote
 */
interface Vote {
  id: number;
  type: string; // "up" ou "down"
  createdAt: string;
  report: {
    id: number;
    title: string;
    description: string;
    type: string;
    city: string;
    createdAt: string;
    authorName: string;
    authorId: number;
    photos: string[];
    upVotes: number;
    downVotes: number;
    commentsCount: number;
  };
}

/**
 * VotesScreen - Page dédiée aux votes de l'utilisateur
 * Affiche tous les votes effectués par l'utilisateur sur des signalements
 */
const VotesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();
  const dummyFn = () => {};
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fonction pour récupérer les votes de l'utilisateur
  const fetchUserVotes = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      console.log(`📊 Récupération des votes pour l'utilisateur ${user.id}`);

      // Appel au nouvel endpoint
      const response = await axios.get(`${API_URL}/users/${user.id}/votes`);

      console.log(`✅ ${response.data.length} votes récupérés`);
      setVotes(response.data);
    } catch (err: any) {
      console.error("Erreur lors de la récupération des votes:", err);
      setError("Impossible de charger vos votes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Charger les votes au montage du composant
  useEffect(() => {
    fetchUserVotes();
  }, [fetchUserVotes]);

  // Fonction pour rafraîchir les données
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserVotes();
  }, [fetchUserVotes]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // ✅ Navigation vers le signalement avec scroll automatique
  const navigateToReport = useCallback(
    (reportId: number) => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
      }

      console.log(`🎯 Navigation vers le signalement ${reportId}`);

      // Navigation vers ReportDetailsScreen
      navigation.navigate("ReportDetailsScreen", { reportId });
    },
    [navigation, isSidebarOpen]
  );

  // Calcul des statistiques
  const upVotesCount = votes.filter((vote) => vote.type === "up").length;
  const downVotesCount = votes.filter((vote) => vote.type === "down").length;

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8E2DE2" />
        <Text style={styles.loadingText}>Chargement de vos votes...</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserVotes}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec gradient violet */}
      <LinearGradient
        colors={["#8E2DE2", "#4A00E0"]}
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

          <Text style={styles.headerTitle}>Mes Votes</Text>

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
          colors={["rgba(142, 45, 226, 0.1)", "rgba(74, 0, 224, 0.05)"]}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            {/* Total des votes */}
            <View style={styles.statItem}>
              <FontAwesome5 name="vote-yea" size={24} color="#8E2DE2" />
              <Text style={styles.statValue}>{votes.length}</Text>
              <Text style={styles.statLabel}>
                {votes.length > 1 ? "Votes" : "Vote"}
              </Text>
            </View>

            {/* Votes positifs */}
            <View style={styles.statItem}>
              <FontAwesome5 name="thumbs-up" size={24} color="#10B981" />
              <Text style={styles.statValue}>{upVotesCount}</Text>
              <Text style={styles.statLabel}>Pour</Text>
            </View>

            {/* Votes négatifs */}
            <View style={styles.statItem}>
              <FontAwesome5 name="thumbs-down" size={24} color="#EF4444" />
              <Text style={styles.statValue}>{downVotesCount}</Text>
              <Text style={styles.statLabel}>Contre</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Liste des votes */}
        {votes.length === 0 ? (
          // Message si aucun vote
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="vote-yea" size={60} color="#D4D4D4" />
            <Text style={styles.emptyTitle}>Aucun vote</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore voté sur un signalement
            </Text>
          </View>
        ) : (
          // Affichage des votes
          votes.map((vote) => (
            <TouchableOpacity
              key={vote.id}
              activeOpacity={0.8}
              onPress={() => navigateToReport(vote.report.id)}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                style={styles.voteCard}
              >
                {/* Badge du type de vote */}
                <View
                  style={[
                    styles.voteBadge,
                    vote.type === "up"
                      ? styles.voteBadgeUp
                      : styles.voteBadgeDown,
                  ]}
                >
                  <FontAwesome5
                    name={vote.type === "up" ? "thumbs-up" : "thumbs-down"}
                    size={14}
                    color="#FFFFFF"
                  />
                  <Text style={styles.voteBadgeText}>
                    {vote.type === "up" ? "POUR" : "CONTRE"}
                  </Text>
                </View>

                {/* En-tête du vote */}
                <View style={styles.voteHeader}>
                  <View style={styles.voteHeaderLeft}>
                    <FontAwesome5 name="calendar" size={12} color="#737373" />
                    <Text style={styles.voteDate}>
                      Voté le{" "}
                      {new Date(vote.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                {/* Informations du signalement */}
                <View style={styles.reportInfo}>
                  <View style={styles.reportHeader}>
                    <View
                      style={[
                        styles.reportTypeBadge,
                        { backgroundColor: getCategoryColor(vote.report.type) },
                      ]}
                    >
                      <FontAwesome5
                        name={getCategoryIcon(vote.report.type)}
                        size={12}
                        color="#FFFFFF"
                      />
                      <Text style={styles.reportTypeText}>
                        {vote.report.type}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.reportTitle} numberOfLines={2}>
                    {vote.report.title}
                  </Text>

                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {vote.report.description}
                  </Text>

                  {/* Photo du signalement */}
                  {vote.report.photos && vote.report.photos.length > 0 && (
                    <Image
                      source={{ uri: vote.report.photos[0] }}
                      style={styles.reportPhoto}
                    />
                  )}

                  {/* Statistiques du signalement */}
                  <View style={styles.reportStats}>
                    <View style={styles.reportStatItem}>
                      <FontAwesome5
                        name="thumbs-up"
                        size={12}
                        color="#10B981"
                      />
                      <Text style={styles.reportStatText}>
                        {vote.report.upVotes}
                      </Text>
                    </View>
                    <View style={styles.reportStatItem}>
                      <FontAwesome5
                        name="thumbs-down"
                        size={12}
                        color="#EF4444"
                      />
                      <Text style={styles.reportStatText}>
                        {vote.report.downVotes}
                      </Text>
                    </View>
                    <View style={styles.reportStatItem}>
                      <FontAwesome5 name="comment" size={12} color="#3B82F6" />
                      <Text style={styles.reportStatText}>
                        {vote.report.commentsCount}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bouton pour voir le signalement */}
                <View style={styles.viewReportButton}>
                  <Text style={styles.viewReportText}>Voir le signalement</Text>
                  <FontAwesome5
                    name="chevron-right"
                    size={12}
                    color="#8E2DE2"
                  />
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

// Fonction pour obtenir la couleur selon la catégorie
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Voirie: "#3B82F6",
    Éclairage: "#F59E0B",
    Propreté: "#10B981",
    Sécurité: "#EF4444",
    Environnement: "#059669",
    "Mobilier urbain": "#8B5CF6",
    Autre: "#6B7280",
  };
  return colors[category] || "#6B7280";
};

// Fonction pour obtenir l'icône selon la catégorie
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    Voirie: "road",
    Éclairage: "lightbulb",
    Propreté: "broom",
    Sécurité: "shield-alt",
    Environnement: "leaf",
    "Mobilier urbain": "building",
    Autre: "question-circle",
  };
  return icons[category] || "question-circle";
};

export default VotesScreen;
