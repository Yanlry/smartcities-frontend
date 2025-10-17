import { StyleSheet, Platform, StatusBar, Dimensions} from "react-native";

const { width } = Dimensions.get("window");
// Layout constants
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

// Enhanced color system with semantic naming
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

// Consistent spacing system - following 8pt grid
const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography scale
const FONT = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    heading: 24,
    title: 28,
  },
  family: {
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    brand: "Insanibc",
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};

export default StyleSheet.create({
  // ===== SPLASH & LOADING SCREENS =====
  initialLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenLogo: {
    ...StyleSheet.absoluteFillObject, // prend tout l’écran
    width: undefined,
    height: undefined,
  },
  loader: {
    position: "absolute",
    bottom: 180, // ajuste selon la hauteur que tu veux
  },
  // ===== HEADER =====
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    ...LAYOUT.shadow.medium,
  },
  headerGradient: {
    borderBottomLeftRadius: LAYOUT.radius.xl,
    borderBottomRightRadius: LAYOUT.radius.xl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: LAYOUT.header.padding,
    paddingHorizontal: SPACE.md,
    paddingBottom: SPACE.md,
    height: LAYOUT.header.height,
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
  headerTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleGradient: {
    padding: 8,
    borderRadius: 10,
  },
  headerLogo: {
    width: 180, // ajuste selon la taille du header
    height: 80,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: FONT.size.lg,
    color: COLORS.primary.contrast,
    letterSpacing: 2,
    fontWeight: FONT.weight.bold as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
    fontFamily: FONT.family.brand,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent.base,
    borderRadius: LAYOUT.radius.circle,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.primary.base,
    zIndex: 2,
  },
  badgeText: {
    color: COLORS.accent.contrast,
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold as
      | "bold"
      | "400"
      | "500"
      | "600"
      | "700"
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 300
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
  },
  notificationRipple: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: LAYOUT.radius.circle,
    backgroundColor: COLORS.accent.base,
    zIndex: 1,
  },

  // ===== TAB BAR =====
  tabBarWrapper: {
    position: "absolute",
    bottom: -17,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? SPACE.md : SPACE.xs,
  },
  tabBarGradient: {
    flexDirection: "row",

    ...LAYOUT.shadow.large,
    overflow: "hidden",
  },
  tabBarContainer: {
    flexDirection: "row",
    height: LAYOUT.tabBar.height,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACE.sm,
    width: "100%",
  },
  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabButtonContent: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  addButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACE.md,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: LAYOUT.radius.circle,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.primary.base,
    ...LAYOUT.shadow.small,
  },
  tabLabel: {
    color: COLORS.primary.contrast,
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
    marginTop: 4,
    opacity: 0.9,
  },
  tabIndicator: {
    position: "absolute",
    top: 8,
    width: width / 5,
    height: LAYOUT.tabBar.height - 16,

    borderRadius: LAYOUT.radius.lg,
  },

  // ===== ACTION SHEET =====
  actionSheetTitle: {
    color: COLORS.primary.base,
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.semibold as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
    textAlign: "center",
    paddingVertical: SPACE.md,
  },
  actionSheetSeparator: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  actionSheetButtonText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
  },

  // ===== LOADERS & ERRORS =====
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral[50],
  },
  loaderCard: {
    width: width * 0.7,
    height: 130,
    borderRadius: LAYOUT.radius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...LAYOUT.shadow.medium,
  },
  loaderText: {
    color: COLORS.primary.contrast,
    marginTop: SPACE.md,
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral[50],
    padding: SPACE.xl,
  },
  errorCard: {
    backgroundColor: COLORS.neutral[100],
    width: "100%",
    maxWidth: 350,
    borderRadius: LAYOUT.radius.lg,
    padding: SPACE.xl,
    alignItems: "center",
    ...LAYOUT.shadow.medium,
  },
  errorTitle: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
    color: COLORS.neutral[800],
    marginTop: SPACE.md,
    marginBottom: SPACE.xs,
  },
  errorText: {
    fontSize: FONT.size.md,
    color: COLORS.neutral[600],
    textAlign: "center",
    marginBottom: SPACE.xl,
    lineHeight: 22,
  },
  errorButton: {
    backgroundColor: COLORS.primary.base,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.xl,
    borderRadius: LAYOUT.radius.md,
    ...LAYOUT.shadow.small,
  },
  errorButtonText: {
    color: COLORS.primary.contrast,
    fontWeight: FONT.weight.semibold as
      | "400"
      | "500"
      | "600"
      | "700"
      | "bold"
      | 300
      | "normal"
      | "100"
      | "200"
      | "300"
      | "800"
      | "900"
      | 100
      | 200
      | 400
      | 500
      | 600
      | 700
      | 800
      | 900
      | "ultralight"
      | "thin"
      | "light"
      | "medium"
      | undefined,
    fontSize: FONT.size.md,
  },
});