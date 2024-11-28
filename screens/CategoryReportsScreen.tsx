import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Ajouté
import { RootStackParamList } from '../types/navigation';
import { fetchReportsByCategory } from '../services/categoryService';

type CategoryReportsScreenRouteProp = RouteProp<RootStackParamList, 'CategoryReports'>;
type CategoryReportsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryReports'>; // Ajouté

export default function CategoryReportsScreen() {
  const route = useRoute<CategoryReportsScreenRouteProp>();
  const navigation = useNavigation<CategoryReportsScreenNavigationProp>(); // Ajouté
  const { category } = route.params; // Supprimé reportId

  const handlePressReport = (id: number) => {
    navigation.navigate("ReportDetails", { reportId: id }); // Maintenant typé correctement
  };


  type Report = {
    id: number;
    title: string;
    description: string;
    city: string;
  };

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await fetchReportsByCategory(category);
        setReports(response);
      } catch (error) {
        console.error('Erreur lors du chargement des signalements :', error);
        Alert.alert('Erreur', 'Impossible de charger les signalements.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [category]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.categoryTitle}>
          {category}
        </Text>

        {reports.length === 0 ? (
          <Text style={styles.noReportsText}>
            Aucun signalement disponible.
          </Text>
        ) : (
          reports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportCard}
              onPress={() => handlePressReport(report.id)}
            >
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription}>{report.description}</Text>
              <Text style={styles.reportCity}>{report.city}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 16,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
    marginTop: 40,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  noReportsText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 40,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 16,
    color: '#3A3A3C',
    marginBottom: 12,
    lineHeight: 22,
  },
  reportCity: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
    color: '#8E8E93',
  },
});