import React, { useEffect, useState }  from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import styles from './styles/HomeScreen.styles';
import axios from 'axios';
import { hexToRgba, calculateOpacity } from '../utils/CustomReductOpacity';
import { useLocation } from '../hooks/useLocation';

export default function HomeScreen() {
  interface Signalement {
    id: number;
    type: string;
    title: string;
    latitude: number;
    longitude: number;
    distance: number;
    city: string;
    createdAt: string;
  }

  const { location, loading } = useLocation(); // Utilise le hook useLocation
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  

  useEffect(() => {
    if (location) {
      fetchSignalements(location.latitude, location.longitude);
    }
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
      <Modal transparent={true} animationType="slide">
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

  const typeLabels: { [key: string]: string } = {
    danger: 'Danger  ⚠️',
    travaux: 'Travaux  🚧',
    nuisance: 'Nuisance 😡',
    pollution: 'Pollution  🌍',
    reparation: 'Réparation  ⚙️',
  };
  const getTypeLabel = (type: string): string => {
    return typeLabels[type] || type; // Retourne le label correspondant ou le type original s'il n'est pas dans le mappage
  };
  
  const typeColors: { [key: string]: string } = {
    danger: '#FF4C4C', // Rouge
    travaux: '#FFA500', // Orange
    nuisance: '#B4A0E5', // Jaune
    pollution: '#32CD32', // VertFFD700
    reparation: '#1E90FF', // Bleu
  };

  const formatCity = (city: string): string => {
    return city
      .replace(/, France/g, '') // Supprime ', France'
      .replace(/\d+/g, '') // Supprime tous les chiffres
      .trim(); // Nettoie les espaces inutiles au début et à la fin
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degree: number) => (degree * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en kilomètres
  
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return R * c; // Distance en km
  };
  
  const fetchSignalements = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get('http://192.168.1.4:3000/reports', {
        params: {
          latitude,
          longitude,
          radiusKm: 10, // Rayon de 10 km
        },
      });
  
      const sortedSignalements = response.data
        .map((signalement: Signalement) => ({
          ...signalement,
          distance: calculateDistance(latitude, longitude, signalement.latitude, signalement.longitude),
        }))
        .sort((a, b) => a.distance - b.distance); // Tri du plus proche au plus éloigné
  
      setSignalements(sortedSignalements.slice(0, 4)); // Limite à 4 signalements
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements :', error);
      Alert.alert('Erreur', "Impossible de récupérer les signalements à proximité.");
    }
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

      {/* Section Signalements Proches */}
      <Text style={styles.sectionTitle}>Signalements proches de vous</Text>
        {signalements.map((signalement) => (
        <View
        key={signalement.id}
        style={[
          styles.signalementItem,
          {
            backgroundColor: hexToRgba(
              typeColors[signalement.type] || '#CCCCCC',
              calculateOpacity(signalement.createdAt, 0.5) // Applique un facteur d'intensité de 1.2
            ),
          },
        ]}
      >
          <Text style={styles.signalementType}>{getTypeLabel(signalement.type)}  {signalement.distance.toFixed(2)} km</Text>
          <Text style={styles.signalementTitle}>{signalement.title}</Text>
          <Text style={styles.signalementCity}>{formatCity(signalement.city)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}



