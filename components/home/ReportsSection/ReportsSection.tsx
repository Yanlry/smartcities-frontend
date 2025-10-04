// Chemin : frontend/components/home/ReportsSection/ReportsSection.tsx

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
import { Report, ReportCategory } from "../../../types/entities/report.types";
// ✅ CORRECTION : Importer ReportType depuis reportHelpers au lieu de report.types
import { getTypeLabel, typeColors, ReportType } from "../../../utils/reportHelpers";
import { hexToRgba, calculateOpacity } from "../../../utils/reductOpacity";
import { formatCity } from "../../../utils/formatters";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useReportsFilters } from "../../../hooks/reports/useReportsFilters";
import FiltersPanel from "./FiltersPanel";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Activer LayoutAnimation pour Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Configuration des couleurs pour le thème - Style harmonisé avec teinte rouge
const THEME = {
  primary: "#FF4D4F",
  primaryDark: "#E73A3C",
  secondary: "#FF7875",
  background: "#F9FAFE",
  backgroundDark: "#ECF0F7",
  cardBackground: "#FFFFFF",
  text: "#2D3748",
  textLight: "#718096",
  textMuted: "#A0AEC0",
  border: "#E2E8F0",
  shadow: "rgba(13, 26, 83, 0.12)",
};

const EXPANDED_BACKGROUND = "rgba(250, 251, 255, 0.97)";
const COLLAPSED_BACKGROUND = "#FFFFFF";

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
  userCity?: string;
}

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
    userCity = null,
  }) => {
    const {
      filters,
      filteredReports,
      updateFilter,
      resetFilters,
      activeFiltersCount,
    } = useReportsFilters(reports);

    useEffect(() => {
      updateFilter("category", selectedCategory);
    }, [selectedCategory, updateFilter]);

    const handleResetFilters = useCallback(() => {
      resetFilters();
      setSelectedCategory("Tous");
    }, [resetFilters, setSelectedCategory]);

    const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    const headerScaleAnim = useRef(new Animated.Value(1)).current;
    const badgePulse = useRef(new Animated.Value(1)).current;
    const contentSlideAnim = useRef(
      new Animated.Value(isVisible ? 1 : 0)
    ).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const swipeHintAnim = useRef(new Animated.Value(0)).current;

    const [displayMode, setDisplayMode] = useState<"card" | "list">("card");
    const [scrollPosition, setScrollPosition] = useState(0);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [sectionContentLoaded, setSectionContentLoaded] = useState(false);

    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    const contentSlide = contentSlideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-20, 0],
    });

    const swipeIndicatorTranslate = swipeHintAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, 20, 0],
    });

    useEffect(() => {
      if (reports.length > 0) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(badgePulse, {
              toValue: 1.1,
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

        pulseAnimation.start();

        return () => {
          pulseAnimation.stop();
        };
      }
    }, [reports.length, badgePulse]);

    useEffect(() => {
      if (
        isVisible &&
        displayMode === "card" &&
        !hasScrolled &&
        filteredReports.length > 0
      ) {
        const swipeAnimation = Animated.loop(
          Animated.timing(swipeHintAnim, {
            toValue: 2,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.cubic),
          })
        );

        swipeAnimation.start();

        return () => {
          swipeAnimation.stop();
        };
      }
    }, [
      isVisible,
      displayMode,
      hasScrolled,
      filteredReports.length,
      swipeHintAnim,
    ]);

    useEffect(() => {
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });

      Animated.timing(rotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(opacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(contentSlideAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }, [isVisible, rotateAnim, opacityAnim, contentSlideAnim]);

    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          setSectionContentLoaded(true);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setSectionContentLoaded(false);
      }
    }, [isVisible]);

    const handleHeaderPressIn = useCallback(() => {
      Animated.spring(headerScaleAnim, {
        toValue: 0.98,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, [headerScaleAnim]);

    const handleHeaderPressOut = useCallback(() => {
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, [headerScaleAnim]);

    const handleCityFilterChange = useCallback(
      (city: string | null) => {
        if (city === "utilisateur" && userCity) {
          updateFilter("city", userCity);
        } else {
          updateFilter("city", city);
        }
      },
      [updateFilter, userCity]
    );

    const handleChangeSortOrder = useCallback(
      (order: "date" | "distance") => {
        console.log("Changement du mode de tri:", order);
        updateFilter("sortOrder", order);
      },
      [updateFilter]
    );

    const handleDisplayModeChange = useCallback((mode: "card" | "list") => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          200,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
      setDisplayMode(mode);
      setHasScrolled(false);
      setScrollPosition(0);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
      }
    }, []);

    useEffect(() => {
      if (scrollViewRef.current && isVisible) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
        setHasScrolled(false);
      }
    }, [selectedCategory, filters, isVisible]);

    const handleScroll = useCallback(
      (e: { nativeEvent: { contentOffset: { x: number } } }) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        setScrollPosition(offsetX);

        if (!hasScrolled && offsetX > 10) {
          setHasScrolled(true);
        }
      },
      [hasScrolled]
    );

    const getCurrentIndex = useCallback(() => {
      return Math.round(scrollPosition / SCREEN_WIDTH);
    }, [scrollPosition]);

    const renderEmptyState = useCallback(
      () => (
        <View style={styles.emptyStateContainer}>
          <LinearGradient
            colors={["rgba(255, 100, 100, 0.1)", "rgba(255, 75, 75, 0.02)"]}
            style={styles.emptyStateGradient}
          >
            <View style={styles.emptyStateIconContainer}>
              <MaterialIcons name="search-off" size={36} color="#FF4D4F" />
            </View>
            <Text style={styles.emptyStateTitle}>Aucun signalement trouvé</Text>
            <Text style={styles.emptyStateSubtext}>
              {activeFiltersCount > 0
                ? "Aucun signalement ne correspond à vos critères de recherche."
                : "Il n'y a pas encore de signalements dans cette catégorie à proximité."}
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={resetFilters}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[THEME.primary, THEME.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyStateButtonGradient}
              >
                <Text style={styles.emptyStateButtonText}>
                  {activeFiltersCount > 0
                    ? "Réinitialiser les filtres"
                    : "Voir tous les signalements"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ),
      [activeFiltersCount, resetFilters]
    );

    const renderScrollInstructionCard = useCallback(() => {
      return (
        <View style={styles.cardItemContainer}>
          <View style={styles.instructionCardContainer}>
            <LinearGradient
              colors={[EXPANDED_BACKGROUND, "#FFFFFF"]}
              style={styles.instructionCardGradient}
            >
              <View style={styles.instructionCardContent}>
                <View style={styles.instructionIconContainer}>
                  <MaterialIcons name="swipe" size={40} color={THEME.primary} />
                </View>
                <Text style={styles.instructionTitle}>
                  Découvrez les signalements
                </Text>
                <Text style={styles.instructionText}>
                  Faites glisser vers la droite pour consulter les incidents
                  signalés à proximité
                </Text>

                <Animated.View
                  style={[
                    styles.swipeIndicator,
                    {
                      transform: [{ translateX: swipeIndicatorTranslate }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[THEME.primary, THEME.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.swipeIndicatorGradient}
                  >
                    <MaterialIcons
                      name="chevron-right"
                      size={36}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </View>
      );
    }, [swipeIndicatorTranslate]);

    const renderContent = useCallback(() => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>
              Chargement des signalements...
            </Text>
          </View>
        );
      }

      if (filteredReports.length === 0) {
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
            snapToInterval={displayMode === "card" ? SCREEN_WIDTH : undefined}
            snapToAlignment="center"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {displayMode === "card" && renderScrollInstructionCard()}

            {filteredReports.map((report) => (
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
                  typeColor={typeColors[report.type as ReportType] || "#0066CC"}
                  backgroundColor={hexToRgba(
                    typeColors[report.type as ReportType] || "#0066CC",
                    calculateOpacity(report.createdAt, 0.05) + 0.02
                  )}
                  formattedCity={formatCity(report.city)}
                  formattedTime={formatTime(report.createdAt)}
                />
              </View>
            ))}
          </ScrollView>

          {filteredReports.length > 0 && displayMode === "card" && (
            <View style={styles.paginationContainer}>
              <Animated.View
                style={[
                  styles.paginationDot,
                  getCurrentIndex() === 0 && styles.activePaginationDot,
                  {
                    width: getCurrentIndex() === 0 ? 24 : 8,
                    transform: [
                      {
                        scale: getCurrentIndex() === 0 ? 1 : 0.8,
                      },
                    ],
                  },
                ]}
              />
              {filteredReports.map((_, index) => {
                const isActive = getCurrentIndex() === index + 1;
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.paginationDot,
                      isActive && styles.activePaginationDot,
                      {
                        width: isActive ? 24 : 8,
                        transform: [
                          {
                            scale: isActive ? 1 : 0.8,
                          },
                        ],
                      },
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
      filteredReports,
      displayMode,
      handleScroll,
      getCurrentIndex,
      renderEmptyState,
      renderScrollInstructionCard,
      formatTime,
      onPressReport,
    ]);

    return (
      <View style={styles.container}>
        <View style={{ position: "relative", zIndex: 1 }}>
          <Animated.View
            style={[
              styles.headerContainer,
              {
                backgroundColor: isVisible
                  ? EXPANDED_BACKGROUND
                  : COLLAPSED_BACKGROUND,
                borderBottomLeftRadius: isVisible ? 0 : 20,
                borderBottomRightRadius: isVisible ? 0 : 20,
                transform: [{ scale: headerScaleAnim }],
                borderBottomWidth: isVisible ? 1 : 0,
                borderBottomColor: isVisible ? THEME.border : "transparent",
                elevation: isVisible ? 5 : 2,
                shadowOpacity: isVisible ? 0.06 : 0.08,
              },
            ]}
          >
            <Pressable
              onPress={toggleVisibility}
              onPressIn={handleHeaderPressIn}
              onPressOut={handleHeaderPressOut}
              style={styles.header}
              android_ripple={{
                color: "rgba(0, 0, 0, 0.05)",
                borderless: true,
              }}
            >
              <View style={styles.headerContent}>
                <View style={styles.titleContainer}>
                  <LinearGradient
                    colors={[THEME.primary, THEME.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                  >
                    <MaterialIcons
                      name="notifications"
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
                  <View>
                    <Text style={styles.title}>Signalements</Text>
                    <Text style={styles.subtitle}>
                      {activeFiltersCount > 0
                        ? `${filteredReports.length} signalement${
                            filteredReports.length > 1 ? "s" : ""
                          } filtré${filteredReports.length > 1 ? "s" : ""}`
                        : "Incidents à proximité de vous"}
                    </Text>
                  </View>
                </View>

                <View style={styles.headerControls}>
                  {reports.length > 0 && (
                    <Animated.View
                      style={[
                        styles.countBadge,
                        { transform: [{ scale: badgePulse }] },
                      ]}
                    >
                      <LinearGradient
                        colors={[THEME.secondary, THEME.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.countBadgeGradient}
                      >
                        <Text style={styles.countText}>
                          {filteredReports.length}
                        </Text>
                      </LinearGradient>
                    </Animated.View>
                  )}

                  <Animated.View
                    style={[
                      styles.arrowContainer,
                      {
                        transform: [
                          { rotate: arrowRotation },
                          { scale: isVisible ? 1.1 : 1 },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isVisible
                          ? [THEME.primary, THEME.primaryDark]
                          : ["#A0AEC0", "#718096"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.arrowIndicator}
                    >
                      <Text style={styles.arrowIcon}>⌄</Text>
                    </LinearGradient>
                  </Animated.View>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {isVisible && (
            sectionContentLoaded ? (
              <View style={styles.sectionContentContainer}>
                <LinearGradient
                  colors={[EXPANDED_BACKGROUND, "#FFFFFF"]}
                  style={styles.sectionContent}
                >
                  <Animated.View
                    style={[
                      styles.contentInner,
                      {
                        opacity: opacityAnim,
                        transform: [{ translateY: contentSlide }],
                      },
                    ]}
                  >
                    <FiltersPanel
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                      userCity={userCity}
                      selectedCity={filters.city}
                      onSelectCity={handleCityFilterChange}
                      sortOrder={filters.sortOrder}
                      onChangeSortOrder={handleChangeSortOrder}
                      activeFiltersCount={activeFiltersCount}
                      onResetFilters={handleResetFilters}
                    />

                    <View style={styles.filtersContainer}>
                      <View style={styles.displayControls}>
                        <TouchableOpacity
                          style={[
                            styles.displayModeButton,
                            displayMode === "card" && styles.activeDisplayMode,
                          ]}
                          onPress={() => handleDisplayModeChange("card")}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons
                            name="view-carousel"
                            size={18}
                            color={
                              displayMode === "card" ? THEME.primary : "#666"
                            }
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.displayModeText,
                              displayMode === "card" &&
                                styles.activeDisplayModeText,
                            ]}
                          >
                            Vue cartes
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.displayModeButton,
                            displayMode === "list" && styles.activeDisplayMode,
                          ]}
                          onPress={() => handleDisplayModeChange("list")}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons
                            name="view-list"
                            size={18}
                            color={
                              displayMode === "list" ? THEME.primary : "#666"
                            }
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.displayModeText,
                              displayMode === "list" &&
                                styles.activeDisplayModeText,
                            ]}
                          >
                            Vue liste
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.contentSection}>{renderContent()}</View>
                  </Animated.View>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={THEME.primary} />
              </View>
            )
          )}
        </View>
      </View>
    );
  }
);

type ReportsSectionStyles = {
  container: ViewStyle;
  unifiedContainer: ViewStyle;
  unifiedContainerActive: ViewStyle;
  headerContainer: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  titleContainer: ViewStyle;
  iconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  headerControls: ViewStyle;
  countBadge: ViewStyle;
  countBadgeGradient: ViewStyle;
  countText: TextStyle;
  arrowContainer: ViewStyle;
  arrowIndicator: ViewStyle;
  arrowIcon: TextStyle;
  contentContainer: ViewStyle;
  sectionContentContainer: ViewStyle;
  sectionContent: ViewStyle;
  contentInner: ViewStyle;
  filtersContainer: ViewStyle;
  displayControls: ViewStyle;
  displayModeButton: ViewStyle;
  activeDisplayMode: ViewStyle;
  displayModeIcon: TextStyle;
  displayModeText: TextStyle;
  activeDisplayModeText: TextStyle;
  contentSection: ViewStyle;
  reportsWrapper: ViewStyle;
  reportsCardContainer: ViewStyle;
  reportsListContainer: ViewStyle;
  cardItemContainer: ViewStyle;
  listItemContainer: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  emptyStateContainer: ViewStyle;
  emptyStateGradient: ViewStyle;
  emptyStateIconContainer: ViewStyle;
  emptyStateIcon: TextStyle;
  emptyStateTitle: TextStyle;
  emptyStateSubtext: TextStyle;
  emptyStateButton: ViewStyle;
  emptyStateButtonGradient: ViewStyle;
  emptyStateButtonText: TextStyle;
  paginationContainer: ViewStyle;
  paginationDot: ViewStyle;
  activePaginationDot: ViewStyle;
  instructionCardContainer: ViewStyle;
  instructionCardGradient: ViewStyle;
  instructionCardContent: ViewStyle;
  instructionIconContainer: ViewStyle;
  instructionTitle: TextStyle;
  instructionText: TextStyle;
  swipeIndicator: ViewStyle;
  swipeIndicatorGradient: ViewStyle;
  loaderContainer: ViewStyle;
};

const styles = StyleSheet.create<ReportsSectionStyles>({
  container: {
    marginVertical: 5,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 10,
  },
  headerContainer: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
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
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textLight,
    letterSpacing: -0.2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: THEME.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countBadgeGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  arrowIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: -10,
  },
  unifiedContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  unifiedContainerActive: {},
  contentContainer: {
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  sectionContentContainer: {
    overflow: "hidden",
    marginTop: -1,
    borderTopWidth: 0,
    zIndex: 0,
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentInner: {},
  filtersContainer: {},
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
    backgroundColor: `rgba(${parseInt(
      THEME.primary.slice(1, 3),
      16
    )}, ${parseInt(THEME.primary.slice(3, 5), 16)}, ${parseInt(
      THEME.primary.slice(5, 7),
      16
    )}, 0.1)`,
  },
  displayModeIcon: {
    marginRight: 6,
  },
  displayModeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  activeDisplayModeText: {
    color: THEME.primary,
    fontWeight: "600",
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
    alignSelf: "center",
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
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateGradient: {
    width: "100%",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "rgba(255, 77, 79, 0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyStateIcon: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 280,
    lineHeight: 22,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EAEAEA",
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: THEME.primary,
  },
  instructionCardContainer: {
    width: SCREEN_WIDTH - 60,
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  instructionCardGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionCardContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  instructionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 77, 79, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  instructionText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
    maxWidth: 280,
    lineHeight: 20,
  },
  swipeIndicator: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: "hidden",
    marginBottom: 24,
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  swipeIndicatorGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    padding: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReportsSection;