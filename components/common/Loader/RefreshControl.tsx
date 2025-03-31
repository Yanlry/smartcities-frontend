import React, { useState, useEffect } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import JoyfulLoader from './JoyfulLoader';

interface CustomRefreshControlProps {
  refreshing: boolean;
  scrollY: Animated.Value;
  refreshHeight?: number;
  onRefreshStarted?: () => void;
}

/**
 * Composant de contrôle de rafraîchissement personnalisé avec animation JoyfulLoader
 */
const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  scrollY,
  refreshHeight = 90,
  onRefreshStarted
}) => {
  // Animation pour faire apparaître/disparaître le loader
  const [fadeAnim] = useState(new Animated.Value(0));
  const [started, setStarted] = useState(false);

  // Suivre quand le refresh est déclenché
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Si l'utilisateur tire vers le bas suffisamment et que le refresh n'est pas déjà commencé
      if (value <= -refreshHeight && !started && !refreshing) {
        setStarted(true);
        if (onRefreshStarted) {
          onRefreshStarted();
        }
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, refreshHeight, started, refreshing, onRefreshStarted]);

  // Réinitialiser l'état quand le rafraîchissement est terminé
  useEffect(() => {
    if (!refreshing) {
      setStarted(false);
    }
  }, [refreshing]);

  // Gérer l'animation d'apparition/disparition
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: refreshing ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [refreshing, fadeAnim]);

  // Calculer la position du loader basée sur le scroll
  const translateY = scrollY.interpolate({
    inputRange: [-150, -refreshHeight, 0],
    outputRange: [20, 0, -refreshHeight],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.refreshContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          height: refreshHeight,
        },
      ]}
    >
      <View style={styles.refreshContent}>
        <JoyfulLoader 
          message="Actualisation..." 
          color="#062C41"
          size="small"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  refreshContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  refreshContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default CustomRefreshControl;