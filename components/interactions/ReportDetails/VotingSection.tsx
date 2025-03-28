// src/components/interactions/ReportDetails/VotingSection.tsx

import React, { memo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Vibration,
  Platform,
  TextStyle,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { VoteType } from "../../../types/entities/report.types";

/**
 * Système de design avancé pour l'application
 * Design System unifié pour tous les composants
 */
const DESIGN_SYSTEM = {
  colors: {
    // Couleurs principales avec niveaux
    primary: {
      light: "rgba(142, 45, 226, 0.08)",
      medium: "rgba(142, 45, 226, 0.15)",
      default: "#8E2DE2",
      dark: "#4A00E0",
      gradient: ["#8E2DE2", "#4A00E0"]
    },
    secondary: {
      light: "rgba(255, 65, 108, 0.08)",
      medium: "rgba(255, 65, 108, 0.15)",
      default: "#FF416C",
      dark: "#FF4B2B",
      gradient: ["#FF416C", "#FF4B2B"]
    },
    accent: {
      light: "rgba(0, 198, 251, 0.08)",
      medium: "rgba(0, 198, 251, 0.15)",
      default: "#00C6FB",
      dark: "#005BEA",
      gradient: ["#00C6FB", "#005BEA"]
    },
    // Couleurs fonctionnelles
    success: {
      light: "rgba(52, 199, 89, 0.1)",
      default: "#34C759",
      dark: "#2A9D48"
    },
    warning: {
      light: "rgba(255, 204, 0, 0.1)",
      default: "#FFCC00",
      dark: "#E6B800"
    },
    error: {
      light: "rgba(255, 59, 48, 0.1)",
      default: "#FF3B30",
      dark: "#D9302A"
    },
    info: {
      light: "rgba(90, 200, 250, 0.1)",
      default: "#5AC8FA",
      dark: "#4AB8EA"
    },
    // Échelle de gris
    gray: {
      50: "#FFFFFF",
      100: "#F7F9FC",
      200: "#EEF2F8",
      300: "#D0D6E0",
      400: "#A3ADBF",
      500: "#8F96A3",
      600: "#545D69",
      700: "#2D3748",
      800: "#1A202C",
      900: "#0A0A0A"
    },
    // Transparences paramétriques
    overlay: {
      light: "rgba(0, 0, 0, 0.05)",
      medium: "rgba(0, 0, 0, 0.25)",
      dark: "rgba(0, 0, 0, 0.6)",
      glass: "rgba(255, 255, 255, 0.8)"
    }
  },
  // Système d'ombres standardisé multi-plateforme
  shadows: {
    none: {},
    xs: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      }
    }),
    sm: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      }
    }),
    md: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      }
    }),
    lg: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      }
    })
  },
  // Constantes d'animation
  animation: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      standard: Easing.inOut(Easing.cubic),
      accelerate: Easing.in(Easing.cubic),
      decelerate: Easing.out(Easing.cubic),
      spring: Easing.out(Easing.back(1.7)),
      elastic: (bounciness = 1.2) => Easing.elastic(bounciness)
    }
  },
  // Système de bordures
  border: {
    width: {
      none: 0,
      thin: 1,
      normal: 2,
      thick: 3
    },
    radius: {
      none: 0,
      sm: 6,
      md: 12,
      lg: 16,
      xl: 24,
      full: 9999
    }
  },
  // Système d'espacement
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  // Typographie - Correction des valeurs de weight pour être compatible avec React Native
  typography: {
    size: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24
    },
    weight: {
      light: "300" as FontWeight,
      regular: "400" as FontWeight,
      medium: "500" as FontWeight,
      semibold: "600" as FontWeight,
      bold: "700" as FontWeight
    }
  }
};

// Type pour les valeurs de fontWeight acceptées par React Native
type FontWeight = "300" | "400" | "500" | "600" | "700" | 
                 "normal" | "bold" | "100" | "200" | "800" | "900";

/**
 * Interface pour les propriétés du bouton de vote
 */
