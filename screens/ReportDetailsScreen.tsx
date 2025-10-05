// src/screens/ReportDetailsScreen.tsx - VERSION CORRIGÉE COMPLÈTE

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  View, 
  StatusBar, 
  StyleSheet, 
  Alert,
  Platform,
  Vibration 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hooks optimisés
import { useLocation } from "../hooks/location/useLocation";
import { useFetchReportDetails } from "../hooks/reports/useFetchReportDetails";
import { useToken } from "../hooks/auth/useToken";
import { useReportVoting } from "../hooks/reports/useReportVoting";
import { usePhotoGallery } from "../hooks/reports/usePhotoGallery";
import { useTabNavigation } from "../hooks/reports/useTabNavigation";
import { useTooltip } from "../hooks/reports/useTooltip";

// Types et interfaces
import { ReportDetailsProps } from "../types/navigation/params.types";

// Composants optimisés
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

// Modal de signalement
import PostReportModal from "../components/interactions/ReportDetails/PostReportModal";

/**
 * Interface pour la gestion du signalement avec types corrigés
 */
interface ReportSubmissionState {
  isLoading: boolean;
  error: string | null;
  canReport: boolean;
  reportCooldown: boolean;
}

/**
 * Service de signalement pour les rapports - TYPES CORRIGÉS
 */
