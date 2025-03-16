import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
}

/**
 * Composant pour la navigation entre les étapes du formulaire
 */
const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevStep,
  onNextStep
}) => {
  return (
    <View style={styles.navigation}>
      {currentStep > 1 && (
        <TouchableOpacity 
          style={styles.navButtonLeft} 
          onPress={onPrevStep}
          accessibilityLabel="Étape précédente"
        >
          <Ionicons name="arrow-back-circle" size={50} color="#34495E" />
        </TouchableOpacity>
      )}
      
      {currentStep < totalSteps && (
        <TouchableOpacity 
          style={styles.navButtonRight} 
          onPress={onNextStep}
          accessibilityLabel="Étape suivante"
        >
          <Ionicons name="arrow-forward-circle" size={50} color="#34495E" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navigation: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navButtonLeft: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  navButtonRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    marginLeft: 'auto',
  },
});

export default React.memo(StepNavigation);