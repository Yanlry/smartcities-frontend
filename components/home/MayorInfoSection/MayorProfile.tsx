// src/components/home/MayorInfoSection/components/MayorProfile.tsx
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Configuration des couleurs
const THEME = {
  secondary: "#A1869E",
  primary: "#3498db",
};

interface MayorProfileProps {
  /** Callback pour gérer les appels téléphoniques */
  onPhonePress: () => void;
}

/**
 * Composant pour afficher les informations du maire
 * Présente la photo, les détails et une brève biographie
 */
export const MayorProfile = memo<MayorProfileProps>(({ onPhonePress }) => {
  return (
    <View style={styles.mayorContentContainer}>
      {/* Carte principale avec photo et informations */}
      <View style={styles.mayorCard}>
        <Image
          source={require('../../../assets/images/mayor.png')}
          style={styles.profileImageMayor}
        />
        
        <View style={styles.mayorInfo}>
          <Text style={styles.mayorRole}>Maire actuel</Text>
          <Text style={styles.mayorName}>Pierre BÉHARELLE</Text>
          
          <View style={styles.mayorDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color={THEME.secondary} />
              <Text style={styles.detailText}>En fonction depuis 2020</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={THEME.secondary} />
              <Text style={styles.detailText}>Permanence sur rendez-vous</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.phoneButton} 
              onPress={onPhonePress}
              activeOpacity={0.7}
            >
              <View style={styles.phoneButtonInner}>
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={styles.phoneButtonText}>03 20 44 02 51</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Carte de biographie */}
      <View style={styles.mayorBioCard}>
        <Text style={styles.bioTitle}>À propos du Maire</Text>
        <Text style={styles.bioText}>
          M. BÉHARELLE est engagé dans le développement durable et l'amélioration du cadre de vie des habitants. 
          Il travaille activement sur des projets de modernisation des infrastructures et de renforcement des 
          services publics de proximité.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mayorContentContainer: {
    padding: 16,
  },
  mayorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImageMayor: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: THEME.secondary,
  },
  mayorInfo: {
    flex: 1,
  },
  mayorRole: {
    fontSize: 13,
    color: THEME.secondary,
    marginBottom: 2,
  },
  mayorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#062C41',
    marginBottom: 12,
  },
  mayorDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  phoneButton: {
    marginTop: 8,
  },
  phoneButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.secondary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  phoneButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  mayorBioCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
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
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#062C41',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
});