// components/PhotoManager.tsx
import React from "react";
import { View, TouchableOpacity, ScrollView, Image, Alert, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

const PhotoManager = ({ photos, setPhotos, maxPhotos = 7 }) => {
  const handleSelectPhotos = async () => {
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
        console.log("Images sélectionnées :", result.assets);

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

        let newPhotos = [...photos, ...validPhotos];

        if (newPhotos.length > maxPhotos) {
          Alert.alert(
            "Limite atteinte",
            `Vous pouvez sélectionner jusqu'à ${maxPhotos} photo(s) maximum.`
          );
          newPhotos = newPhotos.slice(0, maxPhotos); 
        }

        setPhotos(newPhotos); 
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

      <TouchableOpacity style={styles.button} onPress={handleSelectPhotos}>
        <Text style={styles.buttonText}>Ajouter des photos</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerPhoto: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },

  button: {
    width: "75%",
    height: 40,
    backgroundColor: "#093A3E",
    shadowColor: "#093A3E",
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

  photoWrapper: {
    marginRight: 10,
    position: "relative",
  },

  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "#fff", 
    borderRadius: 15, 
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  photo: {
    width: 100,
    height: 100,
    borderRadius: 12, 
    borderWidth: 2,
    borderColor: "#ddd",
  },
});


export default PhotoManager;
