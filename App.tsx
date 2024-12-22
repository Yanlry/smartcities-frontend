import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actionsheet";
import KeyboardWrapper from "./components/KeyboardWrapper";
import { LinearGradient } from "expo-linear-gradient";
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
import { NotificationProvider, useNotification } from "./context/NotificationContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const actionSheetRef = useRef<ActionSheet | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const clearAllTokens = async () => {
    await AsyncStorage.removeItem("authToken");
  };

  useEffect(() => {
    const initializeApp = async () => {
      await clearAllTokens();
      setLoading(false);
    };
    initializeApp();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log("Utilisateur déconnecté.");
  };

  const CustomHeader = ({ navigation }) => {
    const { unreadCount } = useNotification(); // Récupère le compteur du contexte

    return (
      <View style={{ backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Icon
              name="menu"
              size={28}
              color="#BEE5BF"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SMARTCITIES</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <View>
              <Icon
                name="notifications"
                size={28}
                color={unreadCount > 0 ? "#BEE5BF" : "#BEE5BF"}
                style={{ marginRight: 10 }}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyScreen = () => {
    return null; // Écran vide intentionnellement
  };

  const TabNavigator = ({ navigation }) => (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: ({ navigation }) => <CustomHeader navigation={navigation} />,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = "";

            if (route.name === "Accueil") {
              iconName = "home-outline";
            } else if (route.name === "Evénements") {
              iconName = "calendar-outline";
            } else if (route.name === "Signalements") {
              iconName = "alert-circle-outline";
            } else if (route.name === "Carte") {
              iconName = "map-outline";
            } else if (route.name === "Ajouter") {
              iconName = "add-circle-outline";
            }

            return (
              <View
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: focused ? "#BEE5BF" : "transparent",
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon
                  name={iconName}
                  size={focused ? size + 5 : size}
                  color={focused ? "#29524A" : "#fff"}
                />
              </View>
            );
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 80,
            paddingTop: 20,
            paddingHorizontal: 20,
            backgroundColor: "#29524A",
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
            position: "absolute",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -5 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 10,
          },
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Evénements" component={EventsScreen} />
        <Tab.Screen
          name="Ajouter"
          component={EmptyScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              actionSheetRef.current?.show();
            },
          }}
        />
        <Tab.Screen name="Signalements" component={ReportScreen} />
        <Tab.Screen name="Carte" component={MapScreen} />
      </Tab.Navigator>
      <ActionSheet
        ref={(o) => (actionSheetRef.current = o)}
        title="Que souhaitez-vous ajouter ?"
        options={["Ajouter un signalement", "Ajouter un événement", "Annuler"]}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
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
                  <Stack.Screen name="ProfileScreen">
                    {(props) => (
                      <ProfileScreen {...props} onLogout={handleLogout} />
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="UserProfileScreen"
                    component={UserProfileScreen}
                  />
                  <Stack.Screen
                    name="ReportDetails"
                    component={ReportDetailsScreen}
                  />
                  <Stack.Screen
                    name="EventDetailsScreen"
                    component={EventDetailsScreen}
                  />
                  <Stack.Screen
                    name="CategoryReports"
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
                </>
              )}
            </Stack.Navigator>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          </>
        </KeyboardWrapper>
      </NavigationContainer>
    </NotificationProvider>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Couleur dorée
    letterSpacing: 2, // Espacement pour un effet moderne
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
