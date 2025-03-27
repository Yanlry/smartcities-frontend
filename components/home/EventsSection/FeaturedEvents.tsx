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
  FlatList,
  ViewToken,
  Platform,
} from 'react-native';
import { FeaturedEvent } from '../../../types/entities/event.types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

// Approche de centrage mathématiquement précis
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const VISIBLE_CARDS = 1.15; // Voir légèrement la carte suivante
const ITEM_WIDTH = SCREEN_WIDTH / VISIBLE_CARDS;
const SPACING = (ITEM_WIDTH - CARD_WIDTH) / 2;
const OFFSET_DISTANCE = ITEM_WIDTH;

// Types d'état de carte
type CardState = 'compressed' | 'expanded';

interface FeaturedEventsProps {
  events: FeaturedEvent[];
  loading: boolean;
  error: string | null;
  onEventPress: (id: string) => void;
}

/**
 * CardItem - Le composant de carte individuelle
 */
const CardItem: React.FC<{
  item: FeaturedEvent;
  index: number;
  activeIndex: number;
  onPress: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}> = memo(({ item, index, activeIndex, onPress, isExpanded, onToggleExpand }) => {
  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  
  // Animation d'entrée
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Animation d'expansion
  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);
  
  // Hauteur dynamique du contenu étendu
  const expandedHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });
  
  // Opacité du contenu étendu
  const expandedOpacity = expandAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });
  
  // Opacité supplémentaire pour l'overlay quand le contenu est étendu
  const overlayOpacity = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5], // Ajoute jusqu'à 50% d'opacité noire supplémentaire quand étendu
  });
  
  const isActive = index === activeIndex;
  
  // Calculer les styles basés sur l'état actif
  const cardStyle = {
    opacity: isActive ? 1 : 0.8,
    transform: [
      { scale: scaleAnim },
      { translateY: isActive ? -5 : 0 }
    ],
  };
  
  // Catégorie dynamique pour la démonstration
  const categories = ['Tendance', 'Populaire', 'Nouveau', 'À la une'];
  const icons: Array<'trending-up' | 'star' | 'fiber-new' | 'featured-play-list'> = ['trending-up', 'star', 'fiber-new', 'featured-play-list'];
  const categoryIndex = index % categories.length;
  
  return (
    <Animated.View style={[styles.cardContainer, cardStyle]}>
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      
      {/* Overlay gradient de base */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        locations={[0.4, 0.75, 1]}
        style={styles.cardOverlay}
      />
      
      {/* Overlay supplémentaire contrôlé par l'animation */}
      <Animated.View 
        style={[
          styles.cardOverlay, 
          { 
            backgroundColor: 'black',
            opacity: overlayOpacity 
          }
        ]}
      />
      
      {/* Badge de catégorie */}
      <View style={styles.categoryBadgeContainer}>
        <LinearGradient
          colors={['#7C4DFF', '#5E35B1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.categoryBadge}
        >
          <MaterialIcons
            name={icons[categoryIndex]}
            size={14}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.categoryText}>{categories[categoryIndex]}</Text>
        </LinearGradient>
      </View>
      
      {/* Contenu de la carte */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        
        {/* Contenu extensible */}
        <Animated.View
          style={[
            styles.expandedContent,
            { height: expandedHeight, opacity: expandedOpacity }
          ]}
        >
          <Text style={styles.cardDescription}>
            Découvrez cet événement exceptionnel qui vous fera vivre 
            des moments inoubliables.
          </Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <MaterialIcons name="location-on" size={16} color="white" style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>Paris, France</Text>
            </View>
            
            <View style={styles.metaItem}>
              <MaterialIcons name="access-time" size={16} color="white" style={{ marginRight: 4 }} />
              <Text style={styles.metaText}>19:00</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => onToggleExpand(item.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.expandButtonGradient}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Voir moins' : 'Voir plus'}
              </Text>
              <MaterialIcons
                name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={16}
                color="white"
                style={{ marginLeft: 4 }}
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => onPress(item.id)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#7C4DFF', '#3A0CA3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.detailsButtonGradient}
            >
              <Text style={styles.detailsButtonText}>Détails</Text>
              <MaterialIcons name="arrow-forward" size={16} color="white" style={{ marginLeft: 4 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
});

/**
 * FeaturedEvents - Implémentation de carrousel centré optimisé
 */
const FeaturedEvents: React.FC<FeaturedEventsProps> = memo(({
  events,
  loading,
  error,
  onEventPress
}) => {
  // États et références
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  
  // Gestion des états d'expansion des cartes
  const toggleCardState = useCallback((id: string) => {
    setCardStates(prev => {
      const currentState = prev[id] || 'compressed';
      return {
        ...prev,
        [id]: currentState === 'compressed' ? 'expanded' : 'compressed',
      };
    });
  }, []);
  
  // Calcul de l'index actif basé sur le défilement
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  // Mise à jour de l'index actif lors du défilement
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / OFFSET_DISTANCE);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    });
    
    return () => scrollX.removeListener(listener);
  }, [activeIndex]);
  
  // Optimisation du positionnement des éléments
  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  }), []);
  
  // Rendu des indicateurs de pagination
  const renderPagination = useCallback(() => {
    if (!events.length) return null;
    
    return (
      <View style={styles.paginationContainer}>
        {events.map((_, index) => {
          const isPrimary = index === activeIndex;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.paginationDotContainer}
              onPress={() => {
                flatListRef.current?.scrollToIndex({
                  animated: true,
                  index,
                  viewPosition: 0.5,
                });
              }}
            >
              <View
                style={[
                  styles.paginationDot,
                  isPrimary && styles.paginationDotActive,
                  { width: isPrimary ? 24 : 8 }
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [events, activeIndex]);
  
  // Centrage mathématiquement précis
  const renderItem = useCallback(({ item, index }: { item: FeaturedEvent; index: number }) => {
    return (
      <View style={styles.itemContainer}>
        <CardItem
          item={item}
          index={index}
          activeIndex={activeIndex}
          onPress={onEventPress}
          isExpanded={cardStates[item.id] === 'expanded'}
          onToggleExpand={toggleCardState}
        />
      </View>
    );
  }, [activeIndex, cardStates, onEventPress, toggleCardState]);
  
  // Rendu des états vides/erreur/chargement
  if (loading) {
    return (
      <View style={styles.centerContent}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C4DFF" />
          <Text style={styles.statusText}>Chargement des événements...</Text>
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centerContent}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={36} color="#FF4B4B" />
          <Text style={styles.errorTitle}>Connexion impossible</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </View>
    );
  }
  
  if (events.length === 0) {
    return (
      <View style={styles.centerContent}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="event-busy" size={36} color="#7C4DFF" />
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptyMessage}>Pas d'événement prévu pour le moment.</Text>
        </View>
      </View>
    );
  }
  
  // Rendu principal avec FlatList optimisé
  return (
    <View style={styles.container}>
      {renderPagination()}
      
      <FlatList
        ref={flatListRef}
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.flatlistContent}
        initialScrollIndex={0}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flatlistContent: {

  },
  itemContainer: {
    width: ITEM_WIDTH,
    padding: SPACING / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 450,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
  },
  categoryBadgeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  expandedContent: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardDescription: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
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
  metaText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  expandButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  expandButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(124, 77, 255, 0.5)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  detailsButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
  },
  paginationDotContainer: {
    padding: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(124, 77, 255, 0.2)',
  },
  paginationDotActive: {
    backgroundColor: '#7C4DFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statusText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export default FeaturedEvents;