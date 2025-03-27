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
  NativeSyntheticEvent,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { Event } from '../../../types/entities/event.types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Configuration locale pour le calendrier en français
LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

// Constantes de thème et d'animation
const THEME = {
  primary: '#3a7bd5',
  primaryLight: '#63a4ff',
  primaryDark: '#0050b1',
  secondary: '#00b2ff',
  markerGreen: '#00B5AD',  // Vert vif pour les marqueurs d'événements
  background: '#f9fbff',
  surface: '#ffffff',
  text: {
    primary: '#2d3748',
    secondary: '#6b7280',
    tertiary: '#a0aec0',
  },
  gradient: {
    primary: ['#00B5AD', '#20A397'] as const,
    selected: ['#ffffff', '#f7faff'] as const,
    regular: ['#f6f8fa', '#e8f0fe'] as const
  }
};

/**
 * Normalise une date en format string YYYY-MM-DD
 */
const normalizeDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Vérifie si une date est aujourd'hui ou dans le futur
 */
const isTodayOrFuture = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate >= today;
};

/**
 * Composant pour afficher un événement individuel avec animations
 */
const EventItem = memo(({ 
  event, 
  onPress,
  isSelected = true
}: { 
  event: Event, 
  onPress: (id: string) => void,
  isSelected?: boolean
}) => {
  // Animation de scale pour l'interaction tactile
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true
    }).start();
  }, [scaleAnim]);

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("fr-FR", {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  // Déterminer si l'événement est à venir
  const isUpcoming = isTodayOrFuture(eventDate);
  
  return (
    <Animated.View 
      style={[
        styles.eventItemContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.eventItem,
          isSelected && styles.selectedEventItem
        ]}
        onPress={() => onPress(event.id)}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Badge "À venir" pour les événements futurs */}
        {isUpcoming && (
          <View style={styles.upcomingBadge}>
            <LinearGradient
              colors={['#38b2ac', '#2c9c9c'] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upcomingBadgeGradient}
            >
              <Text style={styles.upcomingBadgeText}>À venir</Text>
            </LinearGradient>
          </View>
        )}
        
        <View style={styles.eventInfo}>
          <View style={styles.eventDateContainer}>
            <LinearGradient
              colors={isSelected ? ['#e6f0ff', '#d1e3fe'] as const : ['#f0f4fa', '#e4ebf5'] as const}
              style={[
                styles.dateCircle,
                isSelected && styles.selectedDateCircle
              ]}
            >
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
            </LinearGradient>
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
              <MaterialIcons name="location-on" size={16} color={THEME.primary} style={styles.locationIcon} />
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
          colors={isSelected ? THEME.gradient.selected : THEME.gradient.regular}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.eventGradient}
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

/**
 * Composant de calendrier optimisé avec gestion améliorée des marqueurs
 */
const EnhancedCalendar = memo(({ 
  currentMonth, 
  markedDates, 
  handleDateSelect, 
  handleMonthChange, 
  selectedDate 
}: { 
  currentMonth: string;
  markedDates: Record<string, any>;
  handleDateSelect: (date: DateData) => void;
  handleMonthChange: (date: DateData) => void;
  selectedDate: string | null;
}) => {
  // Calcul de largeur optimale pour l'alignement
  const { width } = Dimensions.get('window');
  const dayWidth = Math.floor((width - 60) / 7);

  return (
    <View style={styles.calendarWrapper}>
      <Calendar
        current={currentMonth}
        onDayPress={handleDateSelect}
        onMonthChange={handleMonthChange}
        firstDay={1}
        markedDates={markedDates}
        markingType="dot"
        style={styles.calendar}
        theme={{
          // Styles de base
          calendarBackground: THEME.surface,
          textSectionTitleColor: THEME.text.primary,
          selectedDayBackgroundColor: THEME.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: THEME.primary,
          dayTextColor: THEME.text.primary,
          textDisabledColor: THEME.text.tertiary,
          
          // Configuration cruciale pour les marqueurs
          dotColor: THEME.markerGreen,
          selectedDotColor: '#ffffff', 
        }}
        enableSwipeMonths={true}
      />
      
      {/* Légende pour les marqueurs */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Jours avec événements</Text>
        </View>
      </View>
    </View>
  );
});

/**
 * Interface pour les propriétés du composant principal
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
 * Composant principal de calendrier d'événements avec animations optimisées
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
  // Animations natives (transform, opacity)
  const nativeRotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const nativeOpacityAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const nativeHeaderScaleAnim = useRef(new Animated.Value(1)).current;
  const nativeBadgePulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animations JavaScript (backgroundColor, borderRadius)
  const jsBackgroundColorAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const jsBorderRadiusAnim = useRef(new Animated.Value(isVisible ? 0 : 1)).current;
  
  // États et références
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<string>(normalizeDate(new Date()));
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation de pulsation du badge
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(nativeBadgePulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(nativeBadgePulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => {
      pulseAnimation.stop();
    };
  }, [nativeBadgePulseAnim]);
  
  /**
   * Préparation des données de marquage optimisée pour react-native-calendars
   * Transforme { "2023-01-01": true } en { "2023-01-01": { marked: true, dotColor: "#8BC34A" } }
   */
  const markedDates = useMemo(() => {
    // Format final attendu par react-native-calendars
    const formattedDates: Record<string, any> = {};
    
    // 1. Récupérer les dates avec événements dans le format simple
    const [year, month] = currentMonth.split('-').map(n => parseInt(n));
    const simpleDates = getMarkedDatesForMonth ? 
      getMarkedDatesForMonth(year, month - 1) : {};
    
    // 2. Transformer en format attendu par react-native-calendars
    Object.keys(simpleDates).forEach(dateStr => {
      formattedDates[dateStr] = {
        marked: true,
        dotColor: THEME.markerGreen
      };
    });
    
    // 3. Gérer la date sélectionnée
    if (selectedDate) {
      formattedDates[selectedDate] = {
        ...(formattedDates[selectedDate] || {}),
        selected: true,
        marked: formattedDates[selectedDate]?.marked || false,
        dotColor: formattedDates[selectedDate]?.marked ? 
          (formattedDates[selectedDate]?.dotColor || THEME.markerGreen) : undefined
      };
    }
    
    return formattedDates;
  }, [currentMonth, selectedDate, getMarkedDatesForMonth]);

  // Animation de rotation pour l'icône de flèche
  const arrowRotation = nativeRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  // Animation de couleur d'arrière-plan pour le conteneur
  const headerBackgroundColor = jsBackgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.surface, THEME.background]
  });

  // Filtrage des événements optimisé
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { type: LayoutAnimation.Types.easeInEaseOut, property: 'opacity' },
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.85 },
      delete: { type: LayoutAnimation.Types.easeInEaseOut, property: 'opacity' }
    });
    
    if (selectedDate) {
      // Afficher les événements de la date sélectionnée
      const filtered = events.filter(event => normalizeDate(event.date) === selectedDate);
      setFilteredEvents(filtered);
    } else {
      // Afficher les événements futurs du mois courant
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [year, month] = currentMonth.split('-').map(n => parseInt(n));
      
      const monthEvents = getEventsForMonth 
        ? getEventsForMonth(year, month - 1)
            .filter(event => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0);
              return eventDate >= today;
            })
        : events.filter(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            return (
              eventDate.getFullYear() === year &&
              eventDate.getMonth() + 1 === month &&
              eventDate >= today
            );
          });
      
      setFilteredEvents(monthEvents);
    }
  }, [selectedDate, events, currentMonth, getEventsForMonth]);

  // Animation de visibilité avec séparation stricte des moteurs d'animation
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.85 },
    });
    
    // 1. Animations natives (transform, opacity)
    Animated.parallel([
      Animated.timing(nativeRotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(nativeOpacityAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    // 2. Animations JavaScript (backgroundColor, borderRadius)
    Animated.parallel([
      Animated.timing(jsBackgroundColorAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(jsBorderRadiusAnim, {
        toValue: isVisible ? 0 : 1,
        duration: 300, 
        useNativeDriver: false,
      })
    ]).start();
  }, [isVisible, nativeRotateAnim, nativeOpacityAnim, jsBackgroundColorAnim, jsBorderRadiusAnim]);

  // Gestion des interactions avec l'en-tête
  const handleHeaderPressIn = useCallback(() => {
    Animated.spring(nativeHeaderScaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [nativeHeaderScaleAnim]);

  const handleHeaderPressOut = useCallback(() => {
    Animated.spring(nativeHeaderScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [nativeHeaderScaleAnim]);

  // Sélection de date dans le calendrier
  const handleDateSelect = useCallback((date: DateData) => {
    LayoutAnimation.configureNext({
      duration: 250,
      update: { type: LayoutAnimation.Types.spring, springDamping: 0.85 }
    });
    
    const formattedDate = date.dateString;
    setSelectedDate(formattedDate);
    onDateChange(formattedDate);
  }, [onDateChange]);

  // Changement de mois dans le calendrier
  const handleMonthChange = useCallback((date: DateData) => {
    const newMonth = `${date.year}-${String(date.month).padStart(2, '0')}-01`;
    setCurrentMonth(newMonth);
    setSelectedDate(null);
  }, []);

  // Formater la date sélectionnée pour l'affichage
  const getFormattedSelectedDate = useCallback(() => {
    if (!selectedDate) return '';
    
    const date = new Date(selectedDate);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, [selectedDate]);

  // Gérer le défilement de la liste d'événements
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Logique de défilement si nécessaire
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.unifiedContainer,
        {
          backgroundColor: headerBackgroundColor,
        }
      ]}>
        {/* En-tête avec style premium */}
        <Animated.View
          style={[
            styles.headerContainer,
            { 
              transform: [{ scale: nativeHeaderScaleAnim }],
              borderBottomLeftRadius: isVisible ? 0 : 16,
              borderBottomRightRadius: isVisible ? 0 : 16,
            },
          ]}
        >
          <Pressable
            onPress={toggleVisibility}
            onPressIn={handleHeaderPressIn}
            onPressOut={handleHeaderPressOut}
            style={styles.header}
          >
            <LinearGradient
              colors={THEME.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.headerContent}
            >
              {/* Icône et titre */}
              <View style={styles.titleContainer}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="event"
                    size={24}
                    color="#fff"
                  />
                </View>
                <View>
                  <Text style={styles.title}>Calendrier</Text>
                  <Text style={styles.subtitle}>
                    {selectedDate 
                      ? `Sélection du ${getFormattedSelectedDate()}`
                      : `Événements à venir`}
                  </Text>
                </View>
              </View>

              {/* Badge de comptage et flèche */}
              <View style={styles.headerControls}>
                <Animated.View
                  style={[
                    styles.countBadge,
                    filteredEvents.length === 0 && styles.emptyCountBadge,
                    { transform: [{ scale: nativeBadgePulseAnim }] }
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
                  <MaterialIcons
                    name={isVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#fff"
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Contenu principal conditionnel */}
        {isVisible && (
          <Animated.View
            style={[
              styles.contentContainer, 
              { 
                opacity: nativeOpacityAnim,
                backgroundColor: THEME.background,
              }
            ]}
          >
            {/* Calendrier optimisé */}
            <View style={styles.calendarContainer}>
              <EnhancedCalendar
                currentMonth={currentMonth}
                markedDates={markedDates}
                handleDateSelect={handleDateSelect}
                handleMonthChange={handleMonthChange}
                selectedDate={selectedDate}
              />
            </View>

            {/* Liste d'événements filtrés */}
            <View style={styles.eventsListContainer}>
              <View style={styles.eventsListTitleContainer}>
                <Text style={styles.eventsListTitle}>
                  {selectedDate 
                    ? `Événements du ${getFormattedSelectedDate()}`
                    : "Événements à venir"}
                </Text>
                {filteredEvents.length > 0 && (
                  <View style={styles.eventCountChip}>
                    <Text style={styles.eventCountText}>{filteredEvents.length}</Text>
                  </View>
                )}
              </View>
              
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
                    <View style={styles.scrollEndSpacer} />
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noEventsContainer}>
                  <LinearGradient
                    colors={['#f0f7ff', '#e4ebf5'] as [string, string]}
                    style={styles.emptyIconContainer}
                  >
                    <MaterialIcons name="event-busy" size={32} color={THEME.primaryLight} />
                  </LinearGradient>
                  <Text style={styles.noEventsTitle}>Aucun événement à venir</Text>
                  <Text style={styles.noEventsText}>
                    {selectedDate 
                      ? "Aucun événement prévu pour cette date."
                      : "Aucun événement à venir pour ce mois."}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
});

// Styles optimisés
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    marginHorizontal: 15,
    overflow: "hidden",
  },
  unifiedContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.surface,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.12)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  header: {
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
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  emptyCountBadge: {
    opacity: 0.7,
  },
  countText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 15,

    overflow: "hidden",
  },
  calendarContainer: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  calendarWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 16,
    padding: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.markerGreen,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: THEME.text.secondary,
  },
  eventsListContainer: {
    width: '100%',
    marginBottom: 5,
  },
  eventsListTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.text.primary,
    marginRight: 10,
  },
  eventCountChip: {
    backgroundColor: THEME.gradient.primary[0],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  eventCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eventsScrollContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: THEME.background,
    maxHeight: 370,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  eventsScrollView: {
    backgroundColor: THEME.background,
    paddingHorizontal: 8,
  },
  eventsScrollContent: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  scrollEndSpacer: {
    height: 8,
  },
  eventItemContainer: {
    marginBottom: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.1)",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventItem: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  selectedEventItem: {
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(58, 123, 213, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  upcomingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  upcomingBadgeGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  upcomingBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  selectedDateCircle: {
  },
  selectedDateText: {
    color: THEME.primary,
    fontWeight: '700',
  },
  selectedEventText: {
    color: THEME.text.primary,
    fontWeight: '600',
  },
  selectedEventDateText: {
    color: THEME.text.secondary,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.primary,
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.primaryLight,
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 13,
    color: THEME.text.secondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: THEME.text.secondary,
    flex: 1,
  },
  noEventsContainer: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  noEventsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.text.primary,
    marginBottom: 8,
  },
  noEventsText: {
    fontSize: 14,
    color: THEME.text.secondary,
    textAlign: 'center',
  }
});

export default EventCalendar;