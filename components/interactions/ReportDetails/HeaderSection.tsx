// src/components/interactions/ReportDetails/HeaderSection.tsx

import React, { memo, useRef, useEffect, useState, useCallback } from "react";
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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

/**
 * Type pour les fonctions d'easing React Native
 */
type EasingFunction = (value: number) => number;

/**
 * Type pour les animations composites
 */
type CompositeAnimation = Animated.CompositeAnimation;

/**
 * Configuration des couleurs avec typage strict
 */
interface ColorSystem {
  gradients: {
    primary: readonly [string, string];
    secondary: readonly [string, string];
    accent: readonly [string, string];
    rose: readonly [string, string];
    success: readonly [string, string];
    header: readonly [string, string];
    titleBar: readonly [string, string];
    buttonHover: readonly [string, string];
  };
  primary: {
    main: string;
    dark: string;
    light: string;
    ghost: string;
    subtle: string;
  };
  lightText: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  gray: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  glass: {
    white: string;
    light: string;
    dark: string;
    border: string;
  };
}

/**
 * Système de couleurs premium optimisé
 */
const COLORS: ColorSystem = {
  gradients: {
    primary: ["#2B32B2", "#1488CC"] as const,
    secondary: ["#8E2DE2", "#4A00E0"] as const,
    accent: ["#00C6FB", "#005BEA"] as const,
    rose: ["#FF416C", "#FF4B2B"] as const,
    success: ["#00B09B", "#96C93D"] as const,
    header: ["rgba(37, 95, 240, 0.85)", "rgba(35, 76, 203, 0.92)"] as const,
    titleBar: ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.03)"] as const,
    buttonHover: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"] as const,
  },
  
  primary: {
    main: "#3470FF",
    dark: "#1D4ED8",
    light: "#60A5FA",
    ghost: "rgba(52, 112, 255, 0.08)",
    subtle: "rgba(52, 112, 255, 0.15)",
  },
  
  lightText: {
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.7)",
    disabled: "rgba(255, 255, 255, 0.4)",
  },
  
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
  
  glass: {
    white: "rgba(255, 255, 255, 0.95)",
    light: "rgba(255, 255, 255, 0.2)",
    dark: "rgba(0, 0, 0, 0.1)",
    border: "rgba(255, 255, 255, 0.18)",
  },
} as const;

/**
 * Système d'ombres optimisé par plateforme
 */
const SHADOWS = {
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
} as const;

/**
 * Configuration d'animation avec types optimisés
 */
interface AnimationConfig {
  duration: {
    veryFast: number;
    fast: number;
    medium: number;
    slow: number;
  };
  easing: {
    standard: EasingFunction;
    decelerate: EasingFunction;
    accelerate: EasingFunction;
    gentle: EasingFunction;
    elastic: EasingFunction;
  };
}

/**
 * Système d'animation avancé avec courbes sophistiquées
 */
const ANIMATIONS: AnimationConfig = {
  duration: {
    veryFast: 120,
    fast: 200,
    medium: 300,
    slow: 450,
  },
  
  easing: {
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    gentle: Easing.bezier(0.34, 1.56, 0.64, 1),
    elastic: Easing.elastic(1),
  },
} as const;

/**
 * Helpers d'animation optimisés avec types stricts
 */
class AnimationHelpers {
  static fadeIn(
    value: Animated.Value,
    duration: number = ANIMATIONS.duration.medium,
    delay: number = 0,
    easing: EasingFunction = ANIMATIONS.easing.decelerate
  ): CompositeAnimation {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing,
      useNativeDriver: true,
    });
  }
  
  static slideInY(
    value: Animated.Value,
    fromValue: number = 15,
    duration: number = ANIMATIONS.duration.medium,
    delay: number = 0
  ): CompositeAnimation {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue: 0,
      duration,
      delay,
      easing: ANIMATIONS.easing.decelerate,
      useNativeDriver: true,
    });
  }
  
  static pulse(
    value: Animated.Value,
    toValue: number = 1.05,
    duration: number = ANIMATIONS.duration.medium
  ): CompositeAnimation {
    return Animated.sequence([
      Animated.timing(value, {
        toValue,
        duration: duration / 2,
        easing: ANIMATIONS.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        easing: ANIMATIONS.easing.standard,
        useNativeDriver: true,
      }),
    ]);
  }
  
  static springEnter(
    value: Animated.Value,
    toValue: number = 1,
    friction: number = 6,
    tension: number = 300
  ): CompositeAnimation {
    return Animated.spring(value, {
      toValue,
      friction,
      tension,
      useNativeDriver: true,
    });
  }
}

