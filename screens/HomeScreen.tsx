import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Alert,
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

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { location, loading: locationLoading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isLoading = locationLoading || loadingReports;

  useEffect(() => {
    const loadReports = async () => {
      if (!location) return;

      try {
        setLoadingReports(true);
        const reports = await processReports(
          location.latitude,
          location.longitude
        );
        setReports(reports);
      } catch (error) {
        console.error("Erreur lors du chargement des signalements :", error);
        Alert.alert("Erreur", error.message);
      } finally {
        setLoadingReports(false);
      }
    };

    loadReports();
  }, [location]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  if (!location) {
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

  // Fonction pour rediriger vers la page de signalements filtrés
  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    navigation.navigate("CategoryReports", { category }); // Passe la catégorie sélectionnée à la nouvelle page
  };

  if (loadingReports) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement en cours...</Text>
      </View>
    );
  }

  const handlePressReport = (id: number) => {
    navigation.navigate("ReportDetails", { reportId: id }); // Maintenant typé correctement
  };

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

  // Exemples de données
  const smarterData = [
    { id: "1", image: require("../assets/images/profil1.png") },
    { id: "2", image: require("../assets/images/profil2.png") },
    { id: "3", image: require("../assets/images/profil3.png") },
    { id: "4", image: require("../assets/images/profil4.png") },
    { id: "5", image: require("../assets/images/profil5.png") },
    { id: "6", image: require("../assets/images/profil6.png") },
    { id: "7", image: require("../assets/images/profil7.png") },
    { id: "8", image: require("../assets/images/profil8.png") },
    { id: "9", image: require("../assets/images/profil9.png") },
    { id: "10", image: require("../assets/images/profil10.png") },
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
        <Image
          source={require("../assets/images/profil.png")}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Yann leroy</Text>
          <Text style={styles.userDetails}>Inscrit il y a 1 ans</Text>
          <Text style={styles.userStats}>📈 187 followers</Text>
          <Text style={styles.userRanking}>Classement: 453 / 1245</Text>
          <TouchableOpacity style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>
              ⭐ Taux de fiabilité : 94% ⭐
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Top 10 des Smarter Actif */}
      <Text style={styles.sectionTitle}>Top 10 des Smarter</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {smarterData.map((item) => (
          <View key={item.id} style={styles.smarterItem}>
            <Image source={item.image} style={styles.smarterImage} />
          </View>
        ))}
      </ScrollView>

      {/* Section Signalements Proche de Vous */}
      <Text style={styles.sectionTitle}>Signalements proches de vous</Text>
      {reports.map((report, index) => (
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
      ))}

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
