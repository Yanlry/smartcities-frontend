import { StyleSheet, Platform} from "react-native";

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

export default StyleSheet.create({
     container: {
        flex: 1,
      },
      // Header styles - modernisés
      header: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: Platform.OS === "ios" ? 55 : 45,
        paddingBottom: 20,
        paddingHorizontal: 20,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      },
      headerIcon: {
        width: 42,
        height: 42,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 21,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
      },
      headerTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: COLORS.text.light,
        letterSpacing: 1,
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
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "bold",
      },
    });
    
    