// Chemin: screens/ReportDetailsScreen.tsx

import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  SafeAreaView,
  FlatList,
  ScrollView,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  Easing,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useLocation } from "../hooks/location/useLocation";
import { useFetchReportDetails } from "../hooks/reports/useFetchReportDetails";
import { formatCity, formatDate } from "../utils/formatters";
import { getTypeIcon } from "../utils/typeIcons";
import Icon from "react-native-vector-icons/Ionicons";
import { useToken } from "../hooks/auth/useToken";
import { Alert } from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import CommentsSection from "../components/interactions/CommentsSection/CommentsSection";

/**
 * Interfaces pour le typage strict
 */
interface Photo {
  id: string;
  url: string;
}

interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  useFullName: boolean;
}

interface Report {
  id: number;
  title: string;
  description: string;
  type: string;
  latitude: number;
  longitude: number;
  city: string;
  createdAt: string;
  upVotes: number;
  downVotes: number;
  photos: Photo[];
  user: User;
  gpsDistance?: number;
}

interface RouteParams {
  reportId: number;
}

interface ReportDetailsProps {
  route: { params: RouteParams };
  navigation: any;
}

// Constants
const { width, height } = Dimensions.get("window");
const TABS = ['Détails', 'Carte', 'Commentaires'];

/**
 * Sous-composant pour le titre avec tooltip
 */
const HeaderTitle = memo(({ title, onPress }: { title: string; onPress: () => void }) => {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <Icon name="information-circle-outline" size={16} color="#666" style={styles.infoIcon} />
      </View>
    </TouchableOpacity>
  );
});

/**
 * Sous-composant pour le marqueur personnalisé
 */
const CustomMarker = memo(({ type, title, coordinate }: { type: string; title: string; coordinate: { latitude: number; longitude: number } }) => {
  return (
    <Marker
      coordinate={coordinate}
      title={title}
    >
      <View style={styles.markerContainer}>
        <Image
          source={getTypeIcon(type)}
          style={styles.markerIcon}
        />
      </View>
    </Marker>
  );
});

/**
 * Sous-composant pour les éléments de vote
 */
const VotingButtons = memo(({ votes, selectedVote, onVote }: { votes: { upVotes: number; downVotes: number }; selectedVote: string | null; onVote: (type: "up" | "down") => void }) => {
  return (
    <View style={styles.votingContainer}>
      <TouchableOpacity
        style={[
          styles.voteButton,
          selectedVote === "up" && styles.selectedUpVote
        ]}
        onPress={() => onVote("up")}
        activeOpacity={0.7}
      >
        <Icon 
          name="thumbs-up-outline" 
          size={20} 
          color={selectedVote === "up" ? "#fff" : "#4CAF50"} 
        />
        <Text 
          style={[
            styles.voteText, 
            selectedVote === "up" && styles.selectedVoteText
          ]}
        >
          Oui ({votes.upVotes})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.voteButton,
          selectedVote === "down" && styles.selectedDownVote
        ]}
        onPress={() => onVote("down")}
        activeOpacity={0.7}
      >
        <Icon 
          name="thumbs-down-outline" 
          size={20} 
          color={selectedVote === "down" ? "#fff" : "#F44336"} 
        />
        <Text 
          style={[
            styles.voteText, 
            selectedVote === "down" && styles.selectedVoteText
          ]}
        >
          Non ({votes.downVotes})
        </Text>
      </TouchableOpacity>
    </View>
  );
});

/**
 * Composant principal
 */
