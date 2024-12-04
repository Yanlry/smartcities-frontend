import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import * as ImagePicker from "expo-image-picker";

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
  });

  // Synchronise `formData` avec `user` quand les données utilisateur sont disponibles
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        username: user.username || "",
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace("Main")}>
          <Icon
            name="arrow-back"
            size={28}
            color="#333"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  profileContent: {
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center", // Centrer le contenu horizontalement
    justifyContent: "center", // Centrer le contenu verticalement
    padding: 20, // Espacement interne pour respirer
    backgroundColor: "#F9F9F9", // Fond clair pour contraster
    borderRadius: 15, // Coins arrondis
    shadowColor: "#000", // Ombre douce
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Ombre sur Android
    marginBottom: 20, // Espacement avec la section suivante
  },
  profileImage: {
    width: 250, // Largeur de l'image
    height: 250, // Hauteur de l'image
    borderRadius: 60, // Forme ronde (50% de width/height)
  },
  noProfileImageText: {
    color: "#999", // Couleur grise discrète
    fontSize: 16, // Taille de police lisible
    fontWeight: "bold", // Texte en gras pour plus de visibilité
    marginBottom: 20, // Espacement avec le bouton
  },
  updateButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#007BFF", // Bleu moderne
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#FFFFFF", // Texte blanc
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  field: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  containerPhoto: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoContainer: {
    marginTop: 20,
    marginBottom: 20,
  },

  photoWrapper: {
    position: "relative", // Nécessaire pour positionner la croix
    marginRight: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1, // S'assurer que la croix est au-dessus de l'image
  },
  button: {
    backgroundColor: "#007BFF", // Couleur de fond
    paddingVertical: 12, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    borderRadius: 8, // Coins arrondis
  },
  buttonText: {
    color: "#fff", // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: "bold", // Texte en gras
    textAlign: "center", // Centrage du texte
  },

  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  usernameText: {
    fontSize: 16,
    color: "#555",
  },

  sectionTitleProfil: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: "#f9f9f9",
    color: "#888",
  },
  buttonProfil: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonTextProfil: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
