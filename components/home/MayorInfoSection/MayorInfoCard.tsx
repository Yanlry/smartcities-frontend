// Chemin : components/MayorInfoCard.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
  Easing,
  Linking,
  FlatList,
  RefreshControl,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../../../utils/tokenUtils";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface MayorInfoCardProps {
  handlePressPhoneNumber: () => void;
}

/**
 * Enhanced MayorInfoCard component with modern UI/UX optimized for youth engagement
 * Provides city information, mayor details, events and top user rankings
 */
export default function MayorInfoCard({
  handlePressPhoneNumber,
}: MayorInfoCardProps) {
  const navigation = useNavigation<any>();
  interface User {
    id: string;
    username: string;
    displayName: string;
    ranking: number;
    image: { uri: string };
  }

  const [smarterData, setSmarterData] = useState<User[]>([]);
  interface Event {
    title: string;
  }

  // Core data states (preserved from original)
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const city = "HAUBOURDIN";

  // UI Interaction states
  const [refreshing, setRefreshing] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    mayorInfo: true,
    cityUpdates: true,
    socialRanking: true,
    upcomingEvents: true,
    publicServices: false,
  });
  const [activeTab, setActiveTab] = useState("updates"); // updates, events, services

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnims = useRef(
    [...Array(5)].map(() => new Animated.Value(0))
  ).current;
  const cardScrollX = useRef(new Animated.Value(0)).current;
  const likeAnimations = useRef<Animated.Value[]>([]).current;

  // News content tabs (enhanced)
  const [newsContent] = useState([
    {
      id: 1,
      type: "alert",
      title: "Vigilance météo",
      date: "18 septembre 2024",
      content:
        "En raison des fortes pluies prévues cette semaine, nous vous recommandons de limiter vos déplacements et de vérifier les alertes météo régulièrement.",
      icon: "🌧️",
      likes: 24,
      comments: 7,
      shares: 3,
      images: ["weather_alert.jpg"],
      verified: true,
    },
    {
      id: 2,
      type: "work",
      title: "Travaux Avenue de la Liberté",
      date: "15 septembre 2024",
      content:
        "Des travaux de réfection de la chaussée auront lieu du 25 au 30 septembre. La circulation sera déviée. Veuillez suivre les panneaux de signalisation.",
      icon: "🚧",
      likes: 8,
      comments: 15,
      shares: 2,
      images: ["construction_work.jpg"],
      verified: true,
    },
    {
      id: 3,
      type: "success",
      title: "Fuite d'eau Rue des Fleurs",
      date: "20 septembre 2024",
      content:
        "La fuite d'eau signalée a été réparée. Merci pour votre signalement et votre patience.",
      icon: "✅",
      likes: 32,
      comments: 4,
      shares: 1,
      images: ["water_leak_fixed.jpg"],
      verified: true,
    },
    {
      id: 4,
      type: "event",
      title: "Festival des Arts Urbains",
      date: "30 septembre 2024",
      content:
        "Venez découvrir les talents locaux lors du Festival des Arts Urbains qui se tiendra sur la place centrale. Musique, danse, graffiti et bien plus encore!",
      icon: "🎭",
      likes: 67,
      comments: 23,
      shares: 14,
      images: ["urban_arts_festival.jpg"],
      verified: true,
    },
    {
      id: 5,
      type: "info",
      title: "Nouveau parc pour planches à roulettes",
      date: "14 septembre 2024",
      content:
        "La mairie est heureuse d'annoncer l'ouverture prochaine d'un nouveau skatepark à proximité du complexe sportif.",
      icon: "🛹",
      likes: 128,
      comments: 42,
      shares: 36,
      images: ["skatepark.jpg"],
      verified: true,
    },
  ]);

  // Public services section (new content)
  const [publicServices] = useState([
    {
      id: 1,
      title: "Démarches administratives",
      icon: "📝",
      action: "Prendre RDV",
      description: "Carte d'identité, passeport, etc.",
    },
    {
      id: 2,
      title: "Signaler un problème",
      icon: "🚨",
      action: "Signaler",
      description: "Voirie, éclairage, propreté...",
    },
    {
      id: 3,
      title: "Équipements sportifs",
      icon: "🏆",
      action: "Horaires",
      description: "Gymnases, stades, piscine...",
    },
    {
      id: 4,
      title: "Médiathèque",
      icon: "📚",
      action: "Explorer",
      description: "Horaires, réservations, catalogue",
    },
    {
      id: 5,
      title: "Transports",
      icon: "🚌",
      action: "Voir",
      description: "Bus, métro, vélos en libre-service",
    },
  ]);

  // Initialize like animations for news posts
  useEffect(() => {
    // Create a like animation value for each news item
    newsContent.forEach(() => {
      likeAnimations.push(new Animated.Value(0));
    });
  }, []);

  // Animation sequence for initial load
  useEffect(() => {
    // Start main component animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();

    // Fetch data
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingEvents(true);
        setError(null);

        const cityName = city;
        const userId = String(await getUserIdFromToken());
        if (!userId) {
          throw new Error("Impossible de récupérer l'ID utilisateur.");
        }

        const [eventsData, rankingData] = await Promise.all([
          fetchEvents(cityName),
          fetchRankingByCity(userId, cityName),
        ]);

        setEvents(eventsData);
        setSmarterData(
          rankingData.users.map((user: any) => ({
            id: user.id,
            displayName: user.useFullName
              ? `${user.firstName} ${user.lastName}`
              : user.username,
            ranking: user.ranking,
            image: { uri: user.photo || "https://via.placeholder.com/150" },
          }))
        );
        setRanking(rankingData.ranking);
        setTotalUsers(rankingData.totalUsers);
      } catch (error: any) {
        console.error(
          "Erreur lors de la récupération des données de ranking :",
          error
        );
        setError(error.message || "Erreur inconnue.");
      } finally {
        setLoading(false);
        setLoadingEvents(false);
      }
    };

    fetchData();
  }, []);

  // Data fetching functions (preserved from original)
  const fetchEvents = async (cityName: string) => {
    const eventsResponse = await fetch(
      `${API_URL}/events?cityName=${encodeURIComponent(cityName)}`
    );
    if (!eventsResponse.ok) {
      throw new Error("Erreur lors de la récupération des événements.");
    }
    return eventsResponse.json();
  };

  const fetchRankingByCity = async (userId: string, cityName: string) => {
    const rankingResponse = await fetch(
      `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
        cityName
      )}`
    );
    if (!rankingResponse.ok) {
      throw new Error(
        "Erreur lors de la récupération des utilisateurs populaires."
      );
    }
    return rankingResponse.json();
  };

  // Handle refresh pull down
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const cityName = city;
      const userId = String(await getUserIdFromToken());

      const [eventsData, rankingData] = await Promise.all([
        fetchEvents(cityName),
        fetchRankingByCity(userId, cityName),
      ]);

      // Update with new data
      setEvents(eventsData);
      setSmarterData(
        rankingData.users.map((user: any) => ({
          id: user.id,
          displayName: user.useFullName
            ? `${user.firstName} ${user.lastName}`
            : user.username,
          ranking: user.ranking,
          image: { uri: user.photo || "https://via.placeholder.com/150" },
        }))
      );
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    const index = Object.keys(expandedSections).indexOf(section);

    // Animate rotation on section toggle
    Animated.timing(rotateAnims[index], {
      toValue: expandedSections[section] ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle social interactions (likes, shares, etc.)
  const handleLike = (index: number) => {
    // Animate the like button press
    Animated.sequence([
      Animated.timing(likeAnimations[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimations[index], {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Render animated card indicator dots
  const renderCardIndicators = () => {
    return (
      <View style={styles.cardIndicators}>
        {newsContent.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setActiveCardIndex(index)}
            style={[
              styles.cardIndicator,
              activeCardIndex === index && styles.cardIndicatorActive,
            ]}
          />
        ))}
      </View>
    );
  };

  // Calculate rotation for section arrows
  const getRotationStyle = (index: number) => {
    return {
      transform: [
        {
          rotate: rotateAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "180deg"],
          }),
        },
      ],
    };
  };

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");

  return (
    <View
      style={[
        styles.container
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#062C41", "#1E88E5"]}
            tintColor="#062C41"
            title="Mise à jour..."
            titleColor="#666"
          />
        }
      >
        {/* City header with background */}
        <LinearGradient
          colors={['#062C41', '#0F3460']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cityHeader}
        >
          {/* Barre d'information principale */}
          <View style={styles.cityHeaderContent}>
            <View style={styles.cityInfoContainer}>
              <View style={styles.cityNameContainer}>
                <Text style={styles.cityName}>{city}</Text>
              </View>
              <View style={styles.weatherIndicator}>
                  <Text style={styles.weatherIcon}>☀️</Text>
                  <Text style={styles.weatherTemp}>21°C</Text>
                </View>
            </View>

            {/* Indicateurs d'activité */}
            <View style={styles.activityIndicatorsContainer}>
              <View style={styles.statusBar}>
                <View style={styles.statusItem}>
                  <View
                    style={[styles.statusDot, { backgroundColor: "#4CAF50" }]}
                  />
                  <Text style={styles.statusText}>
                    Services municipaux ouverts
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.alertButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.alertButtonText}>
                    Alertes actives (2)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalUsers || "..."}</Text>
                  <Text style={styles.statLabel}>Membres</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {events?.length || "..."}
                  </Text>
                  <Text style={styles.statLabel}>Événements</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {ranking ? `#${ranking}` : "..."}
                  </Text>
                  <Text style={styles.statLabel}>Votre rang</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Boutons d'action rapide améliorés */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>📢</Text>
              </View>
              <Text style={styles.quickActionText}>Actualités</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ReportScreen")}
            >
              <View
                style={[
                  styles.quickActionIconContainer,
                  { backgroundColor: "rgba(244, 67, 54, 0.2)" },
                ]}
              >
                <Text style={styles.quickActionIcon}>🚨</Text>
              </View>
              <Text style={styles.quickActionText}>Signaler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>📅</Text>
              </View>
              <Text style={styles.quickActionText}>Événements</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconContainer}>
                <Text style={styles.quickActionIcon}>📋</Text>
              </View>
              <Text style={styles.quickActionText}>Services</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Main content tabs navigation */}
        <View style={styles.contentTabs}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "updates" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("updates")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "updates" && styles.activeTabText,
              ]}
            >
              Actualités
            </Text>
            {activeTab === "updates" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "events" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("events")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "events" && styles.activeTabText,
              ]}
            >
              Événements
            </Text>
            {activeTab === "events" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "services" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("services")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "services" && styles.activeTabText,
              ]}
            >
              Services
            </Text>
            {activeTab === "services" && (
              <View style={styles.activeTabIndicator} />
            )}
          </TouchableOpacity>
        </View>

        {/* UPDATES TAB */}
        {activeTab === "updates" && (
          <>
            {/* Mayor information section */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("mayorInfo")}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleContainer}>
                  <View style={styles.sectionIconContainer}>
                    <Text style={styles.sectionIcon}>👨‍💼</Text>
                  </View>
                  <Text style={styles.sectionTitle}>
                    Le maire et son équipe
                  </Text>
                </View>
                <Animated.View style={getRotationStyle(0)}>
                  <Text style={styles.sectionArrow}>▼</Text>
                </Animated.View>
              </TouchableOpacity>

              {expandedSections.mayorInfo && (
                <Animated.View style={styles.mayorCard}>
                  <LinearGradient
                    colors={["#1a3a4a", "#2c5c78"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mayorGradient}
                  >
                    <View style={styles.mayorContent}>
                      <View style={styles.mayorProfileContainer}>
                        <Image
                          source={require("../../../assets/images/mayor.png")}
                          style={styles.mayorImage}
                        />
                        <View style={styles.mayorProfileBadge}>
                          <Text style={styles.mayorBadgeText}>Maire</Text>
                        </View>
                      </View>
                      <View style={styles.mayorDetails}>
                        <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
                        <Text style={styles.mayorTitle}>
                          Maire de <Text>{city}</Text>
                        </Text>
                        <Text style={styles.mayorSubtitle}>
                          Permanence sur rendez-vous
                        </Text>
                        <TouchableOpacity
                          style={styles.phoneButton}
                          onPress={handlePressPhoneNumber}
                          activeOpacity={0.8}
                        >
                          <View style={styles.phoneButtonContent}>
                            <Text style={styles.phoneButtonIcon}>📞</Text>
                            <Text style={styles.phoneButtonText}>
                              03 20 44 02 51
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.mayorActions}>
                      <TouchableOpacity
                        style={styles.mayorActionButton}
                        activeOpacity={0.8}
                      >
                        <View style={styles.mayorActionIconContainer}>
                          <Text style={styles.mayorActionIcon}>✉️</Text>
                        </View>
                        <Text style={styles.mayorActionText}>Contacter</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.mayorActionButton}
                        activeOpacity={0.8}
                      >
                        <View style={styles.mayorActionIconContainer}>
                          <Text style={styles.mayorActionIcon}>📅</Text>
                        </View>
                        <Text style={styles.mayorActionText}>RDV</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.mayorActionButton}
                        activeOpacity={0.8}
                      >
                        <View style={styles.mayorActionIconContainer}>
                          <Text style={styles.mayorActionIcon}>📣</Text>
                        </View>
                        <Text style={styles.mayorActionText}>Suivre</Text>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>

                  {/* Team avatars row */}
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamTitle}>L'équipe municipale</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.teamScrollContent}
                    >
                      {Array.from({ length: 5 }).map((_, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.teamMemberContainer}
                          activeOpacity={0.9}
                        >
                          <Image
                            source={{
                              uri: `https://randomuser.me/api/portraits/${
                                index % 2 === 0 ? "men" : "women"
                              }/${index + 25}.jpg`,
                            }}
                            style={styles.teamMemberImage}
                          />
                          <Text style={styles.teamMemberName}>
                            {index === 0
                              ? "M. Laurent"
                              : index === 1
                              ? "Mme Dupont"
                              : index === 2
                              ? "M. Moreau"
                              : index === 3
                              ? "Mme Leroy"
                              : "M. Petit"}
                          </Text>
                          <Text style={styles.teamMemberRole}>
                            {index === 0
                              ? "Adjoint"
                              : index === 1
                              ? "Finances"
                              : index === 2
                              ? "Urbanisme"
                              : index === 3
                              ? "Jeunesse"
                              : "Culture"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </Animated.View>
              )}
            </View>

            {/* City updates section */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("cityUpdates")}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleContainer}>
                  <View style={styles.sectionIconContainer}>
                    <Text style={styles.sectionIcon}>📢</Text>
                  </View>
                  <Text style={styles.sectionTitle}>
                    Actualités de la ville
                  </Text>
                </View>
                <Animated.View style={getRotationStyle(1)}>
                  <Text style={styles.sectionArrow}>▼</Text>
                </Animated.View>
              </TouchableOpacity>

              {expandedSections.cityUpdates && (
                <View style={styles.updatesContainer}>
                  {/* Animated card carousel */}
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.newsCarouselContent}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: cardScrollX } } }],
                      { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(e) => {
                      const newIndex = Math.round(
                        e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32)
                      );
                      setActiveCardIndex(newIndex);
                    }}
                  >
                    {newsContent.map((news, index) => (
                      <Animated.View
                        key={news.id}
                        style={[styles.newsCard, { width: SCREEN_WIDTH - 32 }]}
                      >
                        <LinearGradient
                          colors={
                            news.type === "alert"
                              ? ["#FFEBEE", "#FFCDD2"]
                              : news.type === "work"
                              ? ["#FFF3E0", "#FFE0B2"]
                              : news.type === "success"
                              ? ["#E8F5E9", "#C8E6C9"]
                              : news.type === "event"
                              ? ["#E3F2FD", "#BBDEFB"]
                              : ["#F3E5F5", "#E1BEE7"]
                          }
                          style={styles.newsBadgeGradient}
                        >
                          <Text style={styles.newsBadgeText}>
                            {news.type === "alert"
                              ? "ALERTE"
                              : news.type === "work"
                              ? "TRAVAUX"
                              : news.type === "success"
                              ? "RÉSOLU"
                              : news.type === "event"
                              ? "ÉVÉNEMENT"
                              : "INFO"}
                          </Text>
                        </LinearGradient>

                        <View style={styles.newsCardHeader}>
                          <View style={styles.newsIconContainer}>
                            <Text style={styles.newsIcon}>{news.icon}</Text>
                          </View>
                          <View style={styles.newsTitleContainer}>
                            <Text style={styles.newsTitle}>{news.title}</Text>
                            <View style={styles.newsMetaContainer}>
                              <Text style={styles.newsDate}>{news.date}</Text>
                              {news.verified && (
                                <View style={styles.verifiedBadge}>
                                  <Text style={styles.verifiedIcon}>✓</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>

                        <Text style={styles.newsContent}>{news.content}</Text>

                        {/* Optional image placeholder */}
                        <View style={styles.newsImageContainer}>
                          <View style={styles.newsImagePlaceholder}>
                            <Text style={styles.newsImagePlaceholderText}>
                              {news.type === "alert"
                                ? "🌧️ Image d'alerte météo"
                                : news.type === "work"
                                ? "🚧 Image des travaux"
                                : news.type === "success"
                                ? "✅ Problème résolu"
                                : news.type === "event"
                                ? "🎭 Image de l'événement"
                                : "🛹 Image du skatepark"}
                            </Text>
                          </View>
                        </View>

                        {/* Social interaction buttons */}
                        <View style={styles.newsActions}>
                          <TouchableOpacity
                            style={styles.newsActionButton}
                            onPress={() => handleLike(index)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.newsActionIcon}>❤️</Text>
                            <Text style={styles.newsActionCount}>
                              {news.likes}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.newsActionButton}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.newsActionIcon}>💬</Text>
                            <Text style={styles.newsActionCount}>
                              {news.comments}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.newsActionButton}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.newsActionIcon}>↗️</Text>
                            <Text style={styles.newsActionCount}>
                              {news.shares}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.newsActionButton}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.newsActionIcon}>⋯</Text>
                          </TouchableOpacity>
                        </View>
                      </Animated.View>
                    ))}
                  </ScrollView>

                  {/* Card pagination indicators */}
                  {renderCardIndicators()}
                </View>
              )}
            </View>

            {/* Community / Social rankings section */}
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("socialRanking")}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleContainer}>
                  <View style={styles.sectionIconContainer}>
                    <Text style={styles.sectionIcon}>🏆</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Top contributeurs</Text>
                </View>
                <Animated.View style={getRotationStyle(2)}>
                  <Text style={styles.sectionArrow}>▼</Text>
                </Animated.View>
              </TouchableOpacity>

              {expandedSections.socialRanking && (
                <View style={styles.socialRankingContainer}>
                  <View style={styles.leaderboardHeader}>
                    <Text style={styles.leaderboardTitle}>
                      Classement des membres actifs
                    </Text>
                    <TouchableOpacity style={styles.rankingFilterButton}>
                      <Text style={styles.rankingFilterText}>Ce mois</Text>
                      <Text style={styles.rankingFilterIcon}>▼</Text>
                    </TouchableOpacity>
                  </View>

                  {/* User ranking grid */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.leaderboardScrollContent}
                    decelerationRate="fast"
                    snapToInterval={SCREEN_WIDTH * 0.75}
                    snapToAlignment="start"
                  >
                    <View style={styles.topThreeContainer}>
                      {smarterData.slice(0, 3).map((user, index) => {
                        const color =
                          index === 0
                            ? "#FFD700"
                            : index === 1
                            ? "#C0C0C0"
                            : "#CD7F32";
                        const scale =
                          index === 0 ? 1.15 : index === 1 ? 1.05 : 1;
                        const medal =
                          index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
                        const position = index === 0 ? 1 : index === 1 ? 0 : 2; // Reorder to show 1st in middle, 2nd on left, 3rd on right

                        return (
                          <TouchableOpacity
                            key={user.id}
                            style={[
                              styles.topUserContainer,
                              {
                                transform: [{ scale }],
                                zIndex: 3 - index,
                                alignSelf:
                                  position === 1
                                    ? "center"
                                    : position === 0
                                    ? "flex-start"
                                    : "flex-end",
                              },
                            ]}
                            onPress={() =>
                              navigation.navigate("UserProfileScreen", {
                                userId: user.id,
                              })
                            }
                            activeOpacity={0.9}
                          >
                            <View style={styles.medalContainer}>
                              <Text style={styles.medalEmoji}>{medal}</Text>
                            </View>
                            <View
                              style={[
                                styles.userImageBorder,
                                {
                                  borderColor: color,
                                },
                              ]}
                            >
                              <Image
                                source={{
                                  uri:
                                    user.image?.uri ||
                                    "https://via.placeholder.com/150",
                                }}
                                style={styles.topUserImage}
                              />
                            </View>
                            <Text style={styles.topUserName} numberOfLines={1}>
                              {user.displayName || "Utilisateur"}
                            </Text>
                            <View
                              style={[
                                styles.userScoreBadge,
                                {
                                  backgroundColor: color,
                                },
                              ]}
                            >
                              <Text style={styles.userScoreText}>
                                {Math.floor(Math.random() * 900) + 100} pts
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Rest of the leaderboard */}
                    <View style={styles.leaderboardList}>
                      {smarterData.slice(3, 8).map((user, index) => (
                        <TouchableOpacity
                          key={user.id}
                          style={styles.leaderboardItem}
                          onPress={() =>
                            navigation.navigate("UserProfileScreen", {
                              userId: user.id,
                            })
                          }
                          activeOpacity={0.8}
                        >
                          <View style={styles.leaderboardRank}>
                            <Text style={styles.leaderboardRankText}>
                              {index + 4}
                            </Text>
                          </View>
                          <Image
                            source={{
                              uri:
                                user.image?.uri ||
                                "https://via.placeholder.com/150",
                            }}
                            style={styles.leaderboardUserImage}
                          />
                          <View style={styles.leaderboardUserInfo}>
                            <Text style={styles.leaderboardUserName}>
                              {user.displayName || "Utilisateur"}
                            </Text>
                            <Text style={styles.leaderboardUserPoints}>
                              {Math.floor(Math.random() * 800) + 100} points
                            </Text>
                          </View>
                          <View style={styles.leaderboardBadge}>
                            <Text style={styles.leaderboardBadgeText}>
                              Actif
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Your ranking section */}
                    <View style={styles.yourRankingContainer}>
                      <Text style={styles.yourRankingTitle}>Votre rang</Text>
                      <View style={styles.yourRankingContent}>
                        <View style={styles.yourRankingNumber}>
                          <Text style={styles.yourRankingNumberText}>
                            {ranking ? `#${ranking}` : "..."}
                          </Text>
                        </View>
                        <View style={styles.yourRankingInfo}>
                          <Text style={styles.yourRankingText}>
                            sur {totalUsers || "..."} membres
                          </Text>
                          <TouchableOpacity style={styles.improveRankButton}>
                            <Text style={styles.improveRankText}>
                              Améliorer mon classement
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </ScrollView>

                  {/* Call to action button */}
                  <TouchableOpacity
                    style={styles.viewAllRanksButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewAllRanksText}>
                      Voir le classement complet
                    </Text>
                    <Text style={styles.viewAllRanksIcon}>→</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}

        {/* EVENTS TAB */}
        {activeTab === "events" && (
          <View style={styles.eventsTabContainer}>
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("upcomingEvents")}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleContainer}>
                  <View style={styles.sectionIconContainer}>
                    <Text style={styles.sectionIcon}>📅</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Événements à venir</Text>
                </View>
                <Animated.View style={getRotationStyle(3)}>
                  <Text style={styles.sectionArrow}>▼</Text>
                </Animated.View>
              </TouchableOpacity>

              {expandedSections.upcomingEvents && (
                <View style={styles.eventsContainer}>
                  {events && events.length > 0 ? (
                    <>
                      {/* Featured event card */}
                      <TouchableOpacity
                        style={styles.featuredEventCard}
                        activeOpacity={0.9}
                      >
                        <View style={styles.featuredEventImageContainer}>
                          <View style={styles.featuredEventImage}>
                            <Text style={styles.featuredEventImageText}>
                              🎭
                            </Text>
                          </View>
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={styles.featuredEventGradient}
                          />
                          <View style={styles.featuredEventOverlay}>
                            <View style={styles.eventDateBadge}>
                              <Text style={styles.eventDateDay}>30</Text>
                              <Text style={styles.eventDateMonth}>SEP</Text>
                            </View>
                            <Text style={styles.featuredEventTitle}>
                              Festival des Arts Urbains
                            </Text>
                            <View style={styles.featuredEventMetaContainer}>
                              <View style={styles.eventMetaItem}>
                                <Text style={styles.eventMetaIcon}>📍</Text>
                                <Text style={styles.eventMetaText}>
                                  Place centrale
                                </Text>
                              </View>
                              <View style={styles.eventMetaItem}>
                                <Text style={styles.eventMetaIcon}>🕒</Text>
                                <Text style={styles.eventMetaText}>
                                  14:00 - 22:00
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View style={styles.featuredEventContent}>
                          <Text style={styles.featuredEventDescription}>
                            Venez découvrir les talents locaux lors du Festival
                            des Arts Urbains. Musique, danse, graffiti et bien
                            plus encore!
                          </Text>
                          <View style={styles.eventActions}>
                            <TouchableOpacity style={styles.interestedButton}>
                              <Text style={styles.interestedButtonText}>
                                Intéressé(e)
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.shareEventButton}>
                              <Text style={styles.shareEventIcon}>↗️</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.eventStats}>
                            <Text style={styles.eventStatsText}>
                              128 personnes intéressées
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* List of other events */}
                      <View style={styles.eventsList}>
                        {events.slice(0, 4).map((event, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.eventListItem}
                            activeOpacity={0.8}
                          >
                            <View style={styles.eventListDateContainer}>
                              <Text style={styles.eventListDateDay}>
                                {15 + index}
                              </Text>
                              <Text style={styles.eventListDateMonth}>SEP</Text>
                            </View>
                            <View style={styles.eventListContent}>
                              <Text
                                style={styles.eventListTitle}
                                numberOfLines={1}
                              >
                                {event.title || "Événement de la ville"}
                              </Text>
                              <View style={styles.eventListMeta}>
                                <Text style={styles.eventListLocation}>
                                  📍 {city}, Salle municipale
                                </Text>
                                <Text style={styles.eventListTime}>
                                  🕒 19:00
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              style={styles.eventListActionButton}
                            >
                              <Text style={styles.eventListActionIcon}>+</Text>
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.showAllEventsButton}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.showAllEventsText}>
                            Voir tous les événements
                          </Text>
                          <Text style={styles.showAllEventsIcon}>→</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={styles.noEventsContainer}>
                      <View style={styles.noEventsIcon}>
                        <Text style={styles.noEventsEmoji}>📅</Text>
                      </View>
                      <Text style={styles.noEventsTitle}>
                        Aucun événement à venir
                      </Text>
                      <Text style={styles.noEventsDescription}>
                        Il n'y a pas d'événements prévus pour le moment dans
                        votre ville.
                      </Text>
                      <TouchableOpacity
                        style={styles.createEventButton}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.createEventText}>
                          Suggérer un événement
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Past events section */}
            <View style={styles.pastEventsContainer}>
              <Text style={styles.pastEventsTitle}>Événements passés</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pastEventsScrollContent}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.pastEventCard}
                    activeOpacity={0.9}
                  >
                    <View style={styles.pastEventImageContainer}>
                      <View style={styles.pastEventImage}>
                        <Text style={styles.pastEventEmoji}>
                          {index === 0
                            ? "🎸"
                            : index === 1
                            ? "🎨"
                            : index === 2
                            ? "🏃"
                            : "🎭"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pastEventContent}>
                      <Text style={styles.pastEventDate}>
                        {index === 0
                          ? "28 août 2024"
                          : index === 1
                          ? "15 août 2024"
                          : index === 2
                          ? "30 juillet 2024"
                          : "14 juillet 2024"}
                      </Text>
                      <Text style={styles.pastEventTitle}>
                        {index === 0
                          ? "Concert en plein air"
                          : index === 1
                          ? "Exposition d'art local"
                          : index === 2
                          ? "Course solidaire"
                          : "Fête nationale"}
                      </Text>
                      <View style={styles.pastEventMeta}>
                        <Text style={styles.pastEventMetaText}>
                          {Math.floor(Math.random() * 200) + 50} participants
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <View style={styles.servicesTabContainer}>
            <View style={styles.sectionContainer}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection("publicServices")}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleContainer}>
                  <View style={styles.sectionIconContainer}>
                    <Text style={styles.sectionIcon}>🏢</Text>
                  </View>
                  <Text style={styles.sectionTitle}>Services municipaux</Text>
                </View>
                <Animated.View style={getRotationStyle(4)}>
                  <Text style={styles.sectionArrow}>▼</Text>
                </Animated.View>
              </TouchableOpacity>

              {expandedSections.publicServices && (
                <View style={styles.servicesContainer}>
                  {/* Services featured card */}
                  <View style={styles.servicesFeaturedCard}>
                    <View style={styles.mayorOfficeCard}>
                      <View style={styles.mayorOfficeHeader}>
                        <Text style={styles.mayorOfficeTitle}>
                          Mairie de {city}
                        </Text>
                        <TouchableOpacity
                          style={styles.mayorOfficeAction}
                          onPress={() =>
                            Linking.openURL(
                              `https://maps.google.com/?q=Mairie+${city}`
                            )
                          }
                        >
                          <Text style={styles.mayorOfficeActionText}>
                            Itinéraire
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.mayorOfficeContent}>
                        <Image
                          source={require("../../../assets/images/mayor.png")}
                          style={styles.mayorOfficeImage}
                        />
                        <View style={styles.mayorOfficeInfo}>
                          <View style={styles.mayorOfficeInfoItem}>
                            <Text style={styles.mayorOfficeInfoLabel}>
                              Adresse
                            </Text>
                            <Text style={styles.mayorOfficeInfoText}>
                              11 rue Sadi Carnot{"\n"}59320 {city}
                            </Text>
                          </View>
                          <View style={styles.mayorOfficeInfoItem}>
                            <Text style={styles.mayorOfficeInfoLabel}>
                              Contact
                            </Text>
                            <TouchableOpacity onPress={handlePressPhoneNumber}>
                              <Text style={styles.mayorOfficePhone}>
                                03 20 44 02 90
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      <View style={styles.mayorOfficeHours}>
                        <Text style={styles.mayorOfficeHoursTitle}>
                          Horaires d'ouverture
                        </Text>
                        <View style={styles.mayorOfficeHoursContent}>
                          <View style={styles.mayorOfficeHoursItem}>
                            <Text style={styles.mayorOfficeDay}>Lun - Ven</Text>
                            <Text style={styles.mayorOfficeTime}>
                              08:30 - 12:00, 13:30 - 17:00
                            </Text>
                          </View>
                          <View style={styles.mayorOfficeHoursItem}>
                            <Text style={styles.mayorOfficeDay}>Samedi</Text>
                            <Text style={styles.mayorOfficeTime}>
                              09:00 - 12:00
                            </Text>
                          </View>
                          <View style={styles.mayorOfficeHoursItem}>
                            <Text style={styles.mayorOfficeDay}>
                              Dim & Jours fériés
                            </Text>
                            <Text style={styles.mayorOfficeTime}>Fermé</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Services grid */}
                  <View style={styles.servicesContent}>
                    <Text style={styles.servicesGridTitle}>
                      Services en ligne
                    </Text>
                    <View style={styles.servicesGrid}>
                      {publicServices.map((service) => (
                        <TouchableOpacity
                          key={service.id}
                          style={styles.serviceGridItem}
                          activeOpacity={0.8}
                        >
                          <View style={styles.serviceIconContainer}>
                            <Text style={styles.serviceIcon}>
                              {service.icon}
                            </Text>
                          </View>
                          <Text style={styles.serviceTitle}>
                            {service.title}
                          </Text>
                          <Text style={styles.serviceDescription}>
                            {service.description}
                          </Text>
                          <TouchableOpacity style={styles.serviceActionButton}>
                            <Text style={styles.serviceActionText}>
                              {service.action}
                            </Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  {/* Documents section */}
                  <View style={styles.documentsSection}>
                    <Text style={styles.documentsSectionTitle}>
                      Documents administratifs
                    </Text>
                    <Text style={styles.documentsSectionDescription}>
                      Téléchargez les formulaires et documents officiels de
                      votre mairie
                    </Text>

                    <View style={styles.documentsList}>
                      {[
                        "Acte de naissance",
                        "Autorisation de travaux",
                        "Inscription scolaire",
                        "Permis de construire",
                      ].map((doc, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.documentItem}
                          activeOpacity={0.8}
                        >
                          <View style={styles.documentIconContainer}>
                            <Text style={styles.documentIcon}>📄</Text>
                          </View>
                          <View style={styles.documentInfo}>
                            <Text style={styles.documentTitle}>{doc}</Text>
                            <Text style={styles.documentFormat}>
                              PDF - {Math.floor(Math.random() * 900) + 100} Ko
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.documentDownloadButton}
                          >
                            <Text style={styles.documentDownloadIcon}>↓</Text>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.allDocumentsButton}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.allDocumentsText}>
                        Tous les documents
                      </Text>
                      <Text style={styles.allDocumentsIcon}>→</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Emergency section */}
            <View style={styles.emergencySection}>
              <Text style={styles.emergencySectionTitle}>
                Numéros d'urgence
              </Text>

              <View style={styles.emergencyCards}>
                <TouchableOpacity
                  style={[styles.emergencyCard, styles.emergencyCardSamu]}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL("tel:15")}
                >
                  <Text style={styles.emergencyNumber}>15</Text>
                  <Text style={styles.emergencyName}>SAMU</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emergencyCard, styles.emergencyCardPolice]}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL("tel:17")}
                >
                  <Text style={styles.emergencyNumber}>17</Text>
                  <Text style={styles.emergencyName}>Police</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emergencyCard, styles.emergencyCardPompier]}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL("tel:18")}
                >
                  <Text style={styles.emergencyNumber}>18</Text>
                  <Text style={styles.emergencyName}>Pompiers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.emergencyCard, styles.emergencyCardEurope]}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL("tel:112")}
                >
                  <Text style={styles.emergencyNumber}>112</Text>
                  <Text style={styles.emergencyName}>Urgences</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Community support section */}
            <View style={styles.communitySupportSection}>
              <Text style={styles.communitySupportTitle}>
                Entraide communautaire
              </Text>

              <TouchableOpacity
                style={styles.communitySupportCard}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#062C41', '#0F3460']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.communitySupportGradient}
                >
                  <View style={styles.communitySupportContent}>
                    <Text style={styles.communitySupportEmoji}>👥</Text>
                    <Text style={styles.communitySupportText}>
                      Rejoignez le réseau d'entraide local pour aider ou
                      demander de l'aide à vos voisins.
                    </Text>
                    <TouchableOpacity style={styles.communitySupportButton}>
                      <Text style={styles.communitySupportButtonText}>
                        Découvrir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Footer section */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.footerContactButton}
            activeOpacity={0.8}
          >
            <Text style={styles.footerContactButtonText}>
              Contacter la mairie
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            © 2024 Smartcities - Tous droits réservés
          </Text>

          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Mentions légales</Text>
            </TouchableOpacity>
            <View style={styles.footerDivider} />
            <TouchableOpacity>
              <Text style={styles.footerLink}>Confidentialité</Text>
            </TouchableOpacity>
            <View style={styles.footerDivider} />
            <TouchableOpacity>
              <Text style={styles.footerLink}>Aide</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles optimisés
