import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
  Animated,
  Platform,
  ImageBackground,
  Linking,
} from "react-native";
import axios from "axios";
import { Share } from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { useToken } from "../hooks/auth/useToken";
import { RootStackParamList } from "../types/navigation/routes.types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Sidebar from "../components/common/Sidebar";
import { useNotification } from "../context/NotificationContext";
import { useUserProfile } from "../hooks/user/useUserProfile";
import { LinearGradient } from 'expo-linear-gradient';

// Constantes pour le design system
const { width, height } = Dimensions.get("window");
const COLORS = {
  primary: "#062C41",
  secondary: "#FF9800",
  accent: "#5D7FDB", // nouvelle couleur accent bleu
  danger: "#f44336",
  success: "#4CAF50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  cardDark: "#052436",
  border: "#E0E0E0",
  gradient: {
    primary: ["#062C41", "#0A4D6E"] as readonly [string, string],
    secondary: ["#FF9800", "#FFB547"] as readonly [string, string],
    success: ["#4CAF50", "#66BB6A"] as readonly [string, string],
    danger: ["#f44336", "#EF5350"] as readonly [string, string],
    disabled: ["#9E9E9E", "#BDBDBD"] as readonly [string, string],
  },
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#FFFFFF",
    muted: "#999999",
    accent: "#5D7FDB",
  },
};

interface Event {
  photos: { url: string }[];
  title: string;
  description: string;
  location: string;
  date: string;
  attendees: { user: Participant }[];
  organizer: Participant;
  useFullName: boolean;
}

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  photos?: { url: string }[];
  useFullName: boolean;
}

interface FormattedDate {
  dayMonth: string;
  year: number;
  time: string;
}

