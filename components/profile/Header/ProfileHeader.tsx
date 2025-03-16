// components/profile/Header/ProfileHeader.tsx

import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import profileStyles  from "../../../screens/styles/ProfileScreen.styles";
import { ProfileHeaderProps } from "./types";

/**
 * Composant d'en-tête pour l'écran de profil utilisateur
 * Affiche le titre et les boutons pour le menu latéral et le signalement
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = memo(({ 
  toggleSidebar, 
  openReportModal 
}) => (
  <View style={profileStyles.header}>
    <TouchableOpacity onPress={toggleSidebar}>
      <Icon name="menu" size={24} color="#FFFFFC" style={{ marginLeft: 10 }} />
    </TouchableOpacity>
    <View style={profileStyles.typeBadge}>
      <Text style={profileStyles.headerTitle}>PROFIL</Text>
    </View>
    <TouchableOpacity onPress={openReportModal}>
      <Icon name="error" size={24} color="#FFFFFC" style={{ marginRight: 10 }} />
    </TouchableOpacity>
  </View>
));

ProfileHeader.displayName = 'ProfileHeader';