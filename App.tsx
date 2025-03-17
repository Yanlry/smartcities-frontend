// Chemin : frontend/App.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actionsheet";
import { LinearGradient } from "expo-linear-gradient"; // Nouvelle importation
import KeyboardWrapper from "./components/common/KeyboardWrapper";
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ReportScreen from "./screens/ReportScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import CreateReportScreen from "./screens/CreateReportScreen";
import ReportDetailsScreen from "./screens/ReportDetailsScreen";
import CategoryReportsScreen from "./screens/CategoryReportsScreen";
import EventDetailsScreen from "./screens/EventDetailsScreen";
import CreateEventScreen from "./screens/CreateEventScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import Sidebar from "./components/common/Sidebar";
import { StatusBar } from "react-native";
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
} from "react-native-reanimated";
import { useFonts } from "expo-font";

// Définition des couleurs principales pour l'application
const COLORS = {
  primary: {
    start: "#062C41",
    end: "#0b3e5a",
  },
  text: "#FFFFFC",
  accent: "red",
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const { getToken } = useToken();
  const previousOffset = useRef(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const threshold = 10;
  const headerTranslateY = useSharedValue(0);

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
    if (currentOffset <= 0) return;
  
    if (currentOffset - previousOffset.current > threshold) {
      headerTranslateY.value = withTiming(-100, { duration: 200 });
    } else if (previousOffset.current - currentOffset > threshold) {
      headerTranslateY.value = withTiming(0, { duration: 200 });
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

  // Composant Header modifié avec le dégradé
  const CustomHeader = ({ navigation, headerTranslateY }) => {
    const { unreadCount } = useNotification();

    return (
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <LinearGradient
          colors={[COLORS.primary.start, COLORS.primary.end]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleSidebar}>
              <Icon
                name="menu"
                size={24}
                color={COLORS.text}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SmartCities</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("NotificationsScreen")}
            >
              <View>
                <Icon name="notifications" size={24} color={COLORS.text} />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
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

    if (loading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary.start} />
        </View>
      );
    }

    if (!userId) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Erreur : utilisateur non connecté.</Text>
        </View>
      );
    }

    // Ajout du composant pour le TabBar avec dégradé
    const TabBar = ({ state, descriptors, navigation }) => {
      return (
        <LinearGradient
          colors={[COLORS.primary.start, COLORS.primary.end]}
          style={styles.tabBarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.tabBarContainer}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  if (route.name === 'Ajouter') {
                    actionSheetRef.current?.show();
                  } else {
                    navigation.navigate(route.name);
                  }
                }
              };

              let iconName = "";
              if (route.name === "Accueil") {
                iconName = isFocused ? "home" : "home-outline";
              } else if (route.name === "Conversations") {
                iconName = isFocused
                  ? "chatbubble-ellipses"
                  : "chatbubble-ellipses-outline";
              } else if (route.name === "Social") {
                iconName = isFocused ? "people" : "people-outline";
              } else if (route.name === "Carte") {
                iconName = isFocused ? "map" : "map-outline";
              } else if (route.name === "Ajouter") {
                iconName = "add-circle-outline";
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={onPress}
                  style={styles.tabButton}
                >
                  <Icon
                    name={iconName}
                    size={isFocused ? 35 : 24}
                    color={COLORS.text}
                    style={{
                      fontWeight: isFocused ? "bold" : "normal",
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
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
                  headerTranslateY.value = withTiming(0, { duration: 200 });
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
                headerTranslateY.value = withTiming(0, { duration: 200 });
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
                headerTranslateY.value = withTiming(0, { duration: 200 });
              },
            }}
          />

          <Tab.Screen name="Social">
            {({ navigation }) => {
              useEffect(() => {
                const unsubscribe = navigation.addListener("focus", () => {
                  headerTranslateY.value = withTiming(0, { duration: 200 });
                });
                return unsubscribe;
              }, [navigation]);

              return <SocialScreen handleScroll={handleScroll} />;
            }}
          </Tab.Screen>

           <Tab.Screen
            name="Conversations"
            component={ConversationsScreen}
            initialParams={{ userId }}
            listeners={{
              focus: () => {
                headerTranslateY.value = withTiming(0, { duration: 200 });
              },
            }}
          />

        </Tab.Navigator>
        
        <ActionSheet
          ref={(o) => (actionSheetRef.current = o)}
          title="Que souhaitez-vous ajouter ?"
          options={[
            "Ajouter un signalement",
            "Ajouter un événement",
            "Annuler",
          ]}
          cancelButtonIndex={2}
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

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={COLORS.primary.start} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.start} />
      </View>
    );
  }

  return (
    <AuthProvider handleLogout={handleLogout}>
      <NotificationProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.start} />
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
                    <Stack.Screen
                      name="ProfileScreen"
                      component={ProfileScreen}
                    />
                      <Stack.Screen
                      name="UserProfileScreen"
                      component={(props) => <UserProfileScreen {...props} />}
                    />
                    <Stack.Screen
                      name="ReportDetailsScreen"
                      component={(props) => <ReportDetailsScreen {...props} />}
                    />
                    <Stack.Screen
                      name="ReportScreen"
                      component={ReportScreen}
                    />
                    <Stack.Screen
                      name="EventDetailsScreen"
                      component={EventDetailsScreen}
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
                      name="CreateReportScreen"
                      component={CreateReportScreen}
                    />
                    <Stack.Screen
                      name="NotificationsScreen"
                      component={NotificationsScreen}
                    />
                    <Stack.Screen name="ChatScreen" component={ChatScreen} />
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
                    <Stack.Screen name="CityScreen" component={CityScreen} />
                    <Stack.Screen
                      name="PostDetailsScreen"
                      component={PostDetailsScreen}
                    />
                  </>
                )}
              </Stack.Navigator>
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </>
          </KeyboardWrapper>
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerGradient: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 20,
    height: 90,
  },
  headerTitle: {
    fontSize: 24,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#FFFFFC",
    letterSpacing: 4,
    fontWeight: "bold",
    fontFamily: "Insanibc",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  // Styles pour la TabBar personnalisée
  tabBarGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 70,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});






