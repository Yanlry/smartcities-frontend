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
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  TouchableWithoutFeedback,
  Easing,
  Image,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBadge } from "../../../hooks/ui/useBadge";
import * as Haptics from 'expo-haptics';
import { SharedElement } from 'react-navigation-shared-element';
import { BadgeStyle } from "../../../types/entities/user.types";

const { height, width } = Dimensions.get("window");
const IS_IOS = Platform.OS === 'ios';

/**
 * Types pour les icônes de MaterialCommunityIcons
 */
type MaterialIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>["name"];

/**
 * Interface pour les éléments de la liste des niveaux
 */
interface TierItem {
  name: string;
  description: string;
  votes: number;
}

/**
 * Interface pour les propriétés du modal de badge
 */
interface BadgeModalProps {
  visible: boolean;
  onClose: () => void;
  userVotes?: number;
}

/**
 * Interface pour les informations de progression
 */
interface ProgressInfo {
  currentTier: string;
  nextTier: string | null;
  votesNeeded: number;
  progress: number;
  isMaxLevel: boolean;
}

/**
 * Interface pour les propriétés du modal d'information
 */
interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  getBadgeStyles: (votes: number) => BadgeStyle;
  colorScheme: ColorScheme;
}

/**
 * Interface pour les propriétés du chemin d'engagement
 */
interface ProgressPathProps {
  tiers: TierItem[];
  currentTierIndex: number;
  onSelectTier: (index: number) => void;
  scrollRef: React.RefObject<ScrollView>;
  getBadgeStyles: (votes: number) => BadgeStyle;
  colorScheme: ColorScheme;
}

/**
 * Interface pour les propriétés de la carte de niveau
 */
interface TierCardProps {
  tier: TierItem;
  index: number;
  currentTier: boolean;
  progress: number;
  userVotes: number;
  nextTierVotes: number;
  getBadgeStyles: (votes: number) => BadgeStyle;
  colorScheme: ColorScheme;
}

/**
 * Interface pour la palette de couleurs du thème
 */
interface ColorScheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  divider: string;
  glassBackground: string;
  glassOverlay: string;
}

/**
 * Système de design avancé - UltraModern™
 * Architecture permettant le theming global et les ajustements contextuels
 */
const DesignTokens = {
  // Espacement
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Rayons
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999,
  },
  
  // Élévations
  elevation: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    micro: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 8,
    },
    focus: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    }),
  },
  
  // Typographie
  typography: {
    size: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      display: 32,
    },
    weight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },
    family: {
      base: Platform.select({ ios: 'System', android: 'Roboto' }),
      accent: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      superWide: 1,
    },
  },
  
  // Animations
  animation: {
    duration: {
      instant: 150,
      fast: 250,
      normal: 350,
      slow: 500,
      verySlow: 700,
    },
    easing: {
      standard: Easing.bezier(0.4, 0.0, 0.2, 1),
      decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
      accelerate: Easing.bezier(0.4, 0.0, 1, 1),
      sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
      elastic: Easing.elastic(1),
      bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    },
    springs: {
      gentle: {
        friction: 10,
        tension: 50,
      },
      wobble: {
        friction: 8,
        tension: 200,
      },
      stiff: {
        friction: 30,
        tension: 300,
      },
    },
  },
  
  // Effets
  effects: {
    glassMorphism: {
      light: {
        intensity: 40,
        tint: 'light' as const,
        opacity: 0.5,
      },
      medium: {
        intensity: 60,
        tint: 'light' as const,
        opacity: 0.7,
      },
      dark: {
        intensity: 80,
        tint: 'dark' as const,
        opacity: 0.8,
      },
    },
    gradient: {
      primary: ['#2E5BFF', '#1E40AF'],
      success: ['#22C55E', '#16A34A'],
      warning: ['#F59E0B', '#D97706'],
      error: ['#EF4444', '#DC2626'],
      cool: ['#00C6A7', '#00A3C4'],
      warm: ['#F97316', '#DB2777'],
      backdrop: ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)'],
      glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'],
    },
  },
  
  // Opacité
  opacity: {
    none: 0,
    subtle: 0.1,
    light: 0.25,
    medium: 0.5,
    high: 0.8,
    full: 1,
  },
  
  // Z-Index
  zIndex: {
    base: 0,
    content: 10,
    overlay: 100,
    modal: 1000,
    toast: 2000,
  },
};

/**
 * Palette moderne de couleurs
 * Définie par un système de thème cohérent
 */
const createColorScheme = (primaryColor: string): ColorScheme => {
  // Calculer des variantes de la couleur primaire
  const primaryLight = addAlpha(primaryColor, 0.2);
  const primaryDark = adjustColorBrightness(primaryColor, -0.2);

  return {
    primary: primaryColor,
    primaryLight: primaryLight,
    primaryDark: primaryDark,
    secondary: '#38BDF8',
    secondaryLight: '#BAE6FD',
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F1F5F9',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF',
    },
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#38BDF8',
    divider: '#E2E8F0',
    glassBackground: 'rgba(255, 255, 255, 0.6)',
    glassOverlay: 'rgba(255, 255, 255, 0.1)',
  };
};

/**
 * Ajuste la luminosité d'une couleur
 * @param hex Code hexadécimal de la couleur
 * @param percent Pourcentage d'ajustement (-1.0 à 1.0)
 */
