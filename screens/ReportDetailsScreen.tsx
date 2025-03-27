// src/screens/ReportDetailsScreen.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { useLocation } from "../hooks/location/useLocation";
import { useFetchReportDetails } from "../hooks/reports/useFetchReportDetails";
import { useToken } from "../hooks/auth/useToken";
import { useReportVoting } from "../hooks/reports/useReportVoting";
import { usePhotoGallery } from "../hooks/reports/usePhotoGallery";
import { useTabNavigation } from "../hooks/reports/useTabNavigation";
import { useTooltip } from "../hooks/reports/useTooltip";
import { ReportDetailsProps } from "../types/report.types";

// Import des composants modulaires
import {
  HeaderSection,
  TabNavigation,
  DetailsTabContent,
  MapTabContent,
  CommentsTabContent,
  TitleTooltip,
  LoadingState,
  ErrorState,
} from "../components/interactions/ReportDetails";

/**
 * Écran de détails du signalement - Version refactorisée
 * Suit une approche modulaire avec séparation des responsabilités
 */
const ReportDetailsScreen: React.FC<ReportDetailsProps> = ({ route, navigation }) => {
  // Récupération des paramètres et initialisation des hooks
  const { reportId } = route.params;
  const { location } = useLocation();
  const { getUserId } = useToken();
  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  // Hooks personnalisés pour la gestion de l'état et des interactions
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const { votes, selectedVote, handleVote } = useReportVoting({
    report,
    currentUserId,
    location
  });
  const { photoModalVisible, selectedPhotoIndex, openPhotoModal, closePhotoModal } = usePhotoGallery();
  const { activeTab, mapReady, indicatorPosition, changeTab, handleMapReady } = useTabNavigation();
  const {
    titleTooltipVisible,
    titleLayout,
    animatedTooltipOpacity,
    animatedTooltipScale,
    showTooltip,
    hideTooltip,
    measureLayout
  } = useTooltip();

  // Effet pour charger l'ID de l'utilisateur au montage du composant
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'ID utilisateur:", error);
      }
    };
    
    fetchUserId();
  }, [getUserId]);

  // Navigation vers l'écran de profil utilisateur
  const handleUserPress = useCallback((userId: number) => {
    navigation.navigate("UserProfileScreen", { userId });
  }, [navigation]);

  // Rendu conditionnel pour l'état de chargement
  if (loading || !location) {
    return <LoadingState />;
  }

  // Rendu conditionnel pour l'état d'erreur
  if (!report) {
    return (
      <ErrorState
        onRetry={() => navigation.goBack()}
      />
    );
  }

  // Rendu principal
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* En-tête */}
      <HeaderSection
        title={report.title}
        onBack={() => navigation.goBack()}
        onNotificationsPress={() => navigation.navigate("NotificationsScreen")}
        onTitlePress={showTooltip}
        onTitleLayout={measureLayout}
      />
      
      {/* Tooltip pour le titre complet */}
      <TitleTooltip
        visible={titleTooltipVisible}
        title={report.title}
        layout={titleLayout}
        animatedOpacity={animatedTooltipOpacity}
        animatedScale={animatedTooltipScale}
        onClose={hideTooltip}
      />
      
      {/* Navigation par onglets */}
      <TabNavigation
        activeTab={activeTab}
        indicatorPosition={indicatorPosition}
        onTabChange={changeTab}
      />
      
      {/* Contenu des onglets */}
      {activeTab === 0 && (
        <DetailsTabContent
          report={report}
          votes={votes}
          selectedVote={selectedVote}
          photoModalVisible={photoModalVisible}
          selectedPhotoIndex={selectedPhotoIndex}
          onVote={handleVote}
          onPhotoPress={openPhotoModal}
          onClosePhotoModal={closePhotoModal}
          onUserPress={handleUserPress}
        />
      )}
      
      {activeTab === 1 && (
        <MapTabContent
          report={report}
          routeCoords={routeCoords}
          mapReady={mapReady}
          onMapReady={handleMapReady}
        />
      )}
      
      {activeTab === 2 && (
        <CommentsTabContent
          report={report}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
});

export default ReportDetailsScreen;