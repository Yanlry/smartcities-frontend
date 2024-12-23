import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker";
import styles from "./styles/HomeScreen.styles";
import axios from "axios";
import { useLocation } from "../hooks/useLocation";
import { processReports, Report } from "../services/reportService";
import { formatCity } from "../utils/formatters";
import { getTypeLabel, typeColors } from "../utils/reportHelpers";
import { hexToRgba, calculateOpacity } from "../utils/reductOpacity";
import { getUserIdFromToken } from "../utils/tokenUtils";
import Chart from "../components/Chart";
import { useFetchStatistics } from "../hooks/useFetchStatistics";
// @ts-ignore
import { API_URL } from "@env";
import { Linking } from "react-native";


type User = {
  id: string;
  createdAt: string;
  ranking: string;
  firstName: string;
  lastName: string;
  username?: string;
  useFullName: boolean;
  nomCommune: string;
  email: string;
  trustRate?: number;
  followers?: any[];
  following?: any[];
  reports?: any[];
  comments?: any[];
  posts?: any[];
  organizedEvents?: any[];
  attendedEvents?: any[];
  latitude?: number;
  longitude?: number;
  profilePhoto?: { url: string };
  isSubscribed: boolean;
  isMunicipality: boolean;
  votes: any[];
};

interface TopUser {
  id: string;
  username: string;
  photo: string | null;
  ranking: number;
  useFullName: boolean;
  firstName: string;
  lastName: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function HomeScreen({ navigation }) {
  const { location, loading: locationLoading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isLoading = locationLoading || loadingReports || loadingUsers;
  const [smarterData, setSmarterData] = useState<
    {
      id: string;
      username: string;
      displayName: string;
      image: { uri: string };
    }[]
  >([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [rankingData, setRankingData] = useState<TopUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [featuredEvents, setFeaturedEvents] = useState<
    { id: string; title: string; image: string }[]
  >([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [modalNameVisible, setModalNameVisible] = useState(false);
  const { data } = useFetchStatistics(`${API_URL}/reports/statistics`);
  const [refreshing, setRefreshing] = useState(false);

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
    
        const rankingResponse = await fetch(
          `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(cityName)}`
        );
        if (!rankingResponse.ok) {
          throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
        }
    
        const rankingData = await rankingResponse.json();
        setRankingData(rankingData.users); // Met à jour les données de classement
        setRanking(rankingData.ranking); // Classement de l'utilisateur
        setTotalUsers(rankingData.totalUsers); // Nombre total d'utilisateurs
      } catch (error) {
        console.error("Erreur lors de la récupération du classement :", error);
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.error("ID utilisateur non trouvé");
          return;
        }
  
        const userResponse = await fetch(`${API_URL}/users/${userId}`);
        if (!userResponse.ok) {
          console.error(
            "Erreur lors de la récupération des données utilisateur"
          );
          return;
        }
        const userData = await userResponse.json();
        setUser(userData);
  
        const cityName = userData.nomCommune;
        if (!cityName) {
          throw new Error("La ville de l'utilisateur est introuvable.");
        }
  
        const topUsersResponse = await fetch(
          `${API_URL}/users/top10?cityName=${encodeURIComponent(cityName)}`
        );
        if (!topUsersResponse.ok) {
          console.error(
            "Erreur lors de la récupération des utilisateurs populaires"
          );
          return;
        }
  
        const topUsersData: TopUser[] = await topUsersResponse.json();
  
        const formattedData = topUsersData.map((user) => ({
          id: user.id,
          username: user.username,
          displayName: user.useFullName
            ? `${user.firstName} ${user.lastName}`
            : user.username,
          ranking: user.ranking,
          image: { uri: user.photo || "default-image-url" },
        }));
  
        formattedData.sort((a, b) => a.ranking - b.ranking);
        setSmarterData(formattedData);
  
        if (location) {
          setLoadingReports(true);
          const reports = await processReports(
            location.latitude,
            location.longitude
          );
          setReports(reports);
        }
      } catch (err: any) {
        console.error(
          "Erreur lors de la récupération des données :",
          err.message
        );
      } finally {
        setLoadingUsers(false);
        setLoadingReports(false);
      }
    };
  
    fetchData();
  }, [location]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const userId = await getUserIdFromToken();
        if (!userId) {
          throw new Error("Utilisateur non connecté ou ID introuvable.");
        }

        const response = await axios.get(`${API_URL}/users/stats/${userId}`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }

        const data = response.data;
        if (!data.votes) {
          data.votes = [];
        }

        setStats(data);
      } catch (error: any) {
        console.error("Erreur dans fetchStats :", error.message || error);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/events`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }

        const events = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          image:
            event.photos.find((photo: any) => photo.isProfile)?.url ||
            event.photos[0]?.url ||
            "https://via.placeholder.com/300",
        }));

        setFeaturedEvents(events);
      } catch (error: any) {
        console.error("Erreur dans fetchEvents :", error.message || error);
        setError("Impossible de récupérer les événements.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#408476" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!location) {
    console.error("Localisation non disponible");
    return (
      <Modal transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Partagez votre position</Text>
          <Text style={styles.modalText}>
            La permission de localisation est nécessaire pour utiliser
            l'application.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => useLocation()}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (loadingReports) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#29524A" />
        <Text style={{ color: "#29524A" }}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#29524A" />
        <Text style={styles.loadingText}>Chargement des signalements...</Text>
      </View>
    );
  }

  if (!stats || !stats.votes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4500" />
        <Text style={styles.loadingText}>Chargement des votes...</Text>
      </View>
    );
  }

  const fetchEventsByDate = async (date: string): Promise<void> => {
    try {
      const response = await axios.get<
        { id: string; title: string; date: string; location: string }[]
      >(`${API_URL}/events/by-date`, {
        params: { date },
      });
      setEvents(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des événements :", error);
      alert("Impossible de charger les événements pour cette date.");
    }
  };

  const calculateYearsSince = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const years = now.getFullYear() - date.getFullYear();
    const months =
      years * 12 +
      now.getMonth() -
      date.getMonth() -
      (now.getDate() < date.getDate() ? 1 : 0);

    if (years > 1) {
      return `${years} ans`;
    } else if (years === 1) {
      return "1 an";
    } else if (months > 1) {
      return `${months} mois`;
    } else {
      return "moins d'un mois";
    }
  };

  const handlePressReport = (id: number) => {
    navigation.navigate("ReportDetails", { reportId: id });
  };

  const handleCategoryClick = (category: string) => {
    navigation.navigate("CategoryReports", { category });
  };

  const toggleFollowersList = () => {
    setShowFollowers((prev) => !prev);
  };

  const handlePressPhoneNumber = () => {
    Linking.openURL("tel:0320440251");
  };

  const renderFollower = ({ item }) => (
    <TouchableOpacity
      style={styles.followerItem}
      onPress={() =>
        navigation.navigate("UserProfileScreen", { userId: item.id })
      }
    >
      <Image
        source={{ uri: item.profilePhoto || "https://via.placeholder.com/50" }}
        style={styles.followerImage}
      />
      {/* Encapsulation du texte */}
      <Text style={styles.followerName}>{item.username || "Utilisateur"}</Text>
    </TouchableOpacity>
  );

  const getRankingSuffix = (rank) => {
    if (!rank) return "";
    return rank === 1 ? "er" : "ème";
  };

  const displayName = user?.useFullName
    ? `${user.firstName} ${user.lastName}`
    : user?.username;

  const handleOptionChange = async (option: "fullName" | "username") => {
    setModalNameVisible(false);

    try {
      const response = await fetch(`${API_URL}/users/display-preference`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          useFullName: option === "fullName",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la préférence.");
      }

      setUser((prevUser) => ({
        ...prevUser!,
        useFullName: option === "fullName",
      }));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la préférence", error);
    }
  };

  if (showFollowers) {
    return (
      <View style={styles.containerFollower}>
        <Text style={styles.title}>Mes followers</Text>
        <FlatList
          data={user?.followers || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFollower}
          contentContainerStyle={styles.followerList}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={toggleFollowersList}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categories = [
    {
      name: "danger",
      label: "Danger",
      icon: "alert-circle-outline",
      color: "#FF4C4C",
    },
    {
      name: "travaux",
      label: "Travaux",
      icon: "construct-outline",
      color: "#FFA500",
    },
    {
      name: "nuisance",
      label: "Nuisance",
      icon: "volume-high-outline",
      color: "#B4A0E5",
    },
    {
      name: "reparation",
      label: "Réparation",
      icon: "hammer-outline",
      color: "#33C2FF",
    },
    {
      name: "pollution",
      label: "Pollution",
      icon: "leaf-outline",
      color: "#32CD32",
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);

    // Simule une attente ou une action
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setRefreshing(false);

    // Naviguer vers une autre page après le rafraîchissement
    navigation.replace("Main");
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.cardContainer}>
        <View style={styles.header}>
          {user?.profilePhoto?.url ? (
            <Image
              source={{ uri: user.profilePhoto.url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.noProfileImage}>
              <Text style={styles.noProfileImageText}>
                Pas de photo de profil
              </Text>
            </View>
          )}

          <View style={styles.userInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{displayName}</Text>
              <TouchableOpacity
                onPress={() => setModalNameVisible(true)}
                style={styles.dropdownButton}
              >
                <Ionicons
                  name="chevron-down-outline"
                  size={24}
                  color="#29524A"
                />
              </TouchableOpacity>
            </View>

            <Modal
              visible={modalNameVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setModalNameVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainerName}>
                  <Text style={styles.modalTitleName}>
                    Préférence d'affichage
                  </Text>
                  <FlatList
                    data={[
                      {
                        label: "Utiliser mon nom et prénom",
                        value: "fullName",
                      },
                      {
                        label: "Utiliser mon nom d'utilisateur",
                        value: "username",
                      },
                    ]}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() =>
                          handleOptionChange(
                            item.value as "fullName" | "username"
                          )
                        }
                      >
                        <Text style={styles.optionText}>{item.label}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalNameVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Text style={styles.userDetails}>
              Inscrit{" "}
              {user?.createdAt
                ? `il y a ${calculateYearsSince(user.createdAt)}`
                : "depuis un certain temps"}
            </Text>
            {/* Votes */}
            <View>
              {stats && stats.votes ? (
                stats.votes.length > 0 ? (
                  (() => {
                    interface Vote {
                      type: "up" | "down";
                    }

                    interface VoteSummary {
                      up: number;
                      down: number;
                    }

                    const voteSummary: VoteSummary = stats.votes.reduce(
                      (acc: VoteSummary, vote: Vote) => {
                        if (vote.type === "up") acc.up++;
                        else acc.down++;
                        return acc;
                      },
                      { up: 0, down: 0 }
                    );

                    return (
                      <View style={styles.voteSummary}>
                        <View style={styles.voteButton}>
                          <Ionicons
                            name="thumbs-up-outline"
                            size={28}
                            color="#418074"
                          />
                          <Text style={styles.voteCount}>{voteSummary.up}</Text>
                        </View>
                        <View style={styles.voteButton}>
                          <Ionicons
                            name="thumbs-down-outline"
                            size={28}
                            color="#A73830"
                          />
                          <Text style={styles.voteCount}>
                            {voteSummary.down}
                          </Text>
                        </View>
                      </View>
                    );
                  })()
                ) : (
                  <Text style={styles.noVotesText}>
                    Pas encore de votes. Votez pour monter dans le classement
                  </Text>
                )
              ) : (
                <Text style={styles.loadingText}>Chargement des votes...</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statistics}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={toggleFollowersList}
          >
            <Text style={styles.statNumber}>
              {user?.followers?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Relations</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.statNumber}>
              {ranking && totalUsers
                ? `${ranking}${getRankingSuffix(ranking)}`
                : "?"}
            </Text>
            {ranking && totalUsers && (
              <Text style={styles.statLabel}>
                du classement sur {totalUsers}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
  visible={isModalVisible}
  animationType="slide"
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalContentRanking}>
  <View style={styles.titleContainer}>
    <Text style={styles.titleText}>
      Classement à : <Text style={styles.cityName}>{user?.nomCommune || "ville inconnue"}</Text>
    </Text>
  </View>
    <FlatList
      data={rankingData}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const displayName = item.useFullName
          ? `${item.firstName} ${item.lastName}`
          : item.username; // Choix basé sur `useFullName`

        const isTopThree = item.ranking <= 3; // Vérifie si l'utilisateur est dans le top 3
        const badgeColor = item.ranking === 1 ? "#FFD700" : item.ranking === 2 ? "#C0C0C0" : "#CD7F32"; // Or, argent, bronze
        const borderColor = item.ranking === 1 ? "#FFD700" : item.ranking === 2 ? "#C0C0C0" : "#CD7F32"; // Contours correspondants

        return (
          <TouchableOpacity
            style={[
              styles.rankingItemModal,
              isTopThree ? { borderColor: borderColor, borderWidth: 2, borderRadius: 50} : styles.nonTopThreeItem,
            ]}
            onPress={() => {
              setIsModalVisible(false); // Fermer le modal
              navigation.navigate("UserProfileScreen", {
                userId: item.id,
              }); // Naviguer vers le profil utilisateur
            }}
          >
            {isTopThree && (
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>
                  {item.ranking === 1 ? "🥇" : item.ranking === 2 ? "🥈" : "🥉"}
                </Text>
              </View>
            )}
            <Image
              source={{ uri: item.photo || "default-image-url" }}
              style={[styles.userImage, isTopThree && styles.topThreeImage]}
            />
            <Text style={[styles.rankingTextModal, !isTopThree && styles.nonTopThreeText]}>
  {isTopThree ? displayName : `#${item.ranking} - ${displayName}`}
</Text>
          </TouchableOpacity>
        );
      }}
    />
    <TouchableOpacity
      onPress={() => setIsModalVisible(false)}
      style={styles.closeButtonModal}
    >
      <Text style={styles.closeButtonTextModal}>Fermer</Text>
    </TouchableOpacity>
  </View>
