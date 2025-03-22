// Chemin: components/home/EventsSection/EventCalendar.tsx

import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated, 
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Event } from './event.types';
import CustomCalendar from './CustomCalendar';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants
const LIGHT_BLUE_BACKGROUND = '#F0F7FF';
// Dégradé blanc élégant pour les événements sélectionnés
const SELECTED_EVENT_GRADIENT_START = '#FFFFFF';
const SELECTED_EVENT_GRADIENT_END = '#FFFFFF';
// Dégradé standard maintenu pour les événements normaux
const NORMAL_EVENT_GRADIENT_START = '#f6f8fa';
const NORMAL_EVENT_GRADIENT_END = '#e8f0fe';

/**
 * Fonction utilitaire pour normaliser les dates
 */
const normalizeDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Composant pour afficher un événement individuel
 * @param event - L'événement à afficher
 * @param onPress - Fonction appelée lors du clic sur l'événement
 * @param isSelected - Indique si l'événement est dans un jour sélectionné
 */
const EventItem = memo(({ 
  event, 
  onPress,
  isSelected = true // Par défaut, tous les événements sont "sélectionnés" pour avoir le même style
}: { 
  event: Event, 
  onPress: (id: string) => void,
  isSelected?: boolean
}) => {
  const eventScaleAnim = useRef(new Animated.Value(1)).current;

  const handleEventPressIn = useCallback(() => {
    Animated.timing(eventScaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true
    }).start();
  }, [eventScaleAnim]);

  const handleEventPressOut = useCallback(() => {
    Animated.timing(eventScaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  }, [eventScaleAnim]);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  // Déterminer les couleurs du gradient en fonction de l'état de sélection
  const gradientColors: [string, string] = isSelected 
    ? [SELECTED_EVENT_GRADIENT_START, SELECTED_EVENT_GRADIENT_END]
    : [NORMAL_EVENT_GRADIENT_START, NORMAL_EVENT_GRADIENT_END];

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: eventScaleAnim }] },
        styles.eventItemContainer
      ]}
    >
      <TouchableOpacity
        style={[
          styles.eventItem,
          isSelected && styles.selectedEventItem
        ]}
        onPress={() => onPress(event.id)}
        activeOpacity={0.9}
        onPressIn={handleEventPressIn}
        onPressOut={handleEventPressOut}
      >
        <View style={styles.eventInfo}>
          <View style={styles.eventDateContainer}>
            <View style={[
              styles.dateCircle,
              isSelected && styles.selectedDateCircle
            ]}>
              <Text style={[
                styles.dateDay,
                isSelected && styles.selectedDateText
              ]}>
                {eventDate.getDate()}
              </Text>
              <Text style={[
                styles.dateMonth,
                isSelected && styles.selectedDateText
              ]}>
                {eventDate.toLocaleDateString("fr-FR", { month: 'short' })}
              </Text>
            </View>
          </View>
          <View style={styles.eventDetails}>
            <Text 
              style={[
                styles.eventTitle,
                isSelected && styles.selectedEventText
              ]} 
              numberOfLines={1}
            >
              {event.title}
            </Text>
            <Text 
              style={[
                styles.eventDate,
                isSelected && styles.selectedEventDateText
              ]}
            >
              {capitalizedDate}
            </Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text 
                style={[
                  styles.eventLocation,
                  isSelected && styles.selectedEventText
                ]} 
                numberOfLines={1}
              >
                {event.location}
              </Text>
            </View>
          </View>
        </View>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventGradient}
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

/**
 * Interface pour les propriétés du composant
 */
