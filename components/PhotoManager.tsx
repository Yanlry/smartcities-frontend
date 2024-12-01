// components/PhotoManager.tsx
import React from "react";
import { View, TouchableOpacity, ScrollView, Image, Alert,Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import styles from "../screens/styles/AddNewEventScreen.styles";

const PhotoManager = ({ photos, setPhotos }) => {
 
    const handleSelectPhotos = async () => {
        try {
          const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
    
          if (!permissionResult.granted) {
            Alert.alert(
              "Permission requise",
              "Vous devez autoriser l'accès à vos photos."
            );
            return;
          }
    
          // Vérifier si l'utilisateur a déjà sélectionné 7 photos
          if (photos.length >= 7) {
            Alert.alert(
              "Limite atteinte",
              "Vous pouvez sélectionner jusqu'à 7 photos maximum, veuillez en supprimer pour en ajouter de nouvelles."
            );
            return;
          }
    
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true, // Permettre la sélection multiple
            allowsEditing: false,
            quality: 1,
          });
    
          if (!result.canceled) {
            console.log("Images sélectionnées :", result.assets);
    
            // Filtrer les photos valides (en excluant celles de taille > 10 Mo)
            const validPhotos = result.assets.filter((photo) => {
              if (photo.fileSize && photo.fileSize > 10 * 1024 * 1024) {
                Alert.alert(
                  "Fichier trop volumineux",
                  `${
                    photo.fileName || "Un fichier"
                  } dépasse la limite de 10 Mo et a été ignoré.`
                );
                return false;
              }
              return true;
            });
    
            // Limiter la sélection à 7 photos maximum
            const newPhotos = [...photos, ...validPhotos];
    
            // Si le nombre total dépasse 7, on limite à 7 photos
            if (newPhotos.length > 7) {
              Alert.alert(
                "Limite atteinte",
                "Vous pouvez sélectionner jusqu'à 7 photos maximum."
              );
              newPhotos.splice(7); // Garde seulement les 7 premières photos
            }
    
            setPhotos(newPhotos); // Mettez à jour l'état des photos avec la nouvelle liste
          } else {
            console.log("Sélection annulée");
          }
        } catch (error) {
          console.error("Erreur lors de la sélection des images :", error);
        }
      };

  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
  };

  return (
    <View style={styles.containerPhoto}>
      <TouchableOpacity style={styles.button} onPress={handleSelectPhotos}>
        <Text style={styles.buttonText}>Ajouter des photos</Text>
      </TouchableOpacity>

      <ScrollView horizontal style={styles.photoContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoWrapper}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleRemovePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color="red" />
            </TouchableOpacity>
            <Image source={{ uri: photo.uri }} style={styles.photo} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PhotoManager;