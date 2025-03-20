import React, { useState, useRef, useEffect, memo } from 'react';
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
  ScrollView
} from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Event } from './event.types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

/**
 * Interface définissant les propriétés du composant EventCalendar
 */
interface EventCalendarProps {
  events: Event[];
  onDateChange: (date: string) => void;
  onEventPress: (id: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

/**
 * Composant amélioré de calendrier d'événements avec animations
 * et design moderne
 */
const EventCalendar: React.FC<EventCalendarProps> = memo(({ 
  events, 
  onDateChange, 
  onEventPress,
  isVisible,
  toggleVisibility
}) => {
  // Références pour les animations
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Animation de rotation pour la flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Animation lors du changement de visibilité
  useEffect(() => {
    // Animation fluide pour le changement de layout
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Animation de rotation de la flèche
    Animated.timing(rotateAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true
    }).start();
  }, [isVisible, rotateAnim]);

  // Animation tactile
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  };

  // Animation pour les événements
  const renderEventItem = (event: Event, index: number) => {
    const eventScaleAnim = useRef(new Animated.Value(1)).current;
    
    const handleEventPressIn = () => {
      Animated.timing(eventScaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true
      }).start();
    };

    const handleEventPressOut = () => {
      Animated.timing(eventScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      }).start();
    };

    // Formater la date pour l'affichage
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("fr-FR", {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    return (
      <Animated.View 
        key={event.id} 
        style={[
          { transform: [{ scale: eventScaleAnim }] },
          styles.eventItemContainer
        ]}
      >
        <TouchableOpacity
          style={styles.eventItem}
          onPress={() => onEventPress(event.id)}
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
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.headerContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <TouchableOpacity
          style={styles.touchableArea}
          onPress={toggleVisibility}
          activeOpacity={1}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={isVisible ? ['#3a7bd5', '#1e4c9a'] : ['#5b9df1', '#3a7bd5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientHeader}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Text style={styles.emojiIcon}>📅</Text>
                <Text style={styles.sectionTitle}>Tous les événements</Text>
              </View>
              <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                <View style={styles.arrowContainer}>
                  <Text style={styles.arrow}>▼</Text>
                </View>
              </Animated.View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {isVisible && (
        <View style={styles.sectionContent}>
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <CalendarPicker
              onDateChange={(date) => {
                const formattedDate = date.toISOString().split("T")[0];
                setSelectedDate(date);
                onDateChange(formattedDate);
              }}
              previousTitle="<"
              nextTitle=">"
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
              selectedDayColor="#3a7bd5"
              selectedDayTextColor="#FFFFFF"
              todayBackgroundColor="transparent"
              todayTextStyle={{ fontWeight: '700', color: '#3a7bd5' }}
              textStyle={{ fontSize: 14, color: '#4A5568' }}
              customDatesStyles={[
                { date: new Date(), style: { backgroundColor: 'transparent' } }
              ]}
              width={340}
              dayLabelsWrapper={{ borderTopWidth: 0, borderBottomWidth: 0 }}
              monthTitleStyle={{ fontWeight: '700', fontSize: 16, color: '#2D3748' }}
              yearTitleStyle={{ fontWeight: '700', fontSize: 16, color: '#2D3748' }}
            />
          </View>

          {/* Events List */}
          <View style={styles.eventsListContainer}>
            <Text style={styles.eventsListTitle}>
              {selectedDate 
                ? `Événements du ${selectedDate.toLocaleDateString("fr-FR")}`
                : "Tous les événements"}
            </Text>
            {events.length > 0 ? (
              <ScrollView 
                style={styles.eventsScrollView}
                showsVerticalScrollIndicator={false}
              >
                {events.map((event, index) => renderEventItem(event, index))}
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
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  touchableArea: {
    width: '100%',
  },
  gradientHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  emojiIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  arrowContainer: {
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  sectionContent: {
    marginTop: 12,
    paddingBottom: 20,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
  },
  eventsListContainer: {
    marginHorizontal: 12,
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
  },
});

export default EventCalendar;