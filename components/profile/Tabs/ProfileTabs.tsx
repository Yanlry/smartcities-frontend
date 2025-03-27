// components/profile/Tabs/ProfileTabs.tsx

import React, { memo } from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { profileStyles } from "../../../styles/profileStyles";

import { ProfileTabsProps } from "../../../types/features/profile/tabs.types";

/**
 * Composant pour afficher les onglets de navigation du profil
 */
export const ProfileTabs: React.FC<ProfileTabsProps> = memo(({ 
  selectedTab, 
  onSelectTab 
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={profileStyles.tabsContainer}
  >
    <TouchableOpacity
      style={[
        profileStyles.tabButton, 
        selectedTab === "info" && profileStyles.activeTab
      ]}
      onPress={() => onSelectTab("info")}
    >
      <Text 
        style={[
          profileStyles.tabText, 
          selectedTab === "info" && profileStyles.activeTabText
        ]}
      >
        Info & Statistique
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        profileStyles.tabButton, 
        selectedTab === "signalement" && profileStyles.activeTab
      ]}
      onPress={() => onSelectTab("signalement")}
    >
      <Text 
        style={[
          profileStyles.tabText, 
          selectedTab === "signalement" && profileStyles.activeTabText
        ]}
      >
        Signalement
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        profileStyles.tabButton, 
        selectedTab === "publications" && profileStyles.activeTab
      ]}
      onPress={() => onSelectTab("publications")}
    >
      <Text 
        style={[
          profileStyles.tabText, 
          selectedTab === "publications" && profileStyles.activeTabText
        ]}
      >
        Publications
      </Text>
    </TouchableOpacity>
    
    <TouchableOpacity
      style={[
        profileStyles.tabButton, 
        selectedTab === "evenement" && profileStyles.activeTab
      ]}
      onPress={() => onSelectTab("evenement")}
    >
      <Text 
        style={[
          profileStyles.tabText, 
          selectedTab === "evenement" && profileStyles.activeTabText
        ]}
      >
        Événement
      </Text>
    </TouchableOpacity>
  </ScrollView>
));

ProfileTabs.displayName = 'ProfileTabs';