const ReportDetailsScreen: React.FC<ReportDetailsProps> = ({ route, navigation }) => {
  // Récupération des paramètres et initialisation des hooks
  const { reportId } = route.params;
  const { location } = useLocation();
  const { getUserId } = useToken();
  const { report, routeCoords, loading } = useFetchReportDetails(
    reportId,
    location?.latitude,
    location?.longitude
  );

  // Références
  const mapRef = useRef<MapView | null>(null);
  const titleLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const animatedTooltipOpacity = useRef(new Animated.Value(0)).current;
  const animatedTooltipScale = useRef(new Animated.Value(0.9)).current;
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  // États
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [titleTooltipVisible, setTitleTooltipVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [selectedVote, setSelectedVote] = useState<"up" | "down" | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  // Effets
  useEffect(() => {
    // Animation de l'indicateur d'onglet
    Animated.timing(indicatorPosition, {
      toValue: activeTab * (width / TABS.length),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  useEffect(() => {
    // Charger les données de l'utilisateur
    fetchUserId();
    
    // Nettoyer les états lors du démontage
    return () => {
      // Reset des animations
      animatedTooltipOpacity.setValue(0);
      animatedTooltipScale.setValue(0.9);
    };
  }, []);

  useEffect(() => {
    // Mettre à jour les votes lorsque le rapport change
    if (report) {
      updateVotes();
    }
  }, [report]);

  // Callbacks memoïsés
  const fetchUserId = useCallback(async () => {
    try {
      const userId = await getUserId();
      setCurrentUserId(userId);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ID utilisateur:", error);
    }
  }, [getUserId]);

  const updateVotes = useCallback(() => {
    if (report) {
      setVotes({
        upVotes: report.upVotes,
        downVotes: report.downVotes,
      });
    }
  }, [report]);

  const handleVote = useCallback(async (type: "up" | "down") => {
    if (!location || !report || !currentUserId) return;

    setSelectedVote(type);

    try {
      const payload = {
        reportId: report.id,
        userId: currentUserId,
        type,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const response = await fetch(`${API_URL}/reports/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Vote failed");
      }

      const result = await response.json();

      setVotes({
        upVotes: result.updatedVotes.upVotes,
        downVotes: result.updatedVotes.downVotes,
      });
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
      setSelectedVote(null);
    }
  }, [location, report, currentUserId]);

  const openPhotoModal = useCallback((index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalVisible(true);
  }, []);

  const closePhotoModal = useCallback(() => {
    setSelectedPhotoIndex(null);
    setPhotoModalVisible(false);
  }, []);

  const changeTab = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const handleMapReady = useCallback(() => {
    setMapReady(true);
    
    // Ajustement de la vue de la carte une fois prête
    if (mapRef.current && routeCoords?.length > 1) {
      try {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(routeCoords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500);
      } catch (error) {
        console.warn('Erreur lors de l\'ajustement de la carte:', error);
      }
    }
  }, [routeCoords]);

  // Gestion du tooltip pour le titre
  const showTitleTooltip = useCallback(() => {
    setTitleTooltipVisible(true);
    
    // Animation d'entrée du tooltip
    Animated.parallel([
      Animated.timing(animatedTooltipOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(animatedTooltipScale, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      })
    ]).start();
  }, []);

  const hideTitleTooltip = useCallback(() => {
    // Animation de sortie du tooltip
    Animated.parallel([
      Animated.timing(animatedTooltipOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(animatedTooltipScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      setTitleTooltipVisible(false);
    });
  }, []);

  const measureTitleLayout = useCallback((event: LayoutChangeEvent) => {
    if (!event || !event.nativeEvent) return;
    
    const { layout } = event.nativeEvent;
    const handle = event.target as unknown as { measure?: Function };
    
    if (handle && handle.measure) {
      handle.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        titleLayout.current = { x: pageX, y: pageY, width, height };
      });
    }
  }, []);

  // Rendu conditionnel pour l'état de chargement
  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  // Rendu conditionnel pour l'état d'erreur
  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={60} color="#F44336" />
        <Text style={styles.errorTitle}>Signalement introuvable</Text>
        <Text style={styles.errorMessage}>
          Le signalement demandé n'est pas disponible ou a été supprimé.
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Rendu principal
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <HeaderTitle 
          title={report.title} 
          onPress={showTitleTooltip} 
        />
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("NotificationsScreen")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Tooltip Modal pour afficher le titre complet */}
      {titleTooltipVisible && (
        <Modal
          visible={titleTooltipVisible}
          transparent={true}
          animationType="none"
          onRequestClose={hideTitleTooltip}
        >
          <TouchableWithoutFeedback onPress={hideTitleTooltip}>
            <View style={styles.tooltipOverlay}>
              <Animated.View 
                style={[
                  styles.titleTooltip,
                  {
                    opacity: animatedTooltipOpacity,
                    transform: [{ scale: animatedTooltipScale }],
                    top: Math.min(titleLayout.current.y + 60, height - 150), // Éviter de sortir de l'écran
                    left: 20,
                    right: 20,
                    maxWidth: width - 40
                  }
                ]}
              >
                <View style={styles.tooltipArrow} />
                <Text style={styles.tooltipText}>{report.title}</Text>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
      
      {/* Navigation par onglets */}
      <View style={styles.tabBarContainer}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === index && styles.activeTabButton
            ]}
            onPress={() => changeTab(index)}
          >
            <Text 
              style={[
                styles.tabText,
                activeTab === index && styles.activeTabText
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View 
          style={[
            styles.tabIndicator, 
            { 
              left: indicatorPosition,
              width: width / TABS.length 
            }
          ]} 
        />
      </View>
      
      {/* Contenu des onglets */}
      {activeTab === 0 && (
        // Onglet Détails
        <ScrollView 
          style={styles.tabContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          overScrollMode="always"
        >
          <View style={styles.detailsContainer}>
            {/* Badge de type */}
            <View style={styles.typeBadge}>
              <View style={styles.iconContainer}>
                <Image
                  source={getTypeIcon(report.type)}
                  style={styles.typeIcon}
                />
              </View>
              <Text style={styles.typeText}>{report.type.toUpperCase()}</Text>
            </View>
            
            {/* Section de vote */}
            <View style={styles.card}>
              <Text style={styles.votingTitle}>Avez-vous vu cet événement ?</Text>
              <VotingButtons 
                votes={votes} 
                selectedVote={selectedVote} 
                onVote={handleVote} 
              />
            </View>
            
            {/* Description et informations principales */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{report.description}</Text>
              
              <View style={styles.divider} />
              
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Icon name="location-outline" size={18} color="#666" />
                  <Text style={styles.metaText}>{formatCity(report.city)}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Icon name="time-outline" size={18} color="#666" />
                  <Text style={styles.metaText}>{formatDate(report.createdAt)}</Text>
                </View>
                
                {report.gpsDistance && (
                  <View style={styles.metaItem}>
                    <Icon name="car-outline" size={18} color="#666" />
                    <Text style={styles.metaText}>{report.gpsDistance.toFixed(1)} km</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Galerie photos */}
            {report.photos && report.photos.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <FlatList
                  data={report.photos}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={styles.photoContainer}
                      onPress={() => openPhotoModal(index)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: item.url }}
                        style={styles.photoThumbnail}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            
            {/* Informations sur l'auteur */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Signalé par</Text>
              <TouchableOpacity
                style={styles.userContainer}
                onPress={() => 
                  navigation.navigate("UserProfileScreen", { userId: report.user.id })
                }
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {report.user.firstName 
                      ? report.user.firstName.charAt(0).toUpperCase() 
                      : report.user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {report.user.useFullName
                      ? `${report.user.firstName} ${report.user.lastName}`
                      : report.user.username}
                  </Text>
                  <Text style={styles.userRole}>Citoyen contributeur</Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
      
      {activeTab === 1 && (
        // Onglet Carte avec optimisations pour éviter l'erreur bubblingEventTypes
        <View style={styles.mapContent}>
          <MapView
            ref={mapRef}
            style={styles.map}
            // Utilisation du provider par défaut pour éviter les problèmes
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: report.latitude,
              longitude: report.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsCompass={true}
            onMapReady={handleMapReady}
          >
            {/* Marqueur avec vérifications pour éviter les erreurs */}
            {mapReady && report.latitude && report.longitude && (
              <CustomMarker
                type={report.type}
                title={report.title}
                coordinate={{
                  latitude: report.latitude,
                  longitude: report.longitude,
                }}
              />
            )}
            
            {/* Polyline avec vérifications */}
            {mapReady && Array.isArray(routeCoords) && routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#2196F3"
                strokeWidth={4}
              />
            )}
          </MapView>
          
          {/* Overlay d'informations sur la carte */}
          <View style={styles.mapInfoCard}>
            <View style={styles.mapCardHeader}>
              <Text style={styles.mapCardTitle}>{report.title}</Text>
              <Text style={styles.mapCardLocation}>{formatCity(report.city)}</Text>
            </View>
            
            {report.gpsDistance && (
              <View style={styles.distanceContainer}>
                <Icon name="navigate-outline" size={18} color="#2196F3" />
                <Text style={styles.distanceText}>
                  À {report.gpsDistance.toFixed(1)} km de votre position
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
      
      {activeTab === 2 && (
        // Onglet Commentaires
        <View style={styles.commentsContent}>
          <CommentsSection report={report} />
        </View>
      )}
      
      {/* Modal Galerie Photos */}
      {photoModalVisible && selectedPhotoIndex !== null && report.photos && (
        <Modal
          visible={photoModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closePhotoModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={closePhotoModal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <FlatList
              data={report.photos}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              initialScrollIndex={selectedPhotoIndex}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.modalPhotoContainer}>
                  <Image
                    source={{ uri: item.url }}
                    style={styles.modalPhoto}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
            
            {/* Indicateur de position dans la galerie */}
            <View style={styles.photoIndicator}>
              <Text style={styles.photoIndicatorText}>
                {selectedPhotoIndex + 1}/{report.photos.length}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

// Styles optimisés
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    maxWidth: '90%',
    textAlign: "center",
  },
  infoIcon: {
    marginLeft: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleTooltip: {
    position: "absolute",
    backgroundColor: "rgba(33, 33, 33, 0.95)",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  tooltipArrow: {
    position: "absolute",
    top: -10,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgba(33, 33, 33, 0.95)",
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  activeTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2196F3",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#2196F3",
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  detailsContainer: {
    padding: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  typeIcon: {
    width: 20,
    height: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333333",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  metaContainer: {
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  photoContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  photoThumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },
  userRole: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  votingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  votingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  selectedUpVote: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  selectedDownVote: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  voteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginLeft: 8,
  },
  selectedVoteText: {
    color: "#FFFFFF",
  },
  mapContent: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapInfoCard: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapCardHeader: {
    marginBottom: 8,
  },
  mapCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
  },
  mapCardLocation: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
    marginLeft: 6,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerIcon: {
    width: 20,
    height: 20,
  },
  commentsContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
  },
  closeModalButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPhotoContainer: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  modalPhoto: {
    width: width,
    height: height * 0.7,
  },
  photoIndicator: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoIndicatorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ReportDetailsScreen;