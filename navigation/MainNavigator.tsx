// Chemin : frontend/navigation/MainNavigator.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { NotificationProvider } from '../context/NotificationContext';

const Stack = createStackNavigator();

interface MainNavigatorProps {
  onLogout?: () => void; // Optionnel : pour gérer la déconnexion
}

export default function MainNavigator({ onLogout }: MainNavigatorProps = {}) {
  // ✅ CORRECTION : Fonction handleScroll pour HomeScreen
  const handleScroll = (event: any) => {
    // Tu peux laisser vide ou ajouter ta logique de scroll
    // console.log('Scroll position:', event.nativeEvent.contentOffset.y);
  };

  // Fonction par défaut pour logout
  const handleLogout = onLogout || (() => {
    console.log('Déconnexion');
    // La logique de déconnexion sera gérée par ton AuthContext
  });

  return (
    <NotificationProvider>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        {/* ✅ CORRECTION : Utilise une fonction de rendu pour passer handleScroll */}
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} handleScroll={handleScroll} />}
        </Stack.Screen>
        
        {/* ✅ CORRECTION : Ta solution pour ProfileScreen est correcte */}
        <Stack.Screen name="Profile">
          {(props) => (
            <ProfileScreen 
              {...props} 
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NotificationProvider>
  );
}