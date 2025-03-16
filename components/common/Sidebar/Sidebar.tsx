import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../context/AuthContext';
import { SidebarProps } from './types';
import SidebarItem from './SidebarItem';

const Sidebar: React.FC<SidebarProps> = memo(({ isOpen, toggleSidebar }) => {
  const [sidebarAnimation] = useState(new Animated.Value(-300));
  const navigation = useNavigation();
  const { handleLogout } = useAuth();

  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, sidebarAnimation]);

  const handleNavigation = useCallback((screen: string) => {
    navigation.navigate(screen as never);
    toggleSidebar();
  }, [navigation, toggleSidebar]);

  const handleLogoutWithSidebarClose = useCallback(() => {
    toggleSidebar();
    setTimeout(() => {
      handleLogout();
    }, 300);
  }, [toggleSidebar, handleLogout]);

  const mainMenuItems = [
    {
      icon: <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#FFFFFC" />,
      label: "Tableau de bord",
      screen: "Main"
    },
    {
      icon: <Ionicons name="earth-outline" size={24} color="#FFFFFC" />,
      label: "Tout sur ma ville",
      screen: "CityScreen"
    },
    {
      icon: <Ionicons name="trophy-outline" size={24} color="#FFFFFC" />,
      label: "Classement général",
      screen: "RankingScreen"
    },
    {
      icon: <MaterialCommunityIcons name="account-circle-outline" size={24} color="#FFFFFC" />,
      label: "Informations personnelles",
      screen: "ProfileScreen"
    },
    {
      icon: <MaterialCommunityIcons name="alert-octagon-outline" size={24} color="#FFFFFC" />,
      label: "Mes signalements",
      screen: "ReportScreen"
    },
    {
      icon: <MaterialCommunityIcons name="calendar-star" size={24} color="#FFFFFC" />,
      label: "Mes événements",
      screen: "EventsScreen"
    }
  ];

  const secondaryMenuItems = [
    {
      icon: <Ionicons name="settings-outline" size={24} color="#FFFFFC" />,
      label: "Préférences",
      screen: "PreferencesScreen"
    },
    {
      icon: <Ionicons name="help-circle-outline" size={24} color="#FFFFFC" />,
      label: "F.A.Q",
      screen: "FAQScreen"
    },
    {
      icon: <Ionicons name="document-text-outline" size={24} color="#FFFFFC" />,
      label: "Conditions d'utilisation",
      screen: "TermsScreen"
    },
    {
      icon: <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFC" />,
      label: "Confidentialité",
      screen: "PrivacyScreen"
    }
  ];

  return (
    <>
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarAnimation }] },
        ]}
      >
        <Text style={styles.sidebarTitle}>M E N U</Text>

        {/* Section principale */}
        {mainMenuItems.map((item, index) => (
          <SidebarItem
            key={`main-${index}`}
            icon={item.icon}
            label={item.label}
            onPress={() => handleNavigation(item.screen)}
          />
        ))}

        {/* Section supplémentaire */}
        <View style={styles.footerSection}>
          {secondaryMenuItems.map((item, index) => (
            <SidebarItem
              key={`secondary-${index}`}
              icon={item.icon}
              label={item.label}
              onPress={() => handleNavigation(item.screen)}
            />
          ))}
          <Text style={styles.version}>v1.07.23</Text>
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogoutWithSidebarClose}
        >
          <Text style={styles.loginText}>DÉCONNEXION</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay pour fermer le sidebar en cliquant à l'extérieur */}
      {isOpen && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
    </>
  );
});

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: Dimensions.get("window").height,
    backgroundColor: "#062C41",
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  sidebarTitle: {
    color: "#FFFFFC",
    fontSize: 28,
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 15,
    textAlign: "center",
  },
  footerSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#fff",
    paddingTop: 10,
  },
  version: {
    color: "#888",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  loginButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#FFFFFC",
    borderRadius: 60,
    paddingVertical: 15,
    alignItems: "center",
  },
  loginText: {
    color: "#111",
    fontSize: 18,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
});

export default Sidebar;