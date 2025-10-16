import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F5F5F5",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5F5F5",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: "#757575",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingBottom: 30,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    headerIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.9)",
      textAlign: "center",
    },
    section: {
      backgroundColor: "#FFFFFF",
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#212121",
    },
    addButton: {
      backgroundColor: "#FF9800",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    addButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 14,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#212121",
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: "#757575",
    },
    servicesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -8,
    },
    serviceCard: {
      width: "50%",
      padding: 8,
    },
    serviceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    serviceIcon: {
      fontSize: 32,
    },
    serviceActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      fontSize: 18,
      padding: 2,
    },
    serviceTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#212121",
      marginBottom: 8,
    },
    serviceDescription: {
      fontSize: 12,
      color: "#757575",
      lineHeight: 18,
    },
    infoBox: {
      flexDirection: "row",
      backgroundColor: "#FFF3E0",
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      padding: 16,
    },
    infoIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: "#E65100",
      lineHeight: 20,
    },
    actions: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginTop: 24,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: "#E0E0E0",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#424242",
    },
    saveButton: {
      flex: 1,
      backgroundColor: "#FF9800",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveButtonDisabled: {
      backgroundColor: "#FFCC80",
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 500,
      maxHeight: "80%",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#212121",
      marginBottom: 20,
    },
    modalInputGroup: {
      marginBottom: 16,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#424242",
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: "#F9FAFB",
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: "#212121",
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
    modalTextArea: {
      minHeight: 120,
      textAlignVertical: "top",
    },
    iconScroll: {
      marginTop: 8,
    },
    iconButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#F9FAFB",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      borderWidth: 2,
      borderColor: "#E5E7EB",
    },
    iconButtonActive: {
      backgroundColor: "#FFF3E0",
      borderColor: "#FF9800",
    },
    iconButtonText: {
      fontSize: 24,
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    modalCancelButton: {
      flex: 1,
      backgroundColor: "#E0E0E0",
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    modalCancelText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#424242",
    },
    modalSaveButton: {
      flex: 1,
      backgroundColor: "#FF9800",
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    modalSaveText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
  });