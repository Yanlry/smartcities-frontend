// Chemin : components/interactions/CreateReport/ProgressModal.tsx

import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { ProgressStep } from '../../../types/entities/report.types';

interface ProgressModalProps {
  visible: boolean;
  progress: number;
  steps: ProgressStep[];
}

/**
 * Composant modal pour afficher la progression d'une opération
 */
const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  progress,
  steps
}) => {
  /**
   * Détermine le message à afficher en fonction de la progression
   */
  const getProgressMessage = (): string => {
    if (progress < steps[0].progress) {
      return "Initialisation...";
    } else if (progress < steps[1].progress) {
      return steps[0].label;
    } else if (progress < steps[2].progress) {
      return steps[1].label;
    } else {
      return steps[2].label;
    }
  };

  /**
   * Détermine l'icône à afficher en fonction de la progression
   */
  const getProgressIcon = (): "hourglass-outline" | "cloud-upload-outline" | "server-outline" | "checkmark-circle-outline" => {
    if (progress < steps[0].progress) {
      return "hourglass-outline";
    } else if (progress < steps[1].progress) {
      return "cloud-upload-outline";
    } else if (progress < steps[2].progress) {
      return "server-outline";
    } else {
      return "checkmark-circle-outline";
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={getProgressIcon()} size={48} color="#1DB681" />
          </View>
          
          <Text style={styles.progressTitle}>Envoi en cours</Text>
          <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
          
          <View style={styles.progressBarContainer}>
            <Progress.Bar 
              progress={progress} 
              width={null}
              height={8}
              color="#1DB681" 
              unfilledColor="#F1F5F9"
              borderWidth={0}
              borderRadius={4}
              style={styles.progressBar} 
            />
          </View>
          
          <Text style={styles.percentageText}>
            {Math.round(progress * 100)}%
          </Text>
          
          <Text style={styles.infoText}>
            Veuillez patienter pendant le traitement de votre signalement...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(29, 225, 111, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(29, 225, 111, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressMessage: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default React.memo(ProgressModal);