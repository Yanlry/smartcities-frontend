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
import { useUserProfile } from "../hooks/user/useUserProfile"; // Ajoutez cette ligne

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation"; // Ensure this file exists and defines your navigation types

type CityScreenNavigationProp = StackNavigationProp<RootStackParamList, "CityScreen">;

export default function CityScreen({ navigation }: { navigation: CityScreenNavigationProp }) {
  const { unreadCount } = useNotification();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, displayName, voteSummary, updateProfileImage } =
    useUserProfile();

  const dummyFn = () => {};

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handlePressPhoneNumber = () => {
    Linking.openURL("tel:0320440251");
  };

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

        {/* Titre de la page */}
        <View style={styles.typeBadgeNav}>
          <Text style={styles.headerTitleNav}>MA ville</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
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
        <MayorInfoCard handlePressPhoneNumber={handlePressPhoneNumber} />
      </ScrollView>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={updateProfileImage}
      />
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
    backgroundColor: "#062C41",
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: "#FFFFFC",
    letterSpacing: 2,
    fontWeight: "bold",
    fontFamily: "Insanibc",
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -7,
    right: 2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    justifyContent: "center",
    marginTop: 20,
  },
});
