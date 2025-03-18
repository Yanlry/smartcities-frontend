import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../context/AuthContext';
import { SidebarProps } from './types';
import SidebarItem from './SidebarItem';

// Enhanced color system
const COLORS = {
  primary: {
    base: "#062C41",
    light: "#1B5D85",
    dark: "#041E2D",
    contrast: "#FFFFFF",
  },
  secondary: {
    base: "#2A93D5",
    light: "#50B5F5",
    dark: "#1C7AB5",
    contrast: "#FFFFFF",
  },
  accent: {
    base: "#FF5A5F",
    light: "#FF7E82",
    dark: "#E04347",
    contrast: "#FFFFFF",
  },
  neutral: {
    50: "#F9FAFC",
    100: "#F0F4F8",
    200: "#E1E8EF",
    300: "#C9D5E3",
    400: "#A3B4C6",
    500: "#7D91A7",
    600: "#5C718A",
    700: "#465670",
    800: "#2E3B4E",
    900: "#1C2536",
  },
};

/**
 * Enhanced Sidebar component with scrollable content
 * Maintains full animation capabilities while adding scroll functionality
 */
const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, toggleSidebar }) => {
  const insets = useSafeAreaInsets();
  const [sidebarAnimation] = useState(new Animated.Value(-350));
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const mainItemsAnimation = useRef(Array(6).fill(0).map(() => new Animated.Value(40))).current;
  const secondaryItemsAnimation = useRef(Array(4).fill(0).map(() => new Animated.Value(40))).current;
  const logoutButtonAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const navigation = useNavigation();
  const { handleLogout } = useAuth();
  const [activeItem, setActiveItem] = useState<string | null>(null);

  // Enhanced animations
  useEffect(() => {
    if (isOpen) {
      // Reset scroll position to top when sidebar opens
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
      
      // Sidebar slide-in animation
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
      
      // Overlay fade-in
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
      
      // Staggered animation for main menu items
      mainItemsAnimation.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          delay: 100 + (i * 50),
          useNativeDriver: true,
        }).start();
      });
      
      // Staggered animation for secondary menu items
      secondaryItemsAnimation.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 400,
          delay: 400 + (i * 50),
          useNativeDriver: true,
        }).start();
      });
      
      // Logout button animation
      Animated.timing(logoutButtonAnimation, {
        toValue: 1,
        duration: 500,
        delay: 700,
        useNativeDriver: true,
      }).start();
    } else {
      // Reverse animations when closing
      Animated.timing(sidebarAnimation, {
        toValue: -350,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Reset all item animations
      [...mainItemsAnimation, ...secondaryItemsAnimation].forEach(anim => {
        anim.setValue(40);
      });
      
      logoutButtonAnimation.setValue(0);
    }
  }, [isOpen, sidebarAnimation, overlayAnimation, mainItemsAnimation, secondaryItemsAnimation, logoutButtonAnimation]);

  const handleNavigation = useCallback((screen: string) => {
    setActiveItem(screen);
    navigation.navigate(screen as never);
    toggleSidebar();
  }, [navigation, toggleSidebar]);

  const handleLogoutWithSidebarClose = useCallback(() => {
    toggleSidebar();
    setTimeout(() => {
      handleLogout();
    }, 300);
  }, [toggleSidebar, handleLogout]);

  const mainMenuItems = [
    {
      icon: <MaterialCommunityIcons name="view-dashboard-outline" size={22} color={COLORS.primary.contrast} />,
      label: "Tableau de bord",
      screen: "Main"
    },
    {
      icon: <Ionicons name="earth-outline" size={22} color={COLORS.primary.contrast} />,
      label: "Tout sur ma ville",
      screen: "CityScreen"
    },
    {
      icon: <Ionicons name="trophy-outline" size={22} color={COLORS.primary.contrast} />,
      label: "Classement général",
      screen: "RankingScreen"
    },
    {
      icon: <MaterialCommunityIcons name="account-circle-outline" size={22} color={COLORS.primary.contrast} />,
      label: "Informations personnelles",
      screen: "ProfileScreen"
    },
    {
      icon: <MaterialCommunityIcons name="alert-octagon-outline" size={22} color={COLORS.primary.contrast} />,
      label: "Mes signalements",
      screen: "ReportScreen"
    },
    {
      icon: <MaterialCommunityIcons name="calendar-star" size={22} color={COLORS.primary.contrast} />,
      label: "Mes événements",
      screen: "EventsScreen"
    }
  ];

  const secondaryMenuItems = [
    {
      icon: <Ionicons name="settings-outline" size={22} color={COLORS.neutral[300]} />,
      label: "Préférences",
      screen: "PreferencesScreen"
    },
    {
      icon: <Ionicons name="help-circle-outline" size={22} color={COLORS.neutral[300]} />,
      label: "F.A.Q",
      screen: "FAQScreen"
    },
    {
      icon: <Ionicons name="document-text-outline" size={22} color={COLORS.neutral[300]} />,
      label: "Conditions d'utilisation",
      screen: "TermsScreen"
    },
    {
      icon: <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.neutral[300]} />,
      label: "Confidentialité",
      screen: "PrivacyScreen"
    }
  ];

  return (
    <>
      {/* Animated overlay with blur effect */}
      {isOpen && (
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: overlayAnimation,
              top: 0,
              paddingTop: StatusBar.currentHeight || 0
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouch} 
            onPress={toggleSidebar}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Main sidebar container with animation */}
      <Animated.View
        style={[
          styles.sidebar,
          { 
            transform: [{ translateX: sidebarAnimation }],
            paddingTop: insets.top || 45,
          },
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary.dark, COLORS.primary.base, COLORS.primary.light]}
          style={styles.sidebarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Content container with fixed height */}
          <View style={styles.contentContainer}>
            {/* Scrollable content area */}
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20
              }}
              style={styles.scrollView}
            >
              {/* App branding section */}
              <View style={styles.brandingContainer}>
                <Text style={styles.sidebarTitle}>MENU</Text>
                <View style={styles.brandingLine} />
              </View>

              {/* Main menu section with animated items */}
              <View style={styles.menuSection}>
                <Text style={styles.sectionLabel}>NAVIGATION PRINCIPALE</Text>
                {mainMenuItems.map((item, index) => (
                  <Animated.View 
                    key={`main-${index}`}
                    style={{ 
                      transform: [{ translateX: mainItemsAnimation[index] }],
                      opacity: mainItemsAnimation[index].interpolate({
                        inputRange: [0, 40],
                        outputRange: [1, 0]
                      })
                    }}
                  >
                    <SidebarItem
                      icon={item.icon}
                      label={item.label}
                      onPress={() => handleNavigation(item.screen)}
                      isActive={activeItem === item.screen}
                    />
                  </Animated.View>
                ))}
              </View>

              {/* Settings & Help section with animated items */}
              <View style={styles.footerSection}>
                <Text style={styles.sectionLabel}>PARAMÈTRES & AIDE</Text>
                {secondaryMenuItems.map((item, index) => (
                  <Animated.View 
                    key={`secondary-${index}`}
                    style={{ 
                      transform: [{ translateX: secondaryItemsAnimation[index] }],
                      opacity: secondaryItemsAnimation[index].interpolate({
                        inputRange: [0, 40],
                        outputRange: [1, 0]
                      })
                    }}
                  >
                    <SidebarItem
                      icon={item.icon}
                      label={item.label}
                      onPress={() => handleNavigation(item.screen)}
                      isActive={activeItem === item.screen}
                      isSecondary
                    />
                  </Animated.View>
                ))}
                <Text style={styles.version}>v1.07.23</Text>
              </View>
            </ScrollView>
          </View>

          {/* Fixed footer with logout button - positioned outside ScrollView */}
          <View style={[styles.fixedFooter, { paddingBottom: insets.bottom || 20 }]}>
            {/* Animated logout button */}
            <Animated.View style={{
              opacity: logoutButtonAnimation,
              transform: [{ 
                translateY: logoutButtonAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogoutWithSidebarClose}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[COLORS.accent.light, COLORS.accent.base]}
                  style={styles.logoutGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
                  <Text style={styles.logoutText}>DÉCONNEXION</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );
});

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: "100%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    zIndex: 10,
    overflow: 'hidden',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  sidebarGradient: {
    flex: 1,
    paddingHorizontal: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  brandingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  sidebarTitle: {
    color: COLORS.primary.contrast,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 8,
  },
  brandingLine: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.secondary.light,
    borderRadius: 2,
  },
  menuSection: {
    marginTop: 16,
  },
  sectionLabel: {
    color: COLORS.neutral[300],
    fontSize: 12,
    marginBottom: 16,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  footerSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  version: {
    color: COLORS.neutral[500],
    fontSize: 12,
    marginTop: 20,
    textAlign: "center",
  },
  fixedFooter: {
    paddingVertical: 16, 
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  logoutButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: COLORS.accent.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9,
  },
  overlayTouch: {
    width: "100%",
    height: "100%",
  },
});

export default Sidebar;