/**
 * Badge de notification avec animation optimisée
 */
interface NotificationBadgeProps {
  count?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = memo(({ count = 2 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animation d'entrée
    AnimationHelpers.springEnter(scaleAnim).start();
    
    // Pulsation périodique
    const interval = setInterval(() => {
      AnimationHelpers.pulse(scaleAnim, 1.2, 600).start();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [scaleAnim]);
  
  return (
    <Animated.View 
      style={[
        styles.notificationBadge,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <Text style={styles.notificationText}>{count}</Text>
    </Animated.View>
  );
});

NotificationBadge.displayName = 'NotificationBadge';

/**
 * Interface pour le titre d'en-tête
 */
interface HeaderTitleProps {
  title: string;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

/**
 * Composant titre avec animations fluides
 */
const HeaderTitle: React.FC<HeaderTitleProps> = memo(({ title, onPress, onLayout }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.parallel([
      AnimationHelpers.fadeIn(fadeAnim),
      AnimationHelpers.slideInY(slideAnim, -8),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.medium,
        easing: ANIMATIONS.easing.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, [title, fadeAnim, slideAnim, scaleAnim]);

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress} 
      onLayout={onLayout}
      style={styles.headerTitleTouchable}
    >
      <LinearGradient
        colors={COLORS.gradients.titleBar}
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

HeaderTitle.displayName = 'HeaderTitle';

/**
 * Interface pour les boutons d'action
 */
interface HeaderActionButtonProps {
  iconName: string;
  onPress: () => void;
  showBadge?: boolean;
  position?: 'left' | 'right';
  badgeCount?: number;
}

/**
 * Bouton d'action avec interactions fluides
 */
const HeaderActionButton: React.FC<HeaderActionButtonProps> = memo(({ 
  iconName, 
  onPress, 
  showBadge = false,
  position = 'right',
  badgeCount = 2
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'left' ? -15 : 15)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const [isPressed, setIsPressed] = useState<boolean>(false);
  
  useEffect(() => {
    const animationDelay = position === 'left' ? 0 : 100;
    const slideValue = position === 'left' ? -15 : 15;
    
    Animated.parallel([
      AnimationHelpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium, animationDelay),
      AnimationHelpers.slideInY(slideAnim, slideValue, ANIMATIONS.duration.medium, animationDelay),
      AnimationHelpers.springEnter(scaleAnim),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, position]);
  
  const handlePressIn = useCallback((): void => {
    setIsPressed(true);
    Animated.timing(scaleAnim, {
      toValue: 0.92,
      duration: ANIMATIONS.duration.veryFast,
      easing: ANIMATIONS.easing.standard,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  
  const handlePressOut = useCallback((): void => {
    setIsPressed(false);
    AnimationHelpers.springEnter(scaleAnim, 1, 4, 300).start();
  }, [scaleAnim]);
  
  const handlePress = useCallback((): void => {
    onPress();
  }, [onPress]);
  
  return (
    <TouchableOpacity
      onPress={handlePress}
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
        {showBadge && <NotificationBadge count={badgeCount} />}
      </Animated.View>
    </TouchableOpacity>
  );
});

HeaderActionButton.displayName = 'HeaderActionButton';

/**
 * Interface principale du composant HeaderSection
 */
interface HeaderSectionProps {
  title: string;
  onBack: () => void;
  onNotificationsPress: () => void;
  onTitlePress: () => void;
  onTitleLayout: (event: LayoutChangeEvent) => void;
  notificationCount?: number;
}

/**
 * Composant d'en-tête premium avec architecture optimisée
 * 
 * @description En-tête avec animations fluides, design moderne et interactions optimisées
 * @param props Propriétés du composant
 * @returns Composant HeaderSection optimisé
 */
const HeaderSection: React.FC<HeaderSectionProps> = memo(({
  title,
  onBack,
  onNotificationsPress,
  onTitlePress,
  onTitleLayout,
  notificationCount = 2,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-10)).current;
  
  useEffect(() => {
    Animated.parallel([
      AnimationHelpers.fadeIn(fadeAnim),
      AnimationHelpers.slideInY(translateYAnim, -10),
    ]).start();
  }, [fadeAnim, translateYAnim]);

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
        colors={COLORS.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Éléments décoratifs */}
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
          badgeCount={notificationCount}
        />
      </LinearGradient>
    </Animated.View>
  );
});

HeaderSection.displayName = 'HeaderSection';

/**
 * Styles optimisés avec organisation modulaire
 */
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
    pointerEvents: 'none',
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

export default HeaderSection;