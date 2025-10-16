import React, {useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/common/Sidebar";
import { useUserProfile } from "../hooks/user/useUserProfile";
import styles from "../styles/TermsScreen.styles";

const COLORS = {
    primary: "#062C41",
    secondary: "#1B5D85",
    danger: "#f44336",
    success: "#4CAF50",
    background: "#F8F9FA",
    card: "#FFFFFF",
    border: "#E0E0E0",
    text: {
      primary: "#333333",
      secondary: "#666666",
      light: "#FFFFFF",
      muted: "#999999",
    },
  };
  
const TermsScreen: React.FC = () => {
  const { unreadCount } = useNotification();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dummyFn = () => {};

  // Gestion du sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <LinearGradient colors={["#F6F8FB", "#EEF2F7"]} style={styles.container}>
      {/* Header modernisé */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <Ionicons name="menu-outline" size={26} color={COLORS.text.light} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CONDITIONS</Text>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate("NotificationsScreen")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <View>
            <Ionicons
              name="notifications-outline"
              size={26}
              color={COLORS.text.light}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={updateProfileImage}
      />
    </LinearGradient>
  );
};


export default TermsScreen;