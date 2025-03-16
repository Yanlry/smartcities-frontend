import React, { useCallback, memo } from 'react';
import { View, TouchableOpacity, ScrollView, Text, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PhotoItem from './PhotoItem';
import { PhotoManagerProps } from './types';

const PhotoManager: React.FC<PhotoManagerProps> = memo(({ 
  photos, 
  setPhotos, 
  maxPhotos = 7 
}) => {
  const handleSelectPhotos = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission requise",
          "Vous devez autoriser l'accès à vos photos."
        );
        return;
      }

      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Limite atteinte",
          `Vous pouvez sélectionner jusqu'à ${maxPhotos} photo(s) maximum. Veuillez en supprimer pour en ajouter de nouvelles.`
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const validPhotos = result.assets.filter((photo) => {
          if (photo.fileSize && photo.fileSize > 10 * 1024 * 1024) {
            Alert.alert(
              "Fichier trop volumineux",
              `${photo.fileName || "Un fichier"} dépasse la limite de 10 Mo et a été ignoré.`
            );
            return false;
          }
          return true;
        });

        let newPhotos = [...photos, ...validPhotos];

        if (newPhotos.length > maxPhotos) {
          Alert.alert(
            "Limite atteinte",
            `Vous pouvez sélectionner jusqu'à ${maxPhotos} photo(s) maximum.`
          );
          newPhotos = newPhotos.slice(0, maxPhotos);
        }

        setPhotos(newPhotos);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection des images :", error);
    }
  }, [photos, maxPhotos, setPhotos]);

  const handleRemovePhoto = useCallback((index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  }, [photos, setPhotos]);

  return (
    <View style={styles.containerPhoto}>
      <ScrollView horizontal style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <PhotoItem 
            key={index} 
            photo={photo as ImagePicker.ImagePickerAsset} 
            onRemove={() => handleRemovePhoto(index)} 
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleSelectPhotos}>
        <Text style={styles.buttonText}>Ajouter des photos</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  containerPhoto: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "75%",
    height: 40,
    backgroundColor: "#062C41",
    shadowColor: "#062C41",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  photoContainer: {
    width: "100%",
    marginBottom: 20,
  },
});

export default PhotoManager;