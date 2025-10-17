// Chemin : frontend/App.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  Keyboard, // AJOUT : Import de Keyboard pour détecter l'ouverture/fermeture
} from "react-native";
import { Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actionsheet";
import { LinearGradient } from "expo-linear-gradient";
import KeyboardWrapper from "./components/common/KeyboardWrapper";
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import EditCityInfoScreen from "./screens/EditCityInfoScreen";
import HelpScreen from "./screens/HelpScreen";
import ReportScreen from "./screens/ReportScreen";
import VotesScreen from "./screens/ReportScreen";
import PrivacyScreen from "./screens/PrivacyScreen";
import TermsScreen from "./screens/TermsScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import TutorialScreen from "./screens/TutorialScreen";
import CreateReportScreen from "./screens/CreateReportScreen";
import ReportDetailsScreen from "./screens/ReportDetailsScreen";
import PostsScreen from "./screens/PostsScreen";
import CommentsScreen from "./screens/CommentsScreen";
import StatisticsScreen from "./screens/StatisticsScreen";
import EditTeamScreen from "./screens/EditTeamScreen";
import EditNewsScreen from "./screens/EditNewsScreen";
import EditServicesScreen from "./screens/EditServicesScreen";
import CategoryReportsScreen from "./screens/CategoryReportsScreen";
import EventDetailsScreen from "./screens/EventDetailsScreen";
import CreateEventScreen from "./screens/CreateEventScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import Sidebar from "./components/common/Sidebar";
import NotificationsScreen from "./screens/NotificationsScreen";
import {
  NotificationProvider,
  useNotification,
} from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import ChatScreen from "./screens/ChatScreen";
import RankingScreen from "./screens/RankingScreen";
import ConversationsScreen from "./screens/ConversationsScreen";
import SocialScreen from "./screens/SocialScreen";
import CityScreen from "./screens/CityScreen";
import { useToken } from "./hooks/auth/useToken";
import PostDetailsScreen from "./screens/PostDetailsScreen";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate,
  interpolateColor,
  withSpring,
} from "react-native-reanimated";
import { useFonts } from "expo-font";
import { BlurView } from "expo-blur";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUserProfile } from "./hooks/user/useUserProfile";
import { UserProfileProvider } from "./context/UserProfileContext";
import styles from "./styles/screens/App.styles";

const LAYOUT = {
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    circle: 9999,
  },
  header: {
    height: Platform.OS === "ios" ? 100 : 90,
    padding: Platform.OS === "ios" ? 50 : 30,
  },
  tabBar: {
    height: 64 + (Platform.OS === "ios" ? 20 : 0),
    buttonSize: 44,
  },
  statusBar: {
    height: StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 24),
  },
  border: {
    width: 1,
    color: "rgba(0,0,0,0.08)",
  },
  shadow: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

