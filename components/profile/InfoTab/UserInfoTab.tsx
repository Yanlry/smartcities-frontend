// components/profile/InfoTab/UserInfoTab.tsx

import React, { memo, useMemo } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  Animated,
  Easing,
  useWindowDimensions,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTheme } from '@react-navigation/native';
import { UserInfoTabProps } from '../../../types/features/profile/tabs.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Composant de carte pour afficher une section d'information avec animation au montage
 */
interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  customStyle?: object;
  icon?: string;
  index?: number;
}

const InfoCard: React.FC<InfoCardProps> = memo(({ title, children, customStyle = {}, icon, index = 0 }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(50)).current;
  
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.cardAnimationWrapper,
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardContainer, customStyle]}
      >
        <View style={styles.cardHeaderContainer}>
          {icon && (
            <View style={styles.cardIconContainer}>
              <Icon name={icon} size={20} color="#062C41" />
            </View>
          )}
          <Text style={styles.infoCardHeader}>{title}</Text>
        </View>
        {children}
      </LinearGradient>
    </Animated.View>
  );
});
InfoCard.displayName = 'InfoCard';

/**
 * Composant pour afficher une statistique individuelle avec animation
 */
interface StatItemProps {
  value: number | string;
  label: string;
  icon?: string;
  maxValue?: number;
}

const StatItem: React.FC<StatItemProps> = memo(({ value, label, icon, maxValue }) => {
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, []);
  
  // Calculer le pourcentage si maxValue est fourni
  const percentage = typeof value === 'number' && maxValue 
    ? Math.min(100, Math.round((value / maxValue) * 100)) 
    : 0;
  
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', maxValue ? `${percentage}%` : '100%']
  });
  
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconContainer}>
        {icon && <Icon name={icon} size={24} color="#062C41" style={styles.statIcon} />}
        <Text style={styles.statNumber}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      
      {maxValue && (
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressWidth, backgroundColor: getColorForPercentage(percentage) }
            ]} 
          />
        </View>
      )}
    </View>
  );
});
StatItem.displayName = 'StatItem';

// Fonction pour générer une couleur en fonction du pourcentage
const getColorForPercentage = (percentage: number): string => {
  if (percentage < 30) return '#FF6B6B';
  if (percentage < 70) return '#FFD166';
  return '#06D6A0';
};

/**
 * Composant personnalisé pour un bouton avec effet d'échelle lors du toucher
 */
interface ActionButtonProps {
  label: string;
  onPress: () => void;
  isPrimary?: boolean;
  disabled?: boolean;
  icon?: string;
}

const ActionButton: React.FC<ActionButtonProps> = memo(({ 
  label, 
  onPress, 
  isPrimary = true, 
  disabled = false,
  icon
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.actionButton,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          disabled && styles.disabledButton
        ]}
      >
        {icon && (
          <Icon 
            name={icon} 
            size={18} 
            color={isPrimary ? '#FFFFFF' : '#062C41'} 
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
      </TouchableOpacity>
    </Animated.View>
  );
});
ActionButton.displayName = 'ActionButton';

