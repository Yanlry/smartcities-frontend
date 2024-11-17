import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';
import MapScreen from './screens/MapScreen'; // Nouveau composant MapScreen
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import AddNewReportScreen from './screens/AddNewReportScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifie le statut de connexion au démarrage
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken'); // Récupère le token
        if (token) {
          console.log("Token trouvé dans AsyncStorage:", token);
          setIsLoggedIn(true);
        } else {
          console.log("Aucun token trouvé, utilisateur non connecté");
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du token:', error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

 const handleLogout = async () => {
  try {
    // Supprime le token et vérifie qu'il est bien supprimé
    await AsyncStorage.removeItem('accessToken');
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.log('Token supprimé avec succès.');
      setIsLoggedIn(false); // Met à jour l'état
    } else {
      console.error('Le token existe encore après suppression :', token);
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion :', error);
    Alert.alert('Erreur', 'Impossible de se déconnecter.');
  }
};


  if (loading) {
    // Affiche un écran de chargement pendant la vérification du statut
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // En-tête personnalisé
  const CustomHeader = ({ navigation }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => console.log("Notifications clicked")}>
        <Icon name="notifications-outline" size={28} color="#333" style={{ marginLeft: 10 }} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>SmartCities</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
        <Icon name="person-outline" size={28} color="#333" style={{ marginRight: 10 }} />
      </TouchableOpacity>
    </View>
  );

  // Tab Navigator
  const TabNavigator = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: ({ navigation }) => <CustomHeader navigation={navigation} />,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = 'home-outline';
          } else if (route.name === 'Evénements') {
            iconName = 'calendar-outline';
          } else if (route.name === 'Signalements') {
            iconName = 'alert-circle-outline';
          } else if (route.name === 'Carte') {
            iconName = 'map-outline';
          } else if (route.name === 'Nouveau signalement') {
            iconName = 'add-outline';
          }

          return (
            <Icon
              name={iconName}
              size={focused ? size + 5 : size} // Augmente légèrement la taille si l'onglet est sélectionné
              color={color}
              style={{ marginBottom: -5 }} // Descend l'icône un peu
            />
          );
        },
        tabBarShowLabel: false, // Pas de labels
        tabBarStyle: {
          height: 70, // Augmente la hauteur de la barre
          paddingBottom: 10, // Ajoute un espace en bas pour mieux positionner les icônes
          paddingTop: 5, // Ajuste l'espace en haut
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Evénements" component={EventsScreen} />
      <Tab.Screen name="Nouveau signalement" component={AddNewReportScreen} />
      <Tab.Screen name="Signalements" component={ReportScreen} />
      <Tab.Screen name="Carte" component={MapScreen} />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer>
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
                  onLogout={handleLogout}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9fb',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
    paddingTop: 50, // Ajoute une marge supérieure pour descendre l'en-tête
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
