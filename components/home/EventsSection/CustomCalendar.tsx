// Chemin: components/home/EventsSection/CustomCalendar.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  Dimensions, 
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Activer LayoutAnimation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS_IN_WEEK = 7;
const CALENDAR_WIDTH = Math.min(SCREEN_WIDTH - 40, 340);
const DAY_SIZE = Math.floor(CALENDAR_WIDTH / DAYS_IN_WEEK) - 4;

// Types
interface CalendarProps {
  initialDate?: Date;
  markedDates?: Record<string, boolean>;
  onDateSelected: (date: Date) => void;
  selectedDate?: Date | null;
  onMonthChange?: (year: number, month: number) => void;
}

// Helper Functions
const normalizeDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthData = (year: number, month: number): Array<{date: Date | null, isCurrentMonth: boolean}> => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday as first day
  
  const days: Array<{date: Date | null, isCurrentMonth: boolean}> = [];
  
  // Previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
  
  for (let i = 0; i < dayOffset; i++) {
    const day = daysInPrevMonth - dayOffset + i + 1;
    days.push({
      date: new Date(prevMonthYear, prevMonth, day),
      isCurrentMonth: false
    });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  
  // Next month days (to fill grid)
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(nextMonthYear, nextMonth, i),
      isCurrentMonth: false
    });
  }
  
  return days;
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

/**
 * Composant calendrier personnalisé avec une prise en charge fiable du marquage des dates
 */
const CustomCalendar: React.FC<CalendarProps> = ({
  initialDate = new Date(),
  markedDates = {},
  onDateSelected,
  selectedDate,
  onMonthChange
}) => {
  // State
  const [currentDate, setCurrentDate] = useState({
    year: initialDate.getFullYear(),
    month: initialDate.getMonth()
  });
  
  // Memoized values
  const calendarData = useMemo(() => 
    getMonthData(currentDate.year, currentDate.month),
    [currentDate.year, currentDate.month]
  );
  
  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => normalizeDate(today), [today]);
  

  // Notification initiale du mois actuel
  useEffect(() => {
    if (onMonthChange) {
      onMonthChange(currentDate.year, currentDate.month);
    }
  }, []);

  // Handlers
  const handlePrevMonth = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: { type: 'easeInEaseOut' }
    });
    
    setCurrentDate(prev => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      
      // Notifier le parent du changement de mois
      if (onMonthChange) {
        onMonthChange(newYear, newMonth);
      }
      
      return { year: newYear, month: newMonth };
    });
  }, [onMonthChange]);
  
  const handleNextMonth = useCallback(() => {
    LayoutAnimation.configureNext({
      duration: 200,
      update: { type: 'easeInEaseOut' }
    });
    
    setCurrentDate(prev => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      
      // Notifier le parent du changement de mois
      if (onMonthChange) {
        onMonthChange(newYear, newMonth);
      }
      
      return { year: newYear, month: newMonth };
    });
  }, [onMonthChange]);
  
  const handleDatePress = useCallback((date: Date) => {
    onDateSelected(date);
  }, [onDateSelected]);
  
  // Render item for calendar day
  const renderDay = useCallback(({ item }: { item: {date: Date | null, isCurrentMonth: boolean} }) => {
    if (!item.date) return <View style={{ width: DAY_SIZE, height: DAY_SIZE }} />;
    
    const dateString = normalizeDate(item.date);
    const isMarked = !!markedDates[dateString];
    const isToday = dateString === todayString;
    const isSelected = selectedDate && normalizeDate(selectedDate) === dateString;
    
    return (
      <TouchableOpacity
        style={[
          styles.dayContainer,
          { width: DAY_SIZE, height: DAY_SIZE },
          !item.isCurrentMonth && styles.dayOutsideMonth,
          isToday && styles.todayContainer,
          isSelected && styles.selectedDayContainer,
          isMarked && styles.markedDayContainer
        ]}
        onPress={() => handleDatePress(item.date!)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.dayText,
          !item.isCurrentMonth && styles.dayTextOutsideMonth,
          isToday && styles.todayText,
          isSelected && styles.selectedDayText,
          isMarked && styles.markedDayText
        ]}>
          {item.date.getDate()}
        </Text>
        
        {isMarked && (
          <View style={styles.eventDot} />
        )}
      </TouchableOpacity>
    );
  }, [markedDates, todayString, selectedDate, handleDatePress]);
  
  return (
    <View style={styles.container}>
      {/* Header with month navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handlePrevMonth} 
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {`${MONTHS[currentDate.month]} ${currentDate.year}`}
        </Text>
        
        <TouchableOpacity 
          onPress={handleNextMonth} 
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="chevron-right" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Weekday headers */}
      <View style={styles.weekdaysContainer}>
        {WEEKDAYS.map((day, index) => (
          <View key={index} style={[styles.weekdayCell, { width: DAY_SIZE }]}>
            <Text style={styles.weekdayText}>{day}</Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      <FlatList
        data={calendarData}
        renderItem={renderDay}
        keyExtractor={(item, index) => `${index}-${item.date?.toISOString() || 'empty'}`}
        numColumns={DAYS_IN_WEEK}
        scrollEnabled={false}
        style={styles.calendarGrid}
        initialNumToRender={42} // Show all days at once
      />
      
      {/* Legend for marked dates - amélioré pour plus de visibilité */}
      <View style={styles.legend}>
        <View style={styles.legendItemContainer}>
          <View style={styles.legendMarker} />
          <Text style={styles.legendText}>Jours avec événements</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
  },
  navButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#F7F9FC',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  calendarGrid: {
    marginBottom: 8,
  },
  dayContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 12,
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3748',
  },
  dayOutsideMonth: {
    opacity: 0.4,
  },
  dayTextOutsideMonth: {
    color: '#A0AEC0',
  },
  todayContainer: {
    borderWidth: 1,
    borderColor: '#3182CE',
  },
  todayText: {
    color: '#3182CE',
    fontWeight: '700',
  },
  selectedDayContainer: {
    backgroundColor: '#3182CE',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '700',
  },
  markedDayContainer: {
    // Style amélioré pour rendre les marqueurs plus visibles
    backgroundColor: 'rgba(118, 255, 3, 0.2)',
  },
  markedDayText: {
    color: '#1B5E20',
    fontWeight: '700',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: 'white',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
  },
  legendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  legendMarker: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: '500',
  }
});

export default CustomCalendar;