interface EventCalendarProps {
  events: Event[];
  onDateChange: (date: string) => void;
  onEventPress: (id: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  cityName?: string;
  getEventsForMonth?: (year: number, month: number) => Event[];
  getMarkedDatesForMonth?: (year: number, month: number) => Record<string, boolean>;
}

/**
 * Composant principal EventCalendar avec calendrier personnalisé
 */
const EventCalendar: React.FC<EventCalendarProps> = memo(({ 
  events, 
  onDateChange, 
  onEventPress,
  isVisible,
  toggleVisibility,
  cityName = "Haubourdin",
  getEventsForMonth,
  getMarkedDatesForMonth
}) => {
  // État et Refs
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Refs pour le scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const isNearTopRef = useRef(true);
  const isNearBottomRef = useRef(false);
  
  // Animation de pulsation pour le badge - SANS condition pour pulser même à zéro
  useEffect(() => {
    // Configuration de l'animation de pulsation sans condition
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(badgePulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    );
    
    // Démarrer l'animation immédiatement
    pulseAnimation.start();
    
    // Nettoyage lors du démontage du composant
    return () => {
      pulseAnimation.stop();
    };
  }, [badgePulse]); // Seulement dépendant de badgePulse
  
  // Préparer les dates marquées pour le calendrier à partir de getMarkedDatesForMonth
  const markedDates = useMemo(() => {
    if (getMarkedDatesForMonth) {
      const dates = getMarkedDatesForMonth(currentMonth.getFullYear(), currentMonth.getMonth());
      return dates;
    }
    
    // Fallback si getMarkedDatesForMonth n'est pas disponible
    const dates: Record<string, boolean> = {};
    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (
        eventDate.getFullYear() === currentMonth.getFullYear() &&
        eventDate.getMonth() === currentMonth.getMonth()
      ) {
        const dateStr = normalizeDate(eventDate);
        dates[dateStr] = true;
      }
    });
    
    return dates;
  }, [events, currentMonth, getMarkedDatesForMonth]);

  // Rotation pour l'animation de la flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Vérification des limites de défilement
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    // Définir un seuil pour détecter quand nous sommes proches des limites
    const threshold = 20; // pixels
    
