import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import * as ImagePicker from "expo-image-picker";
import styles from "./styles/ProfileScreen.styles";
import Icon from "react-native-vector-icons/FontAwesome";

type User = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  trustRate?: number;
  followers?: any[];
  following?: any[];
  reports?: any[];
  comments?: any[];
  posts?: any[];
  organizedEvents?: any[];
  attendedEvents?: any[];
  latitude?: number;
  longitude?: number;
  profilePhoto?: { url: string };
  isSubscribed: boolean;
  isMunicipality: boolean;
};

export default function ProfileScreen({ navigation, onLogout }) {
  const [user, setUser] = useState<User | null>(null); // Type explicite ajouté ici
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editable, setEditable] = useState(false); // Mode édition
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // Désactive le retour par geste
    });
    async function fetchUser() {
      try {
        const userId = await getUserIdFromToken();
        if (!userId) throw new Error("ID utilisateur non trouvé");

        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok)
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          );

        const data: User = await response.json(); // Assure que les données reçues correspondent au type User
        setUser(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [navigation]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  // Synchronise `formData` avec `user` quand les données utilisateur sont disponibles
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  const handleProfileImageUpdate = async () => {
    try {
      setIsSubmitting(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (result.canceled) {
        setIsSubmitting(false);
        return;
      }

      const photoUri = result.assets?.[0]?.uri;

      if (!photoUri) {
        throw new Error("Aucune image sélectionnée");
      }

      const formData = new FormData();
      formData.append("profileImage", {
        uri: photoUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      console.log("FormData clé et valeur:", formData);

      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("ID utilisateur non trouvé");

      const responsePost = await fetch(
        `${API_URL}/users/${userId}/profile-image`,
        {
          method: "POST",
          body: formData,
        }
      );

      console.log("Response status:", responsePost.status);

      if (!responsePost.ok) {
        const errorBody = await responsePost.text();
        console.error("Response body:", errorBody);
        throw new Error("Échec de la mise à jour de la photo de profil");
      }

      const updatedUser = await responsePost.json();
      console.log("Response body:", updatedUser);

      navigation.replace("ProfileScreen");
    } catch (err: any) {
      console.error("Erreur lors de l'upload :", err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Chargement des informations utilisateur...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erreur : {error}</Text>
      </View>
    );
  }

  // Gestion des changements dans les inputs
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Fonction pour sauvegarder les modifications
  const handleSave = async () => {
    try {
      // Simuler un appel API pour sauvegarder les données
      const response = await fetch(
        `http://192.168.1.100:3000/users/${user?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Une erreur s'est produite lors de la sauvegarde.");
      }

      Alert.alert("Succès", "Les informations ont été mises à jour.");
      setEditable(false); // Désactive le mode édition
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications.");
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/users/${user?.id}/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Mot de passe actuel incorrect ou autre erreur.");
      }

      Alert.alert("Succès", "Mot de passe modifié avec succès.");
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de modifier le mot de passe."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace("Main")}>
          <Icon
            name="chevron-left"
            size={28}
            color="#333"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <Text style={styles.headerTitle}> </Text>
      </View>

      <ScrollView contentContainerStyle={styles.profileContent}>
        <View style={styles.profileImageContainer}>
          {user?.profilePhoto?.url ? (
            <Image
              source={{ uri: user.profilePhoto.url }}
              style={styles.profileImage}
            />
          ) : (
            <Text style={styles.noProfileImageText}>
              Pas de photo de profil
            </Text>
          )}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleProfileImageUpdate}
            disabled={isSubmitting}
          >
            <Text style={styles.updateButtonText}>
              {isSubmitting ? "Modification..." : "Modifier la photo de profil"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleProfil}>
            Informations personnelles
          </Text>
          {/* Prénom */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Prénom :</Text>
            <TextInput
              style={[styles.input, !editable && styles.inputDisabled]}
              value={formData.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
              editable={editable}
            />
          </View>
          {/* Nom */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nom :</Text>
            <TextInput
              style={[styles.input, !editable && styles.inputDisabled]}
              value={formData.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
              editable={editable}
            />
          </View>
          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={[styles.input, !editable && styles.inputDisabled]}
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              editable={editable}
            />
          </View>
          {/* Nom d'utilisateur */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nom d'utilisateur :</Text>
            <TextInput
              style={[styles.input, !editable && styles.inputDisabled]}
              value={formData.username}
              onChangeText={(text) => handleInputChange("username", text)}
              editable={editable}
            />
          </View>
          {/* Bouton Sauvegarder/Modifier */}
          <TouchableOpacity
            style={styles.buttonProfil}
            onPress={editable ? handleSave : () => setEditable(true)}
          >
            <Text style={styles.buttonTextProfil}>
              {editable ? "Sauvegarder" : "Modifier"}
            </Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={styles.sectionTitleProfil}>
              Modifier le mot de passe
            </Text>

            {/* Mot de passe actuel */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Mot de passe actuel :</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez votre mot de passe actuel"
                  secureTextEntry={!showCurrentPassword} // Contrôle la visibilité
                  onChangeText={(text) =>
                    setFormData({ ...formData, currentPassword: text })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)} // Toggle visibilité
                >
                  <Icon
                    name={showCurrentPassword ? "eye-slash" : "eye"} // Icône selon l'état
                    size={20}
                    color="gray"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nouveau mot de passe */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Nouveau mot de passe :</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Entrez le nouveau mot de passe"
                  secureTextEntry={!showNewPassword} // Contrôle la visibilité
                  onChangeText={(text) =>
                    setFormData({ ...formData, newPassword: text })
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)} // Toggle visibilité
                >
                  <Icon
                    name={showNewPassword ? "eye-slash" : "eye"} // Icône selon l'état
                    size={20}
                    color="gray"
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton Sauvegarder */}
            <TouchableOpacity
              style={styles.buttonProfil}
              onPress={handleChangePassword}
            >
              <Text style={styles.buttonTextProfil}>
                Modifier le mot de passe
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <Text style={styles.field}>
            Taux de confiance : {user?.trustRate || "Non calculé"}
          </Text>
          <Text style={styles.field}>
            Nombre de followers : {user?.followers?.length || 0}
          </Text>
          <Text style={styles.field}>
            Nombre de suivis : {user?.following?.length || 0}
          </Text>
        </View>

        {/* Section Activités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activités récentes</Text>
          <Text style={styles.field}>
            Rapports : {user?.reports?.length || 0} signalement(s)
          </Text>
          <Text style={styles.field}>
            Commentaires : {user?.comments?.length || 0}
          </Text>
          <Text style={styles.field}>
            Publications : {user?.posts?.length || 0}
          </Text>
          <Text style={styles.field}>
            Événements organisés : {user?.organizedEvents?.length || 0}
          </Text>
          <Text style={styles.field}>
            Événements participés : {user?.attendedEvents?.length || 0}
          </Text>
        </View>

        {/* Section Géolocalisation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Géolocalisation</Text>
          <Text style={styles.field}>
            Latitude : {user?.latitude || "Non disponible"}
          </Text>
          <Text style={styles.field}>
            Longitude : {user?.longitude || "Non disponible"}
          </Text>
        </View>

        {/* Section Abonnement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnements</Text>
          <Text style={styles.field}>
            Abonné : {user?.isSubscribed ? "Oui" : "Non"}
          </Text>
          <Text style={styles.field}>
            Municipalité : {user?.isMunicipality ? "Oui" : "Non"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
