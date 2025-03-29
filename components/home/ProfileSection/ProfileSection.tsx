// Chemin: components/home/ProfileSection/ProfileSection.tsx

import React, { memo, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { User, UserStats as UserStatsType } from "../../../types/entities/user.types";
import { useBadge } from "../../../hooks/ui/useBadge";
import RankBadge from "./RankBadge";
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle, Rect, RadialGradient } from "react-native-svg";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";

// Constantes pour le dimensionnement adaptatif
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

// Constantes de couleurs pour animation adaptées au ranking
const COLORS = {
  primary: {
    dark: "#041724",
    main: "#062C41",
    light: "#0F3460",
    accent: "#1A6BB0",
  },
  rank1: { // Or - 1er
    primary: "#FFD700", // Or
    secondary: "#FFA000", // Orange doré
    accent1: "#F9A825", // Jaune doré
    accent2: "#FF8F00", // Ambre
    glow: "rgba(255, 215, 0, 0.6)", // Lueur dorée
  },
  rank2: { // Argent - 2ème
    primary: "#C0C0C0", // Argent
    secondary: "#757575", // Gris foncé
    accent1: "#9E9E9E", // Gris moyen
    accent2: "#607D8B", // Bleu gris
    glow: "rgba(192, 192, 192, 0.6)", // Lueur argentée
  },
  rank3: { // Bronze - 3ème
    primary: "#CD7F32", // Bronze
    secondary: "#8D6E63", // Brun
    accent1: "#A1887F", // Brun clair
    accent2: "#795548", // Brun foncé
    glow: "rgba(205, 127, 50, 0.6)", // Lueur bronze
  },
  rank10: { // Violet - 4ème à 10ème
    primary: "#6A0DAD", // Violet royal
    secondary: "#3949AB", // Indigo
    accent1: "#9C27B0", // Violet
    accent2: "#5E35B1", // Violet profond
    glow: "rgba(106, 13, 173, 0.6)", // Lueur violette
  },
  rankDefault: { // Bleu-vert - Autres
    primary: "#1E88E5", // Bleu
    secondary: "#00796B", // Vert foncé
    accent1: "#26A69A", // Teal
    accent2: "#0288D1", // Bleu clair
    glow: "rgba(30, 136, 229, 0.6)", // Lueur bleu
  },
  particle: {
    bright: "rgba(255, 255, 255, 0.8)",
    medium: "rgba(255, 255, 255, 0.5)",
    dim: "rgba(255, 255, 255, 0.3)",
  }
};

/**
 * AuroraEffect - Un composant qui crée un effet d'aurore boréale en arrière-plan
 * Animation fluide qui ajoute une dimension visuelle spectaculaire adaptée au rang
 */
interface AuroraEffectProps {
  ranking: number | null;
}

