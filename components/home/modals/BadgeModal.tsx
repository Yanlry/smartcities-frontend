// src/components/home/modals/BadgeModal.tsx

import React, {
  memo,
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ListRenderItemInfo,
  TouchableWithoutFeedback,
  Easing,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBadge } from "../../../hooks/ui/useBadge";

const { height, width } = Dimensions.get("window");

/**
 * Types pour les icônes de MaterialCommunityIcons
 */
type MaterialIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

/**
 * Constantes du Cohesive Identity Framework (CIF) pour standardiser
 * les aspects visuels et interactifs à travers l'application
 */
const CIF = {
  // Durées et animations
  TRANSITION_DURATION: 300,
  EASING: Easing.cubic,
  SPRING_CONFIG: {
    damping: 20,
    stiffness: 90,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
  },

  // Z-index standardisés
  Z_INDEX: {
    BACKDROP: 1,
    MODAL_CONTAINER: 10,
    MODAL_CONTENT: 20,
    HEADER: 30,
    HERO: 25,
    LIST_ITEM: 20,
    BADGE: 35,
    INFO_MODAL: 50,
  },

  // Couleurs principales
  COLORS: {
    PRIMARY: "#062C41",
    SECONDARY: "#26A69A",
    SUCCESS: "#4CAF50",
    WARNING: "#FF9800",
    ERROR: "#F44336",
    INFO: "#2196F3",
    LIGHT: "#F5F7FA",
    DARK: "#333333",
    WHITE: "#FFFFFF",
    TRANSPARENT: "transparent",
    BACKDROP: "rgba(0, 0, 0, 0.7)",
    SHADOW: "rgba(0, 0, 0, 0.2)",
  },

  // Rayons de bordure standardisés
  BORDER_RADIUS: {
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XLARGE: 32,
    CIRCLE: 100,
  },

  // Espacements standardisés
  SPACING: {
    SMALL: 8,
    MEDIUM: 16,
    LARGE: 24,
    XLARGE: 32,
  },

  // Opacités standardisées
  OPACITY: {
    DISABLED: 0.5,
    OVERLAY: 0.85,
    HIGHLIGHT: 0.1,
    MEDIUM: 0.7,
  },

  // Ombres standardisées
  SHADOW: {
    LIGHT: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    MEDIUM: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    HEAVY: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 12,
    },
  },
};

/**
 * Carte des icônes pour chaque niveau de badge
 */
const BADGE_ICONS: Record<string, MaterialIconName> = {
  "Premiers pas": "school-outline",
  "Apprenti citoyen": "shield-account",
  "Citoyen de confiance": "shield-check",
  "Ambassadeur du quartier": "shield-star",
  "Héros du quotidien": "shield-crown",
  "Icône locale": "crown",
  "Légende urbaine": "crown-circle",
  DEFAULT: "trophy",
};

/**
 * Couleurs par défaut pour les éléments verrouillés
 */
const LOCKED_COLORS = {
  primary: "#BBBBBB",
  secondary: "#9E9E9E",
  gradient: ["#E0E0E0", "#BDBDBD"] as [string, string],
};

/**
 * Interface pour les propriétés du modal de badge
 */
interface BadgeModalProps {
  visible: boolean;
  onClose: () => void;
  userVotes?: number;
}

/**
 * Interface pour les éléments de la liste des niveaux
 */
interface TierItem {
  name: string;
  description: string;
  votes: number;
}

/**
 * Composant pour le modal d'information
 */
interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * InfoModal - Modal explicatif amélioré avec design CIF
 * Affiche des informations sur la progression des niveaux
 */
