// Chemin : src/components/profile/SectionProfile.tsx

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RankBadge from '../../home/ProfileSection/RankBadge';

interface ProfileSectionProps {
  user?: {
    username: string;
    fullName?: string;
    avatar?: string;
    verified?: boolean;
    isFollowing?: boolean;
    onUnfollowUser?: () => void;
    bio?: string;
    followers?: number;
    following?: number;
    reports?: number;
    location?: string;
    memberSince?: string;
    isPremium?: boolean;
    ranking?: number | null;
  };
  isCurrentUser?: boolean;
  onEditProfile?: () => void;
  onFollowUser: () => void;
  onUnfollowUser?: () => void;
  onMessageUser?: () => void;
  ranking?: number | null;
  rankingSuffix?: string;
  totalUsers?: number;
  onNavigateToRanking?: () => void;
  badgeStyle?: any;
  onShowBadgeModal?: () => void;
  cityName?: string;
  isFollowing?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

/**
 * Système de couleurs sombre et élégant
 */
const DARK_THEME = {
  colors: {
    primary: {
      gradient: ['#4A5568', '#2D3748'] as [string, string],
      default: '#4A5568',
      light: '#718096',
    },
    secondary: {
      gradient: ['#2D3748', '#1A202C'] as [string, string],
    },
    accent: {
      gradient: ['#D69E2E', '#F6AD55'] as [string, string], // Doré
    },
    background: {
      primary: ['#2D3748', '#1A202C', '#171923'] as [string, string, string],
      secondary: ['#4A5568', '#2D3748'] as [string, string],
      glass: 'rgba(255, 255, 255, 0.05)',
      overlay: 'rgba(0, 0, 0, 0.3)'
    },
    golden: {
      primary: '#D69E2E',
      secondary: '#F6AD55',
      light: '#FBD38D',
      glow: 'rgba(214, 158, 46, 0.6)'
    },
    success: '#38A169',
    warning: '#D69E2E',
    error: '#E53E3E',
    premium: '#D69E2E',
    verified: '#38A169',
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
      muted: '#718096',
      inverted: '#1A202C',
    },
    border: 'rgba(255, 255, 255, 0.1)',
    inactive: '#718096'
  },
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4
      },
      android: { elevation: 3 }
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
      },
      android: { elevation: 6 }
    }),
    large: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16
      },
      android: { elevation: 12 }
    }),
    golden: Platform.select({
      ios: {
        shadowColor: '#D69E2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12
      },
      android: { elevation: 8 }
    })
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  }
};

/**
 * Composant d'animation de lueurs dorées
 */
