// Chemin : src/components/RankingSection/RankingSection.tsx

import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  Easing,
} from "react-native";
import { SmarterUser } from "../ProfileSection/user.types";
import SmarterItem from "./SmarterItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// Configuration pour Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Configuration des couleurs pour le thème - Style harmonisé avec teinte violette/indigo
const THEME = {
  primary: "#6C63FF", // Indigo principal
  primaryDark: "#4F46E5", // Indigo foncé
  secondary: "#B4ADFF", // Indigo clair
  background: "#F9FAFE", // Fond très légèrement bleuté
  backgroundDark: "#ECF0F7", // Fond légèrement plus sombre
  cardBackground: "#FFFFFF", // Blanc pur pour les cartes
  text: "#2D3748", // Texte principal presque noir
  textLight: "#718096", // Texte secondaire gris
  textMuted: "#A0AEC0", // Texte tertiaire gris clair
  border: "#E2E8F0", // Bordures légères
  shadow: "rgba(13, 26, 83, 0.12)", // Ombres avec teinte bleuâtre
};

// Couleur de fond optimisées pour l'état ouvert/fermé
const EXPANDED_BACKGROUND = "rgba(250, 251, 255, 0.97)";
const COLLAPSED_BACKGROUND = "#FFFFFF";

/**
 * Interface pour les propriétés du composant RankingSection
 */