export default function EventDetails({ route }) {
  const { eventId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { unreadCount } = useNotification();
  const { getUserId } = useToken();
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const animatedButtonScale = useRef(new Animated.Value(1)).current;
  
  // États
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();

  const dummyFn = () => {};

  // Animation de bouton
  const animateButton = useCallback(() => {
    Animated.sequence([
      Animated.timing(animatedButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [animatedButtonScale]);

  // Format de date
  const formatEventDate = useCallback((dateString?: string): FormattedDate | "Date non disponible" => {
    if (!dateString) return "Date non disponible";
    
    const date = new Date(dateString);
    
    // Format pour jour et mois
    const dayMonth = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short"
    });
    
    // Format pour l'année
    const year = date.getFullYear();
    
    // Format pour l'heure
    const time = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
    
    return { dayMonth, year, time };
  }, []);

  // Fonction pour obtenir la photo de l'organisateur
  const getOrganizerPhotoUrl = useCallback((event: Event): string => {
    // Maintenant que le backend inclut les photos dans l'objet organizer
    if (event.organizer?.photos?.[0]?.url) {
      return event.organizer.photos[0].url;
    }
    
    // Chercher l'organisateur dans la liste des participants comme fallback
    const organizerInAttendees = event.attendees.find(
      attendee => attendee.user.id === event.organizer.id
    );
    
    if (organizerInAttendees?.user?.photos?.[0]?.url) {
      return organizerInAttendees.user.photos[0].url;
    }
    
    // Fallback sur une image par défaut
    return "https://via.placeholder.com/50";
  }, []);

  // Effet pour récupérer l'ID utilisateur
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
        Alert.alert(
          "Erreur de connexion",
          "Impossible de récupérer vos informations. Veuillez vérifier votre connexion internet et réessayer."
        );
      }
    };

    fetchUserId();
  }, [getUserId]);

  // Effet pour récupérer les détails de l'événement et vérifier l'inscription
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const url = `${API_URL}/events/${eventId}`;
        const response = await axios.get(url);
        setEvent(response.data);
        
        // Vérifier si l'utilisateur actuel est l'organisateur
        if (currentUserId && response.data.organizer) {
          const isUserOrganizer = response.data.organizer.id === currentUserId;
          setIsOrganizer(isUserOrganizer);
          
          // Si l'utilisateur est l'organisateur, on le considère automatiquement comme inscrit
          if (isUserOrganizer) {
            setIsRegistered(true);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des détails de l'événement :", error);
        Alert.alert(
          "Erreur de chargement",
          "Impossible de récupérer les détails de l'événement. Veuillez réessayer ultérieurement.",
          [{ text: "Réessayer", onPress: () => fetchEventDetails() }]
        );
        setIsLoading(false);
      }
    };

    const checkRegistration = async () => {
      if (!currentUserId) return;

      try {
        const url = `${API_URL}/events/${eventId}/is-registered?userId=${currentUserId}`;
        const response = await axios.get(url);
        setIsRegistered(response.data.isRegistered);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'inscription :", error);
      }
    };

    fetchEventDetails();

    if (currentUserId) {
      checkRegistration();
    }
  }, [eventId, currentUserId]);

  // Fonction pour faire défiler automatiquement le carrousel
  const autoPlayCarousel = useCallback(() => {
    if (!event?.photos || event.photos.length <= 1) return;
    
    const nextIndex = (currentIndex + 1) % event.photos.length;
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex?.({ animated: true, index: nextIndex });
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, event?.photos]);

  // Configurer l'intervalle pour le défilement automatique
  useEffect(() => {
    if (event?.photos && event.photos.length > 1) {
      const intervalId = setInterval(autoPlayCarousel, 5000);
      setAutoPlayInterval(intervalId);
      
      return () => {
        if (autoPlayInterval) {
          clearInterval(autoPlayInterval);
        }
      };
    }
  }, [autoPlayCarousel, event?.photos]);

  // Fonction pour aller à une diapositive spécifique
  const goToSlide = useCallback((index: number) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex?.({ animated: true, index });
    }
  }, []);

  // Fonction pour partager l'événement
  const handleShare = useCallback(async () => {
    if (!event) return;
    
    try {
      animateButton();
      const result = await Share.share({
        message: `Découvrez cet événement : ${event.title}\n\nDescription : ${
          event.description
        }\n\nLieu : ${event.location || "Emplacement non spécifié"}\n\nDate : ${
          event.date
            ? `${new Date(event.date).toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}`
            : "Date non disponible"
        }\n\nLien : https://smartcities.com/events/${eventId}`,
      });
    } catch (error) {
      console.error("Erreur lors du partage :", error);
      Alert.alert("Erreur", "Une erreur est survenue lors du partage.");
    }
  }, [event, eventId, animateButton]);

  // Fonction pour mettre en majuscule la première lettre
  const capitalizeFirstLetter = useCallback((string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }, []);

  // Fonction pour ouvrir/fermer la sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Fonction pour s'inscrire à l'événement
  const registerForEvent = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    try {
      animateButton();
      setIsLoading(true);
      await axios.post(`${API_URL}/events/${eventId}/join`, {
        userId: currentUserId,
      });

      Alert.alert(
        "✅ Inscription confirmée",
        "Votre inscription est enregistrée, nous avons hâte de vous y voir!",
        [{ text: "Super!" }]
      );

      setIsRegistered(true);

      const updatedEventResponse = await axios.get(`${API_URL}/events/${eventId}`);
      setEvent(updatedEventResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        Alert.alert("Erreur", "Événement ou utilisateur introuvable.");
      } else if (error.response?.status === 400) {
        Alert.alert("Information", "Vous êtes déjà inscrit à cet événement.");
      } else {
        Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.");
      }
      console.error("Erreur lors de l'inscription :", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, eventId, animateButton]);

  // Fonction pour se désinscrire de l'événement
  const unregisterFromEvent = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert("Erreur", "Utilisateur non identifié. Veuillez vous reconnecter.");
      return;
    }

    // Vérifier si l'utilisateur est l'organisateur
    if (isOrganizer) {
      Alert.alert(
        "Action impossible",
        "En tant qu'organisateur, vous ne pouvez pas vous désinscrire de votre propre événement.",
        [{ text: "Compris" }]
      );
      return;
    }

    try {
      animateButton();
      setIsLoading(true);
      await axios.delete(`${API_URL}/events/${eventId}/leave`, {
        data: { userId: currentUserId },
      });

      Alert.alert(
        "Désinscription enregistrée",
        "Vous pouvez vous réinscrire à tout moment si vous changez d'avis.",
        [{ text: "Compris" }]
      );
      
      setIsRegistered(false);

      setEvent((prevEvent) => {
        if (!prevEvent) return prevEvent;
        return {
          ...prevEvent,
          attendees: prevEvent.attendees.filter(
            (attendee) => attendee.user.id !== currentUserId
          ),
          photos: prevEvent.photos || [],
        };
      });
    } catch (error) {
      // Vérifier si l'erreur est liée à une tentative de désinscription de l'organisateur
      if (error.response?.status === 403) {
        Alert.alert(
          "Action impossible",
          "En tant qu'organisateur, vous ne pouvez pas vous désinscrire de votre propre événement.",
          [{ text: "Compris" }]
        );
      } else {
        console.error("Erreur lors de la désinscription :", error);
        Alert.alert("Erreur", "Une erreur est survenue lors de la désinscription.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, eventId, animateButton, isOrganizer]);

  // Fonction pour naviguer vers le profil d'un utilisateur
  const navigateToUserProfile = useCallback((userId: string) => {
    navigation.navigate("UserProfileScreen", { userId });
  }, [navigation]);

  // Fonction pour obtenir le nom d'affichage d'un utilisateur
  const getDisplayName = useCallback((user: Participant) => {
    if (user.useFullName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return `${user.username}`;
  }, []);

  // Fonction pour ouvrir l'application de navigation
  const handleMapNavigation = useCallback(() => {
    const address = encodeURIComponent(event?.location || '');
    const url = Platform.select({
      ios: `maps://app?daddr=${address}`,
      android: `geo:0,0?q=${address}`
    }) || '';

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
        Linking.openURL(browserUrl);
      }
    });
  }, [event?.location]);

  // Extraire les composants de la date
  const eventDate = formatEventDate(event?.date);

  // Effet de parallaxe pour l'image d'en-tête
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -150],
    extrapolate: 'clamp'
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 200, 300],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp'
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [350, 80],
    extrapolate: 'clamp'
  });

  // Effet de réduction du titre lors du défilement
  const titleScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50],
    extrapolate: 'clamp'
  });

  if (isLoading || !event || currentUserId === null) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des informations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header animé */}
      <Animated.View 
        style={[
          styles.header, 
          { height: headerHeight, zIndex: 10 }
        ]}
      >
        <Animated.View 
          style={[
            styles.imageContainer, 
            { 
              transform: [{ translateY: imageTranslateY }],
              opacity: imageOpacity
            }
          ]}
        >
          <FlatList
            ref={flatListRef}
            data={event.photos.length > 0 ? event.photos : [{ url: "https://via.placeholder.com/600/062C41/FFFFFF?text=Événement" }]}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onScroll={(e) => {
              const scrollPosition = e.nativeEvent.contentOffset.x;
              setCurrentIndex(Math.round(scrollPosition / Dimensions.get("window").width));
            }}
            scrollEventThrottle={32}
            renderItem={({ item }) => (
              <ImageBackground
                source={{ uri: item.url }}
                style={styles.imageBackground}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)'] as readonly [string, string, string]}
                  style={styles.imageGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </ImageBackground>
            )}
          />
        </Animated.View>
        
        {/* Navigation */}
        <View style={styles.navigationBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={handleShare}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
            >
              <Ionicons name="share-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={toggleSidebar}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
            >
              <Ionicons name="menu-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Indicateurs de pagination */}
        <View style={styles.paginationContainer}>
          {event.photos.length > 1 && event.photos.map((_, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.paginationDot, currentIndex === index && styles.paginationDotActive]}
              onPress={() => goToSlide(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      </Animated.View>
      
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Espace pour compenser la hauteur du header */}
        <View style={{ height: 390 }} />
        
        {/* Contenu principal */}
        <View style={styles.mainContent}>
          {/* Badge date */}
        
          
          {/* Titre et description */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{event.title}</Text>
            
            <View style={styles.organizerInfo}>
              <Text style={styles.organizedBy}>Organisé par:</Text>
              <TouchableOpacity 
                style={styles.organizerButton}
                onPress={() => event.organizer && navigateToUserProfile(event.organizer.id.toString())}
              >
                <Image 
                  source={{ 
                    uri: getOrganizerPhotoUrl(event)
                  }} 
                  style={styles.organizerPhoto} 
                />
                <Text style={styles.organizerName}>
                  {event.organizer
                    ? getDisplayName(event.organizer)
                    : "Organisateur inconnu"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Boutons d'action */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleMapNavigation}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4b6cb7', '#182848'] as readonly [string, string]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="navigate-circle-outline" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Itinéraire</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Animated.View style={{
              transform: [{ scale: animatedButtonScale }],
              flex: 2
            }}>
              {isOrganizer ? (
                // Si l'utilisateur est l'organisateur, afficher le bouton Organisateur
                <View
                  style={styles.organizerOnlyButton}
                >
                  <LinearGradient
                    colors={COLORS.gradient.secondary as readonly [string, string]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="star" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Organisateur</Text>
                  </LinearGradient>
                </View>
              ) : isRegistered ? (
                // Si l'utilisateur est inscrit mais n'est pas l'organisateur
                <TouchableOpacity
                  style={styles.unregisterButton}
                  onPress={unregisterFromEvent}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={COLORS.gradient.danger as readonly [string, string]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>Se désinscrire</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                // Si l'utilisateur n'est ni l'organisateur ni inscrit
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={registerForEvent}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={COLORS.gradient.success as readonly [string, string]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>S'inscrire</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
          
          {/* Détails de l'événement */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={22} color={COLORS.text.accent} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailText}>
                  {event.date
                    ? capitalizeFirstLetter(
                        new Date(event.date).toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      )
                    : "Date non disponible"}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={22} color={COLORS.text.accent} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Heure</Text>
                <Text style={styles.detailText}>
                  {event.date
                    ? new Date(event.date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Heure non disponible"}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location-outline" size={22} color={COLORS.text.accent} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Emplacement</Text>
                <Text style={styles.detailText}>
                  {event.location || "Localisation non précisée"}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>À propos de cet événement</Text>
            <Text style={styles.descriptionText}>{event.description}</Text>
          </View>
          
          {/* Participants */}
          <View style={styles.participantsCard}>
            <View style={styles.participantsHeader}>
              <Text style={styles.participantsTitle}>Participants</Text>
              <View style={styles.participantsCountBadge}>
                <Text style={styles.participantsCount}>{event.attendees.length}</Text>
              </View>
            </View>
            
            {event.attendees.length > 0 ? (
              <FlatList
                data={event.attendees}
                horizontal={false}
                scrollEnabled={false}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.participantsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.participantItem,
                      item.user.id === event.organizer.id && styles.organizerParticipantItem
                    ]}
                    onPress={() => navigateToUserProfile(item.user.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View style={styles.participantImageContainer}>
                      <Image
                        source={{
                          uri: item.user.photos?.[0]?.url || "https://via.placeholder.com/60"
                        }}
                        style={styles.participantImage}
                      />
                      {item.user.id === event.organizer.id && (
                        <View style={styles.organizerBadge}>
                          <Ionicons name="star" size={12} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.participantName} numberOfLines={1}>
                      {getDisplayName(item.user)}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noParticipantsText}>
                    Aucun participant pour le moment. Soyez le premier à vous inscrire !
                  </Text>
                }
              />
            ) : (
              <View style={styles.noParticipantsContainer}>
                <Ionicons name="people-outline" size={48} color="#CCCCCC" />
                <Text style={styles.noParticipantsText}>
                  Aucun participant pour le moment. Soyez le premier à vous inscrire !
                </Text>
              </View>
            )}
          </View>
          
          {/* Espace en bas */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>
      
      {/* Bouton flottant d'inscription rapide (visible seulement en mode non inscrit et pour les non-organisateurs) */}
      {!isRegistered && !isOrganizer && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={registerForEvent}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={COLORS.gradient.success as readonly [string, string]}
              style={styles.floatingButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    zIndex: 10,
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    overflow: "hidden",
  },
  imageBackground: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  navigationBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginRight: 10,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginLeft: 10,
  },
  paginationContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    bottom: 16,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.secondary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dateBadge: {
    position: "absolute",
    right: 20,
    bottom: 20,
    zIndex: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    overflow: "hidden",
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  dateTop: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 5,
    alignItems: "center",
  },
  dateDay: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: "700",
  },
  dateBottom: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingVertical: 3,
    alignItems: "center",
  },
  dateTime: {
    color: COLORS.text.light,
    fontSize: 12,
  },
  scrollContent: {
    backgroundColor: COLORS.background,
  },
  mainContent: {
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizedBy: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginRight: 8,
  },
  organizerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  organizerPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text.primary,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  locationButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 12,
    overflow: "hidden",
    height: 48,
  },
  registerButton: {
    borderRadius: 12,
    overflow: "hidden",
    height: 48,
  },
  unregisterButton: {
    borderRadius: 12,
    overflow: "hidden",
    height: 48,
  },
  organizerOnlyButton: {
    borderRadius: 12,
    overflow: "hidden",
    height: 48,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: COLORS.text.light,
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  detailIconContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  descriptionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  participantsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  participantsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  participantsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  participantsCountBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  participantsCount: {
    color: COLORS.text.light,
    fontSize: 14,
    fontWeight: "600",
  },
  participantsList: {
    width: "100%",
  },
  participantItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 16,
    maxWidth: "33.33%",
  },
  organizerParticipantItem: {
    // Styles spécifiques pour l'organisateur dans la liste des participants
  },
  participantImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  participantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  organizerBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  participantName: {
    fontSize: 12,
    color: COLORS.text.primary,
    textAlign: "center",
    fontWeight: "500",
    width: "80%",
  },
  noParticipantsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  noParticipantsText: {
    textAlign: "center",
    color: COLORS.text.muted,
    marginTop: 16,
    fontSize: 14,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 5,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  floatingButtonGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});