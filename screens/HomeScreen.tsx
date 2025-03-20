import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Linking,
} from "react-native";
import { useLocation } from "../hooks/location/useLocation";
import { useUserProfile } from "../hooks/user/useUserProfile";
import { useUserRanking } from "../hooks/user/useUserRanking";
import { useNearbyReports } from "../hooks/reports/useNearbyReports";
import { useEvents } from "../hooks/events/useEvents";
import { useFetchStatistics } from "../hooks/api/useFetchStatistics";
import GlobalToggleButton from "../components/common/ShakeButton/GlobalToggleButton"; // Import the missing component
// @ts-ignore
import { API_URL } from "@env";

import ProfileSection from "../components/home/ProfileSection/ProfileSection";
import RankingSection from "../components/home/RankingSection/RankingSection";
import ReportsSection from "../components/home/ReportsSection/ReportsSection";
import EventsSection from "../components/home/EventsSection/EventsSection";
import EventCalendar from "../components/home/EventsSection/EventCalendar";
import CategoryReportsSection from "../components/home/CategoryReportsSection/CategoryReportsSection";
import MayorInfoSection from "../components/home/MayorInfoSection/MayorInfoSection";
import Chart from "../components/home/ChartSection/Chart";

// Modaux
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

const HomeScreen: React.FC<HomeScreenProps> = memo(
  ({ navigation, handleScroll }) => {
    // Hooks
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
      reports,
      categories,
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
    } = useEvents(user?.nomCommune || "");

    // Graphique
    const nomCommune = user?.nomCommune || "";
    const { data: statsData } = useFetchStatistics(
      `${API_URL}/reports/statistics`,
      nomCommune
    );

    // États modal
    const [showNameModal, setShowNameModal] = useState(false);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [showLikeInfoModal, setShowLikeInfoModal] = useState(false);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);

    // États de visibilité des sections
    const [isSectionVisible, setSectionVisible] = useState(true);
    const [isReportsVisible, setReportsVisible] = useState(true);
    const [isEventsVisible, setEventsVisible] = useState(true);
    const [isCalendarVisible, setCalendarVisible] = useState(true);
    const [isCategoryReportsVisible, setCategoryReportsVisible] =
      useState(true);
    const [isMayorInfoVisible, setMayorInfoVisible] = useState(true);
    const [areAllSectionsVisible, setAllSectionsVisible] = useState(true);

    // État de rafraîchissement
    const [refreshing, setRefreshing] = useState(false);

    // Loader
    const isLoading =
      locationLoading || userLoading || reportsLoading || rankingLoading;

    // Préférence d'affichage du nom
    const handleOptionChange = useCallback(
      async (option: "fullName" | "username") => {
        setShowNameModal(false);
        await updateUserDisplayPreference(option === "fullName");
      },
      [updateUserDisplayPreference]
    );

    // Rafraîchissement écran
    const onRefresh = useCallback(async () => {
      setRefreshing(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setRefreshing(false);
      navigation.replace("Main");
    }, [navigation]);

    // Inverse la visibilité de toutes les sections
    const toggleAllSections = useCallback(() => {
      const newVisibility = !areAllSectionsVisible;
      setAllSectionsVisible(newVisibility);
      setSectionVisible(newVisibility);
      setReportsVisible(newVisibility);
      setEventsVisible(newVisibility);
      setCalendarVisible(newVisibility);
      setCategoryReportsVisible(newVisibility);
      setMayorInfoVisible(newVisibility);
    }, [areAllSectionsVisible]);

    // Ouvre le modal des abonnés
    const toggleFollowersList = useCallback(() => {
      setShowFollowersModal((prev) => !prev);
      setShowFollowingModal(false);
    }, []);

    // Ouvre le modal des abonnement
    const toggleFollowingList = useCallback(() => {
      setShowFollowingModal((prev) => !prev);
      setShowFollowersModal(false);
    }, []);

    // Gère l'appuis sur un rapport
    const handlePressReport = useCallback(
      (id: number) => {
        navigation.navigate("ReportDetailsScreen", { reportId: id });
      },
      [navigation]
    );

    // Gère l'appuis sur une catégorie
    const handleCategoryClick = useCallback(
      (category: string) => {
        navigation.navigate("CategoryReportsScreen", { category });
      },
      [navigation]
    );

    // Gère l'appuis sur un événement
    const handleEventPress = useCallback(
      (id: string) => {
        navigation.navigate("EventDetailsScreen", { eventId: id });
      },
      [navigation]
    );

    // Gère l'appuis sur un utilisateur
    const handleUserPress = useCallback(
      (id: string) => {
        navigation.navigate("UserProfileScreen", { userId: id });
      },
      [navigation]
    );

    // Gère l'appuis sur le numéro de téléphone
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

    // Si localisation indisponible, affiche un modal d'erreur
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
              onPress={() => useLocation()}
            >
              <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      );
    }

    // Loader si les données sont en cours de chargement
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#102542" />
          <Text style={styles.loadingText}>Chargement en cours...</Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
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

        {/* Section Signalements */}
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
          controlStatsVisibility={areAllSectionsVisible}
        />

        {/* Section Calendrier d'événements */}
        <EventCalendar
          events={events}
          onDateChange={fetchEventsByDate}
          onEventPress={handleEventPress}
          isVisible={isCalendarVisible}
          toggleVisibility={() => setCalendarVisible((prev) => !prev)}
        />

        {/* Section Catégories de signalements */}
        <CategoryReportsSection
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
          userVotes={stats?.votes?.length || 0} // Ajout de cette ligne cruciale
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
          onUserPress={handleFollowingUserPress} // Utilisez la nouvelle fonction ici
        />
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#102542",
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
  },
});

export default HomeScreen;
