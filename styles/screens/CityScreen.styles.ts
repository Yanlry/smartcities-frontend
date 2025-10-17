import { StyleSheet, Platform, StatusBar } from "react-native";

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
      headerNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1B5D85",
        paddingVertical: 10,
        paddingHorizontal: 20,
        paddingTop: 45,
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
      headerTitleNav: {
        fontSize: 20,
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        color: "#FFFFFC",
        letterSpacing: 2,
        fontWeight: "bold",
        fontFamily: "Insanibc",
      },
      typeBadgeNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      badge: {
        position: "absolute",
        top: -7,
        right: 2,
        backgroundColor: "red",
        borderRadius: 10,
        width: 15,
        height: 15,
        justifyContent: "center",
        alignItems: "center",
      },
      badgeText: {
        color: "white",
        fontSize: 12,
        fontWeight: "bold",
      },
      title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        justifyContent: "center",
        marginTop: 20,
      },
    });