import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({

        mainContainer: {
          flex: 1,
          backgroundColor: "#f5f5f5",
        },
        scrollContent: {
          flexGrow: 1,
        },
        container: {
          flex: 1,
          backgroundColor: "#f5f5f5",
        },
        fixedBottomContainer: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "transparent",
          // Compatibilité avec Android
          ...Platform.select({
            android: {
              elevation: 5,
            },
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
          }),
        },
      });