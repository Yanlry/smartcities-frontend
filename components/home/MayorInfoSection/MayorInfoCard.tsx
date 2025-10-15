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
  cityName: string;
}

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
    id: string; // Added id property
    title: string;
    cityName?: string;
    city?: string;
    location?: string;
  }

  // ========== ÉTATS ==========
  const [smarterData, setSmarterData] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
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

  // ================================
  // ✅ NORMALISATION
  // ================================
  const normalizeCityName = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // supprime les accents
      .replace(/['’]/g, "") // supprime les apostrophes
      .replace(/\s+/g, " ") // espaces multiples → 1 espace
      .replace(/\s*-\s*/g, "-"); // tirets entourés d'espaces → tiret simple
  };

  // ================================
  // ✅ EXTRAIRE LA VILLE DE L'ADRESSE
  // ================================
  const extractCityFromAddress = (address: string) => {
    if (!address) return "";

    // On prend la partie après le code postal avant la virgule
    // Exemple: "44 Rue du Petit Belgique, 59320 Haubourdin, France"
    // → "Haubourdin"
    const match = address.match(/\d{5}\s+([^,]+)/);
    if (match && match[1]) return normalizeCityName(match[1]);

    return normalizeCityName(address);
  };

  // ================================
  // ✅ FILTRE : match strict sur la ville extraite
  // ================================
  const isStrictCityMatch = (searchCity: string, eventLocation: string) => {
    if (!eventLocation) return false;

    const normalizedSearch = normalizeCityName(searchCity);
    const eventCity = extractCityFromAddress(eventLocation);

    return normalizedSearch === eventCity;
  };

  // ================================
  // ✅ FETCH EVENTS
  // ================================
  const fetchEvents = async () => {
    const response = await fetch(`${API_URL}/events`);
    if (!response.ok) throw new Error("Erreur événements");
    return response.json();
  };

  // ================================
  // ✅ FETCH DATA PRINCIPAL
  // ================================
  const fetchData = async () => {
    try {
      setLoading(true);

      const cityName = city;
      const userId = String(await getUserIdFromToken());
      if (!userId) return;

      // Récupération des événements + ranking
      const [eventsData, rankingData] = await Promise.all([
        fetchEvents(),
        fetchRankingByCity(userId, cityName),
      ]);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📅 Événements reçus de l'API: ${eventsData.length}`);

      eventsData.forEach((event: any, index: number) => {
        console.log(`\n📍 Événement ${index + 1}:`);
        console.log(`   Titre: ${event.title}`);
        console.log(`   cityName: ${event.cityName}`);
        console.log(`   city: ${event.city}`);
        console.log(`   location: ${event.location}`);
      });

      // Filtrage strict sur la ville
      const filteredEvents = eventsData.filter((event: any) => {
        const eventLocation =
          event.cityName || event.city || event.location || "";
        const match = isStrictCityMatch(cityName, eventLocation);

        console.log(`\n✓ Événement "${event.title}"`);
        console.log(`  Adresse: "${eventLocation}"`);
        console.log(
          `  Ville extraite: "${extractCityFromAddress(eventLocation)}"`
        );
        console.log(
          `  Correspond à "${cityName}" ? ${match ? "✅ OUI" : "❌ NON"}`
        );

        return match;
      });

      console.log(
        `\n🎯 Résultat du filtrage: ${filteredEvents.length} événements`
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      setEvents(filteredEvents);

      // ================================
      // Mapping ranking
      // ================================
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
      console.log("🔄 Actualisation des données avant affichage citoyen...");
      await Promise.all([fetchUserInfo(), fetchData(), fetchCityInfo()]);
      console.log("✅ Données actualisées !");
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
              colors={["#43A047"]}
              tintColor="#43A047"
            />
          }
        >
          <LinearGradient colors={["#43A047", "#2E7D32"]} style={styles.header}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.cityName}>Mairie de {city}</Text>
                <Text style={styles.citySubtitle}>Espace administration</Text>
              </View>
            </View>

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
                <Text style={styles.statNumber}>{cityInfo ? "✓" : "✗"}</Text>
                <Text style={styles.statLabel}>Profil rempli</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.previewButton}
              onPress={togglePreviewMode}
              activeOpacity={0.8}
            >
              <Text style={styles.previewButtonIcon}>👁️</Text>
              <Text style={styles.previewButtonText}>
                Voir comme un citoyen
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.content}>
            {!cityInfo && (
              <View style={styles.encourageCard}>
                <Text style={styles.encourageIcon}>🚀</Text>
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
                  <Text style={styles.encourageBtnText}>
                    Compléter maintenant
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>✏️</Text>
                <Text style={styles.cardTitle}>Gérer le contenu</Text>
              </View>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditCityInfoScreen")}
              >
                <Text style={styles.manageBtnIcon}>👨‍💼</Text>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>
                    Informations du maire
                  </Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.mayorName ? "Configuré" : "Non configuré"}
                  </Text>
                </View>
                <Text style={styles.manageBtnArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditTeamScreen")}
              >
                <Text style={styles.manageBtnIcon}>👥</Text>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>Équipe municipale</Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.teamMembers?.length || 0} membres
                  </Text>
                </View>
                <Text style={styles.manageBtnArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditNewsScreen")}
              >
                <Text style={styles.manageBtnIcon}>📢</Text>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>Actualités</Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.news?.length || 0} actualités publiées
                  </Text>
                </View>
                <Text style={styles.manageBtnArrow}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.manageBtn}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("EditServicesScreen")}
              >
                <Text style={styles.manageBtnIcon}>📋</Text>
                <View style={styles.manageBtnInfo}>
                  <Text style={styles.manageBtnTitle}>Services municipaux</Text>
                  <Text style={styles.manageBtnDesc}>
                    {cityInfo?.services?.length || 0} services
                  </Text>
                </View>
                <Text style={styles.manageBtnArrow}>→</Text>
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
            colors={["#1E88E5"]}
            tintColor="#1E88E5"
          />
        }
      >
        <LinearGradient colors={["#1E88E5", "#1565C0"]} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.citySubtitle}>Bienvenue à</Text>
              <Text style={styles.cityName}>{cityFormat}</Text>
            </View>
          </View>

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
              <Text style={styles.statNumber}>
                {ranking ? `#${ranking}` : "..."}
              </Text>
              <Text style={styles.statLabel}>Votre rang</Text>
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickBtn} activeOpacity={0.7}
              onPress={() => navigation.navigate("RankingScreen", { cityName: city })}>
              <Text style={styles.quickBtnIcon}>🏆</Text>
              <Text style={styles.quickBtnText}>Classement</Text>
            </TouchableOpacity>
          </View>

          {isMunicipality && isPreviewMode && (
            <TouchableOpacity
              style={styles.backToAdminButton}
              onPress={togglePreviewMode}
              activeOpacity={0.8}
            >
              <Text style={styles.backToAdminButtonIcon}>👨‍💼</Text>
              <Text style={styles.backToAdminButtonText}>Retour à l'admin</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        <View style={styles.tabs}>
          {["updates", "events", "services"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
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
                  <Text style={styles.cardIcon}>👨‍💼</Text>
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
                        <View style={styles.mayorImagePlaceholder}>
                          <Text style={styles.mayorImagePlaceholderText}>
                            Photo non disponible
                          </Text>
                        </View>
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
                            <Text style={styles.phoneBtnText}>
                              📞 {cityInfo.mayorPhone}
                            </Text>
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
                                  <View
                                    style={styles.teamMemberImagePlaceholder}
                                  >
                                    <Text
                                      style={
                                        styles.teamMemberImagePlaceholderText
                                      }
                                    >
                                      Photo non disponible
                                    </Text>
                                  </View>
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
                  <Text style={styles.cardIcon}>📢</Text>
                  <Text style={styles.cardTitle}>Dernières actualités</Text>
                </View>

                {cityInfo?.news?.length > 0 ? (
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
                      <View
                        key={news.id}
                        style={[styles.newsCard, { width: SCREEN_WIDTH - 40 }]}
                      >
                        <View
                          style={[
                            styles.newsBadge,
                            { backgroundColor: news.color || "#1E88E5" },
                          ]}
                        >
                          <Text style={styles.newsIcon}>
                            {news.icon || "📰"}
                          </Text>
                        </View>
                        <Text style={styles.newsTitle}>{news.title}</Text>
                        <Text style={styles.newsDate}>{news.date}</Text>
                        <Text style={styles.newsContent}>{news.content}</Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <EmptySection
                    icon="📰"
                    title="Aucune actualité"
                    message={`La mairie de ${city} n'a pas encore publié d'actualités.`}
                  />
                )}

                {cityInfo?.news?.length > 0 && (
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
                )}
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>🏆</Text>
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
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </View>
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
                <Text style={styles.cardIcon}>📅</Text>
                <Text style={styles.cardTitle}>Prochains événements</Text>
              </View>

              {events && events.length > 0 ? (
                events.slice(0, 5).map((event, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.eventItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("EventDetailsScreen", { eventId: event.id })}
                  >
                    <View style={styles.eventDate}>
                      <Text style={styles.eventDay}>{15 + index}</Text>
                      <Text style={styles.eventMonth}>SEP</Text>
                    </View>
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
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📅</Text>
                  <Text style={styles.emptyText}>
                    Aucun événement prévu pour {cityFormat}
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "services" && (
            <>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>🏢</Text>
                  <Text style={styles.cardTitle}>Mairie de {city}</Text>
                </View>

                {cityInfo?.address ? (
                  <>
                    <Text style={styles.serviceText}>{cityInfo.address}</Text>
                    {cityInfo.phone && (
                      <TouchableOpacity
                        style={styles.phoneBtn}
                        onPress={handlePressPhoneNumber}
                      >
                        <Text style={styles.phoneBtnText}>
                          📞 {cityInfo.phone}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {cityInfo.hours && (
                      <View style={styles.hoursSection}>
                        <Text style={styles.hoursTitle}>
                          Horaires d'ouverture
                        </Text>
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
                  <Text style={styles.cardIcon}>📋</Text>
                  <Text style={styles.cardTitle}>Services en ligne</Text>
                </View>

                {cityInfo?.services?.length > 0 ? (
                  <View style={styles.servicesGrid}>
                    {cityInfo.services.map((service: any) => (
                      <TouchableOpacity
                        key={service.id}
                        style={styles.serviceItem}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.serviceIcon}>{service.icon}</Text>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceDesc}>
                          {service.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
                      style={[
                        styles.emergencyBtn,
                        { backgroundColor: emergency.color },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.emergencyNumber}>
                        {emergency.number}
                      </Text>
                      <Text style={styles.emergencyName}>{emergency.name}</Text>
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
// ========== STYLES (inchangés) ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    paddingBottom: 20,
  },

  cityTextContainer: {
    alignItems: "center", // ✅ Centre le texte horizontalement
    justifyContent: "center", // ✅ Centre verticalement
  },

  citySubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: "uppercase",
    textAlign: "center", // ✅ S’assure que le texte est centré
  },

  cityName: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center", // ✅ Centre le texte
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  quickBtn: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "100%",
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
  content: {
    padding: 20,
  },
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
  emptySection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptySectionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptySectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySectionText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20,
  },
  encourageCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#43A047",
    borderStyle: "dashed",
  },
  encourageIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  encourageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
    textAlign: "center",
  },
  encourageText: {
    fontSize: 14,
    color: "#558B2F",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  encourageBtn: {
    backgroundColor: "#43A047",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  encourageBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  manageBtnIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  manageBtnInfo: {
    flex: 1,
  },
  manageBtnTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  manageBtnDesc: {
    fontSize: 14,
    color: "#757575",
  },
  manageBtnArrow: {
    fontSize: 20,
    color: "#757575",
  },
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
  mayorImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    padding: 8,
  },
  mayorImagePlaceholderText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#757575",
    textAlign: "center",
    lineHeight: 13,
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
  teamMemberImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    padding: 6,
  },
  teamMemberImagePlaceholderText: {
    fontSize: 8,
    fontWeight: "600",
    color: "#757575",
    textAlign: "center",
    lineHeight: 10,
  },
  teamMemberName: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
    maxWidth: 70,
  },
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
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#757575",
  },
  previewButton: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  previewButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  backToAdminButton: {
    backgroundColor: "rgba(67,160,71,0.95)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  backToAdminButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  backToAdminButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
