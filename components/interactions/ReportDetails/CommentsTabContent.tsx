// src/components/interactions/ReportDetails/CommentsTabContent.tsx

import React, { memo, useMemo, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import CommentsSection from "../../interactions/CommentsSection/CommentsSection";
import { Report } from "../../../types/entities/report.types";

// Constantes de style
const COLORS = {
  primary: "#8E2DE2",
  primaryDark: "#4A00E0",
  primaryLight: "rgba(142, 45, 226, 0.05)",
  accent: "#00C6FB",
  accentDark: "#005BEA",
  accentLight: "rgba(0, 198, 251, 0.05)",
  lightGray: "#F0F4FF",
  white: "#FFFFFF",
};

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Animation d'entrée
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

  // Adapter le format du signalement pour correspondre à ce qu'attend CommentsSection
  const adaptedReport = useMemo<CommentsSectionReport>(() => ({
    id: String(report.id), // Conversion explicite du number en string
    latitude: report.latitude,
    longitude: report.longitude,
    comments: report.comments || [],
  }), [report]);

  return (
    <Animated.View 
      style={[
        styles.commentsContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.gradientBackground}>
        <View style={styles.commentsWrapper}>
          <CommentsSection report={adaptedReport} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  commentsContent: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  commentsWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 12,
  }
});

export default memo(CommentsTabContent);