import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";

export default function CityScreen({ navigation }) {
  const { unreadCount } = useNotification(); // Récupération du compteur
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#BEE5BF" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadgeNav}>
          <Text style={styles.headerTitleNav}>CLASSEMENT</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
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

      <View>
        <Text style={styles.title}>
            Bienvenue sur la page de ville !
        </Text>
      </View>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 26,
  },
  title:{
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    marginTop: 20,
  }
});
