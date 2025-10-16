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
  ActivityIndicator,
} from "react-native";
import { SmarterUser } from "../../../types/entities/user.types";
import SmarterItem from "./SmarterItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

/**
 * Interface pour les propriétés du composant EmptyPodiumPosition
 */
interface EmptyPodiumPositionProps {
  position: "left" | "center" | "right";
  rank: number;
}

const { width: WINDOW_WIDTH } = Dimensions.get("window");

// Nombre maximum d'utilisateurs à afficher avant le bouton "Voir tout"
const MAX_DISPLAY_USERS = 10;

/**
 * EmptyPodiumPosition - Composant pour afficher une position vacante sur le podium
 * Design harmonisé avec le composant SmarterItem
 */
// Composant pour les positions de podium vacantes
const EmptyPodiumPosition = memo(
  ({
    position,
    rank,
  }: {
    position: "left" | "center" | "right";
    rank: number;
  }) => {
    // Déterminer la couleur d'accent et de fond en fonction du rang
    const getStyles = () => {
      switch (rank) {
        case 2:
          return {
            accent: "#D5D5D5", // Argent
            background: "#F5F5F5", // Fond clair argenté
            containerStyle: styles.secondPlaceContainer,
            avatarBorderColor: "#D5D5D5",
          };
        case 3:
          return {
            accent: "#CD7F32", // Bronze
            background: "#F9EAE0", // Fond clair bronze
            containerStyle: styles.thirdPlaceContainer,
            avatarBorderColor: "#CD7F32",
          };
        default:
          return {
            accent: "#FFD700", // Or
            background: "#FFECB3", // Fond clair doré
            avatarBorderColor: "#FFD700",
          };
      }
    };

    const { accent, background, containerStyle, avatarBorderColor } =
      getStyles();

    // Animation d'entrée avec timing standard
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Délai d'entrée basé sur la position
      const entryDelay =
        400 + (position === "center" ? 0 : position === "left" ? 100 : 200);

      Animated.sequence([
        Animated.delay(entryDelay),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          position === "left" && styles.podiumLeft,
          position === "center" && styles.podiumCenter,
          position === "right" && styles.podiumRight,
          {
            opacity: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
            transform: [
              { scale: bounceAnim },
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.vacantPodiumCard,
            { backgroundColor: background },
            containerStyle,
          ]}
        >
          {/* Badge de rang */}
          <View style={[styles.rankBadgeCircle, { backgroundColor: accent }]}>
            <Text style={styles.rankBadgeText}>{rank}</Text>
          </View>

          {/* Placeholder d'avatar avec bordure */}
          <View style={styles.podiumAvatarContainer}>
            <View
              style={[
                styles.podiumAvatarBorder,
                { borderColor: avatarBorderColor },
              ]}
            >
              <View style={styles.emptyPodiumAvatar}>
                <MaterialIcons name="help" size={28} color="#CCCCCC" />
              </View>
            </View>
          </View>

          {/* Texte de position vacante */}
          <Text style={styles.vacantPodiumName}>
            {rank === 2 ? "2ème place vacante" : "3ème place vacante"}
          </Text>
        </View>
      </Animated.View>
    );
  }
);
/**
 * RankingSection - Composant de classement avec design premium
 * Optimisé pour une utilisation dans un ScrollView parent
 */
const RankingSection: React.FC<RankingSectionProps> = memo(
  ({ topUsers, onUserPress, onSeeAllPress, isVisible, toggleVisibility }) => {
    // Hooks et états
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const headerScaleAnim = useRef(new Animated.Value(1)).current;
    const badgePulse = useRef(new Animated.Value(1)).current;
    const contentSlideAnim = useRef(
      new Animated.Value(isVisible ? 1 : 0)
    ).current;

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

    // Filtrage pour exclure les comptes mairie
    const filteredUsers = topUsers.filter((user) => {
      const normalized = (user.displayName ?? "").trim().toLowerCase();
      return !/^mairie(\s*de)?/i.test(normalized);
    });

    // Puis utiliser filteredUsers pour le podium et la liste
    const podiumUsers = filteredUsers.slice(
      0,
      Math.min(3, filteredUsers.length)
    );
    const listUsers = filteredUsers.slice(3, MAX_DISPLAY_USERS);
    const hasMoreUsers = filteredUsers.length > MAX_DISPLAY_USERS;

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

    // Simuler le chargement du contenu lors de l'ouverture
    useEffect(() => {
      if (isVisible) {
        setIsLoading(true);
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 1000); // délai de 1s simulant le chargement
        return () => clearTimeout(timer);
      }
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

    // Rendu du podium avec les 3 premiers et gestion des positions vacantes
    const renderPodium = useCallback(() => {
      // Créer un tableau fixe pour représenter les 3 positions du podium
      const podiumPositions: Array<{
        user: SmarterUser | null;
        position: "left" | "center" | "right";
        rank: number;
      }> = [
        { user: null, position: "left", rank: 2 },
        { user: null, position: "center", rank: 1 },
        { user: null, position: "right", rank: 3 },
      ];

      // Placement des utilisateurs disponibles dans l'ordre correct
      podiumUsers.forEach((user, index) => {
        if (index === 0) {
          // Premier utilisateur va au centre (position 1)
          podiumPositions[1].user = user;
        } else if (index === 1) {
          // Deuxième utilisateur va à gauche (position 2)
          podiumPositions[0].user = user;
        } else if (index === 2) {
          // Troisième utilisateur va à droite (position 3)
          podiumPositions[2].user = user;
        }
      });

      return (
        <View style={styles.podiumContainer}>
          {podiumPositions.map((item, displayIndex) => {
            const { user, position, rank } = item;

            // Calcul de l'index pour SmarterItem (0-based)
            const actualRank = rank - 1;

            return user ? (
              // Rendu d'utilisateur réel
              <SmarterItem
                key={user.id}
                user={user}
                index={actualRank}
                onPress={onUserPress}
                isActive={actualRank === activeIndex}
                isPodium={true}
                podiumPosition={position}
              />
            ) : (
              // Rendu d'une position vacante
              <EmptyPodiumPosition
                key={`empty-${position}`}
                position={position}
                rank={rank}
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
            <MaterialIcons
              name="format-list-bulleted"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
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
              <MaterialIcons
                name="emoji-events"
                size={32}
                color={THEME.primary}
              />
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
                backgroundColor: isVisible
                  ? EXPANDED_BACKGROUND
                  : COLLAPSED_BACKGROUND,
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
              android_ripple={{
                color: "rgba(0, 0, 0, 0.05)",
                borderless: true,
              }}
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
                          { scale: isVisible ? 1.1 : 1 },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isVisible
                          ? [THEME.primary, THEME.primaryDark]
                          : ["#A0AEC0", "#718096"]
                      }
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
            <View style={styles.sectionContentContainer}>
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
                  {isLoading ? (
                    <View style={styles.loaderContainer}>
                      <ActivityIndicator size="large" color={THEME.primary} />
                    </View>
                  ) : topUsers.length > 0 ? (
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
                              <Text style={styles.viewAllLink}>Voir tout</Text>
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
    paddingTop: 15,
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
  // Styles pour le podium
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 20,
  },
  podiumLeft: {
    marginTop: 40,
  },
  podiumCenter: {
    marginTop: 0,
    width: 10,
  },
  podiumRight: {
    marginTop: 60,
  },
  // Styles pour les positions vacantes du podium
  emptyPodiumCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    borderStyle: "dashed",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyPodiumGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    opacity: 0.1,
  },
  emptyPodiumBadge: {
    position: "absolute",
    top: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F2BD57",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  emptyPodiumName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9E9E9E",
    marginBottom: 4,
    textAlign: "center",
  },
  emptyPodiumScore: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.5,
  },
  crownInner: {
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Styles pour les éléments réels du podium (référencés par EmptyPodiumPosition)
  podiumBadgeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  // Styles pour les positions vacantes du podium
  vacantPodiumCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondPlaceContainer: {
    width: 120,
    height: 160,
    borderRadius: 16,
  },
  thirdPlaceContainer: {
    width: 120,
    height: 160,
    borderRadius: 16,
  },
  rankBadgeCircle: {
    position: "absolute",
    top: -15,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 1,
  },
  rankBadgeText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  podiumAvatarContainer: {
    marginTop: 15,
    marginBottom: 12,
  },
  podiumAvatarBorder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPodiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
  },
  vacantPodiumName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    textAlign: "center",
  },
  podiumScoreContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  crownContainer: {
    position: "absolute",
    top: -15,
    left: "50%",
    marginLeft: -2,
  },
  // Styles pour la liste de classement
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
  rankingListItems: {},
  // Styles pour l'état vide
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
  // Styles pour le bouton "Voir tout"
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
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

export default RankingSection;
