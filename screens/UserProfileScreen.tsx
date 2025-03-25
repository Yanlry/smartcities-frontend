// Chemin: screens/UserProfileScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import { View, ActivityIndicator, Text, ScrollView, Alert } from "react-native";
import Sidebar from "../components/common/Sidebar";
import { profileStyles } from "../styles/profileStyles";
import { useToken } from "../hooks/auth/useToken";
import { useBadge } from "../hooks/ui/useBadge"; // Import du hook useBadge

import { 
  useUserProfile, 
  useUserStats, 
  useUserContent,

} from "../hooks/profile/index";
import { useUserRanking } from "../hooks/user/useUserRanking"; // Import du hook useUserRanking
// Imports des autres composants
import {
  ProfileHeader,
  ProfilePhoto,
  ProfileTabs,
  UserInfoTab,
  ReportsTab,
  PostsTab,
  EventsTab,
  ReportModal,
} from "../components/profile";
import RankBadge from "../components/home/ProfileSection/RankBadge";

// Import des types
import { TabType } from "../types/profile.types";
import { StackScreenProps } from "@react-navigation/stack";
// @ts-ignore
import { API_URL } from "@env";
import { ParamListBase } from "@react-navigation/native";

type UserProfileScreenNavigationProps = StackScreenProps<ParamListBase, "UserProfileScreen">;


/**
 * Interface pour les props du composant UserProfileScreen
 */
interface UserProfileScreenProps {
  route: {
    params: {
      userId: string;
    }
  };
  navigation: any;
}


/**
 * Écran de profil utilisateur
 */
const UserProfileScreen: React.FC<UserProfileScreenNavigationProps> = ({ route, navigation }) => {
  const { userId } = route.params as UserProfileScreenProps["route"]["params"];
  const { getToken, getUserId } = useToken();
  const { getBadgeStyles } = useBadge(); // Utilisation du hook useBadge
  
  // États locaux
  const [selectedTab, setSelectedTab] = useState<TabType>("info");
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks personnalisés pour les données
  const { 
    user, 
    loading: userLoading, 
    error: userError, 
    isFollowing,
    currentUserId,
    handleFollow,
    handleUnfollow 
  } = useUserProfile(userId);
  
  const { stats, loading: statsLoading, error: statsError } = useUserStats(userId);
  
  const { 
    posts, 
    reports, 
    events, 
    loading: contentLoading, 
    error: contentError 
  } = useUserContent(userId);

  // Hooks pour récupérer le ranking et totalUsers (similaire à HomeScreen)
  const { ranking: rankingFromRanking, totalUsers: totalUsersFromRanking, getRankingSuffix } = useUserRanking(user?.nomCommune || "");

  // Vous pouvez conserver le calcul du suffixe pour le cas où user?.ranking est défini localement,
  // ou utiliser directement getRankingSuffix(rankingFromRanking)
  const rankingSuffix = useMemo(() => getRankingSuffix(rankingFromRanking), [getRankingSuffix, rankingFromRanking]);

  // Remplacer la récupération de totalUsers :
  // const totalUsers = stats?.totalUsers || 0;
  const totalUsers = totalUsersFromRanking;
  
  /**
   * Bascule l'état du sidebar
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  /**
   * Ouvre la modale de signalement
   */
  const openReportModal = useCallback(() => {
    setReportModalVisible(true);
  }, []);

  /**
   * Ferme la modale de signalement
   */
  const closeReportModal = useCallback(() => {
    setReportModalVisible(false);
  }, []);

  /**
   * Navigation vers l'écran de classement
   */
  const navigateToRanking = useCallback(() => {
    navigation.navigate("RankingScreen");
  }, [navigation]);

  /**
   * Affiche la modale de badge
   */
  const showBadgeModal = useCallback(() => {
    // Implementer selon vos besoins
    Alert.alert("Badge", "Informations sur le badge de l'utilisateur");
  }, []);

  /**
   * Récupère le style du badge en fonction des votes de l'utilisateur
   */
  const badgeStyle = useMemo(() => {
    return getBadgeStyles(stats?.votes?.length || 0);
  }, [getBadgeStyles, stats?.votes?.length]);

  /**
   * Envoie un signalement au serveur
   */
  const handleSendReport = useCallback(async (reason: string) => {
    if (!reason.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une raison pour le signalement.");
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

      Alert.alert("Succès", "Le signalement a été envoyé avec succès.");
      closeReportModal();
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du signalement :", error.message);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de l'envoi du signalement."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, getUserId, getToken, closeReportModal]);

  /**
   * Gère l'action de suivre un utilisateur avec indication de chargement
   */
  const handleFollowWithSubmitting = useCallback(async () => {
    setIsSubmitting(true);
    await handleFollow();
    setIsSubmitting(false);
  }, [handleFollow]);

  /**
   * Gère l'action de se désabonner d'un utilisateur avec indication de chargement
   */
  const handleUnfollowWithSubmitting = useCallback(async () => {
    setIsSubmitting(true);
    await handleUnfollow();
    setIsSubmitting(false);
  }, [handleUnfollow]);


  // Vérification du chargement et des erreurs
  const isLoading = userLoading || statsLoading || contentLoading;
  const error = userError || statsError || contentError;

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <View style={profileStyles.center}>
        <ActivityIndicator size="large" color="#062C41" />
        <Text>Chargement du profil utilisateur...</Text>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <View style={profileStyles.center}>
        <Text style={profileStyles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <View>
      {/* En-tête avec boutons de menu et signalement */}
      <ProfileHeader 
        toggleSidebar={toggleSidebar} 
        openReportModal={openReportModal} 
      />
      
      {/* Modale pour signaler un utilisateur */}
      <ReportModal 
        isVisible={isReportModalVisible}
        onClose={closeReportModal}
        onSendReport={handleSendReport}
      />

      <ScrollView contentContainerStyle={profileStyles.container}>
        {/* Photo de profil avec médaille si dans le top 3 */}
        <ProfilePhoto 
          photoUrl={user?.profilePhoto?.url}
          ranking={user?.ranking || 999999} // Utiliser une grande valeur par défaut si pas de classement
          isSubmitting={isSubmitting}
          isFollowing={isFollowing}
          onFollow={handleFollowWithSubmitting}
          onUnfollow={handleUnfollowWithSubmitting}
        />

        {/* Badge de classement - Intégration du composant RankBadge */}
        <View>
          <RankBadge
            ranking={user?.ranking || null}
            rankingSuffix={rankingSuffix}
            totalUsers={totalUsers}
            onNavigateToRanking={navigateToRanking}
            badgeStyle={badgeStyle}
            onShowBadgeModal={showBadgeModal}
          />
        </View>
        
        {/* Onglets de navigation entre les sections */}
        <ProfileTabs 
          selectedTab={selectedTab} 
          onSelectTab={setSelectedTab} 
        />

        {/* Contenu de l'onglet sélectionné */}
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
          <ReportsTab 
            reports={reports} 
            navigation={navigation} 
          />
        )}

        {selectedTab === "publications" && (
          <PostsTab 
            posts={posts} 
            navigation={navigation} 
          />
        )}

        {selectedTab === "evenement" && (
          <EventsTab 
            events={events} 
            navigation={navigation} 
          />
        )}
        
        <View style={profileStyles.separator} />
      </ScrollView>

      {/* Menu latéral */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
};

export default UserProfileScreen;