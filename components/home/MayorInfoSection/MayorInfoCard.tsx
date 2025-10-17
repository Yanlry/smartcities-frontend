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
  RefreshControl,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../../../utils/tokenUtils";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface MayorInfoCardProps {
  handlePressPhoneNumber: () => void;
  cityName: string;
}

const emergencies: { number: string; name: string; colors: [string, string]; icon: string }[] = [
  { number: "15", name: "SAMU", colors: ["#FEE2E2", "#FECACA"], icon: "medical" },
  { number: "17", name: "Police", colors: ["#DBEAFE", "#BFDBFE"], icon: "shield" },
  { number: "18", name: "Pompiers", colors: ["#FED7AA", "#FDBA74"], icon: "flame" },
  { number: "112", name: "Urgences", colors: ["#D1FAE5", "#A7F3D0"], icon: "call" },
];

export default function MayorInfoCard({
  handlePressPhoneNumber,
  cityName,
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
    id: string;
    title: string;
    cityName?: string;
    city?: string;
    location?: string;
  }

  interface Report {
    id: string;
    title: string;
    cityName?: string;
    city?: string;
    location?: string;
  }
  // ========== ÉTATS ==========
  const [smarterData, setSmarterData] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [ranking, setRanking] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const formatCityName = (cityName: string) =>
    cityName
      .toLowerCase()
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("-");

  const cityFormat = formatCityName(cityName);
  const city = cityName;

  const [isMunicipality, setIsMunicipality] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [cityInfo, setCityInfo] = useState<any>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("updates");
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);

  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ========== EFFETS ==========
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    fetchUserInfo();
    fetchData();
    fetchCityInfo();
  }, []);

  useEffect(() => {
    console.log(`🔄 La ville a changé : ${cityName}`);
    fetchData();
    fetchCityInfo();
  }, [cityName]);

  const fetchUserInfo = async () => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      const response = await fetch(`${API_URL}/users/${userId}`);
      if (!response.ok) return;

      const userData = await response.json();
      setUserInfo(userData);
      setIsMunicipality(userData.isMunicipality || false);
    } catch (error: any) {
      console.error("Erreur fetchUserInfo:", error);
    }
  };

  const fetchCityInfo = async () => {
    try {
      console.log(`📡 Chargement des infos pour : ${city}`);

      const response = await fetch(
        `${API_URL}/cityinfo?cityName=${encodeURIComponent(city)}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Infos de la ville ${city} trouvées:`, data);
        setCityInfo(data);
      } else if (response.status === 404) {
        console.log(
          `ℹ️ La ville ${city} n'a pas encore configuré ses informations`
        );
        setCityInfo(null);
      } else {
        console.error("❌ Erreur inattendue:", response.status);
        setCityInfo(null);
      }
    } catch (error) {
      console.error("❌ Erreur réseau:", error);
      setCityInfo(null);
    }
  };

  const normalizeCityName = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/['']/g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*-\s*/g, "-");
  };

  const extractCityFromAddress = (address: string) => {
    if (!address) return "";
    const match = address.match(/\d{5}\s+([^,]+)/);
    if (match && match[1]) return normalizeCityName(match[1]);
    return normalizeCityName(address);
  };

  const isStrictCityMatch = (searchCity: string, eventLocation: string) => {
    if (!eventLocation) return false;
    const normalizedSearch = normalizeCityName(searchCity);
    const eventCity = extractCityFromAddress(eventLocation);
    return normalizedSearch === eventCity;
  };

  const fetchEvents = async () => {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) throw new Error("Erreur événements");
    return response.json();
  };
  
  const fetchReports = async () => {
    const response = await fetch(`${API_URL}/reports`);
    if (!response.ok) throw new Error("Erreur rapports");
    return response.json();
  };
  
  const fetchData = async () => {
    try {
      setLoading(true);
  
      const cityName = city;
      const userId = String(await getUserIdFromToken());
      if (!userId) return;
  
      // ⚡️ On charge tout en parallèle : events + reports + ranking
      const [eventsData, reportsData, rankingData] = await Promise.all([
        fetchEvents(),
        fetchReports(),
        fetchRankingByCity(userId, cityName),
      ]);
  
      // --- 🎯 Filtrage des EVENTS par ville ---
      const filteredEvents = eventsData.filter((event: any) => {
        const eventLocation =
          event.cityName || event.city || event.location || "";
        return isStrictCityMatch(cityName, eventLocation);
      });
  
      // --- 🎯 Filtrage des REPORTS par ville ---
      const filteredReports = reportsData.filter((report: any) => {
        const reportLocation =
          report.cityName || report.city || report.location || "";
        return isStrictCityMatch(cityName, reportLocation);
      });
  
      // --- Mise à jour des états ---
      setEvents(filteredEvents);
      setReports(filteredReports);
  
      // --- Mapping du classement ---
      const usersRaw = Array.isArray(rankingData?.users)
        ? rankingData.users
        : [];
  
      const mapped = usersRaw
        .map((user: any) => {
          const displayName = user.useFullName
            ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
            : (user.username ?? "").trim();
  
          return {
            id: user.id,
            displayName,
            ranking: user.ranking,
            image: { uri: user.photo || "https://via.placeholder.com/150" },
          };
        })
        .filter((u: any) => {
          const normalized = (u.displayName ?? "").trim().toLowerCase();
          return !/^mairie\s*de\s+/i.test(normalized);
        });
  
      // --- Sauvegarde des données finales ---
      setSmarterData(mapped);
      setRanking(rankingData?.ranking ?? null);
      setTotalUsers(rankingData?.totalUsers ?? null);
    } catch (error: any) {
      console.error("Erreur fetchData:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchRankingByCity = async (userId: string, cityName: string) => {
    const response = await fetch(
      `${API_URL}/users/ranking-by-city?userId=${userId}&cityName=${encodeURIComponent(
        cityName
      )}`
    );
    if (!response.ok) throw new Error("Erreur classement");
    return response.json();
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), fetchCityInfo()]);
    setRefreshing(false);
  }, []);

  const togglePreviewMode = async () => {
    if (!isPreviewMode) {
      await Promise.all([fetchUserInfo(), fetchData(), fetchCityInfo()]);
    }
    setIsPreviewMode(!isPreviewMode);
  };

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const EmptySection = ({
    icon,
    title,
    message,
  }: {
    icon: string;
    title: string;
    message: string;
  }) => (
    <View style={styles.emptySection}>
      <Text style={styles.emptySectionIcon}>{icon}</Text>
      <Text style={styles.emptySectionTitle}>{title}</Text>
      <Text style={styles.emptySectionText}>{message}</Text>
    </View>
  );

  // ========== VERSION MAIRIE (Admin) ==========
  if (isMunicipality && !isPreviewMode) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#7C3AED"]}
              tintColor="#7C3AED"
            />
          }
        >
          {/* ✅ HEADER ADMIN AVEC DÉGRADÉ VIOLET */}
          <LinearGradient
            colors={["#1B5D85", "#1B5D85", "#1B5D85"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.adminHeaderGradient}
          >
            <View style={styles.adminHeaderContent}>
              {/* Nom de la ville */}
              <View style={styles.adminTitleContainer}>
                <Ionicons name="business" size={32} color="#FFFFFF" />
                <Text style={styles.adminCityName}>Mairie de {city}</Text>
              </View>

              {/* Statistiques colorées individuellement */}
              <View style={styles.adminStatsRow}>
                {/* Stat 1 - Citoyens (Bleu) */}
                <View style={styles.adminStatBox}>
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.adminStatGradient}
                  >
                    <Ionicons name="people" size={24} color="#FFFFFF" />
                    <Text style={styles.adminStatNumber}>{totalUsers || "..."}</Text>
                    <Text style={styles.adminStatLabel}>Citoyens</Text>
                  </LinearGradient>
                </View>

                {/* Stat 2 - Événements (Orange) */}
                <View style={styles.adminStatBox}>
                  <LinearGradient
                    colors={["#F97316", "#EA580C"]}
                    style={styles.adminStatGradient}
                  >
                    <Ionicons name="calendar" size={24} color="#FFFFFF" />
                    <Text style={styles.adminStatNumber}>{events?.length || "0"}</Text>
                    <Text style={styles.adminStatLabel}>Événements</Text>
                  </LinearGradient>
                </View>

                {/* Stat 3 - Profil (Vert/Rouge selon état) */}
                <View style={styles.adminStatBox}>
                  <LinearGradient
                    colors={cityInfo ? ["#10B981", "#059669"] : ["#EF4444", "#DC2626"]}
                    style={styles.adminStatGradient}
                  >
                    <Ionicons 
                      name="warning"
                      size={24} 
                      color="#FFFFFF" 
                    />
                    <Text style={styles.adminStatNumber}>{reports?.length || "0"}</Text>
                    <Text style={styles.adminStatLabel}>Signalements</Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Bouton Preview avec icône */}
              <TouchableOpacity
                style={styles.adminPreviewButton}
                onPress={togglePreviewMode}
                activeOpacity={0.8}
              >
                <Ionicons name="eye" size={18} color="#A855F7" />
                <Text style={styles.adminPreviewButtonText}>
                  Aperçu de la page en tant que citoyen
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {!cityInfo && (
              <LinearGradient
                colors={["#FEF3C7", "#FDE68A"]}
                style={styles.encourageCard}
              >
                <View style={styles.encourageIconContainer}>
                  <Ionicons name="rocket" size={32} color="#F59E0B" />
                </View>
                <Text style={styles.encourageTitle}>
                  Complétez votre profil municipal
                </Text>
                <Text style={styles.encourageText}>
                  Remplissez les informations de votre mairie pour apparaître
                  sur l'application et devenir une ville Smarter !
                </Text>
                <TouchableOpacity
                  style={styles.encourageBtn}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("EditCityInfoScreen")}
                >
                  <LinearGradient
                    colors={["#F59E0B", "#D97706"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.encourageBtnGradient}
                  >
                    <Text style={styles.encourageBtnText}>
                      Compléter maintenant
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            )}

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  style={styles.cardIconContainer}
                >
                  <Ionicons name="create" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.cardTitle}>Gérer le contenu</Text>
              </View>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditCityInfoScreen")}
              >
                <View style={[styles.manageBtnIconContainer, { backgroundColor: "#DBEAFE" }]}>
                  <Ionicons name="person" size={22} color="#2563EB" />
                </View>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>
                    Informations du maire
                  </Text>
                  <Text style={[
                    styles.manageBtnDesc,
                    cityInfo?.mayorName && { color: "#10B981" }
                  ]}>
                    {cityInfo?.mayorName ? "✓ Configuré" : "À compléter"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditTeamScreen")}
              >
                <View style={[styles.manageBtnIconContainer, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="people" size={22} color="#F59E0B" />
                </View>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>Équipe municipale</Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.teamMembers?.length || 0} membres
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditNewsScreen")}
              >
                <View style={[styles.manageBtnIconContainer, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="megaphone" size={22} color="#10B981" />
                </View>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>Actualités</Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.news?.length || 0} actualités
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.manageBtn, { borderBottomWidth: 0 }]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditServicesScreen")}
              >
                <View style={[styles.manageBtnIconContainer, { backgroundColor: "#FCE7F3" }]}>
                  <Ionicons name="list" size={22} color="#EC4899" />
                </View>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>Services municipaux</Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.services?.length || 0} services
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }
  
  // ========== VERSION CITOYENNE ==========
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
      >
        {/* ✅ HEADER CITOYEN AVEC DÉGRADÉ BLEU */}
        <LinearGradient
          colors={["#1B5D85", "#1B5D85", "#1B5D85"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.citizenHeaderGradient}
        >
          <View style={styles.citizenHeaderContent}>
            {/* Nom de la ville */}
            <Text style={styles.citizenWelcome}>Bienvenue à</Text>
            <Text style={styles.citizenCityName}>{cityFormat}</Text>

            {/* Statistiques en grille avec couleurs distinctes */}
            <View style={styles.citizenStatsGrid}>
              {/* Stat 1 - Citoyens (Rose) */}
              <View style={styles.citizenStatItem}>
                <LinearGradient
                  colors={["#EC4899", "#DB2777"]}
                  style={styles.citizenStatIconContainer}
                >
                  <Ionicons name="people" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.citizenStatNumber}>{totalUsers || "..."}</Text>
                <Text style={styles.citizenStatLabel}>Citoyens</Text>
              </View>

              {/* Stat 2 - Événements (Violet) */}
              <View style={styles.citizenStatItem}>
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  style={styles.citizenStatIconContainer}
                >
                  <Ionicons name="calendar" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.citizenStatNumber}>{events?.length || "0"}</Text>
                <Text style={styles.citizenStatLabel}>Événements</Text>
              </View>

              {/* Stat 3 - Rang (Orange) */}
              <View style={styles.citizenStatItem}>
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  style={styles.citizenStatIconContainer}
                >
                  <Ionicons name="warning" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.citizenStatNumber}>{reports?.length || "0"}</Text>
                <Text style={styles.citizenStatLabel}>Signalements</Text>
              </View>
            </View>

            {/* Bouton d'action avec dégradé */}
            <TouchableOpacity
              style={styles.citizenActionButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("RankingScreen", { cityName: city })}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F3F4F6"]}
                style={styles.citizenActionButtonGradient}
              >
                <Ionicons name="trophy" size={18} color="#2563EB" />
                <Text style={styles.citizenActionButtonText}>
                  Voir le classement
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bouton retour admin avec style amélioré */}
          {isMunicipality && isPreviewMode && (
            <TouchableOpacity
              style={styles.backToAdminButton}
              onPress={togglePreviewMode}
              activeOpacity={0.8}
            >
              <View style={styles.backToAdminContent}>
              <Ionicons name="eye" size={18} color="#A855F7" />
                <Text style={styles.backToAdminButtonText}>Retour administration</Text>
              </View>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Tabs avec couleur active */}
        <View style={styles.tabs}>
          {["updates", "events", "services"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              {activeTab === tab && (
                <LinearGradient
                  colors={["#DBEAFE", "#BFDBFE"]}
                  style={styles.tabActiveGradient}
                />
              )}
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "updates"
                  ? "Actualités"
                  : tab === "events"
                  ? "Événements"
                  : "Services"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {activeTab === "updates" && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Le maire</Text>
                </View>

                {cityInfo?.mayorName ? (
                  <>
                    <View style={styles.mayorContent}>
                      {cityInfo.mayorPhoto ? (
                        <Image
                          source={{ uri: cityInfo.mayorPhoto }}
                          style={styles.mayorImage}
                        />
                      ) : (
                        <LinearGradient
                          colors={["#DBEAFE", "#BFDBFE"]}
                          style={styles.mayorImagePlaceholder}
                        >
                          <Ionicons name="person" size={32} color="#3B82F6" />
                        </LinearGradient>
                      )}
                      <View style={styles.mayorInfo}>
                        <Text style={styles.mayorName}>
                          {cityInfo.mayorName}
                        </Text>
                        <Text style={styles.mayorRole}>
                          Maire de {cityFormat}
                        </Text>
                        {cityInfo.mayorPhone && (
                          <TouchableOpacity
                            style={styles.phoneBtn}
                            onPress={handlePressPhoneNumber}
                            activeOpacity={0.7}
                          >
                            <LinearGradient
                              colors={["#DBEAFE", "#BFDBFE"]}
                              style={styles.phoneBtnGradient}
                            >
                              <Ionicons name="call" size={14} color="#2563EB" />
                              <Text style={styles.phoneBtnText}>
                                {cityInfo.mayorPhone}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {cityInfo?.teamMembers?.length > 0 && (
                      <View style={styles.teamSection}>
                        <Text style={styles.teamTitle}>
                          L'équipe municipale
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.teamScroll}
                        >
                          {cityInfo.teamMembers.map(
                            (member: any, index: number) => (
                              <View key={index} style={styles.teamMember}>
                                {member.photo &&
                                member.photo !==
                                  "https://via.placeholder.com/150" ? (
                                  <Image
                                    source={{ uri: member.photo }}
                                    style={styles.teamMemberImage}
                                  />
                                ) : (
                                  <LinearGradient
                                    colors={["#FEF3C7", "#FDE68A"]}
                                    style={styles.teamMemberImagePlaceholder}
                                  >
                                    <Ionicons name="person" size={20} color="#F59E0B" />
                                  </LinearGradient>
                                )}
                                <Text style={styles.teamMemberName}>
                                  {member.name}
                                </Text>
                              </View>
                            )
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </>
                ) : (
                  <EmptySection
                    icon="🏛️"
                    title="Informations non disponibles"
                    message={`La mairie de ${city} n'a pas encore renseigné les informations du maire.`}
                  />
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="megaphone" size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Dernières actualités</Text>
                </View>

                {cityInfo?.news?.length > 0 ? (
                  <>
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(e) => {
                        const index = Math.round(
                          e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 40)
                        );
                        setActiveNewsIndex(index);
                      }}
                    >
                      {cityInfo.news.map((news: any) => (
                        <LinearGradient
                          key={news.id}
                          colors={["#87C2AE", "#FFFFFF"]}
                          style={[styles.newsCard, { width: SCREEN_WIDTH - 90 }]}
                        >
                          <View style={styles.newsBadge}>
                            <Text style={styles.newsIcon}>
                              {news.icon || "📰"}
                            </Text>
                          </View>
                          <Text style={styles.newsTitle}>{news.title}</Text>
                          <Text style={styles.newsDate}>{news.date}</Text>
                          <Text style={styles.newsContent}>{news.content}</Text>
                        </LinearGradient>
                      ))}
                    </ScrollView>
                    <View style={styles.indicators}>
                      {cityInfo.news.map((_: any, index: number) => (
                        <View
                          key={index}
                          style={[
                            styles.indicator,
                            activeNewsIndex === index && styles.indicatorActive,
                          ]}
                        />
                      ))}
                    </View>
                  </>
                ) : (
                  <EmptySection
                    icon="📰"
                    title="Aucune actualité"
                    message={`La mairie de ${city} n'a pas encore publié d'actualités.`}
                  />
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={["#F59E0B", "#D97706"]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="trophy" size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Top contributeurs</Text>
                </View>

                {smarterData.slice(0, 5).map((user, index) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.rankingItem}
                    onPress={() =>
                      navigation.navigate("UserProfileScreen", {
                        userId: user.id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        index === 0
                          ? ["#FCD34D", "#F59E0B"]
                          : index === 1
                          ? ["#D1D5DB", "#9CA3AF"]
                          : index === 2
                          ? ["#FCA5A5", "#F87171"]
                          : ["#DBEAFE", "#BFDBFE"]
                      }
                      style={styles.rankBadge}
                    >
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </LinearGradient>
                    <Image
                      source={{
                        uri:
                          user.image?.uri || "https://via.placeholder.com/150",
                      }}
                      style={styles.userImage}
                    />
                    <Text style={styles.userName}>
                      {user.displayName.length > 23
                        ? user.displayName.slice(0, 23) + "…"
                        : user.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {activeTab === "events" && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  style={styles.cardIconContainer}
                >
                  <Ionicons name="calendar" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.cardTitle}>Prochains événements</Text>
              </View>

              {events && events.length > 0 ? (
                events.slice(0, 5).map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.eventItem}
                    activeOpacity={0.7}
                    onPress={() =>
                      navigation.navigate("EventDetailsScreen", {
                        eventId: event.id,
                      })
                    }
                  >
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>
                        {event.title || "Événement"}
                      </Text>
                      <Text style={styles.eventLocation}>
                        📍{" "}
                        {event.cityName || event.city || event.location || city}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <EmptySection
                  icon="📅"
                  title="Aucun événement"
                  message={`Aucun événement prévu pour ${cityFormat}`}
                />
              )}
            </View>
          )}

          {activeTab === "services" && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="business" size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Mairie de {city}</Text>
                </View>

                {cityInfo?.address ? (
                  <>
                    <Text style={styles.serviceText}>{cityInfo.address}</Text>
                    {cityInfo.phone && (
                      <TouchableOpacity
                        style={styles.phoneBtn}
                        onPress={handlePressPhoneNumber}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={["#DBEAFE", "#BFDBFE"]}
                          style={styles.phoneBtnGradient}
                        >
                          <Ionicons name="call" size={14} color="#2563EB" />
                          <Text style={styles.phoneBtnText}>
                            {cityInfo.phone}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}

                    {cityInfo.hours && (
                      <View style={styles.hoursSection}>
                        <View style={styles.hoursHeader}>
                          <Ionicons name="time" size={16} color="#F59E0B" />
                          <Text style={styles.hoursTitle}>
                            Horaires d'ouverture
                          </Text>
                        </View>
                        <Text style={styles.hoursText}>{cityInfo.hours}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <EmptySection
                    icon="🏛️"
                    title="Informations non disponibles"
                    message={`La mairie de ${city} n'a pas encore renseigné ses coordonnées.`}
                  />
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="list" size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Services en ligne</Text>
                </View>

                {cityInfo?.services?.length > 0 ? (
                  <View style={styles.servicesGrid}>
                    {cityInfo.services.map((service: any, idx: number) => {
                      const gradients: [string, string][] = [
                        ["#DBEAFE", "#BFDBFE"], // Bleu
                        ["#FEF3C7", "#FDE68A"], // Jaune
                        ["#DCFCE7", "#BBF7D0"], // Vert
                        ["#FCE7F3", "#FBCFE8"], // Rose
                      ];
                      
                      const colors = gradients[idx % gradients.length];

                      return (
                        <TouchableOpacity
                          key={service.id}
                          style={styles.serviceItem}
                          activeOpacity={0.7}
                        >
                          <LinearGradient
                            colors={colors}
                            style={styles.serviceIconBox}
                          >
                            <Text style={styles.serviceIcon}>{service.icon}</Text>
                          </LinearGradient>
                          <Text style={styles.serviceTitle}>{service.title}</Text>
                          <Text style={styles.serviceDesc}>
                            {service.description}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <EmptySection
                    icon="📋"
                    title="Services non configurés"
                    message={`La mairie de ${city} n'a pas encore configuré ses services.`}
                  />
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    style={styles.cardIconContainer}
                  >
                    <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
                  </LinearGradient>
                  <Text style={styles.cardTitle}>Numéros d'urgence</Text>
                </View>

                <View style={styles.emergencyGrid}>
                {emergencies.map((emergency) => (
  <TouchableOpacity key={emergency.number} style={styles.emergencyBtn} activeOpacity={0.7}>
    <LinearGradient
      colors={emergency.colors} // ✅ TypeScript OK
      style={styles.emergencyBtnGradient}
    >
      <View style={styles.emergencyIconContainer}>
        <Ionicons
          name={emergency.icon as any}
          size={28}
          color={
            emergency.number === "15"
              ? "#EF4444"
              : emergency.number === "17"
              ? "#3B82F6"
              : emergency.number === "18"
              ? "#F97316"
              : "#10B981"
          }
        />
      </View>
      <Text style={styles.emergencyNumber}>{emergency.number}</Text>
      <Text style={styles.emergencyName}>{emergency.name}</Text>
    </LinearGradient>
  </TouchableOpacity>
))}

                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Smartcities</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

// ========== STYLES COMPLETS AVEC COULEURS ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ===== HEADER ADMIN AVEC DÉGRADÉ =====
  adminHeaderGradient: {
    paddingTop: Platform.OS === "ios" ? 20 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  adminHeaderContent: {
    // Le contenu est directement dans le gradient
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  adminTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  adminCityName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
  },
  adminStatsRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 12,
  },
  adminStatBox: {
    flex: 1,
  },
  adminStatGradient: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  adminStatNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginVertical: 8,
  },
  adminStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  adminPreviewButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminPreviewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    marginLeft: 8,
  },

  // ===== HEADER CITOYEN AVEC DÉGRADÉ =====
  citizenHeaderGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  citizenHeaderContent: {
    alignItems: "center",
  },
  locationIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  locationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  locationPulse: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  citizenWelcome: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  citizenCityName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 28,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  citizenStatsGrid: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 24,
    gap: 12,
  },
  citizenStatItem: {
    flex: 1,
    alignItems: "center",
  },
  citizenStatIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  citizenStatNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  citizenStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  citizenActionButton: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  citizenActionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  citizenActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 8,
  },

  // ===== BOUTON RETOUR ADMIN =====
  backToAdminButton: {
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backToAdminContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backToAdminButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
    marginLeft: 8,
  },

  // ===== CONTENU =====
  content: {
    padding: 20,
  },

  // ===== TABS AVEC GRADIENT =====
  tabs: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  tabActive: {
    // Le gradient sera ajouté dynamiquement
  },
  tabActiveGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#737373",
    zIndex: 1,
  },
  tabTextActive: {
    color: "#2563EB",
  },

  // ===== CARDS =====
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
  },

  // ===== EMPTY SECTION =====
  emptySection: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptySectionIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptySectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySectionText: {
    fontSize: 13,
    color: "#737373",
    textAlign: "center",
    lineHeight: 20,
  },

  // ===== ENCOURAGE CARD AVEC GRADIENT =====
  encourageCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  encourageIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  encourageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#78350F",
    marginBottom: 12,
    textAlign: "center",
  },
  encourageText: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  encourageBtn: {
    overflow: "hidden",
    borderRadius: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  encourageBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  encourageBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },

  // ===== MANAGE BUTTONS AVEC COULEURS =====
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  manageBtnIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  manageBtnInfo: {
    flex: 1,
  },
  manageBtnTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 4,
  },
  manageBtnDesc: {
    fontSize: 13,
    color: "#737373",
  },

  // ===== MAYOR SECTION =====
  mayorContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  mayorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#DBEAFE",
  },
  mayorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mayorInfo: {
    flex: 1,
  },
  mayorName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 4,
  },
  mayorRole: {
    fontSize: 13,
    color: "#737373",
    marginBottom: 12,
  },
  phoneBtn: {
    overflow: "hidden",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  phoneBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  phoneBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 6,
  },

  // ===== TEAM SECTION =====
  teamSection: {
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 20,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 16,
  },
  teamScroll: {
    paddingRight: 16,
  },
  teamMember: {
    alignItems: "center",
    marginRight: 16,
  },
  teamMemberImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  teamMemberImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  teamMemberName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#737373",
    textAlign: "center",
    maxWidth: 70,
  },

  // ===== NEWS SECTION AVEC GRADIENT =====
  newsCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  newsBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsIcon: {
    fontSize: 28,
  },
  newsTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#171717",
    marginBottom: 6,
  },
  newsDate: {
    fontSize: 12,
    color: "#737373",
    marginBottom: 12,
  },
  newsContent: {
    fontSize: 14,
    color: "#525252",
    lineHeight: 22,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: "#3B82F6",
    width: 24,
  },

  // ===== RANKING SECTION AVEC GRADIENTS =====
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
  },

  // ===== EVENT SECTION AVEC GRADIENT =====
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  eventDate: {
    width: 60,
    alignItems: "center",
    marginRight: 16,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  eventDay: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7C3AED",
  },
  eventMonth: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: "#737373",
  },

  // ===== SERVICE SECTION =====
  serviceText: {
    fontSize: 14,
    color: "#525252",
    marginBottom: 12,
    lineHeight: 22,
  },
  hoursSection: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  hoursHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78350F",
    marginLeft: 8,
  },
  hoursText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 20,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  serviceItem: {
    width: "50%",
    padding: 6,
  },
  serviceIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#171717",
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 12,
    color: "#737373",
    lineHeight: 18,
  },

  // ===== EMERGENCY SECTION AVEC GRADIENTS =====
  emergencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  emergencyBtn: {
    width: "50%",
    padding: 6,
  },
  emergencyBtnGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emergencyIconContainer: {
    marginBottom: 12,
  },
  emergencyNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#171717",
    textAlign: "center",
    marginBottom: 4,
  },
  emergencyName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#525252",
    textAlign: "center",
  },

  // ===== FOOTER =====
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#A3A3A3",
  },
});