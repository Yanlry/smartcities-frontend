import React, { useState, useEffect } from "react";
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

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { chartColors } from "../utils/reportHelpers";

const screenWidth = Dimensions.get("window").width;

interface ChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  loading: boolean;
  nomCommune: string;
  controlStatsVisibility?: boolean;
}

type CategoryReportsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "CategoryReportsScreen"
>;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 204, 110, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: { fontSize: 10 },
  propsForBackgroundLines: { strokeWidth: 1, stroke: "#e3e3e3" },
};

export default function Chart({data, loading, nomCommune, controlStatsVisibility}: ChartProps) {
  const navigation = useNavigation<CategoryReportsScreenNavigationProp>();

  const [isStatsVisible, setStatsVisible] = useState(true);
  const [chartType, setChartType] = useState<"BarChart" | "PieChart">(
    "BarChart"
  );

  useEffect(() => {
    if (controlStatsVisibility !== undefined) {
      setStatsVisible(controlStatsVisibility);
    }
  }, [controlStatsVisibility]);

  const toggleChart = () => {
    setChartType((prev) => (prev === "BarChart" ? "PieChart" : "BarChart"));
  };

  const toggleStats = () => {
    setStatsVisible((prevState) => !prevState);
  };

  const generateSummary = () => {
    return data.labels.map((label, index) => {
      const count = validatedData[index] || 0;
      const color = chartColors[label.toLowerCase()] || "#CCCCCC";

      return (
        <TouchableOpacity
          key={label}
          style={styles.summaryItem}
          onPress={() => {
            const removeAccents = (str: string) =>
              str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            const normalizedCategory = removeAccents(
              label.trim().toLowerCase()
            );

            console.log(
              `📌 Navigation vers CategoryReportsScreen avec : ${normalizedCategory}, Ville: ${nomCommune}`
            );

            navigation.navigate("CategoryReportsScreen", {
              category: normalizedCategory,
              city: nomCommune,
            });
          }}
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
  };

  const capitalize = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const formattedCommune = capitalize(nomCommune);

  const validatedData = data.datasets[0].data.map((value) =>
    typeof value === "number" && !isNaN(value) ? value : 0
  );

  const maxValue = validatedData.length > 0 ? Math.max(...validatedData) : 1;

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.title}>Chargement des statistiques...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bouton pour ouvrir/fermer la section */}
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isStatsVisible && { backgroundColor: "#f5f5f5" },
        ]}
        onPress={toggleStats}
        activeOpacity={0.8}
      >
        <Text style={styles.title}> 📊 Statistiques de la ville</Text>
        <Text style={styles.arrow}>{isStatsVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Contenu affiché uniquement si la section est ouverte */}
      {isStatsVisible && (
        <View style={styles.sectionContent}>
          {/* Si aucun signalement, afficher un message */}
          {!data || !data.labels || data.labels.length === 0 ? (
            <Text style={styles.subtitle}>
              Il n'y a actuellement aucun signalement dans votre ville.
              Peut-être est-elle parfaite ? Si ce n'est pas le cas, améliorez
              votre ville et soyez le premier à signaler un problème !
            </Text>
          ) : (
            <>
              {/* Affichage du Graphique */}
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
                  height={290}
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
                  }))}
                  width={screenWidth}
                  height={250}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="50"
                  absolute={false}
                />
              )}
              {/* Bouton pour changer d'affichage */}
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
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#062C41",
  },
  chart: {
    marginTop: 10,
    borderRadius: 16,
    marginLeft: -20,
  },
  switchButton: {
    marginBottom: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#062C41",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,

    borderRadius: 8,
    marginTop: 10,
  },
  sectionHeaderVisible: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  sectionContent: {
    backgroundColor: "#fff",
  },
  arrow: {
    fontSize: 18,
    color: "#666",
  },
  summaryContainer: {
    margin: 10,
    backgroundColor: "#ffffff",
    padding: 20,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryTitle: {
    lineHeight: 24,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 15,
    color: "#34495e",
    lineHeight: 24,
    textAlign: "justify",
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  colorIndicator: {
    marginTop: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
});