    isNearTopRef.current = offsetY < threshold;
    isNearBottomRef.current = contentHeight > 0 && 
                             scrollViewHeight > 0 && 
                             offsetY + scrollViewHeight >= contentHeight - threshold;
  }, []);

  // Filtrer les événements pour la date sélectionnée ou obtenir tous les événements du mois
  useEffect(() => {
    // Utiliser LayoutAnimation pour une transition fluide
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut', property: 'opacity' }
    });
    
    if (selectedDate) {
      const selectedDateStr = normalizeDate(selectedDate);
      
      const filtered = events.filter(event => {
        const eventDateStr = normalizeDate(event.date);
        return eventDateStr === selectedDateStr;
      });
      
      setFilteredEvents(filtered);
    } else {
      // Si aucune date n'est sélectionnée, afficher tous les événements du mois
      const monthEvents = getEventsForMonth 
        ? getEventsForMonth(currentMonth.getFullYear(), currentMonth.getMonth()) 
        : events.filter(event => {
            const eventDate = new Date(event.date);
            return (
              eventDate.getFullYear() === currentMonth.getFullYear() &&
              eventDate.getMonth() === currentMonth.getMonth()
            );
          });
      
      setFilteredEvents(monthEvents);
    }
  }, [selectedDate, events, currentMonth, getEventsForMonth]);

  // Animation lors du changement de visibilité
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    
    Animated.timing(rotateAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, rotateAnim, opacityAnim]);

  // Animation pour l'effet de pression sur l'en-tête
  const handleHeaderPressIn = useCallback(() => {
    Animated.spring(headerScaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [headerScaleAnim]);

  const handleHeaderPressOut = useCallback(() => {
    Animated.spring(headerScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [headerScaleAnim]);

  // Gestion du changement de date
  const handleDateChange = useCallback((date: Date) => {
    // Animation fluide lors du changement de date
    LayoutAnimation.configureNext({
      duration: 250,
      update: { type: 'easeInEaseOut', property: 'opacity' }
    });
    
    setSelectedDate(date);
    onDateChange(normalizeDate(date));
  }, [onDateChange]);

  // Gestion du changement de mois
  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth(new Date(year, month, 1));
    
    // Réinitialiser la date sélectionnée lors du changement de mois
    setSelectedDate(null);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[
        styles.unifiedContainer,
        isVisible && styles.unifiedContainerActive
      ]}>
        {/* En-tête avec animation */}
        <Animated.View
          style={[
            styles.headerContainer,
            { 
              transform: [{ scale: headerScaleAnim }],
              backgroundColor: isVisible ? LIGHT_BLUE_BACKGROUND : '#FFFFFF',
              borderBottomLeftRadius: isVisible ? 0 : 20,
              borderBottomRightRadius: isVisible ? 0 : 20,
            },
          ]}
        >
          <Pressable
            onPress={toggleVisibility}
            onPressIn={handleHeaderPressIn}
            onPressOut={handleHeaderPressOut}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="event"
                    size={32}
                    color="#3a7bd5"
                  />
                </View>
                <View>
                  <Text style={styles.title}>Calendrier</Text>
                  <Text style={styles.subtitle}>
                    Événements prévus ce mois
                  </Text>
                </View>
              </View>

              <View style={styles.headerControls}>
                {/* Badge toujours visible avec animation de pulsation */}
                <Animated.View
                  style={[
                    styles.countBadge,
                    filteredEvents.length === 0 && styles.emptyCountBadge,
                    { transform: [{ scale: badgePulse }] }
                  ]}
                >
                  <Text style={styles.countText}>{filteredEvents.length}</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.arrowContainer,
                    { transform: [{ rotate: arrowRotation }] },
                  ]}
                >
                  <Text style={styles.arrowIcon}>⌄</Text>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Contenu principal quand visible */}
        {isVisible && (
          <Animated.View
            style={[
              styles.contentContainer, 
              { 
                opacity: opacityAnim,
                backgroundColor: LIGHT_BLUE_BACKGROUND,
                marginTop: 0,
              }
            ]}
          >
            <View style={styles.calendarContainer}>
              {/* Utilisation du calendrier personnalisé */}
              <CustomCalendar
                initialDate={currentMonth}
                markedDates={markedDates}
                onDateSelected={handleDateChange}
                selectedDate={selectedDate}
                onMonthChange={handleMonthChange}
              />
            </View>

            <View style={styles.eventsListContainer}>
              <Text style={styles.eventsListTitle}>
                {selectedDate 
                  ? `Événements du ${selectedDate.toLocaleDateString("fr-FR")}`
                  : "Tous les événements"}
              </Text>
              {filteredEvents.length > 0 ? (
                <View style={styles.eventsScrollContainer}>
                  <ScrollView 
                    ref={scrollViewRef}
                    style={styles.eventsScrollView}
                    contentContainerStyle={styles.eventsScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                    bounces={false}
                  >
                    {filteredEvents.map((event) => (
                      <EventItem 
                        key={event.id} 
                        event={event} 
                        onPress={onEventPress}
                        isSelected={true}
                      />
                    ))}
                    {/* Espace supplémentaire en bas pour permettre un défilement fluide */}
                    <View style={styles.scrollEndSpacer} />
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noEventsContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Text style={styles.emptyIcon}>🗓️</Text>
                  </View>
                  <Text style={styles.noEventsTitle}>Aucun événement</Text>
                  <Text style={styles.noEventsText}>
                    Aucun événement prévu pour cette date.
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
  },
  unifiedContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.08)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  unifiedContainerActive: {
    backgroundColor: LIGHT_BLUE_BACKGROUND,
  },
  headerContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(58, 123, 213, 0.2)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: "#3a7bd5",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  emptyCountBadge: {
    backgroundColor: "#3a7bd5", // Conserver la même couleur pour la cohérence
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#4F566B",
    fontWeight: "bold",
  },
  contentContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  eventsListContainer: {
    width: '100%',
    marginBottom: 5,
  },
  eventsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  eventsScrollContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: LIGHT_BLUE_BACKGROUND,
    maxHeight: 370, // Légèrement réduit pour assurer la visibilité au-delà
  },
  eventsScrollView: {
    backgroundColor: LIGHT_BLUE_BACKGROUND,
    paddingHorizontal: 8,
  },
  eventsScrollContent: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  scrollEndSpacer: {
  },
  eventItemContainer: {
    marginBottom: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  selectedEventItem: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  selectedDateCircle: {
    backgroundColor: '#F0F8FF', // Bleu très pâle
    borderWidth: 2,
    borderColor: '#3a7bd5', // Bordure bleue pour marquer la sélection
  },
  selectedDateText: {
    color: '#3a7bd5', // Maintient la cohérence avec la couleur principale
    fontWeight: '700',
  },
  selectedEventText: {
    color: '#333333', // Texte foncé sur fond blanc pour lisibilité
    fontWeight: '700', // Plus gras pour emphase
  },
  selectedEventDateText: {
    color: '#666666', // Gris moyen pour la date
  },
  eventGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  eventInfo: {
    flexDirection: 'row',
    padding: 16,
  },
  eventDateContainer: {
    marginRight: 16,
  },
  dateCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3a7bd5',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A76D0',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#4A5568',
    flex: 1,
  },
  noEventsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 24,
  },
  noEventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  }
});

export default EventCalendar;