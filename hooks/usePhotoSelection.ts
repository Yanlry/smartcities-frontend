import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export function usePhotoSelection() {
  const [photos, setPhotos] = useState<any[]>([]);

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

      if (photos.length >= 7) {
        Alert.alert(
          "Limite atteinte",
          "Vous pouvez sélectionner jusqu'à 7 photos maximum, veuillez en supprimer pour en ajouter de nouvelles."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
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

        const newPhotos = [...photos, ...validPhotos];

        if (newPhotos.length > 7) {
          Alert.alert(
            "Limite atteinte",
            "Vous pouvez sélectionner jusqu'à 7 photos maximum."
          );
          newPhotos.splice(7);
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

  return { photos, handleSelectPhotos, handleRemovePhoto };
}