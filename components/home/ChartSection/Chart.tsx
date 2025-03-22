// Modification du composant Chart avec badge pulsant

import React, {
  useState,
  useEffect,
  memo,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  UIManager,
  ViewStyle,
  TextStyle,
  Pressable,
  LayoutAnimation,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { chartColors } from "../../../utils/reportHelpers";
import { ChartProps } from "../ChartSection/chart.types";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

// Configuration de LayoutAnimation pour Android
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Constants
const screenWidth = Dimensions.get("window").width;
const ANIMATION_DURATION = 300;

// Configuration des couleurs pour le thème
const THEME = {
  primary: "#3498db",
  primaryDark: "#2980b9",
  secondary: "#2ecc71",
  background: "rgba(255, 255, 255, 0.7)",
  backgroundDark: "rgba(239, 241, 245, 0.85)",
  text: "#2c3e50",
  textLight: "#7f8c8d",
  success: "#27ae60",
  warning: "#f39c12",
  danger: "#e74c3c",
  border: "rgba(255, 255, 255, 0.3)",
  shadow: "rgba(0, 0, 0, 0.1)",
  accent: "#6366F1", // Ajout d'une couleur d'accent pour harmoniser avec EventsSection
};

// Couleur de fond harmonisée pour le header et le contenu en état ouvert
const EXPANDED_BACKGROUND = "#F0FFF2";
const COLLAPSED_BACKGROUND = "#FFFFFF";

/**
 * Configuration avancée pour les graphiques avec thème glassmorphisme
 */
const chartConfig = {
  backgroundGradientFrom: "#F0FFF2", // Fond légèrement vert (même que EXPANDED_BACKGROUND)
  backgroundGradientTo: "#F8FFF2", // Version plus claire pour un léger dégradé
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  propsForLabels: {
    fontSize: 10,
    fontWeight: "600",
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: "rgba(200, 230, 200, 0.5)", // Lignes de fond légèrement vertes pour s'harmoniser
  },
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  fillShadowGradientOpacity: 0.6,
  strokeWidth: 2, // Épaisseur des lignes pour meilleure visibilité
};

/**
 * Définition de l'interface pour les styles pour éviter les erreurs TypeScript
 */
interface ChartStyles {
  container: ViewStyle;
  headerContainer: ViewStyle;
  header: ViewStyle;
  headerContent: ViewStyle;
  titleContainer: ViewStyle;
  iconContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  headerControls: ViewStyle;
  arrowContainer: ViewStyle;
  arrowIcon: TextStyle;
  sectionContentContainer: ViewStyle;
  sectionContent: ViewStyle;
  loadingContainer: ViewStyle;
  loadingGradient: ViewStyle;
  loadingText: TextStyle;
  emptyStateContainer: ViewStyle;
  emptyStateText: TextStyle;
  emptyStateSubText: TextStyle;
  chartContainer: ViewStyle;
  chartWrapper: ViewStyle;
  chart: ViewStyle;
  switchButtonContainer: ViewStyle;
  switchButton: ViewStyle;
  switchButtonText: TextStyle;
  summaryContainer: ViewStyle;
  summaryTitle: TextStyle;
  summaryList: ViewStyle;
  summaryItem: ViewStyle;
  summaryItemGradient: ViewStyle;
  colorIndicator: ViewStyle;
  summaryText: TextStyle;
  summaryCount: TextStyle;
  // Nouveaux styles pour le badge
  countBadge: ViewStyle;
  countText: TextStyle;
}

/**
 * Composant Chart amélioré avec design glassmorphisme et effet de fusion visuelle
 * quand la section est ouverte.
 *
 * Résout spécifiquement les problèmes de marges horizontales et verticales
 * entre le header et le contenu lorsque la section est ouverte.
 *
 * @param props - Les propriétés du composant
 * @param props.data - Les données à afficher dans le graphique
 * @param props.loading - Indique si les données sont en cours de chargement
 * @param props.nomCommune - Le nom de la commune pour laquelle les données sont affichées
 * @param props.controlStatsVisibility - Permet de contrôler l'état d'ouverture/fermeture depuis le parent
 */
const Chart: React.FC<ChartProps> = memo(
  ({ data, loading, nomCommune, controlStatsVisibility }) => {
    // Hooks et state
    const navigation = useNavigation();
    const [isStatsVisible, setStatsVisible] = useState(true);
    const [chartType, setChartType] = useState<"BarChart" | "PieChart">(
      "BarChart"
    );

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const scaleAnim = useState(new Animated.Value(0.95))[0];
    const rotateAnim = useState(new Animated.Value(0))[0];
    const headerScaleAnim = useRef(new Animated.Value(1)).current;
    const badgePulse = useRef(new Animated.Value(1)).current;

    // Synchronisation avec la propriété de contrôle externe
    useEffect(() => {
      if (controlStatsVisibility !== undefined) {
        setStatsVisible(controlStatsVisibility);
      }
    }, [controlStatsVisibility]);

    // Configuration de LayoutAnimation pour une transition fluide lors du changement d'état d'ouverture
    useEffect(() => {
      // Configuration avancée pour une transition plus douce
      LayoutAnimation.configureNext({
        duration: 300,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.scaleXY,
        },
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
    }, [isStatsVisible]);

    // Animation d'entrée au chargement initial du composant
    useEffect(() => {
      if (!loading) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION + 100,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
        ]).start();
      }
    }, [fadeAnim, scaleAnim, loading]);

    // Validation et normalisation des données du graphique
    const validatedData = useMemo(
      () =>
        data?.datasets?.[0]?.data?.map((value) =>
          typeof value === "number" && !isNaN(value) ? value : 0
        ) || [],
      [data]
    );

    // Total des signalements pour affichage du badge - déplacé ici pour éviter l'erreur
    const totalReports = useMemo(() => {
      return validatedData.reduce((total, value) => total + value, 0);
    }, [validatedData]);

    // Animation pour le toggle du graphique
    useEffect(() => {
      Animated.timing(rotateAnim, {
        toValue: chartType === "BarChart" ? 0 : 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }).start();
    }, [rotateAnim, chartType]);

    // Animation de pulsation pour le badge
    useEffect(() => {
      if (totalReports > 0) {
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
    }, [totalReports, badgePulse]);

    // Ces useMemo ont été déplacés plus haut, donc on les supprime ici
    const maxValue = useMemo(
      () => (validatedData.length > 0 ? Math.max(...validatedData) : 1),
      [validatedData]
    );

    // Fonction pour changer le type de graphique
    const toggleChart = useCallback(() => {
      // Animation de layout pour une transition fluide
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setChartType((prev) => (prev === "BarChart" ? "PieChart" : "BarChart"));
    }, []);

    // Fonction pour afficher/masquer les statistiques
    const toggleStats = useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setStatsVisible((prevState) => !prevState);
    }, []);

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

    // Navigation vers les détails d'une catégorie
    const navigateToCategory = useCallback(
      (label: string) => {
        const removeAccents = (str: string) =>
          str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const normalizedCategory = removeAccents(label.trim().toLowerCase());

        // Typage explicite de l'argument de navigation
        type CategoryScreenParams = {
          category: string;
          city: string;
        };

        (navigation.navigate as (screen: string, params?: any) => void)(
          "CategoryReportsScreen",
          {
            category: normalizedCategory,
            city: nomCommune,
          }
        );
      },
      [navigation, nomCommune]
    );

    // Création des animations pour chaque élément au niveau du composant
    const animatedScales = useMemo(() => {
      // Créer un objet avec une entrée pour chaque label possible
      const scales: { [key: string]: Animated.Value } = {};

      data?.labels?.forEach((label) => {
        scales[label] = new Animated.Value(1);
      });

      return scales;
    }, [data?.labels]);

    // Génération du résumé par catégorie avec effet de pressage
    const generateSummary = useCallback(() => {
      return data?.labels?.map((label, index) => {
        const count = validatedData[index] || 0;
        const color = chartColors[label.toLowerCase()] || "#CCCCCC";

        // Récupération de l'animation pour ce label
        const pressScale = animatedScales[label];

        const onPressIn = () => {
          Animated.spring(pressScale, {
            toValue: 0.97,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        };

        const onPressOut = () => {
          Animated.spring(pressScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
            tension: 40,
          }).start();
        };

        return (
          <TouchableOpacity
            key={label}
            activeOpacity={0.7}
            onPress={() => navigateToCategory(label)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <Animated.View
              style={[
                styles.summaryItem,
                { transform: [{ scale: pressScale }] },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryItemGradient}
              >
                <View
                  style={[styles.colorIndicator, { backgroundColor: color }]}
                />
                <Text style={styles.summaryText}>
                  {label}:{" "}
                  <Text style={styles.summaryCount}>
                    {count} signalement{count > 1 ? "s" : ""}
                  </Text>
                </Text>
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        );
      });
    }, [data?.labels, validatedData, navigateToCategory, animatedScales]);

    // Formatage du nom de la commune avec majuscule
    const formattedCommune = useMemo(
      () =>
        nomCommune
          ? nomCommune.charAt(0).toUpperCase() +
            nomCommune.slice(1).toLowerCase()
          : "",
      [nomCommune]
    );

    // Rotation interpolée pour l'animation de l'icône
    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"],
    });

    // Indicateur de rotation pour la flèche d'expansion
    const arrowRotation = useMemo(
      () => (isStatsVisible ? "180deg" : "0deg"),
      [isStatsVisible]
    );

    // totalReports a été déplacé plus haut dans le code

    // Affichage pendant le chargement
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={["rgba(255,255,255,0.85)", "rgba(255,255,255,0.65)"]}
            style={styles.loadingGradient}
          >
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text style={styles.loadingText}>
              Chargement des statistiques...
            </Text>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {/* 
          Conteneur principal avec un z-index qui garantit que le header reste au-dessus,
          et sans marge qui pourrait causer des problèmes d'alignement
        */}
        <View style={{ position: "relative", zIndex: 1 }}>
          {/* En-tête de section avec design moderne et fusion visuelle quand ouvert */}
          <Animated.View
            style={[
              styles.headerContainer,
              {
                backgroundColor: isStatsVisible
                  ? EXPANDED_BACKGROUND
                  : COLLAPSED_BACKGROUND,
                borderBottomLeftRadius: isStatsVisible ? 0 : 20,
                borderBottomRightRadius: isStatsVisible ? 0 : 20,
                transform: [{ scale: headerScaleAnim }],
                // Ombres uniquement quand fermé
                // Bordure inférieure invisible pour éviter toute ligne de séparation
                borderBottomWidth: isStatsVisible ? 1 : 0,
                borderBottomColor: isStatsVisible
                  ? EXPANDED_BACKGROUND
                  : "transparent",
              },
            ]}
          >
            <Pressable
              onPress={toggleStats}
              onPressIn={handleHeaderPressIn}
              onPressOut={handleHeaderPressOut}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                {/* Icône et titre */}
                <View style={styles.titleContainer}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons
                      name="bar-chart"
                      size={32}
                      color={THEME.secondary}
                    />
                  </View>
                  <View>
                    <Text style={styles.title}>Statistiques</Text>
                    <Text style={styles.subtitle}>
                      Incidents recensés cette année
                    </Text>
                  </View>
                </View>

                {/* Badge de nombre de signalements et flèche */}
                <View style={styles.headerControls}>
                  {totalReports > 0 && (
                    <Animated.View
                      style={[
                        styles.countBadge,
                        { transform: [{ scale: badgePulse }] },
                      ]}
                    >
                      <Text style={styles.countText}>{totalReports}</Text>
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

          {/* 
            Contenu de la section 
            Positionné avec un z-index inférieur et un margin-top négatif pour créer 
            un véritable effet de fusion sans aucune marge visible
          */}
          {isStatsVisible && (
            <View
              style={[
                styles.sectionContentContainer,
                {
                  marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
                  // Pas de bordure supérieure pour une fusion parfaite
                  borderTopWidth: 0,
                  zIndex: 0, // En dessous du header
                },
              ]}
            >
              <LinearGradient
                // Utiliser les mêmes couleurs de départ pour une transition fluide
                colors={[EXPANDED_BACKGROUND, "rgba(255, 255, 255, 0.7)"]}
                style={[
                  styles.sectionContent,
                  {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    // Pas d'ombre supérieure pour éviter les lignes de séparation
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
                {/* Message si aucune donnée n'est disponible */}
                {!data || !data.labels || data.labels.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.emptyStateText}>
                      Il n'y a actuellement aucun signalement dans votre ville.
                      Peut-être est-elle parfaite ?
                    </Text>
                    <Text style={styles.emptyStateSubText}>
                      Si ce n'est pas le cas, améliorez votre ville et soyez le
                      premier à signaler un problème !
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Graphique (barre ou cercle selon le type sélectionné) */}
                    <Animated.View
                      style={[styles.chartContainer, { opacity: fadeAnim }]}
                    >
                      <View style={styles.chartWrapper}>
                        {chartType === "BarChart" ? (
                          <View
                            style={{
                              alignItems: "center",
                              width: "100%",
                              marginRight: 20,
                            }}
                          >
                            <BarChart
                              data={{
                                labels: data.labels,
                                datasets: [
                                  {
                                    data: validatedData,
                                    colors: data.labels.map(
                                      (label) => () =>
                                        chartColors[label.toLowerCase()] ||
                                        "#CCCCCC"
                                    ),
                                  },
                                ],
                              }}
                              width={screenWidth - 30} // Ajustement précis pour éviter les marges
                              height={260}
                              chartConfig={chartConfig}
                              fromZero={true}
                              segments={Math.max(1, maxValue)}
                              withCustomBarColorFromData={true}
                              flatColor={true}
                              style={styles.chart}
                              yAxisLabel=""
                              yAxisSuffix=""
                              withInnerLines={true}
                              showBarTops={false}
                              verticalLabelRotation={0}
                              horizontalLabelRotation={0}
                            />
                          </View>
                        ) : (
                          <View
                            style={{
                              width: "100%",
                              alignItems: "center", // Centrer le graphique
                            }}
                          >
                            <PieChart
                              data={data.labels.map((label, index) => ({
                                name: "",
                                population: validatedData[index] || 0,
                                color:
                                  chartColors[label.toLowerCase()] || "#CCCCCC",
                                legendFontColor: "#7F7F7F",
                                legendFontSize: 12,
                              }))}
                              width={screenWidth - 30} // Même largeur que le BarChart
                              height={220}
                              chartConfig={chartConfig}
                              accessor="population"
                              backgroundColor="transparent"
                              paddingLeft="15" // Ajusté pour centrage
                              absolute={false}
                              hasLegend={false}
                              center={[(screenWidth - 30) / 5, 0]} // Ajustement précis du centrage
                            />
                          </View>
                        )}
                      </View>
                    </Animated.View>

                    {/* Bouton pour changer le type de graphique */}
                    <TouchableOpacity
                      style={styles.switchButtonContainer}
                      onPress={toggleChart}
                      activeOpacity={0.7}
                    >
                      <View style={styles.switchButton}>
                        <Text style={styles.switchButtonText}>
                          {chartType === "BarChart"
                            ? "Afficher en diagramme circulaire"
                            : "Afficher en diagramme en barres"}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Résumé des signalements */}
                    <View style={styles.summaryContainer}>
                      <Text style={styles.summaryTitle}>
                        Légende des signalements
                      </Text>
                      <View style={styles.summaryList}>
                        {generateSummary()}
                      </View>
                    </View>
                  </>
                )}
              </LinearGradient>
            </View>
          )}
        </View>
      </View>
    );
  }
);

