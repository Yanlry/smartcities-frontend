import React, { useState, useEffect } from "react";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; // Installez : expo install @expo/vector-icons
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { useAuth } from "../context/AuthContext"; // Importez le Contexte

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [sidebarAnimation] = useState(new Animated.Value(-300));
  const navigation = useNavigation<NavigationProp>();
  const { handleLogout } = useAuth(); // Récupérez handleLogout depuis le Contexte

  useEffect(() => {
    console.log("Sidebar isOpen changed:", isOpen);
    Animated.timing(sidebarAnimation, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const handleNavigation = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any); // Cast explicite si nécessaire
    toggleSidebar();
  };

  const handleLogoutWithSidebarClose = () => {
    toggleSidebar(); // Fermez la Sidebar
    setTimeout(() => {
      handleLogout(); // Déconnectez l'utilisateur
    }, 300); // Attendez la fin de l'animation
  };

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
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => handleNavigation("Main")}
        >
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={24}
            color="#F7F2DE"
          />
          <Text style={styles.sidebarText}>Tableau de bord</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => handleNavigation("CityScreen")}
        >
          <Ionicons name="earth-outline" size={24} color="#F7F2DE" />
          <Text style={styles.sidebarText}>Tout sur ma ville</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => handleNavigation("RankingScreen")}
        >
          <Ionicons name="trophy-outline" size={24} color="#F7F2DE" />
          <Text style={styles.sidebarText}>Classement général</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => handleNavigation("ProfileScreen")}
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={24}
            color="#F7F2DE"
          />
          <Text style={styles.sidebarText}>Informations personnelles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => handleNavigation("ReportScreen")}
        >
          <MaterialCommunityIcons
            name="alert-octagon-outline"
            size={24}
            color="#F7F2DE"
          />
          <Text style={styles.sidebarText}>Mes signalements</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => handleNavigation("EventsScreen")}
        >
          <MaterialCommunityIcons
            name="calendar-star"
            size={24}
            color="#F7F2DE"
          />
          <Text style={styles.sidebarText}>Mes événements</Text>
        </TouchableOpacity>

        {/* Section supplémentaire */}
        <View style={styles.footerSection}>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="settings-outline" size={24} color="#F7F2DE" />
            <Text style={styles.sidebarText}>Préférences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="help-circle-outline" size={24} color="#F7F2DE" />
            <Text style={styles.sidebarText}>F.A.Q</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons name="document-text-outline" size={24} color="#F7F2DE" />
            <Text style={styles.sidebarText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#F7F2DE"
            />
            <Text style={styles.sidebarText}>Confidentialité</Text>
          </TouchableOpacity>
          <Text style={styles.version}>v1.07.23</Text>
        </View>

        {/* Bouton de connexion */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogoutWithSidebarClose}
        >
          <Text style={styles.loginText}>DÉCONNEXION</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleSidebar} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 300,
    height: Dimensions.get("window").height,
    backgroundColor: "#2A2B2A",
    paddingVertical: 20,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  sidebarTitle: {
    color: "#F7F2DE",
    fontSize: 28,
    marginTop: 30,
    marginBottom: 20,
    marginLeft: 15,
    textAlign: "center",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  sidebarText: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 15,
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
  },
  loginButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#F7F2DE",
    borderRadius: 10,
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