const adjustColorBrightness = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent * 100);
  
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 + 
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  ).toString(16).slice(1);
};

/**
 * Ajoute une transparence à une couleur
 * @param hex Code hexadécimal de la couleur
 * @param alpha Valeur de transparence (0-1)
 */
const addAlpha = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Convertit une ombre en dégradé linéaire pour les appareils Android
 * qui n'ont pas de bonne prise en charge des ombres
 */
const createShadowGradient = (color: string, intensity: number = 0.1) => {
  return IS_IOS ? null : (
    <LinearGradient
      style={StyleSheet.absoluteFill}
      colors={[addAlpha(color, intensity), 'transparent']}
      start={{ x: 0.5, y: 1 }}
      end={{ x: 0.5, y: 0 }}
    />
  );
};

/**
 * Carte des icônes pour chaque niveau de badge - Redesign moderne
 * Utilise des icônes plus emblématiques et distinctives
 */
const BADGE_ICONS: Record<string, MaterialIconName> = {
  "Premiers pas": "school-outline",
  "Apprenti citoyen": "shield-account",
  "Citoyen de confiance": "shield-check",
  "Ambassadeur du quartier": "shield-star",
  "Héros du quotidien": "shield-crown",
  "Icône locale": "crown",
  "Légende urbaine": "crown-circle",
  DEFAULT: "trophy-award",
};

/**
 * Nouvelle animation - effet de rebond
 * Crée un effet visuel captivant pour les éléments importants
 */
const usePulseAnimation = (initialDelay: number = 0) => {
  const scale = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.delay(initialDelay),
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 300,
          easing: DesignTokens.animation.easing.elastic,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: DesignTokens.animation.easing.elastic,
          useNativeDriver: true,
        }),
      ]);
    };
    
    // Animation en boucle avec délai aléatoire entre les pulsations
    const startPulseLoop = () => {
      const randomDelay = Math.random() * 3000 + 2000;
      const pulseAnimation = createPulseAnimation();
      
      pulseAnimation.start(() => {
        setTimeout(startPulseLoop, randomDelay);
      });
    };
    
    startPulseLoop();
    
    return () => {
      scale.stopAnimation();
    };
  }, [scale, initialDelay]);
  
  return scale;
};

/**
 * Composant ParticleEffect - Effet de particules flottantes
 * Ajoute un effet visuel élégant pour les niveaux supérieurs
 */
