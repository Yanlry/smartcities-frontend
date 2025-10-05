// Chemin : src/components/interactions/ReportDetails/ReportMetadata.tsx

import React, { memo, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Report } from "../../../types/entities/report.types";
import { formatCity, formatDate } from "../../../utils/formatters";
import { getTypeIcon } from "../../../utils/typeIcons";

/**
 * 🎨 DESIGN SYSTEM - ENTERPRISE GRADE
 * Inspiré d'Apple, Tesla et des plus grandes entreprises tech
 * Palette minimaliste, sobre et intemporelle
 */
const DESIGN_SYSTEM = {
  /**
   * Palette de couleurs ultra-sobre
   * Monochrome avec un accent bleu système subtil
   */
  colors: {
    // Accent système - Un seul bleu, précis et professionnel
    primary: {
      50: "#F0F7FF",
      100: "#E0EFFF",
      200: "#BAE0FF",
      300: "#7CC4FA",
      400: "#36A3F7",
      500: "#0B7FE8", // Couleur principale - Bleu système
      600: "#0864C6",
      700: "#0A4FA1",
      800: "#0D4085",
      900: "#11366E",
    },

    // Palette de gris ultra-neutre et professionnelle
    neutral: {
      0: "#FFFFFF",
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E8E8E8",
      300: "#D6D6D6",
      400: "#AFAFAF",
      500: "#8B8B8B",
      600: "#6B6B6B",
      700: "#4A4A4A",
      800: "#2E2E2E",
      900: "#1A1A1A",
      1000: "#000000",
    },

    // États sémantiques - Couleurs contextuelles subtiles
    semantic: {
      success: {
        main: "#34C759",
        light: "#E8F8EC",
        dark: "#2AA047",
      },
      warning: {
        main: "#FF9500",
        light: "#FFF4E6",
        dark: "#CC7700",
      },
      error: {
        main: "#FF3B30",
        light: "#FFEBE9",
        dark: "#CC2F26",
      },
      info: {
        main: "#007AFF",
        light: "#E6F2FF",
        dark: "#0062CC",
      },
    },

    // Overlays et transparences calculées
    alpha: {
      black: {
        5: "rgba(0, 0, 0, 0.02)",
        10: "rgba(0, 0, 0, 0.04)",
        20: "rgba(0, 0, 0, 0.08)",
        30: "rgba(0, 0, 0, 0.12)",
        40: "rgba(0, 0, 0, 0.16)",
        50: "rgba(0, 0, 0, 0.24)",
      },
      white: {
        5: "rgba(255, 255, 255, 0.02)",
        10: "rgba(255, 255, 255, 0.04)",
        20: "rgba(255, 255, 255, 0.08)",
        30: "rgba(255, 255, 255, 0.12)",
        50: "rgba(255, 255, 255, 0.24)",
        90: "rgba(255, 255, 255, 0.92)",
      },
    },
  },

  /**
   * Système d'ombres multicouches
   * Inspiré des Material Design Elevation et iOS depth
   */
  shadows: {
    // Ombres iOS-style avec plusieurs couches
    subtle: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),

    soft: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),

    medium: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),

    elevated: Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),

    // Ombres composées pour effet premium
    layered: Platform.select({
      ios: [
        {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 1,
        },
        {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        {
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
        },
      ],
      android: {
        elevation: 6,
      },
    }),
  },

  /**
   * Système typographique hiérarchisé
   * Échelle modulaire avec ratios harmonieux
   */
  typography: {
    // Tailles de police avec échelle 1.25 (Quarte parfaite)
    fontSize: {
      xs: 11,
      sm: 13,
      base: 15,
      md: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 28,
    },

    // Poids de police standardisés
    fontWeight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
    },

    // Hauteurs de ligne optimisées
    lineHeight: {
      tight: 1.2,
      snug: 1.4,
      normal: 1.5,
      relaxed: 1.6,
      loose: 1.8,
    },

    // Espacement des lettres
    letterSpacing: {
      tighter: -0.4,
      tight: -0.2,
      normal: 0,
      wide: 0.4,
      wider: 0.8,
      widest: 1.2,
    },
  },

  /**
   * Système d'espacement cohérent
   * Basé sur une unité de base de 4px
   */
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
  },

  /**
   * Rayons de bordure harmonieux
   */
  radius: {
    sm: 6,
    base: 8,
    md: 10,
    lg: 12,
    xl: 16,
    "2xl": 20,
    "3xl": 24,
    full: 9999,
  },

  /**
   * Système d'animations micro
   * Timing précis et courbes naturelles
   */
  animation: {
    // Durées standardisées
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      slow: 400,
    },

    // Courbes d'accélération iOS-style
    timing: {
      // Ease standard iOS
      standard: Easing.bezier(0.25, 0.1, 0.25, 1),
      // Ease-out pour les entrées
      easeOut: Easing.bezier(0, 0, 0.2, 1),
      // Ease-in pour les sorties
      easeIn: Easing.bezier(0.4, 0, 1, 1),
      // Ease-in-out pour les transitions
      easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
    },
  },
};

/**
 * 🛠️ ANIMATION UTILITIES
 * Helpers réutilisables pour animations cohérentes
 */
const AnimationUtils = {
  /**
   * Fade in avec paramètres optimisés
   */
  fadeIn: (
    animatedValue: Animated.Value,
    duration = DESIGN_SYSTEM.animation.duration.normal,
    delay = 0
  ) => {
    animatedValue.setValue(0);
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      delay,
      easing: DESIGN_SYSTEM.animation.timing.easeOut,
      useNativeDriver: true,
    });
  },

  /**
   * Slide avec direction personnalisable
   */
  slide: (
    animatedValue: Animated.Value,
    from = 20,
    duration = DESIGN_SYSTEM.animation.duration.normal,
    delay = 0
  ) => {
    animatedValue.setValue(from);
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      delay,
      easing: DESIGN_SYSTEM.animation.timing.easeOut,
      useNativeDriver: true,
    });
  },

  /**
   * Scale subtil pour micro-interactions
   */
  scale: (
    animatedValue: Animated.Value,
    from = 0.98,
    to = 1,
    duration = DESIGN_SYSTEM.animation.duration.normal,
    delay = 0
  ) => {
    animatedValue.setValue(from);
    return Animated.timing(animatedValue, {
      toValue: to,
      duration,
      delay,
      easing: DESIGN_SYSTEM.animation.timing.easeOut,
      useNativeDriver: true,
    });
  },

  /**
   * Animation orchestrée (séquentielle ou parallèle)
   */
  orchestrate: {
    parallel: (animations: Animated.CompositeAnimation[]) =>
      Animated.parallel(animations),
    
    sequence: (animations: Animated.CompositeAnimation[]) =>
      Animated.sequence(animations),
    
    stagger: (delay: number, animations: Animated.CompositeAnimation[]) =>
      Animated.stagger(delay, animations),
  },
};

/**
 * 🏷️ TYPE BADGE - Version ultra-sobre et professionnelle
 */
interface TypeBadgeProps {
  type: string;
}

const TypeBadge = memo(({ type }: TypeBadgeProps) => {
  // Animation refs
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  // Configuration du badge selon le type
  const badgeConfig = useMemo(() => {
    const typeKey = type.toLowerCase();
    
    const configs: Record<string, {
      color: string;
      backgroundColor: string;
      borderColor: string;
      icon: string;
    }> = {
      urgent: {
        color: DESIGN_SYSTEM.colors.semantic.error.main,
        backgroundColor: DESIGN_SYSTEM.colors.semantic.error.light,
        borderColor: DESIGN_SYSTEM.colors.semantic.error.main,
        icon: "alert-circle",
      },
      maintenance: {
        color: DESIGN_SYSTEM.colors.semantic.warning.main,
        backgroundColor: DESIGN_SYSTEM.colors.semantic.warning.light,
        borderColor: DESIGN_SYSTEM.colors.semantic.warning.main,
        icon: "construct",
      },
      sécurité: {
        color: DESIGN_SYSTEM.colors.semantic.success.main,
        backgroundColor: DESIGN_SYSTEM.colors.semantic.success.light,
        borderColor: DESIGN_SYSTEM.colors.semantic.success.main,
        icon: "shield-checkmark",
      },
      default: {
        color: DESIGN_SYSTEM.colors.primary[600],
        backgroundColor: DESIGN_SYSTEM.colors.primary[50],
        borderColor: DESIGN_SYSTEM.colors.primary[200],
        icon: "information-circle",
      },
    };

    return configs[typeKey] || configs.default;
  }, [type]);

  // Lancer l'animation d'entrée
  useEffect(() => {
    AnimationUtils.orchestrate.parallel([
      AnimationUtils.fadeIn(opacity, DESIGN_SYSTEM.animation.duration.normal),
      AnimationUtils.slide(translateY, 8, DESIGN_SYSTEM.animation.duration.normal),
      AnimationUtils.scale(scale, 0.98, 1, DESIGN_SYSTEM.animation.duration.normal),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.typeBadgeContainer,
        {
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <View
        style={[
          styles.typeBadge,
          {
            backgroundColor: badgeConfig.backgroundColor,
            borderColor: badgeConfig.borderColor,
          },
        ]}
      >
        {/* Icône avec fond coloré subtil */}
        <View
          style={[
            styles.typeIconContainer,
            { backgroundColor: badgeConfig.color },
          ]}
        >
          <Image
            source={getTypeIcon(type)}
            style={styles.typeIcon}
            tintColor={DESIGN_SYSTEM.colors.neutral[0]}
          />
        </View>

        {/* Texte avec hiérarchie claire */}
        <View style={styles.typeBadgeContent}>
          <Text style={styles.typeBadgeLabel}>Type de signalement</Text>
          <Text style={[styles.typeBadgeValue, { color: badgeConfig.color }]}>
            {type}
          </Text>
        </View>

        {/* Indicateur de statut (optionnel) */}
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: badgeConfig.color },
          ]}
        />
      </View>
    </Animated.View>
  );
});

/**
 * 📊 METADATA ITEM - Élément de métadonnée minimaliste
 */
interface MetadataItemProps {
  icon: string;
  label: string;
  value: string;
  delay?: number;
}

const MetadataItem = memo(
  ({ icon, label, value, delay = 0 }: MetadataItemProps) => {
    // Animation refs
    const opacity = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(12)).current;

    // Lancer l'animation
    useEffect(() => {
      AnimationUtils.orchestrate.parallel([
        AnimationUtils.fadeIn(opacity, DESIGN_SYSTEM.animation.duration.fast, delay),
        AnimationUtils.slide(translateX, 12, DESIGN_SYSTEM.animation.duration.fast, delay),
      ]).start();
    }, [delay]);

    return (
      <Animated.View
        style={[
          styles.metadataItem,
          {
            opacity,
            transform: [{ translateX }],
          },
        ]}
      >
        {/* Icône dans un conteneur subtil */}
        <View style={styles.metadataIconContainer}>
          <Icon
            name={icon}
            size={16}
            color={DESIGN_SYSTEM.colors.primary[500]}
          />
        </View>

        {/* Label et valeur */}
        <View style={styles.metadataContent}>
          <Text style={styles.metadataLabel}>{label}</Text>
          <Text style={styles.metadataValue}>{value}</Text>
        </View>
      </Animated.View>
    );
  }
);

/**
 * 📝 DESCRIPTION SECTION - Section description épurée
 */
interface DescriptionSectionProps {
  description: string;
}

const DescriptionSection = memo(({ description }: DescriptionSectionProps) => {
  // Animation refs
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    AnimationUtils.orchestrate.parallel([
      AnimationUtils.fadeIn(opacity, DESIGN_SYSTEM.animation.duration.normal, 50),
      AnimationUtils.slide(translateY, 12, DESIGN_SYSTEM.animation.duration.normal, 50),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.descriptionSection,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Header minimaliste */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconContainer}>
          <Icon
            name="document-text-outline"
            size={14}
            color={DESIGN_SYSTEM.colors.neutral[600]}
          />
        </View>
        <Text style={styles.sectionTitle}>Description</Text>
      </View>

      {/* Description */}
      <Text style={styles.descriptionText}>{description}</Text>
    </Animated.View>
  );
});

/**
 * 📍 METADATA SECTION - Section métadonnées groupées
 */
interface MetadataSectionProps {
  city: string;
  createdAt: string;
  gpsDistance?: number;
}

const MetadataSection = memo(
  ({ city, createdAt, gpsDistance }: MetadataSectionProps) => {
    return (
      <View style={styles.metadataSection}>
        {/* Titre de section */}
        <Text style={styles.metadataSectionTitle}>Informations</Text>

        {/* Items avec animations séquentielles */}
        <View style={styles.metadataList}>
          <MetadataItem
            icon="location-outline"
            label="Localisation"
            value={formatCity(city)}
            delay={100}
          />

          <MetadataItem
            icon="calendar-outline"
            label="Date"
            value={formatDate(createdAt)}
            delay={150}
          />

          {gpsDistance != null && (
            <MetadataItem
              icon="navigate-outline"
              label="Distance"
              value={`${gpsDistance.toFixed(1)} km`}
              delay={200}
            />
          )}
        </View>
      </View>
    );
  }
);

/**
 * 🎯 COMPOSANT PRINCIPAL - ReportMetadata
 */
interface ReportMetadataProps {
  report: Report;
}

const ReportMetadata: React.FC<ReportMetadataProps> = ({ report }) => {
  return (
    <View style={styles.container}>
      {/* Badge de type */}
      <TypeBadge type={report.type} />

      {/* Carte principale */}
      <View style={styles.card}>
        {/* Section description */}
        <DescriptionSection description={report.description} />

        {/* Divider ultra-fin */}
        <View style={styles.divider} />

        {/* Section métadonnées */}
        <MetadataSection
          city={report.city}
          createdAt={report.createdAt}
          gpsDistance={report.gpsDistance}
        />
      </View>
    </View>
  );
};

/**
 * 🎨 STYLES - Enterprise-grade stylesheet
 */
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
  },

  // ===== TYPE BADGE =====
  typeBadgeContainer: {
    marginBottom: DESIGN_SYSTEM.spacing[5],
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DESIGN_SYSTEM.spacing[4],
    paddingVertical: DESIGN_SYSTEM.spacing[3],
    borderRadius: DESIGN_SYSTEM.radius.lg,
    borderWidth: 1,
    ...DESIGN_SYSTEM.shadows.soft,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: DESIGN_SYSTEM.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN_SYSTEM.spacing[3],
  },
  typeIcon: {
    width: 18,
    height: 18,
  },
  typeBadgeContent: {
    flex: 1,
  },
  typeBadgeLabel: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    color: DESIGN_SYSTEM.colors.neutral[500],
    textTransform: "uppercase",
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.wider,
    marginBottom: 2,
  },
  typeBadgeValue: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.md,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.tight,
    textTransform: "capitalize",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: DESIGN_SYSTEM.radius.full,
    marginLeft: DESIGN_SYSTEM.spacing[2],
  },

  // ===== CARD =====
  card: {
    backgroundColor: DESIGN_SYSTEM.colors.neutral[0],
    borderRadius: DESIGN_SYSTEM.radius.xl,
    padding: DESIGN_SYSTEM.spacing[5],
    borderWidth: 1,
    borderColor: DESIGN_SYSTEM.colors.neutral[200],
    ...DESIGN_SYSTEM.shadows.medium,
    marginBottom: 15,

  },

  // ===== DESCRIPTION SECTION =====
  descriptionSection: {
    marginBottom: DESIGN_SYSTEM.spacing[4],
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: DESIGN_SYSTEM.spacing[3],
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: DESIGN_SYSTEM.radius.sm,
    backgroundColor: DESIGN_SYSTEM.colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN_SYSTEM.spacing[2],
  },
  sectionTitle: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: DESIGN_SYSTEM.colors.neutral[700],
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.wide,
    textTransform: "uppercase",
  },
  descriptionText: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.base,
    lineHeight: DESIGN_SYSTEM.typography.fontSize.base * DESIGN_SYSTEM.typography.lineHeight.relaxed,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.regular,
    color: DESIGN_SYSTEM.colors.neutral[700],
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.normal,
  },

  // ===== DIVIDER =====
  divider: {
    height: 1,
    backgroundColor: DESIGN_SYSTEM.colors.neutral[200],
    marginVertical: DESIGN_SYSTEM.spacing[4],
  },

  // ===== METADATA SECTION =====
  metadataSection: {
    // Pas de styles spécifiques nécessaires
  },
  metadataSectionTitle: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.sm,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: DESIGN_SYSTEM.colors.neutral[700],
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.wide,
    textTransform: "uppercase",
    marginBottom: DESIGN_SYSTEM.spacing[3],
  },
  metadataList: {
    gap: DESIGN_SYSTEM.spacing[3],
    
  },

  // ===== METADATA ITEM =====
  metadataItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  metadataIconContainer: {
    width: 32,
    height: 32,
    borderRadius: DESIGN_SYSTEM.radius.base,
    backgroundColor: DESIGN_SYSTEM.colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: DESIGN_SYSTEM.spacing[3],
  },
  metadataContent: {
    flex: 1,
    paddingTop: 2,
  },
  metadataLabel: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.xs,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    color: DESIGN_SYSTEM.colors.neutral[500],
    marginBottom: 2,
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.wide,
  },
  metadataValue: {
    fontSize: DESIGN_SYSTEM.typography.fontSize.base,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    color: DESIGN_SYSTEM.colors.neutral[900],
    letterSpacing: DESIGN_SYSTEM.typography.letterSpacing.normal,
  },
});

export default memo(ReportMetadata);