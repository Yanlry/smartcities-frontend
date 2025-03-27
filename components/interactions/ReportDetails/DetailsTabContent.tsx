// src/components/interactions/ReportDetails/DetailsTabContent.tsx

import React, { memo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Report, VoteType } from  "../../../types/entities/report.types";
import ReportMetadata from "./ReportMetadata";
import VotingSection from "./VotingSection";
import PhotoGallery from "./PhotoGallery";
import UserInfoSection from "./UserInfoSection";

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
 * Assembler tous les sous-composants dans un ordre logique
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
  return (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      bounces={true}
      overScrollMode="always"
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
  );
};

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  detailsContainer: {
    padding: 16,
  },
});

export default memo(DetailsTabContent);