const AuroraEffect: React.FC<AuroraEffectProps> = memo(({ ranking }) => {
  const auroraPosition1 = useRef(new Animated.Value(0)).current;
  const auroraPosition2 = useRef(new Animated.Value(0)).current;
  const auroraOpacity1 = useRef(new Animated.Value(0.5)).current;
  const auroraOpacity2 = useRef(new Animated.Value(0.3)).current;
  
  // Fonction pour déterminer les couleurs d'aurore en fonction du rang
  const getAuroraColors = useCallback(() => {
    if (ranking === 1) {
      return {
        aurora1: [COLORS.rank1.primary, COLORS.rank1.accent1, COLORS.rank1.secondary] as const,
        aurora2: [COLORS.rank1.accent2, COLORS.rank1.primary, COLORS.rank1.accent1] as const
      };
    } else if (ranking === 2) {
      return {
        aurora1: [COLORS.rank2.primary, COLORS.rank2.accent1, COLORS.rank2.secondary] as const,
        aurora2: [COLORS.rank2.accent2, COLORS.rank2.primary, COLORS.rank2.accent1] as const
      };
    } else if (ranking === 3) {
      return {
        aurora1: [COLORS.rank3.primary, COLORS.rank3.accent1, COLORS.rank3.secondary] as const,
        aurora2: [COLORS.rank3.accent2, COLORS.rank3.primary, COLORS.rank3.accent1] as const
      };
    } else if (ranking && ranking <= 10) {
      return {
        aurora1: [COLORS.rank10.primary, COLORS.rank10.accent1, COLORS.rank10.secondary] as const,
        aurora2: [COLORS.rank10.accent2, COLORS.rank10.primary, COLORS.rank10.accent1] as const
      };
    } else {
      return {
        aurora1: [COLORS.rankDefault.primary, COLORS.rankDefault.accent1, COLORS.rankDefault.secondary] as const,
        aurora2: [COLORS.rankDefault.accent2, COLORS.rankDefault.primary, COLORS.rankDefault.accent1] as const
      };
    }
  }, [ranking]);

  const auroraColors = getAuroraColors();
  
  useEffect(() => {
    // Animation de déplacement des aurores
    Animated.loop(
      Animated.sequence([
        Animated.timing(auroraPosition1, {
          toValue: 1,
          duration: 15000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraPosition1, {
          toValue: 0,
          duration: 15000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(auroraPosition2, {
          toValue: 1,
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraPosition2, {
          toValue: 0,
          duration: 20000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Animation de pulsation de l'opacité
    Animated.loop(
      Animated.sequence([
        Animated.timing(auroraOpacity1, {
          toValue: 0.8,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraOpacity1, {
          toValue: 0.4,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(auroraOpacity2, {
          toValue: 0.6,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(auroraOpacity2, {
          toValue: 0.2,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ])
    ).start();
  }, []);
  
  const translateX1 = auroraPosition1.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5],
  });
  
  const translateX2 = auroraPosition2.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.3, -SCREEN_WIDTH * 0.3],
  });
  
  return (
    <View style={styles.auroraContainer}>
      <Animated.View 
        style={[
          styles.aurora, 
          { 
            opacity: auroraOpacity1,
            transform: [{ translateX: translateX1 }] 
          }
        ]}
      >
        <LinearGradient
          colors={auroraColors.aurora1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.auroraGradient}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.aurora,
          styles.auroraSecond,
          { 
            opacity: auroraOpacity2,
            transform: [{ translateX: translateX2 }] 
          }
        ]}
      >
        <LinearGradient
          colors={auroraColors.aurora2}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.auroraGradient}
        />
      </Animated.View>
    </View>
  );
});

/**
 * NebulaStar - Crée une étoile scintillante avec aura pour effet nébuleuse
 * Effet adapté au rang du membre pour une cohérence visuelle
 */
interface NebulaStarProps {
  size: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  glow: string;
  ranking: number | null;
}

const NebulaStar: React.FC<NebulaStarProps> = memo(({ size, x, y, color, delay, glow, ranking }) => {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0.1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  
  // Animation plus prononcée pour les premiers rangs
  const getAnimationValues = useCallback(() => {
    if (ranking === 1) {
      return {
        maxScale: 1.4,
        minScale: 0.7,
        maxOpacity: 1.0,
        minOpacity: 0.3,
        scaleDuration: 1400,
        opacityDuration: 1800
      };
    } else if (ranking === 2) {
      return {
        maxScale: 1.3,
        minScale: 0.7,
        maxOpacity: 0.95,
        minOpacity: 0.25,
        scaleDuration: 1500, 
        opacityDuration: 1900
      };
    } else {
      return {
        maxScale: 1.2,
        minScale: 0.7,
        maxOpacity: 0.9,
        minOpacity: 0.2,
        scaleDuration: 1500,
        opacityDuration: 2000
      };
    }
  }, [ranking]);
  
  const animValues = getAnimationValues();
  
  useEffect(() => {
    // Délai aléatoire avant démarrage
    const timeout = setTimeout(() => {
      // Animation de scintillement
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: animValues.maxScale,
            duration: animValues.scaleDuration + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: animValues.minScale,
            duration: animValues.scaleDuration + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
      
      // Animation d'opacité
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: animValues.maxOpacity,
            duration: animValues.opacityDuration + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: animValues.minOpacity,
            duration: animValues.opacityDuration + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
      
      // Rotation subtile
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 360,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }, delay);
    
    return () => clearTimeout(timeout);
  }, []);
  
  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });
  
  // Taille plus grande pour les étoiles des premiers rangs
  const getAdjustedSize = () => {
    if (ranking === 1) return size * 1.3;
    if (ranking === 2) return size * 1.2; 
    if (ranking === 3) return size * 1.1;
    return size;
  };
  
  const finalSize = getAdjustedSize();
  
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity,
        transform: [{ scale }, { rotate: spin }],
      }}
    >
      <View style={{
        width: finalSize,
        height: finalSize,
        borderRadius: finalSize / 2,
        backgroundColor: "white",
        shadowColor: glow || color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: finalSize / 2,
        elevation: 15,
      }} />
    </Animated.View>
  );
});

/**
 * CosmicNebulaBackground - Crée un effet de nébuleuse cosmique en arrière-plan
 * Combinaison d'étoiles scintillantes et de nuages nébuleux adaptés au rang
 */
interface CosmicNebulaBackgroundProps {
  ranking: number | null;
}

const CosmicNebulaBackground: React.FC<CosmicNebulaBackgroundProps> = memo(({ ranking }) => {
  // Fonction pour obtenir les couleurs basées sur le rang
  const getStarColors = useCallback(() => {
    if (ranking === 1) {
      return {
        colors: [COLORS.rank1.primary, COLORS.rank1.accent1, COLORS.rank1.accent2],
        glow: COLORS.rank1.glow,
        count: 30 // Plus d'étoiles pour le 1er rang
      };
    } else if (ranking === 2) {
      return {
        colors: [COLORS.rank2.primary, COLORS.rank2.accent1, COLORS.rank2.accent2],
        glow: COLORS.rank2.glow,
        count: 25
      };
    } else if (ranking === 3) {
      return {
        colors: [COLORS.rank3.primary, COLORS.rank3.accent1, COLORS.rank3.accent2],
        glow: COLORS.rank3.glow,
        count: 22
      };
    } else if (ranking && ranking <= 10) {
      return {
        colors: [COLORS.rank10.primary, COLORS.rank10.accent1, COLORS.rank10.accent2],
        glow: COLORS.rank10.glow,
        count: 20
      };
    } else {
      return {
        colors: [COLORS.rankDefault.primary, COLORS.rankDefault.accent1, COLORS.rankDefault.accent2],
        glow: COLORS.rankDefault.glow,
        count: 18
      };
    }
  }, [ranking]);
  
  const { colors, glow, count } = getStarColors();
  
  const nebulas = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // Taille variable selon le rang
      const baseSize = ranking === 1 ? 3 : ranking === 2 ? 2.5 : 2;
      const size = baseSize + Math.random() * 6;
      
      // Distribution optimisée pour les différents rangs
      const x = Math.random() * SCREEN_WIDTH;
      const y = Math.random() * 200;
      
      const color = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 2000;
      
      return { size, x, y, color, glow, delay, id: i };
    });
  }, [ranking, colors, glow, count]);
  
  return (
    <View style={styles.nebulaContainer}>
      {nebulas.map((star) => (
        <NebulaStar
          key={star.id}
          size={star.size}
          x={star.x}
          y={star.y}
          color={star.color}
          glow={star.glow}
          delay={star.delay}
          ranking={ranking}
        />
      ))}
    </View>
  );
});

