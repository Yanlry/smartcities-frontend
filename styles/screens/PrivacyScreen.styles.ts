import { StyleSheet, Platform } from "react-native";

const COLORS = {
    primary: "#062C41",
    secondary: "#1B5D85",
    background: "#F8F9FA",
    card: "#FFFFFF",
    border: "#E0E0E0",
    danger: "#E11D48",
    text: {
      primary: "#1E293B",
      secondary: "#475569",
      light: "#FFFFFF",
    },
  };

export default StyleSheet.create({
    container: {
      flex: 1,
    },
    scroll: {
      paddingHorizontal: 20,
    },
    header: {
      backgroundColor: COLORS.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: Platform.OS === "ios" ? 55 : 45,
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.text.light,
      letterSpacing: 1,
    },
    headerIcon: {
      width: 42,
      height: 42,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 21,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    badge: {
      position: "absolute",
      top: -6,
      right: -6,
      backgroundColor: COLORS.danger,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
    },
    contentCard: {
      backgroundColor: COLORS.card,
      borderRadius: 14,
      marginTop: 24,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: COLORS.text.primary,
      marginTop: 18,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 15,
      color: COLORS.text.secondary,
      lineHeight: 22,
    },
    listItem: {
      fontSize: 15,
      color: COLORS.text.secondary,
      lineHeight: 22,
      marginLeft: 8,
    },
    link: {
      color: COLORS.secondary,
      fontWeight: "600",
    },
  });