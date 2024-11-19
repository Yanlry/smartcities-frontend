import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Alert, TouchableOpacity, ScrollView, Image, } from 'react-native';
import styles from './styles/HomeScreen.styles';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLocation } from '../hooks/useLocation';
import { RootStackParamList } from '../types/navigation';
import { processReports, Report } from '../services/reportService';
import { formatCity } from '../utils/formatters';
import { getTypeLabel, typeColors } from '../utils/reportHelpers';
import { hexToRgba, calculateOpacity } from '../utils/reductOpacity';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { location, loading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const loadReports = async () => {
      if (!location) return;
  
      try {
        // Utilisation de processReports avec une limite de 4
        const reports = await processReports(location.latitude, location.longitude);
        setReports(reports);
      } catch (error) {
        console.error('Erreur lors du chargement des signalements :', error);
        Alert.alert('Erreur', error.message);
      }
    };
  
    loadReports();
  }, [location]);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de la position...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <Modal transparent animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Partagez votre position</Text>
          <Text style={styles.modalText}>
            La permission de localisation est nécessaire pour utiliser l'application.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => useLocation()}>
            <Text style={styles.buttonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const handlePressReport = (id: number) => {
    navigation.navigate('ReportDetails', { reportId: id }); // Maintenant typé correctement
  };

  return (
    <ScrollView style={styles.container}>
      {/* Section Profil */}
      <View style={styles.profileContainer}>
        <Image source={require('../assets/images/profil.png')} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Yann Leroy</Text>
          <Text style={styles.userDetails}>Inscrit il y a 1 an</Text>
          <Text style={styles.userStats}>📈 187 followers</Text>
          <Text style={styles.userRanking}>Classement: 453 / 1245</Text>
          <TouchableOpacity style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>⭐ Taux de fiabilité : 94% ⭐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section reports Proches */}
      <Text style={styles.sectionTitle}>Signalements proches de vous</Text>
        {reports.map((report) => (
        <TouchableOpacity
          key={report.id}
          style={[
            styles.reportItem,
            {
              backgroundColor: hexToRgba(
                typeColors[report.type] || '#CCCCCC',
                calculateOpacity(report.createdAt, 0.5)
              ),
            },
          ]}
          onPress={() => handlePressReport(report.id)}
        >
          <Text style={styles.reportType}>{getTypeLabel(report.type)} {report.distance.toFixed(2)} km</Text>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportCity}>📍 {formatCity(report.city)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}


