// src/components/interactions/ReportDetails/UserInfoSection.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { User } from "../../../types/report.types";

interface UserInfoSectionProps {
  user: User;
  onUserPress: (userId: number) => void;
}

/**
 * Composant affichant les informations d'un utilisateur
 * avec avatar et navigation vers son profil
 */
const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  user,
  onUserPress,
}) => {
  const displayName = user.useFullName
    ? `${user.firstName || ''} ${user.lastName || ''}`
    : user.username;
  
  // Récupérer la première lettre pour l'avatar
  const avatarLetter = user.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : user.username.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Signalé par</Text>
      <TouchableOpacity
        style={styles.userContainer}
        onPress={() => onUserPress(user.id)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>Citoyen contributeur</Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },
  userRole: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
});

export default memo(UserInfoSection);