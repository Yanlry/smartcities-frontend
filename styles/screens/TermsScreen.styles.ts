// Chemin : frontend/styles/screens/TermsScreen.styles.ts

import { StyleSheet, Platform } from "react-native";

/**
 * Palette de couleurs ultra-moderne pour Smartcities
 * Design cohérent avec le reste de l'application
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
};

/**
 * Styles pour l'écran des Conditions Générales d'Utilisation
 * Design premium avec animations, dégradés et effets visuels
 */
export default StyleSheet.create({
  container: {
    flex: 1,
  },

  // ===== HEADER - IDENTIQUE AUX AUTRES ÉCRANS =====
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

  // Hero Section avec date de mise à jour
  heroSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#E0E7FF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  heroGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  legalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  legalBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E40AF",
    marginLeft: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 26,
    marginBottom: 16,
  },
  effectiveDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  effectiveDateLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 8,
  },
  effectiveDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 6,
  },

  // Card d'avertissement important
  importantNotice: {
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  importantNoticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  importantNoticeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginLeft: 10,
  },
  importantNoticeText: {
    fontSize: 14,
    color: "#78350F",
    lineHeight: 22,
  },

  // Sections de contenu
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconWrapper: {
    marginRight: 16,
  },
  sectionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  sectionContent: {
    marginTop: 4,
  },
  paragraph: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 25,
    marginBottom: 14,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 14,
    marginBottom: 10,
  },

  // Liste avec puces personnalisées
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#64748B",
    marginRight: 14,
    marginTop: 9,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: "#475569",
    lineHeight: 25,
  },

  // Box de mise en avant (vert pour points positifs)
  highlightBox: {
    backgroundColor: "#ECFDF5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 14,
    color: "#065F46",
    lineHeight: 23,
    fontWeight: "500",
  },

  // Box d'avertissement (rouge pour restrictions)
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 23,
    fontWeight: "500",
  },

  // Box d'information (bleu pour infos)
  infoBox: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 23,
    fontWeight: "500",
  },

  // Numérotation stylisée
  numberedItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  numberText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4F46E5",
  },
  numberedText: {
    flex: 1,
    fontSize: 15,
    color: "#475569",
    lineHeight: 25,
  },

  // Section Acceptation avec checkbox visuel
  acceptanceSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#D1FAE5",
  },
  acceptanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  acceptanceTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  acceptanceText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 25,
    marginBottom: 16,
  },
  acceptanceButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  acceptanceButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  acceptanceButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  // Section Contact CTA
  contactSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 26,
    marginTop: 8,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#8E2DE2",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 7,
  },
  contactIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  contactSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 24,
  },
  contactButton: {
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#8E2DE2",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  contactButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginLeft: 10,
    letterSpacing: 0.3,
  },

  // Footer légal
  legalFooter: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 22,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  legalFooterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 14,
  },
  legalFooterText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 8,
  },
  legalLink: {
    color: "#1B5D85",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // Divider décoratif
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },

  // Tag pour marquer les articles importants
  importantTag: {
    backgroundColor: "#FEF3C7",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 4,
  },
  importantTagText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400E",
    letterSpacing: 0.5,
  },
});