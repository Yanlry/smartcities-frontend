// components/home/RankBadge.tsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
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
  Dimensions,
  InteractionManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BadgeStyle } from "./user.types";

// Activer LayoutAnimation pour Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Interface pour les propriétés du composant RankBadge
 */
// Chemin: components/home/RankBadge.tsx

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

// Constantes pour les animations et le layout
const PARTICLE_COUNT = 8; 
const BATCH_SIZE = 8; 
const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Composant RankBadge - Affiche le rang de l'utilisateur avec des effets visuels
 * Optimisé pour les performances avec des animations fluides
 */
const RankBadge: React.FC<RankBadgeProps> = ({
  ranking,
  rankingSuffix,
  totalUsers,
  onNavigateToRanking,
  badgeStyle,
  onShowBadgeModal,
  showStatsSection = true
}) => {
  // États locaux
  const [expanded, setExpanded] = useState<boolean>(false);
  const [glowIntensity, setGlowIntensity] = useState<number>(0.3);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Références pour gérer les animations et timers
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const glowIncreasing = useRef<boolean>(true);
  const isInitialRender = useRef<boolean>(true);
  const animationHandlesRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Valeurs d'animation
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const bounceAnim = useMemo(() => new Animated.Value(0), []);

  /**
   * Interface pour les particules d'animation
   */
  interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: Animated.Value;
    position: Animated.ValueXY;
    delay: number;
  }

  // Calcul du percentile (position relative dans le classement)
  const percentile = useMemo((): number => {
    if (!ranking || !totalUsers) return 0;
    return ((totalUsers - ranking + 1) / totalUsers) * 100;
  }, [ranking, totalUsers]);

  // Définir les couleurs de la barre de progression en fonction du rang
  const getProgressColors = useMemo(() => {
    if (ranking === 1) return { 
      barColor: "#fff", // Or
      glowColor: "#FFD700",
      glowOpacity: 0.8
    };
    if (ranking === 2) return { 
      barColor: "#fff", // Argent
      glowColor: "#C0C0C0",
      glowOpacity: 0.7
    };
    if (ranking === 3) return { 
      barColor: "#ccc", // Bronze
      glowColor: "#CD7F32",
      glowOpacity: 0.6
    };
    return { 
      barColor: "#FFFFFF", // Blanc pour les autres rangs
      glowColor: "#FFFFFF",
      glowOpacity: 0.5
    };
  }, [ranking]);

  // Configuration des couleurs du gradient en fonction du classement
  const getGradientColors = useMemo((): [string, string, ...string[]] => {
    if (ranking === 1) return ["#FFD700", "#FFC107", "#FFB300"]; // dégradé or
    if (ranking === 2) return ["#C0C0C0", "#D3D3D3", "#E5E4E2"]; // dégradé argent
    if (ranking === 3) return ["#CD7F32", "#C88B35", "#B87333"]; // dégradé bronze
    if (ranking && ranking <= 10) {
      // Pour les rangs 4 à 10, utilisation d'un dégradé violet (modifiable selon vos préférences)
      return ["#8A2BE2", "#9370DB", "#BA55D3"];
    }
    // Pour les rangs au-delà de 10, utilisation d'un dégradé teal
    return ["#20B2AA", "#3CB371", "#2E8B57"];
  }, [ranking]);

  // Effet de lueur (shadow) statique basé sur le ranking
  const getGlowStyle = useMemo(() => {
    if (ranking === 1) {
      return {
        shadowColor: "#FFD700",
        shadowOpacity: glowIntensity,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 10,
      };
    }
    if (ranking === 2) {
      return {
        shadowColor: "#C0C0C0",
        shadowOpacity: glowIntensity * 0.8,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 8,
      };
    }
    if (ranking === 3) {
      return {
        shadowColor: "#CD7F32",
        shadowOpacity: glowIntensity * 0.7,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
      };
    }
    return {
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 8,
    };
  }, [ranking, glowIntensity]);

  // Configuration de l'icône en fonction du classement
  const getTrophyIcon = useMemo(() => {
    if (ranking === 1)
      return { name: "trophy" as const, color: "#FFD700", size: 24 };
    if (ranking === 2)
      return { name: "trophy" as const, color: "#C0C0C0", size: 22 };
    if (ranking === 3)
      return { name: "trophy" as const, color: "#CD7F32", size: 22 };
    if (ranking && ranking <= 10)
      return { name: "ribbon" as const, color: "#FFFFFF", size: 15 };
    return { name: "stats-chart" as const, color: "#FFFFFF", size: 15 };
  }, [ranking]);

  // Obtenir le label pour le classement
  const getRankLabel = useMemo((): string => {
    if (ranking === 1) return "Champion";
    if (ranking === 2) return "Challenger";
    if (ranking === 3) return "TOP 3";
    if (ranking && ranking <= 10) return "TOP 10";
    if (ranking && ranking <= 50) return "TOP 50";
    return "Classement";
  }, [ranking]);

  // Effet pour créer et animer les particules avec batching pour améliorer les performances
  useEffect(() => {
    if (ranking === 1) {
      // Nettoyer les anciennes particules et animations lors des re-renders
      if (!isInitialRender.current) {
        animationHandlesRef.current.forEach(handle => clearTimeout(handle));
        animationHandlesRef.current = [];
        setParticles([]);
      }
      
      isInitialRender.current = false;
      
      // Utiliser InteractionManager pour différer la création des particules
      InteractionManager.runAfterInteractions(() => {
        // Fonction pour créer un batch de particules
        const createParticleBatch = (batchIndex: number): void => {
          const totalBatches = Math.ceil(PARTICLE_COUNT / BATCH_SIZE);
          if (batchIndex >= totalBatches) return;
          
          const batchStartIndex = batchIndex * BATCH_SIZE;
          const batchEndIndex = Math.min(batchStartIndex + BATCH_SIZE, PARTICLE_COUNT);
          
          const newBatchParticles = Array.from(
            { length: batchEndIndex - batchStartIndex }, 
            (_, i) => {
              const particleIndex = batchStartIndex + i;
              
              // Distribution optimisée sur toute la surface du badge
              const quadrant = particleIndex % 4;
              const quadWidth = SCREEN_WIDTH * 0.15;
              const quadHeight = 30; // Hauteur réduite
              
              // Positionnement par quadrant pour une meilleure distribution visuelle
              let baseX = 0;
              let baseY = 0;
              
              switch (quadrant) {
                case 0: // Haut gauche
                  baseX = 20 + Math.random() * quadWidth;
                  baseY = 15 + Math.random() * quadHeight;
                  break;
                case 1: // Haut droit
                  baseX = SCREEN_WIDTH * 0.6 - quadWidth + Math.random() * quadWidth;
                  baseY = 15 + Math.random() * quadHeight;
                  break;
                case 2: // Bas gauche
                  baseX = 20 + Math.random() * quadWidth;
                  baseY = 35 + Math.random() * quadHeight;
                  break;
                case 3: // Bas droit
                  baseX = SCREEN_WIDTH * 0.6 - quadWidth + Math.random() * quadWidth;
                  baseY = 35 + Math.random() * quadHeight;
                  break;
              }
              
              // Tailles variables pour plus de dynamisme visuel - réduites
              const size = (Math.random() * 2 + 1) * (particleIndex % 3 === 0 ? 1.4 : 1);
              
              // Délai d'apparition échelonné pour éviter les pics de performance
              const delay = particleIndex * (1000 / PARTICLE_COUNT);
              
              return {
                id: particleIndex,
                x: baseX,
                y: baseY,
                size,
                opacity: new Animated.Value(0),
                position: new Animated.ValueXY({ x: baseX, y: baseY }),
                delay,
              };
            }
          );
          
          // Mettre à jour l'état avec fusion des particules précédentes
          setParticles(prev => [...prev, ...newBatchParticles]);
          
          // Différer l'animation des particules de ce batch
          const batchAnimationHandle = setTimeout(() => {
            newBatchParticles.forEach(particle => {
              // Animation avec délai pour répartir la charge CPU
              const animHandle = setTimeout(() => {
                // Durée variable pour chaque particule (entre 2 et 5 secondes)
                const randomDuration = Math.random() * 3000 + 2000;
                
                // Calcul de mouvement aléatoire avec amplitude proportionnelle à la taille
                const movementScale = 1 + (particle.size / 3);
                const moveX = particle.x + (Math.random() * 30 - 15) * movementScale; // Amplitude réduite
                const moveY = particle.y + (Math.random() * 30 - 15) * movementScale; // Amplitude réduite
                
                // Animation en boucle avec séquence sophistiquée
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(particle.opacity, {
                      toValue: Math.min(0.5 + Math.random() * 0.3, 0.8), // Opacité réduite
                      duration: randomDuration * 0.25,
                      useNativeDriver: true,
                    }),
                    Animated.parallel([
                      Animated.timing(particle.position, {
                        toValue: { x: moveX, y: moveY },
                        duration: randomDuration * 0.75,
                        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                        useNativeDriver: true,
                      }),
                      Animated.timing(particle.opacity, {
                        toValue: 0,
                        duration: randomDuration * 0.75,
                        easing: Easing.linear,
                        useNativeDriver: true,
                      }),
                    ]),
                  ]),
                  { iterations: -1 }
                ).start();
              }, particle.delay);
              
              animationHandlesRef.current.push(animHandle);
            });
          }, 100);
          
          animationHandlesRef.current.push(batchAnimationHandle);
          
          // Planifier le batch suivant après un délai
          const nextBatchHandle = setTimeout(() => {
            createParticleBatch(batchIndex + 1);
          }, 150);
          
          animationHandlesRef.current.push(nextBatchHandle);
        };
        
        // Démarrer la création par batch
        createParticleBatch(0);
      });
    }
    
    // Nettoyage des animations lors du démontage
    return () => {
      animationHandlesRef.current.forEach(handle => clearTimeout(handle));
      animationHandlesRef.current = [];
    };
  }, [ranking, SCREEN_WIDTH]);

  // Animation de pulsation pour les rangs supérieurs
  useEffect(() => {
    if (ranking && ranking <= 3) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03, // Amplitude réduite
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();

      return () => pulse.stop();
    }
  }, [ranking, pulseAnim]);

  // Animation d'entrée
  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim]);

  // Animation de lueur (glow) manuelle pour les top 3
  useEffect(() => {
    if (ranking && ranking <= 3) {
      const animateGlow = () => {
        setGlowIntensity((prev) => {
          let newValue: number;
          if (glowIncreasing.current) {
            newValue = prev + 0.02;
            if (newValue >= 0.7) glowIncreasing.current = false;
          } else {
            newValue = prev - 0.02;
            if (newValue <= 0.3) glowIncreasing.current = true;
          }
          return newValue;
        });

        glowTimerRef.current = setTimeout(animateGlow, 50);
      };

      animateGlow();
    }

    return () => {
      if (glowTimerRef.current) {
        clearTimeout(glowTimerRef.current);
      }
    };
  }, [ranking]);

  // Gestion de l'expansion du badge avec animation personnalisée
  const toggleExpand = useCallback((): void => {
    LayoutAnimation.configureNext({
      duration: 250, // Durée réduite
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        duration: 150, // Durée réduite
        type: LayoutAnimation.Types.easeOut,
        property: LayoutAnimation.Properties.opacity,
      },
      create: {
        duration: 250, // Durée réduite
        type: LayoutAnimation.Types.easeIn,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setExpanded((prev) => !prev);
  }, []);

  // Optimisation: Rendre les particules par un composant mémoïsé pour réduire les re-renders
  const ParticlesEffect = useCallback((): React.ReactNode => {
    if (ranking !== 1 || particles.length === 0) return null;
    
    return (
      <>
        {particles.map((particle) => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.position.x },
                  { translateY: particle.position.y },
                  { rotate: `${(particle.id % 2 === 0 ? '' : '-')}${Math.floor(particle.id % 4) * 15}deg` }
                ],
              },
            ]}
          />
        ))}
      </>
    );
  }, [ranking, particles]);

  // Génération des étoiles basée sur le nombre défini dans badgeStyle.stars - NOUVEAU STYLE
  const renderStars = useCallback((): React.ReactNode => {
    if (!badgeStyle || typeof badgeStyle.stars !== 'number') return null;
    
    return (
      <View style={styles.starsRow}>
        {Array.from({ length: badgeStyle.stars }).map((_, index) => (
          <Ionicons
            key={index}
            name="star"
            size={14}
            color={badgeStyle.starsColor}
            style={styles.badgeStar}
          />
        ))}
        {badgeStyle.stars === 0 && (
          <Ionicons 
            name="school-outline" 
            size={14}
            color={badgeStyle.starsColor} 
          />
        )}
      </View>
    );
  }, [badgeStyle]);

// Chemin: components/home/RankBadge.tsx

// Optimisation: Rendre le contenu étendu comme composant mémoïsé
const ExpandedContent = useCallback((): React.ReactNode => {
  if (!expanded) return null;
  
  return (
    <View style={styles.expandedContent}>
      {showStatsSection !== false && (
        <>
          <View style={styles.progressWrapper}>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { 
                    width: `${percentile}%`,
                    backgroundColor: getProgressColors.barColor
                  },
                ]}
              />
              {/* Effet de lueur sur la barre de progression */}
              {ranking && ranking <= 3 && (
                <View
                  style={[
                    styles.progressGlow,
                    {
                      width: `${percentile}%`,
                      backgroundColor: getProgressColors.barColor,
                      shadowColor: getProgressColors.glowColor,
                      opacity: getProgressColors.glowOpacity
                    },
                  ]}
                />
              )}
            </View>
            
            <Text style={styles.percentileText}>
              {percentile.toFixed(1)}%
            </Text>
          </View>

          <Text style={styles.percentileExplanation}>
            Grâce à vos votes vous dépasser {percentile.toFixed(1)}% des Smarters
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statsTextWrapper}>
              <Text style={styles.statsText}>
                {ranking === 1
                  ? `Vous êtes classé 1er sur ${totalUsers?.toLocaleString() || "?"} Smarters`
                  : `#${ranking} / ${totalUsers?.toLocaleString() || "?"}`}
              </Text>
              {ranking && ranking <= 10 && ranking !== 1 && (
                <Text style={styles.prestigeText}>
                  Statut Privilégié
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={onNavigateToRanking}
              activeOpacity={0.7}
            >
              <Text style={styles.detailsText}>Classement</Text>
              <Ionicons
                name="chevron-forward"
                size={10}
                color="#FFFFFF"
                style={styles.detailsIcon}
              />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* NOUVEAU STYLE DU BADGE */}
      {badgeStyle && onShowBadgeModal && (
        <TouchableOpacity 
          style={styles.badgeCardContainer}
          onPress={onShowBadgeModal}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FFFFFF', `${badgeStyle.backgroundColor}50`]}
            style={styles.badgeCardGradient}
          >
            <View style={styles.badgeHeader}>
              <View style={[
                styles.badgeCircle, 
                { borderColor: badgeStyle.borderColor }
              ]}>
                {badgeStyle.icon || (
                  <Ionicons 
                    name="trophy" 
                    size={22} 
                    color={badgeStyle.starsColor} 
                  />
                )}
              </View>
              
              <View style={styles.badgeTitleContainer}>
                <Text style={styles.badgeTitle}>
                  {badgeStyle.title}
                </Text>
                <Text style={styles.badgeDescription}>
                  Niveau actuel
                </Text>
              </View>
              
              {renderStars()}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}, [
  expanded, 
  percentile, 
  ranking, 
  totalUsers, 
  getProgressColors, 
  onNavigateToRanking, 
  badgeStyle,
  onShowBadgeModal,
  renderStars,
  showStatsSection  // Ajoutez cette dépendance
]);

  return (
    <View style={[styles.outerWrapper, getGlowStyle]}>
      <Animated.View
        style={[
          styles.containerWrapper,
          {
            transform: [
              { scale: pulseAnim },
              { scale: bounceAnim },
              {
                translateY: bounceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
            opacity: bounceAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.container}
          onPress={toggleExpand}
          activeOpacity={0.85}
          onLongPress={onNavigateToRanking}
        >
          <LinearGradient
            colors={getGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Effet de particules scintillantes pour le rang 1 */}
            <ParticlesEffect />

            <View style={styles.badgeContent}>
              {/* Icône et position */}
              <View style={styles.badgeHeader}>
              <View
  style={[
    styles.trophyWrapper,
    ranking === 1 && styles.firstPlaceTrophy,
    ranking === 2 && styles.secondPlaceTrophy,
    ranking === 3 && styles.thirdPlaceTrophy,
  ]}
>
  <Ionicons
    name={getTrophyIcon.name}
    size={getTrophyIcon.size}
    color={getTrophyIcon.color}
  />
</View>

                <View style={styles.rankInfo}>
                  <Text style={styles.rankLabel}>{getRankLabel}</Text>
                  <Text style={styles.rankNumber}>
                    #{ranking}
                    {rankingSuffix}
                  </Text>
                </View>

                <View style={styles.expandButton}>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={12}
                    color="#FFF"
                  />
                </View>
              </View>

              {/* Contenu étendu mémoïsé */}
              <ExpandedContent />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// Styles optimisés et améliorés avec le nouveau design des badges
const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: 16,
    margin: 6,
  },
  containerWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
  },
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    borderRadius: 16,
  },
  badgeContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  particle: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
    zIndex: 1,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  trophyWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginLeft: 2,
    marginTop: 3,
  },
  firstPlaceTrophy: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.6)",
  },
  secondPlaceTrophy: {
    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "rgba(192, 192, 192, 0.5)",
  },
  thirdPlaceTrophy: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(205, 127, 50, 0.5)",
  },
  rankInfo: {
    flex: 1,
    marginLeft: 10,
  },
  rankLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
    marginBottom: 0,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  rankNumber: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  expandButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  expandedContent: {
    marginTop: 8,
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 14,
  },
  progressContainer: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 3,
    overflow: "hidden",
    flex: 1,
    marginRight: 8,
    position: "relative",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
    position: "absolute",
  },
  progressGlow: {
    position: "absolute",
    height: "100%",
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    left: 0,
    top: 0,
  },
  percentileText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
    width: 40,
    textAlign: "right",
  },
  percentileExplanation: {
    color: '#fff',
    fontSize: 10,
    fontStyle: 'italic', 
    marginTop: 2,
    marginBottom: 4,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    height: 24,
  },
  statsTextWrapper: {
    flex: 1,
    marginRight: 6,
  },
  statsText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 11,
    fontWeight: "500",
  },
  prestigeText: {
    color: "#FFD700",
    fontSize: 9,
    marginTop: 1,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  detailsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  detailsText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  detailsIcon: {
    marginLeft: 2,
  },
  championBadge: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 8,
    padding: 4,
    marginTop: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  championText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 10,
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // NOUVEAU STYLE DE BADGE - comme dans BadgeModal
  badgeCardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeCardGradient: {
    padding: 12,
    borderRadius: 12,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeTitleContainer: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#062C41',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#666666',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeStar: {
    marginHorizontal: 1,
  },
  badgeActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  viewDetailsText: {
    fontSize: 10,
    color: '#666666',
    marginRight: 3,
  },
});

export default memo(RankBadge);