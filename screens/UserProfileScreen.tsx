// screens/UserProfileScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import { View, ActivityIndicator, Text, ScrollView, Alert } from "react-native";
import Sidebar from "../components/common/Sidebar";
import { profileStyles } from "../styles/screens/UserProfileScreen.styles"
import { useToken } from "../hooks/auth/useToken";
import { useBadge } from "../hooks/ui/useBadge";
import SectionProfile from "../components/profile/Profile/ProfileSection";

import {
  useUserProfile,
  useUserStats,
  useUserContent,
} from "../hooks/profile/index";
import { useUserRanking } from "../hooks/user/useUserRanking";

import { BadgeModal } from "../components/home/modals";

// Composants
import {
  ProfileHeader,
  // ProfilePhoto, // Removed as it is not exported from "../components/profile"
  ProfileTabs,
  UserInfoTab,
  ReportsTab,
  PostsTab,
  EventsTab,
  ReportModal,
} from "../components/profile";
import RankBadge from "../components/home/ProfileSection/RankBadge";
import ProfilePhoto from "../components/profile/Photo/ProfilePhoto";
// Types
import { TabType } from "../types/features/profile/user.types";
import { User as EntityUser } from "../types/entities/user.types"; // Import pour l'adaptation
import { StackScreenProps } from "@react-navigation/stack";
// @ts-ignore
import { API_URL } from "@env";
import { ParamListBase } from "@react-navigation/native";
// Removed duplicate and incorrect import

type UserProfileScreenNavigationProps = StackScreenProps<
  ParamListBase,
  "UserProfileScreen"
>;

interface UserProfileScreenProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

