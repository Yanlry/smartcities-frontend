import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
      },
      headerNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#062C41",
        paddingVertical: 10,
        paddingHorizontal: 20,
        paddingTop: 45,
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