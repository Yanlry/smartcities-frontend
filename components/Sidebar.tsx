import React, { useState, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Installez : expo install @expo/vector-icons
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [sidebarAnimation] = useState(new Animated.Value(-300));
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const handleNavigation = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
    toggleSidebar();
  };

  return (
    <>
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnimation }] }]}>
        <Text style={styles.sidebarTitle}>M E N U</Text>

        {/* Section principale */}
        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleNavigation('Main')}>
        <MaterialCommunityIcons name="view-dashboard-outline" size={24} color="#BEE5BF" />
          <Text style={styles.sidebarText}>Tableau de bord</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleNavigation('RankingScreen')}>
            <Ionicons name="trophy-outline" size={24} color="#BEE5BF" />
            <Text style={styles.sidebarText}>Classement</Text>
          </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleNavigation('ProfileScreen')}>
        <MaterialCommunityIcons name="account-circle-outline" size={24} color="#BEE5BF" />
          <Text style={styles.sidebarText}>Paramétres du profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleNavigation('ReportScreen')}>
        <MaterialCommunityIcons name="alert-octagon-outline" size={24} color="#BEE5BF" />
          <Text style={styles.sidebarText}>Tout les signalements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => handleNavigation('EventsScreen')}>
        <MaterialCommunityIcons name="calendar-star" size={24} color="#BEE5BF" />
          <Text style={styles.sidebarText}>Tout les événements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} >
            <Ionicons name="earth-outline" size={24} color="#BEE5BF" />
            <Text style={styles.sidebarText}>Informations Mairie</Text>
          </TouchableOpacity>

        {/* Section supplémentaire */}
        <View style={styles.footerSection}>
        <TouchableOpacity style={styles.sidebarItem} >
            <Ionicons name="settings-outline" size={24} color="#BEE5BF" />
            <Text style={styles.sidebarText}>Préférences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} >
            <Ionicons name="help-circle-outline" size={24} color="#BEE5BF" />
            <Text style={styles.sidebarText}>F.A.Q</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} >
            <Ionicons name="document-text-outline" size={24} color="#BEE5BF" />
            <Text style={styles.sidebarText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#BEE5BF" />
            <Text style={styles.sidebarText}>Confidentialité</Text>
          </TouchableOpacity>
          <Text style={styles.version}>v1.07.23</Text>
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity style={styles.loginButton} onPress={() => handleNavigation('Login')}>
          <Text style={styles.loginText}>CONNEXION</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
      {isOpen && <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} />}
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 300,
    height: Dimensions.get('window').height,
    backgroundColor: '#29524A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  sidebarTitle: {
    color: '#BEE5BF',
    fontSize: 28,
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 15,
    textAlign : 'center',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  sidebarText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 15,
  },
  footerSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#fff',
    paddingTop: 10,
  },
  version: {
    color: '#888',
    fontSize: 12,
    marginTop: 10,
  },
  loginButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#BEE5BF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginText: {
    color: '#111',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
});

export default Sidebar;