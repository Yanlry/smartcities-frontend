// Chemin : frontend/navigation/AuthNavigator.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

const Stack = createStackNavigator();

// ✅ CORRECTION : Définis une fonction onLogin ou reçois-la en prop
interface AuthNavigatorProps {
  onLogin?: () => void; // Optionnel : si tu veux la recevoir du parent
}

export default function AuthNavigator({ onLogin }: AuthNavigatorProps = {}) {
  // Fonction par défaut si onLogin n'est pas fournie
  const handleLogin = onLogin || (() => {
    console.log('Utilisateur connecté');
    // Ici, la navigation se fera automatiquement si tu utilises un AuthContext
  });

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ✅ CORRECTION : Utilise une fonction de rendu pour passer onLogin */}
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
      </Stack.Screen>
      
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}