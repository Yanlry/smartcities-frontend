import { StyleSheet, Platform,StatusBar } from "react-native";

// Définition de la palette de couleurs officielle
const COLORS = {
  primary: {
    base: "#1B5D85",
    light: "#1B5D85",
    dark: "#041E2D",
    contrast: "#FFFFFF",
  },
  secondary: {
    base: "#2A93D5",
    light: "#50B5F5",
    dark: "#1C7AB5",
    contrast: "#FFFFFF",
  },
  accent: {
    base: "#FF5A5F",
    light: "#FF7E82",
    dark: "#E04347",
    contrast: "#FFFFFF",
  },
  neutral: {
    50: "#F9FAFC",
    100: "#F0F4F8",
    200: "#E1E8EF",
    300: "#C9D5E3",
    400: "#A3B4C6",
    500: "#7D91A7",
    600: "#5C718A",
    700: "#465670",
    800: "#2E3B4E",
    900: "#1C2536",
  },
  state: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  overlay: "rgba(0,0,0,0.7)",
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
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[300],
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 40 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
    backgroundColor: COLORS.primary.base,
    
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary.contrast,
    letterSpacing: 0.5,
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
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent.base,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: COLORS.accent.contrast,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Loading and error styles
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[700],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral[50],
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.neutral[800],
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: COLORS.secondary.base,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: COLORS.secondary.contrast,
    fontWeight: "600",
    fontSize: 16,
  },

  // Main content styles
  scrollContent: {
    paddingBottom: 30,
  },
  fadeIn: {
    width: "100%",
  },

  // Profile section
  profileSection: {
    marginBottom: 16,
  },
  profileGradient: {
    borderRadius: 150,
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImageWrapper: {
    marginRight: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.neutral[300],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.neutral[50],
    textTransform: "uppercase",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.primary.contrast,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  photoButtonText: {
    fontSize: 12,
    color: COLORS.primary.contrast,
    marginLeft: 6,
    fontWeight: "500",
  },

  // Quick stats row
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickStatItem: {
    alignItems: "center",
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary.base,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: COLORS.neutral[300],
    alignSelf: "center",
  },

  // Cards container
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    padding: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[800],
    marginLeft: 10,
    flex: 1,
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  saveIconButton: {
    backgroundColor: COLORS.neutral[200],
  },
  cardContent: {
    padding: 16,
  },

  // Form fields
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.neutral[600],
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.neutral[800],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  fieldInputDisabled: {
    backgroundColor: COLORS.neutral[200],
    color: COLORS.neutral[700],
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.neutral[700],
    marginLeft: 8,
    flex: 1,
  },

  // Password fields
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.neutral[800],
  },
  eyeIcon: {
    padding: 10,
  },

  // Action buttons
  actionButton: {
    backgroundColor: COLORS.secondary.base,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  actionButtonText: {
    color: COLORS.secondary.contrast,
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },

  // Location display
  locationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  locationInfo: {
    marginLeft: 15,
  },
  locationCity: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  locationPostal: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 2,
  },

  // City edit
  cityEditContainer: {
    marginTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.neutral[800],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  searchButton: {
    backgroundColor: COLORS.secondary.base,
    width: 46,
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  cityActionButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cityActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: COLORS.secondary.base,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cityActionButtonCancel: {
    backgroundColor: COLORS.neutral[200],
  },
  cityActionButtonText: {
    color: COLORS.secondary.contrast,
    fontWeight: "600",
    fontSize: 14,
  },
  cityActionButtonTextCancel: {
    color: COLORS.neutral[700],
    fontWeight: "600",
    fontSize: 14,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "30%",
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary.base,
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral[600],
    textAlign: "center",
  },

  // Membership section
  // Styles pour la section d'adhésion
  membershipItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  membershipInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  membershipBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[800],
    marginBottom: 3,
  },
  membershipDescription: {
    fontSize: 13,
    paddingRight: 50,
    color: COLORS.neutral[600],
  },
  membershipStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  membershipActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  membershipInactive: {
    backgroundColor: "rgba(114, 114, 114, 0.15)",
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  membershipStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  membershipActiveText: {
    color: COLORS.state.success,
  },
  membershipInactiveText: {
    color: COLORS.neutral[800], // Couleur plus foncée pour une meilleure lisibilité
  },
  membershipDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 10,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.neutral[50],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "100%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },

  // Suggestion items
  suggestionsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionCity: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.neutral[800],
  },
  suggestionPostal: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },

  // User list items
  userListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  userListItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userListAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userListAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.neutral[300],
    justifyContent: "center",
    alignItems: "center",
  },
  userListAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.neutral[50],
  },
  userListInfo: {
    marginLeft: 15,
  },
  userListName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  userListDetail: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  userListDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  emptyListContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: "center",
    marginTop: 16,
  },
  unfollowButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  unfollowButtonText: {
    color: COLORS.state.error,
    fontSize: 13,
    fontWeight: "600",
  },
});
