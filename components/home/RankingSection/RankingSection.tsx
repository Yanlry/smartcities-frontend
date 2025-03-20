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

// Configuration pour Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const LIGHT_BLUE_BACKGROUND = '#F0F7FF';
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

    // Animation de rotation pour l'icône de flèche
    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
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
          activeOpacity={0.9}
        >
          <View style={styles.seeAllGradient}>
            <Text style={styles.seeAllText}>Voir le classement complet</Text>
          </View>
        </TouchableOpacity>
      );
    }, [hasMoreUsers, onSeeAllPress]);

    // Composant pour afficher un message d'état vide
    const renderEmptyState = useCallback(
      () => (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <View style={styles.emptyStateIconContainer}>
              <MaterialIcons name="emoji-events" size={32} color="#CCCCDD" />
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
        {/* Conteneur unifié qui enveloppe l'en-tête et le contenu */}
        <View style={[
          styles.unifiedContainer,
          isVisible && styles.unifiedContainerActive
        ]}>
          {/* En-tête avec titre et contrôle */}
          <Animated.View
            style={[
              styles.headerContainer,
              { 
                transform: [{ scale: headerScaleAnim }],
                backgroundColor: isVisible ? LIGHT_BLUE_BACKGROUND : '#FFFFFF',
                // Bordures arrondies conditionnelles
                borderBottomLeftRadius: isVisible ? 0 : 20,
                borderBottomRightRadius: isVisible ? 0 : 20,
              },
            ]}
          >
            <Pressable
              onPress={toggleVisibility}
              onPressIn={handleHeaderPressIn}
              onPressOut={handleHeaderPressOut}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                {/* Icône et titre */}
                <View style={styles.titleContainer}>
                  <View style={styles.trophyIconContainer}>
                    <MaterialIcons
                      name="emoji-events"
                      size={32}
                      color="#1B5D85"
                    />
                  </View>
                  <View>
                    <Text style={styles.title}>Classement</Text>
                    <Text style={styles.subtitle}>
                      Top 10 des meilleurs Smarters
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
                      <Text style={styles.countText}>{topUsers.length}</Text>
                    </Animated.View>
                  )}

                  <Animated.View
                    style={[
                      styles.arrowContainer,
                      { transform: [{ rotate: arrowRotation }] },
                    ]}
                  >
                    <Text style={styles.arrowIcon}>⌄</Text>
                  </Animated.View>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Contenu principal avec hauteur conditionnelle */}
          {isVisible && (
            <Animated.View
              style={[
                styles.contentContainer, 
                { 
                  opacity: opacityAnim,
                  backgroundColor: LIGHT_BLUE_BACKGROUND,
                  marginTop: 0, // Suppression de la marge pour éviter l'écart
                  paddingTop: 15, // Padding pour l'espacement interne
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                }
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
                            Voir tout le classement
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
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
  },
  // Nouveau conteneur unifié pour la gestion de l'apparence commune
  unifiedContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.08)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  unifiedContainerActive: {
    backgroundColor: LIGHT_BLUE_BACKGROUND,
  },
  headerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20, // Sera modifié conditionnellement
    borderBottomRightRadius: 20, // Sera modifié conditionnellement
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
  trophyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  trophyIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: "#4A80F0",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#4F566B",
    fontWeight: "bold",
  },
  contentContainer: {
    // marginTop est maintenant 0, avec un paddingTop à la place
  },
  podiumContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 20,
  },
  rankingListContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  rankingListHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankingListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  viewAllLink: {
    fontSize: 13,
    color: "#4A80F0",
    fontWeight: "400",
    opacity: 0.8,
  },
  rankingListItems: {
    marginBottom: 10,
  },
  emptyStateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 40,
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
    backgroundColor: "#E6EBF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateIcon: {
    fontSize: 32,
    opacity: 0.7,
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
    backgroundColor: "#4A80F0",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  seeAllGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A80F0",
  },
  seeAllText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default RankingSection;
