// src/components/interactions/ReportDetails/MapTabContent.tsx

import React, { useRef, memo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { Report } from "../../../types/entities/report.types";
import { formatCity } from "../../../utils/formatters";
import { getTypeIcon } from "../../../utils/typeIcons";

interface CustomMarkerProps {
  type: string;
  title: string;
  coordinate: { latitude: number; longitude: number };
}

/**
 * Sous-composant pour le marqueur personnalisé
 */
const CustomMarker = memo(({ type, title, coordinate }: CustomMarkerProps) => {
  return (
    <Marker
      coordinate={coordinate}
      title={title}
    >
      <View style={styles.markerContainer}>
        <Image
          source={getTypeIcon(type)}
          style={styles.markerIcon}
        />
      </View>
    </Marker>
  );
});

interface MapInfoCardProps {
  title: string;
  city: string;
  gpsDistance?: number;
}

/**
 * Sous-composant pour la carte d'information
 */
const MapInfoCard = memo(({ title, city, gpsDistance }: MapInfoCardProps) => {
  return (
    <View style={styles.mapInfoCard}>
      <View style={styles.mapCardHeader}>
        <Text style={styles.mapCardTitle}>{title}</Text>
        <Text style={styles.mapCardLocation}>{formatCity(city)}</Text>
      </View>
      
      {gpsDistance !== undefined && (
        <View style={styles.distanceContainer}>
          <Icon name="navigate-outline" size={18} color="#2196F3" />
          <Text style={styles.distanceText}>
            À {gpsDistance.toFixed(1)} km de votre position
          </Text>
        </View>
      )}
    </View>
  );
});

interface MapTabContentProps {
  report: Report;
  routeCoords?: { latitude: number; longitude: number }[];
  mapReady: boolean;
  onMapReady: () => void;
}

/**
 * Composant principal pour l'onglet Carte
 */
const MapTabContent: React.FC<MapTabContentProps> = ({
  report,
  routeCoords,
  mapReady,
  onMapReady,
}) => {
  const mapRef = useRef<MapView | null>(null);

  // Ajustement de la vue de la carte une fois prête
  const handleMapReady = () => {
    onMapReady();
    
    if (mapRef.current && routeCoords?.length && routeCoords.length > 1) {
      try {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(routeCoords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      } catch (error) {
        console.warn('Erreur lors de l\'ajustement de la carte:', error);
      }
    }
  };

  return (
    <View style={styles.mapContent}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: report.latitude,
          longitude: report.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsCompass={true}
        onMapReady={handleMapReady}
      >
        {/* Marqueur avec vérifications pour éviter les erreurs */}
        {mapReady && report.latitude && report.longitude && (
          <CustomMarker
            type={report.type}
            title={report.title}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
          />
        )}
        
        {/* Polyline avec vérifications */}
        {mapReady && Array.isArray(routeCoords) && routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#2196F3"
            strokeWidth={4}
          />
        )}
      </MapView>
      
      {/* Overlay d'informations sur la carte */}
      <MapInfoCard
        title={report.title}
        city={report.city}
        gpsDistance={report.gpsDistance}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mapContent: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInfoCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapCardHeader: {
    marginBottom: 8,
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },
  mapCardLocation: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
    marginLeft: 6,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerIcon: {
    width: 20,
    height: 20,
  },
});

export default memo(MapTabContent);