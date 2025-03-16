import React, { memo } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfileImageProps {
  imageUrl?: string;
  onImageChange: (uri: string) => Promise<boolean>;
}

const ProfileImage: React.FC<ProfileImageProps> = memo(({ imageUrl, onImageChange }) => {
  const handleProfileImageClick = async () => {
    try {
      // Changement du ratio d'aspect à 1:2 pour un format portrait rectangulaire
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 2], // Modification de 1:1 à 1:2
      });
  
      if (result.canceled) return;
  
      const photoUri = result.assets?.[0]?.uri;
      if (!photoUri) throw new Error("Aucune image sélectionnée");
  
      await onImageChange(photoUri);
    } catch (err: any) {
      console.error("Erreur lors de la sélection d'image :", err.message);
    }
  };

  return (
    <TouchableOpacity onPress={handleProfileImageClick}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.profileImage} />
      ) : (
        <View style={styles.noProfileImage}>
          <Text style={styles.noProfileImageText}>
            Pas de photo de profil
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  profileImage: {
    width: 80, // Largeur réduite pour maintenir une taille raisonnable
    height: 160, // Hauteur = 2 x largeur
    borderRadius: 20, // Coins arrondis au lieu d'un cercle
    borderWidth: 2,
    borderColor: '#fff',
  },
  noProfileImage: {
    width: 80,
    height: 160,
    borderRadius: 20,
    backgroundColor: '#eaeaea',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  noProfileImageText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#888',
    padding: 5,
  },
});

export default ProfileImage;