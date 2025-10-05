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
  Vibration,
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
    reportDanger: readonly [string, string];
    reportWarning: readonly [string, string];
  };
  primary: {
    main: string;
    dark: string;
    light: string;
    ghost: string;
    subtle: string;
  };
  report: {
    danger: string;
    dangerLight: string;
    warning: string;
    warningLight: string;
    info: string;
    infoLight: string;
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
 * Système de couleurs premium optimisé avec support signalement
 */
const COLORS: ColorSystem = {
  gradients: {
    primary: ["#2B32B2", "#1488CC"] as const,
    secondary: ["#8E2DE2", "#4A00E0"] as const,
    accent: ["#00C6FB", "#005BEA"] as const,
    rose: ["#FF416C", "#FF4B2B"] as const,
    success: ["#00B09B", "#96C93D"] as const,
    header: ['#062C41', '#0F3460'] as const,
    titleBar: ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.03)"] as const,
    buttonHover: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"] as const,
    reportDanger: ["#FF6B6B", "#FF4757"] as const,
    reportWarning: ["#FFA726", "#FF9800"] as const,
  },
  
  primary: {
    main: "#3470FF",
    dark: "#1D4ED8",
    light: "#60A5FA",
    ghost: "rgba(52, 112, 255, 0.08)",
    subtle: "rgba(52, 112, 255, 0.15)",
  },
  
  report: {
    danger: "#FF6B6B",
    dangerLight: "rgba(255, 107, 107, 0.2)",
    warning: "#FFA726",
    warningLight: "rgba(255, 167, 38, 0.2)",
    info: "#42A5F5",
    infoLight: "rgba(66, 165, 245, 0.2)",
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
  
  reportButton: Platform.select({
    ios: {
      shadowColor: "#FF6B6B",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
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
    bounce: EasingFunction;
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
    bounce: Easing.bounce,
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
  
  static reportAlert(
    value: Animated.Value,
    duration: number = ANIMATIONS.duration.fast
  ): CompositeAnimation {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.15,
        duration: duration / 3,
        easing: ANIMATIONS.easing.accelerate,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 0.95,
        duration: duration / 3,
        easing: ANIMATIONS.easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 3,
        easing: ANIMATIONS.easing.gentle,
        useNativeDriver: true,
      }),
    ]);
  }
}

/**
 * Badge d'alerte de signalement avec animation spécialisée
 */
interface ReportAlertBadgeProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  visible?: boolean;
}

const ReportAlertBadge: React.FC<ReportAlertBadgeProps> = memo(({ 
  severity = 'medium', 
  visible = true 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const getBadgeConfig = useCallback(() => {
    switch (severity) {
      case 'critical':
        return { color: COLORS.report.danger, label: '!' };
      case 'high':
        return { color: COLORS.report.warning, label: '!' };
      case 'medium':
        return { color: COLORS.report.info, label: '•' };
      case 'low':
      default:
        return { color: COLORS.report.info, label: '•' };
    }
  }, [severity]);
  
  const badgeConfig = getBadgeConfig();
  
  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      AnimationHelpers.springEnter(scaleAnim).start();
      
      // Pulsation continue pour les alertes critiques
      if (severity === 'critical') {
        const interval = setInterval(() => {
          AnimationHelpers.pulse(pulseAnim, 1.3, 800).start();
        }, 2000);
        
        return () => clearInterval(interval);
      }
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, severity, scaleAnim, pulseAnim]);
  
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.reportAlertBadge,
        { 
          backgroundColor: badgeConfig.color,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim }
          ]
        }
      ]}
    >
      <Text style={styles.reportAlertText}>{badgeConfig.label}</Text>
    </Animated.View>
  );
});

ReportAlertBadge.displayName = 'ReportAlertBadge';

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
  position?: 'left' | 'right';
  variant?: 'default' | 'report';
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Bouton d'action avec interactions fluides et support signalement
 */
