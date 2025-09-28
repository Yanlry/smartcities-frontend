// Chemin : frontend/components/common/Loader/RefreshSuccessAnimation.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface RefreshSuccessAnimationProps {
  visible: boolean;
  message?: string;
}

/**
 * Animation de succès après un rafraîchissement
 * Affiche une petite notification discrète en haut de l'écran
 */
const RefreshSuccessAnimation: React.FC<RefreshSuccessAnimationProps> = ({
  visible,
  message = "Mis à jour avec succès",
}) => {
  // Animations
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée - la notification descend du haut
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de sortie - la notification remonte
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      // Nettoyage des animations
      opacity.stopAnimation();
      translateY.stopAnimation();
      scale.stopAnimation();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [
            { translateY },
            { scale }
          ],
        },
      ]}
    >
      <View style={styles.notification}>
        {/* Petite coche verte */}
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
        
        {/* Message de succès */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Container positionné en haut de l'écran
  container: {
    position: 'absolute',
    top: 120, // Juste en dessous du header
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998, // Un peu moins que l'overlay de refresh pour éviter les conflits
  },
  
  // Notification compacte et élégante
  notification: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)', // Vert succès avec transparence
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50, // Très arrondi pour un look moderne
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    maxWidth: '90%',
    // Bordure subtile pour plus d'élégance
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  // Container de la coche (plus petit)
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fond blanc pour contraste
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  // Texte de la coche (plus petit)
  checkmarkText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Message de succès (texte blanc pour contraster avec le fond vert)
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1, // Pour que le texte prenne l'espace disponible
    textAlign: 'center',
  },
});

export default RefreshSuccessAnimation;