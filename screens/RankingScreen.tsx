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
import { Ionicons } from "@expo/vector-icons";

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
    voteCount?: number;
  }

  const [rankingData, setRankingData] = useState<User[]>([]);
  const [userRanking, setUserRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { unreadCount } = useNotification();  

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);

      try {
        const userId = await getUserIdFromToken();  
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
    {/* Icône de bienvenue */}
    <View style={styles.iconContainer}>
      <Ionicons name="location-outline" size={40} color="#418074" />
    </View>

    {/* Texte de bienvenue */}
    <Text style={styles.welcomeText}>Bienvenue à</Text>

    {/* Nom de la ville */}
    <View style={styles.cityContainer}>
      <Text style={styles.cityName}>{cityName || "Ville inconnue"}</Text>
    </View>

    {/* Classement utilisateur */}
    <View style={styles.rankingContainer}>
      <Text style={styles.rankingText}>
        Vous êtes classé <Text style={styles.rankingNumber}>#{userRanking || "N/A"}</Text> parmi <Text style={styles.totalUsers}>{totalUsers || "N/A"}</Text> utilisateurs

      </Text>
      <Text style={styles.rankingText}>
      </Text>
    </View>

    {/* Barre de séparation */}
    <View style={styles.separator} />
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
    isTopThree && { borderColor: borderColor, borderWidth: 3 },
    index === rankingData.length - 1 && { marginBottom: 50 },
  ]}
  onPress={() =>
    navigation.navigate("UserProfileScreen", { userId: item.id })
  }
>
  {/* Badge pour les 3 premiers */}
  {isTopThree ? (
    <View style={[styles.badgeMedal, { backgroundColor: badgeColor }]}>
      <Text style={styles.badgeTextMedal}>
        {item.ranking === 1
          ? "🥇"
          : item.ranking === 2
          ? "🥈"
          : "🥉"}
      </Text>
    </View>
  ) : ( 
    <View style={styles.rankingNumberContainer}>
      <Text style={styles.rankingNumber}>{`#${item.ranking}`}</Text>
    </View>
  )}

  {/* Photo de profil */}
  <Image
    source={{
      uri: item.photo || "https://via.placeholder.com/150",
    }}
    style={[
      styles.userImage,
      isTopThree && styles.topThreeImage,
    ]}
  />

  {/* Informations utilisateur */}
  <View
    style={styles.userInfo}
  >
    <Text style={styles.userName}>
      {item.useFullName
        ? `${item.firstName} ${item.lastName}`
        : item.username || "Utilisateur inconnu"}
    </Text>
  </View>

  {/* Points et score */}
  {!isTopThree && (
    <View style={styles.scoreContainer}>
      <Text style={styles.scoreText}>{`${item.voteCount} points`}</Text>
    </View>
  )}
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
    backgroundColor: "#093A3E", 
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitleNav: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#093A3E',  
    backgroundColor: '#F7F2DE',
    letterSpacing:2,
    fontWeight: 'bold',
    fontFamily: 'Insanibc',  
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
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cityContainer: {
    backgroundColor: "#418074",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  cityName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  rankingContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  rankingText: {
    fontSize: 16,
    color: "#555",
  },
  rankingNumber: {
    fontWeight: "bold",
    color: "#418074",
    fontSize: 18,
  },
  totalUsers: {
    fontWeight: "bold",
    color: "#A73830",
    fontSize: 18,
  },
  separator: {
    marginTop: 20,
    width: "90%",
    height: 1,
    backgroundColor: "#ddd",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  badgeMedal: {
    position: "absolute",
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeTextMedal: {
    position: "absolute",
    top: -3,
    right: 1,
    fontSize:50,
    fontWeight: "bold",
    color: "#fff",
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ddd",
    marginRight: 15,
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
    marginTop: 5,
  },
  scoreContainer: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#418074",
  },
  topThreeImage: {
    width: 70,  
    height: 70,
    borderRadius: 35,
  },
});
