import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

/**
 * Interface pour les propriétés du composant TypeBadge
 */
interface TypeBadgeProps {
  type: string;
  typeLabel: string;
  typeColor: string;
}

/**
 * Composant de badge de type amélioré avec un design subtil et transparent
 * @param props - Propriétés du composant
 * @returns Composant React
 */
const TypeBadge: React.FC<TypeBadgeProps> = ({ type, typeLabel, typeColor }) => {
  /**
   * Calcule une version plus transparente de la couleur du type
   * @param color Couleur hexadécimale de base
   * @param opacity Niveau d'opacité (0-1)
   * @returns Couleur avec transparence
   */
  const getTransparentColor = (color: string, opacity: number): string => {
    // Convertir couleur hexadécimale en RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  /**
   * Mémorise les couleurs calculées pour éviter des recalculs inutiles
   */
  const colors = useMemo(() => {
    return {
      primary: typeColor,
      transparent: getTransparentColor(typeColor, 0.9),
      background: getTransparentColor(typeColor, 0.15),
      border: getTransparentColor(typeColor, 0.3),
      iconBackground: getTransparentColor(typeColor, 0.2),
      whiteBg: "rgba(255, 255, 255, 0.75)", // Fond blanc semi-transparent
    };
  }, [typeColor]);

  /**
   * Renvoie l'icône appropriée pour le type de signalement
   */
  const getIconForType = (type: string) => {
    // Mapping des types vers les noms d'icônes (simplifié pour l'exemple)
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
      { borderColor: colors.border }
    ]}>
      {/* Fond blanc pour améliorer la visibilité */}
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

// Styles pour le composant
interface Styles {
  badgeContainer: ViewStyle;
  whiteBgContainer: ViewStyle; // Nouveau conteneur pour le fond blanc
  badgeGradient: ViewStyle;
  iconContainer: ViewStyle;
  iconBackground: ViewStyle;
  badgeText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  badgeContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 3,
    borderRadius: 20,
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
  whiteBgContainer: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)", // Fond blanc très léger
  },
  badgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingLeft: 8,
    paddingRight: 14,
    borderRadius: 20,
    // Léger effet de transparence pour laisser apparaître un peu la photo
    opacity: 0.95,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: "hidden",
    marginRight: 8,
  },
  iconBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontWeight: "600",
    fontSize: 14,
    letterSpacing: 0.2,
  },
});

export default TypeBadge;