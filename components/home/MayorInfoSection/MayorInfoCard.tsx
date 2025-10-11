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
  RefreshControl,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../../../utils/tokenUtils";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

interface MayorInfoCardProps {
  handlePressPhoneNumber: () => void;
}

/**
 * Composant MayorInfoCard simplifié avec UX améliorée
 * Affiche les informations de la ville, du maire, les événements et le classement
 */
export default function MayorInfoCard({
  handlePressPhoneNumber,
}: MayorInfoCardProps) {
  const navigation = useNavigation<any>();
  
  // ========== INTERFACES ==========
  interface User {
    id: string;
    username: string;
    displayName: string;
    ranking: number;
    image: { uri: string };
  }

  interface Event {
    title: string;
  }

  // ========== ÉTATS ==========
  // Données
  const [smarterData, setSmarterData] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const city = "HAUBOURDIN";

  // UI
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("updates");
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

  // Animations (simplifiées)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ========== CONTENU STATIQUE ==========
  const [newsContent] = useState([
    {
      id: 1,
      type: "alert",
      title: "Vigilance météo",
      date: "18 septembre 2024",
      content: "En raison des fortes pluies prévues cette semaine, nous vous recommandons de limiter vos déplacements.",
      icon: "🌧️",
      color: "#E53935"
    },
    {
      id: 2,
      type: "work",
      title: "Travaux Avenue de la Liberté",
      date: "15 septembre 2024",
      content: "Des travaux de réfection de la chaussée auront lieu du 25 au 30 septembre.",
      icon: "🚧",
      color: "#FF9800"
    },
    {
      id: 3,
      type: "success",
      title: "Fuite d'eau réparée",
      date: "20 septembre 2024",
      content: "La fuite d'eau signalée rue des Fleurs a été réparée. Merci pour votre signalement.",
      icon: "✅",
      color: "#43A047"
    },
    {
      id: 4,
      type: "event",
      title: "Festival des Arts Urbains",
      date: "30 septembre 2024",
      content: "Venez découvrir les talents locaux. Musique, danse, graffiti et bien plus encore!",
      icon: "🎭",
      color: "#1E88E5"
    },
  ]);

  const [publicServices] = useState([
    { id: 1, title: "Démarches", icon: "📝", description: "Carte d'identité, passeport..." },
    { id: 2, title: "Signaler", icon: "🚨", description: "Voirie, éclairage..." },
    { id: 3, title: "Sports", icon: "🏆", description: "Gymnases, stades..." },
    { id: 4, title: "Médiathèque", icon: "📚", description: "Horaires, catalogue..." },
  ]);

  // ========== EFFETS ==========
  useEffect(() => {
    // Animation d'entrée simple
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    fetchData();
  }, []);

  // ========== FONCTIONS DE RÉCUPÉRATION DE DONNÉES ==========
  const fetchData = async () => {
    try {
      setLoading(true);
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
      console.error("Erreur lors de la récupération des données:", error);
      setError(error.message || "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async (cityName: string) => {
    const response = await fetch(
      `${API_URL}/events?cityName=${encodeURIComponent(cityName)}`
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des événements.");
    }
    return response.json();
  };

  const fetchRankingByCity = async (userId: string, cityName: string) => {
    const response = await fetch(
      `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(cityName)}`
    );
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération du classement.");
    }
    return response.json();
  };

  // ========== FONCTION DE RAFRAÎCHISSEMENT ==========
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  // ========== RENDU ==========
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1E88E5"]}
            tintColor="#1E88E5"
          />
        }
      >
        {/* ========== EN-TÊTE VILLE ========== */}
        <LinearGradient
          colors={['#1E88E5', '#1565C0']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.cityName}>{city}</Text>
              <Text style={styles.citySubtitle}>Votre ville connectée</Text>
            </View>
            <View style={styles.weatherBadge}>
              <Text style={styles.weatherIcon}>☀️</Text>
              <Text style={styles.weatherTemp}>21°C</Text>
            </View>
          </View>

          {/* Stats rapides */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalUsers || "..."}</Text>
              <Text style={styles.statLabel}>Citoyens</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{events?.length || "0"}</Text>
              <Text style={styles.statLabel}>Événements</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{ranking ? `#${ranking}` : "..."}</Text>
              <Text style={styles.statLabel}>Votre rang</Text>
            </View>
          </View>

          {/* Actions rapides */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}>
              <Text style={styles.quickBtnIcon}>📢</Text>
              <Text style={styles.quickBtnText}>Actualités</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickBtn} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate("ReportScreen")}
            >
              <Text style={styles.quickBtnIcon}>🚨</Text>
              <Text style={styles.quickBtnText}>Signaler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn} activeOpacity={0.7}>
              <Text style={styles.quickBtnIcon}>📅</Text>
              <Text style={styles.quickBtnText}>Événements</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ========== NAVIGATION PAR ONGLETS ========== */}
        <View style={styles.tabs}>
          {["updates", "events", "services"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === "updates" ? "Actualités" : tab === "events" ? "Événements" : "Services"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ========== CONTENU ONGLET ACTUALITÉS ========== */}
        {activeTab === "updates" && (
          <View style={styles.content}>
            {/* Section Maire */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>👨‍💼</Text>
                <Text style={styles.cardTitle}>Le maire</Text>
              </View>
              
              <View style={styles.mayorContent}>
                <Image
                  source={require("../../../assets/images/mayor.png")}
                  style={styles.mayorImage}
                />
                <View style={styles.mayorInfo}>
                  <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
                  <Text style={styles.mayorRole}>Maire de {city}</Text>
                  <TouchableOpacity
                    style={styles.phoneBtn}
                    onPress={handlePressPhoneNumber}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.phoneBtnText}>📞 03 20 44 02 51</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Équipe municipale */}
              <View style={styles.teamSection}>
                <Text style={styles.teamTitle}>L'équipe municipale</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.teamScroll}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <View key={index} style={styles.teamMember}>
                      <Image
                        source={{
                          uri: `https://randomuser.me/api/portraits/${
                            index % 2 === 0 ? "men" : "women"
                          }/${index + 25}.jpg`,
                        }}
                        style={styles.teamMemberImage}
                      />
                      <Text style={styles.teamMemberName}>
                        {["M. Laurent", "Mme Dupont", "M. Moreau", "Mme Leroy", "M. Petit"][index]}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Actualités */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📢</Text>
                <Text style={styles.cardTitle}>Dernières actualités</Text>
              </View>

              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40));
                  setActiveNewsIndex(index);
                }}
              >
                {newsContent.map((news) => (
                  <View key={news.id} style={[styles.newsCard, { width: SCREEN_WIDTH - 40 }]}>
                    <View style={[styles.newsBadge, { backgroundColor: news.color }]}>
                      <Text style={styles.newsIcon}>{news.icon}</Text>
                    </View>
                    <Text style={styles.newsTitle}>{news.title}</Text>
                    <Text style={styles.newsDate}>{news.date}</Text>
                    <Text style={styles.newsContent}>{news.content}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Indicateurs */}
              <View style={styles.indicators}>
                {newsContent.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      activeNewsIndex === index && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Top contributeurs */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🏆</Text>
                <Text style={styles.cardTitle}>Top contributeurs</Text>
              </View>

              {smarterData.slice(0, 5).map((user, index) => (
                <TouchableOpacity
                  key={user.id}
                  style={styles.rankingItem}
                  onPress={() => navigation.navigate("UserProfileScreen", { userId: user.id })}
                  activeOpacity={0.7}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <Image
                    source={{ uri: user.image?.uri || "https://via.placeholder.com/150" }}
                    style={styles.userImage}
                  />
                  <Text style={styles.userName}>{user.displayName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ========== CONTENU ONGLET ÉVÉNEMENTS ========== */}
        {activeTab === "events" && (
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📅</Text>
                <Text style={styles.cardTitle}>Prochains événements</Text>
              </View>

              {events && events.length > 0 ? (
                events.slice(0, 5).map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.eventItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.eventDate}>
                      <Text style={styles.eventDay}>{15 + index}</Text>
                      <Text style={styles.eventMonth}>SEP</Text>
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>{event.title || "Événement"}</Text>
                      <Text style={styles.eventLocation}>📍 {city}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📅</Text>
                  <Text style={styles.emptyText}>Aucun événement prévu</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ========== CONTENU ONGLET SERVICES ========== */}
        {activeTab === "services" && (
          <View style={styles.content}>
            {/* Mairie */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🏢</Text>
                <Text style={styles.cardTitle}>Mairie de {city}</Text>
              </View>

              <Text style={styles.serviceText}>11 rue Sadi Carnot, 59320 {city}</Text>
              <TouchableOpacity style={styles.phoneBtn} onPress={handlePressPhoneNumber}>
                <Text style={styles.phoneBtnText}>📞 03 20 44 02 90</Text>
              </TouchableOpacity>

              <View style={styles.hoursSection}>
                <Text style={styles.hoursTitle}>Horaires d'ouverture</Text>
                <Text style={styles.hoursText}>Lun - Ven: 08:30 - 12:00, 13:30 - 17:00</Text>
                <Text style={styles.hoursText}>Sam: 09:00 - 12:00</Text>
              </View>
            </View>

            {/* Services */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📋</Text>
                <Text style={styles.cardTitle}>Services en ligne</Text>
              </View>

              <View style={styles.servicesGrid}>
                {publicServices.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.serviceItem}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.serviceDesc}>{service.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Urgences */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🚨</Text>
                <Text style={styles.cardTitle}>Numéros d'urgence</Text>
              </View>

              <View style={styles.emergencyGrid}>
                {[
                  { number: "15", name: "SAMU", color: "#E53935" },
                  { number: "17", name: "Police", color: "#1E88E5" },
                  { number: "18", name: "Pompiers", color: "#FF9800" },
                  { number: "112", name: "Urgences", color: "#43A047" },
                ].map((emergency) => (
                  <TouchableOpacity
                    key={emergency.number}
                    style={[styles.emergencyBtn, { backgroundColor: emergency.color }]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emergencyNumber}>{emergency.number}</Text>
                    <Text style={styles.emergencyName}>{emergency.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Smartcities</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// ========== STYLES SIMPLIFIÉS ==========
const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // En-tête
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight! + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cityName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  citySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  weatherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  weatherIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  weatherTemp: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },

  // Actions rapides
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
  },
  quickBtnIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickBtnText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Onglets
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#E3F2FD",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  tabTextActive: {
    color: "#1E88E5",
  },

  // Contenu
  content: {
    padding: 20,
  },

  // Cartes
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },

  // Maire
  mayorContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  mayorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  mayorInfo: {
    flex: 1,
  },
  mayorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  mayorRole: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 12,
  },
  phoneBtn: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  phoneBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E88E5",
  },

  // Équipe
  teamSection: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 16,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 12,
  },
  teamScroll: {
    paddingRight: 16,
  },
  teamMember: {
    alignItems: "center",
    marginRight: 16,
  },
  teamMemberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  teamMemberName: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },

  // Actualités
  newsCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
  },
  newsBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  newsIcon: {
    fontSize: 24,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    color: "#757575",
    marginBottom: 12,
  },
  newsContent: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: "#1E88E5",
    width: 24,
  },

  // Classement
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },

  // Événements
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  eventDate: {
    width: 50,
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 8,
  },
  eventDay: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  eventMonth: {
    fontSize: 12,
    color: "#1E88E5",
    fontWeight: "600",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: "#757575",
  },

  // État vide
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
  },

  // Services
  serviceText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 12,
    lineHeight: 20,
  },
  hoursSection: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  hoursText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 4,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  serviceItem: {
    width: "50%",
    padding: 8,
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: "#757575",
  },

  // Urgences
  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  emergencyBtn: {
    width: "50%",
    padding: 8,
    marginBottom: 8,
  },
  emergencyNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#757575",
  },
});