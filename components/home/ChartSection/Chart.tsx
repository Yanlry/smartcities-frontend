// src/components/Chart/Chart.tsx
import React, { useState, useEffect, memo, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import { chartColors } from "../../../utils/reportHelpers";
import { ChartProps } from "../ChartSection/chart.types";

const screenWidth = Dimensions.get("window").width;
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 204, 110, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: { fontSize: 10 },
  propsForBackgroundLines: { strokeWidth: 1, stroke: "#e3e3e3" },
};

const Chart: React.FC<ChartProps> = memo(({ 
  data, 
  loading, 
  nomCommune, 
  controlStatsVisibility 
}) => {
  const navigation = useNavigation();
  const [isStatsVisible, setStatsVisible] = useState(true);
  const [chartType, setChartType] = useState<"BarChart" | "PieChart">("BarChart");

  // Synchroniser l'état de visibilité avec la prop de contrôle externe
  useEffect(() => {
    if (controlStatsVisibility !== undefined) {
      setStatsVisible(controlStatsVisibility);
    }
  }, [controlStatsVisibility]);

  // Valider et formater les données pour le graphique
  const validatedData = data?.datasets?.[0]?.data?.map((value) =>
    typeof value === "number" && !isNaN(value) ? value : 0
  ) || [];

  const maxValue = validatedData.length > 0 ? Math.max(...validatedData) : 1;

  // Fonctions de gestion des interactions
  const toggleChart = useCallback(() => {
    setChartType((prev) => (prev === "BarChart" ? "PieChart" : "BarChart"));
  }, []);

  const toggleStats = useCallback(() => {
    setStatsVisible((prevState) => !prevState);
  }, []);

  // Navigation vers les détails d'une catégorie
// Approche alternative avec un type assertion plus spécifique
const navigateToCategory = useCallback((label: string) => {
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
}, [navigation, nomCommune]);

  // Génération du résumé par catégorie
  const generateSummary = useCallback(() => {
    return data?.labels?.map((label, index) => {
      const count = validatedData[index] || 0;
      const color = chartColors[label.toLowerCase()] || "#CCCCCC";

      return (
        <TouchableOpacity
          key={label}
          style={styles.summaryItem}
          onPress={() => navigateToCategory(label)}
        >
          <View style={[styles.colorIndicator, { backgroundColor: color }]} />
          <Text style={styles.summaryText}>
            {label}:{" "}
            <Text style={{ fontWeight: "bold" }}>
              {count} signalement{count > 1 ? "s" : ""}
            </Text>
          </Text>
        </TouchableOpacity>
      );
    });
  }, [data?.labels, validatedData, navigateToCategory]);

  // Formatage du nom de la commune
  const formattedCommune = nomCommune 
    ? nomCommune.charAt(0).toUpperCase() + nomCommune.slice(1).toLowerCase()
    : "";

  // Affichage pendant le chargement
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête de section */}
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isStatsVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleStats}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>📊 Statistiques de la ville</Text>
        <Text style={styles.arrow}>{isStatsVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Contenu de la section (affiché uniquement si la section est visible) */}
      {isStatsVisible && (
        <View style={styles.sectionContent}>
          {/* Message si aucune donnée n'est disponible */}
          {!data || !data.labels || data.labels.length === 0 ? (
            <Text style={styles.emptyStateText}>
              Il n'y a actuellement aucun signalement dans votre ville.
              Peut-être est-elle parfaite ? Si ce n'est pas le cas, améliorez
              votre ville et soyez le premier à signaler un problème !
            </Text>
          ) : (
            <>
              {/* Graphique (barre ou cercle selon le type sélectionné) */}
              {chartType === "BarChart" ? (
                <BarChart
                  data={{
                    labels: data.labels,
                    datasets: [
                      {
                        data: validatedData,
                        colors: data.labels.map(
                          (label) => () =>
                            chartColors[label.toLowerCase()] || "#CCCCCC"
                        ),
                      },
                    ],
                  }}
                  width={screenWidth}
                  height={260}
                  chartConfig={chartConfig}
                  fromZero={true}
                  segments={Math.max(1, maxValue)}
                  withCustomBarColorFromData={true}
                  flatColor={true}
                  style={styles.chart}
                  yAxisLabel=""
                  yAxisSuffix=""
                />
              ) : (
                <PieChart
                  data={data.labels.map((label, index) => ({
                    name: "",
                    population: validatedData[index] || 0,
                    color: chartColors[label.toLowerCase()] || "#CCCCCC",
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12,
                  }))}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute={false}
                />
              )}
              
              {/* Bouton pour changer le type de graphique */}
              <TouchableOpacity
                style={styles.switchButton}
                onPress={toggleChart}
              >
                <Text style={styles.switchButtonText}>
                  {chartType === "BarChart"
                    ? "Afficher un diagramme circulaire"
                    : "Afficher un diagramme en barres"}
                </Text>
              </TouchableOpacity>
              
              {/* Résumé des signalements */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>
                  Résumé des signalements à {formattedCommune}
                </Text>
                {generateSummary()}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#062C41",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 0, // Changé de isStatsVisible
  },
  sectionHeaderVisible: {
    backgroundColor: "#E0E0E0",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  arrow: {
    fontSize: 16,
    color: "#333",
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 10,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
    marginHorizontal: 10,
    lineHeight: 20,
  },
  chart: {
    marginTop: 5,
    borderRadius: 10,
    alignSelf: "center",
  },
  switchButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#062C41",
    fontWeight: "bold",
    fontSize: 14,
  },
  summaryContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#062C41",
    textAlign: "center",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 2,
  },
  colorIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});

export default Chart;