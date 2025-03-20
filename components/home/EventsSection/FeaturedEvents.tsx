import React, { memo, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  PanResponder,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { FeaturedEvent } from './event.types';
import { LinearGradient } from 'expo-linear-gradient';

// Configuration pour les animations LayoutAnimation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_IPHONE_X = Platform.OS === 'ios' && (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812);
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? (IS_IPHONE_X ? 44 : 20) : StatusBar.currentHeight || 0;

// Types d'état de carte personnalisés
type CardState = 'compressed' | 'expanded';

interface FeaturedEventsProps {
  events: FeaturedEvent[];
  loading: boolean;
  error: string | null;
  onEventPress: (id: string) => void;
}

/**
 * Composant Glass UI optimisé pour arrière-plan clair
 * @param props Options de personnalisation visuelles
 */
const GlassContainer = memo(({ 
  style, 
  intensity = 40, 
  tint = 'light', 
  children 
}: { 
  style?: any; 
  intensity?: number; 
  tint?: 'light' | 'dark'; 
  children: React.ReactNode;
}) => {
  // Optimisation des calculs de transparence
  const opacity = useMemo(() => Math.min(intensity / 100, 0.85), [intensity]);
  
  // Couleurs adaptées pour fond clair
  const backgroundColor = tint === 'light' 
    ? `rgba(255, 255, 255, ${opacity})` 
    : `rgba(30, 30, 30, ${opacity})`;
  
  const borderColor = tint === 'light' 
    ? 'rgba(0, 0, 0, 0.06)' 
    : 'rgba(255, 255, 255, 0.08)';
  
  // Effet d'ombre adapté pour fond clair
  const shadowProps = tint === 'light' 
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }
    : {};
  
  return (
    <View style={[
      {
        backgroundColor,
        borderColor,
        borderWidth: 0.5,
        overflow: 'hidden',
        ...shadowProps,
      },
      style,
    ]}>
      {children}
    </View>
  );
});

/**
 * Composant FeaturedEvents redesigné avec un style glassmorphique sur fond clair
 * Adapté pour être lisible et esthétique sur un arrière-plan clair
 */
