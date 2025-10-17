import { StyleSheet, Platform, StatusBar } from "react-native";

// Color palette
const COLORS = {
    primary: {
      start: "#1B5D85",
      end: "#0b3e5a",
    },
    text: "#FFFFFC",
    accent: "red",
  };
  
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
      fontSize: 18,
      fontWeight: "700",
      color: "#FFFFFF",
      letterSpacing: 0.5,
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
    // 🏛️ BLOC MAIRIE - Style minimaliste cohérent avec RankingHeader
municipalityContainer: {
  margin: 16,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 4,
},
municipalityHeader: {
  alignItems: 'center',
  marginBottom: 20,
},
municipalityIconCircle: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#EFFCF6',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
  borderWidth: 2,
  borderColor: '#BBF3E0',
},
municipalityTitle: {
  fontSize: 11,
  fontWeight: '600',
  color: '#737373',
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 4,
},
citizenCountBox: {
  backgroundColor: '#FAFAFA',
  borderRadius: 8,
  padding: 16,
  alignItems: 'center',
  marginTop: 8,
  borderWidth: 1,
  borderColor: '#E5E5E5',
},
citizenCountRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
},
citizenCountNumber: {
  fontSize: 48,
  fontWeight: '900',
  color: '#1B5D85',
},
citizenCountLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: '#525252',
  marginLeft: 8,
},
municipalitySubtitle: {
  fontSize: 13,
  fontWeight: '500',
  color: '#737373',
  textAlign: 'center',
  marginTop: 8,
},
  });