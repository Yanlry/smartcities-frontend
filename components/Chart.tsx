import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";

import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

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

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(46, 204, 110, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: { fontSize: 10 },
  propsForBackgroundLines: { strokeWidth: 1, stroke: "#e3e3e3" },
};

const Chart: React.FC<ChartProps> = ({
  data,
  loading,
  nomCommune,
  controlStatsVisibility,
}) => {
  const [isStatsVisible, setStatsVisible] = useState(true);

  const barColors = ["#e74c3c", "#f1c40f", "#9b59b6", "#3498db", "#2ecc71"];
  const capitalize = (text: string) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  const formattedCommune = capitalize(nomCommune);

  useEffect(() => {
    if (controlStatsVisibility !== undefined) {
      setStatsVisible(controlStatsVisibility);
    }
  }, [controlStatsVisibility]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.title}>Chargement des statistiques...</Text>
      </View>
    );
  }

  const validatedData = data.datasets[0].data.map((value) =>
    typeof value === "number" && !isNaN(value) ? value : 0
  );

  const maxValue = validatedData.length > 0 ? Math.max(...validatedData) : 1;

  const toggleStats = () => {
    setStatsVisible((prevState) => !prevState);
  };

  type CategoryReportsScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "CategoryReportsScreen"
  >;

  const generateSummary = () => {
    const navigation = useNavigation<CategoryReportsScreenNavigationProp>();
  
    return data.labels.map((label, index) => {
      const count = validatedData[index] || 0;
      const color = barColors[index % barColors.length];
  
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
  
            console.log(`📌 Navigation vers CategoryReportsScreen avec : ${normalizedCategory}, Ville: ${nomCommune}`);
  
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
              {/* Graphique */}
              <BarChart
                data={{
                  labels: data.labels,
                  datasets: [
                    {
                      data: validatedData,
                      colors: validatedData.map(
                        (_, index) => () => barColors[index % barColors.length]
                      ),
                    },
                  ],
                }}
                width={screenWidth}
                height={290}
                chartConfig={chartConfig}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={true}
                segments={Math.max(1, maxValue)}
                showBarTops={false}
                withCustomBarColorFromData={true}
                flatColor={true}
                style={styles.chart}
              />

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
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#093A3E",
  },
  chart: {
    marginTop: 10,
    borderRadius: 16,
    marginLeft: -20,
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

export default Chart;