const FeaturedEvents: React.FC<FeaturedEventsProps> = memo(({
  events,
  loading,
  error,
  onEventPress
}) => {
  // Animations et états
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const animatedValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation d'entrée optimisée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start();
  }, []);

  // Gestion du changement d'index actif
  const handleScrollEnd = useCallback((event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (SCREEN_WIDTH * 0.85));
    setActiveIndex(newIndex);
  }, []);

  // Toggle optimisé pour les états de carte
  const toggleCardState = useCallback((id: string) => {
    LayoutAnimation.configureNext({
      duration: 250,
      update: { type: 'easeInEaseOut', property: 'opacity' },
    });
    
    setCardStates(prev => {
      const currentState = prev[id] || 'compressed';
      return {
        ...prev,
        [id]: currentState === 'compressed' ? 'expanded' : 'compressed'
      };
    });
  }, []);

  // PanResponder optimisé pour des mouvements fluides
  const panResponder = useMemo(() => 
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 8;
      },
      onPanResponderMove: (_, gestureState) => {
        // Résistance progressive pour feedback haptique
        const dampingFactor = 0.7;
        const clampedDx = gestureState.dx * dampingFactor;
        
        Animated.event(
          [null, { dx: animatedValue }],
          { useNativeDriver: false }
        )(_, { dx: clampedDx });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 60 && activeIndex > 0) {
          // Swipe droite - précédent
          scrollViewRef.current?.scrollTo({
            x: (activeIndex - 1) * (SCREEN_WIDTH * 0.85),
            animated: true
          });
          setActiveIndex(activeIndex - 1);
        } else if (gestureState.dx < -60 && activeIndex < events.length - 1) {
          // Swipe gauche - suivant
          scrollViewRef.current?.scrollTo({
            x: (activeIndex + 1) * (SCREEN_WIDTH * 0.85),
            animated: true
          });
          setActiveIndex(activeIndex + 1);
        }
        
        // Snap-back animation
        Animated.spring(animatedValue, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: false
        }).start();
      }
    }), [activeIndex, events.length]
  );

  // Rendu de l'indicateur d'état - Chargement
  if (loading) {
    return (
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        <View style={styles.centeredContent}>
          <GlassContainer style={styles.loadingCard} intensity={70} tint="light">
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </GlassContainer>
        </View>
      </Animated.View>
    );
  }

  // Rendu de l'indicateur d'état - Erreur
  if (error) {
    return (
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        <View style={styles.centeredContent}>
          <GlassContainer style={styles.errorCard} intensity={70} tint="light">
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Connexion impossible</Text>
            <Text style={styles.errorDescription}>{error}</Text>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#4361EE', '#3A0CA3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Réessayer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassContainer>
        </View>
      </Animated.View>
    );
  }

  // Rendu de l'indicateur d'état - Aucun événement
  if (events.length === 0) {
    return (
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        <View style={styles.centeredContent}>
          <GlassContainer style={styles.emptyCard} intensity={70} tint="light">
            <Text style={styles.emptyIcon}>🗓️</Text>
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptyDescription}>
              Pas d'événement prévu pour le moment.
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#4361EE', '#3A0CA3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Explorer d'autres villes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassContainer>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={styles.container}>
      {/* Indicateurs de progression */}
      <View style={styles.progressContainer}>
        {events.map((_, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.progressTouch}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: index * (SCREEN_WIDTH * 0.85),
                animated: true
              });
              setActiveIndex(index);
            }}
          >
            <View style={styles.progressBg}>
              <View style={[
                styles.progressFill, 
                { 
                  width: index <= activeIndex ? '100%' : 0,
                  backgroundColor: index === activeIndex ? '#4361EE' : 'rgba(67, 97, 238, 0.5)'
                }
              ]} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Carrousel d'événements */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH * 0.85}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={handleScrollEnd}
        {...panResponder.panHandlers}
      >
        {events.map((item, index) => {
          const cardState = cardStates[item.id] || 'compressed';
          const isExpanded = cardState === 'expanded';
          
          return (
            <Animated.View 
              key={item.id} 
              style={[
                styles.eventCardWrapper,
                {
                  transform: [
                    { translateX: animatedValue.interpolate({
                      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                      outputRange: [50, 0, -50],
                      extrapolate: 'clamp'
                    }) }
                  ]
                }
              ]}
            >
              {/* Carte non cliquable - image juste pour affichage */}
              <View style={styles.cardTouchable}>
                {/* Image de fond */}
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                
                {/* Overlay pour meilleure lisibilité */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                  style={styles.cardGradient}
                  locations={[0, 0.6, 1]}
                />
                
                {/* Badge de catégorie */}
                <View style={styles.categoryContainer}>
                  <GlassContainer style={styles.categoryBadge} intensity={60} tint="dark">
                    <Text style={styles.categoryText}>
                      {['Tendance', 'Populaire', 'Nouveau', 'À la une'][index % 4]}
                    </Text>
                  </GlassContainer>
                </View>
                
                {/* Contenu de la carte */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>
                  
                  {/* Contenu extensible */}
                  {isExpanded && (
                    <Animated.View style={styles.expandedContent}>
                      <Text style={styles.cardDescription}>
                        Découvrez cet événement exceptionnel qui vous fera vivre 
                        des moments inoubliables.
                      </Text>
                      
                      <View style={styles.metaContainer}>
                        <View style={styles.metaItem}>
                          <Text style={styles.metaIcon}>📍</Text>
                          <Text style={styles.metaText}>Paris, France</Text>
                        </View>
                        
                        <View style={styles.metaItem}>
                          <Text style={styles.metaIcon}>🕐</Text>
                          <Text style={styles.metaText}>19:00</Text>
                        </View>
                      </View>
                    </Animated.View>
                  )}
                  
                  {/* Boutons d'action */}
                  <View style={styles.actionContainer}>
                    {/* Bouton Voir plus/Voir moins - maintenant cliquable pour toggle */}
                    <TouchableOpacity 
                      style={styles.secondaryButton}
                      onPress={() => toggleCardState(item.id)}
                    >
                      <GlassContainer style={styles.secondaryButtonInner} intensity={60} tint="dark">
                        <Text style={styles.secondaryButtonText}>
                          {isExpanded ? 'Voir moins' : 'Voir plus'}
                        </Text>
                      </GlassContainer>
                    </TouchableOpacity>
                    
                    {/* Bouton Détails - toujours "Détails" */}
                    <TouchableOpacity 
                      style={styles.primaryButton}
                      onPress={() => onEventPress(item.id)}
                    >
                      <LinearGradient
                        colors={['#4361EE', '#3A0CA3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.primaryButtonGradient}
                      >
                        <Text style={styles.primaryButtonText}>
                          Détails
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </Animated.View>
  );
});

// Styles optimisés pour l'interface avec le comportement modifié
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF',
  },
  
  // Progress indicators
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  progressTouch: {
    flex: 1,
    paddingHorizontal: 2,
  },
  progressBg: {
    height: 3,
    backgroundColor: 'rgba(67, 97, 238, 0.2)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4361EE',
    borderRadius: 1.5,
  },
  
  // Event cards
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
  },
  eventCardWrapper: {
    width: SCREEN_WIDTH * 0.85,
    marginRight: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    height: SCREEN_HEIGHT * 0.5,
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  categoryContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Card content
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  expandedContent: {
    marginBottom: 16,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  
  // Action buttons
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryButton: {
    marginRight: 10,
  },
  secondaryButtonInner: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // États de chargement, erreur, vide
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingCard: {
    width: 200,
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#1A1F36',
    marginTop: 12,
    fontSize: 14,
  },
  errorCard: {
    width: '80%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorIconText: {
    color: '#DC2626',
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorTitle: {
    color: '#1A1F36',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDescription: {
    color: 'rgba(26, 31, 54, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyCard: {
    width: '80%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#1A1F36',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    color: 'rgba(26, 31, 54, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FeaturedEvents;