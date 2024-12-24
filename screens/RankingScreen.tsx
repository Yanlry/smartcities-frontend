import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/Sidebar";

const RankingScreen = ({ navigation }) => {
  interface User {
    id: number;
    ranking: number;
    photo?: string;
    useFullName?: boolean;
    firstName?: string;
    lastName?: string;
    username?: string;
    nomCommune?: string;
  }

  const [rankingData, setRankingData] = useState<User[]>([]);
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { unreadCount } = useNotification(); // Récupération du compteur

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = await getUserIdFromToken(); // Remplace par ta méthode pour récupérer l'ID utilisateur
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur.");
        }

        const userResponse = await fetch(`${API_URL}/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error("Impossible de récupérer les données utilisateur.");
        }
        const userData = await userResponse.json();

        const cityName = userData.nomCommune;
        if (!cityName) {
          throw new Error("La ville de l'utilisateur est introuvable.");
        }
        setCityName(userData.nomCommune);
        const rankingResponse = await fetch(
          `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
            cityName
          )}`
        );
        if (!rankingResponse.ok) {
          throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
        }

        const rankingData = await rankingResponse.json();
        setRankingData(rankingData.users);
        setUserRanking(rankingData.ranking);
        setTotalUsers(rankingData.totalUsers);
      } catch (error) {
        console.error("Erreur lors de la récupération du classement :", error);
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
          <Text style={styles.headerTitleNav}>CLASSEMENT</Text>
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
      <View style={styles.header}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Bienvenue à 
            <Text style={styles.highlight}> {cityName || "Ville inconnue"}</Text>
          </Text>
        </View>
        <Text style={styles.subtitle}>
          Vous êtes classé numéro{" "}
          <Text style={styles.highlight}>{userRanking || "N/A"}</Text> parmi{" "}
          {totalUsers || "N/A"} utilisateurs.
        </Text>
      </View>

      <FlatList
  data={rankingData}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => {
    const isTopThree = item.ranking <= 3;
    const badgeColor =
      item.ranking === 1
        ? "#FFD700"
        : item.ranking === 2
        ? "#C0C0C0"
        : "#CD7F32"; // Or, argent, bronze
    const borderColor =
      item.ranking === 1
        ? "#FFD700"
        : item.ranking === 2
        ? "#C0C0C0"
        : "#CD7F32"; // Contours correspondants

    return (
      <TouchableOpacity
        style={[
          styles.rankingItem,
          isTopThree && { borderColor: borderColor, borderWidth: 2 },
        ]}
        onPress={() =>
          navigation.navigate("UserProfileScreen", { userId: item.id })
        }
      >
        {isTopThree && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>
              {item.ranking === 1 ? "🥇" : item.ranking === 2 ? "🥈" : "🥉"}
            </Text>
          </View>
        )}
        <Image
          source={{
            uri: item.photo || "https://via.placeholder.com/150",
          }}
          style={[
            styles.userImage,
            isTopThree && styles.topThreeImage, // Style conditionnel pour agrandir l'image
          ]}
        />
        <View
          style={[
            styles.userInfo,
            isTopThree && styles.topThreeUserInfo, // Style conditionnel pour centrer le texte
          ]}
        >
          <Text style={styles.userName}>
            {item.useFullName
              ? `${item.firstName} ${item.lastName}`
              : item.username || "Utilisateur inconnu"}
          </Text>
          <Text style={styles.userRanking}>
            {isTopThree ? "" : `Classement : ${item.ranking}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }}
/>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
};

export default RankingScreen;

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#FF0000",
    textAlign: "center",
  },
  header: {
    paddingVertical: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
  highlight: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 50,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topThreeImage: {
    width: 70, // Agrandir l'image
    height: 70,
    borderRadius: 35,
  },
  topThreeUserInfo: {
    marginTop: 15, // Centrer le texte
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
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userRanking: {
    fontSize: 14,
    color: "#666",
  },
});
