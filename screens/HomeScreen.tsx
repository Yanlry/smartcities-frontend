import React, { useEffect, useState }  from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity,} from 'react-native';
import styles from './styles/HomeScreen.styles';
import axios from 'axios';
import { hexToRgba, calculateOpacity } from '../utils/CustomReductOpacity';

export default function HomeScreen() {

  const [signalementsData, setSignalementsData] = useState<Signalement[]>([]);
  interface Signalement {
    id: number;
    type: string;
    title: string;
    backgroundColor: string;
    city: string,
    color: string;
    createdAt: string;
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
    nuisance: '#FFD700', // Jaune
    pollution: '#32CD32', // Vert
    reparation: '#1E90FF', // Bleu
  };


  useEffect(() => {
    fetchSignalements();
  }, []);

  const formatCity = (city: string): string => {
    return city
      .replace(/, France/g, '') // Supprime ', France'
      .replace(/\d+/g, '') // Supprime tous les chiffres
      .trim(); // Nettoie les espaces inutiles au début et à la fin
  };
  
  const fetchSignalements = async () => {
    try {
      const response = await axios.get('http://192.168.1.4:3000/reports');
      console.log('Signalements reçus:', response.data); // Vérifiez ce que vous obtenez
      setSignalementsData(response.data); // Adaptez ici selon la structure réelle
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
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
      {signalementsData.map((item) => (
        <View
          key={item.id}
          style={[
            styles.signalementItem,
            {
              backgroundColor: hexToRgba(
                typeColors[item.type] || '#CCCCCC',
                calculateOpacity(item.createdAt, 0.5) // Applique un facteur d'intensité de 1.2
              ),
            },
          ]}
        >
          <Text style={styles.signalementType}>{getTypeLabel(item.type)}</Text>
          <Text style={styles.signalementTitle}>{item.title}</Text>
          <Text style={styles.signalementCity}>{formatCity(item.city)}</Text>
        </View>
      ))}

    </ScrollView>
  );
}



