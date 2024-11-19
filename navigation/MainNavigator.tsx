import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="Profile" 
        component={(props) => <ProfileScreen {...props} onLogout={() => { /* handle logout */ }} />} 
      />
    </Stack.Navigator>
  );
}
