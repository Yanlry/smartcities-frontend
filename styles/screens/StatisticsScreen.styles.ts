import { StyleSheet, Dimensions,StatusBar,Platform } from "react-native";

const { width } = Dimensions.get("window");

  const LAYOUT = {
    radius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      circle: 9999,
    },
    header: {
      height: Platform.OS === "ios" ? 100 : 90,
      padding: Platform.OS === "ios" ? 50 : 30,
    },
    tabBar: {
      height: 64 + (Platform.OS === "ios" ? 20 : 0),
      buttonSize: 44,
    },
    statusBar: {
      height: StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 24),
    },
    border: {
      width: 1,
      color: "rgba(0,0,0,0.08)",
    },
    shadow: {
      small: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 8,
      },
    },
  };

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8F9FA",
    },
    headerGradient: {
      paddingTop: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    },
    headerIconButton: {
      width: 38,
      height: 38,
      borderRadius: LAYOUT.radius.circle,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
    titleContainer: {
      alignItems: "center",
    },
    menuButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.5,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    profileCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    profileCardContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1B5D85",
      marginBottom: 4,
    },
    profileCity: {
      fontSize: 14,
      color: "#737373",
    },
    rankBadgeContainer: {
      marginBottom: 12,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#737373",
      marginBottom: 12,
    },
    statsCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    voteProgressContainer: {
      marginBottom: 16,
    },
    voteLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    voteLabelItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    voteDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    voteLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#737373",
    },
    progressBarContainer: {
      flexDirection: "row",
      height: 12,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: "#F5F5F5",
      marginBottom: 12,
    },
    progressBarPositive: {
      height: "100%",
    },
    progressBarNegative: {
      height: "100%",
      backgroundColor: "#F44336",
    },
    voteNumbers: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    voteNumberItem: {
      alignItems: "center",
    },
    votePercentage: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 2,
    },
    voteCount: {
      fontSize: 12,
      color: "#737373",
    },
    totalVotesContainer: {
      alignItems: "center",
      marginTop: 16,
    },
    totalVotesBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: "rgba(6, 44, 65, 0.08)",
      gap: 8,
    },
    totalVotesText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1B5D85",
    },
    activityGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    activityCard: {
      width: (width - 60) / 2,
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    activityValue: {
      fontSize: 28,
      fontWeight: "700",
      color: "#FFFFFF",
      marginTop: 12,
      marginBottom: 4,
    },
    activityLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#FFFFFF",
      textAlign: "center",
    },
    activityLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    chevronIcon: {
      marginLeft: 8,
    },
    socialRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    socialCard: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    socialCardContent: {
      alignItems: "center",
    },
    socialValue: {
      fontSize: 24,
      fontWeight: "700",
      color: "#1B5D85",
      marginTop: 12,
      marginBottom: 4,
    },
    socialLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#737373",
    },
    infoCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    infoLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#737373",
      marginLeft: 12,
      flex: 1,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: "700",
      color: "#1B5D85",
    },
    premiumText: {
      color: "#FFD700",
    },
    infoDivider: {
      height: 1,
      backgroundColor: "#E0E0E0",
    },
    actionButton: {
      marginTop: 8,
    },
    actionButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      borderRadius: 12,
      gap: 10,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8F9FA",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: "#737373",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F8F9FA",
      padding: 20,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#F44336",
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 14,
      color: "#737373",
      textAlign: "center",
    },
  });