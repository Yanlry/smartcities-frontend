import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { fetchReportsByCategory } from '../services/categoryService';

type CategoryReportsScreenRouteProp = RouteProp<RootStackParamList, 'CategoryReports'>;

export default function CategoryReportsScreen() {
  const route = useRoute<CategoryReportsScreenRouteProp>();
  const { category } = route.params;

  type Report = {
    id: string;
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Chargement des signalements...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>
        Signalements pour la catégorie : {category}
      </Text>

      {reports.length === 0 ? (
        <Text>Aucun signalement trouvé pour cette catégorie.</Text>
      ) : (
        reports.map((report) => (
          <View key={report.id} style={{ marginBottom: 10, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{report.title}</Text>
            <Text>{report.description}</Text>
            <Text>{report.city}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
