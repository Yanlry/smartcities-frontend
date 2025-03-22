// src/components/home/MayorInfoSection/components/NewsItem.tsx
import React, { memo, useCallback, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Platform, 
  TouchableOpacity, 
  Animated, 
  LayoutAnimation,
  Pressable 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface NewsItemProps {
  /** Icône à afficher dans l'en-tête */
  icon: string;
  /** Couleur d'accentuation pour l'icône et les bordures */
  color: string;
  /** Titre de l'actualité */
  title: string;
  /** Date optionnelle de l'événement */
  date?: string;
  /** Lieu optionnel de l'événement */
  location?: string;
  /** Description détaillée de l'actualité */
  details: string;
  /** Date de publication au format timestamp (optionnelle) */
  publishedAt?: number;
  /** ID unique de l'actualité pour le tracking (optionnel) */
  id?: string;
  /** Indique si l'item est initialement développé */
  initiallyExpanded?: boolean;
}

/**
 * Composant pour afficher un élément d'actualité avec animation d'expansion
 * et mise en page moderne optimisée pour la lisibilité
 * 
 * @example
 * <NewsItem
 *   icon="warning-outline"
 *   color="#f39c12"
 *   title="Travaux de voirie"
 *   date="15 septembre 2024"
 *   location="Avenue de la Liberté"
 *   details="Des travaux de réfection de la chaussée auront lieu du 25 au 30 septembre."
 * />
 */
export const NewsItem = memo<NewsItemProps>(({
  icon,
  color,
  title,
  date,
  location,
  details,
  publishedAt,
  id,
  initiallyExpanded = false
}) => {
  // État d'expansion de l'actualité
  const [expanded, setExpanded] = useState(initiallyExpanded);
  
  // Animations
  const rotateAnim = useRef(new Animated.Value(initiallyExpanded ? 1 : 0)).current;
  const bgOpacity = useRef(new Animated.Value(initiallyExpanded ? 0.08 : 0)).current;
  
  // Extraire la date de publication formatée si disponible
  const formattedDate = publishedAt 
    ? new Date(publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      })
    : date;
    
  // Gestion du toggle d'expansion
  const toggleExpanded = useCallback(() => {
    // Animation d'expansion/contraction
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    
    // Animation de rotation de l'icône
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    
    // Animation d'opacité du fond
    Animated.timing(bgOpacity, {
      toValue: expanded ? 0 : 0.08,
      duration: 250,
      useNativeDriver: false,
    }).start();
    
    setExpanded(!expanded);
  }, [expanded, rotateAnim, bgOpacity]);
  
  // Animation de rotation interpolée
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  
  // Style dynamique pour la barre latérale colorée
  const accentBarStyle = {
    backgroundColor: color,
  };
  
  // Style dynamique pour le fond d'accentuation
  const backgroundStyle = {
    backgroundColor: color,
    opacity: bgOpacity,
  };
  
  return (
    <Pressable 
      style={styles.container} 
      onPress={toggleExpanded}
      android_ripple={{ color: `${color}20`, borderless: false }}
    >
      {/* Barre d'accentuation latérale */}
      <View style={[styles.accentBar, accentBarStyle]} />
      
      {/* Fond animé */}
      <Animated.View style={[styles.animatedBackground, backgroundStyle]} />
      
      <View style={styles.contentContainer}>
        {/* En-tête de l'actualité */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
              <Ionicons name={icon as any} size={16} color="#FFF" />
            </View>
            <Text style={styles.title} numberOfLines={expanded ? undefined : 1}>
              {title}
            </Text>
          </View>
          
          <Animated.View style={[styles.expandIcon, { transform: [{ rotate }] }]}>
            <Ionicons name="chevron-down" size={20} color="#757575" />
          </Animated.View>
        </View>
        
        {/* Contenu de l'actualité */}
        <View style={styles.bodyContainer}>
          {/* Métadonnées (date, lieu) en ligne */}
          <View style={styles.metadataContainer}>
            {formattedDate && (
              <View style={styles.metadataItem}>
                <Ionicons name="calendar-outline" size={14} color={color} />
                <Text style={styles.metadataText}>{formattedDate}</Text>
              </View>
            )}
            
            {location && (
              <View style={styles.metadataItem}>
                <Ionicons name="location-outline" size={14} color={color} />
                <Text style={styles.metadataText}>{location}</Text>
              </View>
            )}
          </View>
          
          {/* Détails (visible uniquement si développé) */}
          {expanded && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsText}>{details}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contentContainer: {
    padding: 16, 
    paddingLeft: 20,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  animatedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    lineHeight: 20,
  },
  expandIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    marginTop: 12,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 13,
    color: '#718096',
    marginLeft: 4,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A5568',
  },
});