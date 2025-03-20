// Chemin : src/components/home/GlobalToggleButton.tsx

import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Animated,
  ViewStyle,
  View,
  Vibration,
  Easing 
} from 'react-native';
import { Accelerometer } from 'expo-sensors';

interface GlobalToggleButtonProps {
  areAllSectionsVisible: boolean;
  onToggle: () => void;
  style?: ViewStyle;
}


// Configuration et personnalisation
export const setShakeDetectionSensitivity = (
  options: Partial<typeof ShakeDetectionConfig>
) => {
  Object.assign(ShakeDetectionConfig, options);
};

// Configuration avancée de la détection de secousse
const ShakeDetectionConfig = {
  // Seuil de détection plus strict
  ACCELERATION_THRESHOLD: 1, // Augmenté pour réduire les faux positifs
  
  // Durée minimale entre deux secousses détectées
  SHAKE_TIMEOUT: 1000, // Augmenté à 1 seconde
  
  // Nombre de pics d'accélération requis pour une secousse valide
  SHAKE_PEAK_COUNT: 2,
  
  // Intervalle de mise à jour de l'accéléromètre
  UPDATE_INTERVAL: 200, // Mis à jour moins fréquemment
};

const GlobalToggleButton: React.FC<GlobalToggleButtonProps> = memo(({
  areAllSectionsVisible,
  onToggle,
  style
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isShakeEnabled, setIsShakeEnabled] = useState(true);
  const lastShakeTime = useRef(0);
  const shakeAnimatedValue = useRef(new Animated.Value(0)).current;
  
  // Références pour suivre l'état de la secousse
  const accelerationPeaks = useRef<number[]>([]);
  const lastAcceleration = useRef(0);

  // Animation de secousse
  const shakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimatedValue, {
        toValue: 1,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimatedValue, {
        toValue: -1,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true
      }),
      Animated.timing(shakeAnimatedValue, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ]).start();
  }, [shakeAnimatedValue]);

  // Gestion de la détection de secousse
  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    const subscribeToShake = () => {
      // Configuration de l'accéléromètre
      Accelerometer.setUpdateInterval(ShakeDetectionConfig.UPDATE_INTERVAL);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        // Calcul de l'accélération totale
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const currentTime = Date.now();

        // Détection de pics d'accélération
        if (Math.abs(acceleration - lastAcceleration.current) > ShakeDetectionConfig.ACCELERATION_THRESHOLD) {
          accelerationPeaks.current.push(currentTime);
        }

        // Nettoyer les pics trop anciens
        const cutoffTime = currentTime - ShakeDetectionConfig.SHAKE_TIMEOUT;
        accelerationPeaks.current = accelerationPeaks.current.filter(time => time > cutoffTime);

        // Vérification si c'est une secousse significative
        if (
          isShakeEnabled && 
          accelerationPeaks.current.length >= ShakeDetectionConfig.SHAKE_PEAK_COUNT && 
          currentTime - lastShakeTime.current > ShakeDetectionConfig.SHAKE_TIMEOUT
        ) {
          // Réinitialiser les pics
          accelerationPeaks.current = [];
          
          // Enregistrer le temps de la dernière secousse
          lastShakeTime.current = currentTime;

          // Déclencher l'animation et la vibration
          shakeAnimation();
          Vibration.vibrate(100);

          // Appeler la fonction de bascule
          onToggle();
        }

        // Mettre à jour la dernière accélération
        lastAcceleration.current = acceleration;
      });
    };

    // Abonnement aux événements de secousse
    subscribeToShake();

    // Nettoyage à la désactivation du composant
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isShakeEnabled, onToggle, shakeAnimation]);

  // Animation de pression manuelle
  const handlePress = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(onToggle);
  };

  // Interpolation de l'échelle du bouton
  const buttonScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95]
  });

  // Interpolation de la rotation de secousse
  const shakeTransform = shakeAnimatedValue.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg']
  });

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [
            { scale: buttonScale },
            { rotateZ: shakeTransform }
          ]
        },
        styles.shadowStyle,
        style
      ]}
    >
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.touchableArea}
      >
          <Text style={styles.hintText}>
            Secouez votre téléphone pour {areAllSectionsVisible ? 'réduire' : 'déplier'} toutes les sections !
          </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 3 
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  shadowStyle: {
    // Style d'ombre supplémentaire si nécessaire
  },
  touchableArea: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  hintText: {
    color: '#7F8C8D',
    fontWeight: '400',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  }
});

export default GlobalToggleButton;
