// Chemin : frontend/screens/StatisticsScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserProfile } from "../context/UserProfileContext";
import { useUserStats } from "../hooks/profile/index";
import Sidebar from "../components/common/Sidebar";
import RankBadge from "../components/home/ProfileSection/RankBadge";
import { useUserRanking } from "../hooks/user/useUserRanking";
import { useBadge } from "../hooks/ui/useBadge";

const { width } = Dimensions.get("window");

/**
 * StatisticsScreen - Page dédiée aux statistiques de l'utilisateur
 * Design moderne inspiré des réseaux sociaux premium
 *
 * Cette page affiche toutes les statistiques de l'utilisateur :
 * - Votes et feedback (positifs/négatifs)
 * - Activité (signalements, publications, événements, commentaires)
 * - Réseau social (abonnés, abonnements)
 * - Informations du compte
 */
const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();
  const dummyFn = () => {};
  const { stats, loading, error } = useUserStats(user?.id || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { getBadgeStyles } = useBadge();

  // Hooks pour le classement
  const { ranking, totalUsers, getRankingSuffix } = useUserRanking(
    user?.nomCommune || ""
  );

  const rankingSuffix = useMemo(
    () => getRankingSuffix(ranking),
    [getRankingSuffix, ranking]
  );

  const badgeStyle = useMemo(() => {
    return getBadgeStyles(stats?.votes?.length || 0);
  }, [getBadgeStyles, stats?.votes?.length]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Calculs des statistiques de votes
  const totalVotes = (voteSummary?.up || 0) + (voteSummary?.down || 0);
  const positivePercentage =
    totalVotes > 0
      ? Math.round(((voteSummary?.up || 0) / totalVotes) * 100)
      : 50;

  /**
   * Détermine la couleur du rating en fonction du pourcentage de votes positifs
   * - 85%+ : Vert foncé (excellent)
   * - 60-84% : Vert clair (bon)
   * - 50-59% : Orange (moyen)
   * - <50% : Rouge (faible)
   */
  const getRatingColor = (percentage: number) => {
    if (percentage >= 85) return "#4CAF50";
    if (percentage >= 60) return "#8BC34A";
    if (percentage >= 50) return "#FF9800";
    return "#F44336";
  };

  // Affichage pendant le chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8E2DE2" />
        <Text style={styles.loadingText}>
          Chargement de vos statistiques...
        </Text>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec gradient violet-indigo */}
      <LinearGradient
        colors={["#8E2DE2", "#4A00E0"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          {/* Bouton menu pour ouvrir la sidebar */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="bars" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Mes Statistiques</Text>

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

      {/* Contenu principal avec ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card de profil rapide avec nom, ville et badge de rang */}
        <LinearGradient
          colors={["rgba(142, 45, 226, 0.1)", "rgba(74, 0, 224, 0.05)"]}
          style={styles.profileCard}
        >
          <View style={styles.profileCardContent}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileCity}>
                📍 {user?.nomCommune || "Ville"}
              </Text>
            </View>

            {/* Badge de classement (cliquable pour aller à la page classements) */}
            {ranking && (
              <TouchableOpacity
                style={styles.rankBadgeContainer}
                onPress={() => navigation.navigate("RankingScreen")}
                activeOpacity={0.7}
              >
                <RankBadge
                  ranking={ranking}
                  rankingSuffix={rankingSuffix}
                  totalUsers={totalUsers || 0}
                  badgeStyle={badgeStyle}
                  onNavigateToRanking={() =>
                    navigation.navigate("RankingScreen")
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Section Votes et Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Votes et Feedback</Text>

          <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"]}
            style={styles.statsCard}
          >
            {/* Barre de progression des votes avec labels et pourcentages */}
            <View style={styles.voteProgressContainer}>
              {/* Labels au-dessus de la barre */}
              <View style={styles.voteLabels}>
                <View style={styles.voteLabelItem}>
                  <View
                    style={[
                      styles.voteDot,
                      { backgroundColor: getRatingColor(positivePercentage) },
                    ]}
                  />
                  <Text style={styles.voteLabel}>Positifs</Text>
                </View>
                <View style={styles.voteLabelItem}>
                  <View
                    style={[styles.voteDot, { backgroundColor: "#F44336" }]}
                  />
                  <Text style={styles.voteLabel}>Négatifs</Text>
                </View>
              </View>

              {/* Barre de progression bicolore */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarPositive,
                    {
                      width: `${positivePercentage}%`,
                      backgroundColor: getRatingColor(positivePercentage),
                    },
                  ]}
                />
                <View
                  style={[
                    styles.progressBarNegative,
                    { width: `${100 - positivePercentage}%` },
                  ]}
                />
              </View>

              {/* Pourcentages et nombres de votes sous la barre */}
              <View style={styles.voteNumbers}>
                <View style={styles.voteNumberItem}>
                  <Text
                    style={[
                      styles.votePercentage,
                      { color: getRatingColor(positivePercentage) },
                    ]}
                  >
                    {positivePercentage}%
                  </Text>
                  <Text style={styles.voteCount}>
                    {voteSummary?.up || 0} votes
                  </Text>
                </View>
                <View style={styles.voteNumberItem}>
                  <Text style={[styles.votePercentage, { color: "#F44336" }]}>
                    {100 - positivePercentage}%
                  </Text>
                  <Text style={styles.voteCount}>
                    {voteSummary?.down || 0} votes
                  </Text>
                </View>
              </View>
            </View>

            {/* Badge du total des votes */}
            <TouchableOpacity style={styles.totalVotesContainer}
              onPress={() => navigation.navigate("VotesScreen")}
              >
              
              <LinearGradient
                colors={["#8E2DE2", "#4A00E0"]}
                style={styles.totalVotesBadge}
              >
                <FontAwesome5 name="star" size={16} color="#FFFFFF" />
                <Text style={styles.totalVotesText}>
                  {totalVotes} votes au total
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Section Activité - Grille de 4 cartes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Mon Activité</Text>

          <View style={styles.activityGrid}>
            {/* ✅ Card Signalements - CLIQUABLE */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ReportScreen")}
            >
              <LinearGradient
                colors={["#FF416C", "#FF4B2B"]}
                style={styles.activityCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="bullhorn" size={24} color="#FFFFFF" />
                <Text style={styles.activityValue}>
                  {stats?.numberOfReports || 0}
                </Text>
                <Text style={styles.activityLabel}>Signalements</Text>
                <FontAwesome5
                  name="chevron-right"
                  size={12}
                  color="rgba(255, 255, 255, 0.7)"
                  style={styles.chevronIcon}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* ✅ Card Publications - MAINTENANT CLIQUABLE ! */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("PostsScreen")}
            >
              <LinearGradient
                colors={["#00C6FB", "#005BEA"]}
                style={styles.activityCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="image" size={24} color="#FFFFFF" />
                <Text style={styles.activityValue}>
                  {stats?.numberOfPosts || 0}
                </Text>
                <Text style={styles.activityLabel}>Publications</Text>
                <FontAwesome5
                  name="chevron-right"
                  size={12}
                  color="rgba(255, 255, 255, 0.7)"
                  style={styles.chevronIcon}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* ✅ Card Événements - CLIQUABLE */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("EventsScreen")}
            >
              <LinearGradient
                colors={["#4CAF50", "#45B649"]}
                style={styles.activityCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="calendar-alt" size={24} color="#FFFFFF" />
                <Text style={styles.activityValue}>
                  {stats?.numberOfEventsCreated || 0}
                </Text>
                <Text style={styles.activityLabel}>Événements</Text>
                <FontAwesome5
                  name="chevron-right"
                  size={12}
                  color="rgba(255, 255, 255, 0.7)"
                  style={styles.chevronIcon}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* ✅ Card Commentaires - MAINTENANT CLIQUABLE ! */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("CommentsScreen")}
            >
              <LinearGradient
                colors={["#FF9800", "#F57C00"]}
                style={styles.activityCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FontAwesome5 name="comments" size={24} color="#FFFFFF" />
                <Text style={styles.activityValue}>
                  {stats?.numberOfComments || 0}
                </Text>
                <Text style={styles.activityLabel}>Commentaires</Text>
                <FontAwesome5
                  name="chevron-right"
                  size={12}
                  color="rgba(255, 255, 255, 0.7)"
                  style={styles.chevronIcon}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Social - Abonnés et Abonnements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Mon Réseau</Text>

          <View style={styles.socialRow}>
            {/* Card Abonnés (cliquable) */}
            <TouchableOpacity
              style={styles.socialCard}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("ProfileScreen", { tab: "followers" })
              }
            >
              <LinearGradient
                colors={["rgba(142, 45, 226, 0.1)", "rgba(74, 0, 224, 0.05)"]}
                style={styles.socialCardGradient}
              >
                <FontAwesome5 name="users" size={28} color="#8E2DE2" />
                <Text style={styles.socialValue}>
                  {user?.followers?.length || 0}
                </Text>
                <Text style={styles.socialLabel}>Abonnés</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Card Abonnements (cliquable) */}
            <TouchableOpacity
              style={styles.socialCard}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("ProfileScreen", { tab: "following" })
              }
            >
              <LinearGradient
                colors={["rgba(0, 198, 251, 0.1)", "rgba(0, 91, 234, 0.05)"]}
                style={styles.socialCardGradient}
              >
                <FontAwesome5 name="user-friends" size={28} color="#00C6FB" />
                <Text style={styles.socialValue}>
                  {user?.following?.length || 0}
                </Text>
                <Text style={styles.socialLabel}>Abonnements</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Informations du compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations du compte</Text>

          <LinearGradient
            colors={["#FFFFFF", "#F8F9FA"]}
            style={styles.infoCard}
          >
            {/* Ligne : Membre depuis */}
            <View style={styles.infoRow}>
              <FontAwesome5 name="calendar-check" size={18} color="#737373" />
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                  "fr-FR",
                  {
                    month: "long",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>

            <View style={styles.infoDivider} />

            {/* Ligne : Ville */}
            <View style={styles.infoRow}>
              <FontAwesome5 name="map-marker-alt" size={18} color="#737373" />
              <Text style={styles.infoLabel}>Ville</Text>
              <Text style={styles.infoValue}>
                {user?.nomCommune || "Non défini"}
              </Text>
            </View>

            <View style={styles.infoDivider} />

            {/* Ligne : Statut (Gratuit ou Premium) */}
            <View style={styles.infoRow}>
              <FontAwesome5
                name={user?.isSubscribed ? "crown" : "user"}
                size={18}
                color={user?.isSubscribed ? "#FFD700" : "#737373"}
              />
              <Text style={styles.infoLabel}>Statut</Text>
              <Text
                style={[
                  styles.infoValue,
                  user?.isSubscribed && styles.premiumText,
                ]}
              >
                {user?.isSubscribed ? "Premium ⭐" : "Gratuit"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Bouton d'action pour aller à la page profil */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ProfileScreen")}
        >
          <LinearGradient
            colors={["#8E2DE2", "#4A00E0"]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <FontAwesome5 name="user-cog" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Gérer mon profil</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Espace en bas pour éviter que le contenu soit coupé */}
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
  // Header avec gradient
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
  // Card de profil en haut
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(142, 45, 226, 0.2)",
  },
  profileCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 4,
  },
  profileCity: {
    fontSize: 14,
    color: "#737373",
  },
  rankBadgeContainer: {
    marginLeft: 12,
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0A0A0A",
    marginBottom: 12,
  },
  // Card de statistiques
  statsCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  // Progression des votes
  voteProgressContainer: {
    marginBottom: 16,
  },
  voteLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  voteLabelItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  voteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  voteLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#737373",
  },
  progressBarContainer: {
    flexDirection: "row",
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    marginBottom: 12,
  },
  progressBarPositive: {
    height: "100%",
  },
  progressBarNegative: {
    height: "100%",
    backgroundColor: "#F44336",
  },
  voteNumbers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voteNumberItem: {
    alignItems: "center",
  },
  votePercentage: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  voteCount: {
    fontSize: 12,
    color: "#737373",
  },
  totalVotesContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  totalVotesBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  totalVotesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Grille d'activités
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  activityValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 12,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  // ✅ NOUVEAU : Style pour la petite flèche sur les cartes cliquables
  chevronIcon: {
    marginTop: 8,
  },
  // Section sociale
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  socialCard: {
    flex: 1,
  },
  socialCardGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(142, 45, 226, 0.2)",
  },
  socialValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0A0A0A",
    marginTop: 12,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#737373",
  },
  // Card d'informations
  infoCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#737373",
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0A0A0A",
  },
  premiumText: {
    color: "#FFD700",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  // Bouton d'action
  actionButton: {
    marginTop: 8,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // États de chargement et d'erreur
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
  },
});

export default StatisticsScreen;
