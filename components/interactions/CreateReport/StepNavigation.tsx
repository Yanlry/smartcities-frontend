// Chemin : components/interactions/CreateReport/StepNavigation.tsx

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  canProceed?: boolean; // Prop pour la validation
}

/**
 * Composant pour la navigation entre les étapes du formulaire
 * Conçu pour rester fixe au bas de l'écran avec validation
 */
const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevStep,
  onNextStep,
  canProceed = true
}) => {
  // Utiliser les insets pour calculer le padding bottom sur iOS
  const insets = useSafeAreaInsets?.() || { bottom: 0 };

  return (
    <View style={[
      styles.container,
      { paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16 }
    ]}>
      <View style={styles.progressBarContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBarSegment,
              index < currentStep && styles.progressBarActive,
              index === totalSteps - 1 && { marginRight: 0 }
            ]}
          />
        ))}
      </View>

      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.navButtonLeft}
            onPress={onPrevStep}
            accessibilityLabel="Étape précédente"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Précédent</Text>
          </TouchableOpacity>
        )}

        {currentStep < totalSteps && (
          <TouchableOpacity
            style={[
              styles.navButtonRight,
              !canProceed && styles.disabledButton,
              currentStep === 1 && currentStep <= 1 && styles.fullWidthButton
            ]}
            onPress={onNextStep}
            disabled={!canProceed}
            accessibilityLabel={canProceed ? "Étape suivante" : "Sélection requise"}
            activeOpacity={canProceed ? 0.8 : 1}
          >
            <Text style={[styles.buttonText, !canProceed && styles.disabledText]}>
              Suivant
            </Text>
            {!canProceed && <Ionicons name="alert-circle" size={18} color="#FFFFFF80" style={styles.warningIcon} />}
            {canProceed && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Obtenir la largeur et la hauteur de l'écran pour les calculs
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  progressBarContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginRight: 8,
  },
  progressBarActive: {
    backgroundColor: '#3498db',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButtonLeft: {
    backgroundColor: '#d81b60',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#d81b60',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  navButtonRight: {
    backgroundColor: '#1DB681',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#1DB681',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#61D3AB',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  fullWidthButton: {
    marginLeft: 0,
    flex: 1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  disabledText: {
    opacity: 0.7,
  },
  warningIcon: {
    marginLeft: 6,
  }
});

export default React.memo(StepNavigation);