const HeaderActionButton: React.FC<HeaderActionButtonProps> = memo(({ 
  iconName, 
  onPress, 
  position = 'right',
  variant = 'default',
  isLoading = false,
  disabled = false
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'left' ? -15 : 15)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  const [isPressed, setIsPressed] = useState<boolean>(false);
  
  // Configuration basée sur la variante
  const getButtonConfig = useCallback(() => {
    if (variant === 'report') {
      return {
        backgroundColor: 'rgba(255, 107, 107, 0.15)',
        borderColor: 'rgba(255, 107, 107, 0.3)',
        iconColor: COLORS.report.danger,
        shadow: SHADOWS.reportButton,
      };
    }
    
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
      borderColor: 'rgba(255, 255, 255, 0.16)',
      iconColor: COLORS.lightText.primary,
      shadow: SHADOWS.button,
    };
  }, [variant]);
  
  const buttonConfig = getButtonConfig();
  
  useEffect(() => {
    const animationDelay = position === 'left' ? 0 : 100;
    const slideValue = position === 'left' ? -15 : 15;
    
    Animated.parallel([
      AnimationHelpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium, animationDelay),
      AnimationHelpers.slideInY(slideAnim, slideValue, ANIMATIONS.duration.medium, animationDelay),
      AnimationHelpers.springEnter(scaleAnim),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim, position]);
  
  // Animation de loading pour le bouton report
  useEffect(() => {
    if (isLoading && variant === 'report') {
      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      
      return () => rotateAnimation.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoading, variant, rotateAnim]);
  
  const handlePressIn = useCallback((): void => {
    if (disabled) return;
    
    setIsPressed(true);
    
    if (variant === 'report') {
      // Feedback haptique pour le signalement
      if (Platform.OS !== 'web') {
        Vibration.vibrate(50);
      }
      
      AnimationHelpers.reportAlert(scaleAnim).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: ANIMATIONS.duration.veryFast,
        easing: ANIMATIONS.easing.standard,
        useNativeDriver: true,
      }).start();
    }
  }, [scaleAnim, variant, disabled]);
  
  const handlePressOut = useCallback((): void => {
    if (disabled) return;
    
    setIsPressed(false);
    AnimationHelpers.springEnter(scaleAnim, 1, 4, 300).start();
  }, [scaleAnim, disabled]);
  
  const handlePress = useCallback((): void => {
    if (disabled || isLoading) return;
    onPress();
  }, [onPress, disabled, isLoading]);
  
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      activeOpacity={1}
      disabled={disabled}
    >
      <Animated.View 
        style={[
          styles.actionButton,
          buttonConfig.shadow,
          { 
            opacity: fadeAnim,
            backgroundColor: isPressed 
              ? `${buttonConfig.backgroundColor}80`
              : buttonConfig.backgroundColor,
            borderColor: buttonConfig.borderColor,
            transform: [
              { translateX: slideAnim },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        <Animated.View
          style={{
            transform: isLoading ? [{ rotate: rotateInterpolate }] : undefined
          }}
        >
          <Icon 
            name={isLoading ? "sync" : iconName} 
            size={22} 
            color={disabled ? COLORS.lightText.disabled : buttonConfig.iconColor} 
          />
        </Animated.View>
        
        {variant === 'report' && !isLoading && (
          <ReportAlertBadge 
            severity="medium" 
            visible={!disabled}
          />
        )}
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
  onReportPress: () => void;
  onTitlePress: () => void;
  onTitleLayout: (event: LayoutChangeEvent) => void;
  isReportLoading?: boolean;
  reportDisabled?: boolean;
}

/**
 * Composant d'en-tête premium avec bouton de signalement optimisé
 * 
 * @description En-tête avec animations fluides, design moderne et signalement intégré
 * @param props Propriétés du composant avec support signalement
 * @returns Composant HeaderSection optimisé avec fonctionnalités de signalement
 */
const HeaderSection: React.FC<HeaderSectionProps> = memo(({
  title,
  onBack,
  onReportPress,
  onTitlePress,
  onTitleLayout,
  isReportLoading = false,
  reportDisabled = false,
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
        
        {/* Bouton Retour */}
        <HeaderActionButton 
          iconName="arrow-back" 
          onPress={onBack}
          position="left"
          variant="default"
        />
        
        {/* Titre Central */}
        <HeaderTitle 
          title={title} 
          onPress={onTitlePress}
          onLayout={onTitleLayout}
        />
        
        {/* Bouton de Signalement */}
        <HeaderActionButton 
          iconName="flag" 
          onPress={onReportPress}
          position="right"
          variant="report"
          isLoading={isReportLoading}
          disabled={reportDisabled}
        />
      </LinearGradient>
    </Animated.View>
  );
});

HeaderSection.displayName = 'HeaderSection';

/**
 * Styles optimisés avec organisation modulaire et support signalement
 */
const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
    ...SHADOWS.header,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 108,
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
    borderWidth: 1,
    position: 'relative',
  },
  reportAlertBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  reportAlertText: {
    color: COLORS.lightText.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
});

export default HeaderSection;