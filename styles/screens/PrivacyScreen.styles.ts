// Chemin : frontend/styles/screens/PrivacyScreen.styles.ts

import { StyleSheet, Platform } from "react-native";

/**
 * Palette de couleurs cohérente avec l'application Smartcities
 */
const COLORS = {
  primary: "#1B5D85",
  secondary: "#1B5D85",
  danger: "#f44336",
  success: "#4CAF50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E0E0E0",
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#FFFFFF",
    muted: "#999999",
  },
  // Dégradés pour les sections
  gradients: {
    purple: ["#8E2DE2", "#4A00E0"] as const,
    blue: ["#00C6FB", "#005BEA"] as const,
    green: ["#11998e", "#38ef7d"] as const,
    orange: ["#FF416C", "#FF4B2B"] as const,
  },
};

/**
 * Styles pour l'écran de politique de confidentialité
 * Design moderne et professionnel avec hiérarchie visuelle claire
 */
export default StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // ===== HEADER - IDENTIQUE À HELPSCREEN =====
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 45 : 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.danger,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },

  // ===== CONTENU PRINCIPAL =====
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Introduction avec badge RGPD
  introContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rgpdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  rgpdBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6366F1",
    marginLeft: 8,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  introText: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
  },
  lastUpdateText: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 12,
    fontStyle: "italic",
  },

  // Sections de contenu
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    letterSpacing: -0.3,
  },
  sectionContent: {
    marginLeft: 0,
  },
  paragraph: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#94A3B8",
    marginRight: 12,
    marginTop: 9,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
  },
  highlightBox: {
    backgroundColor: "#F0FDF4",
    borderLeftWidth: 3,
    borderLeftColor: "#22C55E",
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  highlightText: {
    fontSize: 14,
    color: "#166534",
    lineHeight: 22,
    fontWeight: "500",
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 22,
    fontWeight: "500",
  },

  // Section Contact & CTA
  contactSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#8E2DE2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  contactSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  contactButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#8E2DE2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },

  // Footer légal
  legalFooter: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  legalTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
  },
  legalText: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 8,
  },
  legalLink: {
    color: "#1B5D85",
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  // Tag/Badge pour les points importants
  importantTag: {
    backgroundColor: "#FEF3C7",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  importantTagText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
});