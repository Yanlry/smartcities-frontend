import React from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

interface ChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  loading: boolean;
  nomCommune: string;
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

const Chart: React.FC<ChartProps> = ({ data, loading, nomCommune }) => {
  const barColors = ["#3498db", "#9b59b6", "#f1c40f", "#e74c3c", "#2ecc71"];
  const capitalize = (text: string) => {
    if (!text) return ""; // Gérer les cas où le texte est vide
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  // Formatage du nom de la commune
  const formattedCommune = capitalize(nomCommune);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.title}>Chargement des statistiques...</Text>
      </View>
    );
  }

  if (!data || !data.labels || data.labels.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📊 Statistiques à {formattedCommune}</Text>
        <Text style={styles.subtitle}>
          Il n'y a actuellement aucun signalement dans votre ville. Peut-être
          est-elle parfaite ? Si ce n'est pas le cas, améliorez votre ville et
          soyez le premier à signaler un problème !
        </Text>
      </View>
    );
  }

  const validatedData = data.datasets[0].data.map((value) =>
    typeof value === "number" && !isNaN(value) ? value : 0
  );

  const maxValue = validatedData.length > 0 ? Math.max(...validatedData) : 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Statistiques de {formattedCommune}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    marginVertical: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#535353",
  },
  chart: {
    borderRadius: 16,
    marginLeft: -38,
    backgroundColor: "red",
  },
  subtitle: { fontSize: 14, textAlign: "center", color: "#888", marginVertical: 10 },
});

export default Chart;
