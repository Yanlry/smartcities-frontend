// Chemin: components/home/RankBadge.tsx

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BadgeStyle } from "./user.types";
import CircularProgress from "./CircularProgress";

// Activer LayoutAnimation pour Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Interface pour les propriétés du composant RankBadge
 */
interface RankBadgeProps {
  /** Classement actuel de l'utilisateur */
  ranking: number | null;
  /** Suffixe à afficher après le classement (e.g., "er", "ème") */
  rankingSuffix: string;
  /** Nombre total d'utilisateurs dans le classement */
  totalUsers: number | null;
  /** Fonction appelée pour naviguer vers l'écran de classement */
  onNavigateToRanking: () => void;
  /** Style du badge utilisateur (optionnel) */
  badgeStyle?: BadgeStyle;
  /** Fonction appelée pour afficher la modal du badge (optionnel) */
  onShowBadgeModal?: () => void;
  /** Contrôle l'affichage de la section des statistiques détaillées (optionnel) */
  showStatsSection?: boolean;
}

/**
 * Constantes CIF pour les animations et transitions
 */
const CIF = {
  TRANSITION_DURATION: 300,
  EASING: Easing.cubic,
  SHADOW_COLOR: "rgba(0, 0, 0, 0.2)",
  HEADER_Z_INDEX: 2,
  CONTENT_Z_INDEX: 1,
  GRADIENT_OPACITY: {
    HIGH: 0.9,
    MEDIUM: 0.7,
    LOW: 0.5,
  },
};

/**
 * RankBadge - Design entièrement repensé avec indicateur circulaire précis
 * Implémente les standards CIF pour une interface cohérente et optimisée
 */
