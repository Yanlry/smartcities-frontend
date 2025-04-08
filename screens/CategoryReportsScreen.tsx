
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  ScrollView,
  TextInput
} from "react-native";
import * as Location from "expo-location";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation/routes.types";
import { processReports } from "../services/reportService";
import { formatCity } from "../utils/formatters";
import { typeColors, categoryDescriptions } from "../utils/reportHelpers";
import { hexToRgba, calculateOpacity } from "../utils/reductOpacity";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CategoryReportsScreenRouteProp = RouteProp<
  RootStackParamList,
  "CategoryReportsScreen"
>;

type CategoryReportsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CategoryReportsScreen"
>;

interface Report {
  id: number;
  title: string;
  description: string;
  city: string;
  latitude: number;
  longitude: number;
  distance?: number | null;
  photos?: { url: string }[];
  createdAt: string;
}

// ============================================================================
// THEME SYSTEM & DESIGN TOKENS
// ============================================================================

/**
 * Design system colors with semantic naming
 */
const COLORS = {
  // Primary palette
  primary: {
    50: "#F0F7FF",
    100: "#E0F0FF",
    200: "#BAD9FF",
    300: "#94C2FF",
    400: "#6FA9FF",
    500: "#3B82F6", // Main primary
    600: "#2563EB", // Dark primary
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
  // Secondary palette
  secondary: {
    50: "#EEF9FF",
    100: "#DEF3FF",
    200: "#B2E8FF",
    300: "#78DDFF",
    400: "#38CFFF", 
    500: "#06B6D4", // Main secondary
    600: "#0891B2", // Dark secondary
    700: "#0E7490",
    800: "#155E75",
    900: "#164E63",
  },
  // Accent colors
  accent: {
    purple: {
      50: "#FAF5FF",
      300: "#D8B4FE",
      500: "#A855F7", 
      700: "#7E22CE",
      900: "#581C87",
    },
    rose: {
      50: "#FFF1F2",
      300: "#FDA4AF",
      500: "#F43F5E", 
      700: "#BE123C",
      900: "#881337",
    },
    amber: {
      50: "#FFFBEB",
      300: "#FCD34D",
      500: "#F59E0B", 
      700: "#B45309",
      900: "#78350F",
    },
  },
  // Grayscale
  neutral: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#E5E5E5",
    300: "#D4D4D4",
    400: "#A3A3A3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0A0A0A",
  },
  // Functional colors
  success: {
    50: "#ECFDF5",
    300: "#6EE7B7",
    500: "#10B981",
    700: "#047857",
    900: "#064E3B",
  },
  warning: {
    50: "#FFFBEB",
    300: "#FCD34D",
    500: "#F59E0B",
    700: "#B45309",
    900: "#78350F",
  },
  error: {
    50: "#FEF2F2",
    300: "#FCA5A5",
    500: "#EF4444",
    700: "#B91C1C",
    900: "#7F1D1D",
  },
  info: {
    50: "#EFF6FF",
    300: "#93C5FD",
    500: "#3B82F6",
    700: "#1D4ED8",
    900: "#1E3A8A",
  },
  // Base colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

/**
 * Shadows for different elevation levels with platform-specific implementations
 */
const SHADOWS = {
  none: Platform.select({
    ios: {},
    android: {},
    default: {},
  }),
  xs: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 1,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  "2xl": Platform.select({
    ios: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
    default: {},
  })
};

/**
 * Border radiuses for consistent UI elements
 */
const RADIUS = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

/**
 * Spacing system for consistent layout
 */
const SPACING = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
};

/**
 * Typography system with consistent font sizes and weights
 */
