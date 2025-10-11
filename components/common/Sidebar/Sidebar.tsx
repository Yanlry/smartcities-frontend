// Chemin : frontend/components/common/Sidebar/Sidebar.tsx

import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Easing,
  Image,
  Dimensions,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../context/AuthContext";
import { SidebarProps } from "../../../types/components/common/sidebar.types";
import SidebarItem from "./SidebarItem";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUserProfile } from "../../../context/UserProfileContext";
import ProfilePhotoModal from "../../profile/Photo/ProfilePhoto";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types/navigation/routes.types";
import {
  NameModal,
  BadgeModal,
  LikeInfoModal,
  FollowersModal,
  FollowingModal,
} from "../../home/modals";
// @ts-ignore
import { API_URL } from "@env";
import axios from "axios";
import JoyfulLoader from "../../common/Loader/JoyfulLoader";

// Theme system with colors, spacing, etc.
const THEME = {
  colors: {
    primary: {
      gradient: ["#8E2DE2", "#4A00E0"] as const,
      dark: "#2E1A47",
      main: "#5D3FD3",
      light: "#8E72E1",
      ultraLight: "#EFE9FF",
    },
    secondary: {
      gradient: ["#FF416C", "#FF4B2B"],
      dark: "#B22A49",
      main: "#FF416C",
      light: "#FF7A9C",
      ultraLight: "#FFECF1",
    },
    accent: {
      gradient: ["#00C6FB", "#005BEA"],
      dark: "#005BEA",
      main: "#1DA1F2",
      light: "#70C4F9",
      ultraLight: "#E8F5FE",
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
    },
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

const windowHeight = Dimensions.get("window").height;

/**
 * Modern sidebar component for social network
 * Immersive design with optimized animation management
 */
const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, toggleSidebar }) => {
  
  const {
    user,
    displayName,
    voteSummary: contextVoteSummary,
    updateProfileImage,
    updateUserDisplayPreference,
    refreshUserData,
  } = useUserProfile();

  useEffect(() => {
    if (isOpen) {
      refreshUserData();
    }
  }, [isOpen, refreshUserData]);

  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState<boolean>(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showLikeInfoModal, setShowLikeInfoModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isContentReady, setContentReady] = useState(false);

  const safeVoteSummary = {
    up: typeof contextVoteSummary?.up === "number" ? contextVoteSummary.up : 0,
    down: typeof contextVoteSummary?.down === "number" ? contextVoteSummary.down : 0,
  };

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { handleLogout } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const sidebarTranslateX = useRef(new Animated.Value(-width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.8)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const statOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id || !isOpen) return;
      try {
        setError(null);
        setContentReady(false);

        avatarScale.setValue(0.8);
        nameOpacity.setValue(0);
        statOpacity.setValue(0);

        const response = await axios.get(`${API_URL}/users/stats/${user.id}`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }
        const data = response.data;
        setStats(data);
      } catch (error: any) {
        console.error("Erreur dans fetchStats :", error.message || error);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        avatarScale.setValue(1);
        setTimeout(() => nameOpacity.setValue(1), 150);
        setTimeout(() => statOpacity.setValue(1), 300);

        mainItemsAnimations.forEach((anim, index) => {
          setTimeout(() => anim.setValue(0), 350 + index * 50);
        });
        secondaryItemsAnimations.forEach((anim, index) => {
          setTimeout(() => anim.setValue(0), 700 + index * 50);
        });
        setTimeout(() => {
          logoutButtonAnimation.opacity.setValue(1);
          logoutButtonAnimation.translateY.setValue(0);
        }, 900);

        setTimeout(() => {
          setContentReady(true);
        }, 1000);
      }
    };
    fetchStats();
  }, [user, isOpen]);

  const mainItemsAnimations = useRef(
    Array(6)  // ← Changé de 5 à 6
      .fill(0)
      .map(() => new Animated.Value(-50))
  ).current;

  const secondaryItemsAnimations = useRef(
    Array(4)
      .fill(0)
      .map(() => new Animated.Value(-40))
  ).current;

  const logoutButtonAnimation = useRef({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }).current;

  useEffect(() => {
    if (isOpen) {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }

      Animated.timing(sidebarTranslateX, {
        toValue: 0,
        duration: THEME.animation.duration.normal,
        easing: THEME.animation.easing.standard,
        useNativeDriver: true,
      }).start();

      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: THEME.animation.duration.fast,
        easing: THEME.animation.easing.decelerate,
        useNativeDriver: true,
      }).start();

      Animated.timing(avatarScale, {
        toValue: 1,
        duration: THEME.animation.duration.slow,
        easing: THEME.animation.easing.spring,
        useNativeDriver: true,
      }).start();

      Animated.sequence([
        Animated.delay(150),
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: THEME.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.delay(250),
        Animated.timing(statOpacity, {
          toValue: 1,
          duration: THEME.animation.duration.normal,
          useNativeDriver: true,
        }),
      ]).start();

      mainItemsAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(350 + index * 50),
          Animated.timing(anim, {
            toValue: 0,
            duration: THEME.animation.duration.fast,
            easing: THEME.animation.easing.standard,
            useNativeDriver: true,
          }),
        ]).start();
      });

      secondaryItemsAnimations.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(700 + index * 50),
          Animated.timing(anim, {
            toValue: 0,
            duration: THEME.animation.duration.fast,
            easing: THEME.animation.easing.standard,
            useNativeDriver: true,
          }),
        ]).start();
      });

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

      avatarScale.setValue(0.8);
      nameOpacity.setValue(0);
      statOpacity.setValue(0);

      mainItemsAnimations.forEach((anim) => {
        anim.setValue(-50);
      });

      secondaryItemsAnimations.forEach((anim) => {
        anim.setValue(-40);
      });

      logoutButtonAnimation.opacity.setValue(0);
      logoutButtonAnimation.translateY.setValue(20);
    }
  }, [isOpen, width]);

  const handleNavigation = useCallback(
    (screen: string) => {
      navigation.navigate(screen as never);
      toggleSidebar();
    },
    [navigation, toggleSidebar]
  );

  const handleLogoutWithSidebarClose = useCallback(() => {
    toggleSidebar();
    setTimeout(() => {
      handleLogout();
    }, THEME.animation.duration.normal);
  }, [toggleSidebar, handleLogout]);

  const mainMenuItems = [
    {
      icon: (
        <FontAwesome5
          name="home"
          size={18}
          color={THEME.colors.neutral.white}
        />
      ),
      label: "Tableau de bord",
      screen: "Main",
    },
    {
      icon: (
        <FontAwesome5
          name="map-marker-alt"
          size={18}
          color={THEME.colors.neutral.white}
        />
      ),
      label: "Explorer ma ville",
      screen: "CityScreen",
    },
    {
      icon: (
        <FontAwesome5
          name="trophy"
          size={18}
          color={THEME.colors.neutral.white}
        />
      ),
      label: "Classements",
      screen: "RankingScreen",
    },
    // ✅ NOUVEAU : Statistiques ajouté ici
    {
      icon: (
        <FontAwesome5
          name="chart-bar"
          size={18}
          color={THEME.colors.neutral.white}
        />
      ),
      label: "Statistiques",
      screen: "StatisticsScreen",
    },
    {
      icon: (
        <FontAwesome5
          name="bullhorn"
          size={18}
          color={THEME.colors.neutral.white}
        />
      ),
      label: "Mes signalements",
      screen: "ReportScreen",
    },
    {
      icon: (
        <FontAwesome5
          name="calendar-alt"
          size={18}
          color={THEME.colors.neutral.white}
        />
      ),
      label: "Mes événements",
      screen: "EventsScreen",
    },
  ];
  
  // ✅ Menu secondaire (paramètres) - "Mon profil" reste en premier
  const secondaryMenuItems = [
    {
      icon: (
        <FontAwesome5
          name="user"
          size={18}
          color={THEME.colors.neutral.light}
        />
      ),
      label: "Mon profil",
      screen: "ProfileScreen",
    },
    {
      icon: (
        <FontAwesome5
          name="question-circle"
          size={18}
          color={THEME.colors.neutral.light}
        />
      ),
      label: "Aide et support",
      screen: "FAQScreen",
    },
    {
      icon: (
        <FontAwesome5
          name="file-alt"
          size={18}
          color={THEME.colors.neutral.light}
        />
      ),
      label: "Conditions d'utilisation",
      screen: "TermsScreen",
    },
    {
      icon: (
        <FontAwesome5
          name="shield-alt"
          size={18}
          color={THEME.colors.neutral.light}
        />
      ),
      label: "Confidentialité",
      screen: "PrivacyScreen",
    },
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

  const handleOptionChange = useCallback(
    async (option: "fullName" | "username") => {
      setShowNameModal(false);
      await updateUserDisplayPreference(option === "fullName");
    },
    [updateUserDisplayPreference]
  );

  const handleOpenPhotoModal = useCallback(() => {
    setShowProfilePhotoModal(true);
  }, []);

  const handlePhotoUpdateSuccess = useCallback(() => {
    refreshUserData();
    toggleSidebar();
  }, [refreshUserData, toggleSidebar]);

  const renderContent = () => {
    if (!isContentReady) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <JoyfulLoader message="Chargement de votre profil..." color="#FFFFFF" />
        </View>
      );
    } else if (error) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Icon name="error-outline" size={60} color="#333" />
          <Text style={styles.errorTitle}>Oups !</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.navigate("ProfileScreen", { userId: user?.id || "" })}
          >
            <Text style={styles.errorButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.userProfileSection}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleSidebar}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <View style={styles.closeButtonInner}>
                <FontAwesome5 name="times" size={16} color={THEME.colors.neutral.light} />
              </View>
            </TouchableOpacity>
            
            <Animated.View
              style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}
            >
              <TouchableOpacity onPress={handleOpenPhotoModal}>
                <LinearGradient
                  colors={THEME.colors.primary.gradient}
                  style={styles.avatarGradientBorder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {user?.profilePhoto?.url ? (
                    <Image source={{ uri: user.profilePhoto.url }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarImage}>
                      <FontAwesome5 name="user" size={30} color="#CED4DA" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowNameModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={14} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: nameOpacity }}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text
                style={styles.userHandle}
                onPress={() => {
                  toggleSidebar();
                  navigation.navigate("ProfileScreen", { userId: user?.id || "" });
                }}
              >
                {user?.nomCommune || "Ville inconnue"}
              </Text>
            </Animated.View>

            <Animated.View style={[styles.statsContainer, { opacity: statOpacity }]}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.statValue}>{user?.followers?.length || 0}</Text>
                <Text style={styles.statLabel}>Abonnés</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity
                style={styles.statItem}
                onPress={() => setShowFollowingModal(true)}
              >
                <Text style={styles.statValue}>{user?.following?.length || 0}</Text>
                <Text style={styles.statLabel}>Abonnements</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity style={styles.statItem}
              onPress={() => handleNavigation("ReportScreen")}>
                <Text style={styles.statValue}>{stats?.numberOfReports || 0}</Text>
                <Text style={styles.statLabel}>Signalements</Text>
              </TouchableOpacity>

            </Animated.View>

            <TouchableOpacity onPress={() => setShowLikeInfoModal(true)}>
              <Animated.View style={{ opacity: statOpacity }}>
                {(() => {
                  const totalFeedback = safeVoteSummary.up + safeVoteSummary.down;
                  const hasData = totalFeedback > 0;
                  const voteRatio = !hasData ? 50 : Math.round((safeVoteSummary.up / totalFeedback) * 100);
                  const negativeRatio = 100 - voteRatio;
                  const positiveFlex = !hasData ? 1 : Math.max(0.1, safeVoteSummary.up);
                  const negativeFlex = !hasData ? 1 : Math.max(0.1, safeVoteSummary.down);
                  const ratingColor = !hasData
                    ? "#8BC34A"
                    : voteRatio >= 85
                    ? "#4CAF50"
                    : voteRatio >= 60
                    ? "#8BC34A"
                    : voteRatio >= 50
                    ? "#FF9800"
                    : "#F44336";

                  return (
                    <View>
                      <View style={styles.ratingLabelsContainer}>
                        <Text style={styles.ratingPercentage}>{voteRatio}% positif</Text>
                        <Text style={styles.voteCount}>({safeVoteSummary.up} votes)</Text>
                      </View>
                      <View style={styles.progressBarMini}>
                        <View
                          style={[
                            styles.positiveProgressMini,
                            { flex: positiveFlex, backgroundColor: ratingColor },
                          ]}
                        />
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
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            style={styles.menuScrollView}
            contentContainerStyle={styles.menuScrollContent}
          >
            <Text style={styles.menuSectionTitle}>MENU</Text>
            {mainMenuItems.map((item, index) => (
              <Animated.View
                key={`main-${index}`}
                style={{
                  transform: [{ translateX: mainItemsAnimations[index] }],
                  opacity: mainItemsAnimations[index].interpolate({
                    inputRange: [-50, 0],
                    outputRange: [0, 1],
                  }),
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

            <Text style={[styles.menuSectionTitle, styles.secondaryTitle]}>PARAMÈTRES</Text>
            {secondaryMenuItems.map((item, index) => (
              <Animated.View
                key={`secondary-${index}`}
                style={{
                  transform: [{ translateX: secondaryItemsAnimations[index] }],
                  opacity: secondaryItemsAnimations[index].interpolate({
                    inputRange: [-40, 0],
                    outputRange: [0, 1],
                  }),
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

            <View style={styles.versionContainer}>
              <LinearGradient
                colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                style={styles.versionBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.versionText}>Smartcities | v1.07.25</Text>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>
      );
    }
  };

  return (
    <>
      {isOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity, top: 0 }]}>
          <Pressable
            style={styles.overlayTouch}
            onPress={toggleSidebar}
            android_ripple={{ color: "rgba(255,255,255,0.1)", borderless: true }}
          />
        </Animated.View>
      )}

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
        <LinearGradient
          colors={['#062C41', '#0F3460']}
          style={styles.sidebarBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderContent()}
          
          <Animated.View
            style={[
              styles.footerContainer,
              {
                opacity: logoutButtonAnimation.opacity,
                transform: [{ translateY: logoutButtonAnimation.translateY }],
              },
            ]}
          >
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

      <ProfilePhotoModal
        visible={showProfilePhotoModal}
        onClose={() => setShowProfilePhotoModal(false)}
        currentPhotoUrl={user?.profilePhoto?.url || null}
        onSuccess={handlePhotoUpdateSuccess}
        username={user?.username || "Utilisateur"}
        isSubmitting={false}
        isFollowing={false}
        onFollow={() => Promise.resolve()}
        onUnfollow={() => Promise.resolve()}
      />
      <NameModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        useFullName={user?.useFullName || false}
        onOptionChange={handleOptionChange}
      />
      <BadgeModal visible={false} onClose={() => {}} userVotes={0} />
      <LikeInfoModal visible={showLikeInfoModal} onClose={() => setShowLikeInfoModal(false)} />
      <FollowersModal
        visible={showFollowersModal}
        onClose={() => {
          toggleSidebar();
          setShowFollowersModal(false);
        }}
        followers={user?.followers || []}
        onUserPress={handleFollowingUserPress}
      />
      <FollowingModal
        visible={showFollowingModal}
        onClose={() => {
          toggleSidebar();
          setShowFollowingModal(false);
        }}
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
    height: windowHeight, // Définie la hauteur constante
    zIndex: 1000,
    overflow: "hidden",
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  sidebarBackground: {
    flex: 1,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "column",
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
    borderBottomColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: THEME.spacing.lg,
    right: THEME.spacing.lg,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: THEME.spacing.md,
    position: "relative",
  },
  avatarGradientBorder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3, // épaisseur de la bordure
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  onlineStatusBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: THEME.colors.neutral.dark,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 2,
  },
  userHandle: {
    color: THEME.colors.neutral.light,
    fontSize: 14,
    textAlign: "center",
    marginBottom: THEME.spacing.md,
  },

  // Statistiques de l'utilisateur
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: THEME.spacing.xs,
    marginBottom: THEME.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: THEME.colors.neutral.white,
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    color: THEME.colors.neutral.light,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    textAlign: "center",
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
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
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: THEME.spacing.md,
    paddingLeft: THEME.spacing.xs,
  },
  secondaryTitle: {
    marginTop: THEME.spacing.xl,
  },

  // Version badge
  versionContainer: {
    alignItems: "center",
    marginTop: THEME.spacing.xl,
  },
  versionBadge: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.round,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  logoutButton: {
    borderRadius: THEME.borderRadius.lg,
    overflow: "hidden",
  },
  logoutButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
  },
  logoutIcon: {
    marginRight: THEME.spacing.sm,
  },
  logoutText: {
    color: THEME.colors.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
  ratingLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
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
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  positiveProgressMini: {
    height: "100%",
  },
  negativeProgressMini: {
    height: "100%",
    backgroundColor: "#F44336",
  },
  iconButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 32,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  errorButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Sidebar;