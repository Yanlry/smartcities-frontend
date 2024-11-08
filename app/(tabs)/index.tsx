import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Badge, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Section Profil */}
      <View style={styles.profileContainer}>
        <Avatar.Image
          source={{ uri: 'https://example.com/profile.jpg' }} // Remplacez par l'URL de l'image
          size={80}
        />
        <View style={styles.profileText}>
          <Text style={styles.name}>Yann Leroy</Text>
          <Text style={styles.subText}>Inscrit il y a 1 an</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.stats}>187 👍 19 👎</Text>
            <View style={styles.trustBadge}>
              <Text style={{ color: '#fff' }}>Digne de confiance ⭐</Text>
            </View>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <MaterialCommunityIcons name="emoticon-happy-outline" size={30} color="green" />
          <Text style={styles.scoreText}>90,78%</Text>
        </View>
      </View>

      {/* Section Top 10 des Smarter actif */}
      <Text style={styles.sectionTitle}>Top 10 des Smarter actif</Text>
      <View style={styles.top10Container}>
        {/* Remplacez par des icônes spécifiques */}
        <MaterialCommunityIcons name="account" size={50} color="green" />
        <MaterialCommunityIcons name="account" size={50} color="blue" />
        <MaterialCommunityIcons name="account" size={50} color="red" />
      </View>

      {/* Section Signalisations Proche de Vous */}
      <Text style={styles.sectionTitle}>Signalisations proche de vous</Text>
      <View style={styles.signalList}>
        {[
          { type: 'Danger', distance: '100m', description: 'Arbre sur la chaussée', location: 'Rue du petit belgique', color: 'red' },
          { type: 'Travaux', distance: '300m', description: 'Route barrée', location: 'Départementale D85', color: 'orange' },
          { type: 'Défaut', distance: '1km', description: 'Feu rouge défaillant', location: 'Avenue du Maréchal Foch', color: 'green' },
          { type: 'Nuisance', distance: '2,4km', description: 'Tapage nocturne', location: 'Rue Sadi Carnot', color: 'brown' },
          { type: 'Incident', distance: '2,8km', description: 'Accident de la route', location: 'Avenue Notre-Dame', color: 'purple' },
        ].map((signal, index) => (
          <View key={index} style={[styles.signalItem, { borderColor: signal.color }]}>
            <Text style={[styles.signalType, { color: signal.color }]}>{signal.type} à {signal.distance}</Text>
            <Text style={styles.signalDescription}>{signal.description}</Text>
            <Text style={styles.signalLocation}>{signal.location}</Text>
          </View>
        ))}
      </View>
      
      {/* Section Catégories */}
      <Text style={styles.sectionTitle}>Catégories</Text>
      <View style={styles.categoriesContainer}>
     
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5FA',
    padding: 16,
    paddingTop:70
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subText: {
    color: 'grey',
  },
  statsContainer: {
    flexDirection: 'column',
  },
  stats: {
    marginRight: 10,
    color: '#333',
  },
  trustBadge: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 8,
    marginTop: 10,
    height: 30,
    width: '100%', // Pour que le badge occupe toute la largeur du conteneur
    justifyContent: 'center', // Centre le contenu verticalement
    alignItems: 'center', // Centre le contenu horizontalement
},

  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 18,
    color: 'green',
    marginBottom:20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  top10Container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  signalList: {
    marginBottom: 20,
  },
  signalItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#FFF',
  },
  signalType: {
    fontWeight: 'bold',
  },
  signalDescription: {
    color: 'black',
  },
  signalLocation: {
    color: 'grey',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});
