import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import MapView, { Marker, Camera, Region } from 'react-native-maps';
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
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<MapScreenNavigationProp>();

  const fetchReportsInRegion = async () => {
    if (!mapRegion) return;

    setLoadingReports(true);
    try {
      const { latitude, longitude, latitudeDelta, longitudeDelta } = mapRegion;
      const radiusKm = Math.max(latitudeDelta, longitudeDelta) * 111;

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

      fetchReportsInRegion();

      // Configure la caméra pour une vue 3D
      if (mapRef.current) {
        const camera: Camera = {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          pitch: 60, // Inclinaison pour la vue 3D
          heading: 0, // Orientation vers le nord
          zoom: 17, // Niveau de zoom
          altitude: 1000, // Altitude de la caméra
        };
        mapRef.current.animateCamera(camera, { duration: 2000 });
      }
    }
  }, [location]);

  const handleRegionChangeComplete = (region: Region) => {
    setMapRegion(region);
  };

  const toggleMapType = () => {
    setMapType((prevType) => {
      switch (prevType) {
        case 'standard':
          return 'satellite';
        case 'satellite':
          return 'hybrid';
        case 'hybrid':
          return 'terrain';
        default:
          return 'standard';
      }
    });
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
      'Localisation indisponible',
      'Impossible de récupérer votre position actuelle.'
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
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType={mapType}
        showsBuildings={true} // Affiche les bâtiments en 3D
        pitchEnabled={true} // Active l'inclinaison
        rotateEnabled={true} // Active la rotation
        showsCompass={true} // Affiche la boussole
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Vous êtes ici"
          pinColor="blue"
        />

        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.title}
            onCalloutPress={() =>
              navigation.navigate('ReportDetails', { reportId: report.id })
            }
          >
            <Image
              source={getTypeIcon(report.type)}
              style={{ width: 40, height: 40, resizeMode: 'contain' }}
            />
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.mapTypeButton} onPress={toggleMapType}>
        <Text style={styles.mapTypeButtonText}>
          {mapType === 'standard' ? 'Vue Satellite' : mapType === 'satellite' ? 'Vue Hybride' : mapType === 'hybrid' ? 'Vue Terrain' : 'Vue Standard'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.searchButton}
        onPress={fetchReportsInRegion}
      >
        <Text style={styles.searchButtonText}>Rechercher dans cette zone</Text>
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
  mapTypeButton: {
    position: 'absolute',
    top: 550,
    left: '35%',
    backgroundColor: '#fff',
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  mapTypeButtonText: {
    color: '#000',
  },

  searchButton: {
    position: 'absolute',
    top: 595,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: '#CA483F',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});