import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ActionSheet from 'react-native-actionsheet';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/Auth/LoginScreen';
import RegisterScreen from './screens/Auth/RegisterScreen';
import AddNewReportScreen from './screens/AddNewReportScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import CategoryReportsScreen from './screens/CategoryReportsScreen';
import AddNewEventScreen from './screens/AddNewEventScreen';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const actionSheetRef = useRef<ActionSheet | null>(null);

  const clearAllTokens = async () => {
    await AsyncStorage.removeItem('authToken');
    console.log('Tous les tokens ont été supprimés.');
  };

  useEffect(() => {
    AsyncStorage.clear().then(() => console.log('AsyncStorage nettoyé.'));
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      await clearAllTokens();
      setLoading(false);
    };
    initializeApp();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('Utilisateur déconnecté.');
  };

  const CustomHeader = ({ navigation }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => console.log('Notifications clicked')}>
        <Icon
          name="notifications-outline"
          size={28}
          color="#333"
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>SmartCities</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
        <Icon
          name="person-outline"
          size={28}
          color="#333"
          style={{ marginRight: 10 }}
        />
      </TouchableOpacity>
    </View>
  );

  const EmptyScreen = () => {
    return null; // Écran vide intentionnellement
  };

  const TabNavigator = ({ navigation }) => (
    <>
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
            } else if (route.name === 'Ajouter') {
              iconName = 'add-circle-outline';
            }

            return (
              <Icon
                name={iconName}
                size={focused ? size + 5 : size}
                color={color}
                style={{ marginBottom: -5 }}
              />
            );
          },
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 70,
            paddingBottom: 10,
            paddingTop: 5,
          },
        })}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Evénements" component={EventsScreen} />
        <Tab.Screen
          name="Ajouter"
          component={EmptyScreen} // Composant dédié pour éviter les problèmes
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Empêche la navigation
              actionSheetRef.current?.show(); // Affiche l'ActionSheet
            },
          }}
        />
        <Tab.Screen name="Signalements" component={ReportScreen} />
        <Tab.Screen name="Carte" component={MapScreen} />
      </Tab.Navigator>
      <ActionSheet
        ref={(o) => (actionSheetRef.current = o)}
        title="Que souhaitez-vous ajouter ?"
        options={['Ajouter un signalement', 'Ajouter un événement', 'Annuler']}
        cancelButtonIndex={2}
        onPress={(index) => {
          if (index === 0) {
            navigation.navigate('AddNewReportScreen');
          } else if (index === 1) {
            navigation.navigate('AddNewEventScreen');
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
            <Stack.Screen name="ReportDetails" component={ReportDetailsScreen} />
            <Stack.Screen name="CategoryReports" component={CategoryReportsScreen} />
            <Stack.Screen name="AddNewEventScreen" component={AddNewEventScreen} />
            <Stack.Screen name="AddNewReportScreen" component={AddNewReportScreen} />
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
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});