// import React, { useState, useEffect, useRef } from "react";
// import {
//   StyleSheet,
//   ActivityIndicator,
//   View,
//   Text,
//   TouchableOpacity,
//   Dimensions,
//   StatusBar,
//   Platform,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { createStackNavigator } from "@react-navigation/stack";
// import Icon from "react-native-vector-icons/Ionicons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ActionSheet from "react-native-actionsheet";
// import { LinearGradient } from "expo-linear-gradient";
// import KeyboardWrapper from "./components/common/KeyboardWrapper";
// import HomeScreen from "./screens/HomeScreen";
// import EventsScreen from "./screens/EventsScreen";
// import ProfileScreen from "./screens/ProfileScreen";
// import ReportScreen from "./screens/ReportScreen";
// import MapScreen from "./screens/MapScreen";
// import LoginScreen from "./screens/Auth/LoginScreen";
// import RegisterScreen from "./screens/Auth/RegisterScreen";
// import CreateReportScreen from "./screens/CreateReportScreen";
// import ReportDetailsScreen from "./screens/ReportDetailsScreen";
// import CategoryReportsScreen from "./screens/CategoryReportsScreen";
// import EventDetailsScreen from "./screens/EventDetailsScreen";
// import CreateEventScreen from "./screens/CreateEventScreen";
// import UserProfileScreen from "./screens/UserProfileScreen";
// import Sidebar from "./components/common/Sidebar";
// import NotificationsScreen from "./screens/NotificationsScreen";
// import {
//   NotificationProvider,
//   useNotification,
// } from "./context/NotificationContext";
// import { AuthProvider } from "./context/AuthContext";
// import ChatScreen from "./screens/ChatScreen";
// import RankingScreen from "./screens/RankingScreen";
// import ConversationsScreen from "./screens/ConversationsScreen";
// import SocialScreen from "./screens/SocialScreen";
// import CityScreen from "./screens/CityScreen";
// import { useToken } from "./hooks/auth/useToken";
// import PostDetailsScreen from "./screens/PostDetailsScreen";
// import Animated, {
//   useSharedValue,
//   withTiming,
//   useAnimatedStyle,
//   Easing,
//   interpolate,
//   interpolateColor,
// } from "react-native-reanimated";
// import { useFonts } from "expo-font";
// import { BlurView } from "expo-blur";

