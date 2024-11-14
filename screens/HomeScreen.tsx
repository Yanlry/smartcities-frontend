import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CalendarPicker from 'react-native-calendar-picker'; // Ajoutez un module de calendrier si nécessaire
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function HomeScreen() {
  const screenWidth = Dimensions.get('window').width;

  const data = {
    labels: ["Danger", "Travaux", "Défaut", "Autre"],
    datasets: [
      {
        data: [20, 35, 10, 25], // Remplacez par vos données de statistiques réelles
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: "#f9f9fb",
    backgroundGradientTo: "#f9f9fb",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 204, 110, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e3e3e3",
    },
  };

  // Exemples de données
  const smarterData = [
    { id: '1', image: require('../assets/images/profil1.png') },
    { id: '2', image: require('../assets/images/profil2.png') },
    { id: '3', image: require('../assets/images/profil3.png') },
    { id: '4', image: require('../assets/images/profil4.png') },
    { id: '5', image: require('../assets/images/profil5.png') },
    { id: '6', image: require('../assets/images/profil6.png') },
    { id: '7', image: require('../assets/images/profil7.png') },
    { id: '8', image: require('../assets/images/profil8.png') },
    { id: '9', image: require('../assets/images/profil9.png') },
    { id: '10', image: require('../assets/images/profil10.png') },
  ];

  const signalementsData = [
    { id: '1', type: 'Danger à 100m', description: 'Arbre sur la chaussée\nRue du petit Belgique', color: '#e74c3c' },
    { id: '2', type: 'Travaux à 300m', description: 'Route barrée jusqu\'au 16/09/24\nDepartementale D85', color: '#e67e22' },
    { id: '3', type: 'Défaut à 1km', description: 'Feu rouge défaillant\nAvenue du Maréchal Foch', color: '#2ecc71' },
    { id: '4', type: 'Nuisance à 2,4km', description: 'Tapage nocturne\nRue Sadi Carnot', color: '#9b59b6' },
    // Ajoutez d'autres éléments ici
  ];

  const featuredEvents = [
      { id: '1', title: "Exposition d'art moderne au centre Paul André Lequimme", image: require('../assets/images/event1.png') },
      { id: '2', title: "Chasse aux oeufs de Pâques organisé au jardin public", image: require('../assets/images/event2.png') },
      { id: '3', title: "Concert de jazz en plein air", image: require('../assets/images/event3.png') },
      { id: '4', title: "Festival des lumières - Illumination des monuments historiques", image: require('../assets/images/event4.png') },
      { id: '5', title: "Atelier de peinture pour enfants au parc municipal", image: require('../assets/images/event5.png') },
      { id: '6', title: "Marché fermier et dégustation de produits locaux", image: require('../assets/images/event6.png') },
      { id: '7', title: "Projection en plein air de films classiques", image: require('../assets/images/event7.png') },
      { id: '8', title: "Journée portes ouvertes des pompiers", image: require('../assets/images/event8.png') },
  ];

  const upcomingEvents = [
    { id: '1', title: "Marché d'Haubourdin", date: '08:00 - 12:30', location: 'Place Ernest Blondeau' },
    { id: '2', title: "Sortie : Découverte du parc Mosaïc", date: '15:00 - 15:15', location: 'Maison Des Jeunes D’Haubourdin' },
    // Ajoutez d'autres événements ici
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Section Profil */}
      <View style={styles.profileContainer}>
      <Image source={require('../assets/images/profil.png')} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Yann leroy</Text>
          <Text style={styles.userDetails}>Inscrit il y a 1 ans</Text>
          <Text style={styles.userStats}><Text style={styles.goodStats}>187</Text> 👍  |   <Text style={styles.badStats}>19</Text> 👎</Text>
          <Text style={styles.userRanking}>Classement: 453 / 1245</Text>
          <TouchableOpacity style={styles.trustBadge}>
            <Text style={styles.trustBadgeText}>⭐ Digne de confiance ⭐</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Top 10 des Smarter Actif */}
      <Text style={styles.sectionTitle}>Top 10 des Smarter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {smarterData.map((item) => (
          <View key={item.id} style={styles.smarterItem}>
            <Image source={item.image} style={styles.smarterImage} />
          </View>
        ))}
      </ScrollView>

      {/* Section Signalements Proche de Vous */}
      <Text style={styles.sectionTitle}>Signalements proche de vous</Text>
      {signalementsData.map((item) => (
        <View key={item.id} style={[styles.signalementItem, { borderColor: item.color }]}>
          <Text style={styles.signalementType}>{item.type}</Text>
          <Text style={styles.signalementDescription}>{item.description}</Text>
        </View>
      ))}

      {/* Section Catégories */}
      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {/* Ajoutez ici vos catégories, chaque élément aura une icône et un titre */}
        <View style={styles.categoryItem}>
          <Ionicons name="grid-outline" size={40} color="#3498db" />
          <Text style={styles.categoryText}>Danger</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="map-outline" size={40} color="#3498db" />
          <Text style={styles.categoryText}>Travaux</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="person-outline" size={40} color="#3498db" />
          <Text style={styles.categoryText}>Défaut / Probléme</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="search-outline" size={40} color="#3498db" />
          <Text style={styles.categoryText}>Nuissance</Text>
        </View>
        <View style={styles.categoryItem}>
          <Ionicons name="star-outline" size={40} color="#3498db" />
          <Text style={styles.categoryText}>Réparation</Text>
        </View>
      </ScrollView>


      {/* Section À la Une */}
      <Text style={styles.sectionTitle}>À la Une</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {featuredEvents.map((item) => (
          <View key={item.id} style={styles.featuredItem}>
            <Image source={item.image} style={styles.featuredImage} />
            <Text style={styles.featuredTitle}>{item.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Section Événements */}
      <Text style={styles.sectionTitle}>Tous les événements</Text>
      <View style={styles.calendarContainer}>
        <CalendarPicker
          onDateChange={(date) => console.log('Date sélectionnée :', date)}
          previousTitle="<" // Utilisez un symbole pour réduire la largeur du bouton précédent
          nextTitle=">"     // Utilisez un symbole pour réduire la largeur du bouton suivant
          weekdays={['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']}
          months={[
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
          ]}
          startFromMonday={true}
          textStyle={{
            fontSize: 16,
          }}
          width={330} 
        />
      </View>

      {/* List des évenements a venir */}
      {upcomingEvents.map((event) => (
        <View key={event.id} style={styles.eventItem}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDetails}>{event.date}</Text>
          <Text style={styles.eventLocation}>
            <Ionicons name="location-outline" size={16} /> {event.location}
          </Text>
        </View>
      ))}

      {/* Section Statistiques du Mois */}
      <Text style={styles.sectionTitle}>Statistiques du mois</Text>
            <View style={styles.chartContainer}>
            <BarChart
                data={data}
                width={screenWidth} // Ajustez selon les marges de votre composant
                height={220}
                chartConfig={chartConfig}
                yAxisLabel=" "
                yAxisSuffix=""
                fromZero
                style={{
                  borderRadius: 16,
                  marginLeft: -10,
                }}
              />
            </View>

      {/* Section Informations Mairie */}
      <Text style={styles.sectionTitle}>Informations mairie</Text>

      {/* Informations de Signalement */}
      <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>Attention : Travaux ! </Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la Liberté{"\n"}
          Des travaux de réfection de la chaussée auront lieu du 25 au 30 septembre. La circulation sera déviée. Veuillez suivre les panneaux de signalisation.
        </Text>

        <Text style={styles.infoTitle}>Résolution de vos signalements</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 20 septembre 2024{"\n"}
          <Text style={styles.infoLabel}>Lieu :</Text> Rue des Fleurs{"\n"}
          <Text style={styles.infoLabel}>Détail :</Text> La fuite d'eau signalée a été réparée. Merci de votre patience.
        </Text>

        <Text style={styles.infoTitle}>Alertes Importantes</Text>
        <Text style={styles.infoContent}>
          <Text style={styles.infoLabel}>Date :</Text> 18 septembre 2024{"\n"}
          En raison des fortes pluies prévues cette semaine, nous vous recommandons de limiter vos déplacements et de vérifier les alertes météo régulièrement.
        </Text>
      </View>

      {/* Carte du Maire */}
      <View style={styles.mayorCard}>
      <Image source={require('../assets/images/mayor.png')} style={styles.profileImage} />
        <View style={styles.mayorInfo}>
          <Text style={styles.mayor}>Maire actuel:</Text>
          <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
          <Text style={styles.mayorSubtitle}>Permanence en Mairie sur rendez-vous</Text>
          <Text style={styles.mayorContact}>Contact : <Text style={styles.contactBold}>03 20 44 02 51</Text></Text>
        </View>
      </View>

      {/* Adresse de la Mairie */}
      <View style={styles.officeCard}>
      <Image source={require('../assets/images/mairie.png')} style={styles.profileImage} />
        <View style={styles.officeInfo}>
          <View style={styles.officeAddress}>
            <Text style={styles.Address}>Adresse :{"\n"}</Text>
            <Text>11 rue Sadi Carnot, {"\n"}59320 Haubourdin</Text>
            </View>
          <Text style={styles.officeContact}>
            <Text style={styles.phone}>Téléphone :</Text> 03 20 44 02 90{"\n"}
            <Text style={styles.hours}>Du lundi au vendredi :</Text>{"\n"}
            08:30 - 12:00, 13:30 - 17:00
          </Text>
        </View>
      </View>

    </ScrollView>
  );
}

// Styles pour la page d'accueil
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fb',
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 130,
    borderRadius:10,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
  },
  userStats: {
    fontWeight:'bold',
    fontSize: 14,
    marginVertical: 5,
  },
  goodStats:{
    color:'#26A65B'
  },
  badStats:{
    color:'#E74C3C' 
  },
  userRanking: {
    fontSize: 14,
    color: '#999',
  },
  trustBadge: {
    backgroundColor: '#37323E',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 5,
  },
  trustBadgeText: {
    textAlign:'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 20,
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  smarterItem: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  smarterImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  signalementItem: {
    borderWidth: 2,
    borderRadius: 30,
    padding: 15,
    paddingHorizontal: 25,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  signalementType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signalementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  categoryItem: {
    width: 150, // Utilisez une largeur fixe mais ajustable selon le contenu
    minHeight: 150, // Hauteur minimale pour permettre au conteneur de grandir si nécessaire
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center', // Centrer les icônes et le texte horizontalement
    justifyContent: 'center', // Centrer le contenu verticalement
    padding: 10, // Ajouter du padding pour espacer l'icône et le texte
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center', // Centrer le texte horizontalement
    marginTop: 10, // Ajouter un espace entre l'icône et le texte
    flexWrap: 'wrap', // Permettre au texte de s'étendre sur plusieurs lignes
  },
  featuredItem: {
    width: 150,
    minHeight: 150, // Remplacez height par minHeight pour permettre au conteneur de s'agrandir
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  featuredImage: {
    width: '100%',
    height: 'auto', // Utilisez auto pour que l'image s'ajuste en fonction du texte
    aspectRatio: 1.5, // Vous pouvez définir un ratio pour que l'image conserve une forme cohérente
  },
  featuredTitle: {
    padding: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  calendarContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center', // Centre le contenu horizontalement
    overflow: 'hidden',
  },

  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  eventDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },

  eventLocation: {
    fontSize: 14,
    color: '#888',
  },

  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },

  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
    marginTop: 15,
  },
  infoContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666',
  },
  mayorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  mayorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  mayorInfo: {
    flex: 1,
  },
  mayor:{
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom:5
  },
  mayorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mayorSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  mayorContact: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  contactBold: {
    fontWeight: 'bold',
  },
  officeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  officeImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 15,
  },
  officeInfo: {
    flex: 1,
  },
  officeAddress: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  Address:{
    fontSize: 18,
    fontWeight:'bold',
    color: '#3498db',
  },
  officeContact: {
    fontSize: 14,
    color: '#666',
  },
  phone:{
    fontWeight:'bold'
  },
  hours:{
    fontWeight:'bold',
  },
});
