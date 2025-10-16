import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
    safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  contentContainer: {
    paddingBottom: 100,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#062C41",
    flex: 1,
  },
  progressIndicator: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
  },
  progressBackground: {
    height: 5,
    backgroundColor: "#E0E6ED",
    borderRadius: 3,
    width: 50,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#5AC8FA",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#062C41",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#8395A7",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#062C41",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#8395A7",
    marginBottom: 16,
    lineHeight: 20,
  },
  submitContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F4F8",
  },
  submitGradient: {
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#062C41",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  submitButton: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitIcon: {
    marginLeft: 8,
  },
});