// // Palette de couleurs modernisée
// const COLORS = {
//   primary: {
//     start: "#062C41", // Couleur principale conservée
//     end: "#134566",   // Légèrement plus claire pour meilleur contraste
//     light: "#1B5D85", // Variante pour les éléments actifs
//   },
//   secondary: {
//     main: "#2A93D5", // Bleu vif pour les accents
//     light: "#44A7E3", // Version plus claire
//   },
//   text: {
//     primary: "#FFFFFF",
//     secondary: "#E0F2FF",
//     dark: "#0A1721",
//   },
//   accent: "#FF5A5F", // Rouge pour les notifications et alertes
//   background: {
//     light: "#F7FAFD",
//     dark: "#0A1721",
//   },
//   status: {
//     success: "#34D399",
//     warning: "#FBBF24",
//     error: "#F87171",
//   },
// };

// // Constantes pour les dimensions et rayons
// const SIZES = {
//   radius: {
//     small: 8,
//     medium: 12,
//     large: 20,
//     xl: 30,
//   },
//   header: {
//     height: Platform.OS === "ios" ? 100 : 90,
//     paddingTop: Platform.OS === "ios" ? 50 : 30,
//   },
//   tabBar: {
//     height: 80,
//   }
// };

// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();
// const { width, height } = Dimensions.get("window");

// export default function App() {
//   const { getToken } = useToken();
//   const previousOffset = useRef(0);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const threshold = 10;
//   const headerTranslateY = useSharedValue(0);
//   const headerOpacity = useSharedValue(1);

//   // Animation du header
//   const headerAnimatedStyle = useAnimatedStyle(() => {
//     const opacity = interpolate(
//       headerTranslateY.value,
//       [-100, 0],
//       [0, 1]
//     );

//     return {
//       transform: [{ translateY: headerTranslateY.value }],
//       opacity,
//     };
//   });

//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         const token = await getToken();
//         if (token) {
//           setIsLoggedIn(true);
//           console.log("Session restaurée, utilisateur connecté.");
//         } else {
//           console.log("Aucun token valide trouvé, utilisateur non connecté.");
//         }
//       } catch (error) {
//         console.error(
//           "Erreur lors de la vérification de l'état de connexion :",
//           error
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeApp();
//   }, []);

//   const handleScroll = (event) => {
//     const currentOffset = event.nativeEvent.contentOffset.y;
//     if (currentOffset <= 0) {
//       headerTranslateY.value = withTiming(0, { 
//         duration: 300, 
//         easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
//       });
//       headerOpacity.value = withTiming(1, { duration: 300 });
//       return;
//     }
  
//     if (currentOffset - previousOffset.current > threshold) {
//       // Scroll vers le bas, cacher le header
//       headerTranslateY.value = withTiming(-SIZES.header.height, { 
//         duration: 300, 
//         easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
//       });
//       headerOpacity.value = withTiming(0, { duration: 200 });
//     } else if (previousOffset.current - currentOffset > threshold) {
//       // Scroll vers le haut, montrer le header
//       headerTranslateY.value = withTiming(0, { 
//         duration: 300, 
//         easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
//       });
//       headerOpacity.value = withTiming(1, { duration: 300 });
//     }
  
