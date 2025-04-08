// src/components/home/MayorInfoSection/components/ContactInfo.tsx
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Configuration des couleurs
const THEME = {
  primary: "#3498db",
  secondary: "#1E40AF",
};

interface ContactInfoProps {
  /** Callback pour gérer les appels téléphoniques */
  onPhonePress: () => void;
}

/**
 * Composant pour afficher les informations de contact de la mairie
 * Inclut l'adresse, les heures d'ouverture et les boutons d'action
 */
export const ContactInfo = memo<ContactInfoProps>(({ onPhonePress }) => {
  return (
    <View style={styles.contactContainer}>
      <View style={styles.contactCard}>
        {/* Image de la mairie */}
        <View style={styles.contactImageContainer}>
          <Image
            source={require('../../../assets/images/mairie.png')}
            style={styles.contactImage}
          />
        </View>
        
        {/* Titre principal */}
        <Text style={styles.contactTitle}>Mairie de Haubourdin</Text>
        
        {/* Détails de contact */}
        <View style={styles.contactDetails}>
          {/* Adresse */}
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={20} color={THEME.secondary} />
            <Text style={styles.contactText}>11 rue Sadi Carnot, 59320 Haubourdin</Text>
          </View>
          
          {/* Téléphone */}
          <TouchableOpacity 
            style={styles.contactRow} 
            onPress={onPhonePress}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={20} color={THEME.secondary} />
            <Text style={styles.contactPhoneText}>03 20 44 02 90</Text>
          </TouchableOpacity>
          
          {/* Horaires */}
          <View style={styles.contactRow}>
            <Ionicons name="time-outline" size={20} color={THEME.secondary} />
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursTitle}>Du lundi au vendredi</Text>
              <Text style={styles.hoursText}>08:30 - 12:00, 13:30 - 17:00</Text>
            </View>
          </View>
          
          {/* Boutons d'action */}
          <View style={styles.contactActions}>
            {/* Bouton d'appel */}
            <TouchableOpacity 
              style={styles.contactActionButton}
              onPress={onPhonePress}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Appeler</Text>
            </TouchableOpacity>
            
            {/* Bouton email */}
            <TouchableOpacity 
              style={[styles.contactActionButton, styles.secondaryButton]}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  contactContainer: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactImageContainer: {
    height: 150,
    width: '100%',
  },
  contactImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#062C41',
    margin: 16,
  },
  contactDetails: {
    padding: 16,
    paddingTop: 0,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 12,
    flex: 1,
  },
  contactPhoneText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: '600',
    marginLeft: 12,
  },
  hoursContainer: {
    marginLeft: 12,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#062C41',
    marginBottom: 2,
  },
  hoursText: {
    fontSize: 14,
    color: '#555',
  },
  contactActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  contactActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  secondaryButton: {
    backgroundColor: THEME.secondary,
    marginRight: 0,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
});