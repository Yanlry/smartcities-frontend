// Chemin : src/components/RankingSection/RankingSection.tsx

import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  FlatList,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { SmarterUser } from '../ProfileSection/user.types';
import SmarterItem from './SmarterItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Configuration pour Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

/**
 * Interface pour les propriétés du composant RankingSection
 */
interface RankingSectionProps {
  topUsers: SmarterUser[];
  onUserPress: (id: string) => void;
  onSeeAllPress: () => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 320;
const ITEM_SPACING = 16;

/**
 * RankingSection - Composant de classement avec interface spatiale
 * Implémente un carousel horizontal avancé avec effets de perspective et animations fluides
 */
const RankingSection: React.FC<RankingSectionProps> = memo(({
  topUsers,
  onUserPress,
  onSeeAllPress,
  isVisible,
  toggleVisibility
}) => {
  // Hooks et états
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const panelHeight = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  
  // Données formattées pour le carousel
  const carouselData = topUsers.length > 0 
    ? [...topUsers, { id: 'see-all', isSeeAllCard: true }] 
    : [];
  
  // Animation de rotation pour l'icône de flèche
  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Animation de hauteur du carousel
  const containerHeight = panelHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 170]  // Réduit la hauteur maximale de 190 à 170
  });
  
  // Animation de l'opacité du contenu
  const contentOpacity = panelHeight.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1]
  });
  
  // Gère le changement d'état de visibilité
  useEffect(() => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    
    Animated.parallel([
      Animated.timing(panelHeight, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [isVisible]);
  
  // Calcul des animations pour chaque élément du carousel
  const getItemAnimationStyle = useCallback((index: number) => {
    const inputRange = [
      (index - 1) * (ITEM_WIDTH + ITEM_SPACING),
      index * (ITEM_WIDTH + ITEM_SPACING),
      (index + 1) * (ITEM_WIDTH + ITEM_SPACING)
    ];
    
    // Animation de scale
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: 'clamp',
    });
    
    // Animation d'opacité
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });
    
    // Animation de translation vertical pour effet 3D
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [10, 0, 10],
      extrapolate: 'clamp',
    });
    
    return {
      opacity,
      transform: [
        { scale },
        { translateY }
      ],
    };
  }, [scrollX]);
  
  // Gestionnaire pour le scroll
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );
  
  // Gestionnaire pour détecter l'item visible
  const handleMomentumScrollEnd = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (ITEM_WIDTH + ITEM_SPACING));
    setActiveIndex(index);
  }, []);
  
  // Rendu de chaque élément
  const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
    if (item.isSeeAllCard) {
      return (
        <Animated.View style={[styles.seeAllCardContainer, getItemAnimationStyle(index)]}>
          <Pressable
            onPress={onSeeAllPress}
            style={({ pressed }) => [
              styles.seeAllCard,
              pressed && { opacity: 0.9 }
            ]}
          >
            <Text style={styles.seeAllIcon}>🔍</Text>
            <Text style={styles.seeAllText}>Voir le classement complet</Text>
          </Pressable>
        </Animated.View>
      );
    }
    
    return (
      <Animated.View style={getItemAnimationStyle(index)}>
        <SmarterItem
          user={item}
          index={index}
          onPress={onUserPress}
          isActive={index === activeIndex}
        />
      </Animated.View>
    );
  }, [activeIndex, getItemAnimationStyle, onSeeAllPress, onUserPress]);
  
  // Pagination indicateurs
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => (
          <Pressable 
            key={index}
            onPress={() => {
              flatListRef.current?.scrollToIndex({
                index,
                animated: true,
              });
              setActiveIndex(index);
            }}
          >
            <Animated.View 
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
                {
                  opacity: index === activeIndex ? 1 : 0.5,
                  transform: [
                    { scale: index === activeIndex ? 1.2 : 1 }
                  ]
                }
              ]} 
            />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top * 0.1 }]}>
      {/* En-tête avec titre et contrôle */}
      <Pressable
        onPress={toggleVisibility}
        style={({ pressed }) => [
          styles.header,
          pressed && styles.headerPressed
        ]}
      >
        <View style={styles.titleContainer}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.title}>Meilleurs Contributeurs</Text>
        </View>
        
        <Animated.View style={[
          styles.arrowContainer, 
          { transform: [{ rotate: arrowRotation }] }
        ]}>
          <Text style={styles.arrowIcon}>⌄</Text>
        </Animated.View>
      </Pressable>
      
      {/* Contenu principal avec espacement réduit */}
      <Animated.View style={[
        styles.contentContainer,
        { 
          height: containerHeight,  // Ajouter cette propriété
          opacity: contentOpacity   // Ajouter cette propriété
        }
      ]}>
        {topUsers.length > 0 ? (
          <View style={styles.carouselContainer}>
          
            
            <FlatList
              ref={flatListRef}
              data={carouselData}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH + ITEM_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.listContent}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              scrollEventThrottle={16}
            />

              {/* Points de pagination placés juste en dessous de l'en-tête */}
            <View style={styles.paginationWrapper}>
              {renderPaginationDots()}
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun contributeur pour le moment
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 4, // Réduit de 8 à 4
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    paddingVertical: 14, // Réduit de 16 à 14
    paddingHorizontal: 20,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerPressed: {
    opacity: 0.95,
    backgroundColor: '#F8F8F8',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  countBadge: {
    backgroundColor: '#047BFE',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  contentContainer: {
    overflow: 'hidden',
  },
  carouselContainer: {
    flex: 1,
  },
  paginationWrapper: {
    paddingTop: 2, // Réduit de 8 à 2
    paddingBottom: 2, // Réduit de 4 à 2
    zIndex: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 16, // Réduit de 20 à 16
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#047BFE',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  listContent: {
    paddingHorizontal: (WINDOW_WIDTH - ITEM_WIDTH) / 2 - 8,
    marginTop: 12, // Réduit de 4 à 2
    paddingBottom: 8, // Réduit de 12 à 8
  },
  seeAllCardContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllCard: {
    backgroundColor: '#047BFE',
    borderRadius: 16,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  seeAllIcon: {
    fontSize: 28,
    color: 'white',
    marginBottom: 12,
  },
  seeAllText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RankingSection;