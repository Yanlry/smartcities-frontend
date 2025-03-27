// src/components/interactions/ReportDetails/CommentsTabContent.tsx

import React, { memo, useMemo } from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import CommentsSection from "../../interactions/CommentsSection/CommentsSection";
import { Report } from "../../../types/report.types";

// Interface pour le type attendu par le composant CommentsSection
interface CommentsSectionReport {
  id: string;
  latitude: number;
  longitude: number;
  comments: any[];
}

interface CommentsTabContentProps {
  report: Report;
}

/**
 * Composant pour le contenu de l'onglet Commentaires
 * Ce composant adapte le format du signalement pour le composant CommentsSection
 */
const CommentsTabContent: React.FC<CommentsTabContentProps> = ({
  report,
}) => {
  // Adapter le format du signalement pour correspondre à ce qu'attend CommentsSection
  const adaptedReport = useMemo<CommentsSectionReport>(() => ({
    id: String(report.id), // Conversion explicite du number en string
    latitude: report.latitude,
    longitude: report.longitude,
    comments: report.comments || [],
  }), [report]);

  return (
    <View style={styles.commentsContent}>
      <CommentsSection report={adaptedReport} />
    </View>
  );
};

const styles = StyleSheet.create({
  commentsContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

export default memo(CommentsTabContent);