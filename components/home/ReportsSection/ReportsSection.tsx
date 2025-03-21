import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
  TouchableOpacity,
  Easing,
  ActivityIndicator,
  ScrollView,
  ViewStyle,
  TextStyle,
} from "react-native";
import ReportItem from "./ReportItem";
import { Report, ReportCategory } from "./report.types";
import { getTypeLabel, typeColors } from "../../../utils/reportHelpers";
import { hexToRgba, calculateOpacity } from "../../../utils/reductOpacity";
import { formatCity } from "../../../utils/formatters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Activer LayoutAnimation pour Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const LIGHT_RED_BACKGROUND = '#FFF0F0';

/**
 * Interface pour les propriétés du composant ReportsSection
 */
interface ReportsSectionProps {
  reports: Report[];
  categories: ReportCategory[];
  loading: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  formatTime: (date: string) => string;
  onPressReport: (id: number) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

/**
 * Section de signalements avec animations avancées et design moderne
 * Gère l'affichage de rapports en mode carte ou liste avec alignement cohérent
 */
const ReportsSection: React.FC<ReportsSectionProps> = memo(
  ({
    reports,
    categories,
    loading,
    selectedCategory,
    setSelectedCategory,
    formatTime,
    onPressReport,
    isVisible,
    toggleVisibility,
  }) => {
    // Références pour les animations
    const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const headerScaleAnim = useRef(new Animated.Value(1)).current;
    const badgePulse = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    // État local pour le mode d'affichage
    const [displayMode, setDisplayMode] = useState<"card" | "list">("card");

    // État pour suivre la position du défilement
    const [scrollPosition, setScrollPosition] = useState(0);

    // Animation de rotation pour l'icône de flèche
    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // Animation de pulsation optimisée pour le badge
    useEffect(() => {
      if (reports.length > 0) {
        // Création d'une référence à l'animation pour pouvoir la nettoyer
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(badgePulse, {
              toValue: 1.1, // Amplitude harmonisée avec les autres sections
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(badgePulse, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ])
        );
        
        // Démarrer l'animation
        pulseAnimation.start();
        
        // Fonction de nettoyage appelée lors du démontage du composant
        return () => {
          pulseAnimation.stop();
        };
      }
    }, [reports.length, badgePulse]); // Ajout de badgePulse comme dépendance pour éviter les warnings de hooks

    // Gestion de la visibilité avec LayoutAnimation
    useEffect(() => {
      // Configuration de l'animation de layout
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });

      // Animation de rotation de la flèche
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animation de l'opacité du contenu
      Animated.timing(opacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, [isVisible, rotateAnim, opacityAnim]); // Ajout de rotateAnim et opacityAnim comme dépendances

    // Animation pour l'effet de pression sur l'en-tête
    const handleHeaderPressIn = useCallback(() => {
      Animated.spring(headerScaleAnim, {
        toValue: 0.98,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, [headerScaleAnim]); // Ajout de headerScaleAnim comme dépendance

    const handleHeaderPressOut = useCallback(() => {
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, [headerScaleAnim]); 

    /**
     * Gestionnaire de changement de mode d'affichage
     */
    const handleDisplayModeChange = useCallback((mode: "card" | "list") => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          200,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
      setDisplayMode(mode);
    }, []);

    /**
     * Défilement automatique vers le haut lors du changement de catégorie
     */
    useEffect(() => {
      if (scrollViewRef.current && isVisible) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    }, [selectedCategory, isVisible]);

    /**
     * Gestionnaire de défilement pour le calcul de la position
     */
    const handleScroll = useCallback(
      (e: { nativeEvent: { contentOffset: { x: number } } }) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        setScrollPosition(offsetX);
      },
      []
    );

    /**
     * Calcul de l'index actuel pour la pagination
     */
    const getCurrentIndex = useCallback(() => {
      return Math.round(scrollPosition / SCREEN_WIDTH);
    }, [scrollPosition]);

    /**
     * Rendu de l'état vide (aucun signalement trouvé)
     */
    const renderEmptyState = useCallback(() => (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateIconContainer}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
        </View>
        <Text style={styles.emptyStateTitle}>
          Aucun signalement trouvé
        </Text>
        <Text style={styles.emptyStateSubtext}>
          Il n'y a pas encore de signalements dans cette catégorie à
          proximité.
        </Text>
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => setSelectedCategory("Tous")}
        >
          <Text style={styles.emptyStateButtonText}>
            Voir tous les signalements
          </Text>
        </TouchableOpacity>
      </View>
    ), [setSelectedCategory]);

    /**
     * Rendu du contenu principal selon l'état de chargement et la disponibilité des données
     */
    const renderContent = useCallback(() => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>
              Chargement des signalements...
            </Text>
          </View>
        );
      } 
      
      if (reports.length === 0) {
        return renderEmptyState();
      }

      return (
        <View style={styles.reportsWrapper}>
          <ScrollView
            ref={scrollViewRef}
            horizontal={displayMode === "card"}
            pagingEnabled={displayMode === "card"}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              displayMode === "list"
                ? styles.reportsListContainer
                : styles.reportsCardContainer
            }
            decelerationRate="fast"
            snapToInterval={
              displayMode === "card" ? SCREEN_WIDTH : undefined
            }
            snapToAlignment="center"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {reports.map((report) => (
              <View
                key={report.id}
                style={
                  displayMode === "card"
                    ? styles.cardItemContainer
                    : styles.listItemContainer
                }
              >
                <ReportItem
                  report={report}
                  onPress={onPressReport}
                  typeLabel={getTypeLabel(report.type)}
                  typeColor={typeColors[report.type] || "#0066CC"}
                  backgroundColor={hexToRgba(
                    typeColors[report.type] || "#0066CC",
                    calculateOpacity(report.createdAt, 0.05) + 0.02
                  )}
                  formattedCity={formatCity(report.city)}
                  formattedTime={formatTime(report.createdAt)}
                />
              </View>
            ))}
          </ScrollView>

          {/* Indicateur de pagination optimisé */}
          {reports.length > 1 && displayMode === "card" && (
            <View style={styles.paginationContainer}>
              {reports.map((_, index) => {
                const currentIndex = getCurrentIndex();
                return (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentIndex === index &&
                        styles.activePaginationDot,
                    ]}
                  />
                );
              })}
            </View>
          )}
        </View>
      );
    }, [
      loading, 
      reports, 
      displayMode, 
      handleScroll, 
      getCurrentIndex, 
      renderEmptyState, 
      formatTime, 
      onPressReport
    ]);

    return (
      <View style={styles.container}>
      {/* Conteneur unifié qui englobe le header et le contenu */}
      <View style={[
        styles.unifiedContainer,
        isVisible && styles.unifiedContainerActive
      ]}>
        {/* En-tête avec animation de scale */}
        <Animated.View
          style={[
            styles.headerContainer,
            { 
              transform: [{ scale: headerScaleAnim }],
              backgroundColor: isVisible ? LIGHT_RED_BACKGROUND : '#FFFFFF',
              // Suppression des bordures inférieures quand ouvert
              borderBottomLeftRadius: isVisible ? 0 : 20,
              borderBottomRightRadius: isVisible ? 0 : 20,
            },
          ]}
        >
          <Pressable
            onPress={toggleVisibility}
            onPressIn={handleHeaderPressIn}
            onPressOut={handleHeaderPressOut}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              {/* Icône et titre */}
              <View style={styles.titleContainer}>
                <View style={styles.alertIconContainer}>
                  <MaterialIcons
                    name="notifications"
                    size={32}
                    color="#CC3333"
                  />
                </View>
                <View>
                  <Text style={styles.title}>Signalements</Text>
                  <Text style={styles.subtitle}>
                    Incidents à proximité de vous
                  </Text>
                </View>
              </View>

              {/* Badge de nombre de reports et flèche */}
              <View style={styles.headerControls}>
                {reports.length > 0 && (
                  <Animated.View
                    style={[
                      styles.countBadge,
                      { transform: [{ scale: badgePulse }] },
                    ]}
                  >
                    <Text style={styles.countText}>{reports.length}</Text>
                  </Animated.View>
                )}

                <Animated.View
                  style={[
                    styles.arrowContainer,
                    { transform: [{ rotate: arrowRotation }] },
                  ]}
                >
                  <Text style={styles.arrowIcon}>⌄</Text>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Contenu principal avec hauteur conditionnelle */}
        {isVisible && (
          <Animated.View
            style={[
              styles.contentContainer, 
              { 
                opacity: opacityAnim,
                backgroundColor: LIGHT_RED_BACKGROUND,
                marginTop: 0, // Suppression de la marge pour éviter l'écart
              }
            ]}
          >
            {/* Options et filtres */}
            <View style={styles.filtersContainer}>
              {/* Contrôles d'affichage */}
              <View style={styles.displayControls}>
                <TouchableOpacity
                  style={[
                    styles.displayModeButton,
                    displayMode === "card" && styles.activeDisplayMode,
                  ]}
                  onPress={() => handleDisplayModeChange("card")}
                >
                  <Text style={styles.displayModeIcon}>🗂️</Text>
                  <Text style={styles.displayModeText}>Afficher par cartes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.displayModeButton,
                    displayMode === "list" && styles.activeDisplayMode,
                  ]}
                  onPress={() => handleDisplayModeChange("list")}
                >
                  <Text style={styles.displayModeIcon}>📋</Text>
                  <Text style={styles.displayModeText}>Afficher par liste</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Contenu principal avec chargement/vide/liste de rapports */}
            <View style={styles.contentSection}>
              {renderContent()}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}
);


