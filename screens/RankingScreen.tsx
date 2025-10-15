// Chemin : screens/RankingScreen.tsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import { useNotification } from "../context/NotificationContext";
import { LinearGradient } from "expo-linear-gradient";
import Sidebar from "../components/common/Sidebar";
import UserCard from "../components/ranking/UserCard";
import RankingHeader from "../components/ranking/RankingHeader";
import TopUsersSection from "../components/ranking/TopUsersSection";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useUserProfile } from "../hooks/user/useUserProfile"; // Ajoutez cette ligne

// Color palette
const COLORS = {
  primary: {
    start: "#062C41",
    end: "#0b3e5a",
  },
  text: "#FFFFFC",
  accent: "red",
};

/**
 * User data interface for ranking display
 */
interface User {
  id: number;
  ranking: number;
  photo?: string;
  useFullName?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  nomCommune?: string;
  voteCount?: number;
}

/**
 * API response interface for ranking data
 */
interface RankingResponse {
  users: User[];
  ranking: number;
  totalUsers: number;
}

/**
 * RankingScreen component displays user rankings within their city
 * Shows leaderboard with top users highlighted and user's own ranking
 */
const RankingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { unreadCount } = useNotification();

  // State management
  const [rankingData, setRankingData] = useState<User[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();

  const dummyFn = () => {};

  // Animation values
  const scrollY = new Animated.Value(0);
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  /**
   * Fetches ranking data from API
   */
  const fetchRankingData = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
  
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error("Impossible de récupérer l'ID utilisateur.");
      }
  
      const userResponse = await fetch(`${API_URL}/users/${userId}`);
      if (!userResponse.ok) {
        throw new Error("Impossible de récupérer les données utilisateur.");
      }
  
      const userData = await userResponse.json();
      const cityName = userData.nomCommune;
  
      if (!cityName) {
        throw new Error("La ville de l'utilisateur est introuvable.");
      }
  
      setCityName(cityName);
  
      const rankingResponse = await fetch(
        `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(cityName)}`
      );
  
      if (!rankingResponse.ok) {
        throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
      }
  
      const data: RankingResponse = await rankingResponse.json();
  
      // 🧹 Nettoyage et filtrage des utilisateurs avant affichage
      const allUsersRaw = Array.isArray(data?.users) ? data.users : [];
  
      const allUsers = allUsersRaw
        .map((user: any) => ({
          ...user,
          displayName: user.useFullName
            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
            : (user.username ?? "").trim(),
        }))
        .filter((u: any) => {
          const normalized = (u.displayName ?? "").trim().toLowerCase();
          // ❌ Exclut "Mairie de ..." ou "mairie ..." (insensible à la casse)
          return !/^mairie\s*(de|du|des)?\b/i.test(normalized);
        });
  
      // 🏆 Répartition du classement
      const top3 = allUsers.filter((user) => user.ranking <= 3);
      const remainingUsers = allUsers.filter((user) => user.ranking > 3);
  
      setRankingData(allUsers);
      setTopUsers(top3);
      setOtherUsers(remainingUsers);
      setUserRanking(data.ranking);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.warn("Erreur lors de la récupération du classement :", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur inconnue.");
      }
    } finally {
      setLoading(false);
      if (isRefreshing) {
        setRefreshing(false);
      }
    }
  }, []);
  

  // Initial data load
  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    fetchRankingData(true);
  }, [fetchRankingData]);

  // Sidebar toggle
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Navigation to notifications
  const navigateToNotifications = useCallback(() => {
    navigation.navigate("NotificationsScreen");
  }, [navigation]);

  // Navigate to user profile
  const navigateToUserProfile = useCallback(
    (userId: number) => {
      navigation.navigate("UserProfileScreen", { userId });
    },
    [navigation]
  );

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.primary.start, COLORS.primary.end]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={COLORS.text} />
          <Text style={styles.loadingText}>Chargement du classement...</Text>
        </LinearGradient>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchRankingData()}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={["right", "left"]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <LinearGradient
            colors={[COLORS.primary.start, COLORS.primary.end]}
            style={styles.headerGradient}
          >
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
              <Feather name="menu" size={24} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>CLASSEMENT</Text>
            </View>

            <TouchableOpacity
              onPress={navigateToNotifications}
              style={styles.notificationButton}
            >
              <Feather name="bell" size={24} color={COLORS.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Main Content */}
        <Animated.FlatList
          data={otherUsers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3498db"]}
              tintColor="#3498db"
            />
          }
          ListHeaderComponent={
            <>
              {/* User's Current Ranking */}
              <RankingHeader
                userRanking={userRanking}
                totalUsers={totalUsers}
                cityName={cityName}
              />

              {/* Top 3 Users */}
              {topUsers.length > 0 && (
                <TopUsersSection
                  topUsers={topUsers}
                  onUserPress={navigateToUserProfile}
                />
              )}

              {/* Other Users Title */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Classement général</Text>
                <View style={styles.sectionDivider} />
              </View>
            </>
          }
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPress={() => navigateToUserProfile(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>
                Aucun utilisateur trouvé dans votre ville
              </Text>
            </View>
          }
          ListFooterComponent={<View style={styles.footer} />}
        />

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          user={user}
          displayName={displayName}
          voteSummary={voteSummary}
          onShowNameModal={dummyFn}
          onShowVoteInfoModal={dummyFn}
          onNavigateToCity={() => {
            /* TODO : remplacer par une navigation appropriée si besoin */
          }}
          updateProfileImage={updateProfileImage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: COLORS.primary.start,
    paddingTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    width: "100%",
    elevation: 5,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 1,
  },
  cityIndicator: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  sectionDivider: {
    height: 2,
    width: 60,
    backgroundColor: "#3498db",
    borderRadius: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  loadingGradient: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f5f7fa",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary.start,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 16,
  },
  footer: {
    height: 80,
  },
});

export default RankingScreen;
