// Chemin : src/components/ReportsSection/ReportItem.tsx

import React, { memo, useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { Report } from "./report.types";
import { formatDistance } from "../../../utils/formatters";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Vérifie si un signalement est récent (moins de 2 jours)
 */
const isRecent = (date: string): boolean => {
  const reportDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - reportDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2;
};

// Définition des types d'icônes
interface IconType {
  name: string;
  label: string;
  color: string;
}

const ICONS: Record<string, IconType> = {
  events: {
    name: "calendar-star",
    label: "Événements",
    color: "#E43737"
  },
  danger: {
    name: "alert-octagon",
    label: "Danger",
    color: "#FF3B30"
  },
  travaux: {
    name: "hammer",
    label: "Travaux",
    color: "#FF9500"
  },
  nuisance: {
    name: "volume-high",
    label: "Nuisance",
    color: "#9C27B0"
  },
  pollution: {
    name: "factory",
    label: "Pollution",
    color: "#34C759"
  },
  reparation: {
    name: "wrench",
    label: "Reparation",
    color: "#007AFF"
  }
};

/**
 * Renvoie le composant d'icône approprié en fonction du type
 */
const getIconForType = (type: string) => {
  // Convertir le type en minuscules pour la correspondance
  const normalizedType = type.toLowerCase();
  
  // Trouver l'entrée correspondante dans ICONS
  const iconConfig = Object.entries(ICONS).find(
    ([key, _]) => key.toLowerCase() === normalizedType
  );
  
  // Si on trouve une correspondance, utiliser son nom d'icône
  if (iconConfig) {
    const [_, config] = iconConfig;
    
    return (
      <MaterialCommunityIcons
        name={config.name}
        size={26}
        color="white"
        style={{marginRight: 6}} // Style inline pour éviter les problèmes de typage
      />
    );
  }
  
  // Fallback sur l'icône par défaut si aucune correspondance
  return (
    <MaterialIcons
      name="error-outline"
      size={12}
      color="white"
      style={{marginRight: 6}} // Style inline pour éviter les problèmes de typage
    />
  );
};

/**
 * Calcule la gravité du signalement basée sur le type et la date
 * @returns Valeur entre 1-3 (1: faible, 2: moyen, 3: élevé)
 */
const calculateSeverity = (type: string, date: string): number => {
  // Les types plus urgents ont une gravité plus élevée
  const typeWeight: Record<string, number> = {
    nuisance: 1,
    infrastructure: 1,
    securite: 3,
    environnement: 2,
    autre: 1,
  };

  // Les signalements récents sont considérés plus urgents
  const isRecentReport = isRecent(date);

  // Calcul basé sur le type et la récence
  const typeScore = typeWeight[type] || 1;
  const recencyBonus = isRecentReport ? 1 : 0;

  // Calcul final (valeur entre 1-3)
  const severity = Math.min(Math.max(typeScore + recencyBonus - 1, 1), 3);

  return severity;
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
 * Carte de signalement avec design avant-gardiste et animations avancées
 */
const ReportItem: React.FC<ReportItemProps> = memo(
  ({
    report,
    onPress,
    typeLabel,
    typeColor,
    backgroundColor,
    formattedCity,
    formattedTime,
  }) => {
    // Animations référence
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardBlurAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // État pour gérer les images multiples
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Indicateurs calculés
    const severity = calculateSeverity(report.type, report.createdAt);
    const distanceText = formatDistance(report.distance);
    const hasMultiplePhotos = report.photos && report.photos.length > 1;

    // Animations interpolées
    const distanceBadgeScale = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.15],
    });

    const newBadgeRotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["-2deg", "2deg"],
    });

    const cardBlur = cardBlurAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 5],
    });

    const glowOpacity = glowAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.6],
    });

    // Animations d'entrée et pulsations
    useEffect(() => {
      // Pulsation pour l'indicateur de distance
      const pulseSequence = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.sin),
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulseSequence).start();

      // Effet de glowing pour les signalements avec haute sévérité
      if (severity >= 3) {
        const glowSequence = Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]);

        Animated.loop(glowSequence).start();
      }

      // Animation d'entrée
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de rotation pour l'indicateur "Nouveau"
      if (isRecent(report.createdAt)) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 1200,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }, []);

    // Navigation entre les photos (si multiples)
    const nextPhoto = useCallback(() => {
      if (report.photos && report.photos.length > 1) {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === report.photos.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, [report.photos]);

    const prevPhoto = useCallback(() => {
      if (report.photos && report.photos.length > 1) {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === 0 ? report.photos.length - 1 : prevIndex - 1
        );
      }
    }, [report.photos]);

    // Gestion des états de pression
    const handlePressIn = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.97,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardBlurAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePressOut = useCallback(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(cardBlurAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    // Obtenir une couleur plus foncée pour les dégradés
    const darkerColor = useCallback((color: string): string => {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      const darkerR = Math.floor(r * 0.7);
      const darkerG = Math.floor(g * 0.7);
      const darkerB = Math.floor(b * 0.7);

      return `#${darkerR.toString(16).padStart(2, "0")}${darkerG
        .toString(16)
        .padStart(2, "0")}${darkerB.toString(16).padStart(2, "0")}`;
    }, []);

    // Obtenir une couleur plus translucide pour les effets
    const fadeColor = useCallback((color: string, opacity: number): string => {
      return (
        color +
        Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, "0")
      );
    }, []);

    // Rendu des points de navigation pour les photos
    const renderPhotoDots = () => {
      if (!report.photos || report.photos.length <= 1) return null;

      return (
        <View style={styles.photoDots}>
          {report.photos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.photoDot,
                index === currentImageIndex && styles.activePhotoDot,
              ]}
            />
          ))}
        </View>
      );
    };

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Effet de glow pour les signalements urgents */}
        {severity >= 3 && (
          <Animated.View
            style={[
              styles.urgentGlow,
              {
                backgroundColor: darkerColor(typeColor),
                opacity: glowOpacity,
              },
            ]}
          />
        )}

        {/* Carte principale avec ombre et effet glassmorphic */}
        <View style={styles.cardWrapper}>
          <TouchableOpacity
            style={styles.reportCard}
            onPress={() => onPress(report.id)}
            activeOpacity={0.95}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {/* Partie supérieure avec média et badges */}
            <View style={styles.cardMediaSection}>
              {/* Overlay de couleur avec dégradé personnalisé */}
              <LinearGradient
                colors={[`${typeColor}30`, `${typeColor}15`]}
                style={styles.mediaOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />

              {/* Image du signalement ou fallback */}
              {report.photos &&
              Array.isArray(report.photos) &&
              report.photos.length > 0 ? (
                <>
                  <Image
                    source={{ uri: report.photos[currentImageIndex].url }}
                    style={styles.reportImage}
                    resizeMode="cover"
                  />

                  {/* Contrôles de navigation des photos (si multiples) */}
                  {hasMultiplePhotos && (
                    <>
                      <TouchableOpacity
                        style={[styles.photoNavButton, styles.prevPhotoButton]}
                        onPress={prevPhoto}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.3)"]}
                          style={styles.photoNavGradient}
                        >
                          <Ionicons
                            name="chevron-back"
                            size={20}
                            color="#FFFFFF"
                          />
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.photoNavButton, styles.nextPhotoButton]}
                        onPress={nextPhoto}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.3)"]}
                          style={styles.photoNavGradient}
                        >
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#FFFFFF"
                          />
                        </LinearGradient>
                      </TouchableOpacity>

                      {renderPhotoDots()}
                    </>
                  )}
                </>
              ) : (
                <View style={styles.noPhotoContainer}>
                  <View style={styles.noPhotoIconContainer}>
                    <LinearGradient
                      colors={[
                        `${fadeColor(typeColor, 0.2)}`,
                        `${fadeColor(typeColor, 0.05)}`,
                      ]}
                      style={styles.noPhotoGradient}
                    >
                      <MaterialIcons
                        name="image-not-supported"
                        size={32}
                        color="#A0A0A0"
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.noPhotoText}>
                    Aucune image disponible
                  </Text>
                </View>
              )}

              {/* Badge du type de signalement */}
              <View style={styles.typeBadgeContainer}>
                <LinearGradient
                  colors={[typeColor, darkerColor(typeColor)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.typeBadge}
                >
                  {getIconForType(report.type)}
                  <Text style={styles.typeBadgeText}>{typeLabel}</Text>
                </LinearGradient>
              </View>

              {/* Badge de distance avec animation */}
              <Animated.View
                style={[
                  styles.distanceBadge,
                  { transform: [{ scale: distanceBadgeScale }] },
                ]}
              >
                <LinearGradient
                  colors={["rgba(0, 0, 0, 0.86)", "rgba(20, 20, 20, 0.95)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.distanceBadgeContent}
                >
                  <MaterialIcons
                    name="location-on"
                    size={14}
                    color="white"
                    style={{marginRight: 4}}
                  />
                  <Text style={styles.distanceBadgeText}>{distanceText}</Text>
                </LinearGradient>
              </Animated.View>

              {/* Marqueur de nouveauté avec animation */}
              {isRecent(report.createdAt) && (
                <Animated.View
                  style={[
                    styles.newMarkerContainer,
                    { transform: [{ rotate: newBadgeRotate }] },
                  ]}
                >
                  <LinearGradient
                    colors={["#FF5252", "#FF3D71"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.newMarker}
                  >
                    <Text style={styles.newMarkerText}>Nouveau</Text>
                    <Ionicons
                      name="time"
                      size={12}
                      color="white"
                      style={{ marginLeft: 4 }}
                    />
                  </LinearGradient>
                </Animated.View>
              )}
            </View>

            {/* Partie inférieure avec informations et actions */}
            <View style={styles.cardContentSection}>
              {/* En-tête avec titre et métriques */}
              <View style={styles.contentHeader}>
                <Text style={styles.reportTitle} numberOfLines={2}>
                  {report.title}
                </Text>
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Ionicons name="thumbs-up" size={14} color="#4CAF50" />
                    <Text style={styles.metricText}>
                      {report.upVotes} smarter approuve
                      {report.upVotes > 1 ? "nt" : ""}
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Ionicons name="thumbs-down" size={14} color="#F44336" />
                    <Text style={styles.metricText}>
                      {report.downVotes} contestation
                      {report.downVotes !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Barre de séparation avec dégradé */}
              <View style={styles.dividerContainer}>
                <LinearGradient
                  colors={[
                    fadeColor(typeColor, 0.05),
                    fadeColor(typeColor, 0.3),
                    fadeColor(typeColor, 0.05),
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.divider}
                />
              </View>

              {/* Métadonnées du signalement */}
              <View style={styles.metadataContainer}>
                {/* Localisation avec animation de pulsation */}
                <View style={styles.metadataRow}>
                  <View style={styles.metadataIcon}>
                    <LinearGradient
                      colors={[
                        fadeColor(typeColor, 0.15),
                        fadeColor(typeColor, 0.05),
                      ]}
                      style={styles.iconBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialIcons
                        name="location-on"
                        size={15}
                        color={darkerColor(typeColor)}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.metadataText} numberOfLines={1}>
                    {formattedCity}
                  </Text>
                </View>

                {/* Horodatage */}
                <View style={styles.metadataRow}>
                  <View style={styles.metadataIcon}>
                    <LinearGradient
                      colors={[
                        fadeColor(typeColor, 0.15),
                        fadeColor(typeColor, 0.05),
                      ]}
                      style={styles.iconBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialIcons
                        name="access-time"
                        size={15}
                        color={darkerColor(typeColor)}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.metadataText}>{formattedTime}</Text>
                </View>
              </View>

              {/* Actions disponibles */}
              <View style={styles.actionsContainer}>
                {/* Bouton principal */}
                <TouchableOpacity
                  style={styles.primaryActionButton}
                  activeOpacity={0.8}
                  onPress={() => onPress(report.id)}
                >
                  <LinearGradient
                    colors={[typeColor, darkerColor(typeColor)]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryActionGradient}
                  >
                    <Text style={styles.primaryActionText}>Voir détails</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={16}
                      color="white"
                      style={{ marginLeft: 8 }}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Boutons secondaires */}
                <View style={styles.secondaryActions}>
                  <TouchableOpacity style={styles.iconButton}>
                    <LinearGradient
                      colors={["#F5F5F5", "#EEEEEE"]}
                      style={styles.iconButtonGradient}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={18}
                        color="#555555"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);

// Définition des styles avec les typages corrects
interface Styles {
  cardContainer: ViewStyle;
  urgentGlow: ViewStyle;
  cardWrapper: ViewStyle;
  reportCard: ViewStyle;
  cardMediaSection: ViewStyle;
  cardContentSection: ViewStyle;
  mediaOverlay: ViewStyle;
  reportImage: ImageStyle;
  photoNavButton: ViewStyle;
  prevPhotoButton: ViewStyle;
  nextPhotoButton: ViewStyle;
  photoNavGradient: ViewStyle;
  photoDots: ViewStyle;
  photoDot: ViewStyle;
  activePhotoDot: ViewStyle;
  noPhotoContainer: ViewStyle;
  noPhotoIconContainer: ViewStyle;
  noPhotoGradient: ViewStyle;
  noPhotoText: TextStyle;
  typeBadgeContainer: ViewStyle;
  typeBadge: ViewStyle;
  // Suppression de typeBadgeIcon qui posait problème
  typeBadgeText: TextStyle;
  distanceBadge: ViewStyle;
  distanceBadgeContent: ViewStyle;
  // Suppression de distanceBadgeIcon qui posait problème
  distanceBadgeText: TextStyle;
  severityContainer: ViewStyle;
  statusContainer: ViewStyle;
  statusBadge: ViewStyle;
  statusDot: ViewStyle;
  statusText: TextStyle;
  newMarkerContainer: ViewStyle;
  newMarker: ViewStyle;
  newMarkerText: TextStyle;
  contentHeader: ViewStyle;
  reportTitle: TextStyle;
  metricsContainer: ViewStyle;
  metricItem: ViewStyle;
  metricDivider: ViewStyle;
  metricText: TextStyle;
  dividerContainer: ViewStyle;
  divider: ViewStyle;
  metadataContainer: ViewStyle;
  metadataRow: ViewStyle;
  metadataIcon: ViewStyle;
  iconBackground: ViewStyle;
  metadataText: TextStyle;
  actionsContainer: ViewStyle;
  primaryActionButton: ViewStyle;
  primaryActionGradient: ViewStyle;
  primaryActionText: TextStyle;
  secondaryActions: ViewStyle;
  iconButton: ViewStyle;
  iconButtonGradient: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  // Tous les styles...
  cardContainer: {
    width: SCREEN_WIDTH - 30,
    alignSelf: "center",
    marginVertical: 8,
    position: "relative",
  },
  urgentGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 32,
    zIndex: -1,
    ...Platform.select({
      ios: {
        shadowColor: "#FF3D71",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  // Suite de tous les styles comme dans votre code original...
  // J'ai supprimé les styles typeBadgeIcon et distanceBadgeIcon car nous utilisons des styles inline
  cardWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
  },
  cardMediaSection: {
    height: 200,
    position: "relative",
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  reportImage: {
    width: "100%",
    height: "100%",
    zIndex: 2,
  },
  photoNavButton: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
    overflow: "hidden",
  },
  prevPhotoButton: {
    left: 12,
  },
  nextPhotoButton: {
    right: 12,
  },
  photoNavGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  photoDots: {
    position: "absolute",
    bottom: 12,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 4,
  },
  photoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activePhotoDot: {
    width: 16,
    backgroundColor: "#FFFFFF",
  },
  noPhotoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    zIndex: 2,
  },
  noPhotoIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  noPhotoGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  noPhotoText: {
    color: "#757575",
    fontSize: 14,
    fontWeight: "500",
  },
  typeBadgeContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 3,
    overflow: "hidden",
    borderBottomRightRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomRightRadius: 24,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
    marginRight: 8,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 3,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  distanceBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  statusContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    zIndex: 3,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 12,
  },
  newMarkerContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 3,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#FF3D71",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  newMarker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomLeftRadius: 24,
  },
  newMarkerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  cardContentSection: {
    padding: 20,
  },
  contentHeader: {
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 12,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  metricsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  metricText: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 4,
  },
  dividerContainer: {
    paddingVertical: 4,
  },
  divider: {
    height: 2,
    borderRadius: 1,
  },
  metadataContainer: {
    marginVertical: 16,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metadataIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
  },
  iconBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  metadataText: {
    fontSize: 14,
    color: "#424242",
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryActionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  primaryActionGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  secondaryActions: {
    flexDirection: "row",
    marginLeft: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ReportItem;