// Chemin: components/home/CircularProgress.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

/**
 * Interface pour les propriétés du composant CircularProgress
 */
interface CircularProgressProps {
  /** Pourcentage à afficher (0-100) */
  percentage: number;
  /** Taille du cercle (largeur et hauteur) */
  size?: number;
  /** Couleur principale de l'arc de progression */
  color?: string;
  /** Couleur d'arrière-plan de l'arc */
  backgroundColor?: string;
  /** Contrôle l'affichage du pourcentage au centre */
  showValue?: boolean;
  /** Taille de la police pour le texte du pourcentage */
  fontSize?: number;
  /** Épaisseur de l'arc de progression */
  thickness?: number;
  /** Couleur du texte de pourcentage */
  textColor?: string;
  /** Style de police pour le texte de pourcentage */
  fontWeight?: "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";
}

/**
 * Composant CircularProgress - Affiche un indicateur de progression circulaire
 * Optimisé selon les principes CIF avec animations natives et rendu SVG précis
 */
const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 48,
  color = '#4CAF50',
  backgroundColor = 'rgba(255, 255, 255, 0.15)',
  showValue = true,
  fontSize = 12,
  thickness = 5,
  textColor = '#FFFFFF',
  fontWeight = 'bold'
}) => {
  // Normaliser le pourcentage entre 0-100
  const normalizedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Animation de la progression
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Constantes calculées pour le rendu SVG
  const radius = useMemo(() => size / 2, [size]);
  const circumference = useMemo(() => 2 * Math.PI * (radius - thickness / 2), [radius, thickness]);
  const halfCircle = useMemo(() => radius - thickness / 2, [radius, thickness]);
  
  // Calcul de la valeur d'animation appropriée selon la plateforme
  const strokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: Platform.OS === 'ios' 
      ? [circumference, 0] 
      : [circumference, 0]
  });
  
  // Animation fluide suivant les standards CIF (300ms, Easing.cubic)
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: normalizedPercentage,
      duration: 800, // Un peu plus long pour une animation plus visible
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [normalizedPercentage, progressAnimation]);
  
  // Création du cercle interne pour l'effet de donut
  const innerCircleRadius = radius - thickness;
  
  // Composant Circle adapté pour l'animation avec Animated
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Cercle d'arrière-plan */}
        <Circle
          cx={radius}
          cy={radius}
          r={halfCircle}
          stroke={backgroundColor}
          strokeWidth={thickness}
          fill="transparent"
        />
        
        {/* Cercle de progression animé */}
        <G rotation={-90} origin={`${radius}, ${radius}`}>
          <AnimatedCircle
            cx={radius}
            cy={radius}
            r={halfCircle}
            stroke={color}
            strokeWidth={thickness}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      
      {/* Cercle interne et affichage du pourcentage */}
      {showValue && (
        <View style={[
          styles.valueContainer, 
          { 
            width: innerCircleRadius * 2, 
            height: innerCircleRadius * 2,
            borderRadius: innerCircleRadius,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }
        ]}>
          <Text 
            style={[
              styles.valueText, 
              { 
                fontSize,
                color: textColor,
                fontWeight
              }
            ]}
          >
            {Math.round(normalizedPercentage)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    textAlign: 'center',
  }
});

export default React.memo(CircularProgress);