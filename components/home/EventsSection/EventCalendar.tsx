import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import { Event } from './event.types';

interface EventCalendarProps {
  events: Event[];
  onDateChange: (date: string) => void;
  onEventPress: (id: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const EventCalendar: React.FC<EventCalendarProps> = memo(({ 
  events, 
  onDateChange, 
  onEventPress,
  isVisible,
  toggleVisibility
}) => {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleVisibility}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>📅 Tous les événements</Text>
        <Text style={styles.arrow}>{isVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.sectionContent}>
          {/* Calendrier */}
          <View style={styles.calendarContainer}>
            <CalendarPicker
              onDateChange={(date) => {
                const formattedDate = date.toISOString().split("T")[0];
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
              textStyle={{
                fontSize: 16,
              }}
              width={330}
              selectedDayColor="#11998e"
              selectedDayTextColor="#FFFFFF"
            />
          </View>

          {/* Liste des événements */}
          {events.length > 0 ? (
            events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventItem}
                onPress={() => onEventPress(event.id)}
              >
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDetails}>
                  {new Date(event.date).toLocaleDateString("fr-FR")}
                </Text>
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>
                Aucun événement prévu pour cette date.
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
  },
  sectionHeaderVisible: {
    backgroundColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#333',
  },
  sectionContent: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  eventDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#333',
  },
  noEventsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  noEventsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default EventCalendar;