// components/profile/ReportsTab/ReportsTab.tsx

import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { profileStyles } from "../../../styles/profileStyles";

import { ReportsTabProps } from "../../../types/features/profile/tabs.types";

/**
 * Composant affichant la liste des signalements d'un utilisateur
 */
export const ReportsTab: React.FC<ReportsTabProps> = memo(({ reports, navigation }) => (
  <>
    {reports.length === 0 ? (
      <View style={profileStyles.noDataContainer}>
        <Text style={profileStyles.noDataText}>
          Aucun signalement trouvé.
        </Text>
      </View>
    ) : (
      <View>
        {reports.map((item) => (
          <View key={item.id.toString()} style={profileStyles.reportCard}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ReportDetailsScreen", {
                  reportId: item.id,
                })
              }
            >
              <View style={profileStyles.reportTypeContainer}>
                <Text style={profileStyles.reportType}>{item.type}</Text>
              </View>
              <Text style={profileStyles.reportTitle}>{item.title}</Text>

              {Array.isArray(item.photos) && item.photos.length > 0 && (
                <Image
                  source={{ uri: item.photos[0].url }}
                  style={profileStyles.reportImage}
                />
              )}

              <Text style={profileStyles.reportDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <Text style={profileStyles.reportCity}>{item.city}</Text>
              <Text style={profileStyles.reportDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}
  </>
));

ReportsTab.displayName = 'ReportsTab';