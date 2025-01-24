import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { NotificationProvider } from '../context/NotificationContext'; 

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <NotificationProvider>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="Profile" 
          component={(props) => (
            <ProfileScreen 
              {...props} 
              onLogout={() => { /* handle logout */ }} 
            />
          )} 
        />
      </Stack.Navigator>
    </NotificationProvider>
  );
}
