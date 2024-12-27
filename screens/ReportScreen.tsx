import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/useToken";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";

export default function ReportScreen({ navigation }) {
  const { unreadCount } = useNotification();
  const [reports, setReports] = useState<{ id: number; title: string; description: string; createdAt: string }[]>([]);
  const { getUserId } = useToken();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const userId = await getUserId();
        if (!userId) {
          console.error("Impossible de récupérer l'ID utilisateur.");
          return;
        }

        console.log("ID utilisateur récupéré :", userId);
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
  }, []);


  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ReportDetailsScreen', { reportId: item.id })
        }
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
      {/* Bouton de suppression */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Icon name="delete" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const deleteReport = async (reportId) => {
    try {
      const response = await fetch(`${API_URL}/reports/${reportId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du signalement.');
      }
  
      // Supprimer localement le signalement de la liste
      setReports((prevReports) =>
        prevReports.filter((report) => report.id !== reportId)
      );
    } catch (error) {
      console.error('Erreur lors de la suppression du signalement :', error);
    }
  };

  const confirmDelete = (reportId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Voulez-vous vraiment supprimer ce signalement ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: () => deleteReport(reportId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={28}
            color="#BEE5BF" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadgeNav}>
          <Text style={styles.headerTitleNav}>MES SIGNALEMENTS</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={28}
              color={unreadCount > 0 ? "#BEE5BF" : "#BEE5BF"}
              style={{ marginRight: 10 }}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {reports.length === 0 ? (
        <View style={styles.noReportsContainer}>
          <Text style={styles.noReportsText}>Aucun signalement trouvé.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.reportsList}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,    
    backgroundColor: "#F8F9FA",

  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#29524A", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 26,
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
  noReportsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReportsText: {
    fontSize: 18,
    color: "#000",
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
});