const ParticleEffect = memo(({ color, intensity = 1 }: { color: string, intensity?: number }) => {
  const particles = useMemo(() => {
    const count = Math.floor(intensity * 15);
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 4 + 2;
      const animation = new Animated.Value(0);
      const x = Math.random() * width;
      const y = Math.random() * height * 0.5;
      const duration = Math.random() * 8000 + 8000;
      return { id: i, size, x, y, animation, duration };
    });
  }, [intensity, color]);
  
  useEffect(() => {
    particles.forEach(particle => {
      Animated.loop(
        Animated.timing(particle.animation, {
          toValue: 1,
          duration: particle.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    });
    
    return () => {
      particles.forEach(particle => {
        particle.animation.stopAnimation();
      });
    };
  }, [particles]);
  
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(particle => {
        const translateY = particle.animation.interpolate({
          inputRange: [0, 1],
          outputRange: [particle.y, particle.y - height * 0.2],
        });
        
        const translateX = particle.animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [particle.x, particle.x + 15 * (Math.random() - 0.5), particle.x],
        });
        
        const opacity = particle.animation.interpolate({
          inputRange: [0, 0.2, 0.8, 1],
          outputRange: [0, 0.5, 0.5, 0],
        });
        
        return (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                backgroundColor: addAlpha(color, 0.7),
                transform: [{ translateX }, { translateY }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

/**
 * Composant de chemin d'engagement - version premium
 * Expérience utilisateur améliorée avec effets visuels élégants et système d'étoiles
 */
const ProgressPath = memo(({ 
  tiers, 
  currentTierIndex,
  onSelectTier,
  scrollRef,
  getBadgeStyles,
  colorScheme
}: ProgressPathProps) => {
  // Animation de pulsation pour le niveau actuel
  const pulseAnimation = usePulseAnimation(500);
  
  // Animations pour les transitions entre niveaux
  const animatedValues = useRef<Animated.Value[]>([]).current;
  const starAnimations = useRef<Animated.Value[]>([]).current;
  
  // Initialisation des animations
  useEffect(() => {
    if (animatedValues.length === 0 && tiers.length > 0) {
      // Créer une valeur animée pour chaque niveau
      tiers.forEach(() => {
        animatedValues.push(new Animated.Value(0));
        starAnimations.push(new Animated.Value(0));
      });
      
      // Animer séquentiellement les points du chemin
      const pointAnimations = animatedValues.map((value, i) => {
        return Animated.timing(value, {
          toValue: 1,
          duration: DesignTokens.animation.duration.normal,
          delay: 300 + i * 120,
          easing: DesignTokens.animation.easing.bounce,
          useNativeDriver: true,
        });
      });
      
      // Animer les étoiles avec un décalage supplémentaire
      const starsAnimations = starAnimations.map((value, i) => {
        return Animated.timing(value, {
          toValue: 1,
          duration: DesignTokens.animation.duration.normal,
          delay: 600 + i * 80,
          easing: DesignTokens.animation.easing.decelerate,
          useNativeDriver: true,
        });
      });
      
      Animated.stagger(50, pointAnimations).start();
      Animated.stagger(30, starsAnimations).start();
    }
  }, [tiers, animatedValues, starAnimations]);

  // Faire défiler automatiquement à l'affichage
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        const itemWidth = 100; // largeur approximative d'un élément
        const scrollToX = Math.max(0, currentTierIndex * itemWidth - width / 2 + itemWidth);
        scrollRef.current?.scrollTo({ x: scrollToX, animated: true });
      }, 400);
    }
  }, [currentTierIndex, scrollRef]);

  // Trier les niveaux par nombre de votes (du plus petit au plus grand)
  const sortedTiers = useMemo(() => {
    return [...tiers].sort((a, b) => a.votes - b.votes);
  }, [tiers]);

  /**
   * Obtenir la couleur pour un niveau spécifique en utilisant le hook useBadge
   * Nous retournons toujours la vraie couleur, même pour les niveaux verrouillés
   */
  const getTierColor = useCallback((index: number, forceOriginal: boolean = false) => {
    const tierVotes = sortedTiers[index].votes;
    const badgeStyle = getBadgeStyles(tierVotes);
    return badgeStyle.backgroundColor;
  }, [sortedTiers, getBadgeStyles]);
  
  /**
   * Renvoie le nombre d'étoiles pour un niveau donné
   */
  const getTierStars = useCallback((index: number): number => {
    // Nous supposons que le hook useBadge renvoie un nombre d'étoiles dans badgeStyle
    // Sinon, nous calculons un nombre d'étoiles basé sur l'index
    const tierVotes = sortedTiers[index].votes;
    const badgeStyle = getBadgeStyles(tierVotes);
    
    // Si les étoiles sont définies dans le style du badge, utilisez-les
    if (badgeStyle.stars !== undefined) {
      return badgeStyle.stars;
    }
    
    // Sinon, calcul basé sur l'index (0 à 5 étoiles)
    return Math.min(5, Math.max(0, index));
  }, [sortedTiers, getBadgeStyles]);
  
  // Effet de feedback tactile lors de la sélection
  const handleTierPress = useCallback((index: number) => {
    // Vibration subtile au toucher
    if (IS_IOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onSelectTier(index);
  }, [onSelectTier]);

  const renderStars = useCallback((index: number, tierColor: string, isLocked: boolean) => {
    const starCount = getTierStars(index);
    const starSize = 10;
    const starOpacity = isLocked ? 0.5 : 1;
    const starColor = tierColor;
    
    // Animation de décalage pour l'entrée des étoiles
    const starAnimation = starAnimations[index] || new Animated.Value(1);
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(5)].map((_, i) => {
          const isActive = i < starCount;
          
          return (
            <Animated.View 
              key={`star-${index}-${i}`}
              style={{
                opacity: starAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, isActive ? starOpacity : 0.3]
                }),
                transform: [
                  { scale: starAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  }) },
                  { translateY: starAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, 0]
                  }) }
                ]
              }}
            >
              <MaterialCommunityIcons
                name={isActive ? "star" : "star-outline"}
                size={starSize}
                color={isActive ? starColor : addAlpha(starColor, 0.4)}
                style={{ marginHorizontal: 1 }}
              />
            </Animated.View>
          );
        })}
      </View>
    );
  }, [getTierStars, starAnimations]);

  return (
    <View style={styles.pathContainer}>
      {/* Ligne de progression */}
      <View style={styles.progressLine} />
      
      {/* Points animés sur la ligne */}
      <View style={styles.pointsContainer}>
        {sortedTiers.map((tier, index) => {
          const isCurrentTier = index === currentTierIndex;
          const isPassedTier = index < currentTierIndex;
          const isLockedTier = index > currentTierIndex;
          
          // On obtient toujours la couleur réelle du badge, même pour les niveaux verrouillés
          const realTierColor = getTierColor(index, true);
          // Pour le badge lui-même, on utilise une version grisée si verrouillé
          const displayColor = isLockedTier ? colorScheme.text.tertiary : realTierColor;
          
          // Facteur d'échelle animé
          const scale = isCurrentTier 
            ? pulseAnimation 
            : animatedValues[index] || new Animated.Value(1);
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleTierPress(index)}
              activeOpacity={0.8}
              style={styles.pointWrapper}
            >
              <Animated.View 
                style={[
                  styles.progressPoint,
                  { 
                    backgroundColor: displayColor,
                    transform: [{ scale }]
                  },
                  isCurrentTier && styles.currentPoint,
                ]}
              >
                {isCurrentTier && (
                  <Animated.View 
                    style={[
                      styles.pointRing,
                      { 
                        borderColor: realTierColor,
                        transform: [{ scale: Animated.add(scale, new Animated.Value(-0.1)) }]
                      }
                    ]} 
                  />
                )}
                {isCurrentTier && (
                  <Animated.View 
                    style={[
                      styles.pointRingOuter,
                      { 
                        borderColor: addAlpha(realTierColor, 0.3),
                        transform: [{ scale: Animated.add(scale, new Animated.Value(-0.2)) }]
                      }
                    ]} 
                  />
                )}
                
                {/* Distinction visuelle pour les badges débloqués */}
                {isPassedTier && (
                  <LinearGradient
                    colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)']}
                    style={styles.unlockedBadgeEffect}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                )}
                
                <MaterialCommunityIcons
                  name={isPassedTier ? "check" : isLockedTier ? "lock-outline" : (BADGE_ICONS[tier.name] || BADGE_ICONS.DEFAULT)}
                  size={isCurrentTier ? 16 : 14}
                  color={colorScheme.text.inverse}
                />
                
                {/* Effet de reflet pour les badges débloqués */}
                {!isLockedTier && (
                  <View style={styles.badgeShine} />
                )}
              </Animated.View>
              
              {/* Étoiles sous chaque badge */}
              {renderStars(index, realTierColor, isLockedTier)}
              
              <Animated.Text 
                style={[
                  styles.pointLabel,
                  { 
                    opacity: animatedValues[index] || 1,
                    transform: [{ translateY: (animatedValues[index] || new Animated.Value(1)).interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0],
                    }) }]
                  },
                  isCurrentTier && styles.currentLabel,
                  isLockedTier && styles.lockedLabel,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {tier.name}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

/**
 * Carte détaillée du niveau - version premium
 * Interface élégante avec effets visuels modernes
 */
const TierCard = memo(({
  tier,
  index,
  currentTier,
  progress,
  userVotes,
  nextTierVotes,
  getBadgeStyles,
  colorScheme
}: TierCardProps) => {
  // Récupérer les couleurs du badge à partir du hook
  const badgeStyle = useMemo(() => getBadgeStyles(tier.votes), [tier.votes, getBadgeStyles]);
  const tierColor = currentTier ? badgeStyle.backgroundColor : colorScheme.text.tertiary;
  const textColor = badgeStyle.textColor || colorScheme.text.primary;
  
  // Animation de progression
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (currentTier) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: DesignTokens.animation.duration.slow,
        delay: 600,
        easing: DesignTokens.animation.easing.decelerate,
        useNativeDriver: false, // Nécessaire pour animer la largeur en %
      }).start();
    }
  }, [progress, currentTier, progressAnim]);
  
  // Calculer l'intensité des particules en fonction du niveau
  const particleIntensity = useMemo(() => {
    const tierIndex = tier.name.includes("Légende") ? 7 :
                      tier.name.includes("Icône") ? 6 :
                      tier.name.includes("Héros") ? 5 :
                      tier.name.includes("Ambassadeur") ? 4 :
                      tier.name.includes("Citoyen") ? 3 :
                      tier.name.includes("Apprenti") ? 2 : 1;
    
    return Math.max(0, tierIndex - 2) / 5;
  }, [tier.name]);
  
  return (
    <View style={styles.tierCardWrapper}>
      {/* Effets de particules pour les niveaux élevés */}
      {particleIntensity > 0 && currentTier && (
        <ParticleEffect color={tierColor} intensity={particleIntensity} />
      )}
      
      {/* Carte avec effet de verre */}
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.tierCard,
          { borderColor: currentTier ? addAlpha(tierColor, 0.3) : colorScheme.divider }
        ]}
      >
        {createShadowGradient(tierColor, 0.05)}
        
        <View style={styles.tierHeader}>
          <View 
            style={[
              styles.tierIconContainer,
              { backgroundColor: tierColor }
            ]}
          >
            <MaterialCommunityIcons
              name={BADGE_ICONS[tier.name] || BADGE_ICONS.DEFAULT}
              size={24}
              color={colorScheme.text.inverse}
            />
            
            {/* Effet de brillance sur l'icône */}
            <View style={styles.iconShine} />
          </View>
          
          <View style={styles.tierTitleContainer}>
            <Text style={[styles.tierTitle, { color: colorScheme.text.primary }]}>
              {tier.name}
            </Text>
            <View style={styles.tierStatsRow}>
              <MaterialCommunityIcons
                name="thumb-up-outline"
                size={14}
                color={colorScheme.text.tertiary}
              />
              <Text style={[styles.tierStats, { color: colorScheme.text.tertiary }]}>
                {tier.votes} votes requis
              </Text>
            </View>
          </View>
          
          {currentTier && (
            <LinearGradient
              colors={[tierColor, adjustColorBrightness(tierColor, -0.1)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.currentBadge}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={12}
                color={colorScheme.text.inverse}
              />
              <Text style={styles.currentBadgeText}>NIVEAU ACTUEL</Text>
            </LinearGradient>
          )}
        </View>
        
        {currentTier && (
          <>
            <Text style={[styles.tierRange, { color: colorScheme.text.secondary }]}>
              {tier.votes} à {nextTierVotes - 1} votes
            </Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: tierColor 
                    }
                  ]}
                >
                  {/* Effet de brillance sur la barre de progression */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.4)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Animated.Text 
                style={[
                  styles.progressText, 
                  { 
                    color: tierColor,
                    opacity: progressAnim 
                  }
                ]}
              >
                {`${Math.round(progress)}%`}
              </Animated.Text>
            </View>
            
            <Text style={[styles.tierDescription, { color: colorScheme.text.secondary }]}>
              {tier.description || "Premiers pas dans l'engagement citoyen. Votez sur les signalements pour progresser."}
            </Text>

            {/* Badge de niveau suivant - aperçu */}
            {!tier.name.includes("Légende") && (
              <View style={styles.nextLevelPreview}>
                <Text style={[styles.nextLevelLabel, { color: colorScheme.text.tertiary }]}>
                  Prochain niveau
                </Text>
                <View style={styles.nextLevelBadgeContainer}>
                  <View 
                    style={[
                      styles.nextLevelIcon,
                      { borderColor: addAlpha(tierColor, 0.3) }
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={BADGE_ICONS[tierColor.includes("Légende") ? "Légende urbaine" : tier.name === "Icône locale" ? "Légende urbaine" : tier.name === "Héros du quotidien" ? "Icône locale" : tier.name === "Ambassadeur du quartier" ? "Héros du quotidien" : tier.name === "Citoyen de confiance" ? "Ambassadeur du quartier" : tier.name === "Apprenti citoyen" ? "Citoyen de confiance" : "Apprenti citoyen"] || BADGE_ICONS.DEFAULT}
                      size={18}
                      color={addAlpha(tierColor, 0.5)}
                    />
                  </View>
                  <LinearGradient
                    colors={[addAlpha(tierColor, 0.1), 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextLevelProgress}
                  >
                    <Text style={[styles.nextLevelVotes, { color: colorScheme.text.tertiary }]}>
                      Encore {nextTierVotes - userVotes} votes
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            )}
          </>
        )}
      </LinearGradient>
    </View>
  );
});

