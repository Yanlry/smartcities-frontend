import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { ProgressStep } from './types';

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

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.progressTitle}>Envoi en cours</Text>
          <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
          
          <Progress.Bar 
            progress={progress} 
            width={200} 
            color="#d81b60" 
            style={styles.progressBar} 
          />
          
          <Text style={styles.percentageText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  progressMessage: {
    fontSize: 15,
    marginBottom: 15,
    color: '#555',
    textAlign: 'center',
  },
  progressBar: {
    marginVertical: 10,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#d81b60',
  },
});

export default React.memo(ProgressModal);