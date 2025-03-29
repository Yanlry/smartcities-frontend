import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { getUserIdFromToken } from '../../../utils/tokenUtils';
// @ts-ignore
import { API_URL } from "@env";

/**
 * Interface pour les propriétés du composant ProfilePhotoModal
 */
interface ProfilePhotoModalProps {
  visible: boolean;
  onClose: () => void;
  currentPhotoUrl?: string | null;
  onSuccess?: () => void; // Callback appelé après une mise à jour réussie
  photoUrl?: string;


  username: string;

  createdAt?: string;

  isSubmitting: boolean;

  isFollowing: boolean;

  onFollow: () => Promise<void>;

  onUnfollow: () => Promise<void>;

  ranking?: number; 
}

/**
 * Modal permettant la mise à jour de la photo de profil utilisateur
 * Intègre les fonctionnalités de prise de photo, sélection depuis la galerie, et suppression
 */
const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  visible,
  onClose,
  currentPhotoUrl,
  onSuccess,
}) => {
  // États locaux pour gérer le chargement et les erreurs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Réinitialiser l'erreur quand le modal est ouvert
  useEffect(() => {
    if (visible) {
      setError(null);
    }
  }, [visible]);

  /**
   * Traitement d'une photo sélectionnée ou prise
   * @param photoUri URI de la photo à traiter
   */
  const processSelectedPhoto = useCallback(async (photoUri: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Création du FormData pour l'envoi de l'image
      const formData = new FormData();
      
      // Obtenir l'extension du fichier
      const fileExtension = photoUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';
      
      // Ajouter l'image au formData
      formData.append("profileImage", {
        uri: photoUri,
        type: mimeType,
        name: `profile.${fileExtension}`,
      } as any);

      console.log("Préparation de l'envoi avec URI:", photoUri.substring(0, 50) + "...");
      
      // Récupérer l'ID utilisateur
      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error("ID utilisateur non trouvé. Veuillez vous reconnecter.");
      }

      // Envoi de la requête
      const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log("Statut de la réponse:", response.status);

      // Gestion des erreurs de la requête
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur de réponse:", errorText);
        throw new Error(`Échec de la mise à jour (${response.status}): ${errorText}`);
      }

      // Analyse de la réponse
      const result = await response.json();
      console.log("Mise à jour réussie:", result);

      // Notification du succès
      if (onSuccess) {
        onSuccess();
      }
      
      // Fermeture du modal
      onClose();
    } catch (err: any) {
      // Gestion des erreurs
      const errorMessage = err.message || "Une erreur inconnue s'est produite";
      console.error("Erreur lors du traitement de la photo:", errorMessage);
      setError(errorMessage);
      
      // Afficher une alerte à l'utilisateur
      Alert.alert(
        "Erreur",
        `Impossible de mettre à jour la photo: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [onClose, onSuccess]);

  /**
   * Handler pour la prise de photo avec l'appareil photo
   */
  const handleTakePhoto = useCallback(async () => {
    try {
      // Demande de permission
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.status !== 'granted') {
        Alert.alert(
          "Permission requise",
          "L'application a besoin d'accéder à votre appareil photo pour prendre une photo de profil."
        );
        return;
      }
      
      // Lancement de l'appareil photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      // Traitement du résultat
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await processSelectedPhoto(photoUri);
      }
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      setError("Impossible d'utiliser l'appareil photo");
    }
  }, [processSelectedPhoto]);

  /**
   * Handler pour la sélection d'image depuis la galerie
   */
  const handleChooseFromGallery = useCallback(async () => {
    try {
      // Demande de permission
      const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (mediaLibraryPermission.status !== 'granted') {
        Alert.alert(
          "Permission requise",
          "L'application a besoin d'accéder à votre galerie pour sélectionner une photo de profil."
        );
        return;
      }
      
      // Lancement de la galerie
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      // Traitement du résultat
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        await processSelectedPhoto(photoUri);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de la photo:', error);
      setError("Impossible d'accéder à la galerie");
    }
  }, [processSelectedPhoto]);

  /**
   * Handler pour la suppression de la photo de profil
   */
  const handleRemovePhoto = useCallback(async () => {
    try {
      // Confirmation avant suppression
      Alert.alert(
        "Supprimer la photo",
        "Êtes-vous sûr de vouloir supprimer votre photo de profil ?",
        [
          { text: "Annuler", style: "cancel" },
          { 
            text: "Supprimer", 
            style: "destructive",
            onPress: async () => {
              try {
                setIsLoading(true);
                setError(null);
                
                // Récupération de l'ID utilisateur
                const userId = await getUserIdFromToken();
                if (!userId) {
                  throw new Error("ID utilisateur non trouvé");
                }
                
                // Envoi de la requête de suppression
                const response = await fetch(`${API_URL}/users/${userId}/profile-image`, {
                  method: "DELETE",
                });
                
                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(`Échec de la suppression: ${errorText}`);
                }
                
                // Notification du succès
                if (onSuccess) {
                  onSuccess();
                }
                
                // Fermeture du modal
                onClose();
              } catch (error: any) {
                console.error('Erreur lors de la suppression:', error);
                setError(error.message || "Erreur lors de la suppression");
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la préparation de la suppression:', error);
      setError("Erreur lors de l'initialisation de la suppression");
    }
  }, [onClose, onSuccess]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={Platform.OS === 'ios' ? 50 : 100} style={styles.blurContainer}>
          <View style={styles.modalContent}>
            {/* Header avec titre et bouton de fermeture */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Photo de profil</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                disabled={isLoading}
              >
                <FontAwesome5 name="times" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Affichage de l'image actuelle ou placeholder */}
            <View style={styles.photoPreviewContainer}>
              <LinearGradient
                colors={['#8E2DE2', '#4A00E0']}
                style={styles.photoGradientBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {currentPhotoUrl ? (
                  <Image 
                    source={{ uri: currentPhotoUrl }} 
                    style={styles.photoPreview}
                    defaultSource={require('../../../assets/images/1.jpg')}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <FontAwesome5 name="user" size={40} color="#CED4DA" />
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Affichage d'erreur éventuelle */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Boutons d'action */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleTakePhoto}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#0F84FE', '#0A64CE']}
                  style={[
                    styles.actionButtonGradient,
                    isLoading && styles.disabledButton
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <FontAwesome5 name="camera" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Prendre une photo</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleChooseFromGallery}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#0F84FE', '#0A64CE']}
                  style={[
                    styles.actionButtonGradient,
                    isLoading && styles.disabledButton
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                >
                  <FontAwesome5 name="images" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Choisir dans la galerie</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Indicateur de chargement */}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#8E2DE2" />
                <Text style={styles.loadingText}>Mise à jour en cours...</Text>
              </View>
            )}
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  blurContainer: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalContent: {
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    padding: 20,
    borderRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoGradientBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: '#1E1E1E',
  },
  photoPlaceholder: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 76, 76, 0.3)',
  },
  errorText: {
    color: '#FF4C4C',
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    gap: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  removeButton: {
    marginTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
});

export default ProfilePhotoModal;