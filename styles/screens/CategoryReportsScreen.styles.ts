import { StyleSheet, Easing, Dimensions, Platform} from "react-native";

// ============================================================================
// THEME SYSTEM & DESIGN TOKENS
// ============================================================================

/**
 * Design system colors with semantic naming
 */
const COLORS = {
  // Primary palette
  primary: {
    50: "#F0F7FF",
    100: "#E0F0FF",
    200: "#BAD9FF",
    300: "#94C2FF",
    400: "#6FA9FF",
    500: "#3B82F6", // Main primary
    600: "#2563EB", // Dark primary
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  // Secondary palette
  secondary: {
    50: "#EEF9FF",
    100: "#DEF3FF",
    200: "#B2E8FF",
    300: "#78DDFF",
    400: "#38CFFF",
    500: "#06B6D4", // Main secondary
    600: "#0891B2", // Dark secondary
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },
  // Accent colors
  accent: {
    purple: {
      50: "#FAF5FF",
      300: "#D8B4FE",
      500: "#A855F7",
      700: "#7E22CE",
      900: "#581C87",
    },
    rose: {
      50: "#FFF1F2",
      300: "#FDA4AF",
      500: "#F43F5E",
      700: "#BE123C",
      900: "#881337",
    },
    amber: {
      50: "#FFFBEB",
      300: "#FCD34D",
      500: "#F59E0B",
      700: "#B45309",
      900: "#78350F",
    },
  },
  // Grayscale
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A",
  },
  // Functional colors
  success: {
    50: "#ECFDF5",
    300: "#6EE7B7",
    500: "#10B981",
    700: "#047857",
    900: "#064E3B",
  },
  warning: {
    50: "#FFFBEB",
    300: "#FCD34D",
    500: "#F59E0B",
    700: "#B45309",
    900: "#78350F",
  },
  error: {
    50: "#FEF2F2",
    300: "#FCA5A5",
    500: "#EF4444",
    700: "#B91C1C",
    900: "#7F1D1D",
  },
  info: {
    50: "#EFF6FF",
    300: "#93C5FD",
    500: "#3B82F6",
    700: "#1D4ED8",
    900: "#1E3A8A",
  },
  // Base colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

/**
 * Shadows for different elevation levels with platform-specific implementations
 */
const SHADOWS = {
  none: Platform.select({
    ios: {},
    android: {},
    default: {},
  }),
  xs: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  "2xl": Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
};

/**
 * Border radiuses for consistent UI elements
 */
const RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

/**
 * Spacing system for consistent layout
 */
const SPACING = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
};

/**
 * Typography system with consistent font sizes and weights
 */
const TYPOGRAPHY = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },
  weight: {
    thin: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
    black: "900" as const,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};



export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    width: "100%",
    ...SHADOWS.md,
    zIndex: 10,
  },
  categoryBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 55 : 45,
    paddingBottom: SPACING[6],
    paddingHorizontal: SPACING[4],
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: SPACING[4],
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING[3],
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.white,
    marginBottom: SPACING[0.5],
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  filtersContainer: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING[3],
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  searchIcon: {
    marginRight: SPACING[2],
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.neutral[800],
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING[1],
  }, // Toggle search bar visibility
  filtersScroll: {
    paddingRight: SPACING[4],
  },
  filterPill: {
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    marginRight: SPACING[2],
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[200],
    ...SHADOWS.xs,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.neutral[600],
  },
  filterPillTextActive: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.primary[700],
  },
  listContainer: {
    padding: SPACING[4],
    paddingBottom: SPACING[20], // Extra padding at bottom for scroll
  },
  reportCardContainer: {
    marginBottom: SPACING[4],
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  reportImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  reportImage: {
    width: "100%",
    height: "100%",
  },
  reportImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.neutral[400],
    marginTop: SPACING[1],
  },
  photoBadgeContainer: {
    position: "absolute",
    bottom: SPACING[2],
    right: SPACING[2],
  },
  photoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary[50],
    borderRadius: RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 4,
    gap: 2,
  },
  photoBadgeText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.secondary[700],
  },
  reportContent: {
    padding: SPACING[4],
  },
  reportTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.neutral[800],
    marginBottom: SPACING[1],
  },
  reportDescription: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.neutral[600],
    marginBottom: SPACING[4],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.md,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 3,
  },
  locationText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.neutral[700],
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.error[50],
    borderRadius: RADIUS.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 3,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.error[700],
  },
  emptyStateContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[6],
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.neutral[800],
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.neutral[500],
    textAlign: "center",
    marginBottom: SPACING[6],
  },
  emptyStateButton: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[6],
    backgroundColor: COLORS.primary[500],
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  emptyStateButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.white,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  loadingHeaderContainer: {
    paddingTop: Platform.OS === "ios" ? 55 : 45,
    paddingBottom: SPACING[6],
    paddingHorizontal: SPACING[4],
    ...SHADOWS.md,
  },
  loadingHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingCenterContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[4],
  },
  loadingContent: {
    flex: 1,
    paddingTop: SPACING[4],
  },
  filtersBarLoading: {
    flexDirection: "row",
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  loadingCardsContainer: {
    padding: SPACING[4],
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[4],
    padding: SPACING[4],
    ...SHADOWS.md,
  },
  loadingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