const TYPOGRAPHY = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
    "5xl": 48,
    "6xl": 60,
  },
  weight: {
    thin: "300" as const,
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
    black: "900" as const,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

/**
 * Animation timing presets with Bezier curves
 */
const ANIMATIONS = {
  timing: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    glacial: 800,
  },
  easing: {
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    sharp: Easing.bezier(0.4, 0, 0.6, 1),
    elastic: Easing.bezier(0.68, -0.55, 0.265, 1.55),
    bounce: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CategoryReportsScreen component - displays reports filtered by category
 */
export default function CategoryReportsScreen() {
  const route = useRoute<CategoryReportsScreenRouteProp>();
  const navigation = useNavigation<CategoryReportsScreenNavigationProp>();
  const { category } = route.params;
  const { width: screenWidth } = Dimensions.get("window");

  // State
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'nearby'>('all');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const searchBarAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate dynamic values based on category and reports
  const opacity = useMemo(() => 
    reports.length > 0 ? calculateOpacity(reports[0].createdAt) : 0.7, 
    [reports]
  );
  
  const categoryColor = useMemo(() => 
    typeColors[category.toLowerCase()] ?? "#6366F1", 
    [category]
  );

  const categoryDescription = useMemo(() => 
    categoryDescriptions[category.toLowerCase()] ??
    "Aucune information disponible.", 
    [category]
  );
  
  // Helper function to determine icon based on category
  const getCategoryIcon = useCallback((categoryName: string) => {
    const icons: Record<string, string> = {
      'violence': 'warning-outline',
      'infrastructure': 'construct-outline',
      'propreté': 'trash-outline',
      'santé': 'medical-outline',
      'environnement': 'leaf-outline',
      'sécurité': 'shield-outline',
      'transport': 'car-outline',
      'bruit': 'volume-high-outline',
      'nuisance': 'alert-outline',
      'autre': 'ellipsis-horizontal-outline',
    };
    
    return icons[categoryName] || 'alert-circle-outline';
  }, []);

  // Apply filters to reports
  const applyFilter = useCallback((filter: 'all' | 'recent' | 'nearby') => {
    setActiveFilter(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    let filtered = [...reports];
    
    // Si une recherche est active, filtrer d'abord par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(report => {
        const title = (report.title || '').toLowerCase();
        const description = (report.description || '').toLowerCase();
        const city = (report.city || '').toLowerCase();
        
        return (
          title.includes(query) || 
          description.includes(query) || 
          city.includes(query)
        );
      });
    }
    
    // Ensuite appliquer le tri selon le filtre actif
    switch (filter) {
      case 'recent':
        // Sort by creation date (most recent first)
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'nearby':
        // Sort by distance (closest first)
        filtered.sort((a, b) => {
          const distanceA = a.distance ?? Number.MAX_VALUE;
          const distanceB = b.distance ?? Number.MAX_VALUE;
          return distanceA - distanceB;
        });
        break;
      case 'all':
      default:
        // Default order (no specific sorting)
        break;
    }
    
    setFilteredReports(filtered);
  }, [reports, searchQuery]);

  // Function to animate the UI elements on load
  const animateUI = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.timing.normal,
        easing: ANIMATIONS.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATIONS.timing.normal,
        easing: ANIMATIONS.easing.decelerate,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Reset animations for refresh
  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
  }, [fadeAnim, slideAnim]);

  // Fetch reports data
  const fetchLocationAndReports = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
      resetAnimations();
    } else {
      setLoading(true);
    }

    try {
      const { category, city } = route.params;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Erreur",
          "La localisation est nécessaire pour trier les signalements.",
          [{ text: "Compris", style: "default" }],
          { cancelable: true }
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const enrichedReports = await processReports(
        latitude,
        longitude,
        category,
        city
      );

      setReports(enrichedReports);
      setFilteredReports(enrichedReports);
      
      // Trigger animations after data is loaded
      animateUI();
    } catch (error) {
      console.error("❌ Erreur lors du chargement des signalements :", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les signalements.",
        [{ text: "Réessayer", onPress: () => fetchLocationAndReports() }],
        { cancelable: true }
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [route.params, animateUI, resetAnimations]);

  // Initial data fetch
  useEffect(() => {
    fetchLocationAndReports();
  }, [category]);
  
  // Reset search and filter when category changes
  useEffect(() => {
    setActiveFilter('all');
    setSearchQuery('');
    setIsSearchVisible(false);
  }, [category]);

  // Handle back navigation with haptic feedback
  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  }, [navigation]);

  // Handle report card press with navigation
  const handleReportPress = useCallback((reportId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ReportDetailsScreen", {
      reportId,
    });
  }, [navigation]);

  // Handle scroll events (simplified)
  const handleScroll = (event: any) => {
    // Empty handler to avoid errors
  };

  // Shimmer effect component
  const renderShimmer = (width: number | string, height: number, style?: any, borderRadius = RADIUS.md) => {
    // Créer une animation sans utiliser de hooks
    const translateX = new Animated.Value(-500);
    
    // Démarrer l'animation manuellement
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 500,
        duration: 1500,
        easing: ANIMATIONS.easing.standard,
        useNativeDriver: true,
      })
    ).start();
    
    return (
      <View
        style={[
          {
            width,
            height,
            backgroundColor: COLORS.neutral[200],
            borderRadius,
            overflow: "hidden",
          },
          style,
        ]}
      >
        <Animated.View
          style={{
            width: "100%",
            height: "100%",
            transform: [{ translateX }],
            backgroundColor: COLORS.neutral[100],
            opacity: 0.7,
          }}
        />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons
        name="alert-circle-outline"
        size={72}
        color={COLORS.neutral[300]}
      />
      <Text style={styles.emptyStateTitle}>
        Aucun signalement trouvé
      </Text>
      <Text style={styles.emptyStateDescription}>
        Il n'y a pas encore de signalements dans cette catégorie.
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => fetchLocationAndReports(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyStateButtonText}>Actualiser</Text>
      </TouchableOpacity>
    </View>
  );

  const toggleSearch = useCallback(() => {
    if (isSearchVisible) {
      // Masquer la barre de recherche et réinitialiser la recherche
      setSearchQuery('');
      Animated.timing(searchBarAnim, {
        toValue: 0,
        duration: ANIMATIONS.timing.fast,
        easing: ANIMATIONS.easing.accelerate,
        useNativeDriver: true,
      }).start(() => {
        setIsSearchVisible(false);
      });
      
      // Réappliquer le filtre actif sans recherche
      applyFilter(activeFilter);
    } else {
      // Afficher la barre de recherche
      setIsSearchVisible(true);
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: ANIMATIONS.timing.normal,
        easing: ANIMATIONS.easing.decelerate,
        useNativeDriver: true,
      }).start();
    }
  }, [isSearchVisible, activeFilter, searchBarAnim]);

  // Fonction de recherche
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      // Si le texte de recherche est vide, appliquer uniquement le filtre actif
      applyFilter(activeFilter);
      return;
    }
    
    // Filtrer en fonction du texte de recherche
    const searchResults = reports.filter(report => {
      const query = text.toLowerCase().trim();
      const title = (report.title || '').toLowerCase();
      const description = (report.description || '').toLowerCase();
      const city = (report.city || '').toLowerCase();
      
      return (
        title.includes(query) || 
        description.includes(query) || 
        city.includes(query)
      );
    });
    
    // Appliquer le tri selon le filtre actif
    let result = [...searchResults];
    
    switch (activeFilter) {
      case 'recent':
        result.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'nearby':
        result.sort((a, b) => {
          const distanceA = a.distance ?? Number.MAX_VALUE;
          const distanceB = b.distance ?? Number.MAX_VALUE;
          return distanceA - distanceB;
        });
        break;
      default:
        // Pas de tri supplémentaire
        break;
    }
    
    setFilteredReports(result);
  }, [reports, activeFilter]);

  // Render report card
  const renderReportCard = ({ item }: { item: Report }) => {
    // Animation pour card press
    const scale = new Animated.Value(1);
    
    const handlePressIn = () => {
      Animated.timing(scale, {
        toValue: 0.98,
        duration: ANIMATIONS.timing.fast,
        easing: ANIMATIONS.easing.standard,
        useNativeDriver: true,
      }).start();
    };
    
    const handlePressOut = () => {
      Animated.timing(scale, {
        toValue: 1,
        duration: ANIMATIONS.timing.fast,
        easing: ANIMATIONS.easing.bounce,
        useNativeDriver: true,
      }).start();
    };
    
    return (
      <TouchableOpacity
        onPress={() => handleReportPress(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={styles.reportCardContainer}
      >
        <Animated.View 
          style={[
            styles.reportCard, 
            SHADOWS.md,
            { transform: [{ scale }] }
          ]}
        >
          {/* Image section */}
          <View style={styles.reportImageContainer}>
            {item.photos && item.photos.length > 0 ? (
              <>
                <Image
                  source={{ uri: item.photos[0].url }}
                  style={styles.reportImage}
                  resizeMode="cover"
                />
                {/* Photo count badge */}
                {item.photos.length > 1 && (
                  <View style={styles.photoBadgeContainer}>
                    <View style={styles.photoBadge}>
                      <Ionicons
                        name="images"
                        size={10}
                        color={COLORS.secondary[500]}
                      />
                      <Text style={styles.photoBadgeText}>
                        {item.photos.length}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.reportImagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={32}
                  color={COLORS.neutral[300]}
                />
                <Text style={styles.placeholderText}>Aucune image</Text>
              </View>
            )}
          </View>
          
          {/* Content section */}
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle} numberOfLines={1}>
              {item.title || "Sans titre"}
            </Text>
            
            <Text style={styles.reportDescription} numberOfLines={2}>
              {item.description || "Pas de description"}
            </Text>
            
            {/* Footer section */}
            <View style={styles.reportFooter}>
              <View style={styles.locationBadge}>
                <Ionicons
                  name="location"
                  size={10}
                  color={COLORS.neutral[500]}
                />
                <Text style={styles.locationText}>
                  {item.city ? formatCity(item.city) : "Lieu inconnu"}
                </Text>
              </View>
              
              <View style={styles.distanceBadge}>
                <Ionicons
                  name="navigate"
                  size={10}
                  color={COLORS.error[500]}
                />
                <Text style={styles.distanceText}>
                  {`${item.distance?.toFixed(1) || "0.0"} km`}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        
        {/* Loading Header */}
        <View style={[styles.loadingHeaderContainer, { backgroundColor: categoryColor }]}>
          <View style={styles.loadingHeaderContent}>
            {/* Back button placeholder */}
            {renderShimmer(36, 36, { borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.3)' })}
            
            <View style={styles.loadingCenterContent}>
              {/* Icon placeholder */}
              {renderShimmer(40, 40, { borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.3)', marginRight: SPACING[3] })}
              
              <View style={{ flex: 1 }}>
                {/* Title placeholder */}
                {renderShimmer(120, 24, { backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: SPACING[1] })}
                
                {/* Count placeholder */}
                {renderShimmer(80, 16, { backgroundColor: 'rgba(255,255,255,0.3)' })}
              </View>
            </View>
            
            {/* Action button placeholder */}
            {renderShimmer(36, 36, { borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.3)' })}
          </View>
        </View>
        
        {/* Loading Content */}
        <View style={styles.loadingContent}>
          {/* Filters Bar */}
          <View style={styles.filtersBarLoading}>
            {renderShimmer(100, 36, {}, RADIUS.full)}
            {renderShimmer(120, 36, { marginHorizontal: SPACING[2] }, RADIUS.full)}
            {renderShimmer(80, 36, {}, RADIUS.full)}
          </View>
          
          {/* Loading Cards */}
          <View style={styles.loadingCardsContainer}>
            {Array(6).fill(0).map((_, index) => (
              <View key={index} style={styles.loadingCard}>
                {renderShimmer(
                  "100%", 
                  160, 
                  { marginBottom: SPACING[3] }, 
                  RADIUS.lg
                )}
                {renderShimmer(
                  "70%", 
                  20, 
                  { marginBottom: SPACING[2] }
                )}
                {renderShimmer(
                  "100%", 
                  16, 
                  { marginBottom: SPACING[3] }
                )}
                <View style={styles.loadingCardFooter}>
                  {renderShimmer(80, 24, {}, RADIUS.full)}
                  {renderShimmer(60, 24, {}, RADIUS.full)}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header simplifié avec bannière unique */}
      <View style={styles.header}>
        <View style={[styles.categoryBanner, { backgroundColor: categoryColor }]}>
          {/* Bouton retour */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          {/* Contenu principal */}
          <View style={styles.headerContent}>
            <View style={styles.categoryIconContainer}>
              <Ionicons 
                name={getCategoryIcon(category.toLowerCase())} 
                size={24} 
                color={COLORS.white} 
              />
            </View>
            
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryCount}>
                {reports.length} signalement{reports.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          {/* Actions */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleSearch}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isSearchVisible ? "close-outline" : "search-outline"} 
              size={20} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Barre de recherche animée */}
        {isSearchVisible && (
          <Animated.View 
            style={[
              styles.searchContainer,
              { 
                opacity: searchBarAnim,
                transform: [{ 
                  translateY: searchBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  }) 
                }]
              }
            ]}
          >
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={COLORS.neutral[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher par rue, ville, mot-clé..."
                placeholderTextColor={COLORS.neutral[400]}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  style={styles.clearButton} 
                  onPress={() => handleSearch('')}
                >
                  <Ionicons name="close-circle" size={18} color={COLORS.neutral[400]} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </View>
      
      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Filter tabs/pills */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            <TouchableOpacity 
              style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
              onPress={() => applyFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={activeFilter === 'all' ? styles.filterPillTextActive : styles.filterPillText}>
                Tous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterPill, activeFilter === 'recent' && styles.filterPillActive]}
              onPress={() => applyFilter('recent')}
              activeOpacity={0.7}
            >
              <Text style={activeFilter === 'recent' ? styles.filterPillTextActive : styles.filterPillText}>
                Récents
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterPill, activeFilter === 'nearby' && styles.filterPillActive]}
              onPress={() => applyFilter('nearby')}
              activeOpacity={0.7}
            >
              <Text style={activeFilter === 'nearby' ? styles.filterPillTextActive : styles.filterPillText}>
                Proches
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Reports List */}
        <FlatList
          data={filteredReports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </Animated.View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  header: {
    width: "100%",
    ...SHADOWS.md,
    zIndex: 10,
  },
  categoryBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 55 : 45,
    paddingBottom: SPACING[6],
    paddingHorizontal: SPACING[4],
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: SPACING[4],
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING[3],
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.white,
    marginBottom: SPACING[0.5],
  },
  categoryCount: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  filtersContainer: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING[3],
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  searchIcon: {
    marginRight: SPACING[2],
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.neutral[800],
    paddingVertical: 0,
  },
  clearButton: {
    padding: SPACING[1],
  },  // Toggle search bar visibility
  filtersScroll: {
    paddingRight: SPACING[4],
  },
  filterPill: {
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[100],
    marginRight: SPACING[2],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: COLORS.primary[50],
    borderColor: COLORS.primary[200],
    ...SHADOWS.xs,
  },
  filterPillText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.neutral[600],
  },
  filterPillTextActive: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.primary[700],
  },
  listContainer: {
    padding: SPACING[4],
    paddingBottom: SPACING[20], // Extra padding at bottom for scroll
  },
  reportCardContainer: {
    marginBottom: SPACING[4],
  },
  reportCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
  },
  reportImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  reportImage: {
    width: "100%",
    height: "100%",
  },
  reportImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: COLORS.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.neutral[400],
    marginTop: SPACING[1],
  },
  photoBadgeContainer: {
    position: "absolute",
    bottom: SPACING[2],
    right: SPACING[2],
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
    borderRadius: RADIUS.sm,
    paddingVertical: 2,
    paddingHorizontal: 4,
    gap: 2,
  },
  photoBadgeText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.secondary[700],
  },
  reportContent: {
    padding: SPACING[4],
  },
  reportTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.neutral[800],
    marginBottom: SPACING[1],
  },
  reportDescription: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.neutral[600],
    marginBottom: SPACING[4],
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.md,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: RADIUS.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 3,
  },
  locationText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.neutral[700],
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error[50],
    borderRadius: RADIUS.sm,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 3,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.error[700],
  },
  emptyStateContainer: {
    flex: 1,
    minHeight: 400,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING[6],
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.neutral[800],
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
    textAlign: "center",
  },
  emptyStateDescription: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.neutral[500],
    textAlign: "center",
    marginBottom: SPACING[6],
  },
  emptyStateButton: {
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[6],
    backgroundColor: COLORS.primary[500],
    borderRadius: RADIUS.lg,
    ...SHADOWS.md,
  },
  emptyStateButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.white,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  loadingHeaderContainer: {
    paddingTop: Platform.OS === "ios" ? 55 : 45,
    paddingBottom: SPACING[6],
    paddingHorizontal: SPACING[4],
    ...SHADOWS.md,
  },
  loadingHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingCenterContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[4],
  },
  loadingContent: {
    flex: 1,
    paddingTop: SPACING[4],
  },
  filtersBarLoading: {
    flexDirection: "row",
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  loadingCardsContainer: {
    padding: SPACING[4],
  },
  loadingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[4],
    padding: SPACING[4],
    ...SHADOWS.md,
  },
  loadingCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});