/**
 * LightBeam - Crée un faisceau de lumière qui traverse l'écran
 * Style et fréquence adaptés selon le rang
 */
interface LightBeamProps {
  ranking: number | null;
}

const LightBeam: React.FC<LightBeamProps> = memo(({ ranking }) => {
  const beamPosition = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const beamOpacity = useRef(new Animated.Value(0)).current;
  
  // Configuration des particularités du faisceau selon le rang
  const getBeamConfig = useCallback(() => {
    if (ranking === 1) {
      return {
        color: COLORS.rank1.glow,
        maxOpacity: 0.9,
        frequency: 3000, // Apparaît plus souvent
        width: 0.5, // Plus large
        speed: 1800, // Plus rapide
      };
    } else if (ranking === 2) {
      return {
        color: COLORS.rank2.glow,
        maxOpacity: 0.8,
        frequency: 4000,
        width: 0.4,
        speed: 1900,
      };
    } else if (ranking === 3) {
      return {
        color: COLORS.rank3.glow,
        maxOpacity: 0.75,
        frequency: 4500,
        width: 0.35,
        speed: 2000,
      };
    } else if (ranking && ranking <= 10) {
      return {
        color: COLORS.rank10.glow,
        maxOpacity: 0.7,
        frequency: 5000,
        width: 0.3,
        speed: 2000,
      };
    } else {
      return {
        color: COLORS.rankDefault.glow,
        maxOpacity: 0.65,
        frequency: 6000,
        width: 0.3,
        speed: 2000,
      };
    }
  }, [ranking]);
  
  const beamConfig = getBeamConfig();
  
  useEffect(() => {
    // Animation du faisceau de lumière traversant l'écran
    const animateBeam = () => {
      Animated.sequence([
        // Attente (fréquence adaptée au rang)
        Animated.delay(beamConfig.frequency + Math.random() * 5000),
        // Faire apparaître le faisceau
        Animated.timing(beamOpacity, {
          toValue: beamConfig.maxOpacity,
          duration: 500,
          useNativeDriver: true,
        }),
        // Déplacer le faisceau
        Animated.timing(beamPosition, {
          toValue: SCREEN_WIDTH * 2,
          duration: beamConfig.speed,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Faire disparaître le faisceau
        Animated.timing(beamOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        // Réinitialiser la position
        Animated.timing(beamPosition, {
          toValue: -SCREEN_WIDTH,
          duration: 0,
          useNativeDriver: true,
        })
      ]).start(() => animateBeam());
    };
    
    animateBeam();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.lightBeam,
        {
          transform: [{ translateX: beamPosition }, { skewX: "-30deg" }],
          opacity: beamOpacity,
          backgroundColor: beamConfig.color,
          width: `${beamConfig.width * 100}%`,
        },
      ]}
    />
  );
});

/**
 * WavesBackground - Crée un effet de vagues animées en arrière-plan
 * Couleurs et comportement adaptés au rang
 */
const WavesBackground: React.FC<{ ranking: number | null }> = memo(({ ranking }) => {
  const wave1Position = useRef(new Animated.Value(0)).current;
  const wave2Position = useRef(new Animated.Value(0)).current;
  
  // Fonction pour déterminer les couleurs des vagues selon le rang
  const getWaveColors = useCallback(() => {
    if (ranking === 1) {
      return {
        wave1: [COLORS.rank1.primary, COLORS.rank1.accent1],
        wave2: [COLORS.rank1.accent2, COLORS.rank1.secondary],
        opacity1: [0.4, 0.15],
        opacity2: [0.3, 0.1]
      };
    } else if (ranking === 2) {
      return {
        wave1: [COLORS.rank2.primary, COLORS.rank2.accent1],
        wave2: [COLORS.rank2.accent2, COLORS.rank2.secondary],
        opacity1: [0.35, 0.12],
        opacity2: [0.25, 0.08]
      };
    } else if (ranking === 3) {
      return {
        wave1: [COLORS.rank3.primary, COLORS.rank3.accent1],
        wave2: [COLORS.rank3.accent2, COLORS.rank3.secondary],
        opacity1: [0.3, 0.1],
        opacity2: [0.2, 0.08]
      };
    } else if (ranking && ranking <= 10) {
      return {
        wave1: [COLORS.rank10.primary, COLORS.rank10.accent1],
        wave2: [COLORS.rank10.accent2, COLORS.rank10.secondary],
        opacity1: [0.3, 0.1],
        opacity2: [0.2, 0.08]
      };
    } else {
      return {
        wave1: [COLORS.rankDefault.primary, COLORS.rankDefault.accent1],
        wave2: [COLORS.rankDefault.accent2, COLORS.rankDefault.secondary],
        opacity1: [0.3, 0.1],
        opacity2: [0.2, 0.08]
      };
    }
  }, [ranking]);
  
  const waveColors = getWaveColors();
  
  // Ajuster la vitesse selon le rang
  const getWaveSpeed = useCallback(() => {
    if (ranking === 1) return { wave1: 17000, wave2: 12000 };
    if (ranking === 2) return { wave1: 18000, wave2: 13000 };
    if (ranking === 3) return { wave1: 19000, wave2: 14000 };
    return { wave1: 20000, wave2: 15000 };
  }, [ranking]);
  
  const waveSpeeds = getWaveSpeed();
  
  useEffect(() => {
    // Animation continue de déplacement des vagues
    Animated.loop(
      Animated.timing(wave1Position, {
        toValue: -200,
        duration: waveSpeeds.wave1,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.loop(
      Animated.timing(wave2Position, {
        toValue: -200,
        duration: waveSpeeds.wave2,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  return (
    <View style={styles.wavesContainer}>
      <Animated.View
        style={[
          styles.waveWrapper,
          {
            transform: [{ translateX: wave1Position }],
          },
        ]}
      >
        <Svg width="400%" height="100%" style={{ position: "absolute" }}>
          <Defs>
            <SvgGradient id="waveGradient1" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={waveColors.wave1[0]} stopOpacity={waveColors.opacity1[0]} />
              <Stop offset="1" stopColor={waveColors.wave1[1]} stopOpacity={waveColors.opacity1[1]} />
            </SvgGradient>
          </Defs>
          <Path
            d="M0,30 C150,10 350,50 500,30 C650,10 850,50 1000,30 C1150,10 1350,50 1500,30 V100 H0 Z"
            fill="url(#waveGradient1)"
          />
        </Svg>
      </Animated.View>
      
      <Animated.View
        style={[
          styles.waveWrapper,
          {
            transform: [{ translateX: wave2Position }],
          },
        ]}
      >
        <Svg width="400%" height="100%" style={{ position: "absolute" }}>
          <Defs>
            <SvgGradient id="waveGradient2" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={waveColors.wave2[0]} stopOpacity={waveColors.opacity2[0]} />
              <Stop offset="1" stopColor={waveColors.wave2[1]} stopOpacity={waveColors.opacity2[1]} />
            </SvgGradient>
          </Defs>
          <Path
            d="M0,40 C100,60 250,20 400,40 C550,60 700,20 850,40 C1000,60 1150,20 1300,40 V100 H0 Z"
            fill="url(#waveGradient2)"
          />
        </Svg>
      </Animated.View>
    </View>
  );
});

interface ProfileSectionProps {
  user: User | null;
  stats: UserStatsType | null;
  displayName: string;
  memberSince: string;
  voteSummary: { up: number; down: number };
  ranking: number | null;
  totalUsers: number | null;
  rankingSuffix: string;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  onShowNameModal: () => void;
  onShowBadgeModal: () => void;
  onShowVoteInfoModal: () => void;
  onNavigateToRanking: () => void;
  onNavigateToCity: () => void;
  updateProfileImage: (uri: string) => Promise<boolean>;
}

/**
 * ProfileSection: Composant optimisé pour l'affichage d'un profil de type réseau social
 * - Design moderne et immersif avec intégration fluide des métriques
 * - Avis communautaires intégrés directement dans le profil pour une meilleure cohérence visuelle
 * - Performance améliorée avec mémoïsation des calculs et optimisations de rendu
 * - Animations spectaculaires en arrière-plan pour une expérience visuelle premium
 */
const ProfileSection: React.FC<ProfileSectionProps> = memo(
  ({
    user,
    stats,
    voteSummary,
    ranking,
    totalUsers,
    rankingSuffix,
    onShowBadgeModal,
    onNavigateToRanking,
  }) => {
    const { getBadgeStyles } = useBadge();
    const badgeStyle = getBadgeStyles(stats?.votes?.length || 0);

    const formattedData = useMemo(() => {
      const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      };

      const total = voteSummary.up + voteSummary.down;
      // Calcul précis du ratio
      const voteRatio =
        total === 0 ? 50 : Math.round((voteSummary.up / total) * 100);
      const negativeRatio = total === 0 ? 50 : 100 - voteRatio;

      return {
        formattedUpVotes: formatNumber(voteSummary.up),
        formattedDownVotes: formatNumber(voteSummary.down),
        voteRatio,
        negativeRatio,
        formattedFollowers: formatNumber(user?.followers?.length || 0),
        formattedFollowing: formatNumber(user?.following?.length || 0),
      };
    }, [voteSummary, user?.followers?.length, user?.following?.length]);

    // Fonction pour obtenir les couleurs de fond selon le rang
  const getBackgroundColors = useCallback((): [string, string, ...string[]] => {
    if (ranking === 1) {
      return [
        COLORS.primary.dark, 
        COLORS.rank1.secondary, 
        COLORS.rank1.primary
      ];
    } else if (ranking === 2) {
      return [
        COLORS.primary.dark, 
        COLORS.rank2.secondary, 
        COLORS.rank2.primary
      ];
    } else if (ranking === 3) {
      return [
        COLORS.primary.dark, 
        COLORS.rank3.secondary, 
        COLORS.rank3.primary
      ];
    } else if (ranking && ranking <= 10) {
      return [
        COLORS.primary.dark, 
        COLORS.rank10.secondary, 
        COLORS.rank10.primary
      ];
    } else {
      return [
        COLORS.primary.dark, 
        COLORS.rankDefault.secondary, 
        COLORS.rankDefault.primary
      ];
    }
  }, [ranking]);
  
  const backgroundColors = getBackgroundColors();
  
  return (
      <View style={styles.container}>
        {/* Header avec fond dégradé et animations */}
        <LinearGradient
          colors={backgroundColors}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Superposition des animations de fond */}
          <AuroraEffect ranking={ranking} />
          <CosmicNebulaBackground ranking={ranking} />
          <WavesBackground ranking={ranking} />
          <LightBeam ranking={ranking} />

          {/* Section du badge de classement avec le badge utilisateur dynamique */}
          <View style={styles.rankingSection}>
            <RankBadge
              ranking={ranking}
              rankingSuffix={rankingSuffix}
              totalUsers={totalUsers}
              onNavigateToRanking={onNavigateToRanking}
              badgeStyle={badgeStyle}
              onShowBadgeModal={onShowBadgeModal}
              cityName={user?.nomCommune}
            />
          </View>
        </LinearGradient>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F7FA",
    marginBottom: 6,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 120 : 110, // Ajustement pour le header natif
    paddingBottom: 16,
    overflow: "hidden",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: SCREEN_WIDTH * 0.56,
  },
  locationText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "500",
  },
  iconButton: {
    position: "absolute",
    right: 0,
    top: 4,
    borderRadius: 17,
  },
  // Section du badge de classement
  rankingSection: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10, // S'assurer que le badge est au-dessus des animations
  },
  // Styles pour l'effet d'aurore boréale
  auroraContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  aurora: {
    position: "absolute",
    width: SCREEN_WIDTH * 1.5,
    height: 280,
    top: -100,
    borderRadius: 150,
    transform: [{ rotate: "-15deg" }],
    overflow: "hidden",
  },
  auroraSecond: {
    top: -50,
    width: SCREEN_WIDTH * 1.3,
    height: 200,
    transform: [{ rotate: "10deg" }],
  },
  auroraGradient: {
    width: "100%",
    height: "100%",
  },
  // Styles pour l'effet de nébuleuse
  nebulaContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  // Styles pour le faisceau de lumière
  lightBeam: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.3,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    top: 0,
  },
  // Styles pour les vagues animées
  wavesContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    overflow: "hidden",
  },
  waveWrapper: {
    position: "absolute",
    width: "400%",
    height: "100%",
  },
});

export default ProfileSection;