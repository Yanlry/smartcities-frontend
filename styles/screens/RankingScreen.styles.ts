import { StyleSheet, Platform } from "react-native";

// Color palette
const COLORS = {
    primary: {
      start: "#062C41",
      end: "#0b3e5a",
    },
    text: "#FFFFFC",
    accent: "red",
  };
  
  
export default StyleSheet.create({
    safeAreaContainer: {
      flex: 1,
      backgroundColor: COLORS.primary.start,
      paddingTop: 30,
    },
    container: {
      flex: 1,
      backgroundColor: "#f5f7fa",
    },
    header: {
      width: "100%",
      elevation: 5,
    },
    headerGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    titleContainer: {
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: COLORS.text,
      letterSpacing: 1,
    },
    cityIndicator: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      marginTop: 2,
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    badge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: COLORS.accent,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    badgeText: {
      color: COLORS.text,
      fontSize: 10,
      fontWeight: "bold",
    },
    listContent: {
      paddingBottom: 20,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: 8,
    },
    sectionDivider: {
      height: 2,
      width: 60,
      backgroundColor: "#3498db",
      borderRadius: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f7fa",
    },
    loadingGradient: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: COLORS.text,
      fontWeight: "500",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: "#f5f7fa",
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#e74c3c",
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: COLORS.primary.start,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    retryButtonText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: "bold",
    },
    emptyContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 16,
      color: "#7f8c8d",
      textAlign: "center",
      marginTop: 16,
    },
    footer: {
      height: 80,
    },
  });