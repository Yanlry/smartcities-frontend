// Chemin : components/profile/InfoTab/UserInfoTab.tsx

import React, { memo, useMemo, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
  Pressable
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '@react-navigation/native';
import { UserInfoTabProps } from '../../../types/features/profile/tabs.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Système de thème avec couleurs, ombres et animations pour une interface premium
 */
const THEME = {
  colors: {
    // Dégradés primaires (bleus)
    primary: {
      gradient: ['#2E5BFF', '#1E40AF'] as [string, string],
      default: '#2E5BFF',
      dark: '#1E40AF',
      light: '#60A5FA',
      background: 'rgba(46, 91, 255, 0.08)'
    },
    // Dégradés secondaires (cyans)
    secondary: {
      gradient: ['#00C6A7', '#00A3C4'] as [string, string],
      default: '#00C6A7',
      dark: '#00A3C4',
      light: '#22D3EE',
      background: 'rgba(0, 198, 167, 0.08)'
    },
    // Dégradé accent (orange-rose)
    accent: {
      gradient: ['#F97316', '#DB2777'] as [string, string],
      default: '#F97316',
      dark: '#DB2777',
      light: '#FDBA74',
      background: 'rgba(249, 115, 22, 0.08)'
    },
    // Couleurs d'état
    status: {
      success: {
        default: '#22C55E',
        dark: '#16A34A',
        light: '#86EFAC',
        background: 'rgba(34, 197, 94, 0.15)',
        gradient: ['#22C55E', '#16A34A'] as [string, string]
      },
      warning: {
        default: '#F59E0B',
        dark: '#D97706',
        light: '#FCD34D',
        background: 'rgba(245, 158, 11, 0.15)',
        gradient: ['#F59E0B', '#D97706'] as [string, string]
      },
      error: {
        default: '#EF4444',
        dark: '#DC2626',
        light: '#FCA5A5',
        background: 'rgba(239, 68, 68, 0.15)',
        gradient: ['#EF4444', '#DC2626'] as [string, string]
      },
      info: {
        default: '#38BDF8',
        dark: '#0EA5E9',
        light: '#BAE6FD',
        background: 'rgba(56, 189, 248, 0.15)',
        gradient: ['#38BDF8', '#0EA5E9'] as [string, string]
      }
    },
    // Échelle de gris
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    },
    // Couleurs de base
    white: '#FFFFFF',
    black: '#000000',
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      tertiary: '#6B7280',
      placeholder: '#9CA3AF'
    },
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.85)'
    }
  },
  // Courbes d'animation et durées
  animation: {
    timing: {
      fast: 250,
      normal: 350,
      slow: 500
    },
    easing: {
      standard: Easing.bezier(0.25, 0.1, 0.25, 1),
      accelerate: Easing.bezier(0.4, 0, 1, 1),
      decelerate: Easing.bezier(0, 0, 0.2, 1),
      sharp: Easing.bezier(0.4, 0, 0.6, 1)
    },
    stagger: {
      default: 50,
      fast: 25,
      slow: 75
    }
  },
  // Système d'ombres
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    }),
    large: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16
      },
      android: {
        elevation: 8
      }
    })
  },
  // Rayons de bordure
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999
  },
  // Espacement
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  }
};

/**
 * Composant de carte pour afficher une section d'information avec animations premium
 */
interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  customStyle?: object;
  icon?: string;
  index?: number;
  accentColor?: [string, string];
}

