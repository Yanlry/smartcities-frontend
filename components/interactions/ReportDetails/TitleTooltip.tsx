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
} from "react-native";

const { height, width } = Dimensions.get("window");

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
 * Composant de tooltip pour afficher le titre complet
 * avec animations fluides et positionnement intelligent
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
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.tooltipOverlay}>
          <Animated.View 
            style={[
              styles.titleTooltip,
              {
                opacity: animatedOpacity,
                transform: [{ scale: animatedScale }],
                top: Math.min(layout.y + 60, height - 150), // Éviter de sortir de l'écran
                left: 20,
                right: 20,
                maxWidth: width - 40
              }
            ]}
          >
            <View style={styles.tooltipArrow} />
            <Text style={styles.tooltipText}>{title}</Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleTooltip: {
    position: "absolute",
    backgroundColor: "rgba(33, 33, 33, 0.95)",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  tooltipArrow: {
    position: "absolute",
    top: -10,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(33, 33, 33, 0.95)",
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default memo(TitleTooltip);