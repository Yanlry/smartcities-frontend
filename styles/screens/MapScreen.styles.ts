import { StyleSheet, Platform } from "react-native";
// CIF Color Palette avec typage correct
// Type pour les gradients (tuple en lecture seule)
type GradientTuple = readonly [string, string, ...string[]];

const COLORS = {
    primary: "#062C41",
    primaryLight: "#0A4D73",
    primaryGradient: ["#062C41", "#0A4D73"] as GradientTuple,
    secondary: "#E43737",
    secondaryLight: "#FF5252",
    secondaryGradient: ["#E43737", "#FF5252"] as GradientTuple,
    accent: "#A1D9F7",
    accentGradient: ["#A1D9F7", "#70C1F2"] as GradientTuple,
    background: "#F8F9FA",
    card: "#FFFFFF",
    cardShadow: "rgba(6, 44, 65, 0.1)",
    text: {
      primary: "#333333",
      secondary: "#666666",
      light: "#999999",
      inverse: "#FFFFFF",
    },
    marker: {
      shadow: "rgba(0, 0, 0, 0.2)",
      background: "#FFFFFF",
    },
  };
  
export default StyleSheet.create({
    // Main container styles
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  
    // Loading and error styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingGradient: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: COLORS.text.inverse,
      marginTop: 16,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorGradient: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    errorTitle: {
      color: COLORS.text.inverse,
      fontSize: 20,
      fontWeight: "bold",
      marginTop: 16,
    },
    errorText: {
      color: COLORS.text.inverse,
      fontSize: 16,
      marginTop: 8,
      textAlign: "center",
      paddingHorizontal: 32,
    },
  
    // Map marker styles
    markerContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    markerIconShadow: {
      shadowColor: COLORS.marker.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
      backgroundColor: "transparent",
      borderRadius: 20,
    },
    markerGradient: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      padding: 5,
    },
    markerIcon: {
      width: 24,
      height: 24,
      tintColor: COLORS.text.inverse,
    },
    userMarkerContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    userMarkerRing: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(6, 44, 65, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    userMarkerDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: COLORS.primary,
      borderWidth: 2,
      borderColor: COLORS.text.inverse,
    },
  
    // Styles améliorés pour la section de filtres
    filtersContainer: {
      position: "absolute",
      top: 110,
      left: 10,
      right: 10,
      backgroundColor: COLORS.card,
      borderRadius: 12,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        android: {
          elevation: 5,
        },
      }),
      zIndex: 10,
    },
    filtersHeaderGradient: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    filtersHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    filtersTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.text.primary,
    },
    filtersTitleActive: {
      fontSize: 15,
      fontWeight: "500",
      color: COLORS.text.inverse,
      opacity: 0.9,
    },
    activeFilterLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    activeFilterName: {
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.text.inverse,
      marginLeft: 6,
    },
    expandButton: {
      padding: 4,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    chipScrollContainer: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    filterChip: {
      marginHorizontal: 4,
      borderRadius: 20,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    activeFilterChip: {
      // Styles appliqués via la LinearGradient
    },
    chipGradient: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
    },
    chipText: {
      fontSize: 13,
      color: COLORS.text.primary,
      marginLeft: 6,
      fontWeight: "500",
    },
    activeChipText: {
      color: COLORS.text.inverse,
    },
    closeIconContainer: {
      marginLeft: 4,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    moreFiltersIndicator: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 8,
    },
    expandedFiltersContainer: {
      paddingBottom: 4,
    },
    categoryRow: {
      marginTop: 0,
    },
  
    floatingButtonContainer: {
      position: "absolute",
      bottom: 80,
      right: 20,
      alignItems: "center",
      zIndex: 10,
    },
    
    floatingButtonView: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginBottom: 16,
      transform: [{ translateX: 12 }], // 🔹 poussé un peu plus à droite
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    
    floatingButtonSearch: {
      width: 56,
      height: 56,
      marginBottom: 20,
      borderRadius: 28,
      transform: [{ translateX: 12 }], // 🔹 même décalage pour alignement
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    
    floatingButtonGradient: {
      width: 50,
      height: 50,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
    },
    
    // Preview panel styles
    previewContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.card,
      padding: 20,
      paddingBottom: 110,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 20,
        },
      }),
      zIndex: 100,
    },
    closeIcon: {
      alignSelf: "center",
      marginBottom: 12,
    },
    closeIconBar: {
      width: 40,
      height: 4,
      backgroundColor: "rgba(0, 0, 0, 0.2)",
      borderRadius: 10,
    },
    previewHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    previewIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    previewIcon: {
      width: 28,
      height: 28,
      tintColor: COLORS.text.inverse,
    },
    previewTitleContainer: {
      flex: 1,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.text.primary,
      marginBottom: 4,
    },
    previewType: {
      fontSize: 14,
      color: COLORS.text.secondary,
    },
    previewImageContainer: {
      marginBottom: 16,
      borderRadius: 12,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    previewPhotoPlaceholder: {
      width: "100%",
      height: 150,
      backgroundColor: "rgba(161, 217, 247, 0.1)",
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    previewPhotoText: {
      marginTop: 8,
      color: COLORS.text.secondary,
      fontSize: 14,
    },
    previewImageLarge: {
      width: "100%",
      height: 150,
      borderRadius: 12,
      marginBottom: 16,
    },
    previewInfoContainer: {
      flexDirection: "row",
      marginBottom: 16,
      flexWrap: "wrap",
    },
    previewInfoBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(161, 217, 247, 0.2)",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    },
    previewInfoText: {
      fontSize: 14,
      color: COLORS.text.primary,
      marginLeft: 6,
    },
    previewDescriptionContainer: {
      marginBottom: 20,
      backgroundColor: COLORS.background,
      padding: 12,
      borderRadius: 8,
    },
    previewDescription: {
      fontSize: 14,
      color: COLORS.text.primary,
      lineHeight: 20,
    },
    detailsButton: {
      borderRadius: 25,
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: COLORS.cardShadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    detailsButtonGradient: {
      paddingVertical: 14,
      borderRadius: 25,
      alignItems: "center",
    },
    detailsButtonText: {
      color: COLORS.text.inverse,
      fontSize: 16,
      fontWeight: "600",
    },
  });