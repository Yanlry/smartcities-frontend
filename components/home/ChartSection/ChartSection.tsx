// Chemin: components/home/ChartSection/Chart.tsx
import React, { useState, useEffect, memo, useCallback, useMemo, useRef } from "react";
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
  DimensionValue,
  ViewStyle,
  Pressable,
  LayoutAnimation
} from "react-native";
import { chartColors } from "../../../utils/reportHelpers";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const CHART_HEIGHT = 220;

// Configuration des couleurs pour le thème - Style harmonisé avec teinte indigo
const THEME = {
  primary: "#F59E0B",    // Ambre/orange
  primaryDark: "#FCD34D", // Ambre foncé
  secondary: "#FCD34D",
  background: "#F9FAFE", // Fond très légèrement bleuté
  backgroundDark: "#ECF0F7", // Fond légèrement plus sombre
  cardBackground: "#FFFFFF", // Blanc pur pour les cartes
  text: "#2D3748", // Texte principal presque noir
  textLight: "#718096", // Texte secondaire gris
  textMuted: "#A0AEC0", // Texte tertiaire gris clair
  border: "#E2E8F0", // Bordures légères
  shadow: "rgba(13, 26, 83, 0.12)", // Ombres avec teinte bleuâtre
};

// Couleur de fond optimisées pour l'état ouvert/fermé
const EXPANDED_BACKGROUND = "rgba(250, 251, 255, 0.97)";
const COLLAPSED_BACKGROUND = "#FFFFFF";

/**
 * Interface pour les props du composant SimpleBarChart
 */
interface SimpleBarChartProps {
  data: number[];
  labels: string[];
  colors: { [key: string]: string };
}

/**
 * Composant pour afficher un graphique en barres avec design amélioré
 */
const SimpleBarChart = memo(({ data, labels, colors }: SimpleBarChartProps) => {
  // Animation des barres
  const barAnimations = useRef(data.map(() => new Animated.Value(0))).current;
  
  // Animer les barres à l'entrée
  useEffect(() => {
    const animations = data.map((_, index) => {
      return Animated.timing(barAnimations[index], {
        toValue: 1,
        duration: 600,
        delay: 100 * index,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      });
    });
    
    Animated.stagger(50, animations).start();
  }, [barAnimations, data]);
  
  // Trouver la valeur maximale pour l'échelle
  const maxValue = Math.max(...data, 1);
  
  return (
    <View style={styles.customChartContainer}>
      <View style={styles.customBarsContainer}>
        {data.map((value, index) => {
          const label = labels[index];
          const barHeight = (value / maxValue) * (CHART_HEIGHT - 40);
          const color = colors[label.toLowerCase()] || THEME.primary;
          
          // Afficher toutes les valeurs à l'intérieur des barres
          // Même les barres les plus petites ont une hauteur minimale de 20px (suffisante pour le texte)
          const showValueInside = true;
          
          return (
            <View key={`bar-${index}`} style={styles.barColumn}>
              {!showValueInside && (
                <View style={styles.barLabelContainer}>
                  <Text style={styles.barValue}>{value}</Text>
                </View>
              )}
              <View style={styles.barWrapper}>
                <Animated.View 
                  style={[
                    styles.bar, 
                    { 
                      height: Math.max(barHeight, 30), // Hauteur minimale augmentée à 30px
                      opacity: barAnimations[index],
                      transform: [
                        { 
                          scaleY: barAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.1, 1]
                          }) 
                        }
                      ],
                      justifyContent: 'center',
                      alignItems: 'center'
                    }
                  ]} 
                >
                  <LinearGradient
                    colors={[color, adjustColor(color, -30)]}
                    style={styles.barGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                  {showValueInside && (
                    <Text style={styles.barValueInside}>{value}</Text>
                  )}
                </Animated.View>
              </View>
              <Text style={styles.barLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

/**
 * Interface pour les props du composant SimplePieChart
 */
interface SimplePieChartProps {
  data: number[];
  labels: string[];
  colors: { [key: string]: string };
}

/**
 * Remplace le composant de camembert par un graphique en barres horizontales
 * Beaucoup plus fiable et précis en React Native pur
 * Affiche toutes les catégories, même celles avec 0 incident
 */
const SimplePieChart = memo(({ data, labels, colors }: SimplePieChartProps) => {
  // Animations
  const barAnimations = useRef(data.map(() => new Animated.Value(0))).current;
  
  // Animer les barres à l'entrée
  useEffect(() => {
    Animated.stagger(100, 
      barAnimations.map(anim => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false, // On ne peut pas animer width avec useNativeDriver
          easing: Easing.out(Easing.cubic),
        })
      )
    ).start();
  }, [barAnimations]);
  
  const total = data.reduce((sum, val) => sum + val, 0);
  
  // Créer des items triés pour un meilleur affichage, sans filtrer les valeurs à 0
  const items = data
    .map((value, index) => ({
      value,
      label: labels[index],
      color: colors[labels[index].toLowerCase()] || THEME.primary,
      percentage: total > 0 ? (value / total) * 100 : 0 // Évite division par zéro
    }))
    .sort((a, b) => b.value - a.value); // Plus grandes valeurs en premier
  
  return (
    <View style={[
      styles.pieChartContainer,
      { height: 'auto', alignItems: 'stretch' }
    ]}>
      {/* Afficher le total au centre */}
      <View style={{
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}>
        <Text style={styles.pieChartTotal}>{total}</Text>
        <Text style={styles.pieChartTotalLabel}>Total</Text>
      </View>
      
      {/* Barres de progression pour chaque segment */}
      {items.map((item, index) => (
        <View key={`bar-${index}`} style={{
          marginVertical: 8,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#f0f0f0'
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12
          }}>
            {/* Indicateur de couleur */}
            <View style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: item.color,
              marginRight: 10
            }} />
            
            {/* Étiquette */}
            <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '600', color: '#444' }}>{item.label}</Text>
              <Text style={{ color: '#666' }}>{item.value} ({Math.round(item.percentage)}%)</Text>
            </View>
          </View>
          
          {/* Barre de progression */}
          <Animated.View 
            style={{
              height: 8,
              backgroundColor: item.color,
              width: barAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', `${total > 0 ? item.percentage : 0}%`]
              })
            }}
          />
        </View>
      ))}
    </View>
  );
});

