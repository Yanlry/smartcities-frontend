// Chemin : components/interactions/PhotoManager.tsx

import React, { useCallback, memo, useState, useEffect, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Text, 
  Alert, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  Easing,
  Image,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PhotoManagerProps } from './types';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = 140;
const UPLOAD_ICON_SIZE = 32;

const PhotoManager: React.FC<PhotoManagerProps> = memo(({ 
  photos = [], 
  setPhotos, 
  maxPhotos = 7 
}) => {
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<boolean | null>(null);
  
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const loadingRotation = useRef(new Animated.Value(0)).current;
  
  // Vérification des permissions au chargement
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      setPermissionStatus(status === 'granted');
    })();
  }, []);
  
  // Animation de pulsation pour le bouton d'ajout
  useEffect(() => {
    if (photos.length < maxPhotos) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    } else {
      // Arrêt de l'animation si max photos atteint
      bounceAnim.setValue(0);
    }
  }, [photos.length, maxPhotos]);
  
  // Animation de rotation pour l'indicateur de chargement
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(loadingRotation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingRotation.setValue(0);
    }
  }, [loading]);
  
  // Animation lors de la pression du bouton
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.elastic(1.5),
      }),
    ]).start();
  };
  
  // Animation lors de la suppression d'une photo
  const animatePhotoRemoval = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
      callback();
    });
  };

  // Sélection des photos depuis la galerie
  const handleSelectPhotos = useCallback(async () => {
    if (photos.length >= maxPhotos) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Limite atteinte",
        `Vous pouvez sélectionner jusqu'à ${maxPhotos} photo(s) maximum.`,
        [{ text: "Compris" }]
      );
      return;
    }
    
    try {
      animateButtonPress();
      
      // Vérification des permissions
      if (!permissionStatus) {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert(
            "Accès refusé",
            "Pour ajouter des photos, veuillez autoriser l'accès à votre bibliothèque dans les paramètres de votre appareil.",
            [
              { text: "Annuler" },
              { 
                text: "Paramètres", 
                onPress: () => {
                  // Cette fonction ouvrirait idéalement les paramètres, 
                  // mais nécessiterait Linking ou une autre solution
                }
              }
            ]
          );
          return;
        }
        
        setPermissionStatus(true);
      }
      
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
        allowsMultipleSelection: maxPhotos > 1 && photos.length < maxPhotos - 1,
        selectionLimit: maxPhotos - photos.length,
      });
      
      if (!result.canceled) {
        // Validation de la taille des fichiers
        const validPhotos = result.assets.filter((photo) => {
          if (photo.fileSize && photo.fileSize > 5 * 1024 * 1024) {
            Alert.alert(
              "Fichier trop volumineux",
              `${photo.fileName || "Une image"} dépasse la limite de 5 Mo.`,
              [{ text: "OK" }]
            );
            return false;
          }
          return true;
        });
        
        if (validPhotos.length > 0) {
          let newPhotos = [...photos, ...validPhotos];
          
          // Limitation du nombre total de photos
          if (newPhotos.length > maxPhotos) {
            newPhotos = newPhotos.slice(0, maxPhotos);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(
              "Limite atteinte",
              `Seule${maxPhotos > 1 ? 's' : ''} les ${maxPhotos} première${maxPhotos > 1 ? 's' : ''} photo${maxPhotos > 1 ? 's ont' : ' a'} été ${maxPhotos > 1 ? 'conservées' : 'conservée'}.`
            );
          }
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPhotos(newPhotos);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection des images :", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la sélection des photos."
      );
    } finally {
      setLoading(false);
    }
  }, [photos, maxPhotos, setPhotos, permissionStatus]);

  // Suppression d'une photo
  const handleRemovePhoto = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animatePhotoRemoval(() => {
      const updatedPhotos = photos.filter((_, i) => i !== index);
      setPhotos(updatedPhotos);
    });
  }, [photos, setPhotos]);

  // Transformation de la rotation pour l'animation de chargement
  const spin = loadingRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Transformation de l'échelle pour l'animation de pulsation
  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05]
  });

  // Rendu conditionnel selon le mode maxPhotos=1 (avatar) ou plusieurs photos
  if (maxPhotos === 1) {
    // Mode avatar (une seule photo)
    return (
      <Animated.View 
        style={[
          styles.avatarContainer,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSelectPhotos}
          style={styles.avatarButton}
        >
          {photos.length > 0 ? (
            // Affichage de l'avatar sélectionné
            <View style={styles.avatarImageContainer}>
              <Image 
                source={{ uri: photos[0].uri }} 
                style={styles.avatarImage} 
                resizeMode="cover"
              />
              <BlurView intensity={90} tint="dark" style={styles.avatarOverlay}>
                <MaterialCommunityIcons name="pencil" size={24} color="#ffffff" />
              </BlurView>
            </View>
          ) : loading ? (
            // Affichage du chargement
            <View style={styles.avatarPlaceholder}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size="large" color="#6366f1" />
              </Animated.View>
            </View>
          ) : (
            // Affichage du placeholder pour ajout
            <Animated.View 
              style={[
                styles.avatarPlaceholder,
                { transform: [{ scale: bounceScale }] }
              ]}
            >
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.7)', 'rgba(99, 102, 241, 0.9)']}
                style={styles.avatarGradient}
              >
                <Ionicons name="camera" size={UPLOAD_ICON_SIZE} color="#ffffff" />
                <Text style={styles.avatarText}>Ajouter photo</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </TouchableOpacity>
        
        {/* Bouton de suppression si une photo est sélectionnée */}
        {photos.length > 0 && (
          <TouchableOpacity
            style={styles.removeAvatarButton}
            onPress={() => handleRemovePhoto(0)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ef4444', '#b91c1c']}
              style={styles.removeButtonGradient}
            >
              <Ionicons name="trash" size={14} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  } else {
    // Mode galerie (plusieurs photos)
    return (
      <View style={styles.containerPhoto}>
        {/* Galerie de photos */}
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <Animated.View 
              key={`photo-${index}-${photo.uri}`} 
              style={[
                styles.photoItem,
                { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
              ]}
            >
              <Image
                source={{ uri: photo.uri }}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <LinearGradient
                  colors={['#ef4444', '#b91c1c']}
                  style={styles.removeButtonGradient}
                >
                  <Ionicons name="close" size={16} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
          
          {/* Bouton d'ajout si limite non atteinte */}
          {photos.length < maxPhotos && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSelectPhotos}
              style={styles.addPhotoButton}
            >
              <Animated.View 
                style={[
                  styles.addButtonInner,
                  { transform: [{ scale: bounceScale }] }
                ]}
              >
                {loading ? (
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <ActivityIndicator size="small" color="#6366f1" />
                  </Animated.View>
                ) : (
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.7)', 'rgba(99, 102, 241, 0.9)']}
                    style={styles.addButtonGradient}
                  >
                    <Ionicons name="add" size={24} color="#ffffff" />
                  </LinearGradient>
                )}
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Compteur de photos */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {photos.length}/{maxPhotos} photos
          </Text>
        </View>
        
        {/* Bouton principal pour ajouter des photos */}
        <TouchableOpacity
          style={[
            styles.addButton,
            photos.length >= maxPhotos && styles.buttonDisabled
          ]}
          onPress={handleSelectPhotos}
          disabled={photos.length >= maxPhotos || loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={photos.length < maxPhotos ? ['#6366f1', '#4f46e5'] : ['#94a3b8', '#cbd5e1']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ActivityIndicator size="small" color="#ffffff" />
              </Animated.View>
            ) : (
              <>
                <Text style={styles.buttonText}>
                  {photos.length === 0 
                    ? "Ajouter des photos" 
                    : photos.length >= maxPhotos 
                      ? "Maximum atteint" 
                      : "Ajouter plus de photos"
                  }
                </Text>
                <Ionicons 
                  name={photos.length >= maxPhotos ? "checkmark-done" : "images"} 
                  size={20} 
                  color="#ffffff" 
                  style={styles.buttonIcon}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
});

const styles = StyleSheet.create({
  // Styles communs
  buttonDisabled: {
    opacity: 0.7,
  },
  
  // Styles pour le mode avatar (une seule photo)
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  
  // Styles pour le mode galerie (plusieurs photos)
  containerPhoto: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 5,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 10,
  },
  photoItem: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
  },
  removeButtonGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  addPhotoButton: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    margin: 5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  addButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  counterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    width: '80%',
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 10,
  },
  buttonGradient: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});

export default PhotoManager;