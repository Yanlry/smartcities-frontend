// Modifications apportées au composant MapScreen pour la section des filtres
// Éléments modifiés: filtersHeader, gestion des filtres actifs et amélioration visuelle

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  Image,
  ScrollView
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useLocation } from "../hooks/location/useLocation";
import {
  fetchAllReportsInRegion,
  Report,
  fetchAllEventsInRegion,
  Event as ReportEvent,
} from "../services/reportService";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  useAnimatedGestureHandler,
} from "react-native-reanimated";
import { formatDate } from "../utils/formatters";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

// Type pour les gradients (tuple en lecture seule)
type GradientTuple = readonly [string, string, ...string[]];

// Définition des types d'icônes
type IconType = {
  name: string;
  label: string;
  color?: string;
};

// Système d'icônes pour remplacer les images
const ICONS: Record<string, IconType> = {
  events: {
    name: "calendar-star",
    label: "Événements",
    color: "#E43737"
  },
  danger: {
    name: "alert-octagon",
    label: "Danger",
    color: "#FF3B30"
  },
  travaux: {
    name: "hammer",
    label: "Travaux",
    color: "#FF9500"
  },
  nuisance: {
    name: "volume-high",
    label: "Nuisance",
    color: "#9C27B0"
  },
  pollution: {
    name: "factory",
    label: "Pollution",
    color: "#34C759"
  },
  reparation: {
    name: "wrench",
    label: "Réparation",
    color: "#007AFF"
  }
};

// Fonction pour obtenir l'icône selon le type
const getTypeIcon = (type: string): IconType => {
  return ICONS[type] || ICONS.events;
};

// CIF Color Palette avec typage correct
const COLORS = {
  primary: "#062C41",
  primaryLight: "#0A4D73",
  primaryGradient: ["#062C41", "#0A4D73"] as GradientTuple,
  secondary: "#E43737",
  secondaryLight: "#FF5252",
  secondaryGradient: ["#E43737", "#FF5252"] as GradientTuple,
  accent: "#A1D9F7",
  accentGradient: ["#A1D9F7", "#70C1F2"] as GradientTuple,
  background: "#F8F9FA",
  card: "#FFFFFF",
  cardShadow: "rgba(6, 44, 65, 0.1)",
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#999999",
    inverse: "#FFFFFF",
  },
  marker: {
    shadow: "rgba(0, 0, 0, 0.2)",
    background: "#FFFFFF",
  },
};

