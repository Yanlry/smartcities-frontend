import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { fetchAllReportsInRegion, Report } from '../services/reportService';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { getTypeIcon } from '../utils/typeIcons';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

export default function MapScreen() {

  const { location, loading } = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region | null>(null); // Région visible
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();
  // Charger les signalements de la région actuelle
  const fetchReportsInRegion = async () => {
    if (!mapRegion) return;

    setLoadingReports(true);
    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
      const radiusKm = Math.max(latitudeDelta, longitudeDelta) * 111; // Conversion approx. des deltas en km

      const result = await fetchAllReportsInRegion(latitude, longitude, radiusKm);
      setReports(result);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements :', error);
      Alert.alert('Erreur', "Impossible de récupérer les signalements dans cette zone.");
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (location) {
      setMapRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      // Charger les signalements initiaux
      fetchReportsInRegion();
    }
  }, [location]);

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
  };

  if (loading || loadingReports) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!location) {
    Alert.alert(
      "Localisation indisponible",
      "Impossible de récupérer votre position actuelle."
    );
    return (
      <View style={styles.errorContainer}>
        <Text>Localisation indisponible</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion || undefined}
        onRegionChangeComplete={handleRegionChangeComplete} // Met à jour la région visible
      >
        {/* Marqueur pour la position actuelle */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Vous êtes ici"
          pinColor=""
        />

        {/* Marqueurs pour les rapports */}
        {reports.map((report) => (
          <Marker
            key={report.id} // Ajout d'une clé unique
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.title}
            onCalloutPress={() =>
              navigation.navigate('ReportDetails', { reportId: report.id })
            }
          >
            <View
              style={{
                width: 50,
                height: 50,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.9,
                shadowRadius: 3,
                elevation: 5, // Pour Android
              }}
            >
              <Image
                source={getTypeIcon(report.type)} // Dynamique selon le type de signalement
                style={{ width: 40, height: 40, resizeMode: "contain" }}
              />
            </View>
          </Marker>
        ))}

      </MapView>

      {/* Bouton de recherche dans cette zone */}
      <TouchableOpacity
        style={styles.searchButton}
        onPress={fetchReportsInRegion}
      >
        <Text style={styles.searchButtonText}>Recherche dans cette zone</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
