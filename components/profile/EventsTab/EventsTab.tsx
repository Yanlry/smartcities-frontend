// components/profile/EventsTab/EventsTab.tsx

import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { profileStyles } from "../../../styles/profileStyles";

import { EventsTabProps } from "../../../types/features/profile/tabs.types";

/**
 * Composant affichant la liste des événements d'un utilisateur
 */
export const EventsTab: React.FC<EventsTabProps> = memo(({ events, navigation }) => (
  <>
    {events.length === 0 ? (
      <View style={profileStyles.noDataContainer}>
        <Text style={profileStyles.noDataText}>Aucun événement trouvé.</Text>
      </View>
    ) : (
      <View>
        {events.map((item) => {
          const eventDate = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString()
            : "Date non disponible";
            
          return (
            <View key={item.id.toString()} style={profileStyles.eventCard}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("EventDetailsScreen", {
                    eventId: item.id,
                  })
                }
              >
                {/* Image de l'événement */}
                <Image
                  source={{
                    uri: item.photos?.[0]?.url || "https://via.placeholder.com/150",
                  }}
                  style={profileStyles.eventImage}
                  resizeMode="cover"
                />

                {/* Titre et description */}
                <Text style={profileStyles.eventTitle}>
                  {item.title || "Titre non disponible"}
                </Text>
                <Text style={profileStyles.eventDescription} numberOfLines={2}>
                  {item.description || "Aucune description disponible"}
                </Text>

                {/* Pied de carte avec la date */}
                <View style={profileStyles.eventFooter}>
                  <Text style={profileStyles.eventDate}>
                    L'événement est prévu pour le {eventDate}
                  </Text>
                  <Icon name="chevron-right" size={24} color="#CBCBCB" />
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    )}
  </>
));

EventsTab.displayName = 'EventsTab';