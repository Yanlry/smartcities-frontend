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
    borderColor: "rgba(142, 45, 226, 0.2)",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0A0A0A",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#737373",
    marginTop: 4,
  },
  voteCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  voteBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  voteBadgeUp: {
    backgroundColor: "#10B981",
  },
  voteBadgeDown: {
    backgroundColor: "#EF4444",
  },
  voteBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },
  voteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  voteHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteDate: {
    fontSize: 12,
    color: "#737373",
    marginLeft: 6,
  },
  reportInfo: {
    backgroundColor: "rgba(142, 45, 226, 0.05)",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#8E2DE2",
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportTypeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 6,
  },
  reportDescription: {
    fontSize: 13,
    color: "#262626",
    lineHeight: 18,
    marginBottom: 12,
  },
  reportPhoto: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  reportStats: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  reportStatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  reportStatText: {
    fontSize: 13,
    color: "#737373",
    marginLeft: 6,
    fontWeight: "600",
  },
  viewReportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 12,
  },
  viewReportText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E2DE2",
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
    backgroundColor: "#8E2DE2",
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

export default VotesScreen;
