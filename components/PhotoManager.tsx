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

      // Vérifier si l'utilisateur a déjà atteint la limite
      if (photos.length >= maxPhotos) {
        Alert.alert(
          "Limite atteinte",
          `Vous pouvez sélectionner jusqu'à ${maxPhotos} photo(s) maximum. Veuillez en supprimer pour en ajouter de nouvelles.`
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Permettre le recadrage
        quality: 1,
        aspect: [1, 1], // Recadrage carré
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

        // Ajouter les nouvelles photos
        let newPhotos = [...photos, ...validPhotos];

        // Si le nombre total dépasse maxPhotos, on limite à maxPhotos
        if (newPhotos.length > maxPhotos) {
          Alert.alert(
            "Limite atteinte",
            `Vous pouvez sélectionner jusqu'à ${maxPhotos} photo(s) maximum.`
          );
          newPhotos = newPhotos.slice(0, maxPhotos); // Garde seulement les maxPhotos premières photos
        }

        setPhotos(newPhotos); // Mettez à jour l'état des photos
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
  // Conteneur principal
  containerPhoto: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },

  button: {
    width: "75%",
    height: 50,
    backgroundColor: "#6C63FF", // Couleur violet moderne
    borderRadius: 25, // Coins arrondis
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#6C63FF", // Ombre de la même couleur que le bouton
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4, // Ombre pour Android
  },

  // Texte du bouton
  buttonText: {
    color: "#FFFFFF", // Texte blanc
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase", // Texte en majuscules
    letterSpacing: 1, // Espacement pour un style élégant
  },
  
  // Bouton "Ajouter des photos"
  photoButton: {
    width: "90%",
    height: 50,
    backgroundColor: "#4CAF50", // Couleur principale (vert moderne)
    borderRadius: 25, // Coins arrondis pour un bouton élégant
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000", // Ombre douce
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Ombre sur Android
  },

  // Texte du bouton
  photoButtonText: {
    color: "#ffffff", // Texte blanc
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  // Conteneur des photos
  photoContainer: {
    width: "100%",
    marginBottom: 20,
  },

  // Style d'un conteneur individuel de photo
  photoWrapper: {
    marginRight: 10,
    position: "relative",
  },

  // Bouton pour supprimer une photo
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1,
    backgroundColor: "#fff", // Fond blanc
    borderRadius: 15, // Forme ronde
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  // Style pour les photos affichées
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12, // Coins arrondis
    borderWidth: 2,
    borderColor: "#ddd",
  },
});


export default PhotoManager;
