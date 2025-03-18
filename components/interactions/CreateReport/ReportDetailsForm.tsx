import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
 * Style refondu pour une apparence moderne, épurée et orientée mobile-first.
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
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Décrivez le problème</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Fournissez des détails précis pour faciliter sa résolution
      </Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>
            Titre <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputTitle}
              placeholder="Ex: Nid de poule dangereux"
              placeholderTextColor="#9AA0A6"
              value={title}
              onChangeText={onTitleChange}
              multiline={false}
              maxLength={100}
            />
            <View style={styles.inputIcon}>
              <Ionicons name="create-outline" size={20} color="#9AA0A6" />
            </View>
          </View>
          <Text style={styles.counter}>{title.length}/100</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Décrivez précisément le problème rencontré, sa localisation exacte, les dangers potentiels..."
              placeholderTextColor="#9AA0A6"
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>
          <Text style={styles.counter}>{description.length}/500</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <View style={styles.photoHeader}>
            <Text style={styles.fieldLabel}>Photos</Text>
            <View style={styles.photoBadge}>
              <Text style={styles.photoBadgeText}>Recommandé</Text>
            </View>
          </View>
          
          <Text style={styles.photoDescription}>
            Ajoutez des photos pour aider à identifier le problème plus facilement
          </Text>
          
          <PhotoManager
            photos={photos}
            setPhotos={onPhotosChange}
          />
        </View>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F5', // Fond gris ultra clair pour un look moderne
    paddingBottom: 16,
  },
  header: {
    backgroundColor: '#3498db', // Couleur bleu vif et moderne
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inputGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 10,
  },
  required: {
    color: '#FF453A', // Rouge vif pour indiquer un champ obligatoire
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputTitle: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  textAreaWrapper: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 140,
    padding: 16,
    fontSize: 16,
    color: '#222222',
    lineHeight: 24,
  },
  counter: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'right',
    marginTop: 6,
  },
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoBadge: {
    position: 'absolute',
    left: 50,
    top: 0,
    backgroundColor: 'rgba(10,132,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 10,
  },
  photoBadgeText: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: '600',
  },
  photoDescription: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 16,
    lineHeight: 20,
  },
});

export default React.memo(ReportDetailsForm);