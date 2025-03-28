// src/components/interactions/ReportDetails/UserInfoSection.tsx

import React, { memo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { User } from "../../../types/entities/report.types";

/**
 * Système de couleurs raffiné avec dégradés subtils et tonalités élégantes
 */
const COLORS = {
  // Palette primaire - Bleus profonds et subtils
  primary: {
    main: "#2563EB",
    dark: "#1D4ED8",
    light: "#60A5FA",
    ghost: "rgba(37, 99, 235, 0.08)",
    subtle: "rgba(37, 99, 235, 0.15)",
  },
  
  // Palette secondaire - Dégradés sophistiqués
  secondary: {
    main: "#3B82F6",
    dark: "#1E40AF",
    light: "#93C5FD",
    ghost: "rgba(59, 130, 246, 0.08)",
  },
  
  // Palette accent - Touches visuelles douces
  accent: {
    main: "#06B6D4",
    dark: "#0E7490",
    light: "#67E8F9",
    ghost: "rgba(6, 182, 212, 0.08)",
  },
  
  // Palette tertiaire - Pour la variété et l'équilibre
  tertiary: {
    violet: "#8B5CF6",
    rose: "#F43F5E",
    amber: "#F59E0B",
    emerald: "#10B981",
  },
  
  // États et feedback
  state: {
    success: "#16A34A",
    warning: "#F97316",
    error: "#DC2626",
    info: "#0284C7",
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
    light: "rgba(255, 255, 255, 0.85)",
    card: "rgba(255, 255, 255, 0.75)",
    border: "rgba(255, 255, 255, 0.12)",
  },
};

/**
 * Système d'ombres raffiné avec différents niveaux d'élévation
 */
const SHADOWS = {
  // Ombres adaptées par plateforme
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  
  // Ombre pour les cartes avec effet float
  float: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
};

/**
 * Système d'animation sophistiqué avec courbes et timing optimisés
 */
const ANIMATIONS = {
  duration: {
    fast: 180,
    medium: 250,
    slow: 400,
  },
  
  // Courbes d'accélération sophistiquées
  easing: {
    // Standard Material Design easing
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    // Pour les entrées et apparitions
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    // Pour les sorties et disparitions
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    // Pour les rebonds subtils
    gentle: Easing.bezier(0.34, 1.56, 0.64, 1),
  },
  
  // Helpers pour simplifier l'usage des animations
  helpers: {
    fadeIn: (value, duration = 250, delay = 0, easing = Easing.bezier(0.0, 0.0, 0.2, 1)) => 
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
      
    slideInY: (value, fromValue = 15, duration = 250, delay = 0) => {
      value.setValue(fromValue);
      return Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.bezier(0.0, 0.0, 0.2, 1),
        useNativeDriver: true,
      });
    },
    
    scale: (value, fromValue = 0.97, toValue = 1, duration = 250, delay = 0) => {
      value.setValue(fromValue);
      return Animated.timing(value, {
        toValue,
        duration,
        delay,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Subtle bounce
        useNativeDriver: true,
      });
    },
  },
};

interface UserInfoSectionProps {
  user: User;
  onUserPress: (userId: number) => void;
}

/**
 * Composant affichant les informations utilisateur avec un design élégant et moderne
 */
const UserInfoSection: React.FC<UserInfoSectionProps> = ({
  user,
  onUserPress,
}) => {
  // Animations d'entrée et interaction
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const pressAnim = useRef(new Animated.Value(0)).current;
  
  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.slideInY(slideAnim, 20, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.scale(scaleAnim, 0.97, 1, ANIMATIONS.duration.medium),
    ]).start();
  }, []);
  
  // Préparation des données utilisateur
  const displayName = user.useFullName
    ? `${user.firstName || ''} ${user.lastName || ''}`
    : user.username;
  
  const avatarLetter = user.firstName 
    ? user.firstName.charAt(0).toUpperCase() 
    : user.username.charAt(0).toUpperCase();

  // Gestion des animations d'interaction
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(pressAnim, {
        toValue: 0,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  // Interpolation pour le changement d'élévation
  const shadowInterpolation = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 1]
  });

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {/* En-tête de la carte */}
      <View style={styles.headerContainer}>
        {/* Titre avec icône */}
        <View style={styles.titleContainer}>
          <View style={styles.iconWrapper}>
            <Icon name="person-outline" size={16} color={COLORS.primary.main} />
          </View>
          <Text style={styles.titleText}>Signalé par</Text>
        </View>
        
        {/* Badge de vérification */}
        <View style={styles.verifiedBadge}>
          <Icon name="shield-checkmark" size={10} color="#FFFFFF" />
          <Text style={styles.verifiedText}>Vérifié</Text>
        </View>
      </View>
      
      {/* Carte utilisateur interactive */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => onUserPress(user.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View 
          style={[
            styles.userCardOuter,
            {
              transform: [{ scale: Animated.add(0.98, Animated.multiply(pressAnim, 0.02)) }]
            }
          ]}
        >
          <View style={styles.userContainer}>
            {/* Avatar avec lettre initiale */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            
            {/* Informations utilisateur */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <View style={styles.roleContainer}>
                <Icon name="star" size={12} color={COLORS.tertiary.amber} style={styles.roleIcon} />
                <Text style={styles.userRole}>Citoyen contributeur</Text>
              </View>
            </View>
            
            {/* Indicateur de navigation */}
            <View style={styles.arrowContainer}>
              <Icon 
                name="chevron-forward" 
                size={18} 
                color={COLORS.primary.main} 
              />
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Texte d'information */}
      <Text style={styles.footerText}>
        Appuyez pour voir le profil complet
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Conteneur principal
  cardContainer: {
    padding: 20,
    backgroundColor: COLORS.glass.white,
    borderRadius: 16,
    ...SHADOWS.float,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  
  // En-tête
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: COLORS.primary.ghost,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[800],
    letterSpacing: 0.2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  
  // Carte utilisateur
  userCardOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.primary.ghost,
    ...SHADOWS.md,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
  },
  
  // Avatar
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary.main,
    ...SHADOWS.sm,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  
  // Informations utilisateur
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    marginRight: 4,
  },
  userRole: {
    fontSize: 13,
    color: COLORS.gray[600],
  },
  
  // Indicateur de navigation
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary.ghost,
  },
  
  // Texte d'information
  footerText: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginTop: 12,
  }
});

export default memo(UserInfoSection);