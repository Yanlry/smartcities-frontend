// src/components/interactions/ReportDetails/PhotoGallery.tsx

import React, { memo, useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Photo } from "../../../types/entities/photo.types";

const { width, height } = Dimensions.get("window");

/**
 * Système de couleurs raffiné avec dégradés subtils et tonalités élégantes
 */
const COLORS = {
  // Palette primaire - Bleus profonds et subtils
  primary: {
    main: "#2563EB",
    dark: "#1D4ED8",
    light: "#60A5FA",
    ghost: "rgba(37, 99, 235, 0.08)",
    subtle: "rgba(37, 99, 235, 0.15)",
  },
  
  // Palette secondaire - Dégradés sophistiqués
  secondary: {
    main: "#3B82F6",
    dark: "#1E40AF",
    light: "#93C5FD",
    ghost: "rgba(59, 130, 246, 0.08)",
  },
  
  // Palette accent - Touches visuelles douces
  accent: {
    main: "#06B6D4",
    dark: "#0E7490",
    light: "#67E8F9",
    ghost: "rgba(6, 182, 212, 0.08)",
  },
  
  // Palette tertiaire - Pour la variété et l'équilibre
  tertiary: {
    violet: "#8B5CF6",
    rose: "#F43F5E",
    amber: "#F59E0B",
    emerald: "#10B981",
  },
  
  // États et feedback
  state: {
    success: "#16A34A",
    warning: "#F97316",
    error: "#DC2626",
    info: "#0284C7",
  },
  
  // Échelle de gris raffinée
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  
  // Effets transparents
  glass: {
    white: "rgba(255, 255, 255, 0.95)",
    light: "rgba(255, 255, 255, 0.85)",
    card: "rgba(255, 255, 255, 0.75)",
    border: "rgba(255, 255, 255, 0.12)",
  },
  
  // Couleurs modales
  modal: {
    backdrop: "rgba(17, 24, 39, 0.85)",
    element: "rgba(31, 41, 55, 0.7)",
    border: "rgba(255, 255, 255, 0.15)",
  },
};

/**
 * Système d'ombres raffiné avec différents niveaux d'élévation
 */