//     previousOffset.current = currentOffset;
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prevState) => {
//       console.log("Sidebar state before toggle:", prevState);
//       return !prevState;
//     });
//   };

//   const clearAllTokens = async () => {
//     console.log("Suppression de toutes les données stockées.");
//     const keys = await AsyncStorage.getAllKeys();
//     console.log("Clés avant suppression :", keys);
//     await AsyncStorage.multiRemove([
//       "authToken",
//       "refreshToken",
//       "userId",
//       "userToken",
//     ]);
//     const remainingKeys = await AsyncStorage.getAllKeys();
//     console.log("Clés après suppression :", remainingKeys);
//   };

//   const handleLogout = async () => {
//     try {
//       await clearAllTokens();
//       await AsyncStorage.removeItem("userToken");
//       setIsLoggedIn(false);
//       console.log("Déconnexion réussie");
//     } catch (error) {
//       console.error("Erreur lors de la déconnexion :", error);
//     }
//   };

//   // Composant Header redesigné
//   const CustomHeader = ({ navigation, headerTranslateY }) => {
//     const { unreadCount } = useNotification();
//     const notificationScale = useSharedValue(1);

//     // Effet pulse pour les notifications
//     useEffect(() => {
//       if (unreadCount > 0) {
//         const pulse = () => {
//           notificationScale.value = withTiming(1.2, { duration: 200 }, () => {
//             notificationScale.value = withTiming(1, { duration: 200 }, pulse);
//           });
//         };
//         pulse();
//       }
//     }, [unreadCount]);

//     const notificationStyle = useAnimatedStyle(() => {
//       return {
//         transform: [{ scale: notificationScale.value }]
//       };
//     });

//     return (
//       <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
//         <LinearGradient
//           colors={[COLORS.primary.start, COLORS.primary.end]}
//           style={styles.headerGradient}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           {/* Effet de glassmorphism pour donner de la profondeur */}
//           {Platform.OS === 'ios' && (
//             <BlurView
//               intensity={20}
//               tint="dark"
//               style={StyleSheet.absoluteFill}
//             />
//           )}
          
//           <View style={styles.header}>
//             <TouchableOpacity
//               style={styles.headerIconButton}
//               onPress={toggleSidebar}
//               activeOpacity={0.7}
//             >
//               <Icon name="menu" size={24} color={COLORS.text.primary} />
//             </TouchableOpacity>
            
//             <View style={styles.headerTitleContainer}>
//               <Text style={styles.headerTitle}>SmartCities</Text>
//             </View>
            
//             <TouchableOpacity
//               style={styles.headerIconButton}
//               onPress={() => navigation.navigate("NotificationsScreen")}
//               activeOpacity={0.7}
//             >
//               <Icon name="notifications" size={24} color={COLORS.text.primary} />
//               {unreadCount > 0 && (
//                 <Animated.View style={[styles.badge, notificationStyle]}>
//                   <Text style={styles.badgeText}>
//                     {unreadCount > 9 ? '9+' : unreadCount}
//                   </Text>
//                 </Animated.View>
//               )}
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>
//       </Animated.View>
//     );
//   };

//   const EmptyScreen = () => {
//     return null;
//   };

//   const TabNavigator = ({ navigation }) => {
//     const [userId, setUserId] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const actionSheetRef = useRef<typeof ActionSheet | null>(null);
//     const activeTab = useSharedValue(0);

//     const fetchUserId = async () => {
//       try {
//         const token = await AsyncStorage.getItem("authToken");
//         if (!token) {
//           throw new Error("Aucun token trouvé");
//         }
//         const payload = JSON.parse(atob(token.split(".")[1]));
//         return payload.userId;
//       } catch (error) {
//         console.error(
//           "Erreur lors de la récupération de l'ID utilisateur :",
//           error
//         );
//         return null;
//       }
//     };

//     useEffect(() => {
//       const initializeUserId = async () => {
//         const id = await fetchUserId();
//         setUserId(id);
//         setLoading(false);
//       };

//       initializeUserId();
//     }, []);

//     if (loading) {
//       return (
//         <View style={styles.loaderContainer}>
//           <LinearGradient
//             colors={[COLORS.primary.start, COLORS.primary.end]}
//             style={styles.loaderGradient}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//           >
//             <ActivityIndicator size="large" color={COLORS.text.primary} />
//             <Text style={styles.loaderText}>Chargement...</Text>
//           </LinearGradient>
//         </View>
//       );
//     }

//     if (!userId) {
//       return (
//         <View style={styles.errorContainer}>
//           <Icon name="alert-circle" size={40} color={COLORS.status.error} />
//           <Text style={styles.errorText}>Erreur : utilisateur non connecté.</Text>
//           <TouchableOpacity 
//             style={styles.errorButton}
//             onPress={handleLogout}
//           >
//             <Text style={styles.errorButtonText}>Retour à la connexion</Text>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     // TabBar redesigné avec effet glassmorphism et animations
//     const TabBar = ({ state, descriptors, navigation }) => {
//       // Animation pour le glissement en douceur du cercle de sélection
//       useEffect(() => {
//         activeTab.value = withTiming(state.index, {
//           duration: 300,
//           easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//         });
//       }, [state.index]);

//       // Style animé pour le cercle de sélection
//       const tabIndicatorStyle = useAnimatedStyle(() => {
//         return {
//           transform: [
//             { translateX: interpolate(
//                 activeTab.value,
//                 [0, 1, 2, 3, 4],
//                 [0, width / 5, 2 * width / 5, 3 * width / 5, 4 * width / 5]
//               ) 
//             }
//           ],
//         };
//       });

//       return (
//         <View style={styles.tabBarWrapper}>
//           <LinearGradient
//             colors={[COLORS.primary.end, COLORS.primary.start]}
//             style={styles.tabBarGradient}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 0, y: 1 }}
//           >
//             {/* Indicateur visuel animé pour l'onglet actif */}
//             <Animated.View style={[styles.tabIndicator, tabIndicatorStyle]} />
            
//             <View style={styles.tabBarContainer}>
//               {state.routes.map((route, index) => {
//                 const { options } = descriptors[route.key];
//                 const isFocused = state.index === index;

//                 // Animations pour les icônes de tabs
//                 const tabIconScale = useSharedValue(isFocused ? 1.2 : 1);
                
//                 useEffect(() => {
//                   if (isFocused) {
//                     tabIconScale.value = withTiming(1.2, {
//                       duration: 200,
//                       easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                     });
//                   } else {
//                     tabIconScale.value = withTiming(1, {
//                       duration: 200,
//                       easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                     });
//                   }
//                 }, [isFocused]);

//                 const tabIconStyle = useAnimatedStyle(() => {
//                   return {
//                     transform: [{ scale: tabIconScale.value }],
//                   };
//                 });

//                 const onPress = () => {
//                   const event = navigation.emit({
//                     type: 'tabPress',
//                     target: route.key,
//                     canPreventDefault: true,
//                   });

//                   if (!isFocused && !event.defaultPrevented) {
//                     if (route.name === 'Ajouter') {
//                       actionSheetRef.current?.show();
//                     } else {
//                       navigation.navigate(route.name);
//                     }
//                   }
//                 };

//                 let iconName = "";
//                 if (route.name === "Accueil") {
//                   iconName = isFocused ? "home" : "home-outline";
//                 } else if (route.name === "Conversations") {
//                   iconName = isFocused
//                     ? "chatbubble-ellipses"
//                     : "chatbubble-ellipses-outline";
//                 } else if (route.name === "Social") {
//                   iconName = isFocused ? "people" : "people-outline";
//                 } else if (route.name === "Carte") {
//                   iconName = isFocused ? "map" : "map-outline";
//                 } else if (route.name === "Ajouter") {
//                   iconName = "add-circle";
//                 }

//                 return (
//                   <TouchableOpacity
//                     key={index}
//                     onPress={onPress}
//                     style={styles.tabButton}
//                     activeOpacity={0.7}
//                   >
//                     <Animated.View style={tabIconStyle}>
//                       <Icon
//                         name={iconName}
//                         size={route.name === "Ajouter" ? 44 : (isFocused ? 28 : 22)}
//                         color={route.name === "Ajouter" 
//                           ? COLORS.secondary.main
//                           : (isFocused ? COLORS.text.primary : COLORS.text.secondary)}
//                       />
//                     </Animated.View>
                    
//                     {/* Labels sous les icônes, visibles uniquement pour l'onglet actif */}
//                     {isFocused && route.name !== "Ajouter" && (
//                       <Text style={styles.tabLabel}>
//                         {route.name}
//                       </Text>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           </LinearGradient>
//         </View>
//       );
//     };

//     return (
//       <>
//         <Tab.Navigator
//           screenOptions={({ route }) => ({
//             header: ({ navigation }) => (
//               <CustomHeader
//                 navigation={navigation}
//                 headerTranslateY={headerTranslateY}
//               />
//             ),
//             tabBarShowLabel: false,
//           })}
//           tabBar={(props) => <TabBar {...props} />}
//         >
//           <Tab.Screen name="Accueil">
//             {({ navigation }) => {
//               useEffect(() => {
//                 const unsubscribe = navigation.addListener("focus", () => {
//                   headerTranslateY.value = withTiming(0, { 
//                     duration: 300,
//                     easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                   });
//                 });
//                 return unsubscribe;
//               }, [navigation]);

//               return (
//                 <HomeScreen
//                   navigation={navigation}
//                   handleScroll={handleScroll}
//                 />
//               );
//             }}
//           </Tab.Screen>

//           <Tab.Screen
//             name="Carte"
//             component={MapScreen}
//             listeners={{
//               focus: () => {
//                 headerTranslateY.value = withTiming(0, { 
//                   duration: 300,
//                   easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                 });
//               },
//             }}
//           />

//           <Tab.Screen
//             name="Ajouter"
//             component={EmptyScreen}
//             listeners={{
//               tabPress: (e) => {
//                 e.preventDefault();
//                 actionSheetRef.current?.show();
//               },
//               focus: () => {
//                 headerTranslateY.value = withTiming(0, { 
//                   duration: 300,
//                   easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                 });
//               },
//             }}
//           />

//           <Tab.Screen name="Social">
//             {({ navigation }) => {
//               useEffect(() => {
//                 const unsubscribe = navigation.addListener("focus", () => {
//                   headerTranslateY.value = withTiming(0, { 
//                     duration: 300,
//                     easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                   });
//                 });
//                 return unsubscribe;
//               }, [navigation]);

//               return <SocialScreen handleScroll={handleScroll} />;
//             }}
//           </Tab.Screen>

//            <Tab.Screen
//             name="Conversations"
//             component={ConversationsScreen}
//             initialParams={{ userId }}
//             listeners={{
//               focus: () => {
//                 headerTranslateY.value = withTiming(0, { 
//                   duration: 300,
//                   easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//                 });
//               },
//             }}
//           />
//         </Tab.Navigator>
        
//         {/* ActionSheet redesigné */}
//         <ActionSheet
//           ref={(o) => (actionSheetRef.current = o)}
//           title="Que souhaitez-vous ajouter ?"
//           titleTextStyle={styles.actionSheetTitle}
//           separatorStyle={styles.actionSheetSeparator}
//           buttonUnderlayColor={COLORS.primary.light}
//           options={[
//             "Ajouter un signalement",
//             "Ajouter un événement",
//             "Annuler",
//           ]}
//           cancelButtonIndex={2}
//           destructiveButtonIndex={-1}
//           tintColor={COLORS.primary.start}
//           onPress={(index) => {
//             if (index === 0) {
//               navigation.navigate("CreateReportScreen");
//             } else if (index === 1) {
//               navigation.navigate("CreateEventScreen");
//             }
//           }}
//         />
//       </>
//     );
//   };

//   const [fontsLoaded] = useFonts({
//     Insanibc: require("../frontend/assets/fonts/Insanibc.ttf"),
//   });

//   if (!fontsLoaded) {
//     return (
//       <View style={styles.initialLoadingContainer}>
//         <LinearGradient
//           colors={[COLORS.primary.start, COLORS.primary.end]}
//           style={StyleSheet.absoluteFill}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <ActivityIndicator size="large" color={COLORS.text.primary} />
//         </LinearGradient>
//       </View>
//     );
//   }

//   if (loading) {
//     return (
//       <View style={styles.initialLoadingContainer}>
//         <LinearGradient
//           colors={[COLORS.primary.start, COLORS.primary.end]}
//           style={StyleSheet.absoluteFill}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//         >
//           <ActivityIndicator size="large" color={COLORS.text.primary} />
//           <Text style={styles.loadingAppText}>SmartCities</Text>
//         </LinearGradient>
//       </View>
//     );
//   }

//   return (
//     <AuthProvider handleLogout={handleLogout}>
//       <NotificationProvider>
//         <StatusBar barStyle="light-content" backgroundColor={COLORS.primary.start} translucent />
//         <NavigationContainer>
//           <KeyboardWrapper>
//             <>
//               <Stack.Navigator screenOptions={{ headerShown: false }}>
//                 {!isLoggedIn ? (
//                   <>
//                     <Stack.Screen name="Login">
//                       {(props) => (
//                         <LoginScreen
//                           {...props}
//                           onLogin={() => {
//                             setIsLoggedIn(true);
//                           }}
//                         />
//                       )}
//                     </Stack.Screen>
//                     <Stack.Screen name="Register">
//                       {(props) => (
//                         <RegisterScreen
//                           {...props}
//                           onLogin={() => {
//                             setIsLoggedIn(true);
//                           }}
//                         />
//                       )}
//                     </Stack.Screen>
//                   </>
//                 ) : (
//                   <>
//                     <Stack.Screen name="Main" component={TabNavigator} />
//                     <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
//                     <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
//                     <Stack.Screen name="ReportDetailsScreen" component={ReportDetailsScreen} />
//                     <Stack.Screen name="ReportScreen" component={ReportScreen} />
//                     <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
//                     <Stack.Screen name="EventsScreen" component={EventsScreen} />
//                     <Stack.Screen name="CategoryReportsScreen" component={CategoryReportsScreen} />
//                     <Stack.Screen name="CreateEventScreen" component={CreateEventScreen} />
//                     <Stack.Screen name="CreateReportScreen" component={CreateReportScreen} />
//                     <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
//                     <Stack.Screen name="ChatScreen" component={ChatScreen} />
//                     <Stack.Screen name="RankingScreen" component={RankingScreen} />
//                     <Stack.Screen name="ConversationsScreen" component={ConversationsScreen} />
//                     <Stack.Screen name="SignalementsScreen" component={ReportScreen} />
//                     <Stack.Screen name="CityScreen" component={CityScreen} />
//                     <Stack.Screen name="PostDetailsScreen" component={PostDetailsScreen} />
//                   </>
//                 )}
//               </Stack.Navigator>
//               <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//             </>
//           </KeyboardWrapper>
//         </NavigationContainer>
//       </NotificationProvider>
//     </AuthProvider>
//   );
// }

// const styles = StyleSheet.create({
//   // Container pour le chargement initial
//   initialLoadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingAppText: {
//     color: COLORS.text.primary,
//     fontSize: 32,
//     fontWeight: "bold",
//     fontFamily: "Insanibc",
//     marginTop: 20,
//     letterSpacing: 4,
//   },
  
//   // Header
//   headerContainer: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//   },
//   headerGradient: {
//     borderBottomLeftRadius: SIZES.radius.xl,
//     borderBottomRightRadius: SIZES.radius.xl,
//     overflow: 'hidden',
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingTop: SIZES.header.paddingTop,
//     paddingHorizontal: 16,
//     paddingVertical: 20,
//     height: SIZES.header.height,
//   },
//   headerIconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//   },
//   headerTitleContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     paddingHorizontal: 16,
//     paddingVertical: 6,
//     borderRadius: SIZES.radius.large,
//   },
//   headerTitle: {
//     fontSize: 22,
//     color: COLORS.text.primary,
//     letterSpacing: 4,
//     fontWeight: "bold",
//     fontFamily: "Insanibc",
//     textShadowColor: 'rgba(0, 0, 0, 0.25)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   badge: {
//     position: "absolute",
//     top: -6,
//     right: -6,
//     backgroundColor: COLORS.accent,
//     borderRadius: 10,
//     minWidth: 18,
//     height: 18,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 4,
//     borderWidth: 2,
//     borderColor: COLORS.primary.start,
//   },
//   badgeText: {
//     color: COLORS.text.primary,
//     fontSize: 10,
//     fontWeight: "bold",
//   },
  
//   // TabBar
//   tabBarWrapper: {
//     position: "absolute",
//     bottom: -20,
//     left: 0,
//     right: 0,
//     height: SIZES.tabBar.height + (Platform.OS === 'ios' ? 20 : 0), // Ajustement pour iOS
//     paddingBottom: Platform.OS === 'ios' ? 20 : 0,
//   },
//   tabBarGradient: {
//     flex: 1,
//     flexDirection: 'row',
//     borderTopLeftRadius: SIZES.radius.xl,
//     borderTopRightRadius: SIZES.radius.xl,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 12,
//     elevation: 10,
//   },
//   tabBarContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     height: SIZES.tabBar.height,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   tabButton: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: '100%',
//   },
//   tabLabel: {
//     color: COLORS.text.primary,
//     fontSize: 10,
//     marginTop: 4,
//     fontWeight: '600',
//   },
//   tabIndicator: {
//     position: 'absolute',
//     top: 0,
//     width: width / 5,
//     height: SIZES.tabBar.height,
//     backgroundColor: 'rgba(255, 255, 255, 0.08)',
//     borderRadius: 16,
//   },
  
//   // ActionSheet
//   actionSheetTitle: {
//     color: COLORS.primary.start,
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   actionSheetSeparator: {
//     height: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.1)',
//   },
  
//   // Loaders et erreurs
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: COLORS.background.light,
//   },
//   loaderGradient: {
//     width: width * 0.7,
//     height: 120,
//     borderRadius: SIZES.radius.large,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   loaderText: {
//     color: COLORS.text.primary,
//     marginTop: 16,
//     fontSize: 16,
//     fontWeight: '600',
//     letterSpacing: 1,
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: COLORS.background.light,
//     padding: 20,
//   },
//   errorText: {
//     fontSize: 16,
//     color: COLORS.text.dark,
//     textAlign: 'center',
//     marginTop: 20,
//     marginBottom: 24,
//   },
//   errorButton: {
//     backgroundColor: COLORS.primary.start,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: SIZES.radius.medium,
//   },
//   errorButtonText: {
//     color: COLORS.text.primary,
//     fontWeight: '600',
//   },
// });