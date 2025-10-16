import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/common/Sidebar";
import { Linking } from "react-native";
import MayorInfoCard from "../components/home/MayorInfoSection/MayorInfoCard";
import { useUserProfile } from "../hooks/user/useUserProfile";
import { normalizeCityName } from "../utils/cityUtils"; // ✅ AJOUT

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import styles from "../styles/screens/CityScreen.styles";

type CityScreenNavigationProp = StackNavigationProp<RootStackParamList, "CityScreen">;

export default function CityScreen({ navigation }: { navigation: CityScreenNavigationProp }) {
  const { unreadCount } = useNotification();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Récupérer l'utilisateur connecté
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();

  const dummyFn = () => {};

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handlePressPhoneNumber = () => {
    Linking.openURL("tel:0320440251");
  };

  // ✅ MODIFICATION : Normaliser le nom de la ville
  // AVANT : const userCity = user?.nomCommune || "VILLE_INCONNUE";
  // APRÈS : On normalise pour avoir toujours le même format
  const userCity = normalizeCityName(user?.nomCommune);

  // 📝 Affichage dans la console pour vérifier
  console.log("🏙️ Ville de l'utilisateur (normalisée):", userCity);

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={24}
            color="#FFFFFC"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        <View style={styles.typeBadgeNav}>
          <Text style={styles.headerTitleNav}>Ma ville</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={24}
              color={unreadCount > 0 ? "#FFFFFC" : "#FFFFFC"}
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

      <ScrollView>
        {/* ✅ On passe la ville normalisée au composant */}
        <MayorInfoCard 
          handlePressPhoneNumber={handlePressPhoneNumber}
          cityName={userCity}
        />
      </ScrollView>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
}