interface VoteButtonProps {
  type: "up" | "down";
  count: number;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Bouton de vote avancé avec animations et retour haptique
 */
const VoteButton = memo(({ type, count, isSelected, onPress }: VoteButtonProps) => {
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bgOpacityAnim = useRef(new Animated.Value(0)).current;
  
  const [isPulsing, setIsPulsing] = useState(false);

  // Gestion des états d'animation
  useEffect(() => {
    if (isSelected) {
      setIsPulsing(true);
      Animated.timing(bgOpacityAnim, {
        toValue: 1,
        duration: DESIGN_SYSTEM.animation.duration.normal,
        easing: DESIGN_SYSTEM.animation.easing.decelerate,
        useNativeDriver: true,
      }).start();
    } else {
      setIsPulsing(false);
      Animated.timing(bgOpacityAnim, {
        toValue: 0,
        duration: DESIGN_SYSTEM.animation.duration.normal,
        easing: DESIGN_SYSTEM.animation.easing.decelerate,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  // Animation de pulsation
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    
    if (isPulsing) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: DESIGN_SYSTEM.animation.duration.slow,
            easing: DESIGN_SYSTEM.animation.easing.standard,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: DESIGN_SYSTEM.animation.duration.slow,
            easing: DESIGN_SYSTEM.animation.easing.standard,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: DESIGN_SYSTEM.animation.duration.normal,
        easing: DESIGN_SYSTEM.animation.easing.decelerate,
        useNativeDriver: true,
      }).start();
    }
    
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isPulsing]);

  // Gestion de l'interaction
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: DESIGN_SYSTEM.animation.duration.fast,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(rotateAnim, {
      toValue: type === "up" ? 0.05 : -0.05,
      duration: DESIGN_SYSTEM.animation.duration.fast,
      useNativeDriver: true,
    }).start();
    
    // Feedback haptique adapté à la plateforme
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 30]); 
    } else {
      Vibration.vibrate(20);
    }
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: DESIGN_SYSTEM.animation.duration.normal,
      easing: DESIGN_SYSTEM.animation.easing.spring,
      useNativeDriver: true,
    }).start();
  };
  
  // Transformations animées
  const rotate = rotateAnim.interpolate({
    inputRange: [-0.05, 0, 0.05],
    outputRange: ['-1.5deg', '0deg', '1.5deg'],
  });
  
  // Configurations de couleur selon le type
  const isUp = type === "up";
  const baseColor = isUp ? DESIGN_SYSTEM.colors.success.default : DESIGN_SYSTEM.colors.error.default;
  const darkColor = isUp ? DESIGN_SYSTEM.colors.success.dark : DESIGN_SYSTEM.colors.error.dark;
  const lightBg = isUp ? DESIGN_SYSTEM.colors.success.light : DESIGN_SYSTEM.colors.error.light;
  const iconName = isUp 
    ? (isSelected ? "thumbs-up" : "thumbs-up-outline")
    : (isSelected ? "thumbs-down" : "thumbs-down-outline");
  
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.voteButtonWrapper}
    >
      <Animated.View 
        style={[
          styles.voteButtonContainer,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate }
            ]
          }
        ]}
      >
        {/* Fond animé */}
        <Animated.View 
          style={[
            styles.voteButtonBg,
            {
              backgroundColor: baseColor,
              opacity: bgOpacityAnim
            }
          ]}
        />
        
        {/* Contenu du bouton */}
        <View style={styles.voteButtonContent}>
          <Icon 
            name={iconName} 
            size={20} 
            color={isSelected ? DESIGN_SYSTEM.colors.gray[50] : baseColor}
            // Suppression du style problématique
          />
          <Text 
            style={[
              styles.voteText,
              { 
                color: isSelected 
                  ? DESIGN_SYSTEM.colors.gray[50] 
                  : darkColor 
              }
            ]}
          >
            {isUp ? "Oui" : "Non"} ({count})
          </Text>
          
          {/* Indicateur visuel d'état actif */}
          {isSelected && (
            <View style={[styles.activeIndicator, { backgroundColor: 'rgba(255, 255, 255, 0.4)' }]} />
          )}
        </View>
        
        {/* Bordure stylisée */}
        <View 
          style={[
            styles.voteButtonBorder,
            { 
              borderColor: isSelected 
                ? 'rgba(255, 255, 255, 0.3)' 
                : DESIGN_SYSTEM.colors.gray[300],
              backgroundColor: isSelected ? 'transparent' : lightBg
            }
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
});

/**
 * Interface pour les propriétés du conteneur de vote
 */
interface VotingButtonsProps {
  votes: { upVotes: number; downVotes: number };
  selectedVote: VoteType;
  onVote: (type: "up" | "down") => void;
}

/**
 * Conteneur des boutons de vote
 */
const VotingButtons = memo(({ votes, selectedVote, onVote }: VotingButtonsProps) => {
  return (
    <View style={styles.votingContainer}>
      <VoteButton
        type="up"
        count={votes.upVotes}
        isSelected={selectedVote === "up"}
        onPress={() => onVote("up")}
      />
      
      <VoteButton
        type="down"
        count={votes.downVotes}
        isSelected={selectedVote === "down"}
        onPress={() => onVote("down")}
      />
    </View>
  );
});

/**
 * Interface des propriétés pour la section de vote
 */
interface VotingSectionProps {
  votes: { upVotes: number; downVotes: number };
  selectedVote: VoteType;
  onVote: (type: "up" | "down") => void;
}

/**
 * Composant principal de la section de vote
 */