const InfoCard: React.FC<InfoCardProps> = memo(({ 
  title, 
  children, 
  customStyle = {}, 
  icon, 
  index = 0,
  accentColor
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  
  React.useEffect(() => {
    // Animation séquentielle avec timing optimisé
    Animated.sequence([
      Animated.delay(index * THEME.animation.stagger.default),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: THEME.animation.timing.normal,
          easing: THEME.animation.easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: THEME.animation.timing.normal,
          easing: THEME.animation.easing.decelerate,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: THEME.animation.timing.normal,
          easing: THEME.animation.easing.standard,
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);

  // Dégradés par défaut ou personnalisés
  const gradientColors = accentColor || THEME.colors.primary.gradient;
  const gradientAccent = useRef([...gradientColors.map(c => `${c}22`)] as [string, string]).current;
  
  return (
    <Animated.View 
      style={[
        styles.cardAnimationWrapper,
        { 
          opacity: fadeAnim, 
          transform: [
            { translateY }, 
            { scale: scaleAnim }
          ] 
        },
      ]}
    >
      <View style={styles.cardContainer}>
        {/* Accent de couleur en haut de la carte */}
        <LinearGradient
          colors={gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardAccent}
        />
        
        <View style={[styles.cardContent, customStyle]}>
          <View style={styles.cardHeaderContainer}>
            {icon && (
              <View style={styles.cardIconContainer}>
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardIconGradient}
                >
                  <Icon name={icon} size={16} color={THEME.colors.white} />
                </LinearGradient>
              </View>
            )}
            <Text style={styles.infoCardHeader}>{title}</Text>
          </View>
          {children}
        </View>
      </View>
    </Animated.View>
  );
});
InfoCard.displayName = 'InfoCard';

/**
 * Composant pour afficher une statistique individuelle avec animation premium
 */
interface StatItemProps {
  value: number | string;
  label: string;
  icon?: string;
  maxValue?: number;
  accentColor?: [string, string];
}

const StatItem: React.FC<StatItemProps> = memo(({ 
  value, 
  label, 
  icon, 
  maxValue,
  accentColor
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState("0");
  
  React.useEffect(() => {
    // Animation parallèle avec timing optimisé
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: THEME.animation.timing.slow,
        easing: THEME.animation.easing.decelerate,
        useNativeDriver: false,
      }),
      Animated.timing(countAnim, {
        toValue: typeof value === 'number' ? value : 0,
        duration: THEME.animation.timing.slow,
        easing: THEME.animation.easing.decelerate,
        useNativeDriver: false,
      })
    ]).start();
    
    // Animation de compteur pour les valeurs numériques
    if (typeof value === 'number') {
      const listener = countAnim.addListener(({ value: v }) => {
        setDisplayValue(Math.floor(v).toString());
      });
      
      return () => countAnim.removeListener(listener);
    } else {
      setDisplayValue(value.toString());
    }
  }, [value]);
  
  // Calculer le pourcentage si maxValue est fourni
  const percentage = typeof value === 'number' && maxValue 
    ? Math.min(100, Math.round((value / maxValue) * 100)) 
    : 0;
  
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', maxValue ? `${percentage}%` : '100%']
  });
  
  // Déterminer la couleur de la barre de progression
  const getProgressBarColors = (): [string, string] => {
    if (accentColor) return accentColor as [string, string];
    
    if (percentage < 30) return THEME.colors.status.warning.gradient || [THEME.colors.status.warning.default, THEME.colors.status.warning.dark] as [string, string];
    if (percentage < 70) return THEME.colors.status.info.gradient || [THEME.colors.status.info.default, THEME.colors.status.info.dark] as [string, string];
    return THEME.colors.status.success.gradient || [THEME.colors.status.success.default, THEME.colors.status.success.dark] as [string, string];
  };
  
  const gradientColors = getProgressBarColors();
  
  return (
    <View style={styles.statItem}>
      <View style={styles.statHeader}>
        {icon && (
          <View style={styles.statIconContainer}>
            <LinearGradient
              colors={accentColor || THEME.colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statIconGradient}
            >
              <Icon name={icon} size={14} color={THEME.colors.white} />
            </LinearGradient>
          </View>
        )}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      
      <Text style={styles.statNumber}>{displayValue}</Text>
      
      {maxValue && (
        <View style={styles.progressContainer}>
          <Animated.View style={{ width: progressWidth, overflow: 'hidden', borderRadius: THEME.borderRadius.full }}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
      )}
    </View>
  );
});
StatItem.displayName = 'StatItem';

/**
 * Composant personnalisé pour un bouton avec effet d'échelle et animations premium
 */
interface ActionButtonProps {
  label: string;
  onPress: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
  icon?: string;
  customColors?: [string, string];
}

const ActionButton: React.FC<ActionButtonProps> = memo(({ 
  label, 
  onPress, 
  isPrimary = true, 
  disabled = false,
  icon,
  customColors
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  // Couleurs personnalisées ou par défaut selon le type de bouton
  const gradientColors = useMemo((): [string, string] => {
    if (disabled) return ['#E5E7EB', '#D1D5DB'] as [string, string];
    if (customColors) return customColors as [string, string];
    return isPrimary ? THEME.colors.primary.gradient : [THEME.colors.white, THEME.colors.gray[50]] as [string, string];
  }, [isPrimary, disabled, customColors]);
  
  return (
    <Animated.View 
      style={{ 
        transform: [{ scale }], 
        opacity,
        ...styles.buttonShadowContainer
      }}
    >
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.buttonContainer,
          isPrimary ? null : styles.secondaryButton,
          disabled && styles.disabledButton
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.actionButton,
            isPrimary ? null : styles.secondaryButtonGradient,
            disabled && styles.disabledButtonGradient
          ]}
        >
          {icon && (
            <Icon 
              name={icon} 
              size={18} 
              color={isPrimary ? THEME.colors.white : THEME.colors.text.primary} 
              style={styles.buttonIcon} 
            />
          )}
          <Text 
            style={[
              styles.actionButtonText, 
              isPrimary ? styles.primaryButtonText : styles.secondaryButtonText,
              disabled && styles.disabledButtonText
            ]}
          >
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});
ActionButton.displayName = 'ActionButton';

