// src/screens/ReportDetailsScreen.tsx - VERSION AVEC TEMPS RESTANT

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
import styles from "../styles/screens/ReportDetailsScreen.styles";

/**
 * Interface pour la gestion du signalement avec types corrigés
 */
interface ReportSubmissionState {
  isLoading: boolean;
  error: string | null;
  canReport: boolean;
  reportCooldown: boolean;
  timeRemaining?: number; // Temps restant en millisecondes
}

/**
 * ✅ FONCTION MAGIQUE : Transforme les millisecondes en texte français
 * 
 * Exemples de ce qu'elle fait :
 * - 270000 millisecondes → "4 minutes et 30 secondes"
 * - 120000 millisecondes → "2 minutes"
 * - 45000 millisecondes → "45 secondes"
 */
function formatTimeRemaining(milliseconds: number): string {
  // On transforme les millisecondes en secondes (on arrondit vers le haut)
  const totalSeconds = Math.ceil(milliseconds / 1000);
  
  // On calcule combien de minutes et de secondes
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // On crée le texte en français
  if (minutes > 0 && seconds > 0) {
    // Si on a des minutes ET des secondes : "4 minutes et 30 secondes"
    return `${minutes} minute${minutes > 1 ? 's' : ''} et ${seconds} seconde${seconds > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    // Si on a seulement des minutes : "4 minutes"
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    // Si on a seulement des secondes : "45 secondes"
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
  }
}

/**
 * Service de signalement pour les rapports
 */
class ReportService {
  private static readonly API_URL = process.env.API_URL || 'http://localhost:3000';
  private static readonly COOLDOWN_KEY = 'report_cooldown_';
  private static readonly COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * ✅ FONCTION MODIFIÉE : Maintenant elle retourne AUSSI le temps restant !
   * 
   * Avant : { canReport: true }
   * Maintenant : { canReport: false, timeRemaining: 180000 } (3 minutes)
   */
  static async canUserReport(
    reportId: number | string, 
    currentUserId: number | null
  ): Promise<{ canReport: boolean; timeRemaining: number }> {
    if (!currentUserId) {
      return { canReport: false, timeRemaining: 0 };
    }
    
    try {
      const reportIdString = String(reportId);
      const cooldownKey = `${this.COOLDOWN_KEY}${reportIdString}_${currentUserId}`;
      const lastReportTime = await AsyncStorage.getItem(cooldownKey);
      
      if (lastReportTime) {
        // On calcule combien de temps s'est écoulé depuis le dernier signalement
        const timeDiff = Date.now() - parseInt(lastReportTime, 10);
        
        // On calcule combien de temps il reste à attendre
        const timeRemaining = this.COOLDOWN_DURATION - timeDiff;
        
        if (timeDiff < this.COOLDOWN_DURATION) {
          // ✅ COOLDOWN ACTIF : On dit "NON tu peux pas" + "il reste X temps"
          return { canReport: false, timeRemaining };
        }
      }
      
      // ✅ PAS DE COOLDOWN : On dit "OUI tu peux !"
      return { canReport: true, timeRemaining: 0 };
    } catch (error) {
      console.warn('Erreur vérification signalement:', error);
      return { canReport: true, timeRemaining: 0 };
    }
  }

  /**
   * Envoie un signalement de rapport
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

      const reportIdString = String(reportId);

      const payload = {
        to: "yannleroy23@gmail.com",
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
 * Hook personnalisé pour la gestion des signalements
 */
const useReportSubmission = (reportId: number | string, currentUserId: number | null) => {
  const [state, setState] = useState<ReportSubmissionState>({
    isLoading: false,
    error: null,
    canReport: true,
    reportCooldown: false,
    timeRemaining: 0,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * ✅ FONCTION MODIFIÉE : Elle récupère maintenant le temps restant aussi !
   */
  const checkReportPermissions = useCallback(async () => {
    try {
      // On demande : "Est-ce qu'il peut signaler ?" et "Combien de temps reste ?"
      const { canReport, timeRemaining } = await ReportService.canUserReport(reportId, currentUserId);
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          canReport,
          reportCooldown: !canReport,
          timeRemaining, // ✅ On stocke le temps restant ici !
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
          timeRemaining: 5 * 60 * 1000, // 5 minutes
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
 * Écran de détails de rapport optimisé
 */
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
  const [isReportModalVisible, setIsReportModalVisible] = useState<boolean>(false);

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

  const {
    isLoading: isReportLoading,
    error: reportError,
    canReport,
    reportCooldown,
    timeRemaining, // ✅ On récupère le temps restant ici !
    submitReport,
    refreshPermissions,
  } = useReportSubmission(reportId, currentUserId);

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

  useEffect(() => {
    const loadVote = async () => {
      try {
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

  const handleVoteWithStorage = useCallback(async (type: "up" | "down") => {
    try {
      handleVote(type);
      const reportIdString = String(reportId);
      await AsyncStorage.setItem(`selectedVoteReport_${reportIdString}`, type);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du vote :", error);
    }
  }, [handleVote, reportId]);

  const handleUserPress = useCallback(
    (userId: number) => {
      navigation.navigate("UserProfileScreen", { userId });
    },
    [navigation]
  );

  /**
   * ✅✅✅ FONCTION SUPER IMPORTANTE : C'est ici que le message s'affiche !
   * 
   * Quand tu cliques sur le bouton de signalement, cette fonction s'active.
   * Elle vérifie si tu es en cooldown et affiche le temps restant.
   */
  const handleReportPress = useCallback(() => {
    // 1️⃣ Vérifier si l'utilisateur est connecté
    if (!currentUserId) {
      Alert.alert(
        "Connexion requise",
        "Vous devez être connecté pour signaler ce contenu.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    // 2️⃣ ✅ PARTIE MAGIQUE : Si en cooldown, afficher le temps restant !
    if (reportCooldown && timeRemaining) {
      // On transforme les millisecondes en texte français
      const formattedTime = formatTimeRemaining(timeRemaining);
      
      // On affiche le message avec le temps exact
      Alert.alert(
        "Signalement récent",
        `Vous avez déjà signalé ce rapport. Veuillez attendre encore ${formattedTime} avant de faire un nouveau signalement.`,
        [{ text: "Compris", style: "default" }]
      );
      return;
    }

    // 3️⃣ Si pas de cooldown, on ouvre le modal de signalement
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    setIsReportModalVisible(true);
  }, [currentUserId, reportCooldown, timeRemaining]);

  const handleCloseReportModal = useCallback(() => {
    setIsReportModalVisible(false);
  }, []);

  const handleSubmitReport = useCallback(async (
    reportReason: string,
    reportType: string
  ): Promise<void> => {
    try {
      await submitReport(reportReason, reportType);
      setIsReportModalVisible(false);
      
      Alert.alert(
        "Signalement envoyé",
        "Merci de contribuer à la sécurité de notre communauté. Votre signalement sera examiné par notre équipe.",
        [{ text: "OK", style: "default" }]
      );
    } catch (error) {
      console.error("Erreur lors du signalement:", error);
      throw error;
    }
  }, [submitReport]);

  const handleErrorRetry = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const reportModalProps = useMemo(() => {
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

  if (loading || !location) {
    return <LoadingState />;
  }

  if (!report) {
    return <ErrorState onRetry={handleErrorRetry} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="dark-content" 
      />
      
      <HeaderSection
        title={report.title}
        onBack={() => navigation.goBack()}
        onReportPress={handleReportPress}
        onTitlePress={showTooltip}
        onTitleLayout={measureLayout}
        isReportLoading={isReportLoading}
        reportDisabled={!canReport || !currentUserId}
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

      <PostReportModal
        isVisible={isReportModalVisible}
        onClose={handleCloseReportModal}
        onSendReport={handleSubmitReport}
        {...reportModalProps}
      />
    </View>
  );
};

export default ReportDetailsScreen;