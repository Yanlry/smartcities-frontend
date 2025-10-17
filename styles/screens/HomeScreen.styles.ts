import { StyleSheet } from "react-native";

export default StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },
    container: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },
    scrollContent: {
      paddingTop: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5F5F5",
    },
    refreshSuccessContainer: {
      position: "absolute",
      top: 20,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1001,
    },
    refreshSuccessText: {
      backgroundColor: "rgba(76, 217, 100, 0.9)", // Vert semi-transparent
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
    },
    globalToggleButton: {
      backgroundColor: "#1B5D85",
      marginHorizontal: 10,
      marginTop: 10,
      marginBottom: 5,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    globalToggleButtonText: {
      color: "#FFF",
      fontWeight: "bold",
      fontSize: 14,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333",
    },
    modalText: {
      marginBottom: 20,
      textAlign: "center",
      color: "#555",
    },
    button: {
      backgroundColor: "#1B5D85",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: "#FFF",
      fontWeight: "bold",
    },
    footerCopyrightText: {
      textAlign: "center",
      color: "#888",
      fontSize: 12,
      marginVertical: 20,
      paddingBottom: 70,
    },
  });