// CIF Animation Constants
const ANIMATION = {
  duration: {
    short: 150,
    medium: 300,
    long: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};

// Standardized Type Labels
const TYPE_LABELS: Record<string, string> = {
  reparation: "Réparation",
  nuisance: "Nuisance",
  travaux: "Travaux",
  danger: "Danger",
  pollution: "Pollution",
};

/**
 * MapScreen component displays a map with reports and events based on user location
 * and provides filtering, preview, and navigation capabilities.
 */
export default function MapScreen() {
  const { location, loading } = useLocation();
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const windowHeight = Dimensions.get('window').height;
  const windowWidth = Dimensions.get('window').width;
  
  // Animated values
  const translateY = useSharedValue(windowHeight);
  const filtersHeight = useSharedValue(56);
  const filtersExpandButton = useSharedValue(0);
  const floatingButtonsScale = useSharedValue(0);
  const mapControlsOpacity = useSharedValue(0);

  // Component state
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<ReportEvent[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | ReportEvent | null>(null);
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid" | "terrain">("standard");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "reports" | "events">("all");
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Valeur de couleur par défaut pour les gradients
  const defaultGradient = ["#F5F5F5", "#F5F5F5"] as GradientTuple;

  // Effect for initializing the map with user location
  useEffect(() => {
    if (location) {
      const initialRegion = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      console.log("📍 Initialisation de la carte :", initialRegion);
      setMapRegion(initialRegion);

      mapRef.current?.animateCamera(
        { center: location, zoom: 16 },
        { duration: 2000 }
      );

      fetchDataInRegion(initialRegion);
      
      // Animate UI elements entry
      floatingButtonsScale.value = withSpring(1, ANIMATION.spring);
      
      mapControlsOpacity.value = withTiming(1, {
        duration: ANIMATION.duration.long,
      });
    }
  }, [location]);

  // Effect for showing selected report detail
  useEffect(() => {
    if (selectedReport) {
      translateY.value = withSpring(0, ANIMATION.spring);
    }
  }, [selectedReport]);

  // Function to fetch reports and events in the current map region
  const fetchDataInRegion = async (region?: Region) => {
    const regionToUse =
      region ||
      mapRegion ||
      (location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        : null);

    if (!regionToUse) {
      console.error("❌ Aucune région valide pour récupérer les données !");
      return;
    }

    console.log("🔄 Chargement des données pour :", regionToUse);
    setLoadingReports(true);

    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } =
        regionToUse;
      const radiusKm = Math.max(latitudeDelta * 111, longitudeDelta * 111, 5);

      const [reportsData, eventsData] = await Promise.all([
        fetchAllReportsInRegion(latitude, longitude, radiusKm),
        fetchAllEventsInRegion(latitude, longitude, radiusKm),
      ]);

      console.log("✅ Signalements chargés :", reportsData.length);
      console.log("✅ Événements chargés :", eventsData.length);

      setReports(reportsData);
      setEvents(eventsData);

      if (!isReady) {
        console.log("🚀 Première mise à jour de la carte");
        setIsReady(true);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données :", error);
      Alert.alert("Erreur", "Impossible de récupérer les données.");
    } finally {
      setLoadingReports(false);
      console.log("✅ Fin du chargement des données");
    }
  };

  // Handle the gesture for dismissing the report detail panel
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100) {
        translateY.value = withSpring(windowHeight, ANIMATION.spring);
        runOnJS(setSelectedReport)(null);
      } else {
        translateY.value = withSpring(0, ANIMATION.spring);
      }
    },
  });

  // Filter markers based on selected filter and category
  const filteredMarkers = useCallback((): (Report | ReportEvent)[] => {
    let markers: (Report | ReportEvent)[] = [];

    if (selectedFilter === "reports") {
      markers = reports;
    } else if (selectedFilter === "events") {
      markers = events;
    } else {
      markers = [...reports, ...events];
    }

    if (selectedCategory) {
      markers = markers.filter((item) =>
        isReport(item)
          ? item.type === selectedCategory
          : selectedFilter === "events"
      );
    }

    return markers;
  }, [reports, events, selectedFilter, selectedCategory]);

  // Toggle map type between standard and satellite
  const toggleMapType = useCallback(() => {
    setMapType((prevType) =>
      prevType === "standard" ? "satellite" : "standard"
    );
  }, []);

  // Toggle filters expansion
  const toggleFiltersExpanded = useCallback(() => {
    setFiltersExpanded(prev => !prev);
    filtersHeight.value = withSpring(
      filtersExpanded ? 56 : 170, 
      ANIMATION.spring
    );
    filtersExpandButton.value = withSpring(
      filtersExpanded ? 0 : 1,
      ANIMATION.spring
    );
  }, [filtersExpanded, filtersHeight, filtersExpandButton]);

  // Check if an item is a Report or an Event
  const isReport = (item: Report | ReportEvent): item is Report =>
    (item as Report).type !== undefined;

  // Format type to display the localized label
  const formatType = useCallback((type: string): string => {
    return TYPE_LABELS[type] || "Type inconnu";
  }, []);

  // Determine if any filters are active
  const hasActiveFilters = useMemo(() => 
    selectedFilter !== 'all' || selectedCategory !== null,
  [selectedFilter, selectedCategory]);

  // Get active filter label for header display
  const getActiveFilterLabel = useMemo(() => {
    if (selectedCategory) {
      return ICONS[selectedCategory].label;
    } else if (selectedFilter === "events") {
      return ICONS.events.label;
    } else if (selectedFilter === "reports") {
      return "Signalements";
    }
    return null;
  }, [selectedFilter, selectedCategory]);

  // Animated styles
  const detailPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(
      translateY.value,
      [0, windowHeight / 2, windowHeight],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    ),
  }));

  const filtersContainerStyle = useAnimatedStyle(() => ({
    height: filtersHeight.value,
  }));

  const filtersButtonStyle = useAnimatedStyle(() => ({
    transform: [{ 
      rotate: `${interpolate(
        filtersExpandButton.value, 
        [0, 1], 
        [0, Math.PI / 2]
      )}rad` 
    }],
  }));

  const floatingButtonsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: floatingButtonsScale.value }],
    opacity: floatingButtonsScale.value,
  }));

  // Loading indicator during initial load or when fetching reports
  if (loading || !isReady || loadingReports) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>
            {loadingReports ? "Chargement des données..." : "Initialisation..."}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Error view if location is not available
  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={styles.errorGradient}
        >
          <MaterialCommunityIcons
            name="map-marker-off"
            size={60}
            color={COLORS.accent}
          />
          <Text style={styles.errorTitle}>Localisation indisponible</Text>
          <Text style={styles.errorText}>
            Impossible de récupérer votre position actuelle.
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Component */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion || undefined}
        onRegionChangeComplete={(region) => setMapRegion(region)}
        mapType={mapType}
        showsBuildings={false}
        pitchEnabled={false}
        rotateEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        showsCompass={false}
      >
        {/* Map Markers */}
        {filteredMarkers().map((item, index) => (
          <Marker
            key={`${item.id}-${index}`}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            onPress={() => setSelectedReport(item)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerIconShadow}>
                <LinearGradient
                  colors={
                    isReport(item)
                      ? COLORS.primaryGradient
                      : COLORS.secondaryGradient
                  }
                  style={styles.markerGradient}
                >
                  <MaterialCommunityIcons
                    name={isReport(item) ? (getTypeIcon(item.type).name as any) : ICONS.events.name}
                    size={24}
                    color={COLORS.text.inverse}
                  />
                </LinearGradient>
              </View>
            </View>
          </Marker>
        ))}

        {/* User Location Marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          >
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerRing}>
                <View style={styles.userMarkerDot} />
              </View>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Section de filtres optimisée avec amélioration visuelle */}
      <Animated.View style={[styles.filtersContainer, filtersContainerStyle]}>
        <LinearGradient
          colors={hasActiveFilters ? COLORS.primaryGradient : ["#FFFFFF", "#F8F9FA"] as GradientTuple}
          style={styles.filtersHeaderGradient}
        >
          <View style={styles.filtersHeader}>
            {hasActiveFilters ? (
              <View style={styles.activeFilterLabelContainer}>
                <Text style={styles.filtersTitleActive}>
                  Filtre actif:
                </Text>
                <Text style={styles.activeFilterName}>
                  {getActiveFilterLabel}
                </Text>
              </View>
            ) : (
              <Text style={styles.filtersTitle}>Filtres</Text>
            )}
            
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={toggleFiltersExpanded}
            >
              <Animated.View style={filtersButtonStyle}>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={hasActiveFilters ? COLORS.text.inverse : COLORS.primary}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Mode compact (afficher uniquement les filtres actifs ou par défaut) */}
        {!filtersExpanded && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipScrollContainer}
          >
            {/* Filtre "Tout" */}
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === "all" && styles.activeFilterChip,
              ]}
              onPress={() => {
                setSelectedFilter("all");
                setSelectedCategory(null);
              }}
            >
              <LinearGradient
                colors={selectedFilter === "all" 
                  ? COLORS.accentGradient 
                  : defaultGradient}
                style={styles.chipGradient}
              >
                <MaterialCommunityIcons
                  name="view-grid"
                  size={18}
                  color={selectedFilter === "all" ? COLORS.text.inverse : COLORS.primary}
                />
                <Text style={[
                  styles.chipText,
                  selectedFilter === "all" && styles.activeChipText,
                ]}>
                  Tout
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Filtre "Événements" (affiché si sélectionné ou mode par défaut) */}
            {(selectedFilter === "events" || !hasActiveFilters) && (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === "events" && styles.activeFilterChip,
                ]}
                onPress={() => {
                  setSelectedFilter("events");
                  setSelectedCategory(null);
                }}
              >
                <LinearGradient
                  colors={selectedFilter === "events" 
                    ? COLORS.secondaryGradient 
                    : defaultGradient}
                  style={styles.chipGradient}
                >
                  <MaterialCommunityIcons
                    name={ICONS.events.name as any}
                    size={18}
                    color={selectedFilter === "events" ? COLORS.text.inverse : COLORS.primary}
                  />
                  <Text style={[
                    styles.chipText,
                    selectedFilter === "events" && styles.activeChipText,
                  ]}>
                    {ICONS.events.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Catégorie sélectionnée avec bouton de suppression */}
            {selectedCategory && (
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => {
                  setSelectedCategory(null);
                }}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  style={styles.chipGradient}
                >
                  <MaterialCommunityIcons
                    name={ICONS[selectedCategory].name as any}
                    size={18}
                    color={COLORS.text.inverse}
                  />
                  <Text style={[styles.chipText, styles.activeChipText]}>
                    {ICONS[selectedCategory].label}
                  </Text>
                  <View style={styles.closeIconContainer}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={16}
                      color={COLORS.text.inverse}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
            
            {/* Indicateur pour montrer qu'il y a plus de filtres */}
            {!hasActiveFilters && (
              <View style={styles.moreFiltersIndicator}>
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={24}
                  color={COLORS.text.secondary}
                />
              </View>
            )}
          </ScrollView>
        )}
        
        {/* Mode étendu (afficher tous les filtres) */}
        {filtersExpanded && (
          <View style={styles.expandedFiltersContainer}>
            {/* Rangée 1: Filtres principaux */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContainer}
            >
              {/* Filtre "Tout" */}
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => {
                  setSelectedFilter("all");
                  setSelectedCategory(null);
                }}
              >
                <LinearGradient
                  colors={selectedFilter === "all" 
                    ? COLORS.accentGradient 
                    : defaultGradient}
                  style={styles.chipGradient}
                >
                  <MaterialCommunityIcons
                    name="view-grid"
                    size={18}
                    color={selectedFilter === "all" ? COLORS.text.inverse : COLORS.primary}
                  />
                  <Text style={[
                    styles.chipText,
                    selectedFilter === "all" && styles.activeChipText,
                  ]}>
                    Tout
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Filtre "Événements" */}
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => {
                  setSelectedFilter("events");
                  setSelectedCategory(null);
                }}
              >
                <LinearGradient
                  colors={selectedFilter === "events" 
                    ? COLORS.secondaryGradient 
                    : defaultGradient}
                  style={styles.chipGradient}
                >
                  <MaterialCommunityIcons
                    name={ICONS.events.name as any}
                    size={18}
                    color={selectedFilter === "events" ? COLORS.text.inverse : COLORS.primary}
                  />
                  <Text style={[
                    styles.chipText,
                    selectedFilter === "events" && styles.activeChipText,
                  ]}>
                    {ICONS.events.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
            
            {/* Rangée 2: Catégories de signalements */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScrollContainer}
              style={styles.categoryRow}
            >
              {Object.keys(ICONS)
                .filter(key => key !== "events")
                .map(key => (
                  <TouchableOpacity
                    key={key}
                    style={styles.filterChip}
                    onPress={() => {
                      setSelectedFilter("reports");
                      setSelectedCategory(selectedCategory === key ? null : key);
                    }}
                  >
                    <LinearGradient
                      colors={selectedCategory === key
                        ? [ICONS[key].color || COLORS.primary, COLORS.primary] as GradientTuple
                        : defaultGradient}
                      style={styles.chipGradient}
                    >
                      <MaterialCommunityIcons
                        name={ICONS[key].name as any}
                        size={18}
                        color={selectedCategory === key ? COLORS.text.inverse : COLORS.primary}
                      />
                      <Text style={[
                        styles.chipText,
                        selectedCategory === key && styles.activeChipText,
                      ]}>
                        {ICONS[key].label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* Floating Action Buttons */}
      <Animated.View style={[styles.floatingButtonContainer, floatingButtonsStyle]}>
        {/* Map Type Toggle Button */}
        <TouchableOpacity
          style={styles.floatingButtonView}
          onPress={toggleMapType}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.floatingButtonGradient}
          >
            <MaterialCommunityIcons
              name={mapType === "standard" ? "satellite-variant" : "map-outline"}
              size={24}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={styles.floatingButtonSearch}
          onPress={() => fetchDataInRegion(mapRegion || undefined)}
        >
          <LinearGradient
            colors={COLORS.secondaryGradient}
            style={styles.floatingButtonGradient}
          >
            <MaterialCommunityIcons name="magnify" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Report/Event Detail Panel */}
      {selectedReport && (
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.previewContainer, detailPanelStyle]}>
            {/* Pull Handle */}
            <View style={styles.closeIcon}>
              <View style={styles.closeIconBar} />
            </View>

            {/* Header with Icon and Title */}
            <View style={styles.previewHeader}>
              <LinearGradient
                colors={
                  isReport(selectedReport)
                    ? COLORS.primaryGradient
                    : COLORS.secondaryGradient
                }
                style={styles.previewIconContainer}
              >
                <MaterialCommunityIcons
                  name={
                    isReport(selectedReport)
                      ? (getTypeIcon(selectedReport.type).name as any)
                      : (ICONS.events.name as any)
                  }
                  size={28}
                  color={COLORS.text.inverse}
                />
              </LinearGradient>
              
              <View style={styles.previewTitleContainer}>
                <Text
                  style={styles.previewTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {selectedReport.title.length > 32
                    ? `${selectedReport.title.slice(0, 32)}...`
                    : selectedReport.title}
                </Text>
                <Text style={styles.previewType}>
                  {isReport(selectedReport)
                    ? formatType(selectedReport.type)
                    : "Événement spécial"}
                </Text>
              </View>
            </View>

            {/* Image if available */}
            {"photos" in selectedReport &&
              selectedReport.photos?.length > 0 && (
                <Image
                  source={{ uri: selectedReport.photos[0].url }}
                  style={styles.previewImageLarge}
                  resizeMode="cover"
                />
              )}


            {/* Info badges */}
            <View style={styles.previewInfoContainer}>
              <View style={styles.previewInfoBadge}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={16} 
                  color={COLORS.primary} 
                />
                <Text style={styles.previewInfoText}>
                  {isReport(selectedReport) && selectedReport.createdAt
                    ? formatDate(selectedReport.createdAt)
                    : !isReport(selectedReport) && selectedReport.date
                    ? formatDate(selectedReport.date)
                    : "Date inconnue"}
                </Text>
              </View>

              <View style={styles.previewInfoBadge}>
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.previewInfoText}>
                  {selectedReport.distance !== undefined &&
                  selectedReport.distance !== null
                    ? `${selectedReport.distance.toFixed(2)} km`
                    : (!isReport(selectedReport) && selectedReport.location) ||
                      "Lieu inconnu"}
                </Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.previewDescriptionContainer}>
              <Text style={styles.previewDescription}>
                {selectedReport.description || "Aucune description disponible"}
              </Text>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                if (isReport(selectedReport)) {
                  navigation.navigate("ReportDetailsScreen", {
                    reportId: selectedReport.id,
                  });
                } else {
                  navigation.navigate("EventDetailsScreen", {
                    eventId: selectedReport.id.toString(),
                  });
                }
                setSelectedReport(null);
              }}
            >
              <LinearGradient
                colors={
                  isReport(selectedReport)
                    ? COLORS.primaryGradient
                    : COLORS.secondaryGradient
                }
                style={styles.detailsButtonGradient}
              >
                <Text style={styles.detailsButtonText}>Voir plus</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  
  // Loading and error styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text.inverse,
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    color: COLORS.text.inverse,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  errorText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  
  // Map marker styles
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerIconShadow: {
    shadowColor: COLORS.marker.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    backgroundColor: 'transparent',
    borderRadius: 20,
  },
  markerGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  markerIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text.inverse,
  },
  userMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(6, 44, 65, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.text.inverse,
  },
  
  // Styles améliorés pour la section de filtres
  filtersContainer: {
    position: "absolute",
    top: 110,
    left: 10,
    right: 10,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
    zIndex: 10,
  },
  filtersHeaderGradient: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  filtersTitleActive: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  activeFilterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFilterName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text.inverse,
    marginLeft: 6,
  },
  expandButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipScrollContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterChip: {
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeFilterChip: {
    // Styles appliqués via la LinearGradient
  },
  chipGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.text.primary,
    marginLeft: 6,
    fontWeight: "500",
  },
  activeChipText: {
    color: COLORS.text.inverse,
  },
  closeIconContainer: {
    marginLeft: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  moreFiltersIndicator: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  expandedFiltersContainer: {
    paddingBottom: 4,
  },
  categoryRow: {
    marginTop: 0,
    
  },
  
  // Floating button styles
  floatingButtonContainer: {
    position: "absolute",
    bottom: 80,
    right: 20,
    alignItems: "center",
    zIndex: 10,
  },
  floatingButtonView: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingButtonSearch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Preview panel styles
  previewContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: 20,
    paddingBottom: 110,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 20,
      },
    }),
    zIndex: 100,
  },
  closeIcon: {
    alignSelf: "center",
    marginBottom: 12,
  },
  closeIconBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  previewIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.text.inverse,
  },
  previewTitleContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  previewType: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  previewImageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  previewPhotoPlaceholder: {
    width: "100%",
    height: 150,
    backgroundColor: 'rgba(161, 217, 247, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPhotoText: {
    marginTop: 8,
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  previewImageLarge: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewInfoContainer: {
    flexDirection: "row",
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  previewInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(161, 217, 247, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  previewInfoText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 6,
  },
  previewDescriptionContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  detailsButton: {
    borderRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  detailsButtonGradient: {
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  detailsButtonText: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: "600",
  },
});