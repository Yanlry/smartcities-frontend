// Chemin: components/profile/Header/ProfileHeader.tsx

import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import profileStyles from "../../../styles/screens/ProfileScreen.styles";
import { ProfileHeaderProps } from '../../../types/features/profile/tabs.types';

/**
 * Composant d'en-tête pour l'écran de profil utilisateur
 * Affiche le titre et les boutons pour le menu latéral et le signalement
 * 
 * @param toggleSidebar - Fonction pour ouvrir/fermer le menu latéral
 * @param openReportModal - Fonction pour ouvrir la modal de signalement
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = memo(({ 
  toggleSidebar, 
  openReportModal 
}) => (
  <View style={profileStyles.header}>
    <TouchableOpacity 
      onPress={toggleSidebar}
      activeOpacity={0.7}
      accessibilityLabel="Ouvrir le menu"
      accessibilityRole="button"
    >
      <MaterialIcons 
        name="menu" 
        size={24} 
        color="#FFFFFC" 
        style={{ marginLeft: 10 }} 
      />
    </TouchableOpacity>
    
    <View style={profileStyles.typeBadge}>
      <Text style={profileStyles.headerTitle}>PROFIL</Text>
    </View>
    
    <TouchableOpacity 
      onPress={openReportModal}
      activeOpacity={0.7}
      accessibilityLabel="Signaler un problème"
      accessibilityRole="button"
    >
      <MaterialIcons 
        name="flag" 
        size={24} 
        color="#FFFFFC" 
        style={{ marginRight: 10 }} 
      />
    </TouchableOpacity>
  </View>
));

ProfileHeader.displayName = 'ProfileHeader';