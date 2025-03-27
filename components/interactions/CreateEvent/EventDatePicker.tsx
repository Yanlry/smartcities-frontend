// components/interactions/EventCreation/EventDatePicker.tsx
import React, { useState, memo } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { EventDatePickerProps } from '../../../types/features/events/creation.types';

/**
 * Composant pour la sélection de date d'un événement
 */
const EventDatePicker: React.FC<EventDatePickerProps> = memo(({
  date,
  onDateChange
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Date</Text>
      <View style={styles.dateContainer}>
        <View style={styles.dateDisplay}>
          <Text style={styles.selectedDate}>{date.toLocaleDateString()}</Text>
        </View>
        <Button
          title="Choisir une date"
          onPress={() => setShowDatePicker(true)}
        />
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleDateChange}
          minimumDate={new Date()} // Empêche la sélection de dates passées
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateDisplay: {
    height: 50,
    justifyContent: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  selectedDate: {
    fontSize: 16,
  },
});

export default EventDatePicker;