const RankBadge: React.FC<RankBadgeProps> = memo(
  ({
    ranking,
    rankingSuffix,
    totalUsers,
    onNavigateToRanking,
    badgeStyle,
    onShowBadgeModal,
    showStatsSection = true,
  }) => {
    // États locaux
    const [expanded, setExpanded] = useState<boolean>(false);

    // Animations
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const headerShadowAnim = useRef(new Animated.Value(0)).current;
    const decorAnim = useRef(new Animated.Value(0)).current;

    // Calcul memoïzé du percentile pour optimiser les performances
    const percentile = useCallback(() => {
      if (!ranking || !totalUsers) return 0;
      return ((totalUsers - ranking + 1) / totalUsers) * 100;
    }, [ranking, totalUsers]);

    // Animation d'entrée avec timing CIF standard
    useEffect(() => {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, []);

    // Gestion de l'expansion avec animation CIF standard
    const toggleExpand = useCallback(() => {
      // Animation layout standardisée CIF
      LayoutAnimation.configureNext({
        duration: CIF.TRANSITION_DURATION,
        update: {
          type: "easeInEaseOut",
          property: "scaleXY",
        },
      });

      // Animation de rotation de la flèche
      Animated.timing(rotateAnim, {
        toValue: expanded ? 0 : 1,
        duration: CIF.TRANSITION_DURATION,
        easing: CIF.EASING,
        useNativeDriver: true,
      }).start();

      // Animation d'ombre du header
      Animated.timing(headerShadowAnim, {
        toValue: expanded ? 0 : 1,
        duration: CIF.TRANSITION_DURATION,
        easing: CIF.EASING,
        useNativeDriver: false, // Les shadows ne peuvent pas utiliser le native driver
      }).start();

      // Animation des décorations
      Animated.timing(decorAnim, {
        toValue: expanded ? 0 : 1,
        duration: CIF.TRANSITION_DURATION + 100, // Légèrement plus long pour effet cascade
        easing: CIF.EASING,
        useNativeDriver: true,
      }).start();

      setExpanded(!expanded);
    }, [expanded, rotateAnim, headerShadowAnim, decorAnim]);

    // Récupération de l'icône en fonction du rang
    const getRankIcon = useCallback(() => {
      if (ranking === 1) return "crown";
      if (ranking === 2 || ranking === 3) return "medal";
      if (ranking && ranking <= 10) return "star-circle";
      if (ranking && ranking <= 50) return "star-half-full";
      return "account-multiple";
    }, [ranking]);

    // Récupération de la couleur principale en fonction du rang
    const getPrimaryColor = useCallback(() => {
      if (ranking === 1) return "#FFA000"; // Or
      if (ranking === 2) return "#C0C0C0"; // Argent
      if (ranking === 3) return "#CD7F32"; // Bronze
      if (ranking && ranking <= 10) return "#6A0DAD"; // Violet royal
      if (ranking && ranking <= 50) return "#26A69A"; // Bleu
      return "#26A69A"; // Teal
    }, [ranking]);

    // Récupération des couleurs du dégradé CIF paramétrique
    const getGradientColors = useCallback((): [string, string] => {
      const primary = getPrimaryColor();

      if (ranking === 1) return [primary, "#FFD700"]; // Or --> Orange foncé
      if (ranking === 2) return [primary, "#757575"]; // Argent --> Gris foncé
      if (ranking === 3) return [primary, "#8D6E63"]; // Bronze --> Brun
      if (ranking && ranking <= 10) return [primary, "#3949AB"]; // Violet --> Indigo
      if (ranking && ranking <= 50) return [primary, "#00796B"]; // Bleu --> Bleu foncé
      return [primary, "#00796B"]; // Teal --> Teal foncé
    }, [ranking, getPrimaryColor]);

    // Récupération du libellé de rang
    const getRankLabel = useCallback(() => {
      if (ranking === 1) return "ÉLITE";
      if (ranking === 2) return "EXPERT";
      if (ranking === 3) return "MAÎTRE";
      if (ranking && ranking <= 10) return "VÉTÉRAN";
      if (ranking && ranking <= 50) return "AVANCÉ";
      return "CONTRIBUTEUR";
    }, [ranking]);

    // Animation de rotation standardisée CIF
    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // Animation d'ombre du header
    const headerShadowStyle = {
      shadowOpacity: headerShadowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.1, 0.3],
      }),
      shadowRadius: headerShadowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 6],
      }),
    };

    // Animation des éléments décoratifs
    const leftDecorTranslate = decorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-20, 0],
    });

    const rightDecorTranslate = decorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });

    const decorOpacity = decorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    // Calcul de la couleur d'arc de progression - conforme aux standards CIF
    const getProgressColor = useCallback(() => {
      const currentPercentile = percentile();

      if (currentPercentile > 90) return "#4CAF50"; // Vert
      if (currentPercentile > 70) return "#8BC34A"; // Vert clair
      if (currentPercentile > 50) return "#FFC107"; // Jaune
      if (currentPercentile > 30) return "#FF9800"; // Orange
      return "#F44336"; // Rouge
    }, [percentile]);

    // Fonction renderStars améliorée avec positionnement conditionnel par nombre d'étoiles
    const renderStars = useCallback(() => {
      if (!badgeStyle?.stars) return null;

      const starCount = Math.min(badgeStyle.stars, 6); // Maximum 6 étoiles

      // Si 1, 2 ou 3 étoiles - arrangement linéaire centré au-dessus
      if (starCount <= 3) {
        return (
          <View style={styles.fewStarsContainer}>
            {Array.from({ length: starCount }).map((_, index) => {
              // Calcul pour centrer l'arrangement (décalage latéral)
              const offsetX = (index - (starCount - 1) / 2) * 20; // 20px d'espacement entre étoiles

              return (
                <View
                  key={index}
                  style={[
                    styles.linearStarPosition,
                    { transform: [{ translateX: offsetX }] },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="star"
                    size={14}
                    color="#FFFFFF"
                    style={styles.floatingStarIcon}
                  />
                </View>
              );
            })}
          </View>
        );
      }

      // Pour 4, 5 ou 6 étoiles - arrangement en arc de cercle
      return (
        <View style={styles.manyStarsContainer}>
          {Array.from({ length: starCount }).map((_, index) => {
            // Calcul de l'arc de cercle pour 4+ étoiles
            const angleRange = 100; // Demi-cercle complet
            const startAngle = -angleRange / 2;
            const angleStep = angleRange / (starCount - 1);
            const angle = startAngle + index * angleStep;

            // Convertir l'angle en radians
            const angleRad = (angle * Math.PI) / 180;

            // Rayon de l'arc - légèrement plus grand que le rayon du cercle d'icône
            const radius = 40; // Ajusté pour un arc plus prononcé

            // Calculer les positions x et y sur l'arc
            const x = radius * Math.sin(angleRad);
            const y = -radius * Math.cos(angleRad); // Négatif pour aller vers le haut

            return (
              <View
                key={index}
                style={[
                  styles.arcStarPosition,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="star"
                  size={14}
                  color="#FFFFFF"
                  style={styles.floatingStarIcon}
                />
              </View>
            );
          })}
        </View>
      );
    }, [badgeStyle]);

    // Fonction pour rendre les décorations latérales
    const renderSideDecorations = useCallback(() => {
      // Obtenir la couleur primaire pour les décorations
      const primaryColor = getPrimaryColor();
      const secondaryColor = getGradientColors()[1];
      
      // Calculer la taille dynamique pour les décorations basée sur le niveau
      const getDecorSize = () => {
        if (ranking === 1) return { large: 32, medium: 24, small: 16 };
        if (ranking === 2 || ranking === 3) return { large: 28, medium: 22, small: 14 };
        return { large: 24, medium: 18, small: 12 };
      };
      
      const decorSize = getDecorSize();

      return (
        <>
          {/* Décorations côté gauche */}
          <Animated.View
            style={[
              styles.sideDecorContainer,
              styles.leftDecor,
              {
                opacity: decorOpacity,
                transform: [{ translateX: leftDecorTranslate }],
              },
            ]}
          >
            <View style={styles.decorItem}>
              <MaterialCommunityIcons
                name={ranking === 1 ? "star-four-points" : "rhombus"}
                size={decorSize.large}
                color={primaryColor}
                style={styles.decorIcon}
              />
            </View>
            
            <View style={styles.decorItem}>
              <View style={[styles.decorCircle, { backgroundColor: secondaryColor, width: 12, height: 12, borderRadius: 6 }]} />
            </View>
            
            <View style={styles.decorItem}>
              <MaterialCommunityIcons
                name="rhombus-outline"
                size={decorSize.medium}
                color="rgba(255, 255, 255, 0.6)"
                style={styles.decorIcon}
              />
            </View>
          </Animated.View>

          {/* Décorations côté droit */}
          <Animated.View
            style={[
              styles.sideDecorContainer,
              styles.rightDecor,
              {
                opacity: decorOpacity,
                transform: [{ translateX: rightDecorTranslate }],
              },
            ]}
          >
            <View style={styles.decorItem}>
              <View style={[styles.decorCircle, { backgroundColor: secondaryColor, width: 12, height: 12, borderRadius: 6 }]} />
            </View>
            
            <View style={styles.decorItem}>
              <MaterialCommunityIcons
                name={ranking === 1 ? "star-four-points" : "rhombus"}
                size={decorSize.medium}
                color={primaryColor}
                style={styles.decorIcon}
              />
            </View>
            
            <View style={styles.decorItem}>
              <MaterialCommunityIcons
                name="rhombus-outline"
                size={decorSize.small}
                color="rgba(255, 255, 255, 0.6)"
                style={styles.decorIcon}
              />
            </View>
          </Animated.View>
        </>
      );
    }, [ranking, getPrimaryColor, getGradientColors, decorOpacity, leftDecorTranslate, rightDecorTranslate]);

    return (
      <Animated.View
        style={[styles.container, { transform: [{ scale: bounceAnim }] }]}
      >
        <TouchableOpacity
          style={styles.cardContainer}
          onPress={toggleExpand}
          activeOpacity={0.85}
        >
          {/* Background gradient - utilise les couleurs CIF paramétriques */}
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Header avec z-index standardisé CIF */}
            <Animated.View
              style={[
                styles.header,
                headerShadowStyle,
                { zIndex: CIF.HEADER_Z_INDEX },
              ]}
            >
              <View style={styles.rankInfoContainer}>
                {/* Icon & Label */}
                <View style={styles.rankIconContainer}>
                  <MaterialCommunityIcons
                    name={getRankIcon()}
                    size={ranking === 1 ? 28 : 24}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.rankLabel}>{getRankLabel()}</Text>
                  <Text style={styles.rankValue}>
                    #{ranking}
                    {rankingSuffix}
                  </Text>
                </View>
              </View>

              {/* Indicateur de progression avec CircularProgress optimisé */}
              <View style={styles.progressContainer}>
                <CircularProgress
                  percentage={percentile()}
                  size={52}
                  color={getProgressColor()}
                  backgroundColor="rgba(255, 255, 255, 0.15)"
                  thickness={5}
                  textColor="#FFFFFF"
                  fontWeight="bold"
                />

                {/* Bouton d'expansion avec rotation CIF standardisée */}
                <Animated.View
                  style={[
                    styles.expandButton,
                    { transform: [{ rotate: arrowRotation }] },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color="#FFFFFF"
                  />
                </Animated.View>
              </View>
            </Animated.View>

            {/* Contenu développé avec z-index CIF standardisé */}
            {expanded && (
              <View
                style={[
                  styles.expandedContent,
                  { zIndex: CIF.CONTENT_Z_INDEX },
                ]}
              >
                <View
                  style={styles.expandedContentInner}
                >
                  {/* Nouvelles décorations latérales */}
                  {renderSideDecorations()}

                  {/* Badge section bien mise en valeur */}
                  {badgeStyle && onShowBadgeModal && (
                    <TouchableOpacity
                      style={styles.enhancedBadgeButton}
                      onPress={onShowBadgeModal}
                      activeOpacity={0.7}
                    >
                      <View style={styles.badgeContainer}>
                        {/* Icône plus visible */}
                        <View style={styles.enhancedIconContainer}>
                          {/* Conteneur d'étoiles positionnées au-dessus */}
                          {renderStars()}

                          {badgeStyle.icon || (
                            <MaterialCommunityIcons
                              name="shield-star"
                              size={28}
                              color="#FFFFFF"
                            />
                          )}
                        </View>

                        {/* Contenu du badge */}
                        <View style={styles.badgeContentWrapper}>
                          <Text style={styles.badgeTitle}>
                            {badgeStyle.title}
                          </Text>

                          <Text style={styles.badgeProgressLabel}>
                            Voir détails
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                        
                  {/* Stats avec mise en valeur du badge */}
                  {showStatsSection && (
                    <View style={styles.statsContainer}>
                      {/* Statistiques principales en ligne */}
                      <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                          <Text style={styles.statValue}>
                            {totalUsers?.toLocaleString() || "?"} 
                          </Text>
                          <Text style={styles.statLabel}>Total Smarters</Text>
                        </View>

                        <View style={styles.statDivider} />

                        <TouchableOpacity
                          style={styles.statItem}
                          onPress={onNavigateToRanking}
                          activeOpacity={0.8}
                        >
                          <View>
                            <View style={styles.rankBadge}>
                              <Text style={styles.rankBadgeText}>
                                {ranking === 1
                                  ? "1er"
                                  : `${ranking}${rankingSuffix}`}
                              </Text>
                            </View>
                            <Text style={styles.statLabel}>Voir le classement</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

// Chemin: components/home/RankBadge.tsx

const styles = StyleSheet.create({
  // ========== CONTENEUR PRINCIPAL ET CARTE ==========
  container: {
    marginVertical: 12,
    marginHorizontal: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientBackground: {
    borderRadius: 16,
    overflow: "hidden",
  },

  // ========== HEADER ET ÉLÉMENTS DU HEADER ==========
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rankInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    justifyContent: "center",
  },
  rankLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 2,
  },
  rankValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButton: {
    marginLeft: 15,
    marginTop: 8,
  },

  // ========== CONTENU DÉVELOPPÉ ==========
  expandedContent: {
    paddingHorizontal: 10,
  },
  expandedContentInner: {
    position: 'relative',
  },

  // ========== SECTION DÉCORATIONS LATÉRALES ==========
  sideDecorContainer: {
    position: 'absolute',
    height: '100%',
    width: 60,
    top: -40,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  leftDecor: {
    left: 0,
    alignItems: 'center',
  },
  rightDecor: {
    right: 0,
    alignItems: 'center',
  },
  decorItem: {
    marginVertical: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorIcon: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  decorCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    alignSelf: 'center',
  },

  // ========== BADGE SECTION ==========
  enhancedBadgeButton: {
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 70, // Espace élargi pour les décorations latérales
    zIndex: 2, // Au-dessus des décorations
  },
  badgeContainer: {
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
  },
  enhancedIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    position: "relative",
    marginBottom: 10,
  },
  badgeContentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  badgeTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeProgressLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },

   // ========== SECTION STATISTIQUES ==========
   statsContainer: {
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 8,
  },
  rankBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  rankBadgeText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },


  // ========== SYSTÈMES D'ÉTOILES ==========
  // Pour arrangement linéaire (1-3 étoiles)
  fewStarsContainer: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 20,
    pointerEvents: "none",
  },
  linearStarPosition: {
    position: "absolute",
    width: 14,
    height: 14,
  },
  // Pour arrangement en arc (4-6 étoiles)
  manyStarsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  arcStarPosition: {
    position: "absolute",
    width: 14,
    height: 14,
    top: 20,
    left: "50%",
    marginLeft: -7,
  },
  floatingStarIcon: {
    shadowColor: "rgba(0,0,0,0.5)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },

  // ========== BOUTONS D'ACTION ==========
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default RankBadge;