const styles = StyleSheet.create({
  // Styles généraux
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    width: "100%",
  },
  scrollViewContent: {
    paddingBottom: 30,
  },

  // Header de la ville
  cityHeader: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight,
    paddingBottom: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cityHeaderContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  cityInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cityNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cityName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginRight: 12,
  },
  weatherIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  weatherIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  weatherTemp: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  notificationBadge: {
    backgroundColor: "#FF5722",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  activityIndicatorsContainer: {
    marginBottom: 10,
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  alertButton: {
    backgroundColor: "rgba(255, 193, 7, 0.2)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.4)",
  },
  alertButtonText: {
    fontSize: 12,
    color: "#FFEB3B",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  quickActionButton: {
    alignItems: "center",
    width: "22%",
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  cityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cityBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#062C41",
  },

  // Navigation par onglets
  contentTabs: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    position: "relative",
  },
  activeTabButton: {
    backgroundColor: "#f0f7ff",
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8A94A6",
  },
  activeTabText: {
    color: "#0056B3",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "40%",
    backgroundColor: "#0056B3",
    borderRadius: 1.5,
    left: "30%",
  },

  // En-têtes de section
  sectionContainer: {
    marginHorizontal: 10,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
  },
  sectionArrow: {
    fontSize: 14,
    color: "#8A94A6",
  },

  // Maire et équipe municipale
  mayorCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mayorGradient: {
    padding: 16,
    borderRadius: 12,
  },
  mayorContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  mayorProfileContainer: {
    position: "relative",
    marginRight: 16,
  },
  mayorImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  mayorProfileBadge: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  mayorBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1E5A7B",
  },
  mayorDetails: {
    flex: 1,
  },
  mayorName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  mayorTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 5,
    fontWeight: "500",
  },
  mayorSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  phoneButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  phoneButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneButtonIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  phoneButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  mayorActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  mayorActionButton: {
    alignItems: "center",
  },
  mayorActionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  mayorActionIcon: {
    fontSize: 18,
  },
  mayorActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  teamContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 14,
  },
  teamScrollContent: {
    paddingBottom: 5,
  },
  teamMemberContainer: {
    alignItems: "center",
    marginRight: 18,
    width: 80,
  },
  teamMemberImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  teamMemberName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  teamMemberRole: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  seeAllTeamButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: 64,
    backgroundColor: "#F5F7FA",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  seeAllTeamText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0056B3",
    textAlign: "center",
  },

  // Actualités de la ville
  updatesContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  newsCarouselContent: {
    paddingBottom: 10,
    paddingHorizontal: 0,
  },
  newsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginRight: 16,
    marginBottom: 10,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: "relative",
  },
  newsBadgeGradient: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 1,
  },
  newsBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#333",
  },
  newsCardHeader: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "center",
  },
  newsIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  newsIcon: {
    fontSize: 22,
  },
  newsTitleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 4,
  },
  newsMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsDate: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "500",
  },
  verifiedBadge: {
    backgroundColor: "#4CAF50",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  verifiedIcon: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  newsContent: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4A5568",
    marginBottom: 16,
  },
  newsImageContainer: {
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  newsImagePlaceholder: {
    height: 150,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  newsImagePlaceholderText: {
    fontSize: 14,
    color: "#8A94A6",
    textAlign: "center",
  },
  newsActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 14,
  },
  newsActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  newsActionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  newsActionCount: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "600",
  },
  cardIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  cardIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
    marginHorizontal: 3,
  },
  cardIndicatorActive: {
    backgroundColor: "#0056B3",
    width: 20,
  },

  // Top utilisateurs / classements
  socialRankingContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
  },
  rankingFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rankingFilterText: {
    fontSize: 12,
    color: "#0056B3",
    marginRight: 5,
    fontWeight: "600",
  },
  rankingFilterIcon: {
    fontSize: 10,
    color: "#0056B3",
  },
  leaderboardScrollContent: {
    paddingBottom: 10,
  },
  topThreeContainer: {
    backgroundColor: "#FFFFFF",
    height: "100%",
    borderRadius: 12,
    padding: 16,
    marginRight: 10,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    width: Dimensions.get("window").width * 0.8,
  },
  topUserContainer: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  medalContainer: {
    position: "absolute",
    top: -15,
    zIndex: 1,
  },
  medalEmoji: {
    fontSize: 30,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userImageBorder: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    marginBottom: 5,
  },
  topUserImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  topUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
    textAlign: "center",
    maxWidth: 80,
  },
  userScoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userScoreText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  leaderboardList: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: Dimensions.get("window").width * 0.8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginRight: 10,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  leaderboardRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  leaderboardRankText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0056B3",
  },
  leaderboardUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  leaderboardUserInfo: {
    flex: 1,
  },
  leaderboardUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344055",
    marginBottom: 2,
  },
  leaderboardUserPoints: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "500",
  },
  leaderboardBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  leaderboardBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4CAF50",
  },
  yourRankingContainer: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: Dimensions.get("window").width * 0.8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  yourRankingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 16,
  },
  yourRankingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  yourRankingNumber: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0056B3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  yourRankingNumberText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  yourRankingInfo: {
    flex: 1,
  },
  yourRankingText: {
    fontSize: 14,
    color: "#8A94A6",
    marginBottom: 12,
    fontWeight: "500",
  },
  improveRankButton: {
    backgroundColor: "#F0F7FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  improveRankText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0056B3",
  },
  viewAllRanksButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  viewAllRanksText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0056B3",
    marginRight: 5,
  },
  viewAllRanksIcon: {
    fontSize: 16,
    color: "#0056B3",
  },

  // Événements
  eventsTabContainer: {
    marginTop: 10,
  },
  eventsContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  featuredEventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredEventImageContainer: {
    height: 180,
  },
  featuredEventImage: {
    flex: 1,
    backgroundColor: "#062C41",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredEventImageText: {
    fontSize: 50,
  },
  featuredEventGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  featuredEventOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  eventDateBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0056B3",
  },
  eventDateMonth: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8A94A6",
  },
  featuredEventTitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredEventMetaContainer: {
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  eventMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 5,
  },
  eventMetaIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  eventMetaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredEventContent: {
    padding: 16,
  },
  featuredEventDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4A5568",
    marginBottom: 16,
  },
  eventActions: {
    flexDirection: "row",
    marginBottom: 10,
  },
  interestedButton: {
    backgroundColor: "#0056B3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  interestedButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  shareEventButton: {
    backgroundColor: "#F0F7FF",
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  shareEventIcon: {
    fontSize: 20,
  },
  eventStats: {
    marginTop: 6,
  },
  eventStatsText: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "500",
  },
  eventsList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventListItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  eventListDateContainer: {
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    width: 52,
    marginRight: 16,
  },
  eventListDateDay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0056B3",
  },
  eventListDateMonth: {
    fontSize: 12,
    color: "#8A94A6",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  eventListContent: {
    flex: 1,
  },
  eventListTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#344055",
    marginBottom: 5,
  },
  eventListMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  eventListLocation: {
    fontSize: 12,
    color: "#8A94A6",
    marginRight: 12,
    fontWeight: "500",
  },
  eventListTime: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "500",
  },
  eventListActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  eventListActionIcon: {
    fontSize: 20,
    color: "#0056B3",
    fontWeight: "700",
  },
  showAllEventsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  showAllEventsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0056B3",
    marginRight: 5,
  },
  showAllEventsIcon: {
    fontSize: 16,
    color: "#0056B3",
  },
  noEventsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noEventsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  noEventsEmoji: {
    fontSize: 30,
  },
  noEventsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 10,
    textAlign: "center",
  },
  noEventsDescription: {
    fontSize: 14,
    color: "#8A94A6",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 20,
  },
  createEventButton: {
    backgroundColor: "#0056B3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createEventText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pastEventsContainer: {
    marginHorizontal: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  pastEventsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 16,
  },
  pastEventsScrollContent: {
    paddingRight: 16,
    paddingBottom: 10,
  },
  pastEventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: 160,
    marginRight: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pastEventImageContainer: {
    height: 100,
  },
  pastEventImage: {
    flex: 1,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  pastEventEmoji: {
    fontSize: 30,
  },
  pastEventContent: {
    padding: 14,
  },
  pastEventDate: {
    fontSize: 12,
    color: "#8A94A6",
    marginBottom: 5,
    fontWeight: "500",
  },
  pastEventTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 6,
  },
  pastEventMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  pastEventMetaText: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "500",
  },

  // Services
  servicesTabContainer: {
    marginTop: 10,
  },
  servicesContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  servicesFeaturedCard: {
    marginBottom: 20,
  },
  mayorOfficeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mayorOfficeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F0F7FF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  mayorOfficeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
  },
  mayorOfficeAction: {
    backgroundColor: "#0056B3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mayorOfficeActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  mayorOfficeContent: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  mayorOfficeImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 16,
  },
  mayorOfficeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  mayorOfficeInfoItem: {
    marginBottom: 12,
  },
  mayorOfficeInfoLabel: {
    fontSize: 12,
    color: "#8A94A6",
    marginBottom: 3,
    fontWeight: "500",
  },
  mayorOfficeInfoText: {
    fontSize: 14,
    color: "#344055",
    lineHeight: 20,
    fontWeight: "500",
  },
  mayorOfficePhone: {
    fontSize: 14,
    color: "#0056B3",
    fontWeight: "700",
  },
  mayorOfficeHours: {
    padding: 16,
  },
  mayorOfficeHoursTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 12,
  },
  mayorOfficeHoursContent: {
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    padding: 12,
  },
  mayorOfficeHoursItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  mayorOfficeDay: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344055",
  },
  mayorOfficeTime: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "500",
  },
  servicesContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 16,
  },
  servicesGridTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 16,
    marginTop: 6,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    marginBottom: 20,
  },
  serviceGridItem: {
    width: "50%",
    padding: 6,
    marginBottom: 12,
  },
  serviceIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 12,
    color: "#8A94A6",
    marginBottom: 12,
    lineHeight: 18,
  },
  serviceActionButton: {
    backgroundColor: "#0056B3",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  serviceActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  documentsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentsSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 6,
  },
  documentsSectionDescription: {
    fontSize: 12,
    color: "#8A94A6",
    marginBottom: 16,
    lineHeight: 18,
  },
  documentsList: {
    marginBottom: 16,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  documentIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  documentIcon: {
    fontSize: 20,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344055",
    marginBottom: 3,
  },
  documentFormat: {
    fontSize: 12,
    color: "#8A94A6",
    fontWeight: "500",
  },
  documentDownloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  documentDownloadIcon: {
    fontSize: 18,
    color: "#0056B3",
    fontWeight: "700",
  },
  allDocumentsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  allDocumentsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0056B3",
    marginRight: 5,
  },
  allDocumentsIcon: {
    fontSize: 16,
    color: "#0056B3",
  },
  emergencySection: {
    marginTop: 16,
    marginHorizontal: 10,
    marginBottom: 24,
  },
  emergencySectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 16,
  },
  emergencyCards: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  emergencyCard: {
    width: "50%",
    padding: 6,
    marginBottom: 12,
    height: 90,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emergencyCardSamu: {
    backgroundColor: "#E53935",
  },
  emergencyCardPolice: {
    backgroundColor: "#1E88E5",
  },
  emergencyCardPompier: {
    backgroundColor: "#FF9800",
  },
  emergencyCardEurope: {
    backgroundColor: "#43A047",
  },
  emergencyNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  communitySupportSection: {
    marginHorizontal: 10,
    marginBottom: 30,
  },
  communitySupportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#344055",
    marginBottom: 16,
  },
  communitySupportCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  communitySupportGradient: {
    padding: 20,
  },
  communitySupportContent: {
    alignItems: "center",
  },
  communitySupportEmoji: {
    fontSize: 44,
    marginBottom: 16,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  communitySupportText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
    fontWeight: "500",
  },
  communitySupportButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  communitySupportButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  // Footer section
  footerSection: {
    marginHorizontal: 10,
    marginTop: 24,
    marginBottom: 16,
    alignItems: "center",
  },
  footerContactButton: {
    backgroundColor: "#0056B3",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 24,
    width: "100%",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  footerContactButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: {
    fontSize: 13,
    color: "#8A94A6",
    marginBottom: 12,
    fontWeight: "500",
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 13,
    color: "#0056B3",
    fontWeight: "600",
  },
  footerDivider: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#CCC",
    marginHorizontal: 8,
  },
});