// Enhanced color system with semantic naming
const COLORS = {
  primary: {
    base: "#1B5D85",
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
  state: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  overlay: "rgba(0,0,0,0.7)",
};

// Consistent spacing system - following 8pt grid
const SPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography scale
const FONT = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    heading: 24,
    title: 28,
  },
  family: {
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    brand: "Insanibc",
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const { width } = Dimensions.get("window");

export default function App() {
  const { getToken } = useToken();
  const previousOffset = useRef(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const threshold = 10;
  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);

  // Récupération des infos utilisateur
  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();

  // Fonctions dummy pour Sidebar (à adapter au besoin)
  const dummyFn = () => {};

  // Enhanced header animation
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(headerTranslateY.value, [-100, 0], [0, 1]);

    return {
      transform: [{ translateY: headerTranslateY.value }],
      opacity,
    };
  });

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Ce useEffect gère le minuteur de 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 3000); // 3 secondes

    return () => clearTimeout(timer); // Nettoyage
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await getToken();
        if (token) {
          setIsLoggedIn(true);
          console.log("Session restaurée, utilisateur connecté.");
        } else {
          console.log("Aucun token valide trouvé, utilisateur non connecté.");
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'état de connexion :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset <= 0) {
      headerTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      headerOpacity.value = withTiming(1, { duration: 300 });
      return;
    }

    if (currentOffset - previousOffset.current > threshold) {
      // Scroll vers le bas, cacher le header
      headerTranslateY.value = withTiming(-LAYOUT.header.height, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      headerOpacity.value = withTiming(0, { duration: 200 });
    } else if (previousOffset.current - currentOffset > threshold) {
      // Scroll vers le haut, montrer le header
      headerTranslateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      headerOpacity.value = withTiming(1, { duration: 300 });
    }

    previousOffset.current = currentOffset;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => {
      console.log("Sidebar state before toggle:", prevState);
      return !prevState;
    });
  };

  const clearAllTokens = async () => {
    console.log("Suppression de toutes les données stockées.");
    const keys = await AsyncStorage.getAllKeys();
    console.log("Clés avant suppression :", keys);
    await AsyncStorage.multiRemove([
      "authToken",
      "refreshToken",
      "userId",
      "userToken",
    ]);
    const remainingKeys = await AsyncStorage.getAllKeys();
    console.log("Clés après suppression :", remainingKeys);
  };

  const handleLogout = async () => {
    try {
      await clearAllTokens();
      await AsyncStorage.removeItem("userToken");
      setIsLoggedIn(false);
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const CustomHeader = ({ navigation, headerTranslateY }) => {
    const { unreadCount } = useNotification();
    const notificationScale = useSharedValue(1);
    const notificationBgOpacity = useSharedValue(0);

    // Refs pour contrôler l'animation
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
    const previousCountRef = useRef(0);

    useEffect(() => {
      // Nettoyer le timeout précédent
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }

      // Animation uniquement si le count AUGMENTE
      if (unreadCount > previousCountRef.current && unreadCount > 0) {
        // Animation simple - UNE SEULE FOIS
        animationTimeoutRef.current = setTimeout(() => {
          // Scale up
          notificationScale.value = withSpring(1.2, {
            damping: 10,
            stiffness: 100,
          });

          // Background pulse
          notificationBgOpacity.value = withTiming(0.6, { duration: 200 });

          // Retour à la normale après 600ms
          setTimeout(() => {
            notificationScale.value = withSpring(1, {
              damping: 10,
              stiffness: 100,
            });
            notificationBgOpacity.value = withTiming(0, { duration: 400 });
          }, 600);
        }, 300);
      }

      // Mémoriser le count actuel
      previousCountRef.current = unreadCount;

      // Reset si plus de notifications
      if (unreadCount === 0) {
        notificationScale.value = 1;
        notificationBgOpacity.value = 0;
      }

      // CRITIQUE : Cleanup au démontage
      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
          animationTimeoutRef.current = null;
        }
      };
    }, [unreadCount]);

    const notificationStyle = useAnimatedStyle(() => ({
      transform: [{ scale: notificationScale.value }],
    }));

    const notificationBgStyle = useAnimatedStyle(() => ({
      opacity: notificationBgOpacity.value,
    }));

    const handlePress = () => {
      Alert.alert(
        "Voulez-vous voir le tutoriel ?",
        "",
        [
          {
            text: "Non",
            style: "cancel",
          },
          {
            text: "Oui",
            onPress: () => navigation.navigate("TutorialScreen"), // ou "Tutoriel" si tu veux une autre page
          },
        ],
        { cancelable: true }
      );
    };

    return (
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <LinearGradient
          colors={["#1B5D85", "#1B5D85"]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {Platform.OS === "ios" && (
            <BlurView
              intensity={15}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          )}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={toggleSidebar}
              activeOpacity={0.7}
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            >
              <Ionicons name="menu" size={24} color={COLORS.primary.contrast} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerTitleContainer}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Image
                source={require("./assets/images/logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigation.navigate("NotificationsScreen")}
              activeOpacity={0.7}
              hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
            >
              {unreadCount > 0 && (
                <Animated.View
                  style={[styles.notificationRipple, notificationBgStyle]}
                />
              )}

              <Ionicons
                name="notifications"
                size={22}
                color={COLORS.primary.contrast}
              />

              {unreadCount > 0 && (
                <Animated.View style={[styles.badge, notificationStyle]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const EmptyScreen = () => {
    return null;
  };

  const TabNavigator = ({ navigation }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const actionSheetRef = useRef<typeof ActionSheet | null>(null);
    const activeTab = useSharedValue(0);

    // AJOUT : State pour gérer la visibilité de la TabBar
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const tabBarTranslateY = useSharedValue(0);

    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          throw new Error("Aucun token trouvé");
        }
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'ID utilisateur :",
          error
        );
        return null;
      }
    };

    useEffect(() => {
      const initializeUserId = async () => {
        const id = await fetchUserId();
        setUserId(id);
        setLoading(false);
      };

      initializeUserId();
    }, []);

    // AJOUT : Gestion de la visibilité du clavier
    useEffect(() => {
      const keyboardWillShow = Keyboard.addListener(
        Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
        () => {
          setKeyboardVisible(true);
          // Animation pour cacher la TabBar
          tabBarTranslateY.value = withTiming(200, {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          });
        }
      );

      const keyboardWillHide = Keyboard.addListener(
        Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
        () => {
          setKeyboardVisible(false);
          // Animation pour montrer la TabBar
          tabBarTranslateY.value = withTiming(0, {
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          });
        }
      );

      // Cleanup
      return () => {
        keyboardWillShow.remove();
        keyboardWillHide.remove();
      };
    }, []);

    // Enhanced TabBar with modern design and smooth animations
    const TabBar = ({ state, descriptors, navigation }) => {
      // Animation for the active tab indicator
      useEffect(() => {
        activeTab.value = withTiming(state.index, {
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }, [state.index]);

      // Animated tab indicator with dynamic positioning
      const tabIndicatorStyle = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateX: interpolate(
                activeTab.value,
                [0, 1, 2, 3, 4],
                [
                  0,
                  width / 5,
                  (2 * width) / 5,
                  (3 * width) / 5,
                  (4 * width) / 5,
                ]
              ),
            },
          ],
        };
      });

      // AJOUT : Animation pour cacher/montrer la TabBar avec le clavier
      const tabBarAnimatedStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateY: tabBarTranslateY.value }],
        };
      });

      return (
        <Animated.View style={[styles.tabBarWrapper, tabBarAnimatedStyle]}>
          <LinearGradient
            colors={["#1B5D85", "#1B5D85"]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Glassmorphism effect for iOS */}
            {Platform.OS === "ios" && (
              <BlurView
                intensity={20}
                tint="dark"
                style={[
                  StyleSheet.absoluteFill,
                  { borderRadius: LAYOUT.radius.xl },
                ]}
              />
            )}

            {/* Animated tab indicator */}
            <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />

            <View style={styles.tabBarContainer}>
              {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                // Enhanced tab icon animations
                const tabIconScale = useSharedValue(isFocused ? 1.2 : 1);
                const tabIconOpacity = useSharedValue(isFocused ? 1 : 0.7);

                useEffect(() => {
                  if (isFocused) {
                    tabIconScale.value = withSpring(1.2, {
                      damping: 10,
                      stiffness: 100,
                    });
                    tabIconOpacity.value = withTiming(1, {
                      duration: 200,
                    });
                  } else {
                    tabIconScale.value = withSpring(1, {
                      damping: 10,
                      stiffness: 100,
                    });
                    tabIconOpacity.value = withTiming(0.7, {
                      duration: 200,
                    });
                  }
                }, [isFocused]);

                const tabIconStyle = useAnimatedStyle(() => {
                  return {
                    transform: [{ scale: tabIconScale.value }],
                    opacity: tabIconOpacity.value,
                  };
                });

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (!isFocused && !event.defaultPrevented) {
                    if (route.name === "Ajouter") {
                      actionSheetRef.current?.show();
                    } else {
                      navigation.navigate(route.name);
                    }
                  }
                };

                let iconName:
                  | "home"
                  | "home-outline"
                  | "chatbubble-ellipses"
                  | "chatbubble-ellipses-outline"
                  | "people"
                  | "people-outline"
                  | "map"
                  | "map-outline"
                  | "add-circle" = "home";
                if (route.name === "Accueil") {
                  iconName = isFocused ? "home" : "home-outline";
                } else if (route.name === "Messages") {
                  iconName = isFocused
                    ? "chatbubble-ellipses"
                    : "chatbubble-ellipses-outline";
                } else if (route.name === "Social") {
                  iconName = isFocused ? "people" : "people-outline";
                } else if (route.name === "Carte") {
                  iconName = isFocused ? "map" : "map-outline";
                } else if (route.name === "Ajouter") {
                  iconName = "add-circle";
                }

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={onPress}
                    style={styles.tabButton}
                    activeOpacity={0.8}
                    hitSlop={{ top: 10, bottom: 10 }}
                  >
                    {/* Special styling for the Add button */}
                    {route.name === "Ajouter" ? (
                      <View style={styles.addButtonWrapper}>
                        <LinearGradient
                          colors={[COLORS.accent.light, COLORS.accent.base]}
                          style={styles.addButtonGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <Ionicons
                            name={iconName}
                            size={32}
                            color={COLORS.accent.contrast}
                          />
                        </LinearGradient>
                      </View>
                    ) : (
                      <View style={styles.tabButtonContent}>
                        <Animated.View style={tabIconStyle}>
                          <Ionicons
                            name={iconName}
                            size={24}
                            color={COLORS.primary.contrast}
                          />
                        </Animated.View>

                        {isFocused && (
                          <Text style={styles.tabLabel}>{route.name}</Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
        </Animated.View>
      );
    };

    return (
      <>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            header: ({ navigation }) => (
              <CustomHeader
                navigation={navigation}
                headerTranslateY={headerTranslateY}
              />
            ),
            tabBarShowLabel: false,
          })}
          tabBar={(props) => <TabBar {...props} />}
        >
          <Tab.Screen name="Accueil">
            {({ navigation }) => {
              useEffect(() => {
                const unsubscribe = navigation.addListener("focus", () => {
                  headerTranslateY.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                  });
                });
                return unsubscribe;
              }, [navigation]);

              return (
                <HomeScreen
                  navigation={navigation}
                  handleScroll={handleScroll}
                />
              );
            }}
          </Tab.Screen>

          <Tab.Screen
            name="Carte"
            component={MapScreen}
            listeners={{
              focus: () => {
                headerTranslateY.value = withTiming(0, {
                  duration: 300,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                });
              },
            }}
          />

          <Tab.Screen
            name="Ajouter"
            component={EmptyScreen}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                actionSheetRef.current?.show();
              },
              focus: () => {
                headerTranslateY.value = withTiming(0, {
                  duration: 300,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                });
              },
            }}
          />

          <Tab.Screen name="Social">
            {({ navigation }) => {
              useEffect(() => {
                const unsubscribe = navigation.addListener("focus", () => {
                  headerTranslateY.value = withTiming(0, {
                    duration: 300,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                  });
                });
                return unsubscribe;
              }, [navigation]);

              return <SocialScreen handleScroll={handleScroll} />;
            }}
          </Tab.Screen>

          <Tab.Screen
            name="Messages"
            component={ConversationsScreen}
            initialParams={{ userId }}
            listeners={{
              focus: () => {
                headerTranslateY.value = withTiming(0, {
                  duration: 300,
                  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                });
              },
            }}
          />
        </Tab.Navigator>

        {/* Enhanced ActionSheet with modern styling */}
        <ActionSheet
          ref={(o) => (actionSheetRef.current = o)}
          title="Que voulez-vous ?"
          titleTextStyle={styles.actionSheetTitle}
          separatorStyle={styles.actionSheetSeparator}
          buttonUnderlayColor={COLORS.neutral[200]}
          options={[
            "Ajouter un signalement",
            "Ajouter un événement",
            "Annuler",
          ]}
          cancelButtonIndex={2}
          destructiveButtonIndex={-1}
          tintColor={COLORS.primary.base}
          buttonTextStyle={styles.actionSheetButtonText}
          onPress={(index) => {
            if (index === 0) {
              navigation.navigate("CreateReportScreen");
            } else if (index === 1) {
              navigation.navigate("CreateEventScreen");
            }
          }}
        />
      </>
    );
  };

  const [fontsLoaded] = useFonts({
    Insanibc: require("../frontend/assets/fonts/Insanibc.ttf"),
  });

  // Enhanced splash screen with brand styling
  if (loading || !minTimeElapsed) {
    return (
      <View style={styles.initialLoadingContainer}>
        <LinearGradient
          colors={[COLORS.primary.base, COLORS.primary.dark]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loadingContainer}>
            <Image
              source={require("./assets/images/logo-accueil.png")}
              style={styles.fullscreenLogo}
              resizeMode="cover" // ou "contain" selon l'effet que tu veux
            />
            <ActivityIndicator
              size="large"
              color={COLORS.primary.contrast}
              style={styles.loader}
            />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider handleLogout={handleLogout}>
        <UserProfileProvider>
          <NotificationProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor="transparent"
              translucent
            />
            <NavigationContainer>
              <KeyboardWrapper>
                <>
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {!isLoggedIn ? (
                      <>
                        <Stack.Screen name="Login">
                          {(props) => (
                            <LoginScreen
                              {...props}
                              onLogin={() => {
                                setIsLoggedIn(true);
                              }}
                            />
                          )}
                        </Stack.Screen>
                        <Stack.Screen name="Register">
                          {(props) => (
                            <RegisterScreen
                              {...props}
                              onLogin={() => {
                                setIsLoggedIn(true);
                              }}
                            />
                          )}
                        </Stack.Screen>
                      </>
                    ) : (
                      <>
                        <Stack.Screen name="Main" component={TabNavigator} />

                        {/* Correction des fonctions inline pour les écrans */}
                        <Stack.Screen
                          name="ProfileScreen"
                          component={ProfileScreen}
                        />
                        <Stack.Screen
                          name="UserProfileScreen"
                          component={UserProfileScreen}
                        />

                        <Stack.Screen
                          name="ReportDetailsScreen"
                          component={
                            ReportDetailsScreen as React.ComponentType<any>
                          }
                        />
                        <Stack.Screen
                          name="ReportScreen"
                          component={ReportScreen}
                        />
                        <Stack.Screen
                          name="EventDetailsScreen"
                          component={
                            EventDetailsScreen as React.ComponentType<any>
                          }
                        />
                        <Stack.Screen
                          name="TutorialScreen"
                          component={(props) => (
                            <TutorialScreen
                              {...props}
                              visible={true}
                              title="Tutorial"
                              description="Learn how to use the app"
                              onNext={() => {}}
                            />
                          )}
                        />
                        <Stack.Screen
                          name="EditCityInfoScreen"
                          component={EditCityInfoScreen}
                        />
                        <Stack.Screen
                          name="EditTeamScreen"
                          component={EditTeamScreen}
                        />
                        <Stack.Screen
                          name="EditNewsScreen"
                          component={EditNewsScreen}
                        />
                        <Stack.Screen
                          name="EditServicesScreen"
                          component={EditServicesScreen}
                        />
                        <Stack.Screen
                          name="HelpScreen"
                          component={HelpScreen}
                        />
                        <Stack.Screen
                          name="StatisticsScreen"
                          component={StatisticsScreen}
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="EventsScreen"
                          component={EventsScreen}
                        />
                        <Stack.Screen
                          name="CategoryReportsScreen"
                          component={CategoryReportsScreen}
                        />
                        <Stack.Screen
                          name="CreateEventScreen"
                          component={CreateEventScreen}
                        />
                        <Stack.Screen
                          name="PrivacyScreen"
                          component={PrivacyScreen}
                        />
                        <Stack.Screen
                          name="TermsScreen"
                          component={TermsScreen}
                        />
                        <Stack.Screen
                          name="VotesScreen"
                          component={VotesScreen}
                        />
                        <Stack.Screen
                          name="CreateReportScreen"
                          component={CreateReportScreen}
                        />
                        <Stack.Screen
                          name="NotificationsScreen"
                          component={NotificationsScreen}
                        />
                        <Stack.Screen
                          name="ChatScreen"
                          component={ChatScreen}
                        />
                        <Stack.Screen
                          name="RankingScreen"
                          component={RankingScreen}
                        />
                        <Stack.Screen
                          name="ConversationsScreen"
                          component={ConversationsScreen}
                        />
                        <Stack.Screen
                          name="SignalementsScreen"
                          component={ReportScreen}
                        />
                        <Stack.Screen
                          name="CityScreen"
                          component={CityScreen}
                        />
                        <Stack.Screen
                          name="PostsScreen"
                          component={PostsScreen}
                        />
                        <Stack.Screen
                          name="CommentsScreen"
                          component={CommentsScreen}
                        />
                        <Stack.Screen
                          name="PostDetailsScreen"
                          component={
                            PostDetailsScreen as React.ComponentType<any>
                          }
                        />
                      </>
                    )}
                  </Stack.Navigator>
                  {/* Sidebar moved inside NavigationContainer */}
                  <Sidebar
                    isOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    user={user}
                    displayName={displayName}
                    voteSummary={voteSummary}
                    onShowNameModal={dummyFn}
                    onShowVoteInfoModal={dummyFn}
                    onNavigateToCity={() => {
                      /* TODO : remplacer par une navigation appropriée si besoin */
                    }}
                    updateProfileImage={updateProfileImage}
                  />
                </>
              </KeyboardWrapper>
            </NavigationContainer>
          </NotificationProvider>
        </UserProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
