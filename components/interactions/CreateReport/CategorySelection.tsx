// components/interactions/CreateReport/CategorySelection.tsx
import React, { useRef, useState, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCategory } from './types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
 * Version optimisée du composant de sélection de catégorie
 * Utilise un système d'accordéon pour afficher/masquer les détails des catégories
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
  }, [onCategorySelect, expandedCategory, toggleCategoryDetails]);

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Type de signalement</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Choisissez la catégorie qui correspond le mieux à votre signalement.
        </Text>
      </View>

      {/* Liste des catégories */}
      <ScrollView
        style={styles.categoriesScrollView}
        contentContainerStyle={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.value;
          const isExpanded = expandedCategory === category.value;
          
          return (
            <View 
              key={category.value} 
              style={[
                styles.categoryCard,
                isSelected && styles.selectedCategoryCard
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
                  isSelected && styles.selectedIconContainer
                ]}>
                  <Ionicons 
                    name={category.icon} 
                    size={24} 
                    color={isSelected ? "#FFFFFF" : "#2C3E50"} 
                  />
                </View>
                
                <Text style={[
                  styles.categoryTitle,
                  isSelected && styles.selectedCategoryTitle
                ]}>
                  {category.name}
                </Text>
                
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => toggleCategoryDetails(category.value)}
                >
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={isSelected ? "#FFFFFF" : "#95A5A6"}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              
              {/* Section détails (visible uniquement si développée) */}
              {isExpanded && (
                <View style={styles.detailsContainer}>
                  <Text style={[
                    styles.detailsText,
                    isSelected && styles.selectedDetailsText
                  ]}>
                    {formatDescription(category.description)}
                  </Text>
                </View>
              )}
              
              {/* Indicateur de sélection */}
              <View style={styles.selectionIndicator}>
                {isSelected && (
                  <View style={styles.selectionDot} />
                )}
              </View>
            </View>
          );
        })}
        
        {/* Espace en bas pour s'assurer que tout est visible */}
        <View style={styles.bottomSpacer} />
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
    backgroundColor: '#3498db', // Couleur bleu vif et moderne
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  backButton: {
    width: 25,
    height: 25,
    borderRadius: 20,
    marginLeft:10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  instructionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  instructionText: {
    fontSize: 16,
    color: '#5D6D7E',
    textAlign: 'center',
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoriesContainer: {
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E6ED',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCategoryCard: {
    backgroundColor: '#2196F3',
    borderColor: '#1976D2',
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
    backgroundColor: '#F1F8FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectedCategoryTitle: {
    color: '#FFFFFF',
  },
  infoButton: {
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
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  detailsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#5D6D7E',
  },
  selectedDetailsText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  bottomSpacer: {
    height: 80,
  },

});

export default React.memo(CategorySelection);