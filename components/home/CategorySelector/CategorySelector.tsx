// src/components/home/CategorySelector/CategorySelector.tsx
import React, {
  memo,
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReportCategory } from "../ReportsSection/report.types";

// Activer les animations de layout sur Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constantes et configuration
const { width } = Dimensions.get("window");
const ITEM_SIZE = 110;
const ITEM_SPACING = 12;
const ANIMATION_DURATION = 300;

// Configuration des couleurs pour le thème
const THEME = {
  primary: "#3498db",
  primaryDark: "#2980b9",
  secondary: "#F1A636",
  background: "rgba(255, 255, 255, 0.7)",
  backgroundDark: "rgba(239, 241, 245, 0.85)",
  text: "#2c3e50",
  textLight: "#7f8c8d",
  success: "#27ae60",
  warning: "#f39c12",
  danger: "#e74c3c",
  border: "rgba(255, 255, 255, 0.3)",
  shadow: "rgba(0, 0, 0, 0.1)",
  accent: "#6366F1",
};

// Couleur de fond harmonisée pour le header et le contenu en état ouvert
const EXPANDED_BACKGROUND = "#FFF3E0";
const COLLAPSED_BACKGROUND = "#FFFFFF";

interface CategoryReportsSectionProps {
  categories: ReportCategory[];
  onCategoryPress: (category: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

/**
 * CategorySelector - Sélecteur de catégories avec style moderne
 *
 * Inspiré du design des stories des réseaux sociaux, avec un header amélioré
 * incluant un badge de comptage pulsant et des animations fluides.
 */
const CategorySelector: React.FC<CategoryReportsSectionProps> = memo(
  ({ categories, onCategoryPress, isVisible, toggleVisibility }) => {
    // Animations et états
    const containerHeight = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(50)).current;
    const headerScaleAnim = useRef(new Animated.Value(1)).current;
    const badgePulse = useRef(new Animated.Value(1)).current;
    const scrollX = useRef(new Animated.Value(0)).current;

    // États locaux
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
      null
    );
    const [animationCompleted, setAnimationCompleted] = useState(false);

    // Récupérer l'objet catégorie sélectionné
    const selectedCategoryObject = categories.find(
      (cat) => cat.name === selectedCategory
    );

    // Compteur pour le badge - nombre de catégories disponibles
    const categoriesCount = categories.length;

    // Animation de pulsation pour le badge
    useEffect(() => {
      if (categoriesCount > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(badgePulse, {
              toValue: 1.2,
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
        ).start();
      }

      // Nettoyage de l'animation lors du démontage du composant
      return () => {
        badgePulse.stopAnimation();
      };
    }, [categoriesCount, badgePulse]);

    // Animation pour ouvrir/fermer la section
    useEffect(() => {
      // Configuration de l'animation de layout
      LayoutAnimation.configureNext({
        duration: ANIMATION_DURATION,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });

      // Animation d'ouverture/fermeture
      setAnimationCompleted(false);

      Animated.parallel([
        Animated.timing(containerHeight, {
          toValue: isVisible ? 280 : 0,
          duration: ANIMATION_DURATION,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(contentOpacity, {
          toValue: isVisible ? 1 : 0,
          duration: ANIMATION_DURATION * 0.8,
          easing: isVisible
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: isVisible ? 0 : 30,
          duration: ANIMATION_DURATION,
          easing: isVisible
            ? Easing.out(Easing.cubic)
            : Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimationCompleted(true);
      });

      // Réinitialiser la sélection lorsque le composant est fermé
      if (!isVisible) {
        setSelectedCategory(null);
      }
    }, [isVisible, containerHeight, contentOpacity, contentTranslateY]);

    // Animation de pression pour le header
    const handleHeaderPressIn = useCallback(() => {
      Animated.timing(headerScaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }, [headerScaleAnim]);

    const handleHeaderPressOut = useCallback(() => {
      Animated.timing(headerScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, [headerScaleAnim]);

    // Gestion de la sélection d'une catégorie
    const handleCategorySelect = useCallback((categoryName: string) => {
      setSelectedCategory((prev) =>
        prev === categoryName ? null : categoryName
      );
    }, []);

    // Confirmation du choix de la catégorie
    const handleConfirmSelection = useCallback(() => {
      if (selectedCategory) {
        onCategoryPress(selectedCategory);
        toggleVisibility();
      }
    }, [selectedCategory, onCategoryPress, toggleVisibility]);

    // Rendu de chaque item de catégorie
    const renderCategoryItem = useCallback(
      ({ item, index }) => {
        const isSelected = item.name === selectedCategory;

        return (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              isSelected && styles.categoryItemSelected,
            ]}
            activeOpacity={0.9}
            onPress={() => handleCategorySelect(item.name)}
          >
            {/* Arrière-plan de la catégorie */}
            <View
              style={[
                styles.categoryBackground,
                { backgroundColor: item.color },
              ]}
            />

            {/* Effet de brillance */}
            <View style={styles.categoryShine} />

            {/* Icône de catégorie */}
            <View style={styles.categoryIconContainer}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={isSelected ? 36 : 32}
                color="#fff"
              />
            </View>

            {/* Libellé de la catégorie */}
            <Text style={styles.categoryLabel} numberOfLines={1}>
              {item.label}
            </Text>

            {/* Indicateur de sélection */}
            {isSelected && (
              <View style={styles.selectionIndicator}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        );
      },
      [selectedCategory, handleCategorySelect]
    );

    // keyExtractor pour la FlatList
    const keyExtractor = useCallback((item: ReportCategory) => item.name, []);

    return (
      <View style={styles.container}>
        {/* Conteneur principal avec position relative pour le z-index */}
        <View style={{ position: "relative", zIndex: 1 }}>
          {/* En-tête de section avec design moderne */}
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
                borderBottomColor: isVisible
                  ? EXPANDED_BACKGROUND
                  : "transparent",
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
                  <View style={styles.iconContainer}>
                    <Ionicons name="apps" size={24} color={THEME.secondary} />
                  </View>
                  <View>
                    <Text style={styles.title}>Catégories</Text>
                    <Text style={styles.subtitle}>
                      Incident classé par catégorie
                    </Text>
                  </View>
                </View>

                {/* Badge de nombre de catégories et flèche */}
                <View style={styles.headerControls}>
                  {categoriesCount > 0 && (
                    <Animated.View
                      style={[
                        styles.countBadge,
                        { transform: [{ scale: badgePulse }] },
                      ]}
                    >
                      <Text style={styles.countText}>{categoriesCount}</Text>
                    </Animated.View>
                  )}

                  <Animated.View
                    style={[
                      styles.arrowContainer,
                      {
                        transform: [{ rotate: isVisible ? "180deg" : "0deg" }],
                      },
                    ]}
                  >
                    <Text style={styles.arrowIcon}>⌄</Text>
                  </Animated.View>
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Contenu de la section */}
          {isVisible && (
            <View
              style={[
                styles.sectionContentContainer,
                {
                  marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
                  borderTopWidth: 0,
                  zIndex: 0,
                },
              ]}
            >
              <LinearGradient
                colors={[EXPANDED_BACKGROUND, "rgba(255, 255, 255, 0.7)"]}
                style={[
                  styles.sectionContent,
                  {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    ...Platform.select({
                      ios: {
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.1,
                      },
                      android: {
                        elevation: 2,
                      },
                    }),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.contentInner,
                    {
                      opacity: contentOpacity,
                      transform: [{ translateY: contentTranslateY }],
                    },
                  ]}
                >
                  {/* Liste défilante des catégories */}
                  <View style={styles.listContainer}>
                    <FlatList
                      data={categories}
                      renderItem={renderCategoryItem}
                      keyExtractor={keyExtractor}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.listContent}
                      snapToInterval={ITEM_SIZE + ITEM_SPACING}
                      snapToAlignment="center"
                      decelerationRate="fast"
                      onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                      )}
                    />
                  </View>

                  {/* Panneau d'information et bouton de confirmation */}
                  {selectedCategoryObject ? (
                    <View style={styles.infoPanel}>
                      <View style={styles.infoPanelHeader}>
                        <View
                          style={[
                            styles.colorIndicator,
                            { backgroundColor: selectedCategoryObject.color },
                          ]}
                        />
                        <Text style={styles.categoryTitle}>
                          {selectedCategoryObject.label}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.confirmButton,
                          { backgroundColor: selectedCategoryObject.color },
                        ]}
                        onPress={handleConfirmSelection}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.confirmText}>Sélectionner</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#fff"
                          style={styles.confirmIcon}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.infoPanelEmpty}>
                      <Ionicons
                        name="information-circle-outline"
                        size={30}
                        color="#8e8e93"
                      />
                      <Text style={styles.placeholderText}>
                        Scroller et sélectionnez une catégorie
                      </Text>
                    </View>
                  )}
                </Animated.View>
              </LinearGradient>
            </View>
          )}
        </View>
      </View>
    );
  }
);

// Styles
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
  },
  // Styles du header inspirés de Chart
  headerContainer: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
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
    borderRadius: 22,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  // Badge de comptage avec animation de pulsation
  countBadge: {
    backgroundColor: THEME.secondary,
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
  // Styles du contenu
  sectionContentContainer: {
    overflow: "hidden",
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 16,
  },
  contentInner: {
    flex: 1,
  },
  listContainer: {
    marginLeft: 16,
    height: 120,
    marginBottom: 16,
  },
  listContent: {},
  // Styles des items de catégorie
  categoryItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: ITEM_SPACING,
    borderRadius: ITEM_SIZE / 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  categoryItemSelected: {
    borderWidth: 2,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  categoryBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: ITEM_SIZE / 2,
  },
  categoryShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderTopLeftRadius: ITEM_SIZE / 2,
    borderTopRightRadius: ITEM_SIZE / 2,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginTop: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectionIndicator: {
    position: "absolute",
    top: 5,
    right: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2ecc71",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  // Styles du panneau d'information
  infoPanel: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoPanelEmpty: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f9f9f9",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8e8e93",
    marginTop: 8,
    textAlign: "center",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  confirmIcon: {
    marginLeft: 4,
  },
});

export default CategorySelector;
