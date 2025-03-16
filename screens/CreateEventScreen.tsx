// screens/CreateEventScreen.tsx
import React, { useState, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoManager from '../components/interactions/PhotoManager';
import { 
  EventForm, 
  EventDatePicker, 
  LocationSelector,
  ProgressModal,
  EventFormData,
  LocationData
} from '../components/interactions/CreateEvent';
import { useEventSubmission } from '../hooks/events/useEventSubmission';

export default function CreateEventScreen({ navigation }) {
  // États du formulaire
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: '',
    description: '',
    date: new Date(),
    location: {
      query: '',
      coordinates: null
    }
  });
  const [photos, setPhotos] = useState<any[]>([]);
  
  // Hook de soumission
  const { submitEvent, isSubmitting, progress, progressVisible } = useEventSubmission();

  // Gestionnaires de mise à jour des états
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLocation = useCallback((locationData: LocationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData
    }));
  }, []);

  // Soumission du formulaire
  const handleSubmit = useCallback(async () => {
    const { title, description, location } = formData;
    
    // Validation basique
    if (!title?.trim() || !description?.trim() || 
        !location?.query || !location?.coordinates || photos.length === 0) {
      Alert.alert("Erreur", "Tous les champs et au moins une photo sont obligatoires.");
      return;
    }

    const eventData = {
      ...formData,
      photos
    } as EventFormData;

    const success = await submitEvent(eventData);
    
    if (success) {
      // Réinitialiser le formulaire et retourner
      navigation.navigate('Main');
    }
  }, [formData, photos, submitEvent, navigation]);

  return (
    <ScrollView style={styles.container}>
      {/* En-tête */}
      <View style={styles.homeTitle}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Créer un nouvel événement</Text>
      </View>

      {/* Gestionnaire de photos */}
      <PhotoManager 
        photos={photos} 
        setPhotos={setPhotos} 
        maxPhotos={7} 
      />

      {/* Formulaire principal */}
      <EventForm
        title={formData.title || ''}
        description={formData.description || ''}
        onTitleChange={(text) => updateField('title', text)}
        onDescriptionChange={(text) => updateField('description', text)}
      />

      {/* Sélecteur de date */}
      <EventDatePicker
        date={formData.date || new Date()}
        onDateChange={(date) => updateField('date', date)}
      />

      {/* Sélecteur d'emplacement */}
      <LocationSelector
        query={formData.location?.query || ''}
        selectedLocation={formData.location?.coordinates || null}
        onLocationSelect={updateLocation}
      />

      {/* Bouton de soumission */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Envoi en cours..." : "Créer l'événement"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de progression */}
      <ProgressModal
        visible={progressVisible}
        progress={progress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Styles existants
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  homeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  submitButtonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#062C41',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});