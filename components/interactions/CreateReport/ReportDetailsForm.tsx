import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import PhotoManager from '../../interactions/PhotoManager';
import { Photo } from './types';

interface ReportDetailsFormProps {
  title: string;
  description: string;
  photos: Photo[];
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPhotosChange: (photos: Photo[]) => void;
}

/**
 * Composant pour saisir les détails d'un signalement
 */
const ReportDetailsForm: React.FC<ReportDetailsFormProps> = ({
  title,
  description,
  photos,
  onTitleChange,
  onDescriptionChange,
  onPhotosChange
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Étape 2 : Décrivez le problème</Text>
      
      <View style={styles.formContainer}>
        <Text style={styles.fieldLabel}>Titre</Text>
        <TextInput
          style={styles.inputTitle}
          placeholder="Expliquer brièvement le problème"
          placeholderTextColor="#c7c7c7"
          value={title}
          onChangeText={onTitleChange}
          multiline={false}
          maxLength={100}
        />
        
        <Text style={styles.fieldLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Expliquer brièvement le problème (max. 500 caractères)"
          placeholderTextColor="#c7c7c7"
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          maxLength={500}
        />
        
        <Text style={styles.fieldLabel}>Ajouter des photos (optionnel)</Text>
        <PhotoManager 
          photos={photos} 
          setPhotos={onPhotosChange} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  inputTitle: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default React.memo(ReportDetailsForm);