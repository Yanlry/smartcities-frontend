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

const StatisticsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const { stats, loading, error } = useUserStats(user?.id || "");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { getBadgeStyles } = useBadge();
  const { ranking, totalUsers, getRankingSuffix } = useUserRanking(user?.nomCommune || "");
  const rankingSuffix = useMemo(() => getRankingSuffix(ranking), [getRankingSuffix, ranking]);
  const badgeStyle = useMemo(() => getBadgeStyles(stats?.votes?.length || 0), [getBadgeStyles, stats?.votes?.length]);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  const totalVotes = (voteSummary?.up || 0) + (voteSummary?.down || 0);
  const positivePercentage = totalVotes > 0 ? Math.round(((voteSummary?.up || 0) / totalVotes) * 100) : 50;

  const getRatingColor = (percentage: number) => {
    if (percentage >= 85) return "#4CAF50";
    if (percentage >= 60) return "#8BC34A";
    if (percentage >= 50) return "#FF9800";
    return "#F44336";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B5D85" />
        <Text style={styles.loadingText}>Chargement de vos statistiques...</Text>
      </View>
    );
  }

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
      <LinearGradient
        colors={["#062C41", "#1B5D85"]}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
            <FontAwesome5 name="bars" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mes Statistiques</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profil */}


            {ranking && (
              <TouchableOpacity style={styles.rankBadgeContainer} onPress={() => navigation.navigate("RankingScreen")}>
                <RankBadge
                  ranking={ranking}
                  rankingSuffix={rankingSuffix}
                  totalUsers={totalUsers || 0}
                  badgeStyle={badgeStyle}
                  onNavigateToRanking={() => navigation.navigate("RankingScreen")}
                />
              </TouchableOpacity>
            )}



        {/* Votes et Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VOTES</Text>
          <View style={styles.statsCard}>
            <View style={styles.voteProgressContainer}>
              <View style={styles.voteLabels}>
                <View style={styles.voteLabelItem}>
                  <View style={[styles.voteDot, { backgroundColor: getRatingColor(positivePercentage) }]} />
                  <Text style={styles.voteLabel}>Positifs</Text>
                </View>
                <View style={styles.voteLabelItem}>
                  <View style={[styles.voteDot, { backgroundColor: "#F44336" }]} />
                  <Text style={styles.voteLabel}>Négatifs</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarPositive, { width: `${positivePercentage}%`, backgroundColor: getRatingColor(positivePercentage) }]} />
                <View style={[styles.progressBarNegative, { width: `${100 - positivePercentage}%` }]} />
              </View>
              <View style={styles.voteNumbers}>
                <View style={styles.voteNumberItem}>
                  <Text style={[styles.votePercentage, { color: getRatingColor(positivePercentage) }]}>{positivePercentage}%</Text>
                  <Text style={styles.voteCount}>{voteSummary?.up || 0} votes</Text>
                </View>
                <View style={styles.voteNumberItem}>
                  <Text style={[styles.votePercentage, { color: "#F44336" }]}>{100 - positivePercentage}%</Text>
                  <Text style={styles.voteCount}>{voteSummary?.down || 0} votes</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.totalVotesContainer} onPress={() => navigation.navigate("VotesScreen")}>
              <View style={styles.totalVotesBadge}>
                <FontAwesome5 name="star" size={16} color="#1B5D85" />
                <Text style={styles.totalVotesText}>{totalVotes} votes au total</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activité */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVITÉ</Text>
          <View style={styles.activityGrid}>
            {[
              { icon: "bullhorn", value: stats?.numberOfReports || 0, label: "Signalements", screen: "ReportScreen", colors: ["#062C41", "#1B5D85"] as [string, string] },
              { icon: "image", value: stats?.numberOfPosts || 0, label: "Publications", screen: "PostsScreen", colors: ["#062C41", "#1B5D85"] as [string, string] },
              { icon: "calendar-alt", value: stats?.numberOfEventsCreated || 0, label: "Événements", screen: "EventsScreen", colors: ["#062C41", "#1B5D85"] as [string, string] },
              { icon: "comments", value: stats?.numberOfComments || 0, label: "Commentaires", screen: "CommentsScreen", colors: ["#062C41", "#1B5D85"] as [string, string] },
            ].map((item, index) => (
              <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => navigation.navigate(item.screen)}>
                <LinearGradient colors={item.colors} style={styles.activityCard}>
                  <FontAwesome5 name={item.icon} size={24} color="#FFFFFF" />
                  <Text style={styles.activityValue}>{item.value}</Text>
                  <View style={styles.activityLabelContainer}>
                  <Text style={styles.activityLabel}>{item.label}</Text>
                  <FontAwesome5 name="chevron-right" size={12} color="rgba(255, 255, 255, 0.7)" style={styles.chevronIcon} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Réseau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RÉSAUX</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialCard} onPress={() => navigation.navigate("ProfileScreen", { tab: "followers" })}>
              <View style={styles.socialCardContent}>
                <FontAwesome5 name="users" size={28} color="#1B5D85" />
                <Text style={styles.socialValue}>{user?.followers?.length || 0}</Text>
                <Text style={styles.socialLabel}>Abonnés</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialCard} onPress={() => navigation.navigate("ProfileScreen", { tab: "following" })}>
              <View style={styles.socialCardContent}>
                <FontAwesome5 name="user-friends" size={28} color="#1B5D85" />
                <Text style={styles.socialValue}>{user?.following?.length || 0}</Text>
                <Text style={styles.socialLabel}>Abonnements</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Infos compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS</Text>
          <View style={styles.infoCard}>
            {[
              {
                icon: "calendar-check",
                label: "Membre depuis",
                value: (() => {
                  const date = new Date(user?.createdAt || Date.now());
                  const monthYear = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
                  return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
                })(),
              },
              { icon: "map-marker-alt", label: "Ville", value: user?.nomCommune || "Non défini" },
              { icon: user?.isSubscribed ? "crown" : "user", label: "Statut", value: user?.isSubscribed ? "Premium ⭐" : "Gratuit" },
            ].map((item, index) => (
              <React.Fragment key={index}>
                <View style={styles.infoRow}>
                  <FontAwesome5 name={item.icon} size={18} color={item.icon === "crown" ? "#FFD700" : "#737373"} />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={[styles.infoValue, item.icon === "crown" && styles.premiumText]}>{item.value}</Text>
                </View>
                {index < 2 && <View style={styles.infoDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("ProfileScreen")}>
          <LinearGradient colors={["#062C41", "#1B5D85"]} style={styles.actionButtonGradient}>
            <FontAwesome5 name="user-cog" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Gérer mon profil</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={() => {}}
        onShowVoteInfoModal={() => {}}
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: "#062C41",
    marginBottom: 4,
  },
  profileCity: {
    fontSize: 14,
    color: "#737373",
  },
  rankBadgeContainer: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#737373",
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
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
    backgroundColor: "rgba(6, 44, 65, 0.08)",
    gap: 8,
  },
  totalVotesText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#062C41",
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  activityCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  activityValue: {
    fontSize: 28,
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
  activityLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevronIcon: {
    marginLeft: 8,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  socialCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  socialCardContent: {
    alignItems: "center",
  },
  socialValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#062C41",
    marginTop: 12,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#737373",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
    color: "#062C41",
  },
  premiumText: {
    color: "#FFD700",
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  actionButton: {
    marginTop: 8,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
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
    backgroundColor: "#F8F9FA",
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
