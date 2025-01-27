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
  Switch,
  Pressable,
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
import * as ImagePicker from "expo-image-picker";

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

export default function HomeScreen({ navigation, handleScroll }) {
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
  const [stats, setStats] = useState<any>(null);
  const [featuredEvents, setFeaturedEvents] = useState<
    { id: string; title: string; image: string }[]
  >([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [modalNameVisible, setModalNameVisible] = useState(false);
  const nomCommune = user?.nomCommune || "";
  const { data } = useFetchStatistics(
    `${API_URL}/reports/statistics`,
    nomCommune
  );
  const userCity = user?.nomCommune || "Commune non définie";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSectionVisible, setSectionVisible] = useState(true);
  const [isReportsVisible, setReportsVisible] = useState(true);
  const [isEventsVisible, setEventsVisible] = useState(true);
  const [isCalendarVisible, setCalendarVisible] = useState(true);
  const [isCategoryReportsVisible, setCategoryReportsVisible] = useState(true);
  const [isMayorInfoVisible, setMayorInfoVisible] = useState(true);
  const [areAllSectionsVisible, setAllSectionsVisible] = useState(true);
  const [modalOrnementVisible, setModalOrnementVisible] = useState(false);
  const [modalLikeVisible, setModalLikeVisible] = useState(false);

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
          `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
            cityName
          )}`
        );
        if (!rankingResponse.ok) {
          throw new Error(`Erreur serveur : ${rankingResponse.statusText}`);
        }

        const rankingData = await rankingResponse.json();
        setRanking(rankingData.ranking);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) {
          console.warn("ID utilisateur non trouvé");
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

        const userCityNormalized = normalizeCityName(userCity);

        const filteredEvents = response.data
          .filter((event: any) => {
            const eventCity = extractCityAfterPostalCode(event.location);
            const eventCityNormalized = normalizeCityName(eventCity);

            return eventCityNormalized === userCityNormalized;
          })
          .map((event: any) => ({
            id: event.id,
            title: event.title,
            image:
              event.photos.find((photo: any) => photo.isProfile)?.url ||
              event.photos[0]?.url ||
              "https://via.placeholder.com/300",
          }));

        setFeaturedEvents(filteredEvents);
      } catch (error: any) {
        console.error("Erreur dans fetchEvents :", error.message || error);
        setError("Impossible de récupérer les événements.");
      } finally {
        setLoading(false);
      }
    };

    if (userCity) {
      fetchEvents();
    }
  }, [userCity]);

  const extractCityAfterPostalCode = (location: string) => {
    if (!location) return "";
    const match = location.match(/\d{5}\s+([^,]+)/);
    return match ? match[1].trim() : "";
  };

  const normalizeCityName = (cityName: string) => {
    if (!cityName) return "";
    return cityName
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#102542" />
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
        <ActivityIndicator size="large" color="#102542" />
        <Text style={{ color: "#102542" }}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#102542" />
        <Text style={styles.loadingText}>Chargement des signalements...</Text>
      </View>
    );
  }

  if (!stats || !stats.votes) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#102542" />
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

    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    let days = now.getDate() - date.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 1) {
      return `${years} ans`;
    } else if (years === 1) {
      return `1 an et ${months} mois`;
    } else if (months > 1) {
      return `${months} mois`;
    } else if (months === 1) {
      return `1 mois et ${days} jours`;
    } else if (days > 1) {
      return `${days} jours`;
    } else {
      return "moins d'un jour";
    }
  };

  const handlePressReport = (id: number) => {
    navigation.navigate("ReportDetailsScreen", { reportId: id });
  };

  const handleCategoryClick = (category: string) => {
    navigation.navigate("CategoryReportsScreen", { category });
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

  const formatTime = (dateString) => {
    const eventDate = new Date(dateString);
    const now = new Date();

    const diffInMs = now.getTime() - eventDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return `Il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
    } else {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
    }
  };

  if (showFollowers) {
    return (
      <View style={styles.containerFollower}>
        <Text style={styles.title}>Mes relations</Text>
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

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setRefreshing(false);

    navigation.replace("Main");
  };

  const handleProfileImageClick = async () => {
    try {
      setIsSubmitting(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (result.canceled) {
        setIsSubmitting(false);
        return;
      }

      const photoUri = result.assets?.[0]?.uri;

      if (!photoUri) {
        throw new Error("Aucune image sélectionnée");
      }

      const formData = new FormData();
      formData.append("profileImage", {
        uri: photoUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      console.log("FormData clé et valeur:", formData);

      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("ID utilisateur non trouvé");

      const responsePost = await fetch(
        `${API_URL}/users/${userId}/profile-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", responsePost.status);

      if (!responsePost.ok) {
        const errorBody = await responsePost.text();
        console.error("Response body:", errorBody);
        throw new Error("Échec de la mise à jour de la photo de profil");
      }

      const updatedUser = await responsePost.json();
      console.log("Response body:", updatedUser);

      navigation.replace("Main");
    } catch (err: any) {
      console.error("Erreur lors de l'upload :", err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = () => {
    setSectionVisible((prevState) => !prevState);
  };

  const toggleReports = () => {
    setReportsVisible((prevState) => !prevState);
  };

  const toggleEvents = () => {
    setEventsVisible((prevState) => !prevState);
  };

  const toggleCalendar = () => {
    setCalendarVisible((prevState) => !prevState);
  };

  const toggleCategoryReports = () => {
    setCategoryReportsVisible((prevState) => !prevState);
  };

  const toggleMayorInfo = () => {
    setMayorInfoVisible((prevState) => !prevState);
  };

  const toggleAllSections = () => {
    const newVisibility = !areAllSectionsVisible;
    setAllSectionsVisible(newVisibility);
    setSectionVisible(newVisibility);
    setReportsVisible(newVisibility);
    setEventsVisible(newVisibility);
    setCalendarVisible(newVisibility);
    setCategoryReportsVisible(newVisibility);
    setMayorInfoVisible(newVisibility);
  };

  const getBadgeStyles = (votes: number) => {
    if (votes >= 1000) {
      return {
        title: "Légende urbaine",
        backgroundColor: "#997BBA",
        textColor: "#fff",
        borderColor: "#5B3F78",
        shadowColor: "#997BBA",
        starsColor: "#5B3F78",
        stars: 6,
        icon: null,
      };
    } else if (votes >= 500) {
      return {
        title: "Icône locale",
        backgroundColor: "#70B3B1",
        textColor: "#fff",
        borderColor: "#044745",
        shadowColor: "#70B3B1",
        starsColor: "#044745",
        stars: 5,
        icon: null,
      };
    } else if (votes >= 250) {
      return {
        title: "Héros du quotidien",
        backgroundColor: "#FAF3E3",
        textColor: "#856404",
        borderColor: "#856404",
        shadowColor: "#D4AF37",
        starsColor: "#D4AF37",
        stars: 4,
        icon: null,
      };
    } else if (votes >= 100) {
      return {
        title: "Ambassadeur citoyen",
        backgroundColor: "#E1E1E1",
        textColor: "#6A6A6A",
        starsColor: "#919191",
        shadowColor: "#6A6A6A",
        borderColor: "#919191",
        stars: 3,
        icon: null,
      };
    } else if (votes >= 50) {
      return {
        title: "Citoyen de confiance",
        backgroundColor: "#CEA992",
        textColor: "#853104",
        starsColor: "#853104",
        shadowColor: "#853104",
        borderColor: "#D47637",
        stars: 2,
        icon: null,
      };
    } else if (votes >= 5) {
      return {
        title: "Apprenti citoyen",
        backgroundColor: "#9BD4A2",
        textColor: "#25562A",
        starsColor: "#54B65F",
        borderColor: "#54B65F",
        shadowColor: "#54B65F",

        stars: 1,
        icon: null,
      };
    } else {
      return {
        title: "Premiers pas",
        backgroundColor: "#093A3E",
        textColor: "#fff",
        borderColor: "#fff",
        shadowColor: "#093A3E",
        starsColor: "#0AAEA8",
        stars: 0,
        icon: <Ionicons name="school" size={24} color="#0AAEA8" />,
      };
    }
  };

  const calculateVoteSummary = (votes) => {
    return votes.reduce(
      (acc, vote) => {
        if (vote.type === "up") acc.up++;
        else acc.down++;
        return acc;
      },
      { up: 0, down: 0 }
    );
  };

  const voteSummary = stats?.votes
    ? calculateVoteSummary(stats.votes)
    : { up: 0, down: 0 };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.cardContainer}>
        <View style={styles.header}>
          {/** NOM ET ICONE */}
          <View style={styles.nameContainer}>
            <Text
              onPress={() => setModalNameVisible(true)}
              style={styles.userName}
            >
              {displayName}
            </Text>
            <TouchableOpacity
              onPress={() => setModalNameVisible(true)}
              style={styles.dropdownButton}
            >
              <Ionicons name="settings-outline" size={16} />
            </TouchableOpacity>
            {/** VILLE ET INSCRIPTION */}
            <Text style={styles.userCity}>
              Engagé pour{" "}
              <Text
                style={styles.cityNameUser}
                onPress={() => navigation.navigate("CityScreen")}
              >
                {user?.nomCommune || "une commune non définie"}
              </Text>
              <Text style={styles.userDetails}>
                {" "}
                depuis{" "}
                {user?.createdAt
                  ? `${calculateYearsSince(user.createdAt)}`
                  : "depuis un certain temps"}
              </Text>
            </Text>
            <Modal
              visible={modalNameVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setModalNameVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainerName}>
                  <Text style={styles.modalTitleName}>
                    Indiquez votre préférence pour votre identité visible
                  </Text>
                  <FlatList
                    data={[
                      {
                        label: "Mon nom et prénom",
                        value: true,
                      },
                      {
                        label: "Mon nom d'utilisateur",
                        value: false,
                      },
                    ]}
                    keyExtractor={(item) => item.value.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.optionItem}>
                        <Text style={styles.optionText}>{item.label}</Text>
                        <Switch
                          value={user?.useFullName === item.value}
                          onValueChange={() =>
                            handleOptionChange(
                              item.value ? "fullName" : "username"
                            )
                          }
                          trackColor={{ false: "#CCCCCC", true: "#4CAF50" }}
                          thumbColor="#FFF"
                        />
                      </View>
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
          </View>

          <View style={styles.containerBande}>
            {/* Bande supérieure avec le vote positif */}
            <TouchableOpacity
              onPress={() => setModalLikeVisible(true)}
              style={styles.bandeUp}
            >
              <View style={styles.voteContainer}>
                <Ionicons name="thumbs-up-outline" size={23} color="#418074" />
                <Text style={styles.voteCount}>{voteSummary.up}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.relationItem}
            onPress={toggleFollowersList}
          >
            <Text style={styles.statNumber}>
              {user?.followers?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Relations</Text>
          </TouchableOpacity>
            {/* Image de profil */}
            <View>
              {user?.profilePhoto?.url ? (
                <TouchableOpacity onPress={handleProfileImageClick}>
                  <Image
                    source={{ uri: user.profilePhoto.url }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleProfileImageClick}>
                  <View style={styles.noProfileImage}>
                    <Text style={styles.noProfileImageText}>
                      Pas de photo de profil
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Bande inférieure avec le vote négatif */}
            <TouchableOpacity
              onPress={() => setModalLikeVisible(true)}
              style={styles.bandeDown}
            >
              <View style={styles.voteContainer}>
                <Ionicons
                  name="thumbs-down-outline"
                  size={23}
                  color="#A73830"
                />
                <Text style={styles.voteCount}>{voteSummary.down}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.rankingItem}
            onPress={() => navigation.navigate("RankingScreen")}
          >
            <Text style={styles.statLabel}>
                Vous etes classé{" "}
              </Text>
            <Text style={styles.statNumber}>
              {ranking && totalUsers
                ? `${ranking}${getRankingSuffix(ranking)}`
                : "?"}
            </Text>
          </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            {/** BADGE */}
            <View style={styles.badgeWrapper}>
              {/* Conteneur des icônes (au-dessus du badge) */}
              <View style={styles.iconsContainer}>
                {getBadgeStyles(stats.votes.length).stars === 0 ? (
                  <Ionicons
                    name="school"
                    size={24}
                    color={getBadgeStyles(stats.votes.length).starsColor}
                  />
                ) : (
                  Array.from({
                    length: getBadgeStyles(stats.votes.length).stars,
                  }).map((_, index) => (
                    <Ionicons
                      key={index}
                      name="star"
                      size={20}
                      color={getBadgeStyles(stats.votes.length).starsColor}
                    />
                  ))
                )}
              </View>

              {/* Badge */}
              <Pressable
                onPress={() => setModalOrnementVisible(true)}
                style={[
                  styles.badgeContainer,
                  {
                    backgroundColor: getBadgeStyles(stats.votes.length)
                      .backgroundColor,
                    borderColor: getBadgeStyles(stats.votes.length).borderColor,
                    shadowColor: getBadgeStyles(stats.votes.length).shadowColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeOrnement,
                    { color: getBadgeStyles(stats.votes.length).textColor },
                  ]}
                >
                  {getBadgeStyles(stats.votes.length).title}
                </Text>
              </Pressable>
            </View>

            {/* MODAL DES PALIER */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalOrnementVisible}
              onRequestClose={() => setModalOrnementVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  {/* Icône informative */}
                  <Ionicons
                    name="medal-outline"
                    size={60}
                    color="#418074"
                    style={styles.icon}
                  />

                  {/* Titre principal */}
                  <Text style={styles.modalTitle}>Découvrez les paliers</Text>

                  {/* Description */}
                  <Text style={styles.modalDescription}>
                    Chaque badge reflète votre niveau d’engagement citoyen. Plus
                    vous participez en votant sur les différents signalements de
                    la ville, plus vous gravissez les échelons des paliers
                  </Text>

                  {/* Corps scrollable */}
                  <ScrollView contentContainerStyle={styles.modalBody}>
                    {[
                      {
                        name: "Légende urbaine",
                        description: "Plus de 1000 votes",
                        votes: 1000,
                      },
                      {
                        name: "Icône locale",
                        description: "500 à 999 votes",
                        votes: 500,
                      },
                      {
                        name: "Héros du quotidien",
                        description: "250 à 499 votes",
                        votes: 250,
                      },
                      {
                        name: "Ambassadeur citoyen",
                        description: "100 à 249 votes",
                        votes: 100,
                      },
                      {
                        name: "Citoyen de confiance",
                        description: "50 à 99 votes",
                        votes: 50,
                      },
                      {
                        name: "Apprenti citoyen",
                        description: "5 à 49 votes",
                        votes: 5,
                      },
                      {
                        name: "Premiers pas",
                        description: "Moins de 5 votes",
                        votes: 0,
                      },
                    ].map((tier, index) => {
                      const badgeStyles = getBadgeStyles(tier.votes);

                      return (
                        <View
                          key={index}
                          style={[
                            styles.tierCard,
                            { borderColor: badgeStyles.borderColor },
                          ]}
                        >
                          {/* Étoiles */}
                          <View style={styles.starsContainer}>
                            {Array.from({ length: badgeStyles.stars }).map(
                              (_, i) => (
                                <Ionicons
                                  key={i}
                                  name="star"
                                  size={20}
                                  color={badgeStyles.starsColor}
                                />
                              )
                            )}
                            {badgeStyles.stars === 0 && badgeStyles.icon}
                          </View>
                          {/* Titre avec le même fond et la même bordure que le badge */}
                          <Text
                            style={[
                              styles.tierTitle,
                              {
                                backgroundColor: badgeStyles.backgroundColor,
                                borderColor: badgeStyles.borderColor,
                                color: badgeStyles.textColor,
                              },
                            ]}
                          >
                            {tier.name}
                          </Text>
                          {/* Description */}
                          <Text style={styles.tierDescription}>
                            {tier.description}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Bouton de fermeture */}
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setModalOrnementVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Fermer</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            {/* MODAL DES VOTES */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalLikeVisible}
              onRequestClose={() => setModalLikeVisible(false)}
            >
              <View style={styles.modalOverlayLike}>
                <View style={styles.modalContentLike}>
                  {/* Icone informative */}
                  <Ionicons
                    name="information-circle-outline"
                    size={60}
                    color="#418074"
                    style={styles.icon}
                  />

                  {/* Titre principal */}
                  <Text style={styles.titleModalLike}>
                    Montez dans le classement !
                  </Text>

                  {/* Description */}
                  <Text style={styles.description}>
                    Pour monter dans le classement, il vous suffit de :
                  </Text>

                  {/* Instructions */}
                  <View style={styles.instructions}>
                    <View style={styles.instructionItem}>
                      <Ionicons name="eye-outline" size={24} color="#555" />
                      <Text style={styles.instructionText}>
                        Constatez le maximum de signalements possibles.
                      </Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Ionicons
                        name="thumbs-up-outline"
                        size={24}
                        color="#418074"
                      />
                      <Text style={styles.instructionText}>
                        Votez "Oui" si le signalement est encore d'actualité.
                      </Text>
                    </View>
                    <View style={styles.instructionItem}>
                      <Ionicons
                        name="thumbs-down-outline"
                        size={24}
                        color="#A73830"
                      />
                      <Text style={styles.instructionText}>
                        Votez "Non" si le signalement n'est plus valide.
                      </Text>
                    </View>
                  </View>

                  {/* Bouton pour fermer */}
                  <TouchableOpacity
                    style={styles.closeButtonModalLike}
                    onPress={() => setModalLikeVisible(false)}
                  >
                    <Text style={styles.closeButtonTextModalLike}>
                      OK, j'ai compris
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </View>


      </View>

      <TouchableOpacity
        style={styles.globalToggleButton}
        onPress={toggleAllSections}
        activeOpacity={0.8}
      >
        <Text style={styles.globalToggleButtonText}>
          {areAllSectionsVisible ? "Fermer toutes les sections" : "Ouvrir tout"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isSectionVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleSection}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.sectionTitleTop10,
          ]}
        >
          🏆 Top 10 des Smarter
        </Text>
        <Text style={styles.arrow}>{isSectionVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Contenu de la section */}
      {isSectionVisible && (
        <View style={styles.sectionContent}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {smarterData.slice(0, 10).map((item, index) => {
              const borderColor =
                index + 1 === 1
                  ? "#FFD700"
                  : index + 1 === 2
                  ? "#C0C0C0"
                  : index + 1 === 3
                  ? "#CD7F32"
                  : "#fff";

              const medal =
                index + 1 === 1
                  ? "🥇"
                  : index + 1 === 2
                  ? "🥈"
                  : index + 1 === 3
                  ? "🥉"
                  : null;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.smarterItem}
                  onPress={() =>
                    navigation.navigate("UserProfileScreen", {
                      userId: item.id,
                    })
                  }
                >
                  <View style={{ position: "relative" }}>
                    {medal && <Text style={styles.medal}>{medal}</Text>}
                    <Image
                      source={{ uri: item.image.uri || "default-image-url" }}
                      style={[
                        styles.smarterImage,
                        { borderColor: borderColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.rankingName}>
                    {item.displayName || "Nom indisponible"}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Bouton Voir Tout */}
            <TouchableOpacity
              key="seeAll"
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("RankingScreen")}
            >
              {/* Texte "VOIR TOUT" */}
              <Text style={styles.seeAllText}>VOIR TOUT LE CLASSEMENT</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isReportsVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleReports}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>🚨 Signalements à proximité</Text>
        <Text style={styles.arrow}>{isReportsVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Contenu de la section */}
      {isReportsVisible && (
        <>
          <View style={styles.sectionContent}>
            {reports.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.noReportsText}>
                  Aucun signalement pour l'instant.
                </Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.timelineContainer}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {reports.map((report, index) => (
                  <View key={report.id} style={styles.timelinePointContainer}>
                    {/* Étiquette au-dessus de la timeline */}
                    <View
                      style={[
                        styles.timelineLabel,
                        {
                          backgroundColor: typeColors[report.type] || "#F5F5F5",
                        },
                      ]}
                    >
                      <Text style={styles.labelText}>
                        {getTypeLabel(report.type)} à{" "}
                        {report.distance ? report.distance.toFixed(2) : "N/A"}{" "}
                        km
                      </Text>
                    </View>

                    {/* Bloc signalement */}
                    <TouchableOpacity
                      style={[
                        styles.timelineBlock,
                        {
                          backgroundColor: hexToRgba(
                            typeColors[report.type] || "#F5F5F5",
                            calculateOpacity(report.createdAt, 0.2)
                          ),
                        },
                      ]}
                      onPress={() => handlePressReport(report.id)}
                      activeOpacity={0.9}
                    >
                      <Text numberOfLines={1} style={styles.reportTitle}>
                        {report.title}
                      </Text>

                      {/* Photos */}
                      <View style={styles.photoContainer}>
                        {report.photos && report.photos.length > 0 ? (
                          report.photos.length === 1 ? (
                            <Image
                              key={report.photos[0].id}
                              source={{ uri: report.photos[0].url }}
                              style={styles.singlePhoto}
                              resizeMode="cover"
                            />
                          ) : (
                            report.photos
                              .slice(0, 2)
                              .map((photo) => (
                                <Image
                                  key={photo.id}
                                  source={{ uri: photo.url }}
                                  style={styles.multiPhoto}
                                  resizeMode="cover"
                                />
                              ))
                          )
                        ) : (
                          <View style={styles.noPhotoContainer}>
                            <Text style={styles.noPhotoText}>
                              Aucune photo disponible
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.reportDetails}>
                        {formatCity(report.city)}
                      </Text>
                      <View style={styles.voteSummaryReport}>
                        <View style={styles.voteButtonsContainer}>
                          {/* Affichage des votes positifs */}
                          <View style={styles.voteButtonReport}>
                            <Ionicons
                              name="thumbs-up-outline"
                              size={16}
                              color="#418074"
                            />
                            <Text style={styles.voteCountReports}>
                              {report.upVotes || 0}{" "}
                              {/* Affiche 0 si upVotes est indéfini */}
                            </Text>
                          </View>
                          {/* Affichage des votes négatifs */}
                          <View style={styles.voteButtonReport}>
                            <Ionicons
                              name="thumbs-down-outline"
                              size={16}
                              color="#A73830"
                            />
                            <Text style={styles.voteCountReports}>
                              {report.downVotes || 0}{" "}
                              {/* Affiche 0 si downVotes est indéfini */}
                            </Text>
                          </View>
                        </View>
                        {/* Affichage de la date */}
                        <Text style={styles.reportTime}>
                          {formatTime(report.createdAt)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isEventsVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleEvents}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>🎉 Événements à venir</Text>
        <Text style={styles.arrow}>{isEventsVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Contenu de la section */}
      {isEventsVisible && (
        <>
          <View style={styles.sectionContent}>
            {loading ? (
              <ActivityIndicator size="large" color="#3498db" />
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : featuredEvents.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 5, marginLeft: 5 }}
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
                      navigation.navigate("EventDetailsScreen", {
                        eventId: item.id,
                      });
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
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>
                  Pas d’événement prévu pour le moment dans votre ville.
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* Section Statistiques du Mois */}
      <Chart
        data={data}
        loading={loading}
        nomCommune={nomCommune}
        controlStatsVisibility={areAllSectionsVisible}
      />

      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isCalendarVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleCalendar}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>📅 Tous les événements</Text>
        <Text style={styles.arrow}>{isCalendarVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Affichage conditionnel du calendrier et des événements */}
      {isCalendarVisible && (
        <>
          <View style={styles.sectionContent}>
            {/* Calendrier */}
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

            {/* Liste des événements */}
            {events.length > 0 ? (
              events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  onPress={() =>
                    navigation.navigate("EventDetailsScreen", {
                      eventId: event.id,
                    })
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
          </View>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isCategoryReportsVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleCategoryReports}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>🗂️ Tous les signalements</Text>
        <Text style={styles.arrow}>{isCategoryReportsVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Affichage conditionnel du contenu */}
      {isCategoryReportsVisible && (
        <View style={styles.sectionContent}>
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
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isMayorInfoVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleMayorInfo}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>🏛️ Informations mairie</Text>
        <Text style={styles.arrow}>{isMayorInfoVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Affichage conditionnel du contenu */}
      {isMayorInfoVisible && (
        <>
          <View style={styles.sectionContent}>
            {/* Informations mairie */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Attention : Travaux ! </Text>
              <Text style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024
                {"\n"}
                <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la
                Liberté {"\n"}
                <Text style={styles.infoLabel}>Détail :</Text> Des travaux de
                réfection de la chaussée auront lieu du 25 au 30 septembre. La
                circulation sera déviée. Veuillez suivre les panneaux de
                signalisation.
              </Text>

              <Text style={styles.infoTitle}>
                Résolution de vos signalements
              </Text>
              <Text style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date :</Text> 20 septembre 2024
                {"\n"}
                <Text style={styles.infoLabel}>Lieu :</Text> Rue des Fleurs
                {"\n"}
                <Text style={styles.infoLabel}>Détail :</Text> La fuite d'eau
                signalée a été réparée. Merci de votre patience.
              </Text>

              <Text style={styles.infoTitle}>Alertes Importantes</Text>
              <Text style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date :</Text> 18 septembre 2024
                {"\n"}
                <Text style={styles.infoLabel}>Détail :</Text> En raison des
                fortes pluies prévues cette semaine, nous vous recommandons de
                limiter vos déplacements et de vérifier les alertes météo
                régulièrement.
              </Text>
            </View>

            {/* Carte du maire */}
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

            {/* Carte des bureaux */}
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
          </View>
        </>
      )}
      <Text style={styles.footerCopyrightText}>
        © 2025 SmartCities. Tous droits réservés.
      </Text>
    </ScrollView>
  );
}