/**
 * Modal d'information - version premium
 * Interface moderne avec animations élégantes et effets visuels
 */
const InfoModal = memo(({ visible, onClose, getBadgeStyles, colorScheme }: InfoModalProps) => {
  // Animations
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef<Animated.Value[]>([]).current;
  
  // Initialisation des animations de cartes
  useEffect(() => {
    if (cardAnimations.length === 0) {
      [0, 1, 2].forEach(() => {
        cardAnimations.push(new Animated.Value(0));
      });
    }
  }, [cardAnimations]);
  
  /**
   * Obtenir la couleur pour un niveau spécifique en utilisant le hook useBadge
   */
  const getTierColor = useCallback((index: number) => {
    // Les votes des niveaux de référence pour les couleurs des infos
    const referenceVotes = [250, 100, 50]; // Un échantillon de valeurs pour différentes couleurs
    return getBadgeStyles(referenceVotes[index % referenceVotes.length]).backgroundColor;
  }, [getBadgeStyles]);
  
  // Animation d'entrée/sortie
  useEffect(() => {
    if (visible) {
      // Animation d'entrée séquentielle
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: DesignTokens.animation.duration.normal,
          easing: DesignTokens.animation.easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: DesignTokens.animation.duration.normal,
          easing: DesignTokens.animation.easing.bounce,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animation des cartes d'information
        Animated.stagger(120, cardAnimations.map(anim => 
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 80,
            useNativeDriver: true,
          })
        )).start();
      });
    } else {
      // Animation de sortie rapide
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: DesignTokens.animation.duration.fast,
          easing: DesignTokens.animation.easing.accelerate,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height,
          duration: DesignTokens.animation.duration.fast,
          easing: DesignTokens.animation.easing.accelerate,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Réinitialiser les animations des cartes
        cardAnimations.forEach(anim => anim.setValue(0));
      });
    }
  }, [visible, opacity, translateY, cardAnimations]);

  // Effet de feedback tactile
  const handleButtonPress = useCallback(() => {
    // Vibration au toucher
    if (IS_IOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    onClose();
  }, [onClose]);

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
            styles.modalBackdrop,
            { opacity },
          ]}
        >
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.infoModalContainer,
                {
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            >
              <BlurView
                intensity={90}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                style={StyleSheet.absoluteFill}
              />
              
              <View style={styles.infoModalHeader}>
                <Text style={[styles.infoModalTitle, { color: colorScheme.text.primary }]}>
                  Comment progresser ?
                </Text>
                <TouchableOpacity
                  style={styles.infoModalCloseButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={22}
                    color={colorScheme.text.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.infoModalContent}>
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
                ].map((item, index) => {
                  const cardColor = getTierColor(index);
                  
                  return (
                    <Animated.View 
                      key={index} 
                      style={[
                        styles.infoItem,
                        {
                          opacity: cardAnimations[index] || 1,
                          transform: [
                            { scale: (cardAnimations[index] || new Animated.Value(1)) },
                            { translateY: (cardAnimations[index] || new Animated.Value(1)).interpolate({
                              inputRange: [0, 1],
                              outputRange: [20, 0],
                            }) }
                          ]
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={[addAlpha(cardColor, 0.1), addAlpha(cardColor, 0.05)]}
                        style={[
                          styles.infoItemGradient,
                          { borderColor: addAlpha(cardColor, 0.3) }
                        ]}
                      >
                        <View 
                          style={[
                            styles.infoIconContainer,
                            { 
                              backgroundColor: addAlpha(cardColor, 0.15) 
                            }
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={item.icon}
                            size={20}
                            color={cardColor}
                          />
                          
                          {/* Effet de brillance sur l'icône */}
                          <View style={styles.infoIconShine} />
                        </View>
                        <View style={styles.infoTextContainer}>
                          <Text style={[styles.infoTitle, { color: colorScheme.text.primary }]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.infoDescription, { color: colorScheme.text.secondary }]}>
                            {item.description}
                          </Text>
                        </View>
                      </LinearGradient>
                    </Animated.View>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[
                  styles.infoModalButton,
                  { 
                    backgroundColor: getBadgeStyles(250).backgroundColor,
                    ...DesignTokens.elevation.medium,
                  }
                ]}
                onPress={handleButtonPress}
                activeOpacity={0.9}
              >
                {/* Effet de gradient sur le bouton */}
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                
                <Text style={styles.infoModalButtonText}>J'ai compris</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

/**
 * BadgeModal - Composant principal version premium
 * Expérience utilisateur exceptionnelle avec animations et effets visuels
 */
const BadgeModal: React.FC<BadgeModalProps> = memo(
  ({ visible, onClose, userVotes = 0 }) => {
    // État pour le modal d'information
    const [infoModalVisible, setInfoModalVisible] = useState<boolean>(false);
    // État pour le niveau sélectionné
    const [selectedTierIndex, setSelectedTierIndex] = useState<number>(0);
    
    // Référence pour le ScrollView
    const scrollViewRef = useRef<ScrollView>(null);

    // Normaliser les votes de l'utilisateur
    const normalizedUserVotes = useMemo(() => {
      const votesAsNumber = typeof userVotes === "string" ? parseInt(userVotes, 10) : userVotes;
      return Number.isNaN(votesAsNumber) ? 0 : Math.max(0, votesAsNumber);
    }, [userVotes]);

    // Hooks pour les données de badge
    const { getBadgeStyles, tiers, getProgressInfo } = useBadge();
    const insets = useSafeAreaInsets();

    // Infos de progression
    const progressInfo = useMemo<ProgressInfo>(
      () => getProgressInfo(normalizedUserVotes),
      [normalizedUserVotes, getProgressInfo]
    );

    // Trier les niveaux par votes requis
    const sortedTiers = useMemo(() => {
      return [...tiers].sort((a, b) => a.votes - b.votes);
    }, [tiers]);

    // Trouver l'index du niveau actuel
    const currentTierIndex = useMemo(() => {
      return sortedTiers.findIndex(tier => tier.name === progressInfo.currentTier);
    }, [sortedTiers, progressInfo.currentTier]);

    // Obtenir la couleur du thème principal basée sur le niveau actuel
    const primaryColor = useMemo(() => {
      const currentTier = sortedTiers[currentTierIndex];
      if (currentTier) {
        return getBadgeStyles(currentTier.votes).backgroundColor;
      }
      return "#4A8FFF"; // Couleur par défaut si aucun niveau trouvé
    }, [sortedTiers, currentTierIndex, getBadgeStyles]);
    
    // Créer le schéma de couleurs basé sur le niveau actuel
    const colorScheme = useMemo(() => {
      return createColorScheme(primaryColor);
    }, [primaryColor]);

    // Animations du modal
    const modalScaleAnim = useRef(new Animated.Value(0.90)).current;
    const modalOpacityAnim = useRef(new Animated.Value(0)).current;
    const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
    const titleTranslateY = useRef(new Animated.Value(-20)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;

    // Animation d'entrée/sortie du modal
    useEffect(() => {
      if (visible) {
        // Initialiser le niveau sélectionné au niveau actuel
        setSelectedTierIndex(currentTierIndex);
        
        // Animation d'ouverture
        Animated.sequence([
          // Affichage du backdrop
          Animated.timing(backdropOpacityAnim, {
            toValue: 1,
            duration: DesignTokens.animation.duration.normal,
            easing: DesignTokens.animation.easing.decelerate,
            useNativeDriver: true,
          }),
          
          // Entrée du modal avec effet élastique
          Animated.parallel([
            Animated.spring(modalScaleAnim, {
              toValue: 1,
              friction: 8,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.timing(modalOpacityAnim, {
              toValue: 1,
              duration: DesignTokens.animation.duration.normal,
              easing: DesignTokens.animation.easing.standard,
              useNativeDriver: true,
            }),
          ]),
          
          // Animation du titre
          Animated.parallel([
            Animated.timing(titleTranslateY, {
              toValue: 0,
              duration: DesignTokens.animation.duration.normal,
              easing: DesignTokens.animation.easing.standard,
              useNativeDriver: true,
            }),
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: DesignTokens.animation.duration.normal,
              easing: DesignTokens.animation.easing.standard,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        // Animation de fermeture
        Animated.parallel([
          Animated.timing(backdropOpacityAnim, {
            toValue: 0,
            duration: DesignTokens.animation.duration.fast,
            easing: DesignTokens.animation.easing.accelerate,
            useNativeDriver: true,
          }),
          Animated.timing(modalScaleAnim, {
            toValue: 0.9,
            duration: DesignTokens.animation.duration.fast,
            easing: DesignTokens.animation.easing.accelerate,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacityAnim, {
            toValue: 0,
            duration: DesignTokens.animation.duration.fast,
            easing: DesignTokens.animation.easing.accelerate,
            useNativeDriver: true,
          }),
          // Réinitialiser l'animation du titre
          Animated.timing(titleTranslateY, {
            toValue: -20,
            duration: DesignTokens.animation.duration.fast,
            easing: DesignTokens.animation.easing.accelerate,
            useNativeDriver: true,
          }),
          Animated.timing(titleOpacity, {
            toValue: 0,
            duration: DesignTokens.animation.duration.fast,
            easing: DesignTokens.animation.easing.accelerate,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [visible, backdropOpacityAnim, modalScaleAnim, modalOpacityAnim, titleTranslateY, titleOpacity, currentTierIndex]);

    // Sélectionner un niveau
    const handleSelectTier = useCallback((index: number) => {
      // Feedback tactile
      if (IS_IOS) {
        Haptics.selectionAsync();
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      setSelectedTierIndex(index);
    }, []);

    // Ouvrir le modal d'information
    const toggleInfoModal = useCallback(() => {
      // Feedback tactile
      if (IS_IOS) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      setInfoModalVisible((prev) => !prev);
    }, []);

    // Fermer le modal
    const handleClose = useCallback(() => {
      // Feedback tactile
      if (IS_IOS) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      onClose();
    }, [onClose]);

    // Trouver les votes requis pour le prochain niveau
    const nextTierVotes = useMemo(() => {
      if (currentTierIndex < sortedTiers.length - 1) {
        return sortedTiers[currentTierIndex + 1].votes;
      }
      return sortedTiers[currentTierIndex].votes * 2; // Estimation si c'est le dernier niveau
    }, [sortedTiers, currentTierIndex]);

    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={visible}
        statusBarTranslucent={true}
        onRequestClose={handleClose}
      >
        {/* Backdrop avec effet de flou */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacityAnim },
          ]}
        >
          <BlurView
            intensity={90}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Contenu du modal avec effet de verre */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: modalOpacityAnim,
              transform: [{ scale: modalScaleAnim }],
              marginTop: insets.top + DesignTokens.spacing.xl,
              marginBottom: insets.bottom + DesignTokens.spacing.xl,
              ...DesignTokens.elevation.medium,
            },
          ]}
        >
          {/* Effet de verre */}
          <BlurView
            intensity={80}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
          
          {/* Gradient de fond */}
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: DesignTokens.radius.lg }
            ]}
          />
          
          {/* En-tête */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: addAlpha(colorScheme.text.primary, 0.05) }
              ]}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colorScheme.text.secondary}
              />
            </TouchableOpacity>
            
            <Animated.Text 
              style={[
                styles.modalTitle,
                { 
                  color: colorScheme.text.primary,
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }]
                }
              ]}
            >
              Parcours d'engagement
            </Animated.Text>
            
            <TouchableOpacity
              style={[
                styles.infoButton,
                { backgroundColor: addAlpha(colorScheme.text.primary, 0.05) }
              ]}
              onPress={toggleInfoModal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="information-outline"
                size={22}
                color={colorScheme.text.secondary}
              />
            </TouchableOpacity>
          </View>
          
          {/* Parcours horizontal */}
          <ScrollView
            horizontal
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <ProgressPath
              tiers={sortedTiers}
              currentTierIndex={currentTierIndex}
              onSelectTier={handleSelectTier}
              scrollRef={scrollViewRef}
              getBadgeStyles={getBadgeStyles}
              colorScheme={colorScheme}
            />
          </ScrollView>
          
          {/* Carte du niveau */}
          <View style={styles.cardContainer}>
            <TierCard
              tier={sortedTiers[selectedTierIndex]}
              index={selectedTierIndex}
              currentTier={selectedTierIndex === currentTierIndex}
              progress={progressInfo.progress}
              userVotes={normalizedUserVotes}
              nextTierVotes={nextTierVotes}
              getBadgeStyles={getBadgeStyles}
              colorScheme={colorScheme}
            />
          </View>
          
          {/* Citation */}
          <View style={[
            styles.quoteContainer, 
            { 
              backgroundColor: addAlpha(primaryColor, 0.05),
              borderLeftColor: primaryColor 
            }
          ]}>
            <Text style={[styles.quoteText, { color: colorScheme.text.secondary }]}>
              "Chaque vote est un pas vers un quartier meilleur pour tous."
            </Text>
            <Text style={[styles.quoteAuthor, { color: colorScheme.text.tertiary }]}>
              L'équipe CitizenConnect
            </Text>
          </View>
        </Animated.View>

        {/* Modal d'information */}
        <InfoModal 
          visible={infoModalVisible} 
          onClose={toggleInfoModal} 
          getBadgeStyles={getBadgeStyles}
          colorScheme={colorScheme}
        />
      </Modal>
    );
  }
);

/**
 * Styles optimisés et cohérents
 * Architecture visuelle premium avec effets modernisés
 */
const styles = StyleSheet.create({
  // Structure principale
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    margin: DesignTokens.spacing.md,
    marginBottom: 80, // Plus d'espace en bas pour éviter le Home Indicator
    backgroundColor: 'transparent', // Remplacé par BlurView
    borderRadius: DesignTokens.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // En-tête
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing.lg,
    paddingVertical: DesignTokens.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.3)',
  },
  modalTitle: {
    fontSize: DesignTokens.typography.size.lg,
    fontWeight: DesignTokens.typography.weight.bold,
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: DesignTokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Parcours de progression
  scrollContent: {
    paddingVertical: DesignTokens.spacing.md,
    paddingHorizontal: DesignTokens.spacing.xl,
  },
  pathContainer: {
    height: 110, // Augmenté pour accommoder les étoiles
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: DesignTokens.spacing.md,
  },
  progressLine: {
    position: 'absolute',
    height: 2,
    left: 30,
    right: 30,
    top: 22,
    backgroundColor: 'rgba(180, 180, 180, 0.3)',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pointWrapper: {
    width: 100,
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xs,
  },
  progressPoint: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing.xs,
    ...DesignTokens.elevation.small,
  },
  currentPoint: {
    width: 46,
    height: 46,
    borderRadius: 23,
    ...DesignTokens.elevation.medium,
  },
  pointRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
  },
  pointRingOuter: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
  },
  badgeShine: {
    position: 'absolute',
    top: 5,
    left: 7,
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ rotate: '35deg' }],
  },
  unlockedBadgeEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    opacity: 0.3,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 14,
    marginTop: 2,
    marginBottom: 4,
  },
  pointLabel: {
    fontSize: DesignTokens.typography.size.xs,
    fontWeight: DesignTokens.typography.weight.medium,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
    textAlign: 'center',
    maxWidth: 90,
  },
  currentLabel: {
    fontWeight: DesignTokens.typography.weight.semibold,
    letterSpacing: DesignTokens.typography.letterSpacing.normal,
  },
  lockedLabel: {
    opacity: 0.6,
  },
  
  // Carte de niveau
  cardContainer: {
    padding: DesignTokens.spacing.md,
  },
  tierCardWrapper: {
    position: 'relative',
    borderRadius: DesignTokens.radius.md,
    overflow: 'hidden',
    ...DesignTokens.elevation.medium,
  },
  tierCard: {
    backgroundColor: 'transparent',
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.md,
  },
  tierIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing.md,
    ...DesignTokens.elevation.small,
    overflow: 'hidden',
  },
  iconShine: {
    position: 'absolute',
    top: 5,
    left: 8,
    width: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ rotate: '35deg' }],
  },
  tierTitleContainer: {
    flex: 1,
  },
  tierTitle: {
    fontSize: DesignTokens.typography.size.lg,
    fontWeight: DesignTokens.typography.weight.bold,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
    marginBottom: 4,
  },
  tierStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierStats: {
    fontSize: DesignTokens.typography.size.sm,
    marginLeft: DesignTokens.spacing.xs,
  },
  tierRange: {
    fontSize: DesignTokens.typography.size.md,
    fontWeight: DesignTokens.typography.weight.medium,
    marginBottom: DesignTokens.spacing.md,
  },
  tierDescription: {
    fontSize: DesignTokens.typography.size.md,
    lineHeight: 22,
    marginTop: DesignTokens.spacing.md,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs - 2,
    borderRadius: DesignTokens.radius.sm,
  },
  currentBadgeText: {
    fontSize: DesignTokens.typography.size.xs,
    fontWeight: DesignTokens.typography.weight.bold,
    color: '#FFFFFF',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: DesignTokens.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 5,
    marginRight: DesignTokens.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressText: {
    fontSize: DesignTokens.typography.size.md,
    fontWeight: DesignTokens.typography.weight.bold,
    width: 45,
    textAlign: 'right',
  },
  
  // Aperçu du niveau suivant
  nextLevelPreview: {
    marginTop: DesignTokens.spacing.lg,
    paddingTop: DesignTokens.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.2)',
  },
  nextLevelLabel: {
    fontSize: DesignTokens.typography.size.sm,
    fontWeight: DesignTokens.typography.weight.medium,
    marginBottom: DesignTokens.spacing.sm,
  },
  nextLevelBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextLevelIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing.md,
    borderWidth: 1,
  },
  nextLevelProgress: {
    flex: 1,
    height: 32,
    borderRadius: DesignTokens.radius.sm,
    justifyContent: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
  },
  nextLevelVotes: {
    fontSize: DesignTokens.typography.size.sm,
    fontWeight: DesignTokens.typography.weight.medium,
  },
  
  // Citation
  quoteContainer: {
    margin: DesignTokens.spacing.md,
    marginTop: 0,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radius.sm,
    borderLeftWidth: 3,
  },
  quoteText: {
    fontSize: DesignTokens.typography.size.md,
    fontStyle: 'italic',
    marginBottom: DesignTokens.spacing.xs,
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: DesignTokens.typography.size.sm,
    fontWeight: DesignTokens.typography.weight.medium,
    textAlign: 'right',
  },
  
  // Modal d'information
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalContainer: {
    width: width * 0.9,
    backgroundColor: 'transparent',
    borderRadius: DesignTokens.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...DesignTokens.elevation.large,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  infoModalTitle: {
    fontSize: DesignTokens.typography.size.lg,
    fontWeight: DesignTokens.typography.weight.bold,
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
  },
  infoModalCloseButton: {
    padding: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.radius.pill,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoModalContent: {
    padding: DesignTokens.spacing.lg,
  },
  infoItem: {
    marginBottom: DesignTokens.spacing.lg,
  },
  infoItemGradient: {
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    ...DesignTokens.elevation.micro,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing.lg,
    overflow: 'hidden',
  },
  infoIconShine: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 10,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    transform: [{ rotate: '35deg' }],
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: DesignTokens.typography.size.md,
    fontWeight: DesignTokens.typography.weight.semibold,
    marginBottom: 6,
    letterSpacing: DesignTokens.typography.letterSpacing.tight,
  },
  infoDescription: {
    fontSize: DesignTokens.typography.size.sm,
    lineHeight: 20,
  },
  infoModalButton: {
    margin: DesignTokens.spacing.lg,
    padding: DesignTokens.spacing.md,
    borderRadius: DesignTokens.radius.md,
    alignItems: 'center',
    overflow: 'hidden',
  },
  infoModalButtonText: {
    fontSize: DesignTokens.typography.size.md,
    fontWeight: DesignTokens.typography.weight.semibold,
    color: '#FFFFFF',
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
  },
  
  // Effets de particules
  particle: {
    position: 'absolute',
    borderRadius: 4,
  },
});

export default BadgeModal;