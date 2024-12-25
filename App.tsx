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

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const actionSheetRef = useRef<ActionSheet | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      await clearAllTokens();
      setLoading(false);
    };
    initializeApp();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken"); // Supprimez les données de session
      setIsLoggedIn(false); // Réinitialise l'état de connexion
      console.log("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
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

  const TabNavigator = ({ navigation }) => {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

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
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: ({ navigation }) => <CustomHeader navigation={navigation} />,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName = "";

            if (route.name === "Accueil") {
              iconName = "home-outline";
            } else if (route.name === "Conversations") {
              iconName = "chatbubble-ellipses-outline";
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
        <Tab.Screen
          name="Conversations"
          component={ConversationsScreen}
          initialParams={{ userId }} // Passer userId ici
        />
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
  header: {
    position: "absolute", // Position absolue pour superposer au contenu
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10, // Assurez que le header est au-dessus de la carte
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
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

// import React, { useState, useEffect, useRef } from "react";
// import {
//   StyleSheet,
//   ActivityIndicator,
//   View,
//   Text,
//   TouchableOpacity,
// } from "react-native";
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import { createStackNavigator } from "@react-navigation/stack";
// import Icon from "react-native-vector-icons/Ionicons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import ActionSheet from "react-native-actionsheet";
// import KeyboardWrapper from "./components/KeyboardWrapper";
// import HomeScreen from "./screens/HomeScreen";
// import EventsScreen from "./screens/EventsScreen";
// import ProfileScreen from "./screens/ProfileScreen";
// import ReportScreen from "./screens/ReportScreen";
// import MapScreen from "./screens/MapScreen";
// import LoginScreen from "./screens/Auth/LoginScreen";
// import RegisterScreen from "./screens/Auth/RegisterScreen";
// import AddNewReportScreen from "./screens/AddNewReportScreen";
// import ReportDetailsScreen from "./screens/ReportDetailsScreen";
// import CategoryReportsScreen from "./screens/CategoryReportsScreen";
// import EventDetailsScreen from "./screens/EventDetailsScreen";
// import AddNewEventScreen from "./screens/AddNewEventScreen";
// import UserProfileScreen from "./screens/UserProfileScreen";
// import Sidebar from "./components/Sidebar";
// import { StatusBar } from "react-native";
// import NotificationsScreen from "./screens/NotificationsScreen";
// import { NotificationProvider, useNotification } from "./context/NotificationContext";
// import ChatScreen from "./screens/ChatScreen";
// import RankingScreen from "./screens/RankingScreen";
// import ConversationsScreen from "./screens/ConversationsScreen";

// const Tab = createBottomTabNavigator();
// const Stack = createStackNavigator();

// export default function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const actionSheetRef = useRef<ActionSheet | null>(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   const clearAllTokens = async () => {
//     await AsyncStorage.removeItem("authToken");
//   };

//   useEffect(() => {
//     const initializeApp = async () => {
//       await clearAllTokens();
//       setLoading(false);
//     };
//     initializeApp();
//   }, []);

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     console.log("Utilisateur déconnecté.");
//   };

//   const CustomHeader = ({ navigation }) => {
//     const { unreadCount } = useNotification(); // Récupère le compteur du contexte

//     return (
//       <View style={{ backgroundColor: "#fff" }}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={toggleSidebar}>
//             <Icon
//               name="menu"
//               size={28}
//               color="#BEE5BF"
//               style={{ marginLeft: 10 }}
//             />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>SMARTCITIES</Text>
//           <TouchableOpacity
//             onPress={() => navigation.navigate("NotificationsScreen")}
//           >
//             <View>
//               <Icon
//                 name="notifications"
//                 size={28}
//                 color={unreadCount > 0 ? "#BEE5BF" : "#BEE5BF"}
//                 style={{ marginRight: 10 }}
//               />
//               {unreadCount > 0 && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>{unreadCount}</Text>
//                 </View>
//               )}
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const EmptyScreen = () => {
//     return null; // Écran vide intentionnellement
//   };

//   const TabNavigator = ({ navigation }) => (
//     <>
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           header: ({ navigation }) => <CustomHeader navigation={navigation} />,
//           tabBarIcon: ({ color, size, focused }) => {
//             let iconName = "";

//             if (route.name === "Accueil") {
//               iconName = "home-outline";
//             } else if (route.name === "Conversations") {
//               iconName = "chatbubble-ellipses-outline";
//             } else if (route.name === "Signalements") {
//               iconName = "alert-circle-outline";
//             } else if (route.name === "Carte") {
//               iconName = "map-outline";
//             } else if (route.name === "Ajouter") {
//               iconName = "add-circle-outline";
//             }

//             return (
//               <View
//                 style={{
//                   width: 50,
//                   height: 50,
//                   backgroundColor: focused ? "#BEE5BF" : "transparent",
//                   borderRadius: 25,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Icon
//                   name={iconName}
//                   size={focused ? size + 5 : size}
//                   color={focused ? "#29524A" : "#fff"}
//                 />
//               </View>
//             );
//           },
//           tabBarShowLabel: false,
//           tabBarStyle: {
//             height: 80,
//             paddingTop: 20,
//             paddingHorizontal: 20,
//             backgroundColor: "#29524A",
//             borderTopLeftRadius: 50,
//             borderTopRightRadius: 50,
//             position: "absolute",
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: -5 },
//             shadowOpacity: 0.1,
//             shadowRadius: 10,
//             elevation: 10,
//           },
//         })}
//       >
//         <Tab.Screen name="Accueil" component={HomeScreen} />
//         <Tab.Screen name="Conversations" component={ConversationsScreen} />
//         <Tab.Screen
//           name="Ajouter"
//           component={EmptyScreen}
//           listeners={{
//             tabPress: (e) => {
//               e.preventDefault();
//               actionSheetRef.current?.show();
//             },
//           }}
//         />
//         <Tab.Screen name="Signalements" component={ReportScreen} />
//         <Tab.Screen name="Carte" component={MapScreen} />
//       </Tab.Navigator>
//       <ActionSheet
//         ref={(o) => (actionSheetRef.current = o)}
//         title="Que souhaitez-vous ajouter ?"
//         options={["Ajouter un signalement", "Ajouter un événement", "Annuler"]}
//         cancelButtonIndex={2}
//         onPress={(index) => {
//           if (index === 0) {
//             navigation.navigate("AddNewReportScreen");
//           } else if (index === 1) {
//             navigation.navigate("AddNewEventScreen");
//           }
//         }}
//       />
//     </>
//   );

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <NotificationProvider>
//       <StatusBar barStyle="light-content" backgroundColor="#111" />
//       <NavigationContainer>
//         <KeyboardWrapper>
//           <>
//             <Stack.Navigator screenOptions={{ headerShown: false }}>
//               {!isLoggedIn ? (
//                 <>
//                   <Stack.Screen name="Login">
//                     {(props) => (
//                       <LoginScreen
//                         {...props}
//                         onLogin={() => {
//                           setIsLoggedIn(true);
//                         }}
//                       />
//                     )}
//                   </Stack.Screen>
//                   <Stack.Screen name="Register">
//                     {(props) => (
//                       <RegisterScreen
//                         {...props}
//                         onLogin={() => {
//                           setIsLoggedIn(true);
//                         }}
//                       />
//                     )}
//                   </Stack.Screen>
//                 </>
//               ) : (
//                 <>
//                   <Stack.Screen name="Main" component={TabNavigator} />
//                   <Stack.Screen name="ProfileScreen">
//                     {(props) => (
//                       <ProfileScreen {...props} onLogout={handleLogout} />
//                     )}
//                   </Stack.Screen>
//                   <Stack.Screen
//                     name="UserProfileScreen"
//                     component={UserProfileScreen}
//                   />
//                   <Stack.Screen
//                     name="ReportDetailsScreen"
//                     component={ReportDetailsScreen}
//                   />
//                   <Stack.Screen
//                     name="ReportScreen"
//                     component={ReportScreen}
//                   />
//                   <Stack.Screen
//                     name="EventDetailsScreen"
//                     component={EventDetailsScreen}
//                   />
//                   <Stack.Screen
//                   name="EventsScreen"
//                   component={EventsScreen}
//                 />
//                   <Stack.Screen
//                     name="CategoryReportsScreen"
//                     component={CategoryReportsScreen}
//                   />
//                   <Stack.Screen
//                     name="AddNewEventScreen"
//                     component={AddNewEventScreen}
//                   />
//                   <Stack.Screen
//                     name="AddNewReportScreen"
//                     component={AddNewReportScreen}
//                   />
//                   <Stack.Screen
//                     name="NotificationsScreen"
//                     component={NotificationsScreen}
//                   />
//                   <Stack.Screen
//                     name="ChatScreen"
//                     component={ChatScreen}
//                   />
//                   <Stack.Screen
//                     name="RankingScreen"
//                     component={RankingScreen}
//                   />
//                   <Stack.Screen
//                     name="ConversationsScreen"
//                     component={ConversationsScreen}
//                   />
//                 </>
//               )}
//             </Stack.Navigator>
//             <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//           </>
//         </KeyboardWrapper>
//       </NavigationContainer>
//     </NotificationProvider>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: {
//     position: "absolute", // Position absolue pour superposer au contenu
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 10, // Assurez que le header est au-dessus de la carte
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#29524A", // Couleur sombre
//     borderBottomLeftRadius: 50, // Arrondi en bas à gauche
//     borderBottomRightRadius: 50, // Arrondi en bas à droite
//     paddingTop: 50, // Marge en haut
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     height: 100, // Hauteur ajustée
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff", // Couleur dorée
//     letterSpacing: 2, // Espacement pour un effet moderne
//   },
//   badge: {
//     position: "absolute",
//     top: -5,
//     right: -5,
//     backgroundColor: "red",
//     borderRadius: 10,
//     width: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   badgeText: {
//     color: "white",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
// });
