// Chemin: screens/UserProfileScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import { View, ActivityIndicator, Text, ScrollView, Alert } from "react-native";
import Sidebar from "../components/common/Sidebar";
import { profileStyles } from "../styles/profileStyles";
import { useToken } from "../hooks/auth/useToken";
// Import direct de RankBadge
import RankBadge from "../components/home/ProfileSection/RankBadge";
// Utiliser useBadge au lieu de badgeUtils
import useBadge from "../hooks/ui/useBadge";
import { 
  useUserProfile, 
  useUserStats, 
  useUserContent 
} from "../hooks/profile/index";
// Imports des autres composants
import {
  ProfileHeader,
  ProfilePhoto,
  ProfileTabs,
  UserInfoTab,
  ReportsTab,
  PostsTab,
  EventsTab,
  ReportModal
} from "../components/profile";
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
  
  // États locaux
  const [selectedTab, setSelectedTab] = useState<TabType>("info");
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [modalOrnementVisible, setModalOrnementVisible] = useState(false);
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
  
  // Hook pour les badges utilisateur
  const { getBadgeStyles } = useBadge();
  
  // Calcul du style du badge en fonction des votes
  const badgeStyle = useMemo(() => {
    if (!stats?.votes?.length) return undefined;
    return getBadgeStyles(stats.votes.length);
  }, [stats?.votes?.length, getBadgeStyles]);
  
  
  // Estimation du nombre total d'utilisateurs pour le badge
  // Note: Puisque stats n'a pas de propriété totalUsers, nous utilisons une valeur par défaut
  // Idéalement, cette valeur devrait venir d'une API ou d'un autre hook
  const totalUsersEstimate = useMemo(() => {
    // Si vous avez accès à cette donnée ailleurs, utilisez-la ici
    return 1000; // Valeur par défaut
  }, []);
  
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

  /**
   * Ouvre la modale des paliers
   */
  const openTiersModal = useCallback(() => {
    setModalOrnementVisible(true);
  }, []);

  /**
   * Ferme la modale des paliers
   */
  const closeTiersModal = useCallback(() => {
    setModalOrnementVisible(false);
  }, []);

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
        
        {/* RankBadge remplaçant BadgeDisplay */}
        {user?.ranking && (
          <RankBadge
          ranking={user?.ranking || 999999} // Utiliser une grande valeur par défaut si pas de classement
          rankingSuffix={user?.ranking === 1 ? 'er' : 'ème'}
          totalUsers={totalUsersEstimate}
          onNavigateToRanking={openTiersModal}
          badgeStyle={badgeStyle || getBadgeStyles(0)} // Utiliser le badge "Premiers pas" si pas de votes
          onShowBadgeModal={openTiersModal}
          showStatsSection={false}
        />
        )}
        
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