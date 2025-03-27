// src/components/interactions/ReportDetails/HeaderSection.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface HeaderTitleProps {
  title: string;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

/**
 * Sous-composant pour le titre avec tooltip
 */
const HeaderTitle = memo(({ title, onPress, onLayout }: HeaderTitleProps) => (
  <TouchableOpacity 
    activeOpacity={0.6} 
    onPress={onPress} 
    onLayout={onLayout}
  >
    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <Icon name="information-circle-outline" size={16} color="#666" style={styles.infoIcon} />
    </View>
  </TouchableOpacity>
));

interface HeaderSectionProps {
  title: string;
  onBack: () => void;
  onNotificationsPress: () => void;
  onTitlePress: () => void;
  onTitleLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Composant d'en-tête principal pour l'écran de détails
 */
const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  onBack,
  onNotificationsPress,
  onTitlePress,
  onTitleLayout,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <HeaderTitle 
        title={title} 
        onPress={onTitlePress}
        onLayout={onTitleLayout}
      />
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onNotificationsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="notifications-outline" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    maxWidth: '90%',
    textAlign: "center",
  },
  infoIcon: {
    marginLeft: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default memo(HeaderSection);