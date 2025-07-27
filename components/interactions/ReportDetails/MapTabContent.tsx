// Chemin : src/components/interactions/ReportDetails/MapTabContent.tsx

import React, { useRef, memo, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import Icon from "react-native-vector-icons/Ionicons";
import { Report } from "../../../types/entities/report.types";
import { formatCity } from "../../../utils/formatters";

// Dimensions pour calculs responsifs
const { width, height } = Dimensions.get("window");

// Types définis manuellement pour éviter les conflits d'espaces de noms
interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Échelle de gris définie séparément pour éviter les références circulaires
const GRAY_SCALE = {
  50: "#F9FAFB",
  100: "#F3F4F6",
  200: "#E5E7EB",
  300: "#D1D5DB",
  400: "#9CA3AF",
  500: "#6B7280",
  600: "#4B5563",
  700: "#374151",
  800: "#1F2937",
  900: "#111827",
};

/**
 * Système de couleurs sophistiqué et harmonieux
 */
const COLORS = {
  // Couleurs primaires - tons bleus sophistiqués
  primary: {
    main: "#2E5BFF",
    dark: "#1E40AF",
    light: "#60A5FA",
    ghost: "rgba(46, 91, 255, 0.08)",
    subtle: "rgba(46, 91, 255, 0.15)",
  },

  // Couleurs secondaires - tons complémentaires
  secondary: {
    main: "#00C6A7",
    dark: "#00A3C4",
    light: "#40E0D0",
    ghost: "rgba(0, 198, 167, 0.08)",
  },

  // Couleurs d'accent - pour points d'attention
  accent: {
    main: "#F97316",
    secondary: "#DB2777",
    ghost: "rgba(249, 115, 22, 0.08)",
  },

  // Couleurs fonctionnelles
  state: {
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#38BDF8",
  },

  // Échelle de gris nuancée
  gray: GRAY_SCALE,

  // Effets de transparence
  glass: {
    white: "rgba(255, 255, 255, 0.95)",
    light: "rgba(255, 255, 255, 0.18)",
    dark: "rgba(0, 0, 0, 0.08)",
    border: "rgba(255, 255, 255, 0.12)",
  },

  // Texte sur fond coloré
  text: {
    light: {
      primary: "rgba(255, 255, 255, 0.95)",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
    dark: {
      primary: GRAY_SCALE[900],
      secondary: GRAY_SCALE[700],
      tertiary: GRAY_SCALE[500],
    },
  },

  // Couleurs de la carte
  map: {
    route: "#2E5BFF",
    water: "#C7EEFF",
    park: "#D1F2D9",
    road: "#FFFFFF",
    building: "#F0F0F0",
  },
};

/**
 * Système d'ombres optimisé par plateforme
 */
const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),

  md: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 5,
    },
    android: {
      elevation: 4,
    },
  }),

  lg: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    android: {
      elevation: 8,
    },
  }),

  // Ombre spéciale pour cartes flottantes
  card: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
    },
    android: {
      elevation: 10,
    },
  }),
};

/**
 * Système d'animation sophistiqué
 */
const ANIMATIONS = {
  duration: {
    veryFast: 120,
    fast: 200,
    medium: 300,
    slow: 450,
  },

  // Courbes d'accélération sophistiquées
  easing: {
    // Standard Material Design easing
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    // Pour les entrées et apparitions
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    // Pour les sorties et disparitions
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    // Pour les rebonds élégants
    gentle: Easing.bezier(0.34, 1.56, 0.64, 1),
  },

  // Helpers pour simplifier l'usage des animations
  helpers: {
    fadeIn: (value: Animated.Value, duration = 300, delay = 0): Animated.CompositeAnimation =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing: ANIMATIONS.easing.decelerate,
        useNativeDriver: true,
      }),

    slideInY: (value: Animated.Value, fromValue = 20, duration = 300, delay = 0): Animated.CompositeAnimation => {
      value.setValue(fromValue);
      return Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: ANIMATIONS.easing.gentle,
        useNativeDriver: true,
      });
    },

    pulse: (value: Animated.Value, minValue = 1, maxValue = 1.1, duration = 2000): Animated.CompositeAnimation => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: maxValue,
            duration: duration / 2,
            easing: ANIMATIONS.easing.standard,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: minValue,
            duration: duration / 2,
            easing: ANIMATIONS.easing.standard,
            useNativeDriver: true,
          }),
        ])
      );
    },
  },
};

