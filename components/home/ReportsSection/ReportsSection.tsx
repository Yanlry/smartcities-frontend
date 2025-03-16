import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import CategoryFilter from './CategoryFilter';
import ReportItem from './ReportItem';
import { Report, ReportCategory } from './report.types';
import { getTypeLabel, typeColors } from '../../../utils/reportHelpers';
import { hexToRgba, calculateOpacity } from '../../../utils/reductOpacity';
import { formatCity } from '../../../utils/formatters';

interface ReportsSectionProps {
  reports: Report[];
  categories: ReportCategory[];
  loading: boolean;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  formatTime: (date: string) => string;
  onPressReport: (id: number) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
}

const ReportsSection: React.FC<ReportsSectionProps> = memo(({
  reports,
  categories,
  loading,
  selectedCategory,
  setSelectedCategory,
  formatTime,
  onPressReport,
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
        <Text style={styles.sectionTitle}>🚨 Signalements à proximité</Text>
        <Text style={styles.arrow}>{isVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isVisible && (
        <>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            typeColors={typeColors}
          />

          <View style={styles.sectionContent}>
            {reports.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.noReportsText}>
                  Aucun signalement dans cette catégorie.
                </Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.timelineContainer}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              >
                {reports.map((report) => (
                  <ReportItem
                    key={report.id}
                    report={report}
                    onPress={onPressReport}
                    typeLabel={getTypeLabel(report.type)}
                    typeColor={typeColors[report.type] || "#F5F5F5"}
                    backgroundColor={hexToRgba(
                      typeColors[report.type] || "#F5F5F5",
                      calculateOpacity(report.createdAt, 0.2)
                    )}
                    formattedCity={formatCity(report.city)}
                    formattedTime={formatTime(report.createdAt)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </>
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
    marginTop: 5,
  },
  timelineContainer: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noReportsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ReportsSection;