/**
 * Composant principal affichant les informations et statistiques de l'utilisateur
 * Design premium avec animations fluides et effets visuels sophistiqués
 */
export const UserInfoTab: React.FC<UserInfoTabProps> = memo(({ 
  user, 
  stats, 
  currentUserId, 
  userId, 
  navigation,
}) => {
  // Calcul optimisé du nom d'affichage
  const displayName = useMemo(() => 
    user?.useFullName ? `${user.firstName} ${user.lastName}` : user?.username,
  [user?.useFullName, user?.firstName, user?.lastName, user?.username]);
  
  // Gestionnaires d'événements
  const handleEmailPress = useCallback(() => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
  }, [user?.email]);
  
  const handleChatPress = useCallback(() => {
    navigation.navigate("ChatScreen", {
      receiverId: userId,
      senderId: currentUserId,
    });
  }, [navigation, userId, currentUserId]);
  
  // Calcul des statistiques maximales pour les barres de progression
  const maxStats = useMemo(() => ({
    comments: Math.max(100, (stats?.numberOfComments || 0) * 1.5),
    votes: Math.max(100, (stats?.numberOfVotes || 0) * 1.5),
    reports: Math.max(50, (stats?.numberOfReports || 0) * 1.5),
    posts: Math.max(50, (stats?.numberOfPosts || 0) * 1.5),
    events: Math.max(20, (stats?.numberOfEventsCreated || 0) * 1.5),
  }), [stats]);
  
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // Animation de montage du composant principal
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: THEME.animation.timing.normal,
      easing: THEME.animation.easing.standard,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          paddingBottom: insets.bottom + THEME.spacing.lg,
          opacity: opacityAnim 
        }
      ]}
    >
      {/* Section d'informations personnelles */}
      <View style={styles.profileCardContainer}>
        <LinearGradient
          colors={['#8ECDF855', '#2E5BFF22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGlassBackground}
        />
        
        <View style={styles.profileContent}>
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={THEME.colors.primary.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.profileHeaderIconContainer}
            >
              <Icon name="account-circle" size={20} color={THEME.colors.white} />
            </LinearGradient>
            <Text style={styles.profileHeaderTitle}>Informations personnelles</Text>
          </View>

          <View style={styles.profileDetails}>
            {/* Nom d'utilisateur */}
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <LinearGradient
                  colors={THEME.colors.primary.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoIconGradient}
                >
                  <Icon name="account" size={18} color={THEME.colors.white} />
                </LinearGradient>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom d'utilisateur</Text>
                <Text style={styles.infoValue}>
                  {displayName || <Text style={styles.placeholderValue}>Non renseigné</Text>}
                </Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <LinearGradient
                  colors={THEME.colors.secondary.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoIconGradient}
                >
                  <Icon name="email-outline" size={18} color={THEME.colors.white} />
                </LinearGradient>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                {user?.showEmail ? (
                  <Text
                    style={styles.infoValueEmail}
                    onPress={handleEmailPress}
                  >
                    {user.email}
                  </Text>
                ) : (
                  <Text style={styles.placeholderValue}>
                    {displayName} ne partage pas son email
                  </Text>
                )}
              </View>
            </View>
            
            {/* Boutons d'action */}
            {currentUserId && userId && (
              <View style={styles.actionButtonsContainer}>
                <ActionButton
                  label="Envoyer un message"
                  icon="message-text-outline"
                  onPress={handleChatPress}
                  isPrimary={false}
                  customColors={['#FFFFFF', '#F3F4F6'] as [string, string]}
                />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Ville de référence */}
      <InfoCard 
        title="Ville de référence" 
        icon="map-marker" 
        index={1}
        customStyle={styles.locationCard}
        accentColor={THEME.colors.secondary.gradient}
      >
        <View style={styles.locationContent}>
          <View style={styles.locationItem}>
            <View style={styles.locationIconContainer}>
              <LinearGradient
                colors={THEME.colors.secondary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.locationIconGradient}
              >
                <Icon name="city" size={16} color={THEME.colors.white} />
              </LinearGradient>
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Ville</Text>
              <Text style={styles.locationValue}>
                {user?.nomCommune || "Non disponible"}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationDivider} />
          
          <View style={styles.locationItem}>
            <View style={styles.locationIconContainer}>
              <LinearGradient
                colors={THEME.colors.secondary.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.locationIconGradient}
              >
                <Icon name="mailbox" size={16} color={THEME.colors.white} />
              </LinearGradient>
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Code postal</Text>
              <Text style={styles.locationValue}>
                {user?.codePostal || "Non disponible"}
              </Text>
            </View>
          </View>
        </View>
      </InfoCard>

      {/* Statistiques de signalements */}
      <InfoCard 
        title="Statistiques de signalements" 
        icon="chart-bar" 
        index={2}
        accentColor={THEME.colors.accent.gradient}
      >
        <View style={styles.statsGrid}>
          <StatItem 
            value={stats?.numberOfComments || 0} 
            label="Commentaires" 
            icon="comment-text-multiple-outline"
            maxValue={maxStats.comments}
            accentColor={THEME.colors.accent.gradient}
          />
          <StatItem 
            value={stats?.numberOfVotes || 0} 
            label="Votes" 
            icon="thumb-up-outline"
            maxValue={maxStats.votes}
            accentColor={THEME.colors.accent.gradient}
          />
          <StatItem 
            value={stats?.numberOfReports || 0} 
            label="Signalements" 
            icon="alert-circle-outline"
            maxValue={maxStats.reports}
            accentColor={THEME.colors.accent.gradient}
          />
        </View>
      </InfoCard>

      {/* Relations */}
      <InfoCard 
        title="Relations" 
        icon="account-group" 
        index={3}
        accentColor={THEME.colors.primary.gradient}
      >
        <View style={styles.relationStats}>
          <View style={styles.relationItem}>
            <StatItem 
              value={user?.followers?.length || 0} 
              label="Abonnés" 
              icon="account-multiple"
              accentColor={THEME.colors.primary.gradient}
            />
          </View>
          
          <View style={styles.relationDivider} />
          
          <View style={styles.relationItem}>
            <StatItem 
              value={user?.following?.length || 0} 
              label="Abonnements" 
              icon="account-arrow-right"
              accentColor={THEME.colors.primary.gradient}
            />
          </View>
        </View>
      </InfoCard>

      {/* Social */}
      <InfoCard 
        title="Social" 
        icon="account-voice" 
        index={4}
        accentColor={THEME.colors.secondary.gradient}
      >
        <View style={styles.statsGrid}>
          <StatItem 
            value={stats?.numberOfPosts || 0} 
            label="Publications" 
            icon="post-outline"
            maxValue={maxStats.posts}
            accentColor={THEME.colors.secondary.gradient}
          />
          <StatItem 
            value={stats?.numberOfEventsCreated || 0} 
            label="Événements créés" 
            icon="calendar-plus"
            maxValue={maxStats.events}
            accentColor={THEME.colors.secondary.gradient}
          />
          <StatItem 
            value={stats?.numberOfEventsAttended || 0} 
            label="Participation" 
            icon="calendar-check"
            accentColor={THEME.colors.secondary.gradient}
          />
        </View>
      </InfoCard>

      {/* Options */}
      <InfoCard 
        title="Options" 
        icon="cog-outline" 
        index={5}
        accentColor={THEME.colors.accent.gradient}
      >
        <View style={styles.optionsContainer}>
          <View style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <LinearGradient
                colors={THEME.colors.accent.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionIconGradient}
              >
                <Icon name="crown-outline" size={16} color={THEME.colors.white} />
              </LinearGradient>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>SMART+</Text>
              <View style={[
                styles.statusBadge, 
                user?.isSubscribed ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={[
                  styles.statusText,
                  user?.isSubscribed ? styles.statusTextActive : styles.statusTextInactive
                ]}>
                  {user?.isSubscribed ? "Actif" : "Inactif"}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.optionDivider} />
          
          <View style={styles.optionItem}>
            <View style={styles.optionIconContainer}>
              <LinearGradient
                colors={THEME.colors.accent.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionIconGradient}
              >
                <Icon name="office-building-outline" size={16} color={THEME.colors.white} />
              </LinearGradient>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Affiliation mairie</Text>
              <View style={[
                styles.statusBadge, 
                user?.isSubscribed ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={[
                  styles.statusText,
                  user?.isSubscribed ? styles.statusTextActive : styles.statusTextInactive
                ]}>
                  {user?.isSubscribed ? "Actif" : "Inactif"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </InfoCard>
    </Animated.View>
  );
});

/**
 * Styles premium et modernes pour le composant UserInfoTab
 * Utilisation de glassmorphisme, d'ombres dynamiques et d'effets visuels sophistiqués
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background.main,
    paddingHorizontal: THEME.spacing.sm,
  },
  
  // Profile section styling
  profileCardContainer: {
    position: 'relative',
    borderRadius: THEME.borderRadius.lg,
    marginBottom: THEME.spacing.lg,
    overflow: 'hidden',
    ...THEME.shadows.medium,
  },
  profileGlassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: THEME.borderRadius.lg,
  },
  profileContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: THEME.borderRadius.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  profileHeaderIconContainer: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.sm,
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text.primary,
  },
  profileDetails: {
    padding: THEME.spacing.md,
  },
  
  // Info items styling
  infoItem: {
    flexDirection: 'row',
    marginBottom: THEME.spacing.md,
    alignItems: 'center',
  },
  infoIconContainer: {
    marginRight: THEME.spacing.md,
  },
  infoIconGradient: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...THEME.shadows.small,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.text.tertiary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  infoValueEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.primary.default,
  },
  placeholderValue: {
    fontSize: 14,
    color: THEME.colors.text.tertiary,
    fontStyle: 'italic',
  },
  
  // Button styling
  actionButtonsContainer: {
    marginTop: THEME.spacing.md,
  },
  buttonShadowContainer: {
    ...THEME.shadows.small,
    borderRadius: THEME.borderRadius.md,
  },
  buttonContainer: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: THEME.colors.gray[200],
  },
  secondaryButtonGradient: {
    backgroundColor: THEME.colors.white,
  },
  disabledButton: {
    backgroundColor: THEME.colors.gray[200],
    borderColor: THEME.colors.gray[300],
  },
  disabledButtonGradient: {
    backgroundColor: THEME.colors.gray[200],
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: THEME.colors.white,
  },
  secondaryButtonText: {
    color: THEME.colors.text.primary,
  },
  disabledButtonText: {
    color: THEME.colors.text.tertiary,
  },
  
  // Card styling
  cardAnimationWrapper: {
    marginBottom: THEME.spacing.md,
  },
  cardContainer: {
    borderRadius: THEME.borderRadius.lg,
    backgroundColor: THEME.colors.white,
    overflow: 'hidden',
    ...THEME.shadows.medium,
    position: 'relative',
  },
  cardAccent: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    borderRadius: THEME.borderRadius.lg,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
  },
  cardIconContainer: {
    marginRight: THEME.spacing.sm,
  },
  cardIconGradient: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: THEME.colors.text.primary,
  },
  
  // Location card styling
  locationCard: {
    marginTop: 0,
  },
  locationContent: {
    padding: THEME.spacing.md,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  locationIconContainer: {
    marginRight: THEME.spacing.md,
  },
  locationIconGradient: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: THEME.colors.text.tertiary,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  locationDivider: {
    height: 1,
    backgroundColor: THEME.colors.gray[200],
    marginVertical: THEME.spacing.sm,
  },
  
  // Statistics styling
  statsGrid: {
    padding: THEME.spacing.md,
  },
  statItem: {
    marginBottom: THEME.spacing.md,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  statIconContainer: {
    marginRight: THEME.spacing.xs,
  },
  statIconGradient: {
    width: 24,
    height: 24,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginVertical: THEME.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.text.tertiary,
  },
  progressContainer: {
    height: 6,
    backgroundColor: THEME.colors.gray[200],
    borderRadius: THEME.borderRadius.full,
    overflow: 'hidden',
    marginTop: THEME.spacing.xs,
  },
  progressGradient: {
    height: '100%',
  },
  
  // Relations styling
  relationStats: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
  },
  relationItem: {
    flex: 1,
    alignItems: 'center',
  },
  relationDivider: {
    width: 1,
    height: 60,
    backgroundColor: THEME.colors.gray[200],
    marginHorizontal: THEME.spacing.md,
  },
  
  // Options styling
  optionsContainer: {
    padding: THEME.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  optionIconContainer: {
    marginRight: THEME.spacing.md,
  },
  optionIconGradient: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text.primary,
  },
  optionDivider: {
    height: 1,
    backgroundColor: THEME.colors.gray[200],
    marginVertical: THEME.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  statusActive: {
    backgroundColor: THEME.colors.status.success.background,
  },
  statusInactive: {
    backgroundColor: THEME.colors.status.error.background,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: THEME.colors.status.success.dark,
  },
  statusTextInactive: {
    color: THEME.colors.status.error.dark,
  },
});

UserInfoTab.displayName = 'UserInfoTab';