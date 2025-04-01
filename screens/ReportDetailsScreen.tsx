import React, { useState, useEffect, useCallback } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { useLocation } from "../hooks/location/useLocation";
import { useFetchReportDetails } from "../hooks/reports/useFetchReportDetails";
import { useToken } from "../hooks/auth/useToken";
import { useReportVoting } from "../hooks/reports/useReportVoting";
import { usePhotoGallery } from "../hooks/reports/usePhotoGallery";
import { useTabNavigation } from "../hooks/reports/useTabNavigation";
import { useTooltip } from "../hooks/reports/useTooltip";
import { ReportDetailsProps } from "../types/navigation/params.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const ReportDetailsScreen: React.FC<ReportDetailsProps> = ({
  route,
  navigation,
}) => {
  const { reportId } = route.params;
  const { location } = useLocation();
  const { getUserId } = useToken();
  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // Récupération de restoreVote depuis le hook pour la restauration
  const { votes, selectedVote, handleVote, restoreVote } = useReportVoting({
    report,
    currentUserId,
    location,
  });
  const {
    photoModalVisible,
    selectedPhotoIndex,
    openPhotoModal,
    closePhotoModal,
  } = usePhotoGallery();
  const { activeTab, mapReady, indicatorPosition, changeTab, handleMapReady } =
    useTabNavigation();
  const {
    titleTooltipVisible,
    titleLayout,
    animatedTooltipOpacity,
    animatedTooltipScale,
    showTooltip,
    hideTooltip,
    measureLayout,
  } = useTooltip();

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

  // Utilisez restoreVote pour restaurer uniquement l'état visuel du vote
  useEffect(() => {
    const loadVote = async () => {
      try {
        const storedVote = await AsyncStorage.getItem(`selectedVoteReport_${reportId}`);
        if (storedVote) {
          restoreVote(storedVote as "up" | "down");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du vote :", error);
      }
    };
    loadVote();
  }, [reportId, restoreVote]);

  const handleUserPress = useCallback(
    (userId: number) => {
      navigation.navigate("UserProfileScreen", { userId });
    },
    [navigation]
  );

  if (loading || !location) {
    return <LoadingState />;
  }
  if (!report) {
    return <ErrorState onRetry={() => navigation.goBack()} />;
  }

  // Wrapper sur handleVote pour sauvegarder dans AsyncStorage
  const onVote = async (type: "up" | "down") => {
    handleVote(type);
    try {
      await AsyncStorage.setItem(`selectedVoteReport_${reportId}`, type);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du vote :", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <HeaderSection
        title={report.title}
        onBack={() => navigation.goBack()}
        onNotificationsPress={() => navigation.navigate("NotificationsScreen")}
        onTitlePress={showTooltip}
        onTitleLayout={measureLayout}
      />
      <TitleTooltip
        visible={titleTooltipVisible}
        title={report.title}
        layout={titleLayout}
        animatedOpacity={animatedTooltipOpacity}
        animatedScale={animatedTooltipScale}
        onClose={hideTooltip}
      />
      <TabNavigation
        activeTab={activeTab}
        indicatorPosition={indicatorPosition}
        onTabChange={changeTab}
      />
      {activeTab === 0 && (
        <DetailsTabContent
          report={report}
          votes={votes}
          selectedVote={selectedVote}
          photoModalVisible={photoModalVisible}
          selectedPhotoIndex={selectedPhotoIndex}
          onVote={onVote}
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
      {activeTab === 2 && <CommentsTabContent report={report} />}
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