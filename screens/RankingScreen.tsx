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
import { useUserProfile } from "../hooks/user/useUserProfile";
import styles from "../styles/screens/RankingScreen.styles";
import Icon from "react-native-vector-icons/MaterialIcons";

// Color palette
const COLORS = {
  primary: {
    start: "#1B5D85",
    end: "#1B5D85",
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
  isMunicipality?: boolean;
  municipalityName?: string;
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
 *
 * ✅ CORRECTION : Les mairies peuvent VOIR le classement mais n'y apparaissent PAS
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
  const [isMunicipality, setIsMunicipality] = useState<boolean>(false); // ✅ Pour savoir si c'est une mairie

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
   * ✅ CORRECTION : Charge le classement même pour les mairies, mais les filtre de la liste
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

      // ✅ CORRECTION : On note si c'est une mairie, mais on continue quand même
      setIsMunicipality(userData.isMunicipality || false);

      const cityName = userData.nomCommune;

      if (!cityName) {
        throw new Error("La ville de l'utilisateur est introuvable.");
      }

      setCityName(cityName);

      const rankingResponse = await fetch(
        `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
          cityName
        )}`
      );

      if (!rankingResponse.ok) {
        throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
      }

      const data: RankingResponse = await rankingResponse.json();

      // 🧹 Nettoyage et filtrage des utilisateurs avant affichage
      const allUsersRaw = Array.isArray(data?.users) ? data.users : [];

      // ✅ CORRECTION : Meilleure gestion du displayName avec vérification
      const allUsers = allUsersRaw
        .map((user: any) => {
          // Créer le displayName selon le type d'utilisateur
          let displayName = "";

          if (user.isMunicipality) {
            // Pour les mairies
            displayName = user.municipalityName || "Mairie";
          } else if (user.useFullName) {
            // Pour les utilisateurs avec nom complet
            displayName = `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim();
          } else {
            // Pour les utilisateurs avec username
            displayName = (user.username || "").trim();
          }

          return {
            ...user,
            displayName: displayName,
          };
        })
        // ✅ FILTRE 1 : Enlever toutes les mairies du classement
        .filter((u: any) => !u.isMunicipality)
        // ✅ FILTRE 2 : Enlever les utilisateurs sans nom (sécurité)
        .filter((u: any) => u.displayName && u.displayName.trim().length > 0);

      // 🏆 Répartition du classement
      const top3 = allUsers.filter((user) => user.ranking <= 3);
      const remainingUsers = allUsers.filter((user) => user.ranking > 3);

      setRankingData(allUsers);
      setTopUsers(top3);
      setOtherUsers(remainingUsers);

      // ✅ CORRECTION : Si c'est une mairie, on met null pour le ranking
      setUserRanking(userData.isMunicipality ? null : data.ranking);
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
            <TouchableOpacity
              onPress={toggleSidebar}
              style={styles.headerIconButton}
            >
              <Icon name="menu" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>CLASSEMENT</Text>
            </View>

            <TouchableOpacity
              onPress={navigateToNotifications}
              style={styles.headerIconButton}
            >
              <Icon
                name="notifications"
                size={22}
                color={unreadCount > 0 ? "#FFFFFC" : "#FFFFFC"}
              />
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
              {/* ✅ CORRECTION : N'affiche le RankingHeader QUE si ce n'est PAS une mairie */}
              {!isMunicipality && (
                <RankingHeader
                  userRanking={userRanking}
                  totalUsers={totalUsers}
                  cityName={cityName}
                />
              )}

              {/* ✅ BLOC MAIRIE - Style cohérent avec RankingHeader */}
              {isMunicipality && (
                <View style={styles.municipalityContainer}>

                  {/* Carte du nombre de citoyens */}
                  <View style={styles.citizenCountBox}>
                    <View style={styles.citizenCountRow}>
                      {/* ✅ CORRECTION : On utilise || 0 pour gérer le cas null */}
                      <Text style={styles.citizenCountNumber}>
                        {totalUsers || 0}
                      </Text>
                      {/* ✅ CORRECTION : On vérifie que totalUsers existe ET qu'il est > 1 */}
                      <Text style={styles.citizenCountLabel}>
                        {totalUsers && totalUsers > 1 ? "citoyens" : "citoyen"}
                      </Text>
                    </View>
                    <Text style={styles.municipalitySubtitle}>
                      inscrits dans votre commune
                    </Text>
                  </View>
                </View>
              )}
              {/* Top 3 Users - Visible pour TOUT LE MONDE (citoyens ET mairies) */}
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
          onNavigateToCity={() => {}}
          updateProfileImage={updateProfileImage}
        />
      </View>
    </SafeAreaView>
  );
};

export default RankingScreen;