const InfoModal = memo(({ visible, onClose }: InfoModalProps) => {
  // Animations standardisées CIF
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Animation d'entrée/sortie conforme aux standards CIF
  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: CIF.TRANSITION_DURATION,
          easing: CIF.EASING,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: CIF.TRANSITION_DURATION,
          easing: CIF.EASING,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...CIF.SPRING_CONFIG,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de sortie
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: CIF.TRANSITION_DURATION * 0.8,
          easing: CIF.EASING,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height,
          duration: CIF.TRANSITION_DURATION,
          easing: CIF.EASING,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: CIF.TRANSITION_DURATION * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, translateY, scaleAnim]);

  // Obtenir des gradients pour les boutons et icônes d'information
  const getInfoItemColors = useCallback((index: number): [string, string] => {
    switch (index) {
      case 0:
        return ["#4CAF50", "#2E7D32"]; // Votes/interaction - vert
      case 1:
        return ["#2196F3", "#0D47A1"]; // Communauté - bleu
      case 2:
        return ["#FF9800", "#E65100"]; // Progression - orange
      default:
        return [CIF.COLORS.PRIMARY, "#051A26"];
    }
  }, []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.infoModalBackdrop,
            { opacity },
            { zIndex: CIF.Z_INDEX.INFO_MODAL },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.infoModalContainer,
                {
                  opacity,
                  transform: [{ translateY }, { scale: scaleAnim }],
                },
              ]}
            >
              {/* Barre d'en-tête avec effet de profondeur */}
              <LinearGradient
                colors={["#F8F9FA", "#F2F3F5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.infoModalHeader}
              >
                <Text style={styles.infoModalTitle}>Comment progresser ?</Text>
                <TouchableOpacity
                  style={styles.infoModalCloseButton}
                  onPress={onClose}
                  activeOpacity={CIF.OPACITY.OVERLAY}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={CIF.COLORS.DARK}
                  />
                </TouchableOpacity>
              </LinearGradient>

              <View style={styles.infoModalContent}>
                {/* Liste d'actions avec icônes thématiques */}
                {[
                  {
                    icon: "thumb-up" as MaterialIconName,
                    title: "Votez sur les signalements",
                    description:
                      "Chaque vote que vous donnez vous permet de progresser dans les niveaux.",
                  },
                  {
                    icon: "account-group" as MaterialIconName,
                    title: "Engagez la communauté",
                    description:
                      "Partagez votre niveau et encouragez d'autres citoyens à participer.",
                  },
                  {
                    icon: "chart-line-variant" as MaterialIconName,
                    title: "Suivez votre progression",
                    description:
                      "Chaque niveau débloqué vous donne accès à de nouvelles fonctionnalités.",
                  },
                ].map((item, index) => (
                  <View key={index} style={styles.infoItem}>
                    <LinearGradient
                      colors={getInfoItemColors(index)}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.infoIconContainer}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color={CIF.COLORS.WHITE}
                      />
                    </LinearGradient>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoTitle}>{item.title}</Text>
                      <Text style={styles.infoDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Bouton d'action avec effet de profondeur */}
              <LinearGradient
                colors={[CIF.COLORS.PRIMARY, "#051A26"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoModalButtonGradient}
              >
                <TouchableOpacity
                  style={styles.infoModalButton}
                  onPress={onClose}
                  activeOpacity={CIF.OPACITY.OVERLAY}
                >
                  <Text style={styles.infoModalButtonText}>J'ai compris</Text>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

/**
 * Modal d'affichage des niveaux d'engagement utilisateur
 * Version modernisée avec principes CIF pour une expérience visuelle améliorée
 */
const BadgeModal: React.FC<BadgeModalProps> = memo(
  ({ visible, onClose, userVotes = 0 }) => {
    // État pour le modal d'information
    const [infoModalVisible, setInfoModalVisible] = useState(false);

    // Normaliser les votes de l'utilisateur
    const normalizedUserVotes = useMemo(() => {
      const votesAsNumber =
        typeof userVotes === "string" ? parseInt(userVotes, 10) : userVotes;
      return Number.isNaN(votesAsNumber) ? 0 : Math.max(0, votesAsNumber);
    }, [userVotes]);

    // Hooks pour les données et le rendu
    const { getBadgeStyles, tiers, getProgressInfo } = useBadge();
    const insets = useSafeAreaInsets();
    const [itemsVisible, setItemsVisible] = useState(false);

    // Obtenir les informations de progression et le style du badge actuel
    const progressInfo = useMemo(
      () => getProgressInfo(normalizedUserVotes),
      [normalizedUserVotes, getProgressInfo]
    );

    const currentBadgeStyle = useMemo(
      () => getBadgeStyles(normalizedUserVotes),
      [normalizedUserVotes, getBadgeStyles]
    );

    // Animations
    const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
    const modalOpacityAnim = useRef(new Animated.Value(0)).current;
    const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
    const heroAnimatedValue = useRef(new Animated.Value(0)).current;

    // Animations pour chaque élément de la liste - avec rotation et échelle
    const itemAnimations = useMemo(
      () =>
        tiers.map(() => ({
          opacity: new Animated.Value(0),
          translateY: new Animated.Value(30),
          scale: new Animated.Value(0.95),
          rotate: new Animated.Value(-2),
        })),
      [tiers]
    );

    // Animation d'entrée/sortie du modal - standardisée CIF
    useEffect(() => {
      StatusBar.setBarStyle(visible ? "light-content" : "default", true);

      if (visible) {
        // Animation d'ouverture avec timing CIF
        Animated.parallel([
          Animated.timing(backdropOpacityAnim, {
            toValue: 1,
            duration: CIF.TRANSITION_DURATION,
            easing: CIF.EASING,
            useNativeDriver: true,
          }),
          Animated.spring(modalScaleAnim, {
            toValue: 1,
            ...CIF.SPRING_CONFIG,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacityAnim, {
            toValue: 1,
            duration: CIF.TRANSITION_DURATION,
            easing: CIF.EASING,
            useNativeDriver: true,
          }),
          Animated.spring(heroAnimatedValue, {
            toValue: 1,
            ...CIF.SPRING_CONFIG,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setItemsVisible(true);
        });
      } else {
        // Animation de fermeture avec timing CIF
        setItemsVisible(false);

        Animated.parallel([
          Animated.timing(backdropOpacityAnim, {
            toValue: 0,
            duration: CIF.TRANSITION_DURATION * 0.8,
            easing: CIF.EASING,
            useNativeDriver: true,
          }),
          Animated.spring(modalScaleAnim, {
            toValue: 0.9,
            ...CIF.SPRING_CONFIG,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacityAnim, {
            toValue: 0,
            duration: CIF.TRANSITION_DURATION * 0.8,
            easing: CIF.EASING,
            useNativeDriver: true,
          }),
        ]).start();

        // Réinitialiser les animations
        heroAnimatedValue.setValue(0);
        itemAnimations.forEach((anim) => {
          anim.opacity.setValue(0);
          anim.translateY.setValue(30);
          anim.scale.setValue(0.95);
          anim.rotate.setValue(-2);
        });
      }

      // Nettoyage à la désinstallation du composant
      return () => {
        StatusBar.setBarStyle("default", true);
      };
    }, [
      visible,
      backdropOpacityAnim,
      modalScaleAnim,
      modalOpacityAnim,
      heroAnimatedValue,
      itemAnimations,
    ]);

    // Animation séquentielle des items de la liste - cascade avec rotation
    useEffect(() => {
      if (itemsVisible) {
        itemAnimations.forEach((anim, index) => {
          setTimeout(() => {
            Animated.parallel([
              Animated.spring(anim.opacity, {
                toValue: 1,
                friction: 10,
                tension: 50,
                useNativeDriver: true,
              }),
              Animated.spring(anim.translateY, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(anim.scale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(anim.rotate, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
              }),
            ]).start();
          }, index * 80); // Effet cascade amélioré
        });
      }
    }, [itemsVisible, itemAnimations]);

    // Interpolations pour les animations
    const heroTranslateY = heroAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [40, 0],
    });

    const heroOpacity = heroAnimatedValue.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [0, 0.8, 1],
    });

    const heroScale = heroAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    });

    /**
     * Formate les grands nombres pour une meilleure lisibilité
     */
    const formatVotes = useCallback((votes: number): string => {
      if (votes >= 1000) {
        return `${(votes / 1000).toFixed(1)}K`;
      }
      return votes.toString();
    }, []);

    /**
     * Obtient l'icône correspondant au nom du badge
     */
    const getBadgeIcon = useCallback(
      (tierName: string, isLocked: boolean = false): MaterialIconName => {
        if (isLocked) return BADGE_ICONS.DEFAULT;
        return BADGE_ICONS[tierName] || BADGE_ICONS.DEFAULT;
      },
      []
    );

    /**
     * Crée un dégradé à partir d'une couleur principale
     */
    const createGradient = useCallback(
      (mainColor: string, darkFactor = 0.2): [string, string] => {
        // Simple fonction pour assombrir une couleur hex
        const darken = (color: string, amount: number) => {
          color = color.replace("#", "");
          let r = parseInt(color.substring(0, 2), 16);
          let g = parseInt(color.substring(2, 4), 16);
          let b = parseInt(color.substring(4, 6), 16);

          r = Math.max(0, Math.floor(r * (1 - amount)));
          g = Math.max(0, Math.floor(g * (1 - amount)));
          b = Math.max(0, Math.floor(b * (1 - amount)));

          return (
            "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
          );
        };

        return [mainColor, darken(mainColor, darkFactor)];
      },
      []
    );

    /**
     * Rendu des étoiles pour un badge - avec animation et effets visuels
     */
    const renderStars = useCallback((badgeStyle) => {
      if (!badgeStyle || typeof badgeStyle.stars !== "number") return null;

      return (
        <View style={styles.starsContainer}>
          {badgeStyle.stars > 0 ? (
            Array.from({ length: badgeStyle.stars }).map((_, i) => (
              <MaterialCommunityIcons
                key={i}
                name="star"
                size={14}
                color={badgeStyle.starsColor}
                style={[styles.starIcon, { marginLeft: i > 0 ? 2 : 0 }]}
              />
            ))
          ) : (
            <MaterialCommunityIcons
              name="school-outline"
              size={14}
              color={badgeStyle.starsColor}
              style={styles.starIcon}
            />
          )}
        </View>
      );
    }, []);

    /**
     * Vérifie si un niveau correspond au niveau actuel de l'utilisateur
     */
    const isCurrentTier = useCallback(
      (tierVotes: number): boolean => {
        // Trier les tiers par nombre de votes (du plus petit au plus grand)
        const sortedTiers = [...tiers].sort((a, b) => a.votes - b.votes);

        // Trouver le tier actuel pour ces votes
        for (let i = 0; i < sortedTiers.length; i++) {
          const currentTier = sortedTiers[i];
          const nextTier = sortedTiers[i + 1];

          // Si c'est le dernier tier (niveau maximum)
          if (!nextTier) {
            const isMax = normalizedUserVotes >= currentTier.votes;
            if (isMax && currentTier.votes === tierVotes) {
              return true;
            }
          }
          // Autres niveaux
          else {
            const isInRange =
              normalizedUserVotes >= currentTier.votes &&
              normalizedUserVotes < nextTier.votes;
            if (isInRange && currentTier.votes === tierVotes) {
              return true;
            }
          }
        }

        return false;
      },
      [normalizedUserVotes, tiers]
    );

    /**
     * Rendu d'un élément de niveau avec design amélioré CIF
     */
    const renderTierItem = useCallback(
      ({ item, index }: ListRenderItemInfo<TierItem>) => {
        // Obtenir le style complet pour ce niveau
        const badgeStyle = getBadgeStyles(item.votes);

        // Vérifier si c'est le niveau actuel
        const currentLevel = isCurrentTier(item.votes);

        // Vérifier si le niveau est verrouillé
        const isLocked = item.votes > normalizedUserVotes;

        // Obtenir l'icône spécifique au badge
        const iconName = getBadgeIcon(item.name, isLocked);

        // Créer un dégradé à partir de la couleur de fond
        const gradientColors: [string, string] = isLocked
          ? LOCKED_COLORS.gradient
          : createGradient(badgeStyle.backgroundColor || "#9E9E9E");

        // Couleurs pour les bordures et accents
        const accentColor = isLocked
          ? LOCKED_COLORS.primary
          : badgeStyle.borderColor ||
            badgeStyle.shadowColor ||
            badgeStyle.backgroundColor ||
            "#9E9E9E";

        // Calcul de l'angle de rotation pour l'animation
        const rotateStr = itemAnimations[index].rotate.interpolate({
          inputRange: [-2, 0],
          outputRange: ["-2deg", "0deg"],
        });

        return (
          <Animated.View
            style={[
              styles.tierCard,
              {
                opacity: itemAnimations[index].opacity,
                transform: [
                  { translateY: itemAnimations[index].translateY },
                  { scale: itemAnimations[index].scale },
                  { rotate: rotateStr },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={
                currentLevel
                  ? [
                      badgeStyle.backgroundColor + "20",
                      (badgeStyle.borderColor || badgeStyle.backgroundColor) +
                        "40",
                    ]
                  : isLocked
                  ? ["#F8F8F8", "#F2F2F2"]
                  : ["#FFFFFF", "#F9F9F9"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.cardGradient,
                currentLevel && [
                  styles.currentLevelCard,
                  {
                    borderColor: "#F8F8F8",
                    ...CIF.SHADOW.MEDIUM,
                  },
                ],
              ]}
            >
              {/* Badge de verrouillage - redesigné avec effet visuel */}
              {isLocked && (
                <LinearGradient
                  colors={["#9E9E9E", "#616161"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.lockedBadge}
                >
                  <MaterialCommunityIcons
                    name="lock"
                    size={12}
                    color={CIF.COLORS.WHITE}
                  />
                  <Text style={styles.lockedBadgeText}>VERROUILLÉ</Text>
                </LinearGradient>
              )}

              {/* Badge de niveau actuel - avec effet visuel */}
              {currentLevel && (
                <LinearGradient
                  colors={[accentColor, accentColor + "CC"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.currentBadge}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={8}
                    color={CIF.COLORS.WHITE}
                  />
                  <Text style={styles.currentBadgeText}>NIVEAU ACTUEL</Text>
                </LinearGradient>
              )}

              {/* Niveau et statut */}
              <View style={styles.tierHeader}>
                {/* Badge avec icône thématique */}
                <LinearGradient
                  colors={isLocked ? ["#E0E0E0", "#BDBDBD"] : gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.badgeCircle,
                    isLocked && styles.lockedBadgeCircle,
                  ]}
                >
                  {badgeStyle.icon ? (
                    <View>{badgeStyle.icon}</View>
                  ) : (
                    <MaterialCommunityIcons
                      name={iconName}
                      size={28}
                      color={isLocked ? "#9E9E9E" : "#fff"}
                      style={styles.badgeIcon}
                    />
                  )}
                </LinearGradient>

                <View style={styles.tierTitleContainer}>
                  <Text
                    style={[
                      styles.tierTitle,
                      isLocked
                        ? styles.lockedText
                        : currentLevel && { color: accentColor },
                    ]}
                  >
                    {badgeStyle.title}
                  </Text>

                  <View style={styles.badgeDetails}>
                    <View style={styles.votesContainer}>
                      <MaterialCommunityIcons
                        name="thumb-up"
                        size={14}
                        color={isLocked ? "#BBBBBB" : "#757575"}
                      />
                      <Text
                        style={[
                          styles.tierVotes,
                          isLocked && styles.lockedText,
                        ]}
                      >
                        {formatVotes(item.votes)} votes
                      </Text>
                    </View>

                    {renderStars(badgeStyle)}
                  </View>
                </View>
              </View>

              {/* Description du badge - avec typographie améliorée */}
              <Text
                style={[
                  styles.tierDescription,
                  isLocked
                    ? styles.lockedText
                    : currentLevel && { color: badgeStyle.textColor },
                ]}
              >
                {item.description}
              </Text>

              {/* Barre de progression - stylisée avec effet de profondeur */}
              {currentLevel && !progressInfo.isMaxLevel && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBackground}>
                    <LinearGradient
                      colors={[accentColor, accentColor + "CC"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.progressFill,
                        { width: `${progressInfo.progress}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.progressLabels}>
                    <Text
                      style={[
                        styles.nextLevelText,
                        { color: currentLevel ? accentColor : "#505050" },
                      ]}
                    >
                      Niveau suivant : {normalizedUserVotes}/
                      {progressInfo.votesNeeded + normalizedUserVotes} votes
                    </Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        );
      },
      [
        normalizedUserVotes,
        isCurrentTier,
        itemAnimations,
        progressInfo,
        formatVotes,
        renderStars,
        getBadgeStyles,
        getBadgeIcon,
        createGradient,
      ]
    );

    // Optimisations pour la FlatList
    const keyExtractor = useCallback((item: TierItem) => item.name, []);
    const ItemSeparator = memo(() => <View style={styles.separator} />);

    // Calculer le numéro de niveau en fonction de sa position dans le tableau
    const getLevelNumber = useCallback(() => {
      const tierIndex = tiers.findIndex(
        (tier) => tier.name === progressInfo.currentTier
      );
      return tierIndex === -1 ? 1 : tiers.length - tierIndex;
    }, [tiers, progressInfo]);

    // Ouvrir le modal d'information
    const toggleInfoModal = useCallback(() => {
      setInfoModalVisible((prev) => !prev);
    }, []);

    // Déterminer l'icône et les couleurs pour le niveau actuel
    const currentBadgeIcon = useMemo(
      () => getBadgeIcon(progressInfo.currentTier),
      [progressInfo.currentTier, getBadgeIcon]
    );

    // Créer le dégradé pour la section héro
    const heroGradientColors = useMemo<[string, string]>(() => {
      const mainColor = currentBadgeStyle.backgroundColor || CIF.COLORS.PRIMARY;
      const secondColor =
        currentBadgeStyle.borderColor ||
        currentBadgeStyle.shadowColor ||
        mainColor;
      return [mainColor, secondColor];
    }, [currentBadgeStyle]);

    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={visible}
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        {/* Backdrop avec flou */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacityAnim,
              zIndex: CIF.Z_INDEX.BACKDROP,
            },
          ]}
        >
          {Platform.OS === "ios" && (
            <BlurView
              intensity={25}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}
        </Animated.View>

        {/* Contenu du modal */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalOpacityAnim,
              transform: [{ scale: modalScaleAnim }],
              zIndex: CIF.Z_INDEX.MODAL_CONTAINER,
            },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                paddingTop: insets.top > 0 ? insets.top : 20,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
                zIndex: CIF.Z_INDEX.MODAL_CONTENT,
              },
            ]}
          >
            {/* Barre de fermeture du modal - avec animation subtile */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* En-tête du modal - avec ombre standardisée CIF */}
            <View
              style={[styles.headerContainer, { zIndex: CIF.Z_INDEX.HEADER }]}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={CIF.OPACITY.OVERLAY}
              >
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={24}
                  color={CIF.COLORS.DARK}
                />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Niveaux d'engagement</Text>

              <TouchableOpacity
                style={styles.infoButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                activeOpacity={CIF.OPACITY.OVERLAY}
                onPress={toggleInfoModal}
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={22}
                  color={CIF.COLORS.DARK}
                />
              </TouchableOpacity>
            </View>

            {/* Section héro animée - redesign complet avec animations fluides */}
            <Animated.View
              style={[
                styles.heroSection,
                {
                  transform: [
                    { translateY: heroTranslateY },
                    { scale: heroScale },
                  ],
                  opacity: heroOpacity,
                  zIndex: CIF.Z_INDEX.HERO,
                },
              ]}
            >
              <LinearGradient
                colors={heroGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                {/* Éléments de décoration pour renforcer l'effet visuel */}
                <View style={styles.heroDecoration}>
                  <View style={[styles.decorCircle, styles.decorCircle1]} />
                  <View style={[styles.decorCircle, styles.decorCircle2]} />
                  <View style={[styles.decorCircle, styles.decorCircle3]} />
                </View>

                <View style={styles.heroContent}>
                  <View style={styles.heroIconContainer}>
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.4)",
                        "rgba(255,255,255,0.15)",
                      ]}
                      style={styles.heroIconBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {currentBadgeStyle.icon ? (
                        <View>{currentBadgeStyle.icon}</View>
                      ) : (
                        <MaterialCommunityIcons
                          name={currentBadgeIcon}
                          size={44}
                          color={CIF.COLORS.WHITE}
                          style={styles.heroIcon}
                        />
                      )}
                    </LinearGradient>
                  </View>

                  <View style={styles.heroTextContainer}>
                    <Text style={styles.heroTitle}>
                      {currentBadgeStyle.title}
                    </Text>
                    {/* Barre de progression visuelle dans la section héro */}
                    {!progressInfo.isMaxLevel && (
                      <View style={styles.heroProgressContainer}>
                        <View style={styles.heroProgressBackground}>
                          <LinearGradient
                            colors={[
                              "rgba(255,255,255,0.9)",
                              currentBadgeStyle.starsColor
                                ? `${currentBadgeStyle.starsColor}99`
                                : "rgba(255,255,255,0.6)",
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.heroProgressFill,
                              { width: `${progressInfo.progress}%` },
                            ]}
                          />
                        </View>

                        {/* Texte de progression sous la barre */}
                        <Text style={styles.heroProgressText}>
                          Vous êtes à {progressInfo.progress}% ! Votez pour
                          atteindre {progressInfo.nextTier}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Liste des badges avec design modernisé */}
            <FlatList
              data={tiers}
              keyExtractor={keyExtractor}
              renderItem={renderTierItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={ItemSeparator}
              initialNumToRender={4}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={Platform.OS === "android"}
            />
          </View>
        </Animated.View>

        {/* Modal d'information - version améliorée */}
        <InfoModal visible={infoModalVisible} onClose={toggleInfoModal} />
      </Modal>
    );
  }
);

// Styles redesign complet avec CIF
const styles = StyleSheet.create({
  // ========== STRUCTURE MODALE PRINCIPALE ==========
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CIF.COLORS.BACKDROP,
  },
  modalContent: {
    backgroundColor: CIF.COLORS.WHITE,
    borderTopLeftRadius: CIF.BORDER_RADIUS.XLARGE,
    borderTopRightRadius: CIF.BORDER_RADIUS.XLARGE,
    maxHeight: height * 0.93,
    ...CIF.SHADOW.HEAVY,
  },

  // ========== POIGNÉE DE GLISSEMENT ==========
  dragHandleContainer: {
    alignItems: "center",
    marginBottom: CIF.SPACING.SMALL,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: CIF.BORDER_RADIUS.SMALL / 2,
  },

  // ========== EN-TÊTE DU MODAL ==========
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: CIF.SPACING.LARGE,
    paddingBottom: CIF.SPACING.LARGE - 2,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    ...CIF.SHADOW.LIGHT,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: CIF.COLORS.DARK,
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 10,
    borderRadius: CIF.BORDER_RADIUS.CIRCLE,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  infoButton: {
    padding: 10,
    borderRadius: CIF.BORDER_RADIUS.CIRCLE,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },

  // ========== SECTION HÉRO ==========
  heroSection: {
    marginHorizontal: CIF.SPACING.LARGE,
    marginVertical: CIF.SPACING.SMALL,
    borderRadius: CIF.BORDER_RADIUS.LARGE,
    overflow: "hidden",
    ...CIF.SHADOW.MEDIUM,
  },
  heroGradient: {
    padding: CIF.SPACING.LARGE,
    overflow: "hidden",
    position: "relative",
  },
  heroContent: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  heroDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
    zIndex: 1,
  },
  decorCircle: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: CIF.BORDER_RADIUS.CIRCLE,
  },
  decorCircle1: {
    width: 120,
    height: 120,
    top: -60,
    right: -30,
  },
  decorCircle2: {
    width: 80,
    height: 80,
    bottom: -40,
    left: 20,
  },
  decorCircle3: {
    width: 40,
    height: 40,
    top: 20,
    right: 60,
  },
  heroIconContainer: {
    marginRight: CIF.SPACING.LARGE,
  },
  heroIconBackground: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    ...CIF.SHADOW.MEDIUM,
  },
  heroIcon: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: CIF.COLORS.WHITE,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 20,
    marginBottom: 12,
  },
  heroProgressContainer: {
    marginTop: 8,
  },
  heroProgressBackground: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  heroProgressText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 6,
    textAlign: "center",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // ========== LISTE DES NIVEAUX ==========
  listContent: {
    paddingHorizontal: CIF.SPACING.LARGE,
    paddingBottom: CIF.SPACING.LARGE,
  },
  tierCard: {
    marginBottom: CIF.SPACING.MEDIUM,
    borderRadius: CIF.BORDER_RADIUS.LARGE,
    ...CIF.SHADOW.LIGHT,
  },
  cardGradient: {
    borderRadius: CIF.BORDER_RADIUS.LARGE,
    padding: CIF.SPACING.LARGE - 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
  },
  currentLevelCard: {
    borderWidth: 2,
  },

  // ========== BADGES ET INDICATEURS ==========
  currentBadge: {
    position: "absolute",
    top: 10,
    right: 14,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: CIF.BORDER_RADIUS.XLARGE,
    flexDirection: "row",
    alignItems: "center",
    ...CIF.SHADOW.LIGHT,
    zIndex: CIF.Z_INDEX.BADGE,
  },
  currentBadgeText: {
    fontSize: 6,
    fontWeight: "bold",
    color: CIF.COLORS.WHITE,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  lockedBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: CIF.BORDER_RADIUS.SMALL,
    flexDirection: "row",
    alignItems: "center",
    ...CIF.SHADOW.LIGHT,
    zIndex: CIF.Z_INDEX.BADGE,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: CIF.COLORS.WHITE,
    marginLeft: 5,
    letterSpacing: 0.5,
  },

  // ========== EN-TÊTE DES NIVEAUX ==========
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  badgeCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginRight: CIF.SPACING.MEDIUM,
    ...CIF.SHADOW.MEDIUM,
  },
  lockedBadgeCircle: {
    opacity: 0.7,
    ...CIF.SHADOW.LIGHT,
  },
  badgeIcon: {
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tierTitleContainer: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: CIF.COLORS.DARK,
  },

  // ========== DÉTAILS DES BADGES ==========
  badgeDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  votesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tierVotes: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 6,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 14,
  },
  starIcon: {
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tierDescription: {
    fontSize: 15,
    color: "#505050",
    marginBottom: 16,
    lineHeight: 22,
  },

  // ========== BARRE DE PROGRESSION ==========
  progressContainer: {
    marginTop: 4,
  },
  progressBackground: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  nextLevelText: {
    fontSize: 13,
    color: "#505050",
    fontWeight: "500",
  },

  // ========== DIVERS ==========
  separator: {
    height: CIF.SPACING.MEDIUM,
  },
  lockedText: {
    color: "#BBBBBB",
  },

  // ========== MODAL D'INFORMATION ==========
  infoModalBackdrop: {
    flex: 1,
    backgroundColor: CIF.COLORS.BACKDROP,
    justifyContent: "center",
    alignItems: "center",
  },
  infoModalContainer: {
    width: width * 0.85,
    backgroundColor: CIF.COLORS.WHITE,
    borderRadius: CIF.BORDER_RADIUS.LARGE,
    overflow: "hidden",
    ...CIF.SHADOW.HEAVY,
  },
  infoModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: CIF.SPACING.LARGE,
    paddingVertical: CIF.SPACING.MEDIUM,
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: CIF.COLORS.DARK,
  },
  infoModalCloseButton: {
    padding: 8,
    borderRadius: CIF.BORDER_RADIUS.CIRCLE,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  infoModalContent: {
    marginTop:40,
    margin: CIF.SPACING.XLARGE,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: CIF.SPACING.LARGE,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...CIF.SHADOW.LIGHT,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: CIF.COLORS.DARK,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  infoModalButtonGradient: {
    marginHorizontal: CIF.SPACING.LARGE,
    marginBottom: CIF.SPACING.LARGE,
    borderRadius: CIF.BORDER_RADIUS.MEDIUM,
    ...CIF.SHADOW.MEDIUM,
  },
  infoModalButton: {
    padding: CIF.SPACING.MEDIUM,
    borderRadius: CIF.BORDER_RADIUS.MEDIUM,
    alignItems: "center",
  },
  infoModalButtonText: {
    color: CIF.COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default BadgeModal; // src/components/home/modals/BadgeModal.tsx
