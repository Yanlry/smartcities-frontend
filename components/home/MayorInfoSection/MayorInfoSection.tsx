import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Linking } from 'react-native';

interface MayorInfoSectionProps {
  isVisible: boolean;
  toggleVisibility: () => void;
  onPhonePress: () => void;
}

const MayorInfoSection: React.FC<MayorInfoSectionProps> = memo(({
  isVisible,
  toggleVisibility,
  onPhonePress
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
        <Text style={styles.sectionTitle}>🏛️ Informations mairie</Text>
        <Text style={styles.arrow}>{isVisible ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.sectionContent}>
          {/* Informations mairie */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Attention : Travaux ! </Text>
            <Text style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date :</Text> 15 septembre 2024
              {"\n"}
              <Text style={styles.infoLabel}>Lieu :</Text> Avenue de la
              Liberté {"\n"}
              <Text style={styles.infoLabel}>Détail :</Text> Des travaux de
              réfection de la chaussée auront lieu du 25 au 30 septembre. La
              circulation sera déviée. Veuillez suivre les panneaux de
              signalisation.
            </Text>

            <Text style={styles.infoTitle}>
              Résolution de vos signalements
            </Text>
            <Text style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date :</Text> 20 septembre 2024
              {"\n"}
              <Text style={styles.infoLabel}>Lieu :</Text> Rue des Fleurs
              {"\n"}
              <Text style={styles.infoLabel}>Détail :</Text> La fuite d'eau
              signalée a été réparée. Merci de votre patience.
            </Text>

            <Text style={styles.infoTitle}>Alertes Importantes</Text>
            <Text style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date :</Text> 18 septembre 2024
              {"\n"}
              <Text style={styles.infoLabel}>Détail :</Text> En raison des
              fortes pluies prévues cette semaine, nous vous recommandons de
              limiter vos déplacements et de vérifier les alertes météo
              régulièrement.
            </Text>
          </View>

          {/* Carte du maire */}
          <View style={styles.mayorCard}>
            <Image
              source={require('../../../assets/images/mayor.png')}
              style={styles.profileImageMayor}
            />
            <View style={styles.mayorContainer}>
              <Text style={styles.mayorInfo}>Maire actuel:</Text>
              <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
              <Text style={styles.mayorSubtitle}>
                Permanence en Mairie sur rendez-vous au :
              </Text>
              <TouchableOpacity onPress={onPhonePress}>
                <Text style={styles.contactBold}>03 20 44 02 51</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Carte des bureaux */}
          <View style={styles.officeCard}>
            <Image
              source={require('../../../assets/images/mairie.png')}
              style={styles.officeImage}
            />
            <View style={styles.officeInfo}>
              <View style={styles.officeAddress}>
                <Text style={styles.Address}>Contactez-nous :{"\n"}</Text>
                <Text>11 rue Sadi Carnot, {"\n"}59320 Haubourdin</Text>
              </View>
              <Text style={styles.officeContact}>
                <Text style={styles.phone}>Téléphone :</Text>
                {"\n"}
                <TouchableOpacity onPress={onPhonePress}>
                  <Text style={styles.officeContact}>03 20 44 02 90</Text>
                </TouchableOpacity>
                {"\n"}
                <Text style={styles.hours}>Du lundi au vendredi :</Text>
                {"\n"}
                08:30 - 12:00, 13:30 - 17:00
              </Text>
            </View>
          </View>
        </View>
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
    marginTop: 10,
    paddingHorizontal: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#062C41',
  },
  infoContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  mayorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImageMayor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  mayorContainer: {
    flex: 1,
  },
  mayorInfo: {
    fontSize: 14,
    color: '#555',
  },
  mayorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#062C41',
    marginBottom: 5,
  },
  mayorSubtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  contactBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#062C41',
  },
  officeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  officeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  officeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  officeAddress: {
    marginBottom: 10,
  },
  Address: {
    fontWeight: 'bold',
    color: '#062C41',
  },
  officeContact: {
    lineHeight: 20,
  },
  phone: {
    fontWeight: 'bold',
    color: '#062C41',
  },
  hours: {
    fontWeight: 'bold',
    color: '#062C41',
  },
});

export default MayorInfoSection;