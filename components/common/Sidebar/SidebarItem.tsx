// Chemin : components/Sidebar/SidebarItem.tsx

import React, { memo, useRef, useEffect } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  Animated, 
  Easing,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SidebarItemProps } from './types';

// Thème cohérent avec le composant Sidebar
const THEME = {
  colors: {
    primary: {
      gradient: ["#062C41", "#1B5D85"],
      dark: "#1B5D85",
      main: "#1B5D85",
      light: "#1B5D85",
    },
    accent: {
      gradient: ["#00C6FB", "#005BEA"],
      main: "#1DA1F2",
    },
    neutral: {
      white: "#FFFFFF",
      light: "#D4D4D4",
      medium: "#737373",
    },
    glass: {
      light: "rgba(255, 255, 255, 0.15)",
      ultraLight: "rgba(255, 255, 255, 0.07)",
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  animation: {
    duration: {
      fastest: 150,
      fast: 250,
      normal: 300,
    },
    easing: {
      standard: Easing.bezier(0.4, 0.0, 0.2, 1),
      spring: Easing.bezier(0.175, 0.885, 0.32, 1.275),
    },
  },
};

/**
 * Interface étendue pour les propriétés du SidebarItem
 * Compatible avec la version précédente et ajoute des options visuelles
 */
interface EnhancedSidebarItemProps extends SidebarItemProps {
  isActive?: boolean;
  isSecondary?: boolean;
  badge?: number;
}

/**
 * SidebarItem - Élément de menu interactif optimisé pour réseaux sociaux
 * Animations fluides et retours visuels immédiats pour une expérience utilisateur moderne
 * 
 * @param props Propriétés étendues du composant
 */
const SidebarItem: React.FC<EnhancedSidebarItemProps> = memo(({ 
  icon, 
  label, 
  onPress,
  isActive = false,
  isSecondary = false,
  badge,
}) => {
  // Animations avec valeurs de référence
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const leftHighlightAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  
  // Mise à jour des animations selon l'état actif
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: isActive ? 1 : 0,
        duration: THEME.animation.duration.normal,
        easing: THEME.animation.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(leftHighlightAnim, {
        toValue: isActive ? 1 : 0,
        duration: THEME.animation.duration.normal,
        easing: THEME.animation.easing.standard,
        useNativeDriver: true, // Transform est supporté nativement
      })
    ]).start();
  }, [isActive, opacityAnim, leftHighlightAnim]);

  // Animations tactiles pour feedback immédiat
  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: THEME.animation.duration.fastest,
        easing: THEME.animation.easing.standard,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 5,
        duration: THEME.animation.duration.fastest,
        easing: THEME.animation.easing.standard,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: THEME.animation.duration.fast,
        easing: THEME.animation.easing.spring,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: THEME.animation.duration.fast,
        easing: THEME.animation.easing.spring,
        useNativeDriver: true,
      })
    ]).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.container}
    >
      {/* Conteneur principal avec animations de scale et position */}
      <Animated.View
        style={[
          styles.itemContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateX: translateXAnim }
            ],
          }
        ]}
      >
        {/* Background d'item actif */}
        {isActive && (
          <Animated.View 
            style={[
              styles.activeBackground,
              { opacity: opacityAnim }
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={styles.activeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        )}
        
        {/* Indicateur à gauche pour élément actif */}
        <Animated.View 
          style={[
            styles.leftIndicator,
            {
              opacity: leftHighlightAnim,
              transform: [
                { 
                  scaleY: leftHighlightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 1]
                  }) 
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={isSecondary ? 
              ['#00C6FB', '#005BEA'] : 
              ['#8E2DE2', '#4A00E0']}
            style={styles.indicatorGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>
        
        {/* Conteneur de l'icône avec fond conditionnel */}
        <View style={[
          styles.iconContainer,
          isActive && styles.activeIconContainer
        ]}>
          {icon}
        </View>
        
        {/* Label du menu */}
        <Text 
          style={[
            styles.itemLabel,
            isSecondary && styles.secondaryLabel,
            isActive && styles.activeLabel
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        
        {/* Badge de notification conditionnel */}
        {badge !== undefined && badge > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

/**
 * Styles optimisés pour une expérience utilisateur moderne
 * Design visuel adapté aux interfaces de type réseau social
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.sm,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    position: 'relative',
    overflow: 'hidden',
    height: 56,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
  },
  activeGradient: {
    width: '100%',
    height: '100%',
  },
  leftIndicator: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    overflow: 'hidden',
  },
  indicatorGradient: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  itemLabel: {
    color: THEME.colors.neutral.white,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  secondaryLabel: {
    color: THEME.colors.neutral.light,
    fontSize: 14,
  },
  activeLabel: {
    fontWeight: '600',
  },
  badgeContainer: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: THEME.spacing.sm,
  },
  badgeText: {
    color: THEME.colors.neutral.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default SidebarItem;