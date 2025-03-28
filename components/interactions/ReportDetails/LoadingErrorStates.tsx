// src/components/interactions/ReportDetails/LoadingErrorStates.tsx

import React, { memo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

// Constantes de style
const COLORS = {
  primary: "#8E2DE2",
  primaryDark: "#4A00E0",
  accent: "#00C6FB",
  accentDark: "#005BEA",
  secondary: "#FF416C",
  secondaryDark: "#FF4B2B",
  error: "#FF416C",
  errorDark: "#FF4B2B",
  darkText: "#0A0A0A",
  lightText: "#FFFFFF",
  subtleGray: "#F8F9FF",
};

const SHADOWS = {
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

interface LoadingStateProps {
  message?: string;
}

/**
 * Composant d'état de chargement avec animations fluides
 */
export const LoadingState = memo(({ message = "Chargement des détails..." }: LoadingStateProps) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Animation de pulsation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Animation de rotation pour un effet de "glow"
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  
  const interpolatedRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <Animated.View 
          style={[
            styles.loaderGlowContainer,
            { 
              transform: [
                { scale: pulseAnim },
                { rotate: interpolatedRotate }
              ] 
            }
          ]}
        >
          <View style={styles.loaderGlow} />
        </Animated.View>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
        
        <Animated.Text 
          style={[
            styles.loadingText,
            { opacity: pulseAnim }
          ]}
        >
          {message}
        </Animated.Text>
      </View>
    </View>
  );
});

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  buttonText?: string;
}

/**
 * Composant d'état d'erreur avec animations et style moderne
 */
export const ErrorState = memo(({
  title = "Signalement introuvable",
  message = "Le signalement demandé n'est pas disponible ou a été supprimé.",
  onRetry,
  buttonText = "Retour",
}: ErrorStateProps) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.errorContainer}>
      <Animated.View 
        style={[
          styles.errorContent,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.errorIconContainer}>
          <View style={styles.errorIconGradient}>
            <Icon name="alert-circle" size={50} color="#FFFFFF" />
          </View>
        </View>
        
        <Text style={styles.errorTitle}>{title}</Text>
        <Text style={styles.errorMessage}>{message}</Text>
        
        <TouchableOpacity
          style={styles.errorButtonContainer}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <View style={styles.errorButton}>
            <Text style={styles.errorButtonText}>{buttonText}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.subtleGray,
  },
  loadingContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loaderGlowContainer: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  loaderGlow: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
    opacity: 0.3,
    backgroundColor: COLORS.accent,
  },
  loaderContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.darkText,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.subtleGray,
    padding: 24,
  },
  errorContent: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 320,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  errorIconContainer: {
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  errorIconGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: COLORS.error,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.darkText,
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#6C7A93",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  errorButtonContainer: {
    width: "100%",
    ...SHADOWS.medium,
  },
  errorButton: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.lightText,
  },
});