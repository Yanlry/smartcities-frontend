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
import { useLocation } from "../hooks/useLocation";
import { processReports, Report } from "../services/reportService";
import { formatCity } from "../utils/formatters";
import { getTypeLabel, typeColors } from "../utils/reportHelpers";
import { hexToRgba, calculateOpacity } from "../utils/reductOpacity";
import { getUserIdFromToken } from "../utils/tokenUtils";
// @ts-ignore
import { API_URL } from "@env";

type User = {
  id: string;
  createdAt: string;
  ranking: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
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
};
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

export default function HomeScreen({}) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { location, loading: locationLoading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const isLoading = locationLoading || loadingReports || loadingUsers;
  const [smarterData, setSmarterData] = useState<
    { id: string; username: string; image: { uri: string } }[]
  >([]);
  const [showFollowers, setShowFollowers] = useState(false); // État pour afficher les followers

  useEffect(() => {
    // Fonction principale regroupant les tâches
    const fetchData = async () => {
      try {
        // Récupération des données utilisateur
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
        const topUsersData = await topUsersResponse.json();
        interface TopUser {
          id: string;
          username: string;
          photos: { url: string }[];
        }

        interface FormattedUser {
          id: string;
          username: string;
          image: { uri: string };
        }

        const formattedData: FormattedUser[] = topUsersData.map((user: TopUser) => ({
          id: user.id,
          username: user.username,
          image: { uri: user.photos[0]?.url || "default-image-url" },
        }));
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
  }, [location]); // Ajouter `location` comme dépendance

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

  if (showFollowers) {
    return (
      <View style={styles.container}>
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

  const screenWidth = Dimensions.get("window").width;

  const data = {
    labels: ["Danger", "Travaux", "Défaut", "Autre"],
    datasets: [
      {
        data: [20, 35, 10, 25], // Remplacez par vos données de statistiques réelles
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#f9f9fb",
    backgroundGradientTo: "#f9f9fb",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 204, 110, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e3e3e3",
    },
  };

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

  const featuredEvents = [
    {
      id: "1",
      title: "Exposition d'art moderne au centre Paul André Lequimme",
      image: require("../assets/images/event1.png"),
    },
    {
      id: "2",
      title: "Chasse aux oeufs de Pâques organisé au jardin public",
      image: require("../assets/images/event2.png"),
    },
    {
      id: "3",
      title: "Concert de jazz en plein air",
      image: require("../assets/images/event3.png"),
    },
    {
      id: "4",
      title: "Festival des lumières - Illumination des monuments historiques",
      image: require("../assets/images/event4.png"),
    },
    {
      id: "5",
      title: "Atelier de peinture pour enfants au parc municipal",
      image: require("../assets/images/event5.png"),
    },
    {
      id: "6",
      title: "Marché fermier et dégustation de produits locaux",
      image: require("../assets/images/event6.png"),
    },
    {
      id: "7",
      title: "Projection en plein air de films classiques",
      image: require("../assets/images/event7.png"),
    },
    {
      id: "8",
      title: "Journée portes ouvertes des pompiers",
      image: require("../assets/images/event8.png"),
    },
  ];

  const upcomingEvents = [
    {
      id: "1",
      title: "Marché d'Haubourdin",
      date: "08:00 - 12:30",
      location: "Place Ernest Blondeau",
    },
    {
      id: "2",
      title: "Sortie : Découverte du parc Mosaïc",
      date: "15:00 - 15:15",
      location: "Maison Des Jeunes D’Haubourdin",
    },
  ];
  return (
    <ScrollView style={styles.container}>
      {/* Section Profil */}
      <View style={styles.profileContainer}>
        {user?.profilePhoto?.url ? (
          <Image
            source={{ uri: user.profilePhoto.url }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.noProfileImageText}>Pas de photo de profil</Text>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userDetails}>
            Inscrit il y a{" "}
            {user?.createdAt
              ? calculateYearsSince(user.createdAt)
              : "un certain temps"}
          </Text>
          <TouchableOpacity onPress={toggleFollowersList}>
            <Text style={styles.userStats}>
              📈 {user?.followers?.length || 0} followers
            </Text>
          </TouchableOpacity>
          <Text style={styles.userRanking}>
            Classement: {user?.ranking || "Non classé"}
          </Text>
          <TouchableOpacity style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>
              ⭐⭐ Fiable à{" "}
              {user?.trustRate
                ? `${(user.trustRate * 100).toFixed(1)}%`
                : "Non disponible"}{" "}
              ⭐⭐
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Top 10 des Smarter</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {smarterData.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.smarterItem}
            onPress={() =>
              navigation.navigate("UserProfileScreen", { userId: item.id })
            } // Navigue vers UserProfile avec l'ID utilisateur
          >
            <Image source={item.image} style={styles.smarterImage} />
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
              index === reports.length - 1 && { marginBottom: 20 }, // Ajoute marginBottom uniquement au dernier élément
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
        style={{ marginBottom: 20 }}
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
        style={styles.horizontalScroll}
      >
        {featuredEvents.map((item) => (
          <View key={item.id} style={styles.featuredItem}>
            <Image source={item.image} style={styles.featuredImage} />
            <Text style={styles.featuredTitle}>{item.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Section Événements */}
      <Text style={styles.sectionTitle}>Tous les événements</Text>
      <View style={styles.calendarContainer}>
        <CalendarPicker
          onDateChange={(date) => console.log("Date sélectionnée :", date)}
          previousTitle="<" // Utilisez un symbole pour réduire la largeur du bouton précédent
          nextTitle=">" // Utilisez un symbole pour réduire la largeur du bouton suivant
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
        />
      </View>

      {/* List des évenements a venir */}
      {upcomingEvents.map((event) => (
        <View key={event.id} style={styles.eventItem}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDetails}>{event.date}</Text>
          <Text style={styles.eventLocation}>
            <Ionicons name="location-outline" size={16} /> {event.location}
          </Text>
        </View>
      ))}

      {/* Section Statistiques du Mois */}
      <Text style={styles.sectionTitle}>Statistiques du mois</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          yAxisLabel=" "
          yAxisSuffix=""
          fromZero
          style={{
            borderRadius: 16,
            marginLeft: -10,
          }}
        />
      </View>

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
          style={styles.profileImage}
        />
        <View style={styles.mayorInfo}>
          <Text style={styles.mayor}>Maire actuel:</Text>
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
          style={styles.profileImage}
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