/**
 * Fonction pour déterminer quelle icône afficher selon le type de signalement
 */
const getTypeIcon = (type: string): { name: string; color: string } => {
  const typeLower = type.toLowerCase();

  switch (typeLower) {
    case "danger":
      return { name: "warning", color: COLORS.state.error };
    case "travaux":
      return { name: "construct", color: COLORS.accent.main };
    case "nuisance":
      return { name: "volume-high", color: COLORS.state.warning };
    case "pollution":
      return { name: "leaf", color: COLORS.secondary.main };
    case "accident":
      return { name: "car", color: COLORS.accent.secondary };
    case "circulation":
      return { name: "time", color: COLORS.state.info };
    case "reparation":
      return { name: "build", color: COLORS.primary.main };
    default:
      return { name: "alert-circle", color: COLORS.primary.main };
  }
};

interface CustomMarkerProps {
  type: string;
  title: string;
  coordinate: { latitude: number; longitude: number };
}

/**
 * Marqueur premium avec effets visuels statiques (sans animation)
 */
const PremiumMarker = memo(({ type, title, coordinate }: CustomMarkerProps) => {
  // State pour contrôler tracksViewChanges
  const [tracksViewChanges, setTracksViewChanges] = React.useState(true);
  
  // Obtenir l'icône et la couleur selon le type
  const iconInfo = getTypeIcon(type);

  console.log(`🎯 Création du marqueur pour ${title} à`, coordinate, `Type: ${type}, Icône: ${iconInfo.name}`);

  // Désactiver tracksViewChanges après le premier rendu
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Marker 
      coordinate={coordinate} 
      title={title} 
      tracksViewChanges={tracksViewChanges}
      identifier={`marker-${title}-${coordinate.latitude}-${coordinate.longitude}`}
      onLayout={() => setTracksViewChanges(false)}
    >
      <View style={styles.markerOuterContainer}>
        {/* Effet de halo lumineux (statique) */}
        <View
          style={[
            styles.markerGlow,
            {
              backgroundColor: iconInfo.color,
              opacity: 0.5,
            },
          ]}
        />

        {/* Conteneur principal du marqueur */}
        <View style={styles.markerContainer}>
          <View
            style={[styles.markerInner, { backgroundColor: iconInfo.color }]}
          >
            <Icon name={iconInfo.name} size={22} color="#FFFFFF" />

            {/* Effet de reflet/brillance */}
            <View style={styles.markerReflection} />
          </View>
        </View>

        {/* Pointeur triangulaire */}
        <View
          style={[styles.markerPointer, { backgroundColor: iconInfo.color }]}
        />

        {/* Ombre portée */}
        <View style={styles.markerShadow} />
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
 * Carte d'information premium avec design glassmorphique
 * Animations fluides et effets visuels sophistiqués
 */
const MapInfoCard = memo(({ title, city, gpsDistance }: MapInfoCardProps) => {
  // Animations refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  // Démarrer les animations au montage
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.slideInY(slideAnim, 25, ANIMATIONS.duration.medium),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.medium,
        easing: ANIMATIONS.easing.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.mapInfoCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      {/* Effet de brillance supérieur */}
      <View style={styles.cardShine} />

      {/* Conteneur principal avec effet glassmorphique */}
      <View style={styles.mapCardContent}>
        {/* En-tête avec titre et localisation */}
        <View style={styles.mapCardHeader}>
          <Text style={styles.mapCardTitle} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.locationContainer}>
            <Icon
              name="location-outline"
              size={14}
              color={COLORS.primary.main}
            />
            <Text style={styles.mapCardLocation}>{formatCity(city)}</Text>
          </View>
        </View>

        {/* Information de distance avec indicateur visuel */}
        {gpsDistance != null && (
          <View style={styles.distanceSection}>
            <View style={styles.distanceDivider} />
            <View style={styles.distanceContainer}>
              <View style={styles.distanceIconContainer}>
                <Icon
                  name="navigate"
                  size={14}
                  color={COLORS.text.light.primary}
                />
              </View>
              <View style={styles.distanceTextContainer}>
                <Text style={styles.distanceValue}>
                  {gpsDistance.toFixed(1)} km
                </Text>
                <Text style={styles.distanceLabel}>de votre position</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

/**
 * Bouton pour recentrer la carte sur le point d'intérêt
 */
const RecenterButton = memo(({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={styles.recenterButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.recenterButtonInner}>
        <Icon name="locate" size={20} color={COLORS.primary.main} />
      </View>
    </TouchableOpacity>
  );
});

interface MapTabContentProps {
  report: Report;
  routeCoords?: { latitude: number; longitude: number }[];
  mapReady: boolean;
  onMapReady: () => void;
}

/**
 * Composant principal pour l'onglet Carte avec design premium
 */
const MapTabContent: React.FC<MapTabContentProps> = ({
  report,
  routeCoords,
  mapReady,
  onMapReady,
}) => {
  // Références pour la carte et animations
  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Debug: Afficher les données du rapport
  console.log("📍 MapTabContent - Données du rapport:", {
    id: report?.id,
    title: report?.title,
    latitude: report?.latitude,
    longitude: report?.longitude,
    type: report?.type,
    city: report?.city,
    mapReady
  });

  // Valider les coordonnées du rapport
  const validCoordinates = useMemo(() => {
    const isValid = report &&
      typeof report.latitude === 'number' &&
      typeof report.longitude === 'number' &&
      !isNaN(report.latitude) &&
      !isNaN(report.longitude) &&
      report.latitude !== 0 &&
      report.longitude !== 0;
    
    console.log("🔍 Validation des coordonnées:", {
      isValid,
      latitude: report?.latitude,
      longitude: report?.longitude,
      latType: typeof report?.latitude,
      lngType: typeof report?.longitude
    });
    
    return isValid;
  }, [report]);

  // Coordonnées du rapport
  const reportCoords = useMemo(() => {
    const coords = validCoordinates
      ? {
          latitude: report.latitude,
          longitude: report.longitude,
        }
      : null;
    
    console.log("📍 Coordonnées du rapport calculées:", coords);
    return coords;
  }, [report, validCoordinates]);

  // Détermine la région optimale pour la carte
  const calculateRegion = (): MapRegion => {
    console.log("🗺️ Calcul de la région de la carte...");
    
    // Si nous n'avons que le point du signalement
    if (!routeCoords || routeCoords.length === 0) {
      const region = {
        latitude: reportCoords?.latitude || 48.8566,
        longitude: reportCoords?.longitude || 2.3522,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      console.log("📍 Région calculée (point unique):", region);
      return region;
    }

    // Si nous avons un itinéraire, calculer les limites
    const allPoints = [...routeCoords];
    if (reportCoords) {
      allPoints.push(reportCoords);
    }

    // Trouver les valeurs min/max de latitude et longitude
    let minLat = allPoints[0].latitude;
    let maxLat = allPoints[0].latitude;
    let minLng = allPoints[0].longitude;
    let maxLng = allPoints[0].longitude;

    allPoints.forEach((point) => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });

    // Calculer le centre et le delta
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Ajouter une marge
    const latDelta = (maxLat - minLat) * 1.5;
    const lngDelta = (maxLng - minLng) * 1.5;

    const region = {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
    
    console.log("📍 Région calculée (avec itinéraire):", region);
    return region;
  };

  // Fonction pour recentrer la carte
  const handleRecenter = () => {
    console.log("🎯 Recentrage de la carte...");
    if (mapRef.current && reportCoords) {
      const region = calculateRegion();
      mapRef.current.animateToRegion(region, 300);
    }
  };

  // Gestion de l'événement "carte prête"
  const handleMapReady = () => {
    console.log("🗺️ Carte prête, initialisation...");
    onMapReady();

    // Animer l'apparition de la carte
    ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium).start();

    // Centrer la carte sur tous les points
    if (mapRef.current) {
      if (routeCoords?.length && routeCoords.length > 1) {
        try {
          setTimeout(() => {
            const region = calculateRegion();
            console.log("🎯 Animation vers la région:", region);
            mapRef.current?.animateToRegion(region, 300);
          }, 500);
        } catch (error) {
          console.warn("❌ Erreur lors de l'ajustement de la carte:", error);
        }
      }
    }
  };

  // Region initiale pour la carte
  const initialRegion = useMemo(() => {
    const region = {
      latitude: validCoordinates ? report.latitude : 48.8566,
      longitude: validCoordinates ? report.longitude : 2.3522,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    console.log("🗺️ Région initiale de la carte:", region);
    return region;
  }, [validCoordinates, report]);

  return (
    <View style={styles.mapContent}>
      {/* Conteneur de la carte avec animation d'entrée */}
      <Animated.View style={[styles.mapContainer, { opacity: fadeAnim }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsCompass={true}
          onMapReady={handleMapReady}
          mapPadding={{ top: 0, right: 0, bottom: 20, left: 0 }}
          customMapStyle={premiumMapStyle}
        >
          {/* Marqueur premium avec vérifications pour éviter les erreurs */}
          {mapReady && validCoordinates && (
            <PremiumMarker
              key={`marker-${report.id}-${report.latitude}-${report.longitude}`}
              type={report.type}
              title={report.title}
              coordinate={{
                latitude: report.latitude,
                longitude: report.longitude,
              }}
            />
          )}

          {/* Polyline premium avec vérifications */}
          {mapReady && Array.isArray(routeCoords) && routeCoords.length > 1 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={COLORS.primary.main}
              strokeWidth={4}
              lineDashPattern={[0]}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>
      </Animated.View>

      {/* Bouton pour recentrer la carte */}
      {mapReady && <RecenterButton onPress={handleRecenter} />}

      {/* Carte d'information premium (affichée uniquement quand la carte est prête) */}
      {mapReady && (
        <MapInfoCard
          title={report.title}
          city={report.city}
          gpsDistance={report.gpsDistance}
        />
      )}
    </View>
  );
};

// Style premium pour la carte - couleurs subtiles et élégantes
const premiumMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f8f9fa" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: COLORS.map.park }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: COLORS.map.road }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: COLORS.map.water }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

const styles = StyleSheet.create({
  // Styles du conteneur de carte
  mapContent: {
    flex: 1,
    position: "relative",
  },
  mapContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 16,
    ...SHADOWS.md,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Bouton pour recentrer
  recenterButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 100,
  },
  recenterButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.md,
  },

  // Styles de la carte d'information
  mapInfoCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...SHADOWS.card,
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
  mapCardContent: {
    backgroundColor: COLORS.glass.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  mapCardHeader: {
    marginBottom: 8,
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.dark.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapCardLocation: {
    fontSize: 14,
    color: COLORS.text.dark.secondary,
    marginLeft: 4,
  },

  // Styles de la section distance
  distanceSection: {
    marginTop: 4,
  },
  distanceDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginVertical: 8,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  distanceIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary.main,
    ...SHADOWS.sm,
  },
  distanceTextContainer: {
    marginLeft: 10,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.dark.primary,
  },
  distanceLabel: {
    fontSize: 12,
    color: COLORS.text.dark.tertiary,
    marginTop: 1,
  },

  // Styles du marqueur personnalisé
  markerOuterContainer: {
    alignItems: "center",
    position: "relative",
    marginBottom: 10,
  },
  markerGlow: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    top: -5,
    opacity: 0.7,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  markerInner: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    ...SHADOWS.lg,
  },
  markerReflection: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    opacity: 0.5,
  },
  markerPointer: {
    width: 14,
    height: 14,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    transform: [{ rotate: "45deg" }],
    marginTop: -7,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    ...SHADOWS.md,
  },
  markerShadow: {
    position: "absolute",
    bottom: -4,
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    opacity: 0.5,
    transform: [{ scaleX: 1.5 }],
  },
});

export default memo(MapTabContent);