/**
 * Interface pour les props du composant Chart
 */
interface LocalChartProps {
  data: {
    datasets: { data: number[] }[];
    labels: string[];
  };
  loading: boolean;
  nomCommune: string;
  isVisible?: boolean;
  toggleVisibility?: () => void;
}

/**
 * Fonction utilitaire pour ajuster les couleurs
 */
function adjustColor(color: string, amount: number): string {
  // Si c'est un code hexadécimal, convertir en RGB
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    // Convertir 3 chiffres en 6 chiffres
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Convertir en RGB
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    // Ajuster les valeurs RGB
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    // Reconvertir en hexa
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }
  
  // Si ce n'est pas un hexa, retourner la couleur d'origine
  return color;
}

/**
 * Composant principal pour afficher les différents types de graphiques
 */
const ChartSection = memo(({ data, loading, nomCommune, isVisible = true, toggleVisibility }: LocalChartProps) => {
  // Utiliser la prop isVisible au lieu de l'état local pour respecter la visibilité définie dans HomeScreen
  // État pour le type de graphique
  const [chartType, setChartType] = useState("bar");
  
  // Validez et préparez les données
  const chartData = useMemo(() => {
    const defaultCategories = Object.keys(chartColors).slice(0, 5);
    const inputLabels = data && data.labels ? data.labels : [];
    const inputData = (data && data.datasets && data.datasets[0] && Array.isArray(data.datasets[0].data)) 
                     ? data.datasets[0].data 
                     : [];
    const validData = inputData.map(v => typeof v === "number" && !isNaN(v) ? v : 0);

    const newLabels: string[] = [];
    const newValidData: number[] = [];
    defaultCategories.forEach(cat => {
      const index = inputLabels.findIndex(l => l.toLowerCase() === cat.toLowerCase());
      if (index !== -1) {
        newLabels.push(inputLabels[index]);
        newValidData.push(validData[index]);
      } else {
        newLabels.push(cat);
        newValidData.push(0);
      }
    });
    console.log("Chart processed data:", { chartType, labels: newLabels, validData: newValidData });
    return { validData: newValidData, labels: newLabels };
  }, [data, chartType]);
  
  // Animation pulse et échelle
  const badgePulse = useRef(new Animated.Value(1)).current;
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const contentTranslateY = useRef(new Animated.Value(isVisible ? 0 : 50)).current;
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  
  // Animation de rotation pour la flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  // Animation de pulsation
  useEffect(() => {
    const totalReports = chartData.validData.reduce((sum, v) => sum + v, 0);
    
    if (totalReports > 0) {
      Animated.loop(
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
      ).start();
    }
    
    return () => {
      badgePulse.stopAnimation();
    };
  }, [badgePulse, chartData.validData]);
  
  // Animation lors du changement de visibilité
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
    Animated.timing(contentOpacity, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animation de glissement du contenu
    Animated.timing(contentTranslateY, {
      toValue: isVisible ? 0 : 30,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [isVisible, rotateAnim, contentOpacity, contentTranslateY]);
  
  // Animation du header au toucher
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
  
  // Gestion du toggle de visibilité
  const handleToggleVisibility = useCallback(() => {
    if (toggleVisibility) {
      toggleVisibility();
    }
  }, [toggleVisibility]);
  
  // Affichage pendant le chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }
  
  // Total des signalements
  const totalReports = chartData.validData.reduce((sum, v) => sum + v, 0);
  
  return (
    <View style={styles.container}>
      {/* Conteneur principal avec position relative pour le z-index */}
      <View style={{ position: "relative", zIndex: 1 }}>
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
            onPress={handleToggleVisibility}
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
                  <MaterialIcons
                    name="bar-chart"
                    size={24}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <View>
                  <Text style={styles.title}>Statistiques</Text>
                  <Text style={styles.subtitle}>
                    Nombres d'incidents recensés
                  </Text>
                </View>
              </View>

              {/* Badge de nombre et flèche */}
              <View style={styles.headerControls}>
                {totalReports >= 0 && (
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
                      <Text style={styles.countText}>{totalReports}</Text>
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

        {/* Contenu de la section */}
        {isVisible && (
          <View
            style={styles.sectionContentContainer}
          >
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
                {/* Rendu conditionnel basé sur la présence de données */}
                <View style={styles.contentWrapper}>
                  {/* Graphiques personnalisés avec animations */}
                  <View style={styles.chartWrapper}>
                    {chartType === "bar" ? (
                      <SimpleBarChart 
                        data={chartData.validData}
                        labels={chartData.labels}
                        colors={chartColors}
                      />
                    ) : (
                      <SimplePieChart 
                        data={chartData.validData}
                        labels={chartData.labels}
                        colors={chartColors}
                      />
                    )}
                  </View>
                  
                  {/* Switch button avec design amélioré */}
                  <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setChartType(prev => prev === "bar" ? "pie" : "bar")}
                  >
                    <LinearGradient
                      colors={[THEME.primaryDark, THEME.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.switchButtonGradient}
                    >
                      <MaterialIcons 
                        name={chartType === "bar" ? "dashboard" : "bar-chart"} 
                        size={18} 
                        color="#fff" 
                      />
                      <Text style={styles.switchButtonText}>
                        {chartType === "bar" 
                          ? "Afficher le résumé des incidents" 
                          : "Afficher le diagramme en barres"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </LinearGradient>
          </View>
        )}
      </View>
    </View>
  );
});

// Styles modernes et élégants
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 10,
  },
  // Styles du header harmonisés avec les autres composants
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
  // Styles du contenu
  sectionContentContainer: {
    overflow: "hidden",
    marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
    borderTopWidth: 0,
    zIndex: 0,
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 0,
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
  contentInner: {
    padding: 15,
  },
  contentWrapper: {
    gap: 30,
  },
  chartWrapper: {
    alignItems: 'center',

  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '500',
  },
  customChartContainer: {
    width: '100%',
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  customBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barLabelContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  barValueInside: {
    position: 'absolute',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 10,
  },
  barWrapper: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '90%',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barGradient: {
    width: '100%',
    height: '100%',
  },
  barLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  pieChartContainer: {
    width: 300,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pieChartLegend: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },
  pieChartTotalLabel: {
    fontSize: 12,
    color: '#888',
  },
  switchButton: {
    alignSelf: 'center',
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 15,

  },
  switchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 6,
  },
  emptyStateContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  debugContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    marginTop: 10,
    borderRadius: 6,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ChartSection;