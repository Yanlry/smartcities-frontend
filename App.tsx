import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Dimensions
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
import { NotificationProvider,useNotification} from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import ChatScreen from "./screens/ChatScreen";
import RankingScreen from "./screens/RankingScreen";
import ConversationsScreen from "./screens/ConversationsScreen";
import SocialScreen from "./screens/SocialScreen";
import CityScreen from "./screens/CityScreen";
import { useToken } from "./hooks/useToken";
import PostDetailsScreen from "./screens/PostDetailsScreen";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { getToken } = useToken();
  const previousOffset = useRef(0); // Dernier offset du scroll
  const threshold = 10; 
  const headerTranslateY = useSharedValue(0);

const handleScroll = (event) => {
  const currentOffset = event.nativeEvent.contentOffset.y;

  if (currentOffset - previousOffset.current > threshold) {
    // Scroll vers le bas (cacher le header)
    headerTranslateY.value = withTiming(-100, { duration: 200 });
  } else if (previousOffset.current - currentOffset > threshold) {
    // Scroll vers le haut (afficher le header)
    headerTranslateY.value = withTiming(0, { duration: 200 });
  }

  // Met à jour l'offset précédent
  previousOffset.current = currentOffset;
};

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => {
      console.log("Sidebar state before toggle:", prevState);
      return !prevState;
    });
  };

  const clearAllTokens = async () => {
    await AsyncStorage.removeItem("authToken");
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = await getToken(); // Vérifie s'il existe un token valide
        if (token) {
          setIsLoggedIn(true); // L'utilisateur est déjà connecté
          console.log("Session restaurée, utilisateur connecté.");
        } else {
          console.log("Aucun token valide trouvé, utilisateur non connecté.");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'état de connexion :", error);
      } finally {
        setLoading(false); // Fin de la vérification
      }
    };

    initializeApp();
  }, []);
  
  const handleLogout = async () => {
    try {
      await clearAllTokens();
      await AsyncStorage.removeItem("userToken"); // Supprimez les données de session
      setIsLoggedIn(false); // Réinitialise l'état de connexion
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  const CustomHeader = ({ navigation, headerTranslateY }) => {
    const { unreadCount } = useNotification(); // Compteur des notifications non lues
  
    return (
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] }, // Appliquez l'animation
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Icon
              name="menu"
              size={28}
              color="#CBCBCB"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SMARTCITIES</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("NotificationsScreen")}
          >
            <View>
              <Icon name="notifications" size={28} color="#CBCBCB" />
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
    return null; // Écran vide intentionnellement
  };
  const { width } = Dimensions.get("window");
  const TabNavigator = ({ navigation }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const actionSheetRef = useRef<ActionSheet | null>(null); // Référence pour l'ActionSheet
    const tabWidth = width / 5; // Nombre d'onglets (ici 5)
    const activeTabPosition = useSharedValue(0);
    // Fonction pour récupérer l'ID utilisateur
    const fetchUserId = async () => {
      try {
        console.log("Début de la récupération de l'ID utilisateur...");
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          throw new Error("Aucun token trouvé");
        }
        // Décoder le token pour obtenir l'ID utilisateur (exemple avec JWT)
        const payload = JSON.parse(atob(token.split(".")[1])); // Décodage de la partie payload
        console.log("Payload décodé :", payload);
        return payload.userId;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'ID utilisateur :",
          error
        );
        return null;
      }
    };
  
    // Récupérer l'ID utilisateur lors du chargement
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
          <ActivityIndicator size="large" color="#0000ff" />
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
  
    console.log("UserId dans TabNavigator :", userId);
  
    return (
      <>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            header: ({ navigation }) => (
              <CustomHeader navigation={navigation} headerTranslateY={headerTranslateY} />
            ),
            
            tabBarIcon: ({ color, size, focused }) => {
              let iconName = "";
  
              if (route.name === "Accueil") {
                iconName = "home-outline";
              } else if (route.name === "Conversations") {
                iconName = "chatbubble-ellipses-outline";
              } else if (route.name === "Social") {
                iconName = "people-outline";
              } else if (route.name === "Carte") {
                iconName = "map-outline";
              } else if (route.name === "Ajouter") {
                iconName = "add-circle-outline";
              }
  
              return (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: focused ? "#CBCBCB" : "transparent",
                    borderRadius: 25,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    name={iconName}
                    size={focused ? size + 5 : size}
                    color={focused ? "#535353" : "#fff"}
                  />
                </View>
              );
            },
            tabBarShowLabel: false,
            tabBarStyle: {
              height: 70,
              paddingTop: 10,
              paddingHorizontal: 10,
              backgroundColor: "#535353",
              position: "absolute",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -5 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
              borderRadius: 20,
            },
          })}
        >
        <Tab.Screen name="Accueil">
  {(props) => <HomeScreen {...props} handleScroll={handleScroll} />}
</Tab.Screen>
          <Tab.Screen
            name="Conversations"
            component={ConversationsScreen}
            initialParams={{ userId }} // Passer userId ici
          />
          <Tab.Screen
            name="Ajouter"
            component={EmptyScreen} // Utilisation d'un écran vide comme placeholder
            listeners={{
              tabPress: (e) => {
                e.preventDefault(); // Empêche la navigation
                actionSheetRef.current?.show(); // Affiche l'ActionSheet
              },
            }}
          />
          <Tab.Screen name="Social">
  {(props) => <SocialScreen {...props} handleScroll={handleScroll} />}
</Tab.Screen>
          <Tab.Screen name="Carte" component={MapScreen} />
        </Tab.Navigator>
  
        {/* ActionSheet pour ajouter un signalement ou un événement */}
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
  };

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
                  <Stack.Screen name="ProfileScreen">
                    {(props) => (
                      <ProfileScreen
                        {...props}
                        onLogout={handleLogout} // Passez handleLogout ici
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="UserProfileScreen"
                    component={UserProfileScreen}
                  />
                  <Stack.Screen
                    name="ReportDetailsScreen"
                    component={ReportDetailsScreen}
                  />
                  <Stack.Screen name="ReportScreen" component={ReportScreen} />
                  <Stack.Screen
                    name="EventDetailsScreen"
                    component={EventDetailsScreen}
                  />
                  <Stack.Screen name="EventsScreen" component={EventsScreen} />
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
                  <Stack.Screen
                     name="CityScreen" 
                     component={CityScreen}
                  />
                  <Stack.Screen
                     name="PostDetailsScreen" 
                     component={PostDetailsScreen}
                  />
                </>
              )}
            </Stack.Navigator>
            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
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
    position: "absolute", // Position absolue pour superposer au contenu
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Assurez que le header est au-dessus de la carte
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#535353", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingTop: 50, // Marge en haut
    paddingVertical: 20,
    paddingHorizontal: 20,
    height: 100, // Hauteur ajustée
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