/**
 * Composant principal affichant les informations et statistiques de l'utilisateur
 * Utilise un design moderne avec animations et effets visuels
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
  const handleEmailPress = () => user?.email && Linking.openURL(`mailto:${user.email}`);
  const handleChatPress = () => navigation.navigate("ChatScreen", {
    receiverId: userId,
    senderId: currentUserId,
  });
  
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
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      {/* Section d'informations personnelles */}
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.profileSection}
      >
        <View style={styles.profileHeader}>
          <Text style={styles.profileHeaderTitle}>Informations personnelles</Text>
        </View>

        <View style={styles.profileContent}>
          {/* Nom d'utilisateur */}
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Icon name="account" size={22} style={styles.infoIcon} />
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
              <Icon name="email-outline" size={22} style={styles.infoIcon} />
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
          <View style={styles.actionButtonsContainer}>      
            {currentUserId && userId && (
              <ActionButton
                label="Envoyer un message"
                icon="message-text-outline"
                onPress={handleChatPress}
                isPrimary={false}
              />
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Ville de référence */}
      <InfoCard 
        title="Ville de référence" 
        icon="map-marker" 
        index={1}
        customStyle={styles.locationCard}
      >
        <View style={styles.locationContent}>
          <View style={styles.locationItem}>
            <Icon name="city" size={24} color="#062C41" style={styles.locationIcon} />
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>Ville</Text>
              <Text style={styles.locationValue}>
                {user?.nomCommune || "Non disponible"}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationDivider} />
          
          <View style={styles.locationItem}>
            <Icon name="mailbox" size={24} color="#062C41" style={styles.locationIcon} />
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
      <InfoCard title="Statistiques de signalements" icon="chart-bar" index={2}>
        <View style={styles.statsGrid}>
          <StatItem 
            value={stats?.numberOfComments || 0} 
            label="Commentaires" 
            icon="comment-text-multiple-outline"
            maxValue={maxStats.comments}
          />
          <StatItem 
            value={stats?.numberOfVotes || 0} 
            label="Votes" 
            icon="thumb-up-outline"
            maxValue={maxStats.votes}
          />
          <StatItem 
            value={stats?.numberOfReports || 0} 
            label="Signalements" 
            icon="alert-circle-outline"
            maxValue={maxStats.reports}
          />
        </View>
      </InfoCard>

      {/* Relations */}
      <InfoCard title="Relations" icon="account-group" index={3}>
        <View style={styles.relationStats}>
          <View style={styles.relationItem}>
            <StatItem 
              value={user?.followers?.length || 0} 
              label="Abonnés" 
              icon="account-multiple"
            />
          </View>
          
          <View style={styles.relationDivider} />
          
          <View style={styles.relationItem}>
            <StatItem 
              value={user?.following?.length || 0} 
              label="Abonnements" 
              icon="account-arrow-right"
            />
          </View>
        </View>
      </InfoCard>

      {/* Social */}
      <InfoCard title="Social" icon="account-voice" index={4}>
        <View style={styles.statsGrid}>
          <StatItem 
            value={stats?.numberOfPosts || 0} 
            label="Publications" 
            icon="post-outline"
            maxValue={maxStats.posts}
          />
          <StatItem 
            value={stats?.numberOfEventsCreated || 0} 
            label="Événements créés" 
            icon="calendar-plus"
            maxValue={maxStats.events}
          />
          <StatItem 
            value={stats?.numberOfEventsAttended || 0} 
            label="Participation" 
            icon="calendar-check"
          />
        </View>
      </InfoCard>

      {/* Options */}
      <InfoCard title="Options" icon="cog-outline" index={5}>
        <View style={styles.optionsContainer}>
          <View style={styles.optionItem}>
            <Icon name="crown-outline" size={24} color="#062C41" style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>SMART+</Text>
              <View style={[
                styles.statusBadge, 
                user?.isSubscribed ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={styles.statusText}>
                  {user?.isSubscribed ? "Actif" : "Inactif"}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.optionDivider} />
          
          <View style={styles.optionItem}>
            <Icon name="office-building-outline" size={24} color="#062C41" style={styles.optionIcon} />
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Affiliation mairie</Text>
              <View style={[
                styles.statusBadge, 
                user?.isSubscribed ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={styles.statusText}>
                  {user?.isSubscribed ? "Actif" : "Inactif"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </InfoCard>
    </View>
  );
});

/**
 * Styles optimisés pour le composant UserInfoTab
 * Design moderne avec ombres, animations et effets visuels
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Section de profil
  profileSection: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 15,
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#062C41',
  },
  profileContent: {
    padding: 20,
  },
  // Items d'information
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 44, 65, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    color: '#062C41',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoValueEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#062C41',
    textDecorationLine: 'underline',
  },
  placeholderValue: {
    fontSize: 14,
    color: '#AAA',
    fontStyle: 'italic',
  },
  // Boutons d'action
  actionButtonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButton: {
    backgroundColor: '#57A773',
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#062C41',
  },
  disabledButton: {
    backgroundColor: '#E1E1E1',
    borderColor: '#C5C5C5',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFF',
  },
  secondaryButtonText: {
    color: '#062C41',
  },
  disabledButtonText: {
    color: '#999',
  },
  // Cartes
  cardAnimationWrapper: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 44, 65, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoCardHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#062C41',
  },
  // Localisation
  locationCard: {
    marginTop: 0,
  },
  locationContent: {
    padding: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  locationIcon: {
    marginRight: 16,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  // Statistiques
  statsGrid: {
    padding: 16,
  },
  statItem: {
    marginBottom: 16,
  },
  statIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    marginRight: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#062C41',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  // Relations
  relationStats: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  relationItem: {
    flex: 1,
    alignItems: 'center',
  },
  relationDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  // Options
  optionsContainer: {
    padding: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  optionDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: 'rgba(87, 167, 115, 0.15)',
  },
  statusInactive: {
    backgroundColor: 'rgba(238, 99, 82, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

UserInfoTab.displayName = 'UserInfoTab';