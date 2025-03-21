// src/components/EventCalendar/EventCalendar.tsx

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
  ViewStyle,
  TextStyle
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

/**
 * Fonction utilitaire pour normaliser les dates
 */
const normalizeDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Composant pour afficher un événement individuel
 */
const EventItem = memo(({ 
  event, 
  onPress 
}: { 
  event: Event, 
  onPress: (id: string) => void 
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

  return (
    <Animated.View 
      style={[
        { transform: [{ scale: eventScaleAnim }] },
        styles.eventItemContainer
      ]}
    >
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => onPress(event.id)}
        activeOpacity={0.9}
        onPressIn={handleEventPressIn}
        onPressOut={handleEventPressOut}
      >
        <View style={styles.eventInfo}>
          <View style={styles.eventDateContainer}>
            <View style={styles.dateCircle}>
              <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
              <Text style={styles.dateMonth}>
                {eventDate.toLocaleDateString("fr-FR", { month: 'short' })}
              </Text>
            </View>
          </View>
          <View style={styles.eventDetails}>
            <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
            <Text style={styles.eventDate}>{capitalizedDate}</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.eventLocation} numberOfLines={1}>{event.location}</Text>
            </View>
          </View>
        </View>
        <LinearGradient
          colors={['#f6f8fa', '#e8f0fe']}
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
  cityName = "Haubourdin"
}) => {
  // État et Refs
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Préparer les dates marquées pour le calendrier
  const markedDates = useMemo(() => {
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
    
    console.log(`[EventCalendar] Dates marquées: ${Object.keys(dates).length}`);
    return dates;
  }, [events, currentMonth]);

  // Rotation pour l'animation de la flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Filtrer les événements pour la date sélectionnée
  useEffect(() => {
    if (selectedDate) {
      const selectedDateStr = normalizeDate(selectedDate.toISOString());
      
      const filtered = events.filter(event => {
        const eventDateStr = normalizeDate(event.date);
        return eventDateStr === selectedDateStr;
      });
      
      setFilteredEvents(filtered);
    } else {
      const filtered = events.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === currentMonth.getFullYear() &&
          eventDate.getMonth() === currentMonth.getMonth()
        );
      });
      setFilteredEvents(filtered);
    }
  }, [selectedDate, events, currentMonth]);

  // Animation de pulsation pour le badge
  useEffect(() => {
    if (events.length > 0) {
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
      
      pulseAnimation.start();
      
      return () => {
        pulseAnimation.stop();
      };
    }
  }, [events.length, badgePulse]);

  // Animation lors du changement de visibilité
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
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
    setSelectedDate(date);
    onDateChange(normalizeDate(date.toISOString()));
  }, [onDateChange]);

  const handleMonthChange = useCallback((year: number, month: number) => {
    setCurrentMonth(new Date(year, month, 1));
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
                    Événements prévus à {cityName}
                  </Text>
                </View>
              </View>

              <View style={styles.headerControls}>
                {filteredEvents.length > 0 && (
                  <Animated.View
                    style={[
                      styles.countBadge,
                      { transform: [{ scale: badgePulse }] },
                    ]}
                  >
                    <Text style={styles.countText}>{filteredEvents.length}</Text>
                  </Animated.View>
                )}

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
                initialDate={new Date()}
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
                <ScrollView 
                  style={styles.eventsScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredEvents.map((event) => (
                    <EventItem 
                      key={event.id} 
                      event={event} 
                      onPress={onEventPress} 
                    />
                  ))}
                </ScrollView>
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
    marginBottom: 5,
  },
  eventsListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  eventsScrollView: {
    maxHeight: 400,
  },
  eventItemContainer: {
    marginBottom: 12,
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