const UserProfileScreen: React.FC<UserProfileScreenNavigationProps> = ({
  route,
  navigation,
}) => {
  const { userId } = route.params as UserProfileScreenProps["route"]["params"];
  const { getToken, getUserId } = useToken();
  const { getBadgeStyles } = useBadge();

  // États
  const [selectedTab, setSelectedTab] = useState<TabType>("info");
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const dummyFn = () => {};
  const dummyUpdateProfileImage = async (uri: string): Promise<boolean> => {
    return true;
  };

  // Hooks pour les données
  const {
    user: rawUser,
    loading: userLoading,
    error: userError,
    isFollowing,
    currentUserId,
    handleFollow,
    handleUnfollow,
  } = useUserProfile(userId);

  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useUserStats(userId);

  const {
    posts,
    reports,
    events,
    loading: contentLoading,
    error: contentError,
  } = useUserContent(userId);

  // Hooks pour le classement
  const {
    ranking: rankingFromRanking,
    totalUsers: totalUsersFromRanking,
    getRankingSuffix,
  } = useUserRanking(rawUser?.nomCommune || "");

  // Adaptation du user pour le composant UserInfoTab
  const user = useMemo(() => {
    if (!rawUser) return null;

    return {
      ...rawUser,
      // Garantir que useFullName est toujours défini (jamais undefined)
      useFullName:
        rawUser.useFullName === undefined ? false : rawUser.useFullName,
    } as EntityUser;
  }, [rawUser]);

  // États dérivés
  const rankingSuffix = useMemo(
    () => getRankingSuffix(rankingFromRanking),
    [getRankingSuffix, rankingFromRanking]
  );

  const totalUsers = totalUsersFromRanking;

  const displayName = useMemo(() => {
    if (rawUser?.useFullName && rawUser.firstName && rawUser.lastName) {
      return `${rawUser.firstName} ${rawUser.lastName}`;
    }
    return rawUser?.username || "Nom d'utilisateur";
  }, [rawUser]);

  // Handlers
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const openReportModal = useCallback(() => {
    setReportModalVisible(true);
  }, []);

  const closeReportModal = useCallback(() => {
    setReportModalVisible(false);
  }, []);

  const navigateToRanking = useCallback(() => {
    navigation.navigate("RankingScreen");
  }, [navigation]);

  const badgeStyle = useMemo(() => {
    return getBadgeStyles(stats?.votes?.length || 0);
  }, [getBadgeStyles, stats?.votes?.length]);

  const handleSendReport = useCallback(
    async (reason: string) => {
      if (!reason.trim()) {
        Alert.alert(
          "Erreur",
          "Veuillez saisir une raison pour le signalement."
        );
        return;
      }

      try {
        setIsSubmitting(true);
        const reporterId = await getUserId();

        const response = await fetch(`${API_URL}/mails/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            to: "yannleroy23@gmail.com",
            subject: "Signalement d'un profil utilisateur",
            userId,
            reporterId,
            reportReason: reason,
          }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors du signalement du profil.");
        }
      } catch (error: any) {
        console.error("Erreur lors de l'envoi du signalement :", error.message);
        Alert.alert(
          "Erreur",
          "Une erreur s'est produite lors de l'envoi du signalement."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, getUserId, getToken, closeReportModal]
  );

  const handleFollowWithSubmitting = useCallback(async () => {
    setIsSubmitting(true);
    await handleFollow();
    setIsSubmitting(false);
  }, [handleFollow]);

  const handleUnfollowWithSubmitting = useCallback(async () => {
    setIsSubmitting(true);
    await handleUnfollow();
    setIsSubmitting(false);
  }, [handleUnfollow]);

  // États de l'application
  const isLoading = userLoading || statsLoading || contentLoading;
  const error = userError || statsError || contentError;

  // Rendu conditionnel
  if (isLoading) {
    return (
      <View style={profileStyles.center}>
        <ActivityIndicator size="large" color="#1B5D85" />
        <Text>Chargement du profil utilisateur...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={profileStyles.center}>
        <Text style={profileStyles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <View>
      <ProfileHeader
        toggleSidebar={toggleSidebar}
        openReportModal={openReportModal}
      />

      <ReportModal
        isVisible={isReportModalVisible}
        onClose={closeReportModal}
        onSendReport={handleSendReport}
      />

      <ScrollView contentContainerStyle={profileStyles.container}>
        <SectionProfile
          user={{
            username: rawUser?.username || "",
            fullName: displayName,
            avatar: rawUser?.profilePhoto?.url,
            verified: true,
            followers: rawUser?.followers?.length || 0,
            following: rawUser?.following?.length || 0,
            reports: stats?.numberOfReports || 0,
            location: rawUser?.nomCommune || "",
            memberSince: new Date(
              rawUser?.createdAt || Date.now()
            ).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
            isPremium: rawUser?.isSubscribed || false,
            ranking: rawUser?.ranking || null,
          }}
          isCurrentUser={
            userId != null &&
            currentUserId != null &&
            String(userId) === String(currentUserId)
          }
          onEditProfile={() => navigation.navigate("ProfileScreen")}
          onFollowUser={handleFollowWithSubmitting}
          onUnfollowUser={handleUnfollowWithSubmitting} // Ajout de la prop pour se désabonner
          isFollowing={isFollowing} // Ajout de la prop pour gérer l'état
          onMessageUser={() =>
            navigation.navigate("ChatScreen", {
              receiverId: userId,
              senderId: currentUserId,
            })
          }
          ranking={rawUser?.ranking || null}
          rankingSuffix={rankingSuffix}
          totalUsers={totalUsers ?? undefined}
          onNavigateToRanking={navigateToRanking}
          badgeStyle={badgeStyle}
          onShowBadgeModal={() => setShowBadgeModal(true)}
          cityName={rawUser?.nomCommune || ""}
        />

        <ProfilePhoto
          photoUrl={rawUser?.profilePhoto?.url}
          ranking={rawUser?.ranking || 999999}
          username={displayName}
          createdAt={rawUser?.createdAt}
          isSubmitting={isSubmitting}
          isFollowing={isFollowing}
          onFollow={handleFollowWithSubmitting}
          onUnfollow={handleUnfollowWithSubmitting}
          visible={false} // Add required props for ProfilePhotoModalProps
          onClose={() => {}} // Provide a default onClose handler
        />

        <ProfileTabs
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          userId={userId}
        />

        {selectedTab === "info" && (
          <UserInfoTab
            user={user}
            stats={stats}
            isFollowing={isFollowing}
            onFollow={handleFollowWithSubmitting}
            onUnfollow={handleUnfollowWithSubmitting}
            currentUserId={currentUserId}
            userId={userId}
            navigation={navigation}
            isSubmitting={isSubmitting}
          />
        )}

        {selectedTab === "signalement" && (
          <ReportsTab reports={reports} navigation={navigation} />
        )}

        {selectedTab === "publications" && (
          <PostsTab posts={posts} navigation={navigation} />
        )}

        {selectedTab === "evenement" && (
          <EventsTab events={events} navigation={navigation} />
        )}

        <View style={profileStyles.separator} />
      </ScrollView>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={dummyUpdateProfileImage}
        voteSummary={{
          up: stats?.votes?.filter((vote) => vote.type === "up").length || 0,
          down:
            stats?.votes?.filter((vote) => vote.type === "down").length || 0,
        }}
      />

      <BadgeModal
        visible={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        userVotes={stats?.votes?.length || 0}
      />
    </View>
  );
};

export default UserProfileScreen;