</Modal>

<Text style={styles.sectionTitle}>Top 10 des Smarter</Text>
<View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {smarterData.slice(0, 10).map((item, index) => {
      const borderColor =
        index + 1 === 1
          ? "#FFD700" // Or
          : index + 1 === 2
          ? "#C0C0C0" // Argent
          : index + 1 === 3
          ? "#CD7F32" // Bronze
          : "#fff"; // Couleur par défaut pour les autres

      const medal =
        index + 1 === 1
          ? "🥇" // Médaille d'or
          : index + 1 === 2
          ? "🥈" // Médaille d'argent
          : index + 1 === 3
          ? "🥉" // Médaille de bronze
          : null; // Pas de médaille pour les autres

      return (
        <TouchableOpacity
          key={item.id}
          style={styles.smarterItem}
          onPress={() =>
            navigation.navigate("UserProfileScreen", { userId: item.id })
          }
        >
          {/* Conteneur pour gérer la médaille et l'image */}
          <View style={{ position: "relative" }}>
            {/* Médaille */}
            {medal && (
              <Text style={styles.medal}>
                {medal}
              </Text>
            )}
            {/* Image avec le contour */}
            <Image
              source={{ uri: item.image.uri || "default-image-url" }}
              style={[styles.smarterImage, { borderColor: borderColor }]}
            />
          </View>
          {/* Nom de l'utilisateur */}
          <Text style={styles.rankingName}>
            {item.displayName || "Nom indisponible"}
          </Text>
        </TouchableOpacity>
      );
    })}

    {/* Bouton Voir Tout */}
    <TouchableOpacity
      key="seeAll"
      style={[styles.smarterItem, styles.seeAllButton]}
      onPress={() => setIsModalVisible(true)}
    >
      <Text style={styles.seeAllText}>Voir tout</Text>
    </TouchableOpacity>
  </ScrollView>
</View>

      <Text style={styles.sectionTitle}>Signalements proches de vous</Text>
      {reports.length === 0 ? (
        <Text style={styles.noReportsText}>
          Aucun signalement à proximité pour le moment.
        </Text>
      ) : (
        reports.map((report, index) => (
          <TouchableOpacity
            key={report.id}
            style={[
              styles.reportItem,
              {
                backgroundColor: hexToRgba(
                  typeColors[report.type] || "#CCCCCC",
                  calculateOpacity(report.createdAt, 0.5)
                ),
              },
              index === reports.length - 1 && { marginBottom: 25 },
            ]}
            onPress={() => handlePressReport(report.id)}
          >
            <Text style={styles.reportType}>
              {getTypeLabel(report.type)} {report.distance.toFixed(2)} km
            </Text>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportCity}>📍 {formatCity(report.city)}</Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>À la Une</Text>
      {featuredEvents.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 5 }}
        >
          {featuredEvents.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featuredItem}
              onPress={() => {
                console.log(
                  "Navigating to EventDetailsScreen with ID:",
                  item.id
                );
                navigation.navigate("EventDetailsScreen", { eventId: item.id });
              }}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.featuredImage}
              />
              <Text style={styles.featuredTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noEventsTextOne}>Aucun événement disponible</Text>
      )}

      <Text style={styles.sectionTitle}>Tous les événements</Text>
      <View style={styles.calendarContainer}>
        <CalendarPicker
          onDateChange={(date) => {
            const formattedDate = date.toISOString().split("T")[0];
            console.log("Date sélectionnée :", formattedDate);
            fetchEventsByDate(formattedDate);
          }}
          previousTitle="<"
          nextTitle=">"
          weekdays={["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]}
          months={[
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Août",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre",
          ]}
          startFromMonday={true}
          textStyle={{
            fontSize: 16,
          }}
          width={330}
          selectedDayColor="#11998e"
          selectedDayTextColor="#FFFFFF"
        />
      </View>

      {events.length > 0 ? (
        events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventItem}
            onPress={() =>
              navigation.navigate("EventDetailsScreen", { eventId: event.id })
            }
          >
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDetails}>
              {new Date(event.date).toLocaleDateString("fr-FR")}
            </Text>
            <Text style={styles.eventLocation}>📍 {event.location}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>
            Aucun événement prévu pour cette date.
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 25 }}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.name}
            onPress={() => handleCategoryClick(category.name)}
            style={[
              styles.categoryButton,
              {
                backgroundColor: hexToRgba(category.color, 0.5),
              },
            ]}
          >
            <Ionicons
              name={category.icon as keyof typeof Ionicons.glyphMap}
              size={40}
              color="#fff"
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryText}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Statistiques du Mois */}
      <Chart data={data} />

      <Text style={styles.sectionTitle}>Informations mairie</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Attention : Travaux ! </Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la Liberté
          {"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> Des travaux de
          réfection de la chaussée auront lieu du 25 au 30 septembre. La
          circulation sera déviée. Veuillez suivre les panneaux de
          signalisation.
        </Text>

        <Text style={styles.infoTitle}>Résolution de vos signalements</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 20 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Rue des Fleurs{"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> La fuite d'eau signalée
          a été réparée. Merci de votre patience.
        </Text>

        <Text style={styles.infoTitle}>Alertes Importantes</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 18 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> En raison des fortes
          pluies prévues cette semaine, nous vous recommandons de limiter vos
          déplacements et de vérifier les alertes météo régulièrement.
        </Text>
      </View>

      <View style={styles.mayorCard}>
        <Image
          source={require("../assets/images/mayor.png")}
          style={styles.profileImageMayor}
        />
        <View style={styles.mayorContainer}>
          <Text style={styles.mayorInfo}>Maire actuel:</Text>
          <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
          <Text style={styles.mayorSubtitle}>
            Permanence en Mairie sur rendez-vous au :
          </Text>
          <TouchableOpacity onPress={handlePressPhoneNumber}>
            <Text style={styles.contactBold}>03 20 44 02 51</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.officeCard}>
        <Image
          source={require("../assets/images/mairie.png")}
          style={styles.officeImage}
        />
        <View style={styles.officeInfo}>
          <View style={styles.officeAddress}>
            <Text style={styles.Address}>Contactez-nous :{"\n"}</Text>
            <Text>11 rue Sadi Carnot, {"\n"}59320 Haubourdin</Text>
          </View>
          <Text style={styles.officeContact}>
            <Text style={styles.phone}>Téléphone :</Text>
            {"\n"}
            <TouchableOpacity onPress={handlePressPhoneNumber}>
              <Text style={styles.officeContact}>03 20 44 02 90</Text>
            </TouchableOpacity>
            {"\n"}
            <Text style={styles.hours}>Du lundi au vendredi :</Text>
            {"\n"}
            08:30 - 12:00, 13:30 - 17:00
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
