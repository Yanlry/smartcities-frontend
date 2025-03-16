import React from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCategory } from './types';

interface CategorySelectionProps {
  categories: ReportCategory[];
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
  onBack: () => void;
}

/**
 * Composant pour la sélection de catégorie de signalement
 */
const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  onBack
}) => {
  /**
   * Bascule la sélection de catégorie
   * @param value Valeur de la catégorie
   */
  const toggleCategorySelection = (value: string) => {
    onCategorySelect(selectedCategory === value ? '' : value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.homeTitle}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Étape 1 : Choisissez le type</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              selectedCategory === category.value && styles.expandedCard,
              index === categories.length - 1 && styles.lastCard,
            ]}
            onPress={() => toggleCategorySelection(category.value)}
          >
            <Ionicons name={category.icon as any} size={40} color="#2c3e50" />
            <Text style={styles.cardTitle}>{category.name}</Text>
            {selectedCategory === category.value && (
              <Text style={styles.cardDescription}>
                {category.description}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  homeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
  },
  expandedCard: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  lastCard: {
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  cardDescription: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    lineHeight: 20,
  },
});

export default React.memo(CategorySelection);