interface RankingSectionProps {
  topUsers: SmarterUser[];
  onUserPress: (id: string) => void;
  onSeeAllPress: () => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const { width: WINDOW_WIDTH } = Dimensions.get("window");

// Nombre maximum d'utilisateurs à afficher avant le bouton "Voir tout"
const MAX_DISPLAY_USERS = 10;

/**
 * RankingSection - Composant de classement avec design premium
 * Optimisé pour une utilisation dans un ScrollView parent
 */
const RankingSection: React.FC<RankingSectionProps> = memo(
  ({ topUsers, onUserPress, onSeeAllPress, isVisible, toggleVisibility }) => {
    // Hooks et états
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const headerScaleAnim = useRef(new Animated.Value(1)).current;
    const badgePulse = useRef(new Animated.Value(1)).current;
    const contentSlideAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

    // Animation de rotation pour l'icône de flèche
    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // Animation de slide pour le contenu
    const contentSlide = contentSlideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-20, 0],
    });

    // Séparer les podium users et les autres
    const podiumUsers = topUsers.slice(0, Math.min(3, topUsers.length));
    const listUsers = topUsers.slice(3, MAX_DISPLAY_USERS);
    const hasMoreUsers = topUsers.length > MAX_DISPLAY_USERS;

    // Démarrer l'animation de pulsation du badge
    useEffect(() => {
      if (topUsers.length > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(badgePulse, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(badgePulse, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ])
        ).start();
      }
    }, [topUsers.length]);

    // Gestion de la visibilité avec LayoutAnimation
    useEffect(() => {
      // Configuration de l'animation de layout
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });

      // Animation de rotation de la flèche
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animation de l'opacité du contenu
      Animated.timing(opacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animation de slide du contenu
      Animated.timing(contentSlideAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, [isVisible]);

    // Animation pour l'effet de pression sur l'en-tête
    const handleHeaderPressIn = () => {
      Animated.spring(headerScaleAnim, {
        toValue: 0.98,
        friction: 8,
        useNativeDriver: true,
      }).start();
    };

    const handleHeaderPressOut = () => {
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    // Rendu du podium avec les 3 premiers
    const renderPodium = useCallback(() => {
      if (podiumUsers.length === 0) return null;

      // Réarranger pour mettre la 1ère place au milieu
      const orderedPodium = [...podiumUsers];
      if (orderedPodium.length >= 3) {
        [orderedPodium[0], orderedPodium[1]] = [
          orderedPodium[1],
          orderedPodium[0],
        ];
      }

      const positions: ("left" | "center" | "right")[] = [
        "left",
        "center",
        "right",
      ];

      return (
        <View style={styles.podiumContainer}>
          {orderedPodium.map((user, index) => {
            const position = positions[index];
            const actualRank = index === 0 ? 1 : index === 1 ? 0 : index;

            return (
              <SmarterItem
                key={user.id}
                user={user}
                index={actualRank}
                onPress={onUserPress}
                isActive={actualRank === activeIndex}
                isPodium={true}
                podiumPosition={position}
              />
            );
          })}
        </View>
      );
    }, [podiumUsers, activeIndex, onUserPress]);

    // Rendu de la liste des autres utilisateurs
    const renderUserList = useCallback(() => {
      if (listUsers.length === 0) return null;

      return (
        <View style={styles.rankingListItems}>
          {listUsers.map((user, index) => (
            <SmarterItem
              key={user.id}
              user={user}
              index={index + 3} // +3 pour les rangs après le podium
              onPress={onUserPress}
              isActive={index + 3 === activeIndex}
            />
          ))}
        </View>
      );
    }, [listUsers, activeIndex, onUserPress]);

    // Rendu du bouton "Voir tout"
    const renderSeeAllButton = useCallback(() => {
      if (!hasMoreUsers) return null;

      return (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onSeeAllPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[THEME.primary, THEME.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.seeAllGradient}
          >
            <MaterialIcons name="format-list-bulleted" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.seeAllText}>Voir le classement complet</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }, [hasMoreUsers, onSeeAllPress]);

    // Composant pour afficher un message d'état vide
    const renderEmptyState = useCallback(
      () => (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <View style={styles.emptyStateIconContainer}>
              <MaterialIcons name="emoji-events" size={32} color={THEME.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>Aucun contributeur</Text>
            <Text style={styles.emptyStateSubtitle}>
              Soyez le premier à participer et apparaître dans le classement!
            </Text>
          </View>
        </View>
      ),
      []
    );

    return (
      <View style={styles.container}>
        {/* Conteneur principal avec position relative pour le z-index */}
        <View style={{ position: "relative", zIndex: 1 }}>
          {/* En-tête de section avec design harmonisé */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                backgroundColor: isVisible ? EXPANDED_BACKGROUND : COLLAPSED_BACKGROUND,
                borderBottomLeftRadius: isVisible ? 0 : 20,
                borderBottomRightRadius: isVisible ? 0 : 20,
                transform: [{ scale: headerScaleAnim }],
                borderBottomWidth: isVisible ? 1 : 0,
                borderBottomColor: isVisible ? THEME.border : "transparent",
                elevation: isVisible ? 5 : 2,
                shadowOpacity: isVisible ? 0.06 : 0.08,
              },
            ]}
          >
            <Pressable
              onPress={toggleVisibility}
              onPressIn={handleHeaderPressIn}
              onPressOut={handleHeaderPressOut}
              style={styles.header}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: true }}
            >
              <View style={styles.headerContent}>
                {/* Icône et titre */}
                <View style={styles.titleContainer}>
                  <LinearGradient
                    colors={[THEME.primary, THEME.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                  >
                    <MaterialIcons
                      name="emoji-events"
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                  <View>
                    <Text style={styles.title}>Classement</Text>
                    <Text style={styles.subtitle}>
                      Top {MAX_DISPLAY_USERS} des meilleurs Smarters
                    </Text>
                  </View>
                </View>

                {/* Badge de nombre d'utilisateurs et flèche */}
                <View style={styles.headerControls}>
                  {topUsers.length > 0 && (
                    <Animated.View
                      style={[
                        styles.countBadge,
                        { transform: [{ scale: badgePulse }] },
                      ]}
                    >
                      <LinearGradient
                        colors={[THEME.secondary, THEME.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.countBadgeGradient}
                      >
                        <Text style={styles.countText}>{topUsers.length}</Text>
                      </LinearGradient>
                    </Animated.View>
                  )}

                  <Animated.View
                    style={[
                      styles.arrowContainer,
                      {
                        transform: [
                          { rotate: arrowRotation },
                          { scale: isVisible ? 1.1 : 1 }
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={isVisible ? 
                        [THEME.primary, THEME.primaryDark] : 
                        ['#A0AEC0', '#718096']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.arrowIndicator}
                    >
                      <Text style={styles.arrowIcon}>⌄</Text>
                    </LinearGradient>
                  </Animated.View>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Contenu principal avec hauteur conditionnelle */}
          {isVisible && (
            <View
              style={styles.sectionContentContainer}
            >
              <LinearGradient
                colors={[EXPANDED_BACKGROUND, "#FFFFFF"]}
                style={styles.sectionContent}
              >
                <Animated.View
                  style={[
                    styles.contentInner,
                    {
                      opacity: opacityAnim,
                      transform: [{ translateY: contentSlide }],
                    },
                  ]}
                >
                  {topUsers.length > 0 ? (
                    <>
                      {/* Podium pour les 3 premiers */}
                      <View>{renderPodium()}</View>

                      {/* Liste des autres utilisateurs */}
                      {listUsers.length > 0 && (
                        <View style={styles.rankingListContainer}>
                          <View style={styles.rankingListHeader}>
                            <Text style={styles.rankingListTitle}>
                              Autres contributeurs
                            </Text>
                            <TouchableOpacity onPress={onSeeAllPress}>
                              <Text style={styles.viewAllLink}>
                                Voir tout
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {renderUserList()}
                          {renderSeeAllButton()}
                        </View>
                      )}
                    </>
                  ) : (
                    renderEmptyState()
                  )}
                </Animated.View>
              </LinearGradient>
            </View>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 5,
    overflow: "hidden",
    borderRadius: 24,
  },
  // Styles du header harmonisés avec les autres composants
  headerContainer: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textLight,
    letterSpacing: -0.2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Badge de comptage avec animation de pulsation et dégradé
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: THEME.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countBadgeGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  arrowIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: -10,
  },
  // Styles du contenu
  sectionContentContainer: {
    overflow: "hidden",
    marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
    borderTopWidth: 0,
    zIndex: 0,
  },
  sectionContent: {
    paddingTop:15,
    borderRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentInner: {
    padding: 15,
  },
  // Styles existants pour le contenu
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 20,
  },
  rankingListContainer: {
    marginBottom: 16,
  },
  rankingListHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  rankingListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  viewAllLink: {
    fontSize: 13,
    color: THEME.primary,
    fontWeight: "500",
  },
  rankingListItems: {
    marginBottom: 10,
  },
  emptyStateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContent: {
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    padding: 30,
    borderRadius: 16,
    width: "100%",
  },
  emptyStateIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0eeff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  seeAllButton: {
    marginVertical: 10,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  seeAllGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  seeAllText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default RankingSection;