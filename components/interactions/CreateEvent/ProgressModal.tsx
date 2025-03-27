// components/interactions/EventCreation/ProgressModal.tsx
import React, { memo, useMemo } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import { ProgressModalProps }from '../../../types/features/events/creation.types';

/**
 * Modal affichant la progression du téléversement
 */
const ProgressModal: React.FC<ProgressModalProps> = memo(({
  visible,
  progress
}) => {
  const progressMessage = useMemo(() => {
    if (progress < 0.1) return "Préparation des fichiers...";
    if (progress >= 0.1 && progress < 0.9) return "Téléchargement en cours...";
    return "Finalisation...";
  }, [progress]);

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{progressMessage}</Text>
          <Progress.Bar 
            progress={progress} 
            width={200} 
            color="#062C41" 
            style={styles.progressBar}
          />
          <Text style={styles.percentage}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBar: {
    marginVertical: 15,
  },
  percentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressModal;