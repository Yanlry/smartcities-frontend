// Chemin : frontend/components/common/Loader/RefreshControl.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CustomRefreshControlProps {
  refreshing: boolean;
  scrollY: Animated.Value;
  refreshHeight?: number;
  onRefreshStarted?: () => void;
}

/**
 * Composant de contrôle de rafraîchissement personnalisé avec style subtil
 */
const CustomRefreshControl: React.FC<CustomRefreshControlProps> = ({
  refreshing,
  scrollY,
  refreshHeight = 90,
  onRefreshStarted
}) => {
  // Animations
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const [hasTriggered, setHasTriggered] = useState(false);
  const isTriggering = useRef(false); // Pour éviter les déclenchements multiples

  // Suivre quand le refresh est déclenché - VERSION QUI FONCTIONNE
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Conditions pour déclencher le refresh :
      // 1. L'utilisateur tire vers le bas suffisamment
      // 2. Le refresh n'est pas déjà en cours
      // 3. On n'a pas déjà déclenché le refresh
      // 4. On n'est pas en train de déclencher
      if (
        value <= -refreshHeight && 
        !refreshing && 
        !hasTriggered && 
        !isTriggering.current
      ) {
        isTriggering.current = true; // Empêcher les déclenchements multiples
        setHasTriggered(true);
        
        if (onRefreshStarted) {
          onRefreshStarted();
        }
        
        // Réinitialiser après un délai
        setTimeout(() => {
          isTriggering.current = false;
        }, 500);
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, refreshHeight, refreshing, hasTriggered, onRefreshStarted]);

  // Réinitialiser l'état quand le rafraîchissement est terminé
  useEffect(() => {
    if (!refreshing && hasTriggered) {
      setHasTriggered(false);
      isTriggering.current = false;
    }
  }, [refreshing, hasTriggered]);

  // Gérer l'animation d'apparition/disparition
  useEffect(() => {
    if (refreshing) {
      // Animation d'entrée - la notification descend du haut
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
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
  }, [refreshing]);

  if (!refreshing) return null;

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
        {/* Petite icône de chargement bleue */}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⟳</Text>
        </View>
        
        {/* Message d'actualisation */}
        <Text style={styles.message}>Actualisation...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Container positionné en haut de l'écran (même style que RefreshSuccessAnimation)
  container: {
    position: 'absolute',
    top: 120, // Juste en dessous du header
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998, // Un peu moins que l'overlay de refresh pour éviter les conflits
  },
  
  // Notification compacte et élégante (même style que RefreshSuccessAnimation)
  notification: {
    backgroundColor: 'rgba(6, 44, 65, 0.95)', // Couleur de ton app avec transparence
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50, // Très arrondi pour un look moderne
    shadowColor: '#1B5D85',
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
  
  // Container de l'icône de chargement (même taille que la coche)
  loadingContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fond blanc pour contraste
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  // Texte de l'icône de chargement
  loadingText: {
    color: '#1B5D85', // Couleur de ton app
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Message d'actualisation (texte blanc pour contraster avec le fond bleu)
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1, // Pour que le texte prenne l'espace disponible
    textAlign: 'center',
  },
});

export default CustomRefreshControl;