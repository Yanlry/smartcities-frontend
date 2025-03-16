// src/components/home/modals/BadgeModal.tsx

import React, { memo, useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ListRenderItemInfo,
  TouchableWithoutFeedback
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBadge } from '../../../hooks/ui/useBadge';

const { height, width } = Dimensions.get('window');

/**
 * Interface pour les propriétés du modal de badge
 */
interface BadgeModalProps {
  visible: boolean;
  onClose: () => void;
  userVotes?: number;
}

/**
 * Interface pour les éléments de la liste des niveaux
 */
interface TierItem {
  name: string;
  description: string;
  votes: number;
}

/**
 * Composant pour le modal d'information
 */
interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const InfoModal = memo(({ visible, onClose }: InfoModalProps) => {
  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.spring(translateY, {
          toValue: height,
          tension: 65,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible, opacity, translateY]);
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.infoModalBackdrop}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.infoModalContainer,
                { opacity, transform: [{ translateY }] }
              ]}
            >
              <View style={styles.infoModalHeader}>
                <Text style={styles.infoModalTitle}>Comment progresser ?</Text>
                <TouchableOpacity 
                  style={styles.infoModalCloseButton} 
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.infoModalContent}>
                <View style={styles.infoItem}>
                  <Ionicons name="thumbs-up" size={24} color="#4CAF50" style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Votez sur les signalements</Text>
                    <Text style={styles.infoDescription}>
                      Chaque vote que vous donnez vous permet de progresser dans les niveaux.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="people" size={24} color="#2196F3" style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Engagez la communauté</Text>
                    <Text style={styles.infoDescription}>
                      Partagez votre niveau et encouragez d'autres citoyens à participer.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="trending-up" size={24} color="#9C27B0" style={styles.infoIcon} />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoTitle}>Suivez votre progression</Text>
                    <Text style={styles.infoDescription}>
                      Chaque niveau débloqué vous donne accès à de nouvelles fonctionnalités.
                    </Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.infoModalButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.infoModalButtonText}>J'ai compris</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

/**
 * Modal d'affichage des niveaux d'engagement utilisateur
 */
const BadgeModal: React.FC<BadgeModalProps> = memo(({ 
  visible, 
  onClose,
  userVotes = 0
}) => {
  // État pour le modal d'information
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  
  // Normaliser les votes de l'utilisateur
  const normalizedUserVotes = useMemo(() => {
    const votesAsNumber = typeof userVotes === 'string' ? parseInt(userVotes, 10) : userVotes;
    return Number.isNaN(votesAsNumber) ? 0 : Math.max(0, votesAsNumber);
  }, [userVotes]);
  
  // Hooks pour les données et le rendu
  const { getBadgeStyles, tiers, getProgressInfo } = useBadge();
  const insets = useSafeAreaInsets();
  const [itemsVisible, setItemsVisible] = useState(false);
  
  // Obtenir les informations de progression et le style du badge actuel
  const progressInfo = useMemo(() => 
    getProgressInfo(normalizedUserVotes), 
    [normalizedUserVotes, getProgressInfo]
  );
  
  const currentBadgeStyle = useMemo(() => 
    getBadgeStyles(normalizedUserVotes), 
    [normalizedUserVotes, getBadgeStyles]
  );
  
  // Animations
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const heroAnimatedValue = useRef(new Animated.Value(0)).current;
  
  // Animations pour chaque élément de la liste
  const itemAnimations = useMemo(() => 
    tiers.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.95)
    })), [tiers]
  );
  
  // Animation d'entrée/sortie du modal
  useEffect(() => {
    StatusBar.setBarStyle(visible ? 'light-content' : 'default', true);
    
    if (visible) {
      // Animation d'ouverture
      Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(heroAnimatedValue, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        })
      ]).start(() => {
        setItemsVisible(true);
      });
    } else {
      // Animation de fermeture
      setItemsVisible(false);
      
      Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 0.9,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
      
      // Réinitialiser les animations
      heroAnimatedValue.setValue(0);
      itemAnimations.forEach(anim => {
        anim.opacity.setValue(0);
        anim.translateY.setValue(30);
        anim.scale.setValue(0.95);
      });
    }
    
    // Nettoyage à la désinstallation du composant
    return () => {
      StatusBar.setBarStyle('default', true);
    };
  }, [visible, backdropOpacityAnim, modalScaleAnim, modalOpacityAnim, heroAnimatedValue, itemAnimations]);
  
  // Animation séquentielle des items de la liste
  useEffect(() => {
    if (itemsVisible) {
      itemAnimations.forEach((anim, index) => {
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(anim.opacity, {
              toValue: 1,
              friction: 10,
              tension: 50,
              useNativeDriver: true
            }),
            Animated.spring(anim.translateY, {
              toValue: 0,
              friction: 6,
              tension: 40,
              useNativeDriver: true
            }),
            Animated.spring(anim.scale, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true
            })
          ]).start();
        }, index * 80);
      });
    }
  }, [itemsVisible, itemAnimations]);

  // Interpolations pour les animations
  const heroTranslateY = heroAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0]
  });
  
  const heroOpacity = heroAnimatedValue.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0.8, 1]
  });

  /**
   * Formate les grands nombres pour une meilleure lisibilité
   */
  const formatVotes = useCallback((votes: number): string => {
    if (votes >= 1000) {
      return `${(votes / 1000).toFixed(1)}K`;
    }
    return votes.toString();
  }, []);

  /**
   * Rendu des étoiles pour un badge
   */
  const renderStars = useCallback((badgeStyle) => {
    if (!badgeStyle || typeof badgeStyle.stars !== 'number') return null;
    
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: badgeStyle.stars }).map((_, i) => (
          <Ionicons
            key={i}
            name="star"
            size={14}
            color={badgeStyle.starsColor}
            style={{ marginLeft: i > 0 ? 2 : 0 }}
          />
        ))}
        {badgeStyle.stars === 0 && (
          <Ionicons 
            name="school-outline" 
            size={14}
            color={badgeStyle.starsColor} 
          />
        )}
      </View>
    );
  }, []);

  /**
   * Vérifie si un niveau correspond au niveau actuel de l'utilisateur
   */
  const isCurrentTier = useCallback((tierVotes: number): boolean => {
    // Trier les tiers par nombre de votes (du plus petit au plus grand)
    const sortedTiers = [...tiers].sort((a, b) => a.votes - b.votes);
    
    // Trouver le tier actuel pour ces votes
    for (let i = 0; i < sortedTiers.length; i++) {
      const currentTier = sortedTiers[i];
      const nextTier = sortedTiers[i + 1];
      
      // Si c'est le dernier tier (niveau maximum)
      if (!nextTier) {
        const isMax = normalizedUserVotes >= currentTier.votes;
        if (isMax && currentTier.votes === tierVotes) {
          return true;
        }
      } 
      // Autres niveaux
      else {
        const isInRange = normalizedUserVotes >= currentTier.votes && normalizedUserVotes < nextTier.votes;
        if (isInRange && currentTier.votes === tierVotes) {
          return true;
        }
      }
    }
    
    return false;
  }, [normalizedUserVotes, tiers]);

  /**
   * Rendu d'un élément de niveau
   */
  const renderTierItem = useCallback(({ item, index }: ListRenderItemInfo<TierItem>) => {
    // Obtenir le style complet pour ce niveau
    const badgeStyle = getBadgeStyles(item.votes);
    
    // Vérifier si c'est le niveau actuel
    const currentLevel = isCurrentTier(item.votes);
    
    // Vérifier si le niveau est verrouillé 
    const isLocked = item.votes > normalizedUserVotes;
    
    return (
      <Animated.View style={[
        styles.tierCard,
        {
          opacity: itemAnimations[index].opacity,
          transform: [
            { translateY: itemAnimations[index].translateY },
            { scale: itemAnimations[index].scale }
          ]
        }
      ]}>
        <LinearGradient
          colors={currentLevel ? 
            [badgeStyle.backgroundColor + '20', badgeStyle.backgroundColor + '40'] : 
            isLocked ? ['#F8F8F8', '#F2F2F2'] : ['#FFFFFF', '#F9F9F9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.cardGradient,
            currentLevel && [
              styles.currentLevelCard,
              { borderColor: badgeStyle.borderColor + '40' }
            ]
          ]}
        >
          
          {isLocked && (
            <View style={styles.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
              <Text style={styles.lockedBadgeText}>VERROUILLÉ</Text>
            </View>
          )}
          
          {/* Niveau et statut */}
          <View style={styles.tierHeader}>
            <View style={[
              styles.badgeCircle, 
              { 
                borderColor: isLocked ? '#BBBBBB' : badgeStyle.borderColor,
                backgroundColor: currentLevel 
                  ? badgeStyle.backgroundColor + '20' 
                  : (isLocked ? '#F5F5F5' : 'white')
              }
            ]}>
              {badgeStyle.icon || (
                <Ionicons 
                  name="trophy" 
                  size={26}
                  color={isLocked ? '#BBBBBB' : badgeStyle.starsColor} 
                />
              )}
            </View>
            
            <View style={styles.tierTitleContainer}>
              <Text style={[
                styles.tierTitle,
                isLocked ? styles.lockedText : (currentLevel && { color: badgeStyle.borderColor })
              ]}>
                {badgeStyle.title}
              </Text>
              
              <View style={styles.badgeDetails}>
                <View style={styles.votesContainer}>
                  <Ionicons 
                    name="thumbs-up" 
                    size={14} 
                    color={isLocked ? '#BBBBBB' : '#757575'} 
                  />
                  <Text style={[
                    styles.tierVotes,
                    isLocked && styles.lockedText
                  ]}>
                    {formatVotes(item.votes)} votes
                  </Text>
                </View>
                
                {renderStars(badgeStyle)}
              </View>
            </View>
          </View>
          
          {/* Description du badge */}
          <Text style={[
            styles.tierDescription,
            isLocked ? styles.lockedText : (currentLevel && { color: '#333' })
          ]}>
            {item.description}
          </Text>
          
          {/* Barre de progression - uniquement pour le niveau actuel et si ce n'est pas le niveau maximum */}
          {currentLevel && !progressInfo.isMaxLevel && (
            <View>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressInfo.progress}%`,
                      backgroundColor: badgeStyle.borderColor 
                    }
                  ]} 
                />
              </View>
              
              <View style={styles.progressLabels}>
                <Text style={styles.nextLevelText}>
                  Niveau suivant : {normalizedUserVotes}/{progressInfo.votesNeeded + normalizedUserVotes} votes
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    );
  }, [
    normalizedUserVotes, 
    isCurrentTier, 
    itemAnimations, 
    progressInfo, 
    formatVotes, 
    renderStars, 
    getBadgeStyles
  ]);
  
  // Optimisations pour la FlatList
  const keyExtractor = useCallback((item: TierItem) => item.name, []);
  const ItemSeparator = memo(() => <View style={styles.separator} />);

  // Calculer le numéro de niveau en fonction de sa position dans le tableau
  const getLevelNumber = useCallback(() => {
    const tierIndex = tiers.findIndex(tier => tier.name === progressInfo.currentTier);
    return tierIndex === -1 ? 1 : tiers.length - tierIndex;
  }, [tiers, progressInfo]);

  // Ouvrir le modal d'information
  const toggleInfoModal = useCallback(() => {
    setInfoModalVisible(prev => !prev);
  }, []);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      {/* Backdrop avec flou */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacityAnim }
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        )}
      </Animated.View>
      
      {/* Contenu du modal */}
      <Animated.View 
        style={[
          styles.modalContainer,
          { 
            opacity: modalOpacityAnim,
            transform: [{ scale: modalScaleAnim }]
          }
        ]}
      >
        <View style={[
          styles.modalContent,
          { 
            paddingTop: insets.top > 0 ? insets.top : 20,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          }
        ]}>
          {/* Barre de fermeture du modal */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          
          {/* En-tête du modal */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={24} color="#333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Niveaux d'engagement</Text>
            
            <TouchableOpacity 
              style={styles.infoButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.7}
              onPress={toggleInfoModal}
            >
              <Ionicons name="information-circle-outline" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* Section héro animée */}
          <Animated.View 
            style={[
              styles.heroSection,
              {
                transform: [{ translateY: heroTranslateY }],
                opacity: heroOpacity
              }
            ]}
          >
            <LinearGradient
              colors={[currentBadgeStyle.backgroundColor, currentBadgeStyle.backgroundColor + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroIconContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.heroIconBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {currentBadgeStyle.icon || (
                      <Ionicons name="trophy" size={44} color="white" />
                    )}
                  </LinearGradient>
                </View>
                
                <View style={styles.heroTextContainer}>
                  <Text style={styles.heroTitle}>
                    Niveau {getLevelNumber()}: {currentBadgeStyle.title}
                  </Text>
                  <Text style={styles.heroDescription}>
                    {normalizedUserVotes > 0 ? 
                      `Vous avez ${normalizedUserVotes} votes` + 
                      (!progressInfo.isMaxLevel ? 
                        ` (${progressInfo.progress}% vers ${progressInfo.nextTier})` : 
                        ' (niveau maximum atteint)'
                      ) : 
                      'Progressez dans les niveaux en participant activement'
                    }
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
          
          {/* Liste des badges */}
          <FlatList
            data={tiers}
            keyExtractor={keyExtractor}
            renderItem={renderTierItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ItemSeparator}
            initialNumToRender={4}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        </View>
      </Animated.View>
      
      {/* Modal d'information */}
      <InfoModal 
        visible={infoModalVisible}
        onClose={toggleInfoModal}
      />
    </Modal>
  );
});

// Styles optimisés et modernisés
const styles = StyleSheet.create({
  // Structure principale
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: height * 0.92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 6, 
    elevation: 16,
  },
  
  // Poignée de glissement
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  
  // En-tête du modal
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  // Section héro
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  heroGradient: {
    padding: 20,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconContainer: {
    marginRight: 18,
  },
  heroIconBackground: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
  },
  
  // Liste des niveaux
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tierCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 20,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  currentLevelCard: {
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  
  // Badges et indicateurs
  currentBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  lockedBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 1,
  },
  lockedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  
  // En-tête des niveaux
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  tierTitleContainer: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333333',
  },
  
  // Détails des badges
  badgeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierVotes: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
  },
  tierDescription: {
    fontSize: 15,
    color: '#505050',
    marginBottom: 16,
    lineHeight: 22,
  },

  progressBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextLevelText: {
    fontSize: 13,
    color: '#505050',
    fontWeight: '500',
  },
  
  // Divers
  separator: {
    height: 16,
  },
  lockedText: {
    color: '#BBBBBB',
  },
  
  // Styles pour le modal d'information
  infoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  infoModalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoModalContent: {
    marginVertical: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoModalButton: {
    backgroundColor: '#062C41',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  infoModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BadgeModal;