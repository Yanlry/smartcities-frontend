// Chemin : components/ranking/RankingHeader.tsx

import React, { memo, useEffect, useRef, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Easing, 
  Platform,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Obtenir les dimensions de l'écran pour les animations responsives
const { width } = Dimensions.get('window');
const IS_IOS = Platform.OS === 'ios';

/**
 * Système de design tokens minimaliste - Architecture complètement repensée
 * avec approche "Sombre & Lumière" et paradigme différent
 */
const DesignTokens = {
  // Nouveau système de couleurs avec accent Teal/Gold et base neutre
  colors: {
    // Couleurs principales neutres
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0A0A0A',
    },
    // Nouvel accent principal - Teal avec variantes
    teal: {
      50: '#EFFCF6',
      100: '#DEFAF0',
      200: '#BBF3E0',
      300: '#84E1C8',
      400: '#43C9AC',
      500: '#20B294',
      600: '#138D76',
      700: '#0F7261',
      800: '#0E5D50',
      900: '#0C4A41',
    },
    // Accent secondaire - Tons chauds
    gold: {
      50: '#FFFBE5',
      100: '#FFF6CE',
      200: '#FFEA9C',
      300: '#FFDA5F',
      400: '#FFC629',
      500: '#F0B000',
      600: '#CC8900',
      700: '#A66700',
      800: '#8C5200',
      900: '#7A4500',
    },
    // États fonctionnels
    state: {
      success: '#10B981',
      alert: '#FBBF24',
      error: '#F43F5E',
      info: '#0EA5E9',
    },
    // Superposition pour les cartes et éléments
    overlay: {
      light: 'rgba(255, 255, 255, 0.9)',
      subtle: 'rgba(255, 255, 255, 0.7)',
      dark: 'rgba(23, 23, 23, 0.8)',
      black: 'rgba(0, 0, 0, 0.5)',
    }
  },
  
  // Système de radius repensé pour un style distinct
  radius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Espacement avec échelle différente
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  
  // Nouvelle approche d'élévation
  elevation: {
    none: {
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    low: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    medium: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    high: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
        },
        android: {
          elevation: 6,
        },
      }),
    },
  },
  
  // Typographie distincte
  typography: {
    family: {
      // Utilisation des polices système pour maximiser les performances
      sans: Platform.select({
        ios: 'System',
        android: 'Roboto',
        default: 'System',
      }),
    },
    size: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
    weight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
    },
  },
  
  // Animation
  animation: {
    duration: {
      faster: 150,
      fast: 250,
      normal: 350,
      slow: 500,
    },
    easing: {
      // Nouvelles courbes d'animation pour un feeling différent
      smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
      easeOut: Easing.bezier(0, 0, 0.2, 1),
      easeIn: Easing.bezier(0.4, 0, 1, 1),
      bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    },
  },
};

/**
 * Interface pour les props du RankingHeader
 * Garde la même structure de props pour compatibilité
 */
interface RankingHeaderProps {
  userRanking: number | null;
  totalUsers: number | null;
  cityName: string | null;
  isLoading?: boolean;
  onPress?: () => void;
  style?: object;
  testID?: string;
}

/**
 * Hook personnalisé pour animer un nombre avec interpolation fluide
 * Version complètement réimplémentée
 */
const useAnimatedCounter = (
  targetValue: number | null, 
  duration: number = 1200,
  startDelay: number = 0
) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState<string>('-');
  
  useEffect(() => {
    if (targetValue === null) {
      setDisplayValue('-');
      return;
    }
    
    // Réinitialiser l'animation
    animatedValue.setValue(0);
    
    Animated.sequence([
      Animated.delay(startDelay),
      Animated.timing(animatedValue, {
        toValue: targetValue,
        duration,
        easing: DesignTokens.animation.easing.easeOut,
        useNativeDriver: false,
      })
    ]).start();
    
    // Listener pour mettre à jour la valeur affichée
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.floor(value).toLocaleString());
    });
    
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [targetValue, animatedValue, duration, startDelay]);
  
  return displayValue;
};

/**
 * Hook pour animer l'entrée d'un élément avec déplacement et opacité
 * Approche entièrement différente
 */
const useSlideIn = (direction: 'up' | 'down' | 'left' | 'right' = 'up', delay: number = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translation = useRef(new Animated.Value(direction === 'up' || direction === 'down' ? 
    (direction === 'up' ? 15 : -15) : 
    (direction === 'left' ? 15 : -15)
  )).current;
  
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: DesignTokens.animation.duration.normal,
          easing: DesignTokens.animation.easing.smooth,
          useNativeDriver: true,
        }),
        Animated.timing(translation, {
          toValue: 0,
          duration: DesignTokens.animation.duration.normal + 50,
          easing: DesignTokens.animation.easing.smooth,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [opacity, translation, delay]);
  
  return {
    opacity,
    transform: direction === 'up' || direction === 'down'
      ? [{ translateY: translation }]
      : [{ translateX: translation }]
  };
};

