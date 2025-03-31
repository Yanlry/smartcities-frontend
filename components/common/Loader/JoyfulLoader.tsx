import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

/**
 * Interface des props pour le composant JoyfulLoader
 */
interface JoyfulLoaderProps {
  /** Message à afficher pendant le chargement */
  message?: string;
  /** Couleur principale des éléments animés */
  color?: string;
  /** Taille du loader (affecte le cercle et les points) */
  size?: 'small' | 'medium' | 'large';
}

/**
 * JoyfulLoader - Un loader de chargement animé avec un style moderne et joyeux
 * 
 * @param props - Les propriétés du composant
 * @returns Composant React
 */
const JoyfulLoader: React.FC<JoyfulLoaderProps> = ({
  message = "Chargement en cours...",
  color = "#6200EE", // Couleur Material Design par défaut
  size = 'medium'
}) => {
  // Références pour les animations
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0.6)).current;

  // Dimensions basées sur la taille
  const getDimensions = () => {
    switch (size) {
      case 'small':
        return {
          circleSize: 40,
          dotSize: 6,
          fontSize: 12
        };
      case 'large':
        return {
          circleSize: 80,
          dotSize: 12,
          fontSize: 18
        };
      default: // medium
        return {
          circleSize: 60,
          dotSize: 8,
          fontSize: 16
        };
    }
  };

  const { circleSize, dotSize, fontSize } = getDimensions();

  useEffect(() => {
    // Animation initiale d'apparition
    Animated.parallel([
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Animation de rebondissement pour les points avec décalage
    const createBounceAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Démarrer les animations de rebondissement avec décalage pour un effet fluide
    createBounceAnimation(bounce1, 0).start();
    createBounceAnimation(bounce2, 150).start();
    createBounceAnimation(bounce3, 300).start();

    // Animation de rotation du cercle
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Nettoyer les animations lors du démontage du composant
    return () => {
      // Arrêter toutes les animations
      bounce1.stopAnimation();
      bounce2.stopAnimation();
      bounce3.stopAnimation();
      rotation.stopAnimation();
      messageOpacity.stopAnimation();
      circleScale.stopAnimation();
    };
  }, []);

  // Transformations pour les animations
  const getAnimatedDotStyle = (bounceValue: Animated.Value) => {
    return {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: color,
      marginHorizontal: dotSize / 2,
      transform: [
        { 
          translateY: bounceValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -(circleSize/4)]
          })
        },
        { 
          scale: bounceValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [1, 1.3, 1]
          })
        }
      ],
    };
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.circleContainer,
          {
            opacity: messageOpacity,
            transform: [{ scale: circleScale }]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.circle,
            { 
              width: circleSize, 
              height: circleSize, 
              borderRadius: circleSize / 2,
              borderColor: color,
              transform: [{ rotate: rotateInterpolate }]
            }
          ]}
        >
          <View style={styles.innerCircle}>
            <View style={styles.dotsContainer}>
              <Animated.View style={getAnimatedDotStyle(bounce1)} />
              <Animated.View style={getAnimatedDotStyle(bounce2)} />
              <Animated.View style={getAnimatedDotStyle(bounce3)} />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
      
      <Animated.Text 
        style={[
          styles.loadingText,
          { 
            color, 
            fontSize,
            opacity: messageOpacity,
            transform: [
              { 
                translateY: messageOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })
              }
            ]
          }
        ]}
      >
        {message}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    marginBottom: 16,
  },
  circle: {
    borderWidth: 2,
    borderColor: '#6200EE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default JoyfulLoader;