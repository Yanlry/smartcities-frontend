// src/components/home/CategorySelector/CategorySelector.tsx
import React, {
  memo,
  useEffect,
  useRef,
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
import { Ionicons } from "@expo/vector-icons";
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

// Configuration des couleurs pour le thème - Palette orange-ambre pour les catégories
const THEME = {
  primary: "#7E22CE",    // Pourpre
  primaryDark: "#581C87", // Pourpre foncé
  secondary: "#C084FC",  
  background: "#F9FAFE", 
  backgroundDark: "#ECF0F7", 
  cardBackground: "#FFFFFF", 
  text: "#2D3748", 
  textLight: "#718096", 
  textMuted: "#A0AEC0", 
  success: "#48BB78", 
  warning: "#F6AD55", 
  danger: "#F56565", 
  border: "#E2E8F0", 
  shadow: "rgba(176, 135, 14, 0.12)", 
};

// Couleur de fond optimisées pour l'état ouvert/fermé
const EXPANDED_BACKGROUND = "rgba(250, 251, 255, 0.97)";
const COLLAPSED_BACKGROUND = "#FFFFFF";

interface CategoryReportsSectionProps {
  categories: ReportCategory[];
  onCategoryPress: (category: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

/**
 * Hook pour gérer les animations de visibilité - optimisé pour éviter les rebonds
 */
const useAnimatedVisibility = ({ 
  isVisible, 
  categoriesCount, 
  animationDuration 
}: { 
  isVisible: boolean; 
  categoriesCount: number; 
  animationDuration: number;
}) => {
  // Animations avec useNativeDriver: true
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const tabsFadeAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const contentTranslateY = useRef(new Animated.Value(isVisible ? 0 : 30)).current;

  // Effet pour gérer l'animation du badge
  useEffect(() => {
    if (categoriesCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      badgePulse.stopAnimation();
    };
  }, [categoriesCount, badgePulse]);

  // Effet pour gérer les animations d'entrée/sortie avec easing fluide
  useEffect(() => {
    if (isVisible) {
      // Configuration douce sans rebond pour l'ouverture
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: animationDuration * 0.7,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: animationDuration * 0.8,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tabsFadeAnim, {
          toValue: 1,
          duration: animationDuration * 0.7,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de fermeture fluide
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: animationDuration * 0.5,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 30,
          duration: animationDuration * 0.6,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(tabsFadeAnim, {
          toValue: 0,
          duration: animationDuration * 0.5,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, contentOpacity, contentTranslateY, tabsFadeAnim, animationDuration]);

  // Handlers pour les animations de pression avec timing au lieu de spring
  const handleHeaderPressIn = useCallback(() => {
    Animated.timing(headerScaleAnim, {
      toValue: 0.98,
      duration: 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerScaleAnim]);

  const handleHeaderPressOut = useCallback(() => {
    Animated.timing(headerScaleAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerScaleAnim]);

  return {
    contentOpacity,
    contentTranslateY,
    headerScaleAnim,
    badgePulse,
    tabsFadeAnim,
    handleHeaderPressIn,
    handleHeaderPressOut,
  };
};

/**
 * CategorySelector - Sélecteur de catégories avec style harmonisé
 * 
 * Cette version utilise la même structure de header que MayorInfoSection
 * tout en conservant sa fonctionnalité et couleur spécifique.
 */
const CategorySelector: React.FC<CategoryReportsSectionProps> = memo(
  ({ categories = [], onCategoryPress, isVisible, toggleVisibility }) => {
    // =========================================================================
    // États et références
    // =========================================================================
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [confirmButtonVisible, setConfirmButtonVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(isVisible);

    // Vérification défensive pour s'assurer que categories est toujours un tableau
    const safeCategories = Array.isArray(categories) ? categories : [];

    // Récupérer l'objet catégorie sélectionné
    const selectedCategoryObject = safeCategories.find(
      (cat) => cat.name === selectedCategory
    );

    // Nombre de catégories disponibles
    const categoriesCount = safeCategories.length;
    
    // Référence à la liste pour le scroll
    const flatListRef = useRef<FlatList>(null);

    // Animation de rotation pour la flèche
    const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
    
    // Animation pour le bouton de confirmation
    const confirmButtonScale = useRef(new Animated.Value(1)).current;
    const confirmButtonOpacity = useRef(new Animated.Value(0)).current;
    const shimmerTranslate = useRef(new Animated.Value(-width)).current;
    
    // Hook personnalisé pour gérer les animations de visibilité
    const {
      contentOpacity,
      contentTranslateY,
      headerScaleAnim,
      badgePulse,
      tabsFadeAnim,
      handleHeaderPressIn,
      handleHeaderPressOut
    } = useAnimatedVisibility({
      isVisible,
      categoriesCount,
      animationDuration: ANIMATION_DURATION
    });

    // =========================================================================
    // Gestion des états visuels basés sur isVisible
    // =========================================================================
    useEffect(() => {
      if (isVisible !== isExpanded) {
        // Configurer l'animation de layout sans rebond
        LayoutAnimation.configureNext({
          duration: ANIMATION_DURATION,
          update: { type: LayoutAnimation.Types.easeInEaseOut },
          create: { 
            type: LayoutAnimation.Types.easeInEaseOut, // Remplacer spring par easeInEaseOut
            property: LayoutAnimation.Properties.opacity,
          },
          delete: { 
            type: LayoutAnimation.Types.easeInEaseOut, // Remplacer spring par easeInEaseOut
            property: LayoutAnimation.Properties.opacity,
          },
        });
        
        setIsExpanded(isVisible);
        
        if (!isVisible) {
          setSelectedCategory(null);
          setConfirmButtonVisible(false);
        }
      }
    }, [isVisible, isExpanded]);

    // =========================================================================
    // Animation de l'icône de flèche - sans rebond
    // =========================================================================
    useEffect(() => {
      // Animation de rotation de la flèche avec easing fluide
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: ANIMATION_DURATION * 0.7,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [isVisible, rotateAnim]);

    // Animation de rotation pour l'icône de flèche
    const arrowRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });

    // =========================================================================
    // Animation de shimmer
    // =========================================================================
    useEffect(() => {
      if (isVisible) {
        Animated.loop(
          Animated.timing(shimmerTranslate, {
            toValue: width,
            duration: 1500,
            easing: Easing.ease,
            useNativeDriver: true,
          })
        ).start();
      } else {
        shimmerTranslate.setValue(-width);
      }
      
      return () => {
        shimmerTranslate.stopAnimation();
      };
    }, [isVisible, shimmerTranslate, width]);

    // =========================================================================
    // Gestion de la sélection d'une catégorie
    // =========================================================================
    const handleCategorySelect = useCallback((categoryName: string) => {
      const isNewSelection = categoryName !== selectedCategory;
      
      // Mettre à jour la sélection
      setSelectedCategory(prev => prev === categoryName ? null : categoryName);
      
      // Afficher/masquer le bouton de confirmation
      if (isNewSelection && categoryName !== null) {
        setConfirmButtonVisible(true);
        // Animation d'apparition du bouton de confirmation
        Animated.sequence([
          Animated.timing(confirmButtonOpacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(confirmButtonOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start();
      } else if (categoryName === null) {
        setConfirmButtonVisible(false);
      }
    }, [selectedCategory, confirmButtonOpacity]);

    // =========================================================================
    // Animation du bouton de confirmation - sans rebond
    // =========================================================================
    const handleConfirmPressIn = useCallback(() => {
      Animated.timing(confirmButtonScale, {
        toValue: 0.95,
        duration: 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [confirmButtonScale]);

    const handleConfirmPressOut = useCallback(() => {
      Animated.timing(confirmButtonScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [confirmButtonScale]);

    // =========================================================================
    // Confirmation du choix de la catégorie
    // =========================================================================
    const handleConfirmSelection = useCallback(() => {
      if (selectedCategory) {
        Animated.sequence([
          Animated.timing(confirmButtonScale, {
            toValue: 0.95,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(confirmButtonScale, {
            toValue: 1.05,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(confirmButtonScale, {
            toValue: 1,
            duration: 100,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onCategoryPress(selectedCategory);
          toggleVisibility();
        });
      }
    }, [selectedCategory, onCategoryPress, toggleVisibility, confirmButtonScale]);

    // =========================================================================
    // Gestion du scroll
    // =========================================================================
    const handleScroll = useCallback((event) => {
      const position = event.nativeEvent.contentOffset.x;
      setScrollPosition(position);
    }, []);

    // =========================================================================
    // Fonction utilitaire pour ajuster les couleurs
    // =========================================================================
    function adjustColor(color: string, amount: number): string {
      if (color.startsWith('#')) {
        let hex = color.slice(1);
        if (hex.length === 3) {
          hex = hex.split('').map(char => char + char).join('');
        }
        
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        
        const newR = Math.max(0, Math.min(255, r + amount));
        const newG = Math.max(0, Math.min(255, g + amount));
        const newB = Math.max(0, Math.min(255, b + amount));
        
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
      }
      
      return color;
    }

    // =========================================================================
    // Rendu des items de catégorie
    // =========================================================================
    const renderCategoryItem = useCallback(
      ({ item, index }) => {
        const isSelected = item.name === selectedCategory;
        
        // Calcul manuel des transformations basées sur la position de scroll
        const itemCenter = index * (ITEM_SIZE + ITEM_SPACING) + ITEM_SIZE / 2;
        const distance = Math.abs(scrollPosition - itemCenter + ITEM_SIZE / 2);
        const maxDistance = ITEM_SIZE * 1.5;
        
        // Calcul des valeurs transformées pour l'échelle et l'opacité
        const scale = isSelected ? 1.05 : Math.max(0.95, 1 - (distance / maxDistance) * 0.1);
        const opacity = isSelected ? 1 : Math.max(0.7, 1 - (distance / maxDistance) * 0.3);

        return (
          <Animated.View style={{ 
            opacity, 
            transform: [{ scale }],
            marginRight: ITEM_SPACING
          }}>
            <TouchableOpacity
              style={[
                styles.categoryItem,
                isSelected && styles.categoryItemSelected,
              ]}
              activeOpacity={0.9}
              onPress={() => handleCategorySelect(item.name)}
            >
              {/* Arrière-plan de la catégorie avec dégradé */}
              <LinearGradient
                colors={isSelected ? 
                  [item.color, adjustColor(item.color, -20)] : 
                  [item.color, adjustColor(item.color, -40)]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryBackground}
              />

              {/* Effet de shimmer amélioré */}
              <Animated.View 
                style={[
                  styles.categoryShine,
                  {
                    transform: [{ translateX: shimmerTranslate }]
                  }
                ]} 
              />

              {/* Icône de catégorie avec conteneur arrondi */}
              <View style={[
                styles.categoryIconContainer,
                isSelected && styles.categoryIconContainerSelected,
              ]}>
                <Ionicons
                  name={item.icon as keyof typeof Ionicons.glyphMap}
                  size={isSelected ? 36 : 30}
                  color="#fff"
                  style={styles.categoryIcon}
                />
              </View>

              {/* Libellé de la catégorie */}
              <Text style={[
                styles.categoryLabel,
                isSelected && styles.categoryLabelSelected
              ]} numberOfLines={1}>
                {item.label}
              </Text>

              {/* Indicateur de sélection */}
              {isSelected && (
                <View style={styles.selectionIndicator}>
                  <LinearGradient
                    colors={["#53F39C", "#38D67E"]}
                    style={styles.selectionIndicatorGradient}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </LinearGradient>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      },
      [selectedCategory, handleCategorySelect, shimmerTranslate, scrollPosition]
    );

    // keyExtractor pour la FlatList
    const keyExtractor = useCallback((item: ReportCategory) => item.name, []);

    // =========================================================================
    // Rendu du composant avec un header dans le style de MayorInfoSection
    // =========================================================================
    return (
      <View style={styles.container}>
        {/* Conteneur principal avec position relative pour le z-index */}
        <View style={styles.relativeContainer}>
          {/* En-tête de section avec design harmonisé */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                backgroundColor: isVisible ? EXPANDED_BACKGROUND : COLLAPSED_BACKGROUND,
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
              android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: true }}
            >
              <View style={styles.headerContent}>
                {/* Icône et titre */}
                <View style={styles.titleContainer}>
                  <LinearGradient
                    colors={[THEME.primary, THEME.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconContainer}
                  >
                    <Ionicons
                      name="apps"
                      size={24}
                      color="#FFFFFF"
                    />
                  </LinearGradient>
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
                      <LinearGradient
                        colors={[THEME.secondary, THEME.primary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.countBadgeGradient}
                      >
                        <Text style={styles.countText}>{categoriesCount}</Text>
                      </LinearGradient>
                    </Animated.View>
                  )}

                  <Animated.View
                    style={[
                      styles.arrowContainer,
                      {
                        transform: [
                          { rotate: arrowRotation },
                          { scale: isVisible ? 1.1 : 1 }
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={isVisible ? 
                        [THEME.primary, THEME.primaryDark] : 
                        ['#A0AEC0', '#718096']}
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

          {/* Contenu de la section - rendu conditionnel */}
          {isVisible && (
            <View style={styles.sectionContentContainer}>
              <LinearGradient
                colors={[EXPANDED_BACKGROUND, "#FFFFFF"]}
                style={styles.sectionContent}
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
                      ref={flatListRef}
                      data={safeCategories}
                      renderItem={renderCategoryItem}
                      keyExtractor={keyExtractor}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.listContent}
                      snapToInterval={ITEM_SIZE + ITEM_SPACING}
                      snapToAlignment="center"
                      decelerationRate="fast"
                      onScroll={handleScroll}
                      scrollEventThrottle={16}
                    />
                  </View>

                  {/* Panneau d'information et bouton de confirmation */}
                  {selectedCategoryObject && confirmButtonVisible ? (
                    <Animated.View 
                      style={[
                        styles.infoPanel,
                        { opacity: confirmButtonOpacity }
                      ]}
                    >
                      <View style={styles.infoPanelHeader}>
                        <LinearGradient
                          colors={[selectedCategoryObject.color, adjustColor(selectedCategoryObject.color, -20)]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.colorIndicator}
                        />
                        <Text style={styles.categoryTitle}>
                          {selectedCategoryObject.label}
                        </Text>
                      </View>

                      <Animated.View style={{ transform: [{ scale: confirmButtonScale }] }}>
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={handleConfirmSelection}
                          onPressIn={handleConfirmPressIn}
                          onPressOut={handleConfirmPressOut}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={[selectedCategoryObject.color, adjustColor(selectedCategoryObject.color, -30)]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.confirmButtonGradient}
                          >
                            <Text style={styles.confirmText}>Sélectionner</Text>
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color="#fff"
                              style={styles.confirmIcon}
                            />
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    </Animated.View>
                  ) : (
                    <View style={styles.infoPanelEmpty}>
                      <LinearGradient
                        colors={["#ECF0F7", "#F9FAFE"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.emptyPanelGradient}
                      >
                        <Ionicons
                          name="information-circle-outline"
                          size={30}
                          color={THEME.textMuted}
                          style={styles.infoIcon}
                        />
                        <Text style={styles.placeholderText}>
                          Scroller et sélectionnez une catégorie
                        </Text>
                      </LinearGradient>
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

// Styles harmonisés avec MayorInfoSection
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 10,
  },
  relativeContainer: {
    position: "relative", 
    zIndex: 1
  },
  // Header styles harmonisés avec MayorInfoSection
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
  // Badge de comptage avec animation de pulsation et dégradé
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
  
  // Styles du contenu harmonisés avec MayorInfoSection
  sectionContentContainer: {
    overflow: "hidden",
    marginTop: -1,
    borderTopWidth: 0,
    zIndex: 0,
    height: 280,
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: '100%',
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
  contentInner: {
    paddingHorizontal: 15,
    flex: 1,
  },
  
  // Styles spécifiques au CategorySelector préservés
  listContainer: {
    marginLeft: 16,
    height: 120,
    marginBottom: 16,
  },
  listContent: {
    paddingRight: 16,
    paddingLeft: 4,
  },
  categoryItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  categoryItemSelected: {
    borderWidth: 2,
    borderColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  categoryBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  categoryShine: {
    position: "absolute",
    top: 0,
    left: -100,
    width: 60,
    height: "120%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ skewX: "-20deg" }],
  },
  categoryIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  categoryIconContainerSelected: {
    width: 56,
    height: 56,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  categoryIcon: {
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginTop: 6,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "center",
    paddingHorizontal: 4,
  },
  categoryLabelSelected: {
    fontSize: 13,
    fontWeight: "700",
  },
  selectionIndicator: {
    position: "absolute",
    top: 5,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  selectionIndicatorGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  infoPanel: {
    marginHorizontal: 16,
    padding: 0,
    borderRadius: 20,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
  },
  infoPanelEmpty: {
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "transparent",
    overflow: "hidden",
    height: 70,
  },
  emptyPanelGradient: {
    width: "100%",
    height: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  infoPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    flex: 1,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.text,
    flex: 1,
  },
  infoIcon: {
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: "500",
    color: THEME.textMuted,
    textAlign: "center",
  },
  confirmButton: {
    overflow: "hidden",
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  confirmButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.3,
  },
  confirmIcon: {
    marginLeft: 5,
  },
});

export default CategorySelector;