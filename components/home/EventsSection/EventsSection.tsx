// Composant EventsSection modifié avec animation de pulsation en continu
import React, { memo, useRef, useEffect } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FeaturedEvents from './FeaturedEvents';
import { FeaturedEvent } from './event.types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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
 * Composant affichant une section d'événements à venir avec animation et design moderne
 * Redesign basé sur le header du composant Classement
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

  // Animation de rotation pour la flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Animation lors du changement de visibilité
  useEffect(() => {
    // Animation fluide pour le changement de layout
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Animation de rotation de la flèche
    Animated.timing(rotateAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true
    }).start();
  }, [isVisible, rotateAnim]);

  // Animation de pulsation en continu pour le badge (séparée des autres animations)
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
    Animated.timing(headerScaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true
    }).start();
  };

  const handleHeaderPressOut = () => {
    Animated.timing(headerScaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerContainer,
          { 
            transform: [{ scale: headerScaleAnim }],
            backgroundColor: isVisible ? '#F5F0FF' : '#FFFFFF' // Applique une teinte violette légère si ouvert
          }
        ]}
      >
        <Pressable
          onPress={toggleVisibility}
          onPressIn={handleHeaderPressIn}
          onPressOut={handleHeaderPressOut}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            {/* Icône et titre */}
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="event"
                  size={32}
                  color="#6366F1"
                />
              </View>
              <View>
                <Text style={styles.title}>Événements</Text>
                <Text style={styles.subtitle}>
                  Activités et rencontres à venir
                </Text>
              </View>
            </View>

            {/* Badge de nombre d'événements et flèche */}
            <View style={styles.headerControls}>
              {featuredEvents.length > 0 && (
                <Animated.View
                  style={[
                    styles.countBadge,
                    { transform: [{ scale: badgePulse }] }
                  ]}
                >
                  <Text style={styles.countText}>{featuredEvents.length}</Text>
                </Animated.View>
              )}

              <Animated.View
                style={[
                  styles.arrowContainer,
                  { transform: [{ rotate: arrowRotation }] }
                ]}
              >
                <Text style={styles.arrowIcon}>⌄</Text>
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </Animated.View>

      {isVisible && (
        <View style={styles.sectionContent}>
          <FeaturedEvents
            events={featuredEvents}
            loading={loading}
            error={error}
            onEventPress={onEventPress}
          />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  headerContainer: {
    borderRadius: 20,
    // La couleur de fond est désormais appliquée de manière conditionnelle dans le style inline
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0, 0, 0, 0.08)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
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
    borderRadius: 22,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countBadge: {
    backgroundColor: "#6366F1",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  countText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: 24,
    color: "#4F566B",
    fontWeight: "bold",
  },
  sectionContent: {
    // Styles pour le contenu
  },
});

export default EventsSection;