const SHADOWS = {
  // Ombres adaptées par plateforme
  sm: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
  }),
  
  // Ombre pour les cartes avec effet float
  float: Platform.select({
    ios: {
      shadowColor: COLORS.gray[900],
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
};

/**
 * Système d'animation sophistiqué avec courbes et timing optimisés
 */
const ANIMATIONS = {
  duration: {
    fast: 180,
    medium: 250,
    slow: 400,
  },
  
  // Courbes d'accélération sophistiquées
  easing: {
    // Standard Material Design easing
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    // Pour les entrées et apparitions
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    // Pour les sorties et disparitions
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    // Pour les rebonds subtils
    gentle: Easing.bezier(0.34, 1.56, 0.64, 1),
  },
  
  // Helpers pour simplifier l'usage des animations
  helpers: {
    fadeIn: (value, duration = 250, delay = 0, easing = Easing.bezier(0.0, 0.0, 0.2, 1)) => 
      Animated.timing(value, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
      
    fadeOut: (value, duration = 200, delay = 0) =>
      Animated.timing(value, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.bezier(0.4, 0.0, 1, 1),
        useNativeDriver: true,
      }),
    
    scale: (value, fromValue = 0.97, toValue = 1, duration = 250, delay = 0) => {
      value.setValue(fromValue);
      return Animated.timing(value, {
        toValue,
        duration,
        delay,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Subtle bounce
        useNativeDriver: true,
      });
    },
    
    scaleDown: (value, toValue = 0.97, duration = 200) =>
      Animated.timing(value, {
        toValue,
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
  },
};

/**
 * Composant individuel de miniature pour éviter les problèmes de hooks
 */
interface PhotoThumbnailItemProps {
  photo: Photo;
  index: number;
  isSelected: boolean;
  onPress: () => void;
  delay?: number;
}

const PhotoThumbnailItem = memo(({ 
  photo, 
  index, 
  isSelected, 
  onPress,
  delay = 0 
}: PhotoThumbnailItemProps) => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.medium,
        delay: 100 + delay,
        easing: ANIMATIONS.easing.decelerate,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: ANIMATIONS.duration.medium,
        delay: 100 + delay,
        easing: ANIMATIONS.easing.gentle,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={[
          styles.photoContainer,
          isSelected && styles.selectedPhotoContainer
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.thumbnailWrapper}>
          <Image
            source={{ uri: photo.url }}
            style={styles.photoThumbnail}
            resizeMode="cover"
          />
          {isSelected && (
            <View style={styles.selectedOverlay}>
              <View style={styles.selectedIcon}>
                <Icon name="checkmark" size={14} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>
        <View style={styles.thumbnailFooter}>
          <Text style={styles.thumbnailLabel}>Photo {index + 1}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

interface PhotoThumbnailsProps {
  photos: Photo[];
  onPhotoPress: (index: number) => void;
}

/**
 * Composant de miniatures de photos
 * Affiche une rangée horizontale des photos avec sélection
 */
const PhotoThumbnails = memo(({ photos, onPhotoPress }: PhotoThumbnailsProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  
  // Animation globale pour le conteneur
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATIONS.duration.medium,
      delay: 100,
      easing: ANIMATIONS.easing.decelerate,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Gestionnaire de pression sur une photo
  const handlePhotoPress = (index: number) => {
    setSelectedPhoto(index);
    onPhotoPress(index);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailsContainer}
        renderItem={({ item, index }) => (
          <PhotoThumbnailItem
            photo={item}
            index={index}
            isSelected={selectedPhoto === index}
            onPress={() => handlePhotoPress(index)}
            delay={index * 50} // Délai progressif
          />
        )}
      />
    </Animated.View>
  );
});

interface PhotoViewerModalProps {
  visible: boolean;
  photos: Photo[];
  initialIndex: number | null;
  onClose: () => void;
}

/**
 * Modal de visualisation des photos en plein écran
 * Avec animations et navigation entre les photos
 */
const PhotoViewerModal = memo(({ visible, photos, initialIndex, onClose }: PhotoViewerModalProps) => {
  // Animations pour le modal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Référence pour le FlatList
  const flatListRef = useRef<FlatList>(null);
  
  // Index actuel pour le suivi de la photo affichée
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex || 0);
  
  // Animation d'entrée/sortie du modal
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
        ANIMATIONS.helpers.scale(scaleAnim, 0.95, 1, ANIMATIONS.duration.medium),
      ]).start();
    } else {
      Animated.parallel([
        ANIMATIONS.helpers.fadeOut(fadeAnim, ANIMATIONS.duration.fast),
        ANIMATIONS.helpers.scaleDown(scaleAnim, 0.95, ANIMATIONS.duration.fast),
      ]).start();
    }
  }, [visible]);
  
  // Mise à jour de l'index actuel quand le modal s'ouvre
  useEffect(() => {
    if (visible && initialIndex !== null) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  // Gestionnaire de défilement pour mettre à jour l'index actuel
  const handleScroll = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  if (!visible || initialIndex === null || !photos.length) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={onClose}
        >
          {/* Bouton de fermeture */}
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={onClose}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View style={styles.closeButtonCircle}>
              <Icon name="close" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          {/* Galerie de photos */}
          <Animated.View 
            style={[
              styles.photoContent,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <FlatList
              ref={flatListRef}
              data={photos}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              initialScrollIndex={initialIndex}
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScroll}
              scrollEventThrottle={16}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.modalPhotoContainer}>
                  <Image
                    source={{ uri: item.url }}
                    style={styles.modalPhoto}
                    resizeMode="contain"
                  />
                </View>
              )}
            />
          </Animated.View>
          
          {/* Indicateur de photo */}
          <View style={styles.photoIndicator}>
            <View style={styles.photoIndicatorBadge}>
              <View style={styles.photoIndicatorContent}>
                <Icon name="images-outline" size={14} color="#FFFFFF" style={styles.photoIndicatorIcon} />
                <Text style={styles.photoIndicatorText}>
                  {currentIndex + 1}/{photos.length}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
});

interface PhotoGalleryProps {
  photos: Photo[];
  photoModalVisible: boolean;
  selectedPhotoIndex: number | null;
  openPhotoModal: (index: number) => void;
  closePhotoModal: () => void;
}

/**
 * Composant principal de galerie photo
 * Affiche les miniatures et gère le modal de visualisation
 */
const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  photoModalVisible,
  selectedPhotoIndex,
  openPhotoModal,
  closePhotoModal,
}) => {
  // Animation d'entrée pour la carte entière
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;
  
  useEffect(() => {
    Animated.parallel([
      ANIMATIONS.helpers.fadeIn(fadeAnim, ANIMATIONS.duration.medium),
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATIONS.duration.medium,
        easing: ANIMATIONS.easing.decelerate,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!photos || photos.length === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.card,
        { 
          opacity: fadeAnim,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIconWrapper}>
          <Icon name="images-outline" size={16} color={COLORS.primary.main} />
        </View>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.photoCount}>{photos.length}</Text>
      </View>
      
      <PhotoThumbnails 
        photos={photos} 
        onPhotoPress={openPhotoModal} 
      />
      
      <PhotoViewerModal
        visible={photoModalVisible}
        photos={photos}
        initialIndex={selectedPhotoIndex}
        onClose={closePhotoModal}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Styles pour la carte principale
  card: {
    borderRadius: 16,
    backgroundColor: COLORS.glass.white,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 16,
    ...SHADOWS.float,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primary.ghost,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray[800],
    letterSpacing: 0.2,
    flex: 1,
  },
  photoCount: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray[500],
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // Styles pour les miniatures
  thumbnailsContainer: {
    paddingVertical: 4,
  },
  photoContainer: {
    marginRight: 14,
    width: 135,
    ...SHADOWS.md,
  },
  selectedPhotoContainer: {
    transform: [{ scale: 1.02 }],
  },
  thumbnailWrapper: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: 135,
    height: 100,
    borderRadius: 12,
  },
  thumbnailFooter: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  thumbnailLabel: {
    fontSize: 12,
    color: COLORS.gray[600],
    fontWeight: "500",
    textAlign: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary.main,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  selectedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  
  // Styles pour le modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.modal.backdrop,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContent: {
    width: '100%',
    height: '70%',
    justifyContent: 'center',
  },
  closeModalButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 30,
    right: 20,
    zIndex: 10,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.modal.element,
    borderWidth: 1,
    borderColor: COLORS.modal.border,
    ...SHADOWS.sm,
  },
  modalPhotoContainer: {
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  modalPhoto: {
    width: width * 0.9,
    height: height * 0.7,
    borderRadius: 12,
  },
  photoIndicator: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  photoIndicatorBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.modal.element,
    borderWidth: 1,
    borderColor: COLORS.modal.border,
    ...SHADOWS.md,
  },
  photoIndicatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoIndicatorIcon: {
    marginRight: 6,
  },
  photoIndicatorText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default memo(PhotoGallery);