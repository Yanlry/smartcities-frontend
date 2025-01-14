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
        <ActivityIndicator size="large" color="#093A3E" />
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
        size={24}
        color="#F7F2DE"
        style={{ marginLeft: 10 }}
      />
    </TouchableOpacity>

    {/* Titre de la page */}
    <View style={styles.typeBadgeNav}>
      <Text style={styles.headerTitleNav}>CLASSEMENT</Text>
    </View>

    {/* Bouton de notifications avec compteur */}
    <TouchableOpacity onPress={() => navigation.navigate("NotificationsScreen")}>
      <View>
        <Icon
          name="notifications"
          size={24}
          color={unreadCount > 0 ? "#F7F2DE" : "#F7F2DE"}
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

  {/* FlatList avec le message de bienvenue inclus */}
  <FlatList
  data={rankingData}
  keyExtractor={(item) => item.id.toString()}
  ListHeaderComponent={(
    <View style={styles.header}>
      <Text style={styles.welcomeText}>Bienvenue à</Text>
      <View style={styles.cityContainer}>
        <Text style={styles.cityName}>{cityName || "Ville inconnue"}</Text>
      </View>
      <View style={styles.rankingContainer}>
        <Text style={styles.rankingText}>
          Vous êtes classé <Text style={styles.rankingNumber}>numéro {userRanking || "N/A"}</Text>
        <Text style={styles.rankingText}>
          {" "}parmi <Text style={styles.totalUsers}>{totalUsers || "N/A"}</Text> utilisateurs
        </Text>
        </Text>
      </View>
    </View>
  )}
  renderItem={({ item, index }) => {
    const isTopThree = item.ranking <= 3;
    const badgeColor =
      item.ranking === 1
        ? "#FFD700"
        : item.ranking === 2
        ? "#C0C0C0"
        : "#CD7F32";
    const borderColor =
      item.ranking === 1
        ? "#FFD700"
        : item.ranking === 2
        ? "#C0C0C0"
        : "#CD7F32";

    return (
      <TouchableOpacity
        style={[
          styles.rankingItem,
          isTopThree && { borderColor: borderColor, borderWidth: 2 },
          index === rankingData.length - 1 && { marginBottom: 50 }, // Ajout d'une marge au dernier élément
        ]}
        onPress={() =>
          navigation.navigate("UserProfileScreen", { userId: item.id })
        }
      >
        {isTopThree && (
          <View style={[styles.badgeMedal, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeTextMedal}>
              {item.ranking === 1
                ? "🥇"
                : item.ranking === 2
                ? "🥈"
                : "🥉"}
            </Text>
          </View>
        )}
        <Image
          source={{
            uri: item.photo || "https://via.placeholder.com/150",
          }}
          style={[
            styles.userImage,
            isTopThree && styles.topThreeImage,
          ]}
        />
        <View
          style={[
            styles.userInfo,
            isTopThree && styles.topThreeUserInfo,
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

  {/* Sidebar */}
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
    backgroundColor: "#093A3E", // Couleur sombre
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#093A3E', // Couleur dorée ou autre
    backgroundColor: '#F7F2DE',
    letterSpacing:2,
    fontWeight: 'bold',
    fontFamily: 'Insanibc', // Utilisez le nom de la police que vous avez défini
  },
  typeBadgeNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -7,
    right: 2,
    backgroundColor: "red",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
    width: "100%",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 4, // Ombre pour Android
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#333", // Couleur neutre
    textAlign: "center",
    marginBottom: 5,
  },
  cityContainer: {
    backgroundColor: "#E6F7FF", // Bleu doux
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  cityName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007BFF", // Bleu accent
    textAlign: "center",
  },
  rankingContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  rankingText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#555", // Couleur grise subtile
    textAlign: "center",
  },
  rankingNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF", // Or pour le classement
  },
  totalUsers: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555", // Bleu accent
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 50,
    marginVertical: 4,
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
  badgeMedal: {
    position: "absolute",

    bottom: 27,
    right: 15,
    backgroundColor: "red",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeTextMedal: {
    color: "white",
    fontSize:30,
    fontWeight: "bold",
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
