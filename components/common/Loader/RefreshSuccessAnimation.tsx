import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface RefreshSuccessAnimationProps {
  visible: boolean;
  message?: string;
}

/**
 * Animation de succès après un rafraîchissement
 * Affiche une notification élégante avec une coche verte et un message de succès
 */
const RefreshSuccessAnimation: React.FC<RefreshSuccessAnimationProps> = ({
  visible,
  message = "Mis à jour avec succès!"
}) => {
  // Animations
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Séquence d'animation d'entrée
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animation de sortie
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
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
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1001,
  },
  notification: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
    maxWidth: '80%',
  },
  checkmarkContainer: {
    marginRight: 12,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default RefreshSuccessAnimation;