// components/home/ReportsSection/ReportItem.tsx

import React, { memo, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  Platform, 
  Animated, 
  Easing,
  Dimensions 
} from 'react-native';
import { Report } from './report.types';
import { formatDistance } from '../../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Vérifie si un signalement est récent (moins de 2 jours)
 * @param date Date de création du signalement
 * @returns boolean indiquant si le signalement est récent
 */
const isRecent = (date: string): boolean => {
  const reportDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - reportDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2;
};

interface ReportItemProps {
  report: Report;
  onPress: (id: number) => void;
  typeLabel: string;
  typeColor: string;
  backgroundColor: string;
  formattedCity: string;
  formattedTime: string;
}

/**
 * Carte de signalement avec design avancé et animations
 */
const ReportItem: React.FC<ReportItemProps> = memo(({
  report,
  onPress,
  typeLabel,
  typeColor,
  backgroundColor,
  formattedCity,
  formattedTime
}) => {
  // Animation d'apparition
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  // Animation de pulsation pour l'indicateur de distance
  useEffect(() => {
    const pulseSequence = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.in(Easing.sin),
        useNativeDriver: true,
      })
    ]);
    
    Animated.loop(pulseSequence).start();
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Utilisation de formatDistance pour un affichage optimisé
  const distanceText = formatDistance(report.distance);
  
  // Animation du badge de distance
  const distanceBadgeScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15]
  });

  return (
    <Animated.View 
      style={[
        styles.timelinePointContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      
      {/* Carte principale */}
      <TouchableOpacity
        style={[
          styles.reportCard,
          { backgroundColor: '#FFF0F0' }
        ]}
        onPress={() => onPress(report.id)}
      >
        {/* Partie supérieure avec photo */}
        <View style={styles.reportCardTop}>
          {/* Overlay de couleur */}
          <View style={[
            styles.typeColorOverlay, 
            { backgroundColor: `${typeColor}25` }
          ]} />
          
          {report.photos &&
          Array.isArray(report.photos) &&
          report.photos.length > 0 ? (
            <Image
              source={{ uri: report.photos[0].url }}
              style={styles.reportImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noPhotoContainer}>
              <Text style={styles.noPhotoText}>Aucune photo</Text>
            </View>
          )}
          
          {/* Type badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          
          {/* Distance badge animé */}
          <Animated.View 
            style={[
              styles.distanceBadge,
              { transform: [{ scale: distanceBadgeScale }] }
            ]}
          >
            <View style={styles.distanceBadgeContent}>
              <Text style={styles.distanceBadgeIcon}>📍</Text>
              <Text style={styles.distanceBadgeText}>{distanceText}</Text>
            </View>
          </Animated.View>
          
          {/* Marqueur de récence */}
          {isRecent(report.createdAt) && (
            <View style={styles.recentMarker}>
              <Text style={styles.recentMarkerText}>Nouveau</Text>
            </View>
          )}
        </View>
        
        {/* Partie inférieure avec détails */}
        <View style={styles.reportCardBottom}>
          {/* Titre du signalement */}
          <Text style={styles.reportTitle} numberOfLines={2}>
            {report.title}
          </Text>
          
          {/* Métadonnées du signalement */}
          <View style={styles.metadataContainer}>
            {/* Localisation */}
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText} numberOfLines={1}>{formattedCity}</Text>
            </View>
            
            {/* Horodatage */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeIcon}>🕒</Text>
              <Text style={styles.timeText}>{formattedTime}</Text>
            </View>
          </View>
          
          {/* Bouton d'action */}
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: "#92281F" }]}
            activeOpacity={0.8}
            onPress={() => onPress(report.id)}
          >
            <Text style={styles.actionButtonText}>Voir détails</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  timelinePointContainer: {
    width: SCREEN_WIDTH, // ~85% de la largeur de l'écran
  },
  urgencyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  highUrgency: {
    borderColor: '#FF5252',
  },
  mediumUrgency: {
    borderColor: '#FFC107',
  },
  lowUrgency: {
    borderColor: '#4CAF50',
  },
  reportCard: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  reportCardTop: {
    height: 180,
    position: 'relative',
  },
  typeColorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  reportImage: {
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  noPhotoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    zIndex: 2,
  },
  noPhotoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  noPhotoIcon: {
    fontSize: 30,
  },
  noPhotoText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderEndEndRadius: 24,
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  typeBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  distanceBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  distanceBadgeIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 4,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  recentMarker: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#FF3D71',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 24,
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recentMarkerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reportCardBottom: {
    padding: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  metadataContainer: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 14,
    color: '#616161',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#616161',
    flex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 14,
    color: '#616161',
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#616161',
    fontStyle: 'italic',
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});

export default ReportItem;