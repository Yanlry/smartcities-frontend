import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

interface ChartProps {
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 0, // Pas de décimales
  color: (opacity = 1) => `rgba(46, 204, 110, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForLabels: {
    fontSize: 10, // Réduire la taille des labels ici
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: "#e3e3e3",

  },
};

const Chart: React.FC<ChartProps> = ({ data }) => {
  // Couleurs personnalisées pour chaque catégorie
  const barColors = ["#3498db", "#9b59b6", "#f1c40f", "#e74c3c", "#2ecc71"]; // Couleurs personnalisées

  // Déterminer le maximum des données pour configurer les segments
  const maxValue = Math.max(...data.datasets[0].data);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Statistiques du mois</Text>
      <BarChart
        data={{
          labels: data.labels,
          datasets: [
            {
              data: data.datasets[0].data,
              colors: data.datasets[0].data.map((_, index) => () => barColors[index % barColors.length]),
            },
          ],
        }}
        width={screenWidth}
        height={290}
        chartConfig={chartConfig}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero={true} // Partir de zéro
        segments={maxValue} // Affiche des segments de 1 en 1
        showBarTops={false} // Supprimer les bordures des barres si nécessaire
        withCustomBarColorFromData={true} // Activer l'option de couleurs personnalisées
        flatColor={true} // Applique directement les couleurs
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#29524A",

  },
  chart: {
    borderRadius: 16,
    marginLeft: -38,
    backgroundColor: "red",
  },
});

export default Chart;