// Définition de type pour les styles
type ReportsSectionStyles = {
  container: ViewStyle;
  headerContainer: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  titleContainer: ViewStyle;
  alertIconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  headerControls: ViewStyle;
  countBadge: ViewStyle;
  countText: TextStyle;
  arrowContainer: ViewStyle;
  arrowIcon: TextStyle;
  contentContainer: ViewStyle;
  filtersContainer: ViewStyle;
  displayControls: ViewStyle;
  displayModeButton: ViewStyle;
  activeDisplayMode: ViewStyle;
  displayModeIcon: TextStyle;
  displayModeText: TextStyle;
  contentSection: ViewStyle;
  reportsWrapper: ViewStyle;
  reportsCardContainer: ViewStyle;
  reportsListContainer: ViewStyle;
  cardItemContainer: ViewStyle;
  listItemContainer: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  emptyStateContainer: ViewStyle;
  emptyStateIconContainer: ViewStyle;
  emptyStateIcon: TextStyle;
  emptyStateTitle: TextStyle;
  emptyStateSubtext: TextStyle;
  emptyStateButton: ViewStyle;
  emptyStateButtonText: TextStyle;
  paginationContainer: ViewStyle;
  paginationDot: ViewStyle;
  activePaginationDot: ViewStyle;
  unifiedContainer: ViewStyle;
  unifiedContainerActive: ViewStyle;

};