class ReportService {
  private static readonly API_URL = process.env.API_URL || 'http://localhost:3000';
  private static readonly COOLDOWN_KEY = 'report_cooldown_';
  private static readonly COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Vérifie si l'utilisateur peut signaler ce rapport
   * @param reportId ID du rapport (number ou string)
   * @param currentUserId ID utilisateur actuel
   */
  static async canUserReport(
    reportId: number | string, 
    currentUserId: number | null
  ): Promise<boolean> {
    if (!currentUserId) return false;
    
    try {
      // Conversion sécurisée en string pour la clé
      const reportIdString = String(reportId);
      const cooldownKey = `${this.COOLDOWN_KEY}${reportIdString}_${currentUserId}`;
      const lastReportTime = await AsyncStorage.getItem(cooldownKey);
      
      if (lastReportTime) {
        const timeDiff = Date.now() - parseInt(lastReportTime, 10);
        if (timeDiff < this.COOLDOWN_DURATION) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.warn('Erreur vérification signalement:', error);
      return true; // En cas d'erreur, autoriser le signalement
    }
  }

  /**
   * Envoie un signalement de rapport - TYPES CORRIGÉS
   * @param reportId ID du rapport (number ou string)
   * @param reportReason Raison du signalement
   * @param reportType Type de signalement
   * @param currentUserId ID utilisateur actuel
   */
  static async submitReport(
    reportId: number | string,
    reportReason: string,
    reportType: string,
    currentUserId: number
  ): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Conversion sécurisée en string
      const reportIdString = String(reportId);

      const payload = {
        to: "yannleroy23@gmail.com", // Email administrateur
        subject: "Signalement d'un rapport",
        reportId: reportIdString,
        reporterId: currentUserId.toString(),
        reportReason: `${reportType}: ${reportReason}`,
        targetType: 'report',
        targetInfo: {
          reportId: reportIdString,
          url: `/reports/${reportIdString}`,
        }
      };

      const response = await fetch(`${this.API_URL}/mails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      // Enregistrer le cooldown avec clé string
      const cooldownKey = `${this.COOLDOWN_KEY}${reportIdString}_${currentUserId}`;
      await AsyncStorage.setItem(cooldownKey, Date.now().toString());

      console.log('✅ Signalement de rapport envoyé avec succès');
    } catch (error) {
      console.error('❌ Erreur signalement rapport:', error);
      throw error;
    }
  }
}

/**
 * Hook personnalisé pour la gestion des signalements - TYPES CORRIGÉS
 */
const useReportSubmission = (reportId: number | string, currentUserId: number | null) => {
  const [state, setState] = useState<ReportSubmissionState>({
    isLoading: false,
    error: null,
    canReport: true,
    reportCooldown: false,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Vérifie les permissions de signalement
   */
  const checkReportPermissions = useCallback(async () => {
    try {
      const canReport = await ReportService.canUserReport(reportId, currentUserId);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          canReport,
          reportCooldown: !canReport,
        }));
      }
    } catch (error) {
      console.warn('Erreur vérification permissions:', error);
    }
  }, [reportId, currentUserId]);

  /**
   * Soumet un signalement
   */
  const submitReport = useCallback(async (
    reportReason: string,
    reportType: string
  ): Promise<void> => {
    if (!currentUserId) {
      throw new Error('Utilisateur non connecté');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await ReportService.submitReport(reportId, reportReason, reportType, currentUserId);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          canReport: false,
          reportCooldown: true,
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
      
      throw error;
    }
  }, [reportId, currentUserId]);

  // Vérification initiale des permissions
  useEffect(() => {
    if (currentUserId) {
      checkReportPermissions();
    }
  }, [currentUserId, checkReportPermissions]);

  return {
    ...state,
    submitReport,
    refreshPermissions: checkReportPermissions,
  };
};

/**
 * Écran de détails de rapport optimisé - TYPES CORRIGÉS
 */
const ReportDetailsScreen: React.FC<ReportDetailsProps> = ({
  route,
  navigation,
}) => {
  const { reportId } = route.params;
  
  // Hooks de données
  const { location } = useLocation();
  const { getUserId } = useToken();
  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  // États locaux
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState<boolean>(false);

  // Hooks de fonctionnalités
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

  // Hook de signalement avec types corrigés
  const {
    isLoading: isReportLoading,
    error: reportError,
    canReport,
    reportCooldown,
    submitReport,
    refreshPermissions,
  } = useReportSubmission(reportId, currentUserId);

  /**
   * Récupération de l'ID utilisateur au montage
   */
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

  /**
   * Restauration du vote depuis le stockage local - CLÉS CORRIGÉES
   */
  useEffect(() => {
    const loadVote = async () => {
      try {
        // Conversion sécurisée en string pour la clé AsyncStorage
        const reportIdString = String(reportId);
        const storedVote = await AsyncStorage.getItem(`selectedVoteReport_${reportIdString}`);
        if (storedVote) {
          restoreVote(storedVote as "up" | "down");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du vote :", error);
      }
    };
    
    if (reportId) {
      loadVote();
    }
  }, [reportId, restoreVote]);

  /**
   * Gestion optimisée du vote avec sauvegarde - CLÉS CORRIGÉES
   */
  const handleVoteWithStorage = useCallback(async (type: "up" | "down") => {
    try {
      handleVote(type);
      // Conversion sécurisée en string pour la clé
      const reportIdString = String(reportId);
      await AsyncStorage.setItem(`selectedVoteReport_${reportIdString}`, type);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du vote :", error);
    }
  }, [handleVote, reportId]);

  /**
   * Navigation vers le profil utilisateur
   */
  const handleUserPress = useCallback(
    (userId: number) => {
      navigation.navigate("UserProfileScreen", { userId });
    },
    [navigation]
  );

  /**
   * Ouverture du modal de signalement
   */
  const handleReportPress = useCallback(() => {
    if (!currentUserId) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour signaler ce contenu.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    if (reportCooldown) {
      Alert.alert(
        "Signalement récent",
        "Vous avez déjà signalé ce contenu récemment. Veuillez patienter avant de signaler à nouveau.",
        [{ text: "Compris", style: "default" }]
      );
      return;
    }

    // Feedback haptique
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    setIsReportModalVisible(true);
  }, [currentUserId, reportCooldown]);

  /**
   * Fermeture du modal de signalement
   */
  const handleCloseReportModal = useCallback(() => {
    setIsReportModalVisible(false);
  }, []);

  /**
   * Soumission du signalement
   */
  const handleSubmitReport = useCallback(async (
    reportReason: string,
    reportType: string
  ): Promise<void> => {
    try {
      await submitReport(reportReason, reportType);
      setIsReportModalVisible(false);
      
      Alert.alert(
        "✅ Signalement envoyé",
        "Merci de contribuer à la sécurité de notre communauté. Votre signalement sera examiné par notre équipe.",
        [{ text: "OK", style: "default" }]
      );
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      throw error;
    }
  }, [submitReport]);

  /**
   * Gestion d'erreur avec retry
   */
  const handleErrorRetry = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Mémoisation des propriétés pour optimiser les performances - TYPES CORRIGÉS
   */
  const reportModalProps = useMemo(() => {
    // Conversion sécurisée du reportId en string pour le modal
    const reportIdString = String(reportId);
    const reportIdShort = reportIdString.length > 6 
      ? reportIdString.slice(-6) 
      : reportIdString;

    return {
      postId: reportIdString,
      postAuthor: `Rapport #${reportIdShort}`,
      postTitle: report?.title || "Rapport SmartCities",
    };
  }, [reportId, report?.title]);

  // États de chargement et d'erreur
  if (loading || !location) {
    return <LoadingState />;
  }

  if (!report) {
    return <ErrorState onRetry={handleErrorRetry} />;
  }

  return (
    <View style={styles.container}>
      {/* ✅ StatusBar translucent pour qu'elle ne prenne pas d'espace */}
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="dark-content" 
      />
      
      {/* Header avec bouton de signalement intégré */}
      <HeaderSection
        title={report.title}
        onBack={() => navigation.goBack()}
        onReportPress={handleReportPress}
        onTitlePress={showTooltip}
        onTitleLayout={measureLayout}
        isReportLoading={isReportLoading}
        reportDisabled={!canReport || !currentUserId}
      />
      
      {/* Tooltip du titre */}
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
          onVote={handleVoteWithStorage}
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
        <CommentsTabContent report={report} />
      )}

      {/* Modal de signalement avec props corrigées */}
      <PostReportModal
        isVisible={isReportModalVisible}
        onClose={handleCloseReportModal}
        onSendReport={handleSubmitReport}
        {...reportModalProps}
      />
    </View>
  );
};

/**
 * Styles optimisés - ✅ Fond modifié pour correspondre au nouveau thème
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7", // Couleur de fond iOS
  },
});

export default ReportDetailsScreen;