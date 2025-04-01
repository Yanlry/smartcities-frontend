// Chemin : components/profile/Tabs/ProfileTabs.tsx

import React, { memo, useCallback } from "react";
import { 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View,
  Platform
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ProfileTabsProps } from "../../../types/features/profile/tabs.types";

/**
 * Système de thème pour le composant ProfileTabs
 */
const THEME = {
  colors: {
    // Dégradés primaires (bleus)
    primary: {
      gradient: ['#2E5BFF', '#1E40AF'] as [string, string],
      default: '#2E5BFF',
      light: '#60A5FA',
    },
    // Dégradés secondaires (cyans)
    secondary: {
      gradient: ['#00C6A7', '#00A3C4'] as [string, string],
    },
    // Dégradé accent (orange-rose)
    accent: {
      gradient: ['#F97316', '#DB2777'] as [string, string],
    },
    // Couleurs d'état
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    // Autres couleurs
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      inverted: '#FFFFFF'
    },
    background: {
      main: '#F8FAFC',
      card: '#FFFFFF',
      glass: 'rgba(255, 255, 255, 0.85)'
    },
    border: 'rgba(0, 0, 0, 0.05)',
    inactive: '#94A3B8'
  },
  // Système d'ombres
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 2
      }
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6
      },
      android: {
        elevation: 4
      }
    })
  },
  // Rayons de bordure
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 9999
  },
  // Espacement
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24
  }
};

/**
 * Configuration des icônes pour chaque onglet
 */
const TAB_ICONS = {
  info: 'information-outline',
  signalement: 'alert-circle-outline',
  publications: 'post-outline',
  evenement: 'calendar-blank-outline'
};

/**
 * Composant pour afficher un badge de notification
 */
interface BadgeProps {
  count: number;
}

const Badge: React.FC<BadgeProps> = memo(({ count }) => {
  if (count <= 0) return null;
  
  return (
    <View style={styles.badgeContainer}>
      <LinearGradient
        colors={THEME.colors.accent.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.badgeGradient}
      >
        <Text style={styles.badgeText}>
          {count > 99 ? '99+' : count}
        </Text>
      </LinearGradient>
    </View>
  );
});
Badge.displayName = 'Badge';

/**
 * Composant Tab individuel sans animations complexes
 */
interface TabItemProps {
  label: string;
  value: string;
  isActive: boolean;
  onPress: (value: string) => void;
  icon: string;
  badgeCount?: number;
}

const TabItem: React.FC<TabItemProps> = memo(({ 
  label, 
  value,
  isActive, 
  onPress, 
  icon,
  badgeCount = 0
}) => {
  const handlePress = useCallback(() => {
    onPress(value);
  }, [onPress, value]);
  
  return (
    <View style={styles.tabItemContainer}>
      {/* Badge placé au-dessus de tout avec zIndex élevé */}
      {badgeCount > 0 && (
        <View style={isActive ? styles.activeTabBadgePosition : styles.inactiveTabBadgePosition}>
          <Badge count={badgeCount} />
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.tabButton,
          isActive && styles.activeTabButton
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {isActive ? (
          <LinearGradient
            colors={THEME.colors.primary.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.activeTabGradient}
          >
            <Icon name={icon} size={16} color={THEME.colors.text.inverted} style={styles.tabIcon} />
            <Text style={styles.activeTabText}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTabContent}>
            <Icon name={icon} size={16} color={THEME.colors.inactive} style={styles.tabIcon} />
            <Text style={styles.tabText}>{label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});
TabItem.displayName = 'TabItem';

/**
 * Composant principal pour les onglets de profil
 * Design moderne sans animations complexes
 */
export const ProfileTabs: React.FC<ProfileTabsProps> = memo(({ 
  selectedTab, 
  onSelectTab 
}) => {
  // Données fictives pour les badges (à remplacer par des données réelles)
  const badgeCounts = {
    signalement: 3,
    evenement: 1
  };
  
  // Gestionnaire pour le changement d'onglet
  const handleSelectTab = useCallback((tab: string) => {
    onSelectTab(tab);
  }, [onSelectTab]);
  
  return (
    <View style={styles.container}>
      {/* Arrière-plan avec dégradé */}
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.tabsBackground}
      />
      
      {/* ScrollView pour les onglets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {Object.entries(TAB_ICONS).map(([key, icon]) => (
          <TabItem
            key={key}
            label={getTabLabel(key)}
            value={key}
            isActive={selectedTab === key}
            onPress={handleSelectTab}
            icon={icon}
            badgeCount={badgeCounts[key as keyof typeof badgeCounts] || 0}
          />
        ))}
      </ScrollView>
      
      {/* Indicateur statique */}
      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorTrack}>
          {Object.keys(TAB_ICONS).map(key => (
            <View 
              key={key} 
              style={[
                styles.indicatorDot,
                selectedTab === key && styles.indicatorDotActive
              ]}
            >
              {selectedTab === key && (
                <LinearGradient
                  colors={THEME.colors.primary.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.indicatorDotGradient}
                />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

// Fonction utilitaire pour obtenir le libellé à partir de la clé d'onglet
function getTabLabel(key: string): string {
  switch (key) {
    case 'info':
      return 'Info & Statistique';
    case 'signalement':
      return 'Signalement';
    case 'publications':
      return 'Publications';
    case 'evenement':
      return 'Événement';
    default:
      return key;
  }
}

/**
 * Styles pour le composant ProfileTabs
 * Design moderne sans animations complexes
 */
const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...THEME.shadows.medium
  },
  tabsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: THEME.borderRadius.lg,
  },
  tabsContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.md
  },
  indicatorContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8
  },
  indicatorTrack: {
    flexDirection: 'row',
    gap: THEME.spacing.sm
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: THEME.borderRadius.pill,
    backgroundColor: THEME.colors.border,
    overflow: 'hidden'
  },
  indicatorDotActive: {
    width: 18,
  },
  indicatorDotGradient: {
    width: '100%',
    height: '100%',
    borderRadius: THEME.borderRadius.pill
  },
  tabItemContainer: {
    position: 'relative', // Pour positionner le badge correctement
    marginHorizontal: THEME.spacing.xs
  },
  tabButton: {
    borderRadius: THEME.borderRadius.pill,
    overflow: 'hidden',
  },
  activeTabButton: {
    ...THEME.shadows.small
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.pill
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: THEME.borderRadius.pill,
    borderWidth: 1,
    borderColor: THEME.colors.border
  },
  tabIcon: {
    marginRight: THEME.spacing.xs
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.text.secondary
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text.inverted
  },
  badgeContainer: {
    minWidth: 20,
    height: 20,
    borderRadius: THEME.borderRadius.pill,
    overflow: 'hidden',
    ...THEME.shadows.small,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    zIndex: 10 // Assure que le badge est au-dessus de tout
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xs
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.text.inverted,
    textAlign: 'center'
  },
  activeTabBadgePosition: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10, // Assure que le badge est au-dessus de tout
    elevation: 5 // Spécifique à Android pour z-index
  },
  inactiveTabBadgePosition: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10, // Assure que le badge est au-dessus de tout
    elevation: 5 // Spécifique à Android pour z-index
  }
});

ProfileTabs.displayName = 'ProfileTabs';