const GoldenGlowAnimation: React.FC = memo(() => {
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createGlowAnimation = () => {
      return Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(glowOpacity, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 1.2,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowRotation, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(glowOpacity, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
              toValue: 0.8,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    const animation = createGlowAnimation();
    animation.start();

    return () => animation.stop();
  }, []);

  const rotateInterpolate = glowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      {/* Lueur principale */}
      <Animated.View
        style={[
          styles.goldenGlow,
          {
            opacity: glowOpacity,
            transform: [
              { scale: glowScale },
              { rotate: rotateInterpolate }
            ],
          },
        ]}
      />
      
      {/* Lueurs secondaires */}
      <Animated.View
        style={[
          styles.goldenGlowSecondary,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />
    </>
  );
});

/**
 * Composant principal du profil avec design sombre élégant
 */
const SectionProfile: React.FC<ProfileSectionProps> = memo(({
  user,
  isCurrentUser,
  onEditProfile,
  onFollowUser,
  onUnfollowUser,
  isFollowing,
  onMessageUser,
  ranking,
  rankingSuffix,
  totalUsers,
  onNavigateToRanking,
  badgeStyle,
  onShowBadgeModal,
  cityName
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background principal avec dégradé anthracite */}
      <LinearGradient
        colors={DARK_THEME.colors.background.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      {/* Overlay subtil */}
      <View style={styles.backgroundOverlay}>
        <LinearGradient
          colors={[
            'rgba(74, 85, 104, 0.1)',
            'rgba(26, 32, 44, 0.05)',
            'transparent'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.decorativeAccent}
        />
      </View>

      {/* Animations de lueurs dorées */}
      <GoldenGlowAnimation />

      {/* Contenu principal */}
      <View style={styles.contentContainer}>
        {/* Section header avec avatar et informations */}
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={DARK_THEME.colors.accent.gradient}
              style={styles.avatarGradientBorder}
            >
              <View style={styles.avatarInnerBorder}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {(user?.fullName || user?.username || '').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            
            {/* Badge premium avec effet doré */}
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <LinearGradient
                  colors={DARK_THEME.colors.accent.gradient}
                  style={styles.premiumBadgeGradient}
                >
                  <Icon name="crown" size={12} color="#FFFFFF" />
                </LinearGradient>
              </View>
            )}
          </View>

          <View style={styles.userInfoContainer}>
            <View style={styles.usernameContainer}>
              <Text style={styles.fullName}>
                {user?.fullName || user?.username}
              </Text>
              {user?.verified && (
                <Icon 
                  name="check-decagram" 
                  size={16} 
                  color={DARK_THEME.colors.verified} 
                  style={styles.verifiedIcon} 
                />
              )}
            </View>
            
            <View style={styles.locationContainer}>
              <Icon 
                name="map-marker" 
                size={14} 
                color={DARK_THEME.colors.text.muted} 
                style={styles.locationIcon} 
              />
              <Text style={styles.locationText}>{user?.location}</Text>
            </View>
          </View>
        </View>

        {/* Biographie */}
        {user?.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}

        {/* Badge de classement */}
        <View style={styles.rankBadgeContainer}>
          <RankBadge
            ranking={ranking ?? user?.ranking ?? null}
            rankingSuffix={rankingSuffix ?? ''}
            totalUsers={totalUsers ?? null}
            onNavigateToRanking={onNavigateToRanking || (() => {})}
            badgeStyle={badgeStyle}
            onShowBadgeModal={onShowBadgeModal}
            cityName={cityName ?? user?.location}
          />
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          {isCurrentUser ? (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={onEditProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(214, 158, 46, 0.2)', 'rgba(214, 158, 46, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.editProfileGradient}
              >
                <Icon name="pencil" size={16} color={DARK_THEME.colors.golden.primary} style={styles.buttonIcon} />
                <Text style={styles.buttonTextGolden}>Modifier le profil</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.guestActionsRow}>
              {isFollowing ? (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={onUnfollowUser}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={DARK_THEME.colors.secondary.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.followButtonGradient}
                  >
                    <Icon name="account-remove" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Se désabonner</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={onFollowUser}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={DARK_THEME.colors.accent.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.followButtonGradient}
                  >
                    <Icon name="account-plus" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Suivre</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.messageButton}
                onPress={onMessageUser}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.messageButtonGradient}
                >
                  <Icon name="message-text-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Message</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Membre depuis */}
        <View style={styles.memberSinceContainer}>
          <Icon name="calendar-outline" size={12} color={DARK_THEME.colors.text.muted} />
          <Text style={styles.memberSinceText}>Membre depuis {user?.memberSince}</Text>
        </View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    ...DARK_THEME.shadows.large,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  decorativeAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '70%',
    height: '80%',
    borderBottomLeftRadius: 120,
  },
  goldenGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: DARK_THEME.colors.golden.glow,
    opacity: 0.3,
  },
  goldenGlowSecondary: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: DARK_THEME.colors.golden.glow,
    opacity: 0.2,
  },
  contentContainer: {
    zIndex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: DARK_THEME.spacing.lg,
  },
  avatarGradientBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    ...DARK_THEME.shadows.golden,
  },
  avatarInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: DARK_THEME.colors.background.glass,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: DARK_THEME.colors.text.primary,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: DARK_THEME.colors.background.primary[0],
    overflow: 'hidden',
    ...DARK_THEME.shadows.golden,
  },
  premiumBadgeGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DARK_THEME.spacing.xs,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: DARK_THEME.colors.text.primary,
  },
  verifiedIcon: {
    marginLeft: DARK_THEME.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: DARK_THEME.spacing.xs,
  },
  locationText: {
    fontSize: 12,
    color: DARK_THEME.colors.text.secondary,
  },
  bioContainer: {
    marginTop: DARK_THEME.spacing.lg,
    marginBottom: DARK_THEME.spacing.md,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: DARK_THEME.colors.text.secondary,
  },
  rankBadgeContainer: {
    marginVertical: DARK_THEME.spacing.md,
    backgroundColor: DARK_THEME.colors.background.glass,
    borderRadius: DARK_THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: DARK_THEME.colors.border,
  },
  actionsContainer: {
    marginTop: DARK_THEME.spacing.md,
  },
  editProfileButton: {
    borderRadius: DARK_THEME.borderRadius.md,
    overflow: 'hidden',
    ...DARK_THEME.shadows.golden,
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DARK_THEME.spacing.md,
    paddingHorizontal: DARK_THEME.spacing.lg,
    borderRadius: DARK_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: DARK_THEME.colors.golden.primary,
  },
  guestActionsRow: {
    flexDirection: 'row',
    gap: DARK_THEME.spacing.md,
  },
  followButton: {
    flex: 1,
    borderRadius: DARK_THEME.borderRadius.md,
    overflow: 'hidden',
    ...DARK_THEME.shadows.medium,
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DARK_THEME.spacing.md,
    borderRadius: DARK_THEME.borderRadius.md,
  },
  messageButton: {
    flex: 1,
    borderRadius: DARK_THEME.borderRadius.md,
    overflow: 'hidden',
    ...DARK_THEME.shadows.medium,
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DARK_THEME.spacing.md,
    borderRadius: DARK_THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: DARK_THEME.colors.border,
  },
  buttonIcon: {
    marginRight: DARK_THEME.spacing.xs,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_THEME.colors.text.primary,
  },
  buttonTextGolden: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_THEME.colors.golden.primary,
  },
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DARK_THEME.spacing.xl,
    opacity: 0.7,
  },
  memberSinceText: {
    fontSize: 12,
    color: DARK_THEME.colors.text.secondary,
    marginLeft: DARK_THEME.spacing.xs,
  },
});

export default SectionProfile;