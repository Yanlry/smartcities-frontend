// Chemin: frontend/components/home/ProfileSection/MunicipalityBadge.tsx

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // ✅ AJOUT DE L'IMPORT
import { formatCityForDisplay } from "../../../utils/formatters";

// Activer LayoutAnimation pour Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Interface pour les props du MunicipalityBadge
 */
interface MunicipalityBadgeProps {
  /** Nom de la mairie/commune */
  municipalityName?: string | null;
  /** Nom de la commune */
  cityName?: string | null;
  /** Nombre total de signalements gérés */
  totalReportsHandled?: number;
  /** Nombre de signalements actifs */
  activeReports?: number;
  /** Statut de vérification du compte */
  isVerified?: boolean;
  /** Fonction pour afficher plus de détails (optionnel) */
  onShowDetails?: () => void;
}

/**
 * MunicipalityBadge - Badge spécial pour les comptes de mairies
 * Design officiel et professionnel avec couleurs institutionnelles
 * 
 * ✅ CORRECTION : Ajout de useNavigation pour pouvoir naviguer vers CityScreen
 */
const MunicipalityBadge: React.FC<MunicipalityBadgeProps> = memo(
  ({
    municipalityName,
    cityName,
    totalReportsHandled = 0,
    activeReports = 0,
    isVerified = true,
    onShowDetails,
  }) => {
    // ✅ AJOUT : Hook de navigation pour pouvoir naviguer entre les écrans
    const navigation = useNavigation();
    
    // États locaux
    const [expanded, setExpanded] = useState<boolean>(false);

    // Animations
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Formatage du nom de ville
    const formattedCityName = cityName ? formatCityForDisplay(cityName) : municipalityName || "Mairie";
    const displayName = municipalityName || `Mairie de ${formattedCityName}`;

    /**
     * Animation d'entrée au montage
     */
    useEffect(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Animation de pulsation du badge vérifié
      if (isVerified) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }

      // Animation de brillance (shimmer)
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, [isVerified]);

    /**
     * Gestion de l'expansion
     */
    const toggleExpand = useCallback(() => {
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: "easeInEaseOut",
          property: "scaleXY",
        },
      });

      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: 300,
        easing: Easing.cubic,
        useNativeDriver: true,
      }).start();

      setExpanded(!expanded);
    }, [expanded, rotateAnim]);

    /**
     * ✅ AJOUT : Fonction pour naviguer vers l'écran de la ville
     * Utilise soit la fonction onShowDetails fournie, soit navigue vers CityScreen
     */
    const handleShowDetails = useCallback(() => {
      if (onShowDetails) {
        // Si une fonction personnalisée est fournie, on l'utilise
        onShowDetails();
      } else {
        // Sinon, on navigue vers CityScreen
        navigation.navigate('CityScreen' as never);
      }
    }, [onShowDetails, navigation]);

    // Animation de rotation de la flèche
    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // Animation de shimmer (brillance qui traverse)
    const shimmerTranslate = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-300, 300],
    });

    return (
      <Animated.View
        style={[styles.container, { transform: [{ scale: bounceAnim }] }]}
      >
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={toggleExpand}
          activeOpacity={0.85}
        >
          {/* Gradient de fond officiel */}
          <LinearGradient
            colors={["#1e3a8a", "#1e40af", "#2563eb"]} // Bleu institutionnel
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Effet de brillance animé */}
            <Animated.View
              style={[
                styles.shimmerOverlay,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  "transparent",
                  "rgba(255, 255, 255, 0.1)",
                  "rgba(255, 255, 255, 0.3)",
                  "rgba(255, 255, 255, 0.1)",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>

            {/* Header du badge */}
            <View style={styles.header}>
              <View style={styles.mainInfoContainer}>
                {/* Icône de la mairie avec animation */}
                <Animated.View
                  style={[
                    styles.iconContainer,
                    isVerified && { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="city"
                    size={32}
                    color="#FFFFFF"
                  />
                  {/* Badge de vérification */}
                  {isVerified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={18}
                        color="#10B981"
                      />
                    </View>
                  )}
                </Animated.View>

                {/* Informations textuelles */}
                <View style={styles.textContainer}>
                  <Text style={styles.statusLabel}>COMPTE OFFICIEL</Text>
                  <Text style={styles.municipalityName} numberOfLines={1}>
                    {displayName}
                  </Text>
                </View>
              </View>

              {/* Bouton d'expansion */}
              <Animated.View
                style={[
                  styles.expandButton,
                  { transform: [{ rotate: arrowRotation }] },
                ]}
              >
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={28}
                  color="#FFFFFF"
                />
              </Animated.View>
            </View>

            {/* Contenu développé */}
            {expanded && (
              <View style={styles.expandedContent}>
                {/* Badge de statut vérifié */}
                {isVerified && (
                  <View style={styles.verifiedSection}>
                    <View style={styles.verifiedBanner}>
                      <MaterialCommunityIcons
                        name="shield-check"
                        size={20}
                        color="#10B981"
                      />
                      <Text style={styles.verifiedText}>
                        Compte vérifié par Smartcities
                      </Text>
                    </View>
                  </View>
                )}

                {/* ✅ CORRECTION : Utilisation de handleShowDetails au lieu de navigation direct */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShowDetails}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    <MaterialCommunityIcons
                      name="information"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionButtonText}>
                      Voir les informations de la mairie
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

/**
 * Styles du MunicipalityBadge
 */
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardContainer: {
    padding: 5,
    borderRadius: 56,
    overflow: "hidden",
  },
  gradientBackground: {
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  // Effet de brillance
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 300,
    zIndex: 1,
  },
  shimmerGradient: {
    width: "100%",
    height: "100%",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    zIndex: 2,
  },
  mainInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    position: "relative",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  statusLabel: {
    color: "#FCD34D",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  municipalityName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  expandButton: {
    marginLeft: 10,
  },
  // Contenu développé
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 2,
  },
  statsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  statsTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 14,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 10,
  },
  // Section vérifiée
  verifiedSection: {
    marginBottom: 12,
  },
  verifiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  verifiedText: {
    color: "#D1FAE5",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Bouton d'action
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
});

export default MunicipalityBadge;