const styles = StyleSheet.create<ReportsSectionStyles>({
  container: {
    marginVertical: 5,
    overflow: "hidden",
  },
  unifiedContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.08)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  unifiedContainerActive: {
    backgroundColor: LIGHT_RED_BACKGROUND,
  },
  headerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20, // Sera modifié conditionnellement
    borderBottomRightRadius: 20, // Sera modifié conditionnellement
    backgroundColor: "#FFFFFF", // La couleur sera remplacée conditionnellement
  },

  header: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(255, 59, 48, 0.3)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: "#CC3333",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#4F566B",
    fontWeight: "bold",
  },
  contentContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },

  filtersContainer: {
  },
  displayControls: {
    flexDirection: "row",
    justifyContent: "center",
  },
  displayModeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    backgroundColor: "rgba(0, 0, 0, 0.03)",
  },
  activeDisplayMode: {
    backgroundColor: "rgba(204, 0, 0, 0.1)",
  },
  displayModeIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  displayModeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  contentSection: {
    minHeight: 150,
    paddingBottom: 10,
  },
  reportsWrapper: {
    flex: 1,
  },
  reportsCardContainer: {
    paddingVertical: 5,
  },
  reportsListContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    paddingVertical: 10,
  },
  cardItemContainer: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  listItemContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 5,
    alignItems: "center",
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0, 102, 204, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16213E",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 280,
    lineHeight: 22,
  },
  emptyStateButton: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 4,
  },
  activePaginationDot: {
    width: 24,
    backgroundColor: "#0066CC",
  },
});

export default ReportsSection;