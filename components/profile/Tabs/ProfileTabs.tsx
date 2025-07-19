import React, { memo, useCallback } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ProfileTabsProps } from "../../../types/features/profile/tabs.types";
import { useUserStats } from "../../../hooks/profile/useUserStats";

/**
 * Système de thème pour le composant ProfileTabs
 */
const THEME = {
  colors: {
    primary: {
      gradient: ["#2E5BFF", "#1E40AF"] as [string, string],
      default: "#2E5BFF",
      light: "#60A5FA"
    },
    secondary: {
      gradient: ["#00C6A7", "#00A3C4"] as [string, string]
    },
    accent: {
      gradient: ["#F97316", "#DB2777"] as [string, string]
    },
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    text: {
      primary: "#1F2937",
      secondary: "#4B5563",
      inverted: "#FFFFFF"
    },
    background: {
      main: "#F8FAFC",
      card: "#FFFFFF",
      glass: "rgba(255, 255, 255, 0.85)"
    },
    border: "rgba(0, 0, 0, 0.05)",
    inactive: "#94A3B8"
  },
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: { elevation: 2 }
    }),
    medium: Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6
      },
      android: { elevation: 4 }
    })
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 9999
  },
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
  info: "information-outline",
  signalement: "alert-circle-outline",
  publications: "post-outline",
  evenement: "calendar-blank-outline"
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
          {count > 99 ? "99+" : count}
        </Text>
      </LinearGradient>
    </View>
  );
});
Badge.displayName = "Badge";

/**
 * Composant Tab individuel
 */
interface TabItemProps {
  label: string;
  value: string;
  isActive: boolean;
  onPress: (value: string) => void;
  icon: string;
  badgeCount?: number;
}
const TabItem: React.FC<TabItemProps> = memo(
  ({ label, value, isActive, onPress, icon, badgeCount = 0 }) => {
    const handlePress = useCallback(() => {
      onPress(value);
    }, [onPress, value]);

    return (
      <View style={styles.tabItemContainer}>
        {badgeCount > 0 && (
          <View
            style={
              isActive
                ? styles.activeTabBadgePosition
                : styles.inactiveTabBadgePosition
            }
          >
            <Badge count={badgeCount} />
          </View>
        )}
        <TouchableOpacity
          style={[styles.tabButton, isActive && styles.activeTabButton]}
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
              <Icon
                name={icon}
                size={16}
                color={THEME.colors.text.inverted}
                style={styles.tabIcon}
              />
              <Text style={styles.activeTabText}>{label}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.inactiveTabContent}>
              <Icon
                name={icon}
                size={16}
                color={THEME.colors.inactive}
                style={styles.tabIcon}
              />
              <Text style={styles.tabText}>{label}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }
);
TabItem.displayName = "TabItem";

/**
 * Composant principal pour les onglets de profil
 * On récupère dynamiquement les statistiques de l'utilisateur afin d'afficher les badges.
 * À noter : ProfileTabs attend désormais en props l'ID de l'utilisateur.
 */
export const ProfileTabs: React.FC<ProfileTabsProps & { userId: string }> = memo(
  ({ selectedTab, onSelectTab, userId }) => {
    
    // Ajouter cette ligne pour vérifier la valeur de userId dans la console
    console.log("ProfileTabs - userId:", userId);
  
    const { stats } = useUserStats(userId);

    const badgeCounts = {
      signalement: stats?.numberOfReports || 0,
      publications: stats?.numberOfPosts || 0,
      evenement: stats?.numberOfEventsCreated || 0
    };

    const handleSelectTab = useCallback(
      (tab: string) => {
        onSelectTab(tab);
      },
      [onSelectTab]
    );

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(248,250,252,0.9)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
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
        <View style={styles.indicatorContainer}>
          <View style={styles.indicatorTrack}>
            {Object.keys(TAB_ICONS).map((key) => (
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
  }
);

// Fonction utilitaire pour obtenir le libellé à partir de la clé d'onglet
function getTabLabel(key: string): string {
  switch (key) {
    case "info":
      return "Info & Statistique";
    case "signalement":
      return "Signalement";
    case "publications":
      return "Publications";
    case "evenement":
      return "Événement";
    default:
      return key;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  badgeContainer: {
    position: "absolute",
    top: 10,
    right:10,
    zIndex: 10
  },
  badgeGradient: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10
  },
  badgeText: {
    color: THEME.colors.text.inverted,
    fontSize: 10,
    fontWeight: "bold"
  },
  tabItemContainer: {
    marginHorizontal: 8
  },
  activeTabBadgePosition: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1
  },
  inactiveTabBadgePosition: {
    position: "absolute",
    top: -10,
    right: -10,
    zIndex: 1
  },
  tabButton: {
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md
  },
  activeTabButton: {},
  activeTabGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md
  },
  tabIcon: {
    marginRight: 4
  },
  activeTabText: {
    color: THEME.colors.text.inverted,
    fontSize: 14,
    fontWeight: "600"
  },
  inactiveTabContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: THEME.spacing.sm
  },
  tabText: {
    color: THEME.colors.text.primary,
    fontSize: 14
  },
  tabsBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50
  },
  tabsContainer: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    alignItems: "center"
  },
  indicatorContainer: {
    alignItems: "center"
  },
  indicatorTrack: {
    flexDirection: "row"
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.border,
    marginHorizontal: 4,
    marginBottom: 10
  },
  indicatorDotActive: {
    backgroundColor: THEME.colors.primary.default
  },
  indicatorDotGradient: {
    flex: 1,
    borderRadius: 4
  }
});