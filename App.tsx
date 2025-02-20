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
import KeyboardWrapper from "./components/KeyboardWrapper";
import HomeScreen from "./screens/HomeScreen";
import EventsScreen from "./screens/EventsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ReportScreen from "./screens/ReportScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import AddNewReportScreen from "./screens/AddNewReportScreen";
import ReportDetailsScreen from "./screens/ReportDetailsScreen";
import CategoryReportsScreen from "./screens/CategoryReportsScreen";
import EventDetailsScreen from "./screens/EventDetailsScreen";
import AddNewEventScreen from "./screens/AddNewEventScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import Sidebar from "./components/Sidebar";
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
import { useToken } from "./hooks/useToken";
import PostDetailsScreen from "./screens/PostDetailsScreen";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useFonts } from "expo-font";

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

  const CustomHeader = ({ navigation, headerTranslateY }) => {
    const { unreadCount } = useNotification();

    return (
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Icon
              name="menu"
              size={24}
              color="#FFFFFC"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SMARTCities</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <View>
              <Icon name="notifications" size={24} color="#FFFFFC" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
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
          <ActivityIndicator size="large" color="#062C41" />
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
            tabBarIcon: ({ color, size, focused }) => {
              let iconName = "";

              if (route.name === "Accueil") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Conversations") {
                iconName = focused
                  ? "chatbubble-ellipses"
                  : "chatbubble-ellipses-outline";
              } else if (route.name === "Social") {
                iconName = focused ? "people" : "people-outline";
              } else if (route.name === "Carte") {
                iconName = focused ? "map" : "map-outline";
              } else if (route.name === "Ajouter") {
                iconName = "add-circle-outline";
              }

              return (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name={iconName}
                    size={focused ? size + 15 : size}
                    color={focused ? "#FFFFFC" : "#FFFFFC"}
                    style={{
                      fontWeight: focused ? "bold" : "normal",
                    }}
                  />
                </View>
              );
            },
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 70,
              paddingTop: 10,
              paddingHorizontal: 10,
              backgroundColor: "#062C41",
              position: "absolute",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -5 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              borderRadius: 30,
              elevation: 10,
            },
          })}
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
              navigation.navigate("AddNewReportScreen");
            } else if (index === 1) {
              navigation.navigate("AddNewEventScreen");
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
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthProvider handleLogout={handleLogout}>
      <NotificationProvider>
        <StatusBar barStyle="light-content" backgroundColor="#111" />
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
                      component={UserProfileScreen}
                    />
                    <Stack.Screen
                      name="ReportDetailsScreen"
                      component={ReportDetailsScreen}
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
                      name="AddNewEventScreen"
                      component={AddNewEventScreen}
                    />
                    <Stack.Screen
                      name="AddNewReportScreen"
                      component={AddNewReportScreen}
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
    backgroundColor: "#fff",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#062C41",
    paddingTop: 40,
    paddingHorizontal: 20,
    borderRadius: 30,
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
});
