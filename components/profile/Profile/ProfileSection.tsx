import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RankBadge from '../../home/ProfileSection/RankBadge'; // Ajustez le chemin selon votre structure

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
  onFollowUser: () => void; // utilisé lorsque l'utilisateur n'est pas suivi
  onUnfollowUser?: () => void; // callback pour se désabonner
  onMessageUser?: () => void;
  ranking?: number | null;
  rankingSuffix?: string;
  totalUsers?: number;
  onNavigateToRanking?: () => void;
  badgeStyle?: any;
  onShowBadgeModal?: () => void;
  cityName?: string;
  isFollowing?: boolean; // indique si l'utilisateur est suivi
}

const THEME = {
  colors: {
    primary: {
      gradient: ['#2E5BFF', '#1E40AF'] as [string, string],
      default: '#2E5BFF',
      light: '#60A5FA',
    },
    secondary: {
      gradient: ['#00C6A7', '#00A3C4'] as [string, string],
    },
    accent: {
      gradient: ['#F97316', '#DB2777'] as [string, string],
    },
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    premium: '#F59E0B',
    verified: '#22C55E',
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      inverted: '#FFFFFF',
      muted: '#94A3B8',
    },
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.85)'
    },
    border: 'rgba(0, 0, 0, 0.05)',
    inactive: '#94A3B8'
  },
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: { elevation: 2 }
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6
      },
      android: { elevation: 4 }
    }),
    large: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
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

const SectionProfile: React.FC<ProfileSectionProps> = ({
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

  return (
    <View style={[styles.container]}>
      <LinearGradient
        colors={['#1E3A8A', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      <View style={styles.backgroundOverlay}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.decorativeAccent}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerSection}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={THEME.colors.primary.gradient}
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
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}
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
                <Icon name="check-decagram" size={16} color={THEME.colors.verified} style={styles.verifiedIcon} />
              )}
            </View>
            <View style={styles.locationContainer}>
              <Icon name="map-marker" size={14} color={THEME.colors.text.muted} style={styles.locationIcon} />
              <Text style={styles.locationText}>{user?.location}</Text>
            </View>
          </View>
        </View>
        {user?.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        )}
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
        <View style={styles.actionsContainer}>
        {isCurrentUser ? (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={onEditProfile}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.editProfileGradient}
            >
              <Icon name="pencil" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Modifier le profil</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.guestActionsRow}>
            {isFollowing ? (
              <TouchableOpacity
                style={styles.followButton}  // utilisation du style existant
                onPress={onUnfollowUser}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={THEME.colors.secondary.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.followButtonGradient} // utilisation du style existant
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
                  colors={THEME.colors.primary.gradient}
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
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
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
        <View style={styles.memberSinceContainer}>
          <Icon name="calendar-outline" size={12} color={THEME.colors.text.muted} />
          <Text style={styles.memberSinceText}>Membre depuis {user?.memberSince}</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding:20,
    overflow: 'hidden',
    ...THEME.shadows.large
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8
  },
  decorativeAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '60%',
    height: '60%',
    borderBottomLeftRadius: 100,
  },
  contentContainer: {
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: THEME.spacing.lg,
  },
  avatarGradientBorder: {
    width: 80,
    height: 80,
    borderRadius: 30,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
  },
  premiumBadgeGradient: {
    width: 24,
    height: 24,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoContainer: {
    flex: 1,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedIcon: {
    marginLeft: THEME.spacing.xs,
  },
  username: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: THEME.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: THEME.spacing.xs,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bioContainer: {
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  rankBadgeContainer: {
    marginVertical: THEME.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fond légèrement transparent pour le badge
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionsContainer: {
    marginTop: THEME.spacing.md,
  },
  editProfileButton: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  editProfileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  guestActionsRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  followButton: {
    flex: 1,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  followButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
  },
  messageButton: {
    flex: 1,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  messageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonIcon: {
    marginRight: THEME.spacing.xs,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberSinceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
    opacity: 0.6,
  },
  memberSinceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: THEME.spacing.xs,
  }
});

export default SectionProfile;