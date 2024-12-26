import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";

export default function ReportScreen({ navigation }) {
  const [reports, setReports] = useState([]);
  const {getUserId} = useToken();

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        // Résolution de la promesse pour récupérer le userId
        const userId = await getUserId();

        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        console.log("ID utilisateur récupéré :", userId);

        // Requête fetch avec le userId
        const response = await fetch(`${API_URL}/reports?userId=${userId}`);
        if (!response.ok) {
          throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        }

        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des rapports :", error);
      }
    };

    fetchUserReports();
  }, [getUserId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate("ReportDetailsScreen", { reportId: item.id })}
    >
      <Text style={styles.reportTitle}>{item.title}</Text>
      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Icon name="chevron-right" size={24} color="#BEE5BF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mes Rapports</Text>
      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.reportsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2C",
    padding: 10,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#BEE5BF",
    textAlign: "center",
    marginBottom: 10,
  },
  reportsList: {
    paddingVertical: 10,
  },
  reportCard: {
    backgroundColor: "#2A2A3B",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#BEE5BF",
    marginBottom: 5,
  },
  reportDescription: {
    fontSize: 14,
    color: "#B0B0C3",
    marginBottom: 10,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportDate: {
    fontSize: 12,
    color: "#6F6F81",
  },
});