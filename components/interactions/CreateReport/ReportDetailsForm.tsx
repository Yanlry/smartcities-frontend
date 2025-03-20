// components/interactions/CreateReport/ReportDetailsForm.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PhotoManager from '../../interactions/PhotoManager';
import { Photo } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Activer LayoutAnimation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ReportDetailsFormProps {
  title: string;
  description: string;
  photos: Photo[];
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onPhotosChange: (photos: Photo[]) => void;
  onBack?: () => void;
}

/**
 * Composant optimisé pour saisir les détails d'un signalement
 * Intègre une tooltip d'information accessible depuis le header (côté gauche)
 */
const ReportDetailsForm: React.FC<ReportDetailsFormProps> = ({
  title,
  description,
  photos,
  onTitleChange,
  onDescriptionChange,
  onPhotosChange,
  onBack
}) => {
  const insets = useSafeAreaInsets();
  // État pour contrôler l'affichage de la tooltip d'information
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  // Animation pour la tooltip
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTranslateY = useRef(new Animated.Value(-20)).current;
  
  /**
   * Gère l'affichage/masquage de la tooltip d'information
   */
  const toggleInfoTooltip = useCallback(() => {
    // Utilise LayoutAnimation pour une transition fluide du reste du contenu
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Configure l'animation de la tooltip
    if (!showInfoTooltip) {
      setShowInfoTooltip(true);
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowInfoTooltip(false);
      });
    }
  }, [showInfoTooltip, tooltipOpacity, tooltipTranslateY]);

  return (
    <View style={styles.container}>
      {/* Header avec icône d'information à gauche */}
      <View style={styles.header}>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={toggleInfoTooltip}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        <Text style={styles.headerTitle}>Décrivez le problème</Text>

        <TouchableOpacity
              style={styles.infoButton}
              onPress={toggleInfoTooltip}
              activeOpacity={0.7}
            >
              <Ionicons name="alert" size={24} color="#FFFFFF" />
            </TouchableOpacity>
      </View>
      
      {/* Tooltip d'information (positionnée à gauche) */}
      {showInfoTooltip && (
        <Animated.View 
          style={[
            styles.infoTooltip, 
            { 
              opacity: tooltipOpacity,
              transform: [{ translateY: tooltipTranslateY }],
              top: Platform.OS === 'ios' ? insets.top + 60 : 50,
              left: 20, // Positionnée à gauche
            }
          ]}
        >
          <Text style={styles.infoTooltipText}>
            Fournissez des détails précis pour faciliter la résolution du problème.
            Une description claire et des photos aideront les intervenants à traiter
            plus efficacement votre signalement.
          </Text>
          <View style={styles.infoTooltipArrow} />
        </Animated.View>
      )}
      
      {/* Formulaire de saisie */}
      <View style={[
        styles.formContainer,
        // Ajoute un padding supplémentaire si la tooltip est visible
        showInfoTooltip && { marginTop: 70 }
      ]}>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#062C41',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  leftHeaderContainer: {
    width: 40,
    alignItems: 'flex-start',
  },
  rightPlaceholder: {
    width: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoTooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 14,
    zIndex: 1000,
    maxWidth: width * 0.7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  infoTooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  infoTooltipArrow: {
    position: 'absolute',
    top: -10,
    left: 13, // Positionnée à gauche
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 20,
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
    color: '#C8372D',
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
    marginLeft: 10,
    backgroundColor: 'rgba(21, 108, 179, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  photoBadgeText: {
    color: '#156CB3',
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