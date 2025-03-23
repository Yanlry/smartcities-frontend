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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
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
    
    // Animation de rotation subtile pour le texte "Nouveau"
    if (isRecent(report.createdAt)) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, []);

  // Utilisation de formatDistance pour un affichage optimisé
  const distanceText = formatDistance(report.distance);
  
  // Animation du badge de distance
  const distanceBadgeScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15]
  });
  
  // Animation de rotation pour le badge "Nouveau"
  const newBadgeRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg']
  });
  
  // Obtenir une couleur plus foncée pour le dégradé
  const getDarkerColor = (color: string): string => {
    // Convertir le code hexadécimal en RGB
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    // Assombrir les valeurs RGB (multiplier par 0.8)
    r = Math.floor(r * 0.8);
    g = Math.floor(g * 0.8);
    b = Math.floor(b * 0.8);
    
    // Reconvertir en code hexadécimal
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Gestion des états de press
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true
    }).start();
  };
  
  // Couleur plus foncée pour le dégradé
  const darkerColor = getDarkerColor(typeColor);

  return (
    <Animated.View 
      style={[
        styles.timelinePointContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      {/* Carte principale */}
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => onPress(report.id)}
        activeOpacity={0.95}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Partie supérieure avec photo */}
        <View style={styles.reportCardTop}>
          {/* Overlay de couleur avec dégradé */}
          <LinearGradient
            colors={[`${typeColor}40`, `${typeColor}10`] as const}
            style={styles.typeColorOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
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
              <View style={styles.noPhotoIconContainer}>
                <MaterialIcons name="image-not-supported" size={32} color="#A0A0A0" />
              </View>
              <Text style={styles.noPhotoText}>Aucune photo</Text>
            </View>
          )}
          
          {/* Type badge avec dégradé */}
          <View style={styles.typeBadgeContainer}>
            <LinearGradient
              colors={[typeColor, darkerColor] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.typeBadge}
            >
              <MaterialIcons 
                name="error-outline" 
                size={12} 
                color="white" 
                style={styles.typeBadgeIcon} 
              />
              <Text style={styles.typeBadgeText}>{typeLabel}</Text>
            </LinearGradient>
          </View>
          
          {/* Distance badge animé */}
          <Animated.View 
            style={[
              styles.distanceBadge,
              { transform: [{ scale: distanceBadgeScale }] }
            ]}
          >
            <LinearGradient
              colors={['rgba(0, 0, 0, 0.86)', 'rgba(20, 20, 20, 0.95)'] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.distanceBadgeContent}
            >
              <MaterialIcons 
                name="location-on" 
                size={12} 
                color="white" 
                style={styles.distanceBadgeIcon} 
              />
              <Text style={styles.distanceBadgeText}>{distanceText}</Text>
            </LinearGradient>
          </Animated.View>
          
          {/* Marqueur de récence avec animation */}
          {isRecent(report.createdAt) && (
            <Animated.View 
              style={[
                styles.recentMarkerContainer,
                { transform: [{ rotate: newBadgeRotate }] }
              ]}
            >
              <LinearGradient
                colors={['#FF5252', '#FF3D71'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.recentMarker}
              >
                <Text style={styles.recentMarkerText}>Nouveau</Text>
                <MaterialIcons name="fiber-new" size={12} color="white" style={{ marginLeft: 4 }} />
              </LinearGradient>
            </Animated.View>
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
              <MaterialIcons name="location-on" size={14} color="#616161" style={styles.locationIcon} />
              <Text style={styles.locationText} numberOfLines={1}>{formattedCity}</Text>
            </View>
            
            {/* Horodatage */}
            <View style={styles.timeContainer}>
              <MaterialIcons name="access-time" size={14} color="#616161" style={styles.timeIcon} />
              <Text style={styles.timeText}>{formattedTime}</Text>
            </View>
          </View>
          
          {/* Bouton d'action avec dégradé */}
          <TouchableOpacity 
            style={styles.actionButtonContainer}
            activeOpacity={0.8}
            onPress={() => onPress(report.id)}
          >
            <LinearGradient
              colors={['#FF5252', darkerColor] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Voir détails</Text>
              <MaterialIcons name="arrow-forward" size={14} color="white" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  timelinePointContainer: {
    width: SCREEN_WIDTH - 30, // ~85% de la largeur de l'écran
    alignSelf: 'center',
  },
  reportCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
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
    backgroundColor: '#F7F7F7',
    zIndex: 2,
  },
  noPhotoIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
  },
  noPhotoText: {
    color: '#757575',
    fontSize: 14,
    fontWeight: '500',
  },
  typeBadgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
    overflow: 'hidden',
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomRightRadius: 24,
  },
  typeBadgeIcon: {
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
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  distanceBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  distanceBadgeIcon: {
    marginRight: 4,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  recentMarkerContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 3,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF3D71',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  recentMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 24,
  },
  recentMarkerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reportCardBottom: {
    padding: 20,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  metadataContainer: {
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIcon: {
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
    marginRight: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#616161',
    fontStyle: 'italic',
  },
  actionButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#CC3333',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionButton: {
    flexDirection: 'row',
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