/**
 * Composant RankingHeader complètement repensé
 * Design minimaliste moderne avec approche card-based
 */
const RankingHeader: React.FC<RankingHeaderProps> = memo(({ 
  userRanking, 
  totalUsers, 
  cityName,
  isLoading = false,
  onPress,
  style,
  testID,
}) => {
  // Animation du compteur pour les statistiques
  const rankingDisplay = useAnimatedCounter(userRanking, 1500, 300);
  const totalDisplay = useAnimatedCounter(totalUsers, 1800, 600);
  
  // Animations d'entrée
  const headerAnimation = useSlideIn('up', 0);
  const rankAnimation = useSlideIn('left', 200);
  const totalAnimation = useSlideIn('right', 300);
  const messageAnimation = useSlideIn('up', 500);
  
  // Animation de pulsation pour l'accent
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Animation de pulsation subtile
    const pulsate = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: DesignTokens.animation.easing.smooth,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: DesignTokens.animation.easing.smooth,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
      ]).start(pulsate);
    };
    
    pulsate();
    
    // Feedback haptique subtil au montage
    if (IS_IOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim]);

  // Déterminer le statut en fonction du classement
  const { rank, icon, color, message } = useMemo(() => {
    if (isLoading) {
      return {
        rank: '-',
        icon: 'sync-outline',
        color: DesignTokens.colors.neutral[500],
        message: 'Chargement des données...',
      };
    }
    
    if (!userRanking || !totalUsers) {
      return {
        rank: '-',
        icon: 'help-circle-outline',
        color: DesignTokens.colors.neutral[500],
        message: 'Données indisponibles pour le moment',
      };
    }
    
    // Calculer le percentile
    const percentile = (userRanking / totalUsers) * 100;
    
    if (userRanking === 1) {
      return {
        rank: '#1',
        icon: 'trophy-outline',
        color: DesignTokens.colors.gold[500],
        message: 'Leader de la communauté',
      };
    }
    
    if (userRanking <= 3) {
      return {
        rank: `#${userRanking}`,
        icon: 'podium-outline',
        color: DesignTokens.colors.gold[400],
        message: 'Sur le podium',
      };
    }
    
    if (userRanking <= Math.ceil(totalUsers * 0.1)) {
      return {
        rank: `#${userRanking}`,
        icon: 'star-outline',
        color: DesignTokens.colors.teal[500],
        message: `Top ${Math.ceil(percentile)}%`,
      };
    }
    
    return {
      rank: `#${userRanking}`,
      icon: 'stats-chart-outline',
      color: DesignTokens.colors.teal[400],
      message: `Vous devancez ${Math.floor(100 - percentile)}% des utilisateurs`,
    };
  }, [userRanking, totalUsers, isLoading]);

  // Gestion des pressions avec retour haptique
  const handlePress = () => {
    if (IS_IOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress && onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={!onPress}
      testID={testID}
      style={style}
    >
      <Animated.View 
        style={[
          styles.container,
          headerAnimation,
        ]}
      >
        {/* En-tête avec nom de la communauté */}
        <View style={styles.header}>
          <View style={styles.locationIndicator}>
            <View style={styles.locationDot} />
          </View>
          <Text style={styles.locationLabel}>
            COMMUNAUTÉ
          </Text>
          <Text style={styles.cityName}>
            {isLoading ? "Chargement..." : (cityName || "Non spécifiée")}
          </Text>
        </View>
        
        {/* Section des statistiques */}
        <View style={styles.statsContainer}>
          {/* Carte de classement */}
          <Animated.View style={[
            styles.statCard,
            rankAnimation,
          ]}>
            <View style={styles.cardHeader}>
              <Ionicons 
                name={icon as any} 
                size={16} 
                color={color} 
              />
              <Text style={styles.cardTitle}>
                Classement
              </Text>
            </View>
            
            <Animated.View 
              style={[
                styles.rankContainer, 
                { borderColor: color },
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Text style={[styles.rankValue, { color }]}>
                {isLoading ? "-" : rankingDisplay}
              </Text>
            </Animated.View>
            
            <Text style={styles.rankLabel}>
              {message}
            </Text>
          </Animated.View>
          
          {/* Carte du total d'utilisateurs */}
          <Animated.View style={[
            styles.statCard,
            totalAnimation,
          ]}>
            <View style={styles.cardHeader}>
              <Ionicons 
                name="people-outline" 
                size={16} 
                color={DesignTokens.colors.teal[600]} 
              />
              <Text style={styles.cardTitle}>
                Utilisateurs
              </Text>
            </View>
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalValue}>
                {isLoading ? "-" : totalDisplay}
              </Text>
            </View>
            
            <Text style={styles.totalLabel}>
              {isLoading ? "Chargement..." : "Participants"}
            </Text>
          </Animated.View>
        </View>
        
        {/* Barre de progression - Élément visuel complètement nouveau */}
        <Animated.View style={[
          styles.progressContainer,
          messageAnimation,
        ]}>
          {!isLoading && userRanking && totalUsers && (
            <>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${Math.max(5, 100 - (userRanking / totalUsers * 100))}%` },
                    { backgroundColor: color }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {userRanking === 1
                  ? "Félicitations, vous êtes en tête du classement !"
                  : `À ${userRanking === 2 ? 'seulement une' : userRanking - 1} place${userRanking > 2 ? 's' : ''} du sommet`
                }
              </Text>
            </>
          )}
          
          {(isLoading || !userRanking || !totalUsers) && (
            <Text style={styles.progressText}>
              {isLoading ? "Calcul de votre positionnement..." : "Données insuffisantes pour l'analyse"}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: DesignTokens.radius.lg,
    padding: DesignTokens.spacing.lg,
    margin: DesignTokens.spacing.lg,
    ...DesignTokens.elevation.medium,
  },
  header: {
    marginBottom: DesignTokens.spacing.xl,
    alignItems: 'center',
  },
  locationIndicator: {
    width: 36,
    height: 36,
    borderRadius: DesignTokens.radius.full,
    backgroundColor: DesignTokens.colors.teal[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.xs,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: DesignTokens.radius.full,
    backgroundColor: DesignTokens.colors.teal[500],
  },
  locationLabel: {
    fontSize: DesignTokens.typography.size.xs,
    color: DesignTokens.colors.neutral[500],
    letterSpacing: DesignTokens.typography.letterSpacing.wide,
    marginBottom: DesignTokens.spacing.xs,
  },
  cityName: {
    fontSize: DesignTokens.typography.size.lg,
    fontWeight: DesignTokens.typography.weight.bold as "400" | "500" | "600" | "700" | 500 | "normal" | "bold" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
    color: DesignTokens.colors.neutral[900],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: DesignTokens.colors.neutral[50],
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.md,
    alignItems: 'center',
    maxWidth: '48%',
    ...DesignTokens.elevation.low,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  cardTitle: {
    fontSize: DesignTokens.typography.size.xs,
    fontWeight: DesignTokens.typography.weight.semibold as "400" | "500" | "600" | "700" | 500 | "normal" | "bold" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
    color: DesignTokens.colors.neutral[600],
    marginLeft: DesignTokens.spacing.xs,
  },
  rankContainer: {
    width: 70,
    height: 70,
    borderRadius: DesignTokens.radius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: DesignTokens.spacing.sm,
  },
  rankValue: {
    fontSize: DesignTokens.typography.size.xl,
    fontWeight: DesignTokens.typography.weight.bold as "400" | "500" | "600" | "700" | 500 | "normal" | "bold" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
  },
  rankLabel: {
    fontSize: DesignTokens.typography.size.xs,
    fontWeight: DesignTokens.typography.weight.medium as "400" | "500" | "600" | "700" | 500 | "normal" | "bold" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
    color: DesignTokens.colors.neutral[600],
    textAlign: 'center',
    marginTop: DesignTokens.spacing.xs,
  },
  totalContainer: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: DesignTokens.spacing.sm,
  },
  totalValue: {
    fontSize: DesignTokens.typography.size.xl,
    fontWeight: DesignTokens.typography.weight.bold as "400" | "500" | "600" | "700" | 500 | "normal" | "bold" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
    color: DesignTokens.colors.teal[600],
  },
  totalLabel: {
    fontSize: DesignTokens.typography.size.xs,
    fontWeight: DesignTokens.typography.weight.medium as "400" | "500" | "600" | "700" | 500 | "normal" | "bold" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
    color: DesignTokens.colors.neutral[600],
    textAlign: 'center',
    marginTop: DesignTokens.spacing.xs,
  },
  progressContainer: {
    backgroundColor: DesignTokens.colors.neutral[50],
    borderRadius: DesignTokens.radius.md,
    padding: DesignTokens.spacing.md,
    ...DesignTokens.elevation.low,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: DesignTokens.colors.neutral[200],
    borderRadius: DesignTokens.radius.full,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: DesignTokens.radius.full,
  },
  progressText: {
    fontSize: DesignTokens.typography.size.sm,
    fontWeight: DesignTokens.typography.weight.medium as "bold" | "400" | "500" | "600" | "700" | 500 | "normal" | "100" | "200" | "300" | "800" | "900" | 100 | 200 | 300 | 400 | 600 | 700 | 800 | 900 | "ultralight" | "thin" | "light" | "medium" | undefined,
    color: DesignTokens.colors.neutral[700],
    textAlign: 'center',
  },
});

export default RankingHeader;