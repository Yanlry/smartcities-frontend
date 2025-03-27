// src/components/interactions/ReportDetails/ReportMetadata.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Report } from "../../../types/report.types";
import { formatCity, formatDate } from "../../../utils/formatters";
import { getTypeIcon } from "../../../utils/typeIcons";

interface TypeBadgeProps {
  type: string;
}

/**
 * Sous-composant pour afficher le badge de type
 */
const TypeBadge = memo(({ type }: TypeBadgeProps) => {
  return (
    <View style={styles.typeBadge}>
      <View style={styles.iconContainer}>
        <Image
          source={getTypeIcon(type)}
          style={styles.typeIcon}
        />
      </View>
      <Text style={styles.typeText}>{type.toUpperCase()}</Text>
    </View>
  );
});

interface MetadataCardProps {
  description: string;
  city: string;
  createdAt: string;
  gpsDistance?: number;
}

/**
 * Sous-composant pour afficher les métadonnées principales
 */
const MetadataCard = memo(({ description, city, createdAt, gpsDistance }: MetadataCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.divider} />
      
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon name="location-outline" size={18} color="#666" />
          <Text style={styles.metaText}>{formatCity(city)}</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Icon name="time-outline" size={18} color="#666" />
          <Text style={styles.metaText}>{formatDate(createdAt)}</Text>
        </View>
        
        {gpsDistance !== undefined && (
          <View style={styles.metaItem}>
            <Icon name="car-outline" size={18} color="#666" />
            <Text style={styles.metaText}>{gpsDistance.toFixed(1)} km</Text>
          </View>
        )}
      </View>
    </View>
  );
});

interface ReportMetadataProps {
  report: Report;
}

/**
 * Composant principal affichant les métadonnées complètes du signalement
 */
const ReportMetadata: React.FC<ReportMetadataProps> = ({ report }) => {
  return (
    <>
      <TypeBadge type={report.type} />
      <MetadataCard
        description={report.description}
        city={report.city}
        createdAt={report.createdAt}
        gpsDistance={report.gpsDistance}
      />
    </>
  );
};

const styles = StyleSheet.create({
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  typeIcon: {
    width: 20,
    height: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333333",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  metaContainer: {
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
});

export default memo(ReportMetadata);