// Création des styles avec le typage approprié pour éviter les erreurs TypeScript
const styles = StyleSheet.create<ChartStyles>({
  container: {
    marginVertical: 5,
    marginHorizontal: 0, // Pas de marge horizontale pour le conteneur principal
    position: "relative",
  },
  headerContainer: {
    borderRadius: 20,
    marginHorizontal: 0, // Pas de marge horizontale pour assurer l'alignement
    // Les ombres et bordures inférieures sont définies dynamiquement
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
  // Nouveaux styles pour le badge de comptage
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
  sectionContentContainer: {
    marginHorizontal: 0, // Pas de marge horizontale pour assurer l'alignement parfait
    overflow: "hidden",
    // Le margin-top, z-index et bordures sont définis dynamiquement
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 15,
    // Les ombres et bordures supérieures sont définies dynamiquement
  },
  loadingContainer: {
    marginHorizontal: 0, // Cohérence avec le reste du composant
    marginVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  loadingGradient: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: THEME.text,
    fontWeight: "500",
  },
  emptyStateContainer: {
    paddingVertical: 25,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    color: THEME.text,
    marginBottom: 10,
    fontWeight: "500",
    lineHeight: 22,
  },
  emptyStateSubText: {
    fontSize: 14,
    textAlign: "center",
    color: THEME.textLight,
    lineHeight: 20,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Assure que le conteneur prend toute la largeur disponible
  },
  chartWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent", // Transparent pour se fondre avec le fond parent
    overflow: "hidden",
  },
  chart: {
    marginVertical: 10,
    backgroundColor: "transparent", // Transparent pour se fondre avec le fond parent
  },
  switchButtonContainer: {
    marginBottom: 20,
    alignSelf: "center",
  },
  switchButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  switchButtonText: {
    color: "#3498db",
    fontSize: 14,
    fontWeight: "400",
    textDecorationLine: "underline",
    textDecorationColor: "rgba(52, 152, 219, 0.4)",
  },
  summaryContainer: {
    marginTop: 10,
    marginBottom: 5,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 15,
    color: THEME.text,
    textAlign: "center",
  },
  summaryList: {},
  summaryItem: {
    borderRadius: 50,
    overflow: "hidden",
    backgroundColor: "#FFFFFF", // Fond blanc pur
    marginBottom: 8, // Ajout d'une marge en bas pour séparer les éléments
  },
  summaryItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  colorIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    fontSize: 15,
    color: THEME.text,
    flex: 1,
    fontWeight: "500",
  },
  summaryCount: {
    fontWeight: "700",
    color: THEME.primary,
  },
});

export default Chart;
