// Chemin : src/components/RankingSection/SmarterItem.tsx

import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  Platform,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { SmarterUser } from '../ProfileSection/user.types';

// Configuration pour Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

/**
 * Interface pour les propriétés du composant SmarterItem
 */
interface SmarterItemProps {
  user: SmarterUser;
  index: number;
  onPress: (id: string) => void;
  isActive?: boolean;
}

/**
 * SmarterItem - Composant représentant un utilisateur dans le classement spatial
 * Implémente un design 3D avec des effets de profondeur et des animations réactives
 */
const SmarterItem: React.FC<SmarterItemProps> = memo(({
  user,
  index,
  onPress,
  isActive = false
}) => {
  // Animations
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Métriques relatives au classement
  const rank = index + 1;
  const isTopThree = rank <= 3;
  
  // Couleurs et styles selon le classement
  const accentColor = (() => {
    switch(rank) {
      case 1: return '#FFD700'; // Or
      case 2: return '#C0C0C0'; // Argent
      case 3: return '#CD7F32'; // Bronze
      default: return '#047BFE';
    }
  })();
  
  // Badge selon le classement
  const badge = isTopThree 
    ? `${["🥇", "🥈", "🥉"][rank-1]}` 
    : `${rank}`;

  // Effet d'apparition avec décalage
  useEffect(() => {
    const entryDelay = 100 + (index * 80);
    
    Animated.sequence([
      Animated.delay(entryDelay),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        })
      ])
    ]).start();
  }, []);
  
  // Effet de pulsation pour item actif
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive]);

  // Rotation 3D simulée
  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '0deg']
  });
  
  // Effet de pression
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Configure l'animation pour la prochaine phase de layout
    LayoutAnimation.configureNext({
      duration: 200,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
            { rotateY: rotateY },
            { perspective: 1000 }
          ]
        }
      ]}
    >
      <Pressable
        onPress={() => onPress(user.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          isActive && styles.activeCard
        ]}
      >
        {/* Effet de fond spatial */}
        <View style={[
          styles.cardBackground,
          {
            backgroundColor: isActive ? 
              `${accentColor}22` : // Transparence
              '#f5f5f7' 
          }
        ]} />
        
        {/* Badge de classement */}
        <View style={[
          styles.badgeContainer,
          {
            backgroundColor: isTopThree ? accentColor : '#047BFE',
            borderColor: isTopThree ? accentColor : '#047BFE',
          }
        ]}>
          <Text style={styles.badgeText}>
            {isTopThree ? badge : rank}
          </Text>
        </View>
        
        {/* Conteneur principal */}
        <View style={styles.mainContent}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={[
              styles.avatarBorder,
              { borderColor: accentColor }
            ]}>
              <Image
                source={{ uri: user.image?.uri || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
            </View>
          </View>
          
          {/* Informations utilisateur */}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
              {user.displayName || 'Anonyme'}
            </Text>
            
            {user.points !== undefined && (
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>
                  {user.points.toLocaleString()} pts
                </Text>
              </View>
            )}
            
            {user.location && (
              <Text style={styles.location} numberOfLines={1}>
                📍 {user.location}
              </Text>
            )}
          </View>
          
          {/* Indicateur visuel */}
          <View style={[
            styles.indicator,
            { backgroundColor: accentColor }
          ]} />
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 320,
    marginHorizontal: 8,
    marginVertical: 6,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeCard: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f7',
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 28, // Remplacer minWidth par width fixe
    height: 28, 
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#047BFE',
    // Supprimer paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 10,
    overflow: 'hidden', // Ajouter pour s'assurer que le contenu ne déborde pas
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20, // Réduire légèrement la taille pour s'adapter
    textAlign: 'center', // Assurer un centrage parfait
  },

  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatarBorder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    backgroundColor: '#047BFE',
  },
});

export default SmarterItem;