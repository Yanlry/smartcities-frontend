



// src/components/interactions/ReportDetails/TitleTooltip.tsx

import React, { memo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { height, width } = Dimensions.get("window");

/**
 * Système de couleurs harmonieux pour le tooltip
 */
const COLORS = {
  // Gradient principal
  gradient: ["#2E5BFF", "#1E40AF"] as const,
  
  // Texte & accents
  text: {
    light: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.7)",
  },
  
  // Arrière-plan
  backdrop: "rgba(0, 0, 0, 0.45)",
  
  // Effets visuels
  glass: {
    border: "rgba(255, 255, 255, 0.15)",
  },
};

/**
 * Système d'ombres optimisé par plateforme
 */
const SHADOWS = {
  tooltip: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
    },
    android: {
      elevation:
      12,
    },
  }),
  
  content: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    },
    android: {
      elevation: 4,
    },
  }),
};

interface TitleTooltipProps {
  visible: boolean;
  title: string;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  animatedOpacity: Animated.Value;
  animatedScale: Animated.Value;
  onClose: () => void;
}

/**
 * Tooltip élégant avec design premium pour afficher le titre complet
 */
const TitleTooltip: React.FC<TitleTooltipProps> = ({
  visible,
  title,
  layout,
  animatedOpacity,
  animatedScale,
  onClose,
}) => {
  if (!visible) return null;
  
  // Calcul de la position optimale pour le tooltip
  const tooltipTop = Math.min(layout.y + 65, height - 170);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.tooltipOverlay}>
          <Animated.View 
            style={[
              styles.tooltipContainer,
              {
                opacity: animatedOpacity,
                transform: [{ scale: animatedScale }],
                top: tooltipTop,
                left: 20,
                right: 20,
                maxWidth: width - 40
              }
            ]}
          >
            <LinearGradient
              colors={COLORS.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tooltipContent}
            >
              {/* Triangle pointant vers le titre */}
              <View style={styles.tooltipArrow} />
              
              {/* Contenu du tooltip */}
              <Text style={styles.tooltipTitle}>Titre complet</Text>
              <Text style={styles.tooltipText}>{title}</Text>
              
              {/* Message d'aide */}
              <View style={styles.tooltipFooter}>
                <Text style={styles.tooltipHint}>Appuyez n'importe où pour fermer</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  tooltipOverlay: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
  },
  tooltipContainer: {
    position: "absolute",
    borderRadius: 20,
    ...SHADOWS.tooltip,
    overflow: 'hidden',
  },
  tooltipContent: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    ...SHADOWS.content,
  },
  tooltipArrow: {
    position: "absolute",
    top: -10,
    left: width / 2 - 40,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLORS.gradient[0],
  },
  tooltipTitle: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tooltipText: {
    color: COLORS.text.light,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  tooltipFooter: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  tooltipHint: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: "400",
    opacity: 0.8,
  },
});

export default memo(TitleTooltip);