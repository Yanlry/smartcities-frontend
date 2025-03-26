import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// Fonctions utilitaires communes
/**
 * Calcule une version plus transparente de la couleur
 * @param color Couleur hexadécimale
 * @param opacity Niveau d'opacité (0-1)
 */
const getTransparentColor = (color: string, opacity: number): string => {
  // Si la couleur est déjà au format rgba, on retourne simplement
  if (color.startsWith('rgba')) return color;
  
  // Convertir couleur hexadécimale en RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Calcule une version plus foncée de la couleur
 * @param color Couleur hexadécimale
 * @param factor Facteur d'assombrissement (0-1)
 */
const getDarkerColor = (color: string, factor: number = 0.7): string => {
  // Si la couleur est au format rgba, extraire les composantes
  if (color.startsWith('rgba')) {
    const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (matches) {
      const r = Math.floor(parseInt(matches[1]) * factor);
      const g = Math.floor(parseInt(matches[2]) * factor);
      const b = Math.floor(parseInt(matches[3]) * factor);
      const a = matches[4];
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color;
  }
  
  // Sinon traiter comme hexadécimal
  const r = Math.floor(parseInt(color.slice(1, 3), 16) * factor);
  const g = Math.floor(parseInt(color.slice(3, 5), 16) * factor);
  const b = Math.floor(parseInt(color.slice(5, 7), 16) * factor);
  
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

//=============================================================================
// BADGE DE TYPE
//=============================================================================

interface TypeBadgeProps {
  type: string;
  typeLabel: string;
  typeColor: string;
}

/**
 * Badge indiquant le type de signalement
 */
export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, typeLabel, typeColor }) => {
  const colors = useMemo(() => {
    return {
      primary: typeColor,
      transparent: getTransparentColor(typeColor, 0.9),
      background: getTransparentColor(typeColor, 0.15),
      border: getTransparentColor(typeColor, 0.3),
      iconBackground: getTransparentColor(typeColor, 0.2),
      whiteBg: "rgba(255, 255, 255, 0.75)",
    };
  }, [typeColor]);

  /**
   * Renvoie l'icône appropriée pour le type de signalement
   */
  const getIconForType = (type: string) => {
    // Mapping des types vers les noms d'icônes
    const iconMap: Record<string, string> = {
      events: "calendar-star",
      danger: "alert-octagon",
      travaux: "hammer",
      nuisance: "volume-high",
      pollution: "factory",
      reparation: "wrench",
      default: "information-outline",
    };
    
    const normalizedType = type.toLowerCase();
    const iconName = iconMap[normalizedType] || iconMap.default;
    
    return (
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={[colors.transparent, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBackground}
        >
          <MaterialCommunityIcons
            name={iconName}
            size={20}
            color="white"
          />
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[
      styles.badgeContainer,
      styles.topLeft,
      { borderColor: colors.border }
    ]}>
      <View style={styles.whiteBgContainer}>
        <LinearGradient
          colors={[colors.whiteBg, "rgba(255, 255, 255, 0.85)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeGradient}
        >
          {getIconForType(type)}
          <Text style={[
            styles.badgeText,
            { color: typeColor }
          ]}>
            {typeLabel}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
};

//=============================================================================
// BADGE DE DISTANCE
//=============================================================================

interface DistanceBadgeProps {
  distanceText: string;
  scaleAnim?: any; // Accepte n'importe quel type d'animation (Value ou AnimatedInterpolation)
  badgeColor?: string;
  iconName?: keyof typeof MaterialIcons.glyphMap;
  position?: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
}

/**
 * Badge indiquant la distance avec le signalement
 */
export const DistanceBadge: React.FC<DistanceBadgeProps> = ({ 
  distanceText, 
  scaleAnim,
  badgeColor = "#3B82F6",
  iconName = "location-on",
  position = 'bottomRight'
}) => {
  const colors = useMemo(() => {
    return {
      primary: badgeColor,
      border: getTransparentColor(badgeColor, 0.3),
      whiteBg: "rgba(255, 255, 255, 0.75)",
      gradient1: getTransparentColor(badgeColor, 0.9),
      gradient2: getDarkerColor(getTransparentColor(badgeColor, 0.95)),
    };
  }, [badgeColor]);

  const positionStyle = useMemo(() => {
    switch(position) {
      case 'topRight': return styles.topRight;
      case 'topLeft': return styles.topLeft;
      case 'bottomLeft': return styles.bottomLeft;
      case 'bottomRight':
      default: return styles.bottomRight;
    }
  }, [position]);

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        positionStyle,
        { borderColor: colors.border },
        scaleAnim ? { transform: [{ scale: scaleAnim }] } : {}
      ]}
    >
      <View style={styles.whiteBgContainer}>
        <LinearGradient
          colors={[colors.gradient1, colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeGradient}
        >
          <MaterialIcons
            name={iconName}
            size={14}
            color="white"
            style={{marginRight: 6}}
          />
          <Text style={styles.badgeText}>{distanceText}</Text>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

//=============================================================================
// BADGE NOUVEAU
//=============================================================================

interface NewBadgeProps {
  rotateAnim?: any; // Accepte n'importe quel type d'animation (Value ou AnimatedInterpolation)
  labelText?: string;
}

/**
 * Badge indiquant qu'un signalement est récent
 */
export const NewBadge: React.FC<NewBadgeProps> = ({
  rotateAnim,
  labelText = "Nouveau"
}) => {
  const colors = useMemo(() => {
    const primaryColor = "#FF3D71";
    return {
      primary: primaryColor,
      secondary: "#FF5252",
      border: getTransparentColor(primaryColor, 0.3),
      whiteBg: "rgba(255, 255, 255, 0.75)",
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        styles.topRight,
        { borderColor: colors.border },
        rotateAnim ? { transform: [{ rotate: rotateAnim }] } : {}
      ]}
    >
      <View style={styles.whiteBgContainer}>
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.badgeGradient}
        >
          <Text style={[styles.badgeText, styles.newBadgeText]}>
            {labelText}
          </Text>
          <Ionicons
            name="time"
            size={12}
            color="white"
            style={{ marginLeft: 4 }}
          />
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

//=============================================================================
// STYLES PARTAGÉS
//=============================================================================

const styles = StyleSheet.create({
  // Styles de base pour tous les badges
  badgeContainer: {
    position: "absolute",
    zIndex: 3,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  
  // Positions communes
  topLeft: {
    top: 16,
    left: 16,
  },
  topRight: {
    top: 16,
    right: 16,
  },
  bottomLeft: {
    bottom: 16,
    left: 16,
  },
  bottomRight: {
    bottom: 16,
    right: 16,
  },
  
  // Conteneur fond blanc
  whiteBgContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
  
  // Dégradé de base
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    opacity: 0.95,
  },
  
  // Conteneur d'icône pour TypeBadge
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    marginRight: 8,
  },
  
  // Arrière-plan d'icône pour TypeBadge
  iconBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Texte de badge commun
  badgeText: {
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.2,
    color: "#FFFFFF",
  },
  
  // Style spécifique pour le texte de badge nouveau
  newBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

// Export par défaut de tous les badges pour faciliter l'import
export default {
  TypeBadge,
  DistanceBadge,
  NewBadge
};