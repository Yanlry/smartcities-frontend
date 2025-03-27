// Composant EventsSection avec design harmonisé
import React, { memo, useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Pressable,
  StyleSheet, 
  Animated, 
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FeaturedEvents from './FeaturedEvents';
import { FeaturedEvent } from '../../../types/entities/event.types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Configuration des couleurs pour le thème - Style harmonisé avec teinte violette
const THEME = {
  primary: "#7C4DFF", // Violet principal
  primaryDark: "#5E35B1", // Violet foncé
  secondary: "#B388FF", // Violet clair
  background: "#F9FAFE", // Fond très légèrement bleuté
  backgroundDark: "#ECF0F7", // Fond légèrement plus sombre
  cardBackground: "#FFFFFF", // Blanc pur pour les cartes
  text: "#2D3748", // Texte principal presque noir
  textLight: "#718096", // Texte secondaire gris
  textMuted: "#A0AEC0", // Texte tertiaire gris clair
  border: "#E2E8F0", // Bordures légères
  shadow: "rgba(13, 26, 83, 0.12)", // Ombres avec teinte bleuâtre
};

// Couleur de fond optimisées pour l'état ouvert/fermé
const EXPANDED_BACKGROUND = "rgba(250, 251, 255, 0.97)";
const COLLAPSED_BACKGROUND = "#FFFFFF";

/**
 * Interface définissant les propriétés du composant EventsSection
 */
interface EventsSectionProps {
  featuredEvents: FeaturedEvent[];
  loading: boolean;
  error: string | null;
  onEventPress: (id: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

/**
 * Composant affichant une section d'événements à venir avec design harmonisé
 */
const EventsSection: React.FC<EventsSectionProps> = memo(({ 
  featuredEvents, 
  loading, 
  error, 
  onEventPress,
  isVisible,
  toggleVisibility
}) => {
  // Animations
  const headerScaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  // Nouvel état pour gérer le chargement complet du contenu
  const [sectionContentLoaded, setSectionContentLoaded] = useState(false);

  // Déclenchement du loader lors d'un changement de visibilité
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setSectionContentLoaded(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSectionContentLoaded(false);
    }
  }, [isVisible]);

  // Animation de rotation pour la flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Animation de glissement vertical pour le contenu
  const contentSlide = contentSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0]
  });

  // Animation de rotation subtile pour l'icône
  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Animation lors du changement de visibilité
  useEffect(() => {
    // Animation fluide pour le changement de layout
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    });
    
    // Animation de rotation de la flèche
    Animated.timing(rotateAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true
    }).start();
    
    // Animation de glissement du contenu
    Animated.timing(contentSlideAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
    
    // Animation de l'icône au changement d'état
    if (isVisible) {
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true
      }).start(() => {
        iconRotateAnim.setValue(0); // Reset pour la prochaine animation
      });
    }
  }, [isVisible, rotateAnim, contentSlideAnim, iconRotateAnim]);

  // Animation de pulsation en continu pour le badge
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    
    if (featuredEvents.length > 0) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin)
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin)
          })
        ])
      );
      
      pulseAnimation.start();
    }
    
    // Nettoyage de l'animation lors du démontage du composant
    return () => {
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [featuredEvents.length, badgePulse]);

  // Animation de pression
  const handleHeaderPressIn = () => {
    Animated.spring(headerScaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true
    }).start();
  };

  const handleHeaderPressOut = () => {
    Animated.spring(headerScaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Conteneur principal avec position relative pour le z-index */}
      <View style={{ position: "relative", zIndex: 1 }}>
        {/* En-tête de section avec design harmonisé */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              backgroundColor: isVisible ? EXPANDED_BACKGROUND : COLLAPSED_BACKGROUND,
              borderBottomLeftRadius: isVisible ? 0 : 20,
              borderBottomRightRadius: isVisible ? 0 : 20,
              transform: [{ scale: headerScaleAnim }],
              borderBottomWidth: isVisible ? 1 : 0,
              borderBottomColor: isVisible ? THEME.border : "transparent",
              elevation: isVisible ? 5 : 2,
            },
          ]}
        >
          <Pressable
            onPress={toggleVisibility}
            onPressIn={handleHeaderPressIn}
            onPressOut={handleHeaderPressOut}
            style={styles.header}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: true }}
          >
            <View style={styles.headerContent}>
              {/* Icône et titre */}
              <View style={styles.titleContainer}>
                <LinearGradient
                  colors={[THEME.primary, THEME.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconContainer}
                >
                  <Animated.View 
                    style={{
                      transform: [
                        { rotate: isVisible ? iconRotation : '0deg' }
                      ]
                    }}
                  >
                    <MaterialIcons
                      name="event"
                      size={24}
                      color="#FFFFFF"
                    />
                  </Animated.View>
                </LinearGradient>
                <View>
                  <Text style={styles.title}>Événements</Text>
                  <Text style={styles.subtitle}>
                    Activités et rencontres à venir
                  </Text>
                </View>
              </View>

              {/* Badge de nombre d'événements et flèche */}
              <View style={styles.headerControls}>
                {featuredEvents.length >= 0 && (
                  <Animated.View
                    style={[
                      styles.countBadge,
                      { transform: [{ scale: badgePulse }] },
                    ]}
                  >
                    <LinearGradient
                      colors={[THEME.secondary, THEME.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.countBadgeGradient}
                    >
                      <Text style={styles.countText}>{featuredEvents.length}</Text>
                    </LinearGradient>
                  </Animated.View>
                )}

                <Animated.View
                  style={[
                    styles.arrowContainer,
                    {
                      transform: [
                        { rotate: arrowRotation },
                        { scale: isVisible ? 1.1 : 1 }
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={isVisible ? 
                      [THEME.primary, THEME.primaryDark] : 
                      ['#A0AEC0', '#718096']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.arrowIndicator}
                  >
                    <Text style={styles.arrowIcon}>⌄</Text>
                  </LinearGradient>
                </Animated.View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        {/* Contenu de la section */}
        {isVisible && (
          sectionContentLoaded ? (
            <View style={styles.sectionContentContainer}>
              <LinearGradient
                colors={[EXPANDED_BACKGROUND, "#FFFFFF"]}
                style={styles.sectionContent}
              >
                <Animated.View
                  style={[
                    styles.contentInner,
                    {
                      opacity: contentSlideAnim,
                      transform: [{ translateY: contentSlide }],
                    },
                  ]}
                >
                  <FeaturedEvents
                    events={featuredEvents}
                    loading={loading}
                    error={error}
                    onEventPress={onEventPress}
                  />
                </Animated.View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.loaderContainer}>
              {/* Loader pendant le chargement */}
              <ActivityIndicator size="large" color={THEME.primary} />
            </View>
          )
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 10,
  },
  // Styles du header inspirés des designs modernes
  headerContainer: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: THEME.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    borderRadius: 20,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textLight,
    letterSpacing: -0.2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Badge de comptage avec animation de pulsation et dégradé
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: THEME.secondary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  countBadgeGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  arrowIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: -10,

  },
  // Styles du contenu
  sectionContentContainer: {
    overflow: "hidden",
    marginTop: -1, // Chevauchement léger pour éliminer toute ligne visible
    borderTopWidth: 0,
    zIndex: 0,
  },
  sectionContent: {
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  contentInner: {
    paddingVertical: 10,
  },
  loaderContainer: {
    padding: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EventsSection;