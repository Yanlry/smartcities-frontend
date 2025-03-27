// components/interactions/EventCreation/EventForm.tsx
import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { EventFormProps } from '../../../types/features/events/creation.types';
/**
 * Composant pour la saisie des informations de base de l'événement
 */
const EventForm: React.FC<EventFormProps> = memo(({
  title,
  description,
  onTitleChange,
  onDescriptionChange
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={onTitleChange}
        placeholder="Titre de l'événement"
        placeholderTextColor="#ccc"
        maxLength={100}
      />
      
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.descriptionInput}
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="Description détaillée de l'événement"
        multiline={true}
        textAlignVertical="top"
        placeholderTextColor="#ccc"
        maxLength={1000}
      />
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
  titleInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  descriptionInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});

export default EventForm;