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
  Easing,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../../context/AuthContext';
import { SidebarProps } from '../../../types/components/common/sidebar.types';
import SidebarItem from './SidebarItem';
// Import du hook depuis le contexte global au lieu des props
import { useUserProfile } from "../../../context/UserProfileContext";

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigation/routes.types';
import {
  NameModal,
  BadgeModal,
  LikeInfoModal,
  FollowersModal,
  FollowingModal,
} from "../../../components/home/modals";

// Système de design pour réseau social moderne
const THEME = {
  colors: {
    primary: {
      gradient: ["#8E2DE2", "#4A00E0"] as const, // Gradient violet-indigo
      dark: "#2E1A47",
      main: "#5D3FD3",
      light: "#8E72E1",
      ultraLight: "#EFE9FF"
    },
    secondary: {
      gradient: ["#FF416C", "#FF4B2B"], // Gradient rose-orange
      dark: "#B22A49",
      main: "#FF416C",
      light: "#FF7A9C",
      ultraLight: "#FFECF1"
    },
    accent: {
      gradient: ["#00C6FB", "#005BEA"], // Gradient bleu clair-bleu
      dark: "#005BEA",
      main: "#1DA1F2",
      light: "#70C4F9",
      ultraLight: "#E8F5FE"
    },
    success: {
      main: "#4CD964",
      light: "#A5EBAE",
    },
    neutral: {
      darkest: "#0A0A0A",
      dark: "#262626",
      medium: "#737373",
      light: "#D4D4D4",
      lightest: "#F5F5F5",
      white: "#FFFFFF",
    },
    glass: {
      dark: "rgba(10, 10, 10, 0.65)",
      medium: "rgba(38, 38, 38, 0.55)",
      light: "rgba(255, 255, 255, 0.15)",
      ultraLight: "rgba(255, 255, 255, 0.07)",
    },
    overlay: {
      dark: "rgba(0, 0, 0, 0.75)",
      medium: "rgba(0, 0, 0, 0.5)",
      light: "rgba(0, 0, 0, 0.25)",
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
  animation: {
    duration: {
      fastest: 150,
      fast: 250,
      normal: 300,
      slow: 450,
      slowest: 600,
    },
    easing: {
      standard: Easing.bezier(0.4, 0.0, 0.2, 1),
      decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
      accelerate: Easing.bezier(0.4, 0.0, 1, 1),
      sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
      spring: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    },
  },
};

// Helper pour les ombres multi-plateforme
const getShadow = (elevation = 4) => {
  return Platform.select({
    ios: {
      shadowColor: THEME.colors.neutral.darkest,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.15,
      shadowRadius: elevation * 0.75,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: THEME.colors.neutral.darkest,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.15,
      shadowRadius: elevation * 0.75,
      elevation,
    }
  });
};

/**
 * Sidebar moderne pour réseau social
 * Design immersif avec une gestion optimisée des animations
 */
const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, toggleSidebar, voteSummary }) => {
  // Utilisation du contexte global pour obtenir les données utilisateur
  const { 
    user, 
    displayName, 
    updateProfileImage, 
    updateUserDisplayPreference,
    refreshUserData 
  } = useUserProfile();

  // IMPORTANT: Rafraîchir les données quand la sidebar s'ouvre
  useEffect(() => {
    if (isOpen) {
      refreshUserData();
    }
  }, [isOpen, refreshUserData]);

  // Ajout des états locaux pour les modaux
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLikeInfoModal, setShowLikeInfoModal] = useState(false);

  // Ajout d'une valeur par défaut pour voteSummary
  const safeVoteSummary = voteSummary || { up: 0, down: 0 };

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { handleLogout } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animations avec valeurs initiales
  const sidebarTranslateX = useRef(new Animated.Value(-width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const statOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation pour les éléments de menu - tableau d'animations
  const mainItemsAnimations = useRef(
    Array(6).fill(0).map(() => new Animated.Value(-50))
  ).current;
  
  const secondaryItemsAnimations = useRef(
    Array(4).fill(0).map(() => new Animated.Value(-40))
  ).current;
  
  const logoutButtonAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20)
  }).current;
  
  // Gestion de toutes les animations d'entrée/sortie
  useEffect(() => {
    if (isOpen) {
      // Reset position du scroll
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
      
      // Animation de l'entrée du sidebar avec timing optimisé
      Animated.timing(sidebarTranslateX, {
        toValue: 0,
        duration: THEME.animation.duration.normal,
        easing: THEME.animation.easing.standard,
        useNativeDriver: true,
      }).start();
      
      // Overlay avec légère décélération
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: THEME.animation.duration.fast,
        easing: THEME.animation.easing.decelerate,
        useNativeDriver: true,
      }).start();
      
      // Animation de l'avatar avec effet de scale spring
      Animated.timing(avatarScale, {
        toValue: 1,
        duration: THEME.animation.duration.slow,
        easing: THEME.animation.easing.spring,
        useNativeDriver: true,
      }).start();
      
      // Animation d'opacité pour les informations utilisateur
      Animated.sequence([
        Animated.delay(150),
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: THEME.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animation des statistiques utilisateur
      Animated.sequence([
        Animated.delay(250),
        Animated.timing(statOpacity, {
          toValue: 1,
          duration: THEME.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animation séquentielle des éléments de menu principal
      mainItemsAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(350 + (index * 50)),
          Animated.timing(anim, {
            toValue: 0,
            duration: THEME.animation.duration.fast,
            easing: THEME.animation.easing.standard,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      // Animation séquentielle des éléments de menu secondaire
      secondaryItemsAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(700 + (index * 50)),
          Animated.timing(anim, {
            toValue: 0,
            duration: THEME.animation.duration.fast,
            easing: THEME.animation.easing.standard,
            useNativeDriver: true,
          }),
        ]).start();
      });
      
      // Animation du bouton de déconnexion
      Animated.sequence([
        Animated.delay(900),
        Animated.parallel([
          Animated.timing(logoutButtonAnimation.opacity, {
            toValue: 1,
            duration: THEME.animation.duration.normal,
            useNativeDriver: true,
          }),
          Animated.timing(logoutButtonAnimation.translateY, {
            toValue: 0,
            duration: THEME.animation.duration.normal,
            easing: THEME.animation.easing.standard,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      
    } else {
      // Animation de fermeture - plus rapide que l'ouverture
      Animated.timing(sidebarTranslateX, {
        toValue: -width,
        duration: THEME.animation.duration.fast,
        easing: THEME.animation.easing.accelerate,
        useNativeDriver: true,
      }).start();
      
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: THEME.animation.duration.fast,
        easing: THEME.animation.easing.accelerate,
        useNativeDriver: true,
      }).start();
      
      // Réinitialisation des animations d'items
      avatarScale.setValue(0.8);
      nameOpacity.setValue(0);
      statOpacity.setValue(0);
      
      mainItemsAnimations.forEach(anim => {
        anim.setValue(-50);
      });
      
      secondaryItemsAnimations.forEach(anim => {
        anim.setValue(-40);
      });
      
      logoutButtonAnimation.opacity.setValue(0);
      logoutButtonAnimation.translateY.setValue(20);
    }
  }, [isOpen, width]);

  // Navigation avec mémorisation
  const handleNavigation = useCallback((screen: string) => {
    navigation.navigate(screen as never);
    toggleSidebar();
  }, [navigation, toggleSidebar]);

  // Gestion de la déconnexion
  const handleLogoutWithSidebarClose = useCallback(() => {
    toggleSidebar();
    setTimeout(() => {
      handleLogout();
    }, THEME.animation.duration.normal);
  }, [toggleSidebar, handleLogout]);

  // Définition des éléments de menu avec icônes adaptées à un réseau social
  const mainMenuItems = [
    {
      icon: <FontAwesome5 name="home" size={18} color={THEME.colors.neutral.white} />,
      label: "Fil d'actualité",
      screen: "Main"
    },
    {
      icon: <FontAwesome5 name="map-marker-alt" size={18} color={THEME.colors.neutral.white} />,
      label: "Explorer ma ville",
      screen: "CityScreen"
    },
    {
      icon: <FontAwesome5 name="trophy" size={18} color={THEME.colors.neutral.white} />,
      label: "Classements",
      screen: "RankingScreen"
    },
    {
      icon: <FontAwesome5 name="user" size={18} color={THEME.colors.neutral.white} />,
      label: "Mon profil",
      screen: "ProfileScreen"
    },
    {
      icon: <FontAwesome5 name="bell" size={18} color={THEME.colors.neutral.white} />,
      label: "Mes notifications",
      screen: "ReportScreen"
    },
    {
      icon: <FontAwesome5 name="calendar-alt" size={18} color={THEME.colors.neutral.white} />,
      label: "Événements",
      screen: "EventsScreen"
    }
  ];

  const secondaryMenuItems = [
    {
      icon: <FontAwesome5 name="cog" size={18} color={THEME.colors.neutral.light} />,
      label: "Paramètres",
      screen: "PreferencesScreen"
    },
    {
      icon: <FontAwesome5 name="question-circle" size={18} color={THEME.colors.neutral.light} />,
      label: "Aide et support",
      screen: "FAQScreen"
    },
    {
      icon: <FontAwesome5 name="file-alt" size={18} color={THEME.colors.neutral.light} />,
      label: "Conditions d'utilisation",
      screen: "TermsScreen"
    },
    {
      icon: <FontAwesome5 name="shield-alt" size={18} color={THEME.colors.neutral.light} />,
      label: "Confidentialité",
      screen: "PrivacyScreen"
    }
  ];

  const handleFollowingUserPress = useCallback(
    (id: string) => {
      setShowFollowingModal(false);
      setShowFollowersModal(false);
      setTimeout(() => {
        navigation.navigate("UserProfileScreen", { userId: id });
      }, 300);
    },
    [navigation]
  );

  // Préférence d'affichage du nom d'utilisateur
  const handleOptionChange = useCallback(
    async (option: "fullName" | "username") => {
      setShowNameModal(false);
      await updateUserDisplayPreference(option === "fullName");
    },
    [updateUserDisplayPreference]
  );

  return (
    <>
      {/* Overlay animé avec effet de flou */}
      {isOpen && (
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: overlayOpacity,
              top: 0,
            }
          ]}
        >
          <Pressable 
            style={styles.overlayTouch} 
            onPress={toggleSidebar}
            android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
          />
        </Animated.View>
      )}

      {/* Sidebar principal avec animation de translation */}
      <Animated.View
        style={[
          styles.sidebar,
          { 
            transform: [{ translateX: sidebarTranslateX }],
            paddingTop: insets.top || 0,
            paddingBottom: insets.bottom || 0,
          },
        ]}
      >
        {/* Arrière-plan avec dégradé */}
        <LinearGradient
          colors={['#062C41', '#062C41', '#0F3460']}
          style={styles.sidebarBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Conteneur principal */}
          <View style={styles.contentContainer}>
            {/* En-tête avec avatar et statistiques utilisateur */}
            <View style={styles.userProfileSection}>
              {/* Bouton de fermeture en haut à droite */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={toggleSidebar}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <View style={styles.closeButtonInner}>
                  <FontAwesome5 name="times" size={16} color={THEME.colors.neutral.light} />
                </View>
              </TouchableOpacity>
              
              {/* Avatar animé */}
              <Animated.View style={[
                styles.avatarContainer, 
                { transform: [{ scale: avatarScale }] }
              ]}>
                <TouchableOpacity onPress={() => updateProfileImage("")}>
                  <LinearGradient
                    colors={THEME.colors.primary.gradient}
                    style={styles.avatarGradientBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {user?.profilePhoto?.url ? (
                      <Image 
                        source={{ uri: user.profilePhoto.url }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarImage}>
                        {/* Vous pouvez ajouter ici une icône ou un style par défaut */}
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                {/* Bouton réglages pour contrôler la visibilité du nom */}
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowNameModal(true)} activeOpacity={0.8}>
                  <Ionicons name="settings-outline" size={14} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
              
              {/* Nom et ville */}
              <Animated.View style={{ opacity: nameOpacity }}>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <Text style={styles.userHandle} onPress={() => navigation.navigate("ProfileScreen", { userId: user?.id || "" })}>
                  {user?.nomCommune || "Ville inconnue"}
                </Text>
              </Animated.View>
              
              {/* Statistiques : Abonnés, Abonnements et Publications */}
              <Animated.View style={[styles.statsContainer, { opacity: statOpacity }]}>
                <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowersModal(true)}>
                  <Text style={styles.statValue}>{user?.followers?.length || 0}</Text>
                  <Text style={styles.statLabel}>Abonnés</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <TouchableOpacity style={styles.statItem} onPress={() => setShowFollowingModal(true)}>
                  <Text style={styles.statValue}>{user?.following?.length || 0}</Text>
                  <Text style={styles.statLabel}>Abonnements</Text>
                </TouchableOpacity>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>297</Text>
                  <Text style={styles.statLabel}>Publications</Text>
                </View>
              </Animated.View>
              
              {/* Barre de feedback à la place de la progression du profil */}
              <Animated.View style={{ opacity: statOpacity }}>
                {(() => {
                  const totalFeedback = safeVoteSummary.up + safeVoteSummary.down;
                  const positiveFlex = totalFeedback === 0 ? 0.5 : safeVoteSummary.up;
                  const negativeFlex = totalFeedback === 0 ? 0.5 : safeVoteSummary.down;
                  const voteRatio = totalFeedback === 0 ? 50 : Math.round((safeVoteSummary.up / totalFeedback) * 100);
                  const negativeRatio = totalFeedback === 0 ? 50 : 100 - voteRatio;
                  const ratingColor = totalFeedback === 0 
                    ? "#4CAF50" 
                    : voteRatio >= 85 
                      ? "#4CAF50" 
                      : voteRatio >= 60 
                        ? "#8BC34A" 
                        : voteRatio >= 50 
                          ? "#FF9800" 
                          : "#4CAF50";
                  return (
                    <View>
                      <View style={styles.ratingLabelsContainer}>
                        <Text style={styles.ratingPercentage}>{voteRatio}% positif</Text>
                        <Text style={styles.voteCount}>({safeVoteSummary.up} votes)</Text>
                      </View>
                      <View style={styles.progressBarMini}>
                        <View style={[styles.positiveProgressMini, { flex: positiveFlex, backgroundColor: ratingColor }]} />
                        <View style={[styles.negativeProgressMini, { flex: negativeFlex }]} />
                      </View>
                      <View style={styles.ratingLabelsContainer}>
                        <Text style={styles.ratingPercentage}>{negativeRatio}% négatif</Text>
                        <Text style={styles.voteCount}>({safeVoteSummary.down} votes)</Text>
                      </View>
                    </View>
                  );
                })()}
              </Animated.View>
            </View>
            
            {/* Zone de scroll pour le menu */}
            <ScrollView
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              style={styles.menuScrollView}
              contentContainerStyle={styles.menuScrollContent}
            >
              {/* Menu principal */}
              <Text style={styles.menuSectionTitle}>MENU</Text>
              {mainMenuItems.map((item, index) => (
                <Animated.View 
                  key={`main-${index}`}
                  style={{ 
                    transform: [{ translateX: mainItemsAnimations[index] }],
                    opacity: mainItemsAnimations[index].interpolate({
                      inputRange: [-50, 0],
                      outputRange: [0, 1]
                    })
                  }}
                >
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    onPress={() => handleNavigation(item.screen)}
                    isActive={false}
                  />
                </Animated.View>
              ))}
              
              {/* Menu secondaire */}
              <Text style={[styles.menuSectionTitle, styles.secondaryTitle]}>PARAMÈTRES</Text>
              {secondaryMenuItems.map((item, index) => (
                <Animated.View 
                  key={`secondary-${index}`}
                  style={{ 
                    transform: [{ translateX: secondaryItemsAnimations[index] }],
                    opacity: secondaryItemsAnimations[index].interpolate({
                      inputRange: [-40, 0],
                      outputRange: [0, 1]
                    })
                  }}
                >
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    onPress={() => handleNavigation(item.screen)}
                    isActive={false}
                    isSecondary={true}
                  />
                </Animated.View>
              ))}
              
              {/* Numéro de version avec badge moderne */}
              <View style={styles.versionContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.versionBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <Text style={styles.versionText}>v1.07.23</Text>
                </LinearGradient>
              </View>
            </ScrollView>
          </View>
          
          {/* Footer avec bouton de déconnexion */}
          <Animated.View style={[
            styles.footerContainer,
            {
              opacity: logoutButtonAnimation.opacity,
              transform: [{ translateY: logoutButtonAnimation.translateY }]
            }
          ]}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogoutWithSidebarClose}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={THEME.colors.secondary.gradient as [string, string, ...string[]]}
                style={styles.logoutButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <FontAwesome5 name="sign-out-alt" size={16} color="#FFFFFF" style={styles.logoutIcon} />
                <Text style={styles.logoutText}>Déconnexion</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Rendu conditionnel des modaux */}
      <NameModal 
         visible={showNameModal} 
         onClose={() => setShowNameModal(false)} 
         useFullName={user?.useFullName || false}
         onOptionChange={handleOptionChange}
      />
      <BadgeModal 
         visible={false}  // Exemple, à lever si nécessaire
         onClose={() => {}}
         userVotes={0}
      />
      <LikeInfoModal 
         visible={showLikeInfoModal} 
         onClose={() => setShowLikeInfoModal(false)}
      />
      <FollowersModal 
         visible={showFollowersModal} 
         onClose={() => setShowFollowersModal(false)}
         followers={user?.followers || []}
         onUserPress={handleFollowingUserPress}
      />
      <FollowingModal 
         visible={showFollowingModal} 
         onClose={() => setShowFollowingModal(false)}
         following={user?.following || []}
         onUserPress={handleFollowingUserPress}
      />
    </>
  );
});

/**
 * Styles optimisés pour interface de réseau social moderne
 * Design avec hiérarchie visuelle claire et esthétique contemporaine
 */
const styles = StyleSheet.create({
  // Structure principale
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "80%", // largeur % pour meilleure adaptabilité
    maxWidth: 360,
    height: "100%",
    zIndex: 1000,
    overflow: 'hidden',
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    ...getShadow(15),
  },
  sidebarBackground: {
    flex: 1,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 999,
  },
  overlayTouch: {
    width: "100%",
    height: "100%",
  },

  // En-tête profil utilisateur
  userProfileSection: {
    paddingTop: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: THEME.spacing.lg,
    right: THEME.spacing.lg,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: THEME.spacing.md,
    position: 'relative',
  },
  avatarGradientBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3, // épaisseur de la bordure
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  onlineStatusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.neutral.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.neutral.dark,
  },
  onlineStatusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.success.main,
  },
  userName: {
    color: THEME.colors.neutral.white,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  userHandle: {
    color: THEME.colors.neutral.light,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },

  // Statistiques de l'utilisateur
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.xs,
    marginBottom: THEME.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: THEME.colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: THEME.spacing.xs,
  },

  // Barre de progression
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressText: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent.main,
    borderRadius: 2,
  },

  // Zone de menu
  menuScrollView: {
    flex: 1,
  },
  menuScrollContent: {
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
  },
  menuSectionTitle: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: THEME.spacing.md,
    paddingLeft: THEME.spacing.xs,
  },
  secondaryTitle: {
    marginTop: THEME.spacing.xl,
  },

  // Version badge
  versionContainer: {
    alignItems: 'center',
    marginTop: THEME.spacing.xl,
  },
  versionBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  versionText: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
  },

  // Footer et bouton de déconnexion
  footerContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  logoutButton: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...getShadow(6),
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
  },
  logoutIcon: {
    marginRight: THEME.spacing.sm,
  },
  logoutText: {
    color: THEME.colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingPercentage: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
  },
  voteCount: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
  },
  progressBarMini: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  positiveProgressMini: {
    height: '100%',
  },
  negativeProgressMini: {
    height: '100%',
    backgroundColor: '#F44336',
  },
  iconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Sidebar;

