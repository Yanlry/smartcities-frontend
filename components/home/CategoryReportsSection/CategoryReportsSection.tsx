// src/components/home/CategoryReportsSection/CategoryReportsSection.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportCategory } from '../ReportsSection/report.types';
import { hexToRgba } from '../../../utils/reductOpacity';

interface CategoryReportsSectionProps {
  categories: ReportCategory[];
  onCategoryPress: (category: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const CategoryReportsSection: React.FC<CategoryReportsSectionProps> = memo(({
  categories,
  onCategoryPress,
  isVisible,
  toggleVisibility
}) => {
  return (
    <>
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          isVisible && styles.sectionHeaderVisible,
        ]}
        onPress={toggleVisibility}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>🗂️ Tous les signalements</Text>
        <Text style={styles.arrow}>{isVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.sectionContent}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollView}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.name}
                onPress={() => onCategoryPress(category.name)}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: hexToRgba(category.color, 0.5),
                  },
                ]}
              >
                <Ionicons
                  name={category.icon as keyof typeof Ionicons.glyphMap}
                  size={40}
                  color="#fff"
                  style={styles.categoryIcon}
                />
                <Text style={styles.categoryText}>{category.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
});

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
  },
  sectionHeaderVisible: {
    backgroundColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrow: {
    fontSize: 16,
    color: '#333',
  },
  sectionContent: {
    marginTop: 10,
  },
  scrollView: {
    marginBottom: 25,
  },
  categoryButton: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginRight: 15,
    marginLeft: 5,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    marginBottom: 10,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CategoryReportsSection;