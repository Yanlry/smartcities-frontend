// src/components/interactions/ReportDetails/TabNavigation.tsx

import React, { memo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from "react-native";
import { TABS } from "../../../types/entities/report.types";

const { width } = Dimensions.get("window");

// Constantes de style
const COLORS = {
  primary: "#8E2DE2",
  primaryDark: "#4A00E0",
  accent: "#0F3460",
  accentDark: "#005BEA",
  secondary: "#FF416C",
  secondaryDark: "#FF4B2B",
  inactiveTab: "#6C7A93",
  subtleGray: "rgba(240, 244, 255, 0.9)",
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

interface TabItemProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/**
 * Sous-composant pour un onglet individuel
 */
const TabItem = memo(({ label, isActive, onPress }: TabItemProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <Animated.View 
        style={[
          styles.tabItemContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text 
          style={[
            styles.tabText,
            isActive ? styles.activeTabText : null
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

interface TabNavigationProps {
  activeTab: number;
  indicatorPosition: Animated.Value;
  onTabChange: (index: number) => void;
}

/**
 * Composant de navigation par onglets avec animation fluide
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  indicatorPosition,
  onTabChange,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Calculer la largeur de chaque onglet
  const tabWidth = width / TABS.length;

  return (
    <Animated.View 
      style={[
        styles.tabBarContainer,
        { opacity: fadeAnim }
      ]}
    >
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => (
          <TabItem
            key={tab}
            label={tab}
            isActive={activeTab === index}
            onPress={() => onTabChange(index)}
          />
        ))}
        
        {/* Indicateur animé avec couleur */}
        <Animated.View 
          style={[
            styles.tabIndicatorContainer, 
            { 
              left: indicatorPosition,
              width: tabWidth 
            }
          ]} 
        >
          <View style={styles.tabIndicator} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    ...SHADOWS.small,
    zIndex: 90,
  },
  tabBar: {
    flexDirection: "row",
    height: 56,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 198, 251, 0.1)",
    position: "relative",
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.inactiveTab,
    textAlign: "center",
  },
  activeTabText: {
    color: COLORS.accent,
    fontWeight: "600",
  },
  tabIndicatorContainer: {
    position: "absolute",
    bottom: 0,
    height: 3,
    paddingHorizontal: "20%",
  },
  tabIndicator: {
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    width: "100%",
    backgroundColor: COLORS.accent,
  },
});

export default memo(TabNavigation);