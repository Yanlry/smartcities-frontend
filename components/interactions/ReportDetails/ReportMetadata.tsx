// src/components/interactions/ReportDetails/ReportMetadata.tsx

import React, { memo, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Report } from "../../../types/entities/report.types";
import { formatCity, formatDate } from "../../../utils/formatters";
import { getTypeIcon } from "../../../utils/typeIcons";

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
  
  // Dégradés
  gradient: {
    primaryBlue: ["#2563EB", "#1E40AF"],
    skyBlue: ["#0EA5E9", "#0284C7"],
    cool: ["#2563EB", "#06B6D4"],
    sunset: ["#F43F5E", "#F97316"],
    purple: ["#8B5CF6", "#6D28D9"],
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
    
    slideInX: (value, fromValue = 10, duration = 250, delay = 0) => {
      value.setValue(fromValue);
      return Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.bezier(0.0, 0.0, 0.2, 1),
        useNativeDriver: true,
      });
    },
    
    slideInY: (value, fromValue = 10, duration = 250, delay = 0) => {
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

/**
 * Composant badge pour afficher le type de signalement
 * Style moderne avec animation d'entrée fluide
 */
interface TypeBadgeProps {
  type: string;
}

const TypeBadge = memo(({ type }: TypeBadgeProps) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  
  // Lancer les animations d'entrée
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.scale(scaleAnim, 0.96, 1, ANIMATIONS.duration.medium),
    ]).start();
  }, []);

  // Couleurs adaptées selon le type
  const getBadgeStyle = useMemo(() => {
    switch (type.toLowerCase()) {
      case 'urgent':
        return {
          bg: COLORS.tertiary.rose,
          ghost: "rgba(244, 63, 94, 0.08)",
        };
      case 'maintenance':
        return {
          bg: COLORS.tertiary.amber,
          ghost: "rgba(245, 158, 11, 0.08)",
        };
      case 'sécurité':
        return {
          bg: COLORS.tertiary.emerald,
          ghost: "rgba(16, 185, 129, 0.08)",
        };
      default:
        return {
          bg: COLORS.primary.main,
          ghost: COLORS.primary.ghost,
        };
    }
  }, [type]);

  return (
    <Animated.View 
      style={[
        styles.typeBadgeContainer,
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={[
        styles.typeBadge, 
        { backgroundColor: getBadgeStyle.ghost }
      ]}>
        <View 
          style={[
            styles.iconContainer,
            { backgroundColor: getBadgeStyle.bg }
          ]}
        >
          <Image
            source={getTypeIcon(type)}
            style={styles.typeIcon}
            tintColor="#FFFFFF"
          />
        </View>
        <View>
          <Text style={styles.typeCaption}>Type de signalement</Text>
          <Text style={[
            styles.typeText,
            { color: getBadgeStyle.bg }
          ]}>
            {type}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

/**
 * Composant élément de métadonnée
 * Affiche une information avec icône et animation séquentielle
 */
interface MetadataItemProps {
  icon: string;
  text: string;
  delay?: number;
  variant?: 'primary' | 'secondary' | 'accent';
}

const MetadataItem = memo(({ 
  icon, 
  text, 
  delay = 0,
  variant = 'primary',
}: MetadataItemProps) => {
  // Animations refs
  const translateX = useRef(new Animated.Value(12)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Animation ref pour cleanup
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  
  // Style en fonction de la variante
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: COLORS.secondary.ghost,
          icon: COLORS.secondary.main,
        };
      case 'accent':
        return {
          bg: COLORS.accent.ghost,
          icon: COLORS.accent.main,
        };
      default:
        return {
          bg: COLORS.primary.ghost,
          icon: COLORS.primary.main,
        };
    }
  };
  
  // Déclencher les animations
  useEffect(() => {
    animationRef.current = Animated.parallel([
      ANIMATIONS.helpers.slideInX(translateX, 12, ANIMATIONS.duration.medium, delay),
      ANIMATIONS.helpers.fadeIn(opacity, ANIMATIONS.duration.medium, delay),
    ]);
    
    animationRef.current.start();
    
    // Nettoyer les animations
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  const variantStyle = getVariantStyle();

  return (
    <Animated.View 
      style={[
        styles.metaItem,
        {
          opacity,
          transform: [{ translateX }]
        }
      ]}
    >
      <View 
        style={[
          styles.metaIconContainer,
          { backgroundColor: variantStyle.bg }
        ]}
      >
        <Icon name={icon} size={16} color={variantStyle.icon} />
      </View>
      <Text style={styles.metaText}>{text}</Text>
    </Animated.View>
  );
});

/**
 * Composant carte pour les métadonnées
 * Affiche la description et les informations du signalement
 */
interface MetadataCardProps {
  description: string;
  city: string;
  createdAt: string;
  gpsDistance?: number;
}

const MetadataCard = memo(({ description, city, createdAt, gpsDistance }: MetadataCardProps) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;
  
  // Lancer les animations
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      ANIMATIONS.helpers.slideInY(translateY, 15, ANIMATIONS.duration.medium),
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.card,
        { 
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      {/* En-tête de la carte */}
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrapper}>
          <Icon name="document-text-outline" size={16} color={COLORS.primary.main} />
        </View>
        <Text style={styles.sectionTitle}>Description</Text>
      </View>
      
      {/* Description du signalement */}
      <Text style={styles.description}>{description}</Text>
      
      {/* Séparateur visuel */}
      <View style={styles.divider} />
      
      {/* Métadonnées avec animations séquentielles */}
      <View style={styles.metaContainer}>
        <MetadataItem 
          icon="location-outline" 
          text={formatCity(city)}
          delay={50}
          variant="primary"
        />
        
        <MetadataItem 
          icon="calendar-outline" 
          text={formatDate(createdAt)}
          delay={100}
          variant="secondary"
        />
        
        {gpsDistance !== undefined && (
          <MetadataItem 
            icon="navigate-outline" 
            text={`${gpsDistance.toFixed(1)} km`}
            delay={150}
            variant="accent"
          />
        )}
      </View>
    </Animated.View>
  );
});

/**
 * Composant principal ReportMetadata
 * Affiche toutes les métadonnées d'un signalement
 */
interface ReportMetadataProps {
  report: Report;
}

const ReportMetadata: React.FC<ReportMetadataProps> = ({ report }) => {
  return (
    <>
      <TypeBadge type={report.type} />
      <MetadataCard
        description={report.description}
        city={report.city}
        createdAt={report.createdAt}
        gpsDistance={report.gpsDistance}
      />
    </>
  );
};

const styles = StyleSheet.create({
  // Type Badge Styles
  typeBadgeContainer: {
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.glass.white,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    ...SHADOWS.sm,
  },
  typeIcon: {
    width: 20,
    height: 20,
  },
  typeCaption: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  typeText: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },
  
  // Card Styles
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.glass.white,
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...SHADOWS.float,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary.ghost,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[800],
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 14,
  },
  
  // Metadata Styles
  metaContainer: {
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray[700],
  },
});

export default memo(ReportMetadata);