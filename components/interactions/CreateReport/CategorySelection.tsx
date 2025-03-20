// components/interactions/CreateReport/CategorySelection.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager,
  ViewStyle,
  TextStyle,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCategory } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  getTypeVisuals, 
  typeColors, 
  typeBackgroundColors, 
  typeDarkColors,
  getContrastTextColor,
  ReportType 
} from '../../../utils/reportHelpers';

// Activer LayoutAnimation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CategorySelectionProps {
  categories: ReportCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  onBack: () => void;
}

/**
 * Composant amélioré de sélection de catégorie avec tooltip d'information
 */
const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  // État pour suivre quelle catégorie a ses détails affichés
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  // État pour contrôler l'affichage de la tooltip d'information
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  // Animation pour la tooltip
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  const tooltipTranslateY = useRef(new Animated.Value(-20)).current;
  
  /**
   * Gère l'affichage/masquage de la tooltip d'information
   */
  const toggleInfoTooltip = useCallback(() => {
    // Utilise LayoutAnimation pour une transition fluide du reste du contenu
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Configure l'animation de la tooltip
    if (!showInfoTooltip) {
      setShowInfoTooltip(true);
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(tooltipOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tooltipTranslateY, {
          toValue: -20,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowInfoTooltip(false);
      });
    }
  }, [showInfoTooltip, tooltipOpacity, tooltipTranslateY]);
  
  /**
   * Gère l'expansion/réduction des détails de catégorie
   */
  const toggleCategoryDetails = useCallback((categoryValue: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(prev => prev === categoryValue ? null : categoryValue);
  }, []);

  /**
   * Gère la sélection d'une catégorie
   */
  const handleCategorySelect = useCallback((categoryValue: string) => {
    onCategorySelect(categoryValue);
    
    // Si la catégorie n'est pas déjà développée, on l'ouvre automatiquement
    if (expandedCategory !== categoryValue) {
      toggleCategoryDetails(categoryValue);
    }
    
    // Masque la tooltip si elle est visible
    if (showInfoTooltip) {
      toggleInfoTooltip();
    }
  }, [onCategorySelect, expandedCategory, toggleCategoryDetails, showInfoTooltip, toggleInfoTooltip]);

  /**
   * Obtient les styles dynamiques pour une catégorie spécifique
   */
  const getCategoryStyles = useCallback((category: string, isSelected: boolean): {
    cardStyle: ViewStyle,
    titleStyle: TextStyle,
    iconContainerStyle: ViewStyle,
    iconColor: string,
    detailsTextStyle: TextStyle,
    chevronColor: string,
    borderTopColor: string
  } => {
    if (isSelected) {
      // Utiliser les couleurs spécifiques à cette catégorie
      const categoryColor = typeColors[category as ReportType] || '#2196F3';
      const darkCategoryColor = typeDarkColors[category as ReportType] || '#1976D2';
      const textColor = getContrastTextColor(categoryColor);
      
      return {
        cardStyle: {
          backgroundColor: categoryColor,
          borderColor: darkCategoryColor,
        },
        titleStyle: {
          color: textColor,
        },
        iconContainerStyle: {
          backgroundColor: `${darkCategoryColor}40`, // 25% d'opacité
        },
        iconColor: textColor,
        detailsTextStyle: {
          color: textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        },
        chevronColor: textColor,
        borderTopColor: `${darkCategoryColor}60` // 38% d'opacité
      };
    }
    
    // Styles par défaut pour les catégories non sélectionnées
    return {
      cardStyle: {
        backgroundColor: '#FFFFFF',
        borderColor: '#E0E6ED',
      },
      titleStyle: {
        color: '#2C3E50',
      },
      iconContainerStyle: {
        backgroundColor: '#F1F8FE',
      },
      iconColor: '#2C3E50',
      detailsTextStyle: {
        color: '#5D6D7E',
      },
      chevronColor: '#95A5A6',
      borderTopColor: 'rgba(0, 0, 0, 0.06)'
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* En-tête avec bouton d'information */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Type de signalement</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={toggleInfoTooltip}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Tooltip d'information */}
      {showInfoTooltip && (
        <Animated.View 
          style={[
            styles.infoTooltip, 
            { 
              opacity: tooltipOpacity,
              transform: [{ translateY: tooltipTranslateY }],
              top: Platform.OS === 'ios' ? insets.top + 60 : 50
            }
          ]}
        >
          <Text style={styles.infoTooltipText}>
            Choisissez la catégorie qui correspond le mieux à votre signalement.
          </Text>
          <View style={styles.infoTooltipArrow} />
        </Animated.View>
      )}

      {/* Liste des catégories */}
      <ScrollView
        style={styles.categoriesScrollView}
        contentContainerStyle={[
          styles.categoriesContainer,
          // Ajoute un padding supplémentaire si la tooltip est visible
          showInfoTooltip && { paddingTop: 70 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.value;
          const isExpanded = expandedCategory === category.value;
          const { 
            cardStyle, 
            titleStyle, 
            iconContainerStyle, 
            iconColor, 
            detailsTextStyle,
            chevronColor,
            borderTopColor
          } = getCategoryStyles(category.value, isSelected);
          
          return (
            <View 
              key={category.value} 
              style={[
                styles.categoryCard,
                cardStyle
              ]}
            >
              {/* En-tête de la carte (toujours visible) */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => handleCategorySelect(category.value)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.iconContainer,
                  iconContainerStyle
                ]}>
                  <Ionicons 
                    name={category.icon} 
                    size={24} 
                    color={iconColor} 
                  />
                </View>
                
                <Text style={[
                  styles.categoryTitle,
                  titleStyle
                ]}>
                  {category.name}
                </Text>
                
                <TouchableOpacity
                  style={styles.categoryInfoButton}
                  onPress={() => toggleCategoryDetails(category.value)}
                >
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={chevronColor}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              
              {/* Section détails (visible uniquement si développée) */}
              {isExpanded && (
                <View style={[
                  styles.detailsContainer,
                  { borderTopColor: borderTopColor }
                ]}>
                  <Text style={[
                    styles.detailsText,
                    detailsTextStyle
                  ]}>
                    {formatDescription(category.description)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

/**
 * Formate le texte de description pour le rendre plus lisible
 */
const formatDescription = (description: string): string => {
  return description
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .join('\n\n');
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#062C41',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTooltip: {
    position: 'absolute',
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 14,
    zIndex: 1000,
    maxWidth: width * 0.7,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  infoTooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  infoTooltipArrow: {
    position: 'absolute',
    top: -10,
    right: 13,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.8)',
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoryCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  categoryInfoButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default React.memo(CategorySelection);