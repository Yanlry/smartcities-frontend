// Chemin : components/ranking/TopUsersSection.tsx

import React, { memo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Platform, 
  Dimensions 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay, 
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
  withRepeat
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const IS_IOS = Platform.OS === 'ios';

/**
 * Système de design pour le podium
 */
const DesignSystem = {
  colors: {
    // Couleurs du podium avec nuances
    podium: {
      first: {
        primary: '#FFD700',     // Or
        secondary: '#FFC000',   // Or foncé
        tertiary: '#FFED8A',    // Or clair
        accent: '#FFF6C2',      // Accent doré
        text: '#89650E',        // Texte sur or
      },
      second: {
        primary: '#C0C0C0',     // Argent
        secondary: '#A9A9A9',   // Argent foncé
        tertiary: '#E0E0E0',    // Argent clair
        accent: '#F5F5F5',      // Accent argenté
        text: '#5F5F5F',        // Texte sur argent
      },
      third: {
        primary: '#CD7F32',     // Bronze
        secondary: '#A86E33',   // Bronze foncé
        tertiary: '#DDA05F',    // Bronze clair
        accent: '#F0CFB0',      // Accent bronze
        text: '#6E4B16',        // Texte sur bronze
      }
    },
    // Couleurs générales
    general: {
      background: '#FFFFFF',
      cardBackground: '#FFFFFF',
      primaryText: '#2C3E50',
      secondaryText: '#6C7A89',
      accent: '#3498DB',
      lightAccent: 'rgba(52, 152, 219, 0.1)',
      border: '#E0E6ED',
      shadowLight: 'rgba(0, 0, 0, 0.05)',
      shadowMedium: 'rgba(0, 0, 0, 0.1)'
    },
    // Effets glassmorphiques
    glass: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.5)',
      highlight: 'rgba(255, 255, 255, 0.9)',
      shadow: 'rgba(0, 0, 0, 0.05)'
    }
  },
  // Rayons des bords
  radius: {
    small: 6,
    medium: 12,
    large: 20,
    pill: 100
  },
  // Ombres et élévations
  shadows: {
    light: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      })
    },
    medium: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: {
          elevation: 5,
        },
      })
    },
    strong: {
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: {
          elevation: 10,
        },
      })
    }
  },
  // Espacements
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  // Animations
  animation: {
    duration: {
      fast: 300,
      medium: 500,
      slow: 800
    },
    easing: {
      standard: Easing.bezier(0.4, 0.0, 0.2, 1),
      decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
      accelerate: Easing.bezier(0.4, 0.0, 1, 1),
      bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275)
    }
  }
};

/**
 * Interface pour les utilisateurs
 */
interface User {
  id: number;
  ranking: number;
  photo?: string;
  useFullName?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  voteCount?: number;
}

/**
 * Interface des props du composant
 */
interface TopUsersSectionProps {
  topUsers: User[];
  onUserPress: (userId: number) => void;
}

/**
 * Header de section avec animation et style distinctif
 */
const SectionHeader = memo(() => {
  // Animation de titre
  const titleOpacity = useSharedValue(0);
  const titleScale = useSharedValue(0.9);
  const titleTranslateY = useSharedValue(-10);
  const subtitleOpacity = useSharedValue(0);
  const underlineWidth = useSharedValue(0);
  
  // Démarrer les animations
  useEffect(() => {
    // Animation du titre
    titleOpacity.value = withTiming(1, {
      duration: DesignSystem.animation.duration.medium,
      easing: DesignSystem.animation.easing.standard
    });
    
    titleScale.value = withTiming(1, {
      duration: DesignSystem.animation.duration.medium,
      easing: DesignSystem.animation.easing.standard
    });
    
    titleTranslateY.value = withTiming(0, {
      duration: DesignSystem.animation.duration.medium,
      easing: DesignSystem.animation.easing.standard
    });
    
    // Animation du sous-titre avec délai
    subtitleOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: DesignSystem.animation.duration.medium,
        easing: DesignSystem.animation.easing.standard
      })
    );
    
    // Animation de la ligne de séparation
    underlineWidth.value = withDelay(
      300,
      withTiming(120, {
        duration: DesignSystem.animation.duration.medium,
        easing: DesignSystem.animation.easing.decelerate
      })
    );
  }, []);
  
  // Styles animés
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { scale: titleScale.value },
      { translateY: titleTranslateY.value }
    ]
  }));
  
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value
  }));
  
  const underlineStyle = useAnimatedStyle(() => ({
    width: underlineWidth.value
  }));

  return (
    <View style={styles.headerContainer}>
      <Animated.Text style={[styles.title, titleStyle]}>
        Podium
      </Animated.Text>
      
      <Animated.View style={[styles.titleUnderline, underlineStyle]}>
        <LinearGradient
          colors={['#3498DB', '#2980B9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underlineGradient}
        />
      </Animated.View>
      
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        Les meilleurs citoyens
      </Animated.Text>
    </View>
  );
});

/**
 * Composant UserPodiumItem - Élément de podium individuel
 */
const UserPodiumItem = memo(({
  user,
  position,
  delay,
  onPress
}: {
  user: User;
  position: 'first' | 'second' | 'third';
  delay: number;
  onPress: () => void;
}) => {
  // Valeurs animées
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const podiumHeight = useSharedValue(0);
  const crownBounce = useSharedValue(0);
  const shimmerPosition = useSharedValue(-100);
  
  // Couleurs et dimensions basées sur la position
  const colors = DesignSystem.colors.podium[position];
  const photoSize = position === 'first' ? 66 : position === 'second' ? 60 : 56;
  const crownSize = position === 'first' ? 16 : position === 'second' ? 12 : 10;
  const podiumBaseHeight = position === 'first' ? 70 : position === 'second' ? 55 : 40;
  
  // Récupérer le nom d'affichage de l'utilisateur
  const userName = user.useFullName && user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.username || "Utilisateur";
  
  // Démarrer les animations
  useEffect(() => {
    // Animation d'entrée décalée
    translateY.value = withDelay(
      delay,
      withSpring(0, {
        damping: 12,
        stiffness: 100,
      })
    );
    
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: DesignSystem.animation.duration.medium,
        easing: DesignSystem.animation.easing.standard
      })
    );
    
    scale.value = withDelay(
      delay, 
      withSpring(1, {
        damping: 15,
        stiffness: 120,
      })
    );
    
    // Animation du podium qui s'élève
    podiumHeight.value = withDelay(
      delay + 200,
      withTiming(podiumBaseHeight, {
        duration: DesignSystem.animation.duration.medium,
        easing: DesignSystem.animation.easing.bounce
      })
    );
    
    // Animation de rebond pour la couronne
    crownBounce.value = withDelay(
      delay + 400,
      withRepeat(
        withSequence(
          withTiming(1.2, { 
            duration: 600, 
            easing: DesignSystem.animation.easing.bounce 
          }),
          withTiming(1, { 
            duration: 600, 
            easing: DesignSystem.animation.easing.standard 
          })
        ),
        2,
        true
      )
    );
    
    // Animation d'effet brillant sur le podium
    shimmerPosition.value = withDelay(
      delay + 600,
      withRepeat(
        withTiming(width, { 
          duration: 2000, 
          easing: DesignSystem.animation.easing.standard 
        }),
        -1,
        false
      )
    );
  }, [delay, opacity, scale, translateY, podiumHeight, crownBounce, shimmerPosition]);
  
  // Styles animés
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value }
    ]
  }));
  
  const podiumStyle = useAnimatedStyle(() => ({
    height: podiumHeight.value
  }));
  
  const crownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownBounce.value }]
  }));
  
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }]
  }));
  
  // Feedback tactile sur pression
  const handlePress = () => {
    if (IS_IOS) {
      Haptics.impactAsync(position === 'first' 
        ? Haptics.ImpactFeedbackStyle.Medium 
        : Haptics.ImpactFeedbackStyle.Light
      );
    }
    
    // Animation de rebond au toucher
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
    
    onPress();
  };
  
  return (
    <View style={styles.podiumCol}>
      <Animated.View style={[styles.userContainer, containerStyle]}>
        <TouchableOpacity 
          style={styles.userTouchable}
          onPress={handlePress}
          activeOpacity={0.9}
        >
          {/* Couronne animée */}
          <Animated.View style={[
            styles.crownBase,
            position === 'first' ? styles.crownFirst : 
              position === 'second' ? styles.crownSecond : 
                styles.crownThird,
            crownStyle
          ]}>
            <LinearGradient 
              colors={[colors.tertiary, colors.primary]} 
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.crownGradient}
            >
              <FontAwesome5 
                name="crown" 
                size={crownSize} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </Animated.View>
          
          {/* Photo de profil avec effet glassmorphique */}
          <View style={[
            styles.photoContainer,
            { 
              borderColor: colors.primary,
              width: photoSize + 6,
              height: photoSize + 6,
              borderRadius: (photoSize + 6) / 2
            }
          ]}>
            <BlurView intensity={IS_IOS ? 25 : 15} tint="light" style={styles.photoBlur}>
              <Image 
                source={{ uri: user.photo || "https://via.placeholder.com/150" }}
                style={{
                  width: photoSize,
                  height: photoSize,
                  borderRadius: photoSize / 2,
                }}
              />
              
              {/* Effet brillant sur la photo */}
              <View style={[
                styles.photoShine,
                { borderRadius: photoSize / 2 }
              ]} />
            </BlurView>
          </View>
          
          {/* Nom de l'utilisateur */}
          <BlurView 
            intensity={IS_IOS ? 60 : 20} 
            tint="light" 
            style={styles.userNameContainer}
          >
            <Text style={[
              styles.userName, 
              { color: DesignSystem.colors.general.primaryText }
            ]} numberOfLines={1}>
              {userName}
            </Text>
          </BlurView>
          
          {/* Badge de score */}
          <View style={styles.scoreChipContainer}>
            <BlurView 
              intensity={IS_IOS ? 70 : 25} 
              tint="light" 
              style={styles.scoreChip}
            >
              <View style={styles.scoreInner}>
                <LinearGradient
                  colors={[colors.secondary, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.scoreIconContainer}
                >
                  <FontAwesome5 name="star" size={8} color="#FFFFFF" />
                </LinearGradient>
                <Text style={[
                  styles.scoreText,
                  { color: colors.text }
                ]}>
                  {user.voteCount || 0} pts
                </Text>
              </View>
            </BlurView>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Podium animé */}
      <Animated.View style={[
        styles.podiumBase,
        {
          backgroundColor: colors.primary,
          width: position === 'first' ? 70 : 60,
        },
        podiumStyle
      ]}>
        {/* Effet brillant animé sur le podium */}
        <Animated.View style={[styles.shimmerEffect, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
        
        <Text style={styles.position}>{user.ranking}</Text>
        
        {/* Ombre de profondeur sur le dessus du podium */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'transparent']}
          style={styles.podiumTopShadow}
        />
      </Animated.View>
    </View>
  );
});

/**
 * Composant principal TopUsersSection
 */
const TopUsersSection: React.FC<TopUsersSectionProps> = memo(({ 
  topUsers, 
  onUserPress 
}) => {
  // Sort users by ranking
  const sortedUsers = [...topUsers].sort((a, b) => a.ranking - b.ranking);
  
  // Get users by position
  const firstPlace = sortedUsers.find(user => user.ranking === 1);
  const secondPlace = sortedUsers.find(user => user.ranking === 2);
  const thirdPlace = sortedUsers.find(user => user.ranking === 3);

  return (
    <View style={styles.container}>
      <BlurView intensity={IS_IOS ? 50 : 20} tint="light" style={styles.containerBlur}>
        {/* Overlay dégradé pour effet de profondeur */}
        <LinearGradient
          colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        {/* En-tête de section distinct */}
        <SectionHeader />
        
        {/* Ligne de séparation avec dégradé */}
        <View style={styles.divider}>
          <LinearGradient
            colors={['rgba(52, 152, 219, 0.1)', 'rgba(52, 152, 219, 0.3)', 'rgba(52, 152, 219, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.dividerGradient}
          />
        </View>
        
        <View style={styles.podiumContainer}>
          {/* Second Place */}
          {secondPlace && (
            <UserPodiumItem
              user={secondPlace}
              position="second"
              delay={300}
              onPress={() => onUserPress(secondPlace.id)}
            />
          )}
          
          {/* First Place */}
          {firstPlace && (
            <UserPodiumItem
              user={firstPlace}
              position="first"
              delay={100}
              onPress={() => onUserPress(firstPlace.id)}
            />
          )}
          
          {/* Third Place */}
          {thirdPlace && (
            <UserPodiumItem
              user={thirdPlace}
              position="third"
              delay={500}
              onPress={() => onUserPress(thirdPlace.id)}
            />
          )}
        </View>
      </BlurView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignSystem.spacing.md,
    borderRadius: DesignSystem.radius.medium,
    overflow: 'hidden',
    ...DesignSystem.shadows.medium,
    height: 350, // Hauteur ajustée pour accommoder l'en-tête distinct
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  containerBlur: {
    flex: 1,
    padding: DesignSystem.spacing.md,
  },
  // Section d'en-tête
  headerContainer: {
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.md,
    paddingTop: DesignSystem.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: DesignSystem.colors.general.primaryText,
    marginBottom: DesignSystem.spacing.xxs,
  },
  titleUnderline: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.sm,
  },
  underlineGradient: {
    height: '100%',
    width: '100%',
  },
  subtitle: {
    fontSize: 13,
    color: DesignSystem.colors.general.secondaryText,
    marginBottom: DesignSystem.spacing.xs,
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: DesignSystem.spacing.md,
  },
  dividerGradient: {
    width: '100%',
    height: '100%',
  },
  // Section podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flex: 1,
    paddingBottom: DesignSystem.spacing.sm,
  },
  podiumCol: {
    alignItems: 'center',
    marginHorizontal: DesignSystem.spacing.sm,
  },
  userContainer: {
    marginBottom: DesignSystem.spacing.md,
  },
  userTouchable: {
    alignItems: 'center',
    width: 90,
  },
  photoContainer: {
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: DesignSystem.spacing.sm,
    ...DesignSystem.shadows.light,
  },
  photoBlur: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  photoShine: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 15,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    transform: [{ rotate: '45deg' }],
  },
  userNameContainer: {
    marginBottom: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs / 2,
    borderRadius: DesignSystem.radius.small,
    width: '100%',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreChipContainer: {
    overflow: 'hidden',
    borderRadius: DesignSystem.radius.pill,
    ...DesignSystem.shadows.light,
  },
  scoreChip: {
    overflow: 'hidden',
    borderRadius: DesignSystem.radius.pill,
  },
  scoreInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  scoreIconContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignSystem.spacing.xs,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  crownBase: {
    position: 'absolute',
    top: -12,
    zIndex: 10,
    ...DesignSystem.shadows.light,
  },
  crownGradient: {
    padding: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.radius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownFirst: {
    top: -14,
  },
  crownSecond: {
    top: -10,
  },
  crownThird: {
    top: -8,
  },
  podiumBase: {
    borderTopLeftRadius: DesignSystem.radius.small,
    borderTopRightRadius: DesignSystem.radius.small,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...DesignSystem.shadows.light,
  },
  position: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  shimmerGradient: {
    height: '100%',
    width: 50,
    transform: [{ skewX: '-30deg' }],
  },
  podiumTopShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
});

export default TopUsersSection;