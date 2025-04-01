import React, { useState, useCallback, memo, useMemo, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Modal,
  Linking,
  StyleSheet,
} from "react-native";
import { useLocation } from "../hooks/location/useLocation";
import { useUserProfile } from "../hooks/user/useUserProfile";
import { useUserRanking } from "../hooks/user/useUserRanking";
import { useNearbyReports } from "../hooks/reports/useNearbyReports";
import { useEvents } from "../hooks/events/useEvents";
import { useFetchStatistics } from "../hooks/api/useFetchStatistics";
import GlobalToggleButton from "../components/common/ShakeButton/GlobalToggleButton";
// @ts-ignore
import { API_URL } from "@env";

// Import du contrôle de rafraîchissement personnalisé
import RefreshSuccessAnimation from "../components/common/Loader/RefreshSuccessAnimation";
import JoyfulLoader from "../components/common/Loader/JoyfulLoader";
import RefreshControl from "../components/common/Loader/RefreshControl";

// Composants de sections
import ProfileSection from "../components/home/ProfileSection/ProfileSection";
import RankingSection from "../components/home/RankingSection/RankingSection";
import ReportsSection from "../components/home/ReportsSection/ReportsSection";
import EventsSection from "../components/home/EventsSection/EventsSection";
import EventCalendar from "../components/home/EventsSection/EventCalendarSection";
import CategorySelector from "../components/home/CategorySelector/CategorySelectorSection";
import MayorInfoSection from "../components/home/MayorInfoSection/MayorInfoSection";
import Chart from "../components/home/ChartSection/ChartSection";

// Import des types d'entité pour la conversion
import {
  Report as EntityReport,
  ReportCategory as EntityReportCategory,
} from "../types/entities/report.types";

// Composants modaux
import {
  NameModal,
  BadgeModal,
  LikeInfoModal,
  FollowersModal,
  FollowingModal,
} from "../components/home/modals";

interface HomeScreenProps {
  navigation: any;
  handleScroll: (event: any) => void;
}

/**
 * Écran d'accueil principal de l'application
 * Affiche plusieurs sections avec données utilisateur, rapports, événements et statistiques
 */
const HomeScreen: React.FC<HomeScreenProps> = memo(
  ({ navigation, handleScroll }) => {
    // ===== HOOKS =====
    const { location, loading: locationLoading } = useLocation();

    const {
      user,
      stats,
      loading: userLoading,
      error: userError,
      voteSummary,
      memberSince,
      displayName,
      updateUserDisplayPreference,
      updateProfileImage,
    } = useUserProfile();

    const {
      reports: rawReports,
      categories: rawCategories,
      selectedCategory,
      setSelectedCategory,
      loading: reportsLoading,
      error: reportsError,
      formatTime,
    } = useNearbyReports(location?.latitude, location?.longitude);

    const {
      topUsers,
      ranking,
      totalUsers,
      loading: rankingLoading,
      error: rankingError,
      getRankingSuffix,
    } = useUserRanking(user?.nomCommune || "");

    const {
      featuredEvents,
      events,
      loading: eventsLoading,
      error: eventsError,
      fetchEventsByDate,
      getEventsForMonth,
      getMarkedDatesForMonth,
    } = useEvents(user?.nomCommune || "");

    // ===== ANIMATION DE SCROLL =====
    const scrollY = useRef(new Animated.Value(0)).current;

    // ===== ADAPTATION DES TYPES =====

    // Adaptation des reports pour correspondre au type attendu par ReportsSection
    const reports = useMemo<EntityReport[]>(() => {
      return rawReports.map((report) => ({
        ...report,
        // Ajout de la propriété user requise par le type EntityReport
        user: {
          id: parseInt(report.userId || "0"),
          username: report.userId || "",
          firstName: "",
          lastName: "",
          useFullName: true,
        },
      })) as EntityReport[];
    }, [rawReports]);

    // Adaptation des categories pour correspondre au type attendu
    const categories = useMemo<EntityReportCategory[]>(() => {
      return rawCategories.map((category) => ({
        ...category,
        // Ajout des propriétés obligatoires
        value: category.name.toLowerCase(),
        description: category.label || category.name,
      })) as EntityReportCategory[];
    }, [rawCategories]);

    // ===== DONNÉES STATISTIQUES =====
    const nomCommune = user?.nomCommune || "";
    const { data: statsData } = useFetchStatistics(
      `${API_URL}/reports/statistics`,
      nomCommune
    );

    // ===== ÉTATS UI =====
    // États modaux
    const [showNameModal, setShowNameModal] = useState(false);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [showLikeInfoModal, setShowLikeInfoModal] = useState(false);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);

    // États de visibilité des sections
    const [isSectionVisible, setSectionVisible] = useState(false);
    const [isReportsVisible, setReportsVisible] = useState(false);
    const [isEventsVisible, setEventsVisible] = useState(false);
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [isCategoryReportsVisible, setCategoryReportsVisible] =
      useState(false);
    const [isMayorInfoVisible, setMayorInfoVisible] = useState(false);
    const [isChartVisible, setChartVisible] = useState(false);
    const [areAllSectionsVisible, setAllSectionsVisible] = useState(false);

    // État de rafraîchissement
    const [refreshing, setRefreshing] = useState(false);
    const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);

    // Indicateur de chargement global
    const isLoading =
      locationLoading || userLoading || reportsLoading || rankingLoading;

    // ===== GESTIONNAIRES D'ÉVÉNEMENTS =====

    // Préférence d'affichage du nom d'utilisateur
    const handleOptionChange = useCallback(
      async (option: "fullName" | "username") => {
        setShowNameModal(false);
        await updateUserDisplayPreference(option === "fullName");
      },
      [updateUserDisplayPreference]
    );

    // Rafraîchissement de l'écran avec animation
    const onRefresh = useCallback(async () => {
      setRefreshing(true);

      // Simuler un délai pour montrer l'animation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Montrer l'animation de succès
      setRefreshing(false);
      setShowRefreshSuccess(true);

      // Masquer l'animation de succès après quelques secondes
      setTimeout(() => {
        setShowRefreshSuccess(false);
        navigation.replace("Main");
      }, 1000);
    }, [navigation]);

    // Gérer le scroll pour les animations
    const handleAnimatedScroll = Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false, listener: handleScroll }
    );

    // Contrôle de la visibilité de toutes les sections
    const toggleAllSections = useCallback(() => {
      const newVisibility = !areAllSectionsVisible;
      setAllSectionsVisible(newVisibility);
      setSectionVisible(newVisibility);
      setReportsVisible(newVisibility);
      setEventsVisible(newVisibility);
      setCalendarVisible(newVisibility);
      setCategoryReportsVisible(newVisibility);
      setMayorInfoVisible(newVisibility);
      setChartVisible(newVisibility);
    }, [areAllSectionsVisible]);

    // Modaux sociaux
    const toggleFollowersList = useCallback(() => {
      setShowFollowersModal((prev) => !prev);
      setShowFollowingModal(false);
    }, []);

    const toggleFollowingList = useCallback(() => {
      setShowFollowingModal((prev) => !prev);
      setShowFollowersModal(false);
    }, []);

    // Navigation
    const handlePressReport = useCallback(
      (id: number) => {
        navigation.navigate("ReportDetailsScreen", { reportId: id });
      },
      [navigation]
    );

    const handleCategoryClick = useCallback(
      (category: string) => {
        navigation.navigate("CategoryReportsScreen", { category });
      },
      [navigation]
    );

    const handleEventPress = useCallback(
      (id: string) => {
        navigation.navigate("EventDetailsScreen", { eventId: id });
      },
      [navigation]
    );

    const handleUserPress = useCallback(
      (id: string) => {
        navigation.navigate("UserProfileScreen", { userId: id });
      },
      [navigation]
    );

    const handlePressPhoneNumber = useCallback(() => {
      Linking.openURL("tel:0320440251");
    }, []);

    const handleFollowingUserPress = useCallback(
      (id: string) => {
        setShowFollowingModal(false);
        setShowFollowersModal(false);
        setTimeout(() => {
          navigation.navigate("UserProfileScreen", { userId: id });
        }, 300);
      },
      [navigation]
    );

    // ===== RENDU CONDITIONNEL =====

    // Modal d'erreur de localisation
    if (!location && !locationLoading) {
      return (
        <Modal transparent animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Partagez votre position</Text>
            <Text style={styles.modalText}>
              La permission de localisation est nécessaire pour utiliser
              l'application.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.warn(
                  "Location request functionality is not implemented."
                );
              }}
            >
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      );
    }

    // Indicateur de chargement
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <JoyfulLoader
            message="Chargement de votre fil d'actualité..."
            color="#062C41"
            size="medium"
          />
        </View>
      );
    }

    // ===== RENDU PRINCIPAL =====
    return (
      <View style={styles.mainContainer}>
        {/* Contrôle de rafraîchissement personnalisé */}
        <RefreshControl
          refreshing={refreshing}
          scrollY={scrollY}
          onRefreshStarted={onRefresh}
        />

        <RefreshSuccessAnimation
          visible={showRefreshSuccess}
          message="✓ Mis à jour avec succès!"
        />
        <Animated.ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          onScroll={handleAnimatedScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Section Profil Utilisateur */}
          <ProfileSection
            user={user}
            stats={stats}
            displayName={displayName}
            memberSince={memberSince}
            voteSummary={voteSummary}
            ranking={ranking}
            totalUsers={totalUsers}
            rankingSuffix={getRankingSuffix(ranking)}
            onShowFollowers={toggleFollowersList}
            onShowFollowing={toggleFollowingList}
            onShowNameModal={() => setShowNameModal(true)}
            onShowBadgeModal={() => setShowBadgeModal(true)}
            onShowVoteInfoModal={() => setShowLikeInfoModal(true)}
            onNavigateToRanking={() => navigation.navigate("RankingScreen")}
            onNavigateToCity={() => navigation.navigate("CityScreen")}
            updateProfileImage={updateProfileImage}
          />

          <GlobalToggleButton
            areAllSectionsVisible={areAllSectionsVisible}
            onToggle={toggleAllSections}
          />

          {/* Section Classement */}
          <RankingSection
            topUsers={topUsers}
            onUserPress={handleUserPress}
            onSeeAllPress={() => navigation.navigate("RankingScreen")}
            isVisible={isSectionVisible}
            toggleVisibility={() => setSectionVisible((prev) => !prev)}
          />

          {/* Section Signalements - Utilise les données adaptées */}
          <ReportsSection
            reports={reports}
            categories={categories}
            loading={reportsLoading}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            formatTime={formatTime}
            onPressReport={handlePressReport}
            isVisible={isReportsVisible}
            toggleVisibility={() => setReportsVisible((prev) => !prev)}
            userCity={user?.nomCommune}
          />

          {/* Section Événements */}
          <EventsSection
            featuredEvents={featuredEvents}
            loading={eventsLoading}
            error={eventsError}
            onEventPress={handleEventPress}
            isVisible={isEventsVisible}
            toggleVisibility={() => setEventsVisible((prev) => !prev)}
          />

          {/* Section Statistiques */}
          <Chart
            data={statsData}
            loading={userLoading}
            nomCommune={nomCommune}
            isVisible={isChartVisible}
            toggleVisibility={() => setChartVisible((prev) => !prev)}
          />

          {/* Section Calendrier d'événements */}
          <EventCalendar
            events={events}
            onDateChange={fetchEventsByDate}
            onEventPress={handleEventPress}
            isVisible={isCalendarVisible}
            toggleVisibility={() => setCalendarVisible((prev) => !prev)}
            cityName={user?.nomCommune}
            getEventsForMonth={getEventsForMonth}
            getMarkedDatesForMonth={getMarkedDatesForMonth}
          />

          {/* Section Catégories de signalements - Utilise les données adaptées */}
          <CategorySelector
            categories={categories}
            onCategoryPress={handleCategoryClick}
            isVisible={isCategoryReportsVisible}
            toggleVisibility={() => setCategoryReportsVisible((prev) => !prev)}
          />

          {/* Section Informations Mairie */}
          <MayorInfoSection
            isVisible={isMayorInfoVisible}
            toggleVisibility={() => setMayorInfoVisible((prev) => !prev)}
            onPhonePress={handlePressPhoneNumber}
          />

          {/* Footer */}
          <Text style={styles.footerCopyrightText}>
            © 2025 SmartCities. Tous droits réservés.
          </Text>
        </Animated.ScrollView>

        {/* Modaux */}
        <NameModal
          visible={showNameModal}
          onClose={() => setShowNameModal(false)}
          useFullName={user?.useFullName || false}
          onOptionChange={handleOptionChange}
        />

        <BadgeModal
          visible={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
          userVotes={stats?.votes?.length || 0}
        />

        <LikeInfoModal
          visible={showLikeInfoModal}
          onClose={() => setShowLikeInfoModal(false)}
        />

        <FollowersModal
          visible={showFollowersModal}
          onClose={toggleFollowersList}
          followers={user?.followers || []}
          onUserPress={handleFollowingUserPress}
        />

        <FollowingModal
          visible={showFollowingModal}
          onClose={toggleFollowingList}
          following={user?.following || []}
          onUserPress={handleFollowingUserPress}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  refreshSuccessContainer: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1001,
  },
  refreshSuccessText: {
    backgroundColor: "rgba(76, 217, 100, 0.9)", // Vert semi-transparent
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  globalToggleButton: {
    backgroundColor: "#062C41",
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  globalToggleButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  button: {
    backgroundColor: "#062C41",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  footerCopyrightText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
    marginVertical: 20,
    paddingBottom: 100,
  },
});

export default HomeScreen;