const VotingSection: React.FC<VotingSectionProps> = ({
  votes,
  selectedVote,
  onVote,
}) => {
  // Animations d'entrée
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  
  // Animation d'entrée orchestrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: DESIGN_SYSTEM.animation.duration.normal,
        easing: DESIGN_SYSTEM.animation.easing.spring,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: DESIGN_SYSTEM.animation.duration.normal,
        easing: DESIGN_SYSTEM.animation.easing.decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: DESIGN_SYSTEM.animation.duration.normal,
        easing: DESIGN_SYSTEM.animation.easing.spring,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Calcul du pourcentage des votes
  const totalVotes = votes.upVotes + votes.downVotes;
  const positivePercent = totalVotes > 0 
    ? Math.round((votes.upVotes / totalVotes) * 100) 
    : 0;

  return (
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {/* Zone de brillance */}
      <View style={styles.cardShine} />
      
      <View style={styles.cardContent}>
        {/* En-tête de la carte */}
        <View style={styles.cardHeader}>
          <View style={styles.titleIconContainer}>
            <Icon name="help-circle" size={20} color={DESIGN_SYSTEM.colors.accent.default} />
          </View>
          <Text style={styles.sectionTitle}>Avez-vous vu cet événement ?</Text>
        </View>
        
        {/* Zone de vote */}
        <VotingButtons 
          votes={votes} 
          selectedVote={selectedVote} 
          onVote={onVote} 
        />
        
        {/* Indicateur visuel du pourcentage de votes positifs */}
        <View style={styles.voteStatsContainer}>
          <View style={styles.voteStatsBar}>
            <View 
              style={[
                styles.voteStatsPositive,
                { width: `${positivePercent}%` }
              ]} 
            />
          </View>
          <Text style={styles.voteStatsText}>
            {positivePercent}% des utilisateurs confirment cet événement
          </Text>
        </View>
        
        {/* Texte d'information */}
        <Text style={styles.infoText}>
          Votre vote aide la communauté à valider cet événement
        </Text>
      </View>
    </Animated.View>
  );
};

/**
 * Styles complets du composant
 */
const styles = StyleSheet.create({
  // Conteneur principal
  card: {
    borderRadius: DESIGN_SYSTEM.border.radius.xl,
    marginBottom: DESIGN_SYSTEM.spacing.md,
    overflow: 'hidden',
    position: 'relative',
    ...DESIGN_SYSTEM.shadows.md
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopRightRadius: DESIGN_SYSTEM.border.radius.xl,
    borderTopLeftRadius: DESIGN_SYSTEM.border.radius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  },
  cardContent: {
    borderRadius: DESIGN_SYSTEM.border.radius.xl,
    padding: DESIGN_SYSTEM.spacing.lg,
    backgroundColor: DESIGN_SYSTEM.colors.gray[50],
    borderWidth: DESIGN_SYSTEM.border.width.thin,
    borderColor: DESIGN_SYSTEM.colors.gray[200],
  },
  
  // En-tête
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DESIGN_SYSTEM.spacing.lg,
    justifyContent: 'center',
  },
  titleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: DESIGN_SYSTEM.border.radius.full,
    backgroundColor: DESIGN_SYSTEM.colors.accent.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DESIGN_SYSTEM.spacing.sm,
    ...DESIGN_SYSTEM.shadows.xs
  },
  sectionTitle: {
    fontSize: DESIGN_SYSTEM.typography.size.lg,
    fontWeight: DESIGN_SYSTEM.typography.weight.semibold,
    color: DESIGN_SYSTEM.colors.gray[700],
  },
  
  // Conteneur des votes
  votingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: DESIGN_SYSTEM.spacing.sm,
  },
  voteButtonWrapper: {
    width: "48%",
    position: 'relative',
  },
  voteButtonContainer: {
    borderRadius: DESIGN_SYSTEM.border.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    ...DESIGN_SYSTEM.shadows.sm
  },
  voteButtonBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DESIGN_SYSTEM.border.radius.lg,
  },
  voteButtonBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: DESIGN_SYSTEM.border.radius.lg,
    borderWidth: DESIGN_SYSTEM.border.width.thin,
    zIndex: -1,
  },
  voteButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  voteText: {
    fontSize: DESIGN_SYSTEM.typography.size.md,
    fontWeight: DESIGN_SYSTEM.typography.weight.medium,
    marginLeft: DESIGN_SYSTEM.spacing.sm,
  },
  // Style de l'icône déplacé dans le inline style car Icon n'accepte que TextStyle
  
  // Indicateur d'état actif
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 4,
    borderRadius: DESIGN_SYSTEM.border.radius.sm,
  },
  
  // Statistiques de vote
  voteStatsContainer: {
    marginTop: DESIGN_SYSTEM.spacing.lg,
    alignItems: 'center',
  },
  voteStatsBar: {
    height: 6,
    width: '100%',
    backgroundColor: DESIGN_SYSTEM.colors.gray[200],
    borderRadius: DESIGN_SYSTEM.border.radius.full,
    overflow: 'hidden',
    marginBottom: DESIGN_SYSTEM.spacing.sm,
  },
  voteStatsPositive: {
    height: '100%',
    backgroundColor: DESIGN_SYSTEM.colors.success.default,
    borderRadius: DESIGN_SYSTEM.border.radius.full,
  },
  voteStatsText: {
    fontSize: DESIGN_SYSTEM.typography.size.sm,
    color: DESIGN_SYSTEM.colors.gray[600],
  },
  
  // Texte d'information
  infoText: {
    fontSize: DESIGN_SYSTEM.typography.size.sm,
    color: DESIGN_SYSTEM.colors.gray[500],
    textAlign: 'center',
    marginTop: DESIGN_SYSTEM.spacing.lg,
  }
});

export default memo(VotingSection);