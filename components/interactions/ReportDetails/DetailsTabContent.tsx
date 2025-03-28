// src/components/interactions/ReportDetails/DetailsTabContent.tsx

import React, { memo, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Report, VoteType } from "../../../types/entities/report.types";
import ReportMetadata from "./ReportMetadata";
import VotingSection from "./VotingSection";
import PhotoGallery from "./PhotoGallery";
import UserInfoSection from "./UserInfoSection";

// Constantes de style
const COLORS = {
  primary: "#8E2DE2",
  primaryDark: "#4A00E0",
  primaryLight: "rgba(142, 45, 226, 0.05)",
  accent: "#00C6FB",
  accentDark: "#005BEA",
  accentLight: "rgba(0, 198, 251, 0.05)",
  backgroundGradient: ["#F8F9FF", "#F0F4FF"],
  cardBackground: "#FFFFFF",
};

interface DetailsTabContentProps {
  report: Report;
  votes: { upVotes: number; downVotes: number };
  selectedVote: VoteType;
  photoModalVisible: boolean;
  selectedPhotoIndex: number | null;
  onVote: (type: "up" | "down") => void;
  onPhotoPress: (index: number) => void;
  onClosePhotoModal: () => void;
  onUserPress: (userId: number) => void;
}

/**
 * Composant pour le contenu de l'onglet Détails
 * Avec animations d'entrée et design moderne
 */
const DetailsTabContent: React.FC<DetailsTabContentProps> = ({
  report,
  votes,
  selectedVote,
  photoModalVisible,
  selectedPhotoIndex,
  onVote,
  onPhotoPress,
  onClosePhotoModal,
  onUserPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.tabContentContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.gradientBackground}>
        <ScrollView 
          style={styles.tabContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.detailsContainer}>
            {/* Métadonnées du signalement */}
            <ReportMetadata report={report} />
            
            {/* Section de vote */}
            <VotingSection 
              votes={votes}
              selectedVote={selectedVote}
              onVote={onVote}
            />
            
            {/* Galerie photos */}
            <PhotoGallery
              photos={report.photos}
              photoModalVisible={photoModalVisible}
              selectedPhotoIndex={selectedPhotoIndex}
              openPhotoModal={onPhotoPress}
              closePhotoModal={onClosePhotoModal}
            />
            
            {/* Informations sur l'auteur */}
            <UserInfoSection
              user={report.user}
              onUserPress={onUserPress}
            />
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabContentContainer: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  detailsContainer: {
    padding: 20,
  },
});

export default memo(DetailsTabContent);