// src/components/interactions/ReportDetails/HeaderSection.tsx

import React, { memo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

/**
 * Système de couleurs premium avec dégradés riches
 */
const COLORS = {
  // Palette dégradés primaire
  gradients: {
    primary: ["#2B32B2", "#1488CC"],
    secondary: ["#8E2DE2", "#4A00E0"],
    accent: ["#00C6FB", "#005BEA"],
    rose: ["#FF416C", "#FF4B2B"],
    success: ["#00B09B", "#96C93D"],
    header: ["rgba(37, 95, 240, 0.85)", "rgba(35, 76, 203, 0.92)"],
    titleBar: ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.03)"],
    buttonHover: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
  },
  
  // Couleurs primaires
  primary: {
    main: "#3470FF",
    dark: "#1D4ED8",
    light: "#60A5FA",
    ghost: "rgba(52, 112, 255, 0.08)",
    subtle: "rgba(52, 112, 255, 0.15)",
  },
  
  // Palette pour le texte sur fond foncé
  lightText: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.4)",
  },
  
  // Échelle de gris raffinée
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  
  // Effets transparents
  glass: {
    white: "rgba(255, 255, 255, 0.95)",
    light: "rgba(255, 255, 255, 0.2)",
    dark: "rgba(0, 0, 0, 0.1)",
    border: "rgba(255, 255, 255, 0.18)",
  },
};

/**
 * Système d'ombres sophistiqué avec différents niveaux d'élévation
 */
const SHADOWS = {
  // Ombres adaptées par plateforme
  button: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
    },
    android: {
      elevation: 3,
    },
  }),
  
  // Ombre pour header premium
  header: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 5,
    },
  }),
  
  // Ombre spécifique pour titre
  title: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
};

/**
 * Système d'animation avancé avec courbes et timing sophistiqués
 */
const ANIMATIONS = {
  duration: {
    veryFast: 120,
    fast: 200,
    medium: 300,
    slow: 450,
  },
  
  // Courbes d'accélération sophistiquées
  easing: {
    // Standard Material Design easing
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    // Pour les entrées et apparitions
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    // Pour les sorties et disparitions
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    // Pour les rebonds élégants
    gentle: Easing.bezier(0.34, 1.56, 0.64, 1),
    // Pour une impression de légèreté
    elastic: Easing.elastic(1),
  },
  
  // Helpers pour simplifier l'usage des animations
  helpers: {
    fadeIn: (value, duration = 300, delay = 0, easing = Easing.bezier(0.0, 0.0, 0.2, 1)) => 
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
      
    slideInY: (value, fromValue = 15, duration = 300, delay = 0) => {
      value.setValue(fromValue);
      return Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.bezier(0.0, 0.0, 0.2, 1),
        useNativeDriver: true,
      });
    },
    
    pulse: (value, toValue = 1.05, duration = 300) => {
      return Animated.sequence([
        Animated.timing(value, {
          toValue,
          duration: duration / 2,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.bezier(0.0, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]);
    },
  },
};

/**
 * Badge de notification animé pour les boutons d'action
 */
const NotificationBadge = memo(() => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animation d'entrée avec rebond léger
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 300,
      useNativeDriver: true,
    }).start();
    
    // Animation de pulsation toutes les 3 secondes
    const interval = setInterval(() => {
      ANIMATIONS.helpers.pulse(scaleAnim, 1.2, 600).start();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.notificationBadge,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Text style={styles.notificationText}>2</Text>
    </Animated.View>
  );
});

interface HeaderTitleProps {
  title: string;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

/**
 * Sous-composant pour le titre avec effets visuels premium
 */
const HeaderTitle = memo(({ title, onPress, onLayout }: HeaderTitleProps) => {
  // Animations pour le titre
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.slideInY(slideAnim, -8, ANIMATIONS.duration.medium),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.medium,
        easing: ANIMATIONS.easing.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, [title]);

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      onLayout={onLayout}
      style={styles.headerTitleTouchable}
    >
      <LinearGradient
        colors={COLORS.gradients.titleBar as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.titleGradientContainer}
      >
        <Animated.View 
          style={[
            styles.headerTitleContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.infoIconContainer}>
            <Icon name="information-circle-outline" size={14} color={COLORS.lightText.primary} />
          </View>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

interface HeaderActionButtonProps {
  iconName: string;
  onPress: () => void;
  showBadge?: boolean;
  position?: 'left' | 'right';
}

const HeaderActionButton = memo(({ 
  iconName, 
  onPress, 
  showBadge = false,
  position = 'right'
}: HeaderActionButtonProps) => {
  // Animation pour l'entrée - Native
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'left' ? -15 : 15)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Animation pour l'effet de survol - JavaScript
  const [isPressed, setIsPressed] = useState(false);
  
  // Déclencher les animations d'entrée
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium, position === 'left' ? 0 : 100),
      ANIMATIONS.helpers.slideInY(slideAnim, position === 'left' ? -15 : 15, ANIMATIONS.duration.medium, position === 'left' ? 0 : 100),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Gestionnaires d'événements - sans conflit d'animation
  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: ANIMATIONS.duration.veryFast,
      easing: ANIMATIONS.easing.standard,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.actionButton,
          { 
            opacity: fadeAnim,
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ],
            backgroundColor: isPressed 
              ? 'rgba(255, 255, 255, 0.24)' 
              : 'rgba(255, 255, 255, 0.12)',
          }
        ]}
      >
        <Icon name={iconName} size={22} color={COLORS.lightText.primary} />
        {showBadge && <NotificationBadge />}
      </Animated.View>
    </TouchableOpacity>
  );
});

interface HeaderSectionProps {
  title: string;
  onBack: () => void;
  onNotificationsPress: () => void;
  onTitlePress: () => void;
  onTitleLayout: (event: LayoutChangeEvent) => void;
}

/**
 * Composant d'en-tête premium avec effets visuels riches et animations élégantes
 */
const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  onBack,
  onNotificationsPress,
  onTitlePress,
  onTitleLayout,
}) => {
  // Animation pour l'en-tête complet
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-10)).current;
  
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.slideInY(translateYAnim, -10, ANIMATIONS.duration.medium),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.headerContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={COLORS.gradients.header as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Élément décoratif en arrière-plan */}
        <View style={styles.headerDecoration}>
          <View style={styles.decorationCircle1} />
          <View style={styles.decorationCircle2} />
        </View>
        
        <HeaderActionButton 
          iconName="arrow-back" 
          onPress={onBack}
          position="left"
        />
        
        <HeaderTitle 
          title={title} 
          onPress={onTitlePress}
          onLayout={onTitleLayout}
        />
        
        <HeaderActionButton 
          iconName="notifications-outline" 
          onPress={onNotificationsPress}
          showBadge={true}
          position="right"
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
    ...SHADOWS.header,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorationCircle1: {
    position: 'absolute',
    top: -120,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  decorationCircle2: {
    position: 'absolute',
    bottom: -100,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  headerTitleTouchable: {
    flex: 1,
    paddingHorizontal: 12,
    height: 36,
  },
  titleGradientContainer: {
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.lightText.primary,
    maxWidth: '90%',
    textAlign: "center",
    letterSpacing: 0.2,
    ...SHADOWS.title,
  },
  infoIconContainer: {
    marginLeft: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    ...SHADOWS.button,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF416C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  notificationText: {
    color: COLORS.lightText.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default memo(HeaderSection);