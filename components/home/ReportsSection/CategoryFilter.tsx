import React, { memo } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CategoryFilterProps {
  categories: Array<{ name: string; label: string; color?: string }>;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  typeColors: Record<string, string>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = memo(({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  typeColors
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContainer}
    >
      {/* Ajout de l'option "Tous" */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedCategory === "Tous" && { backgroundColor: "#062C41" },
        ]}
        onPress={() => onSelectCategory("Tous")}
      >
        <Text style={[
          styles.filterText, 
          selectedCategory === "Tous" && { color: "#FFFFFF" }
        ]}>
          🔍 Tous
        </Text>
      </TouchableOpacity>

      {categories.map((category) => {
        const isSelected = selectedCategory === category.name;
        const backgroundColor = isSelected
          ? typeColors[category.name] || "#062C41"
          : "#FFFFFF";
    
        const textColor = isSelected ? "#FFFFFF" : "#000";
    
        return (
          <TouchableOpacity
            key={category.name}
            style={[
              styles.filterButton,
              isSelected && { backgroundColor },
            ]}
            onPress={() => onSelectCategory(category.name)}
          >
            <Text style={[styles.filterText, { color: textColor }]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontWeight: '500',
  },
});

export default CategoryFilter;