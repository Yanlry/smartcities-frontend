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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import CalendarPicker from "react-native-calendar-picker"; // Ajoutez un module de calendrier si nécessaire
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
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
import { Picker } from "@react-native-picker/picker";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

type User = {
  id: string;
  createdAt: string;
  ranking: string;
  firstName: string;
  lastName: string;
  username?: string;
  useFullName: boolean;
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
  useFullName: boolean; // Inclure cette propriété
  firstName: string;
  lastName: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function HomeScreen({}) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
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
  const [showFollowers, setShowFollowers] = useState(false); // État pour afficher les followers
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

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true); // Démarre le chargement
      setError(null); // Réinitialise l'état d'erreur
      try {
        // Récupérer l'ID utilisateur
        const userId = await getUserIdFromToken();
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur.");
        }

        // Appel API pour le classement
        const response = await fetch(
          `${API_URL}/users/ranking?userId=${userId}`
        );
        if (!response.ok) {
          throw new Error(`Erreur serveur : ${response.statusText}`);
        }

        const topUsersResponse = await fetch(`${API_URL}/users/all-rankings`);
        if (topUsersResponse.ok) {
          const data: TopUser[] = await topUsersResponse.json();
          setRankingData(data);
        }

        const data: { ranking: number; totalUsers: number } =
          await response.json();
        setRanking(data.ranking);
        setTotalUsers(data.totalUsers);
      } catch (error: any) {
        console.error("Erreur lors de la récupération du classement :", error);
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false); // Terminer le chargement
      }
    };

    fetchRanking();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupération de l'ID utilisateur
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.error("ID utilisateur non trouvé");
          return;
        }

        // Récupération des données utilisateur
        const userResponse = await fetch(`${API_URL}/users/${userId}`);
        if (!userResponse.ok) {
          console.error(
            "Erreur lors de la récupération des données utilisateur"
          );
          return;
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Chargement des signalements si la localisation est disponible
        if (location) {
          setLoadingReports(true);
          const reports = await processReports(
            location.latitude,
            location.longitude
          );
          setReports(reports);
        }

        // Récupération de la liste des utilisateurs populaires
        const topUsersResponse = await fetch(`${API_URL}/users/top10`);
        if (!topUsersResponse.ok) {
          console.error(
            "Erreur lors de la récupération des utilisateurs populaires"
          );
          return;
        }

        const topUsersData: TopUser[] = await topUsersResponse.json();

        interface FormattedUser {
          id: string;
          username: string;
          displayName: string; // Nom à afficher dynamiquement
          ranking: number;
          image: { uri: string };
        }

        const formattedData: FormattedUser[] = topUsersData.map((user) => ({
          id: user.id,
          username: user.username,
          displayName: user.useFullName
            ? `${user.firstName} ${user.lastName}` // Nom complet si `useFullName` est vrai
            : user.username, // Sinon, afficher le `username`
          ranking: user.ranking,
          image: { uri: user.photo || "default-image-url" },
        }));
        // Tri par classement (optionnel si déjà trié côté backend)
        formattedData.sort((a, b) => a.ranking - b.ranking);

        setSmarterData(formattedData);
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
        // Vérifiez que les votes sont présents
        if (!data.votes) {
          data.votes = []; // Fournir une valeur par défaut
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
        setLoading(true); // Démarrer le chargement
        setError(null); // Réinitialiser l'erreur

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

        setFeaturedEvents(events); // Mettre à jour l'état
      } catch (error: any) {
        console.error("Erreur dans fetchEvents :", error.message || error);
        setError("Impossible de récupérer les événements.");
      } finally {
        setLoading(false); // Arrêter le chargement
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement en cours...</Text>
      </View>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
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
        params: { date }, // Passez la date sélectionnée en paramètre
      });
      setEvents(response.data); // Mettez à jour les événements avec la réponse
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
      (now.getDate() < date.getDate() ? 1 : 0); // Ajuste si le jour n'est pas encore passé

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
    navigation.navigate("ReportDetails", { reportId: id }); // Maintenant typé correctement
  };

  const handleCategoryClick = (category: string) => {
    navigation.navigate("CategoryReports", { category }); // Passe la catégorie sélectionnée à la nouvelle page
  };

  const toggleFollowersList = () => {
    setShowFollowers((prev) => !prev); // Inverse l'état d'affichage
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
    if (!rank) return ""; // Si le classement est null ou indéfini
    return rank === 1 ? "er" : "ème";
  };

  // Détermine le nom à afficher en fonction de useFullName
  const displayName = user?.useFullName
    ? `${user.firstName} ${user.lastName}`
    : user?.username;

  const handleOptionChange = async (option: "fullName" | "username") => {
    // Ferme le modal immédiatement pour améliorer l'expérience utilisateur
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

      const updatedUser = await response.json(); // Récupère les données mises à jour

      // Mets à jour l'état utilisateur existant
      setUser((prevUser) => ({
        ...prevUser!,
        useFullName: option === "fullName", // Mets à jour la préférence locale
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
          data={user?.followers || []} // Liste des followers
          keyExtractor={(item) => item.id.toString()} // Utilise `item.id` comme clé
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

  return (
    <ScrollView style={styles.container}>
      {/* Section Profil */}
      <View style={styles.cardContainer}>
        {/* Header avec photo et informations principales */}
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
                <Ionicons name="chevron-down-outline" size={24} color="#777" />
              </TouchableOpacity>
            </View>

            {/* Modal */}
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
                            color="#6bd5a7"
                          />
                          <Text style={styles.voteCount}>{voteSummary.up}</Text>
                        </View>
                        <View style={styles.voteButton}>
                          <Ionicons
                            name="thumbs-down-outline"
                            size={28}
                            color="#DC5D54"
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

        {/* Statistiques */}
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
          <FlatList
            data={rankingData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const displayName = item.useFullName
                ? `${item.firstName} ${item.lastName}`
                : item.username; // Choix basé sur `useFullName`

              return (
                <View style={styles.rankingItemModal}>
                  <Text style={styles.rankingTextModal}>#{item.ranking}</Text>
                  <Image
                    source={{ uri: item.photo || "default-image-url" }}
                    style={styles.userImage}
                  />
                  <Text style={styles.rankingTextModal}>{displayName}</Text>
                </View>
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
          {smarterData.slice(0, 10).map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.smarterItem}
              onPress={() =>
                navigation.navigate("UserProfileScreen", { userId: item.id })
              }
            >
              <Text style={styles.ranking}>{`# ${index + 1}`}</Text>
              <Image source={item.image} style={styles.smarterImage} />
              <Text style={styles.rankingName}>
                {item.displayName || "Nom indisponible"}{" "}
                {/* Fallback si displayName est vide */}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Ajout du bouton "Voir tout" */}
          <TouchableOpacity
            key="seeAll"
            style={[styles.smarterItem, styles.seeAllButton]}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Section Signalements Proche de Vous */}
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
              index === reports.length - 1 && { marginBottom: 25 }, // Ajoute marginBottom uniquement au dernier élément
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

      {/* Section Catégories */}
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
                backgroundColor: hexToRgba(category.color, 0.5), // Opacité constante pour tous les boutons
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

      {/* Section À la Une */}
      <Text style={styles.sectionTitle}>À la Une</Text>
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
              console.log("Navigating to EventDetailsScreen with ID:", item.id);
              navigation.navigate("EventDetailsScreen", { eventId: item.id });
            }}
          >
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
            <Text style={styles.featuredTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Événements */}
      <Text style={styles.sectionTitle}>Tous les événements</Text>
      <View style={styles.calendarContainer}>
        <CalendarPicker
          onDateChange={(date) => {
            const formattedDate = date.toISOString().split("T")[0];
            console.log("Date sélectionnée :", formattedDate);
            fetchEventsByDate(formattedDate); // Appelle l'API pour la date sélectionnée
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
          selectedDayColor="#11998e" // Fond de la date sélectionnée
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

      {/* Section Statistiques du Mois */}
      <Chart data={data} />

      {/* Section Informations Mairie */}
      <Text style={styles.sectionTitle}>Informations mairie</Text>

      {/* Informations de Signalement */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Attention : Travaux ! </Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la Liberté
          {"\n"}
          Des travaux de réfection de la chaussée auront lieu du 25 au 30
          septembre. La circulation sera déviée. Veuillez suivre les panneaux de
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
          En raison des fortes pluies prévues cette semaine, nous vous
          recommandons de limiter vos déplacements et de vérifier les alertes
          météo régulièrement.
        </Text>
      </View>

      {/* Carte du Maire */}
      <View style={styles.mayorCard}>
        <Image
          source={require("../assets/images/mayor.png")}
          style={styles.profileImageMayor}
        />
        <View style={styles.mayorContainer}>
          <Text style={styles.mayorInfo}>Maire actuel:</Text>
          <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
          <Text style={styles.mayorSubtitle}>
            Permanence en Mairie sur rendez-vous
          </Text>
          <Text style={styles.mayorContact}>
            Contact : <Text style={styles.contactBold}>03 20 44 02 51</Text>
          </Text>
        </View>
      </View>

      {/* Adresse de la Mairie */}
      <View style={styles.officeCard}>
        <Image
          source={require("../assets/images/mairie.png")}
          style={styles.officeImage}
        />
        <View style={styles.officeInfo}>
          <View style={styles.officeAddress}>
            <Text style={styles.Address}>Adresse :{"\n"}</Text>
            <Text>11 rue Sadi Carnot, {"\n"}59320 Haubourdin</Text>
          </View>
          <Text style={styles.officeContact}>
            <Text style={styles.phone}>Téléphone :</Text> 03 20 44 02 90{"\n"}
            <Text style={styles.hours}>Du lundi au vendredi :</Text>
            {"\n"}
            08:30 - 12:00, 13:30 - 17:00
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
