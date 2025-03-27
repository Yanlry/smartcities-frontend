// src/components/interactions/ReportDetails/TabNavigation.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { TABS } from "../../../types/report.types";

const { width } = Dimensions.get("window");

interface TabNavigationProps {
  activeTab: number;
  indicatorPosition: Animated.Value;
  onTabChange: (index: number) => void;
}

/**
 * Composant de navigation par onglets avec animation
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  indicatorPosition,
  onTabChange,
}) => {
  return (
    <View style={styles.tabBarContainer}>
      {TABS.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            activeTab === index && styles.activeTabButton
          ]}
          onPress={() => onTabChange(index)}
        >
          <Text 
            style={[
              styles.tabText,
              activeTab === index && styles.activeTabText
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
      <Animated.View 
        style={[
          styles.tabIndicator, 
          { 
            left: indicatorPosition,
            width: width / TABS.length 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#2196F3",
  },
});

export default memo(TabNavigation);