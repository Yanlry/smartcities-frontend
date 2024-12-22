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
  Switch,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import * as ImagePicker from "expo-image-picker";
import styles from "./styles/ProfileScreen.styles";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/Sidebar";
import { useNotification } from "../context/NotificationContext";

type User = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  showEmail: boolean;
  username?: string;
  trustRate?: number;
  followers?: any[];
  following?: any[];
  reports?: any[];
  comments?: any[];
  posts?: any[];
  organizedEvents?: any[];
  attendedEvents?: any[];
  nomCommune?: string;
  codePostal?: string;
  latitude?: number;
  longitude?: number;
  profilePhoto?: { url: string };
  isSubscribed: boolean;
  isMunicipality: boolean;
};

export default function ProfileScreen({ navigation, onLogout, route }) {
  const [user, setUser] = useState<User | null>(null); // Type explicite ajouté ici
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editable, setEditable] = useState(false); // Mode édition
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    showEmail: false,
    currentPassword: "",
    newPassword: "",
  });
  const [stats, setStats] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { unreadCount } = useNotification(); // Récupération du compteur


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

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.showEmail ? user.email || "" : "", // Montre ou masque l'email selon `showEmail`
        showEmail: user.showEmail || false,
        username: user.username || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return; // Ne pas exécuter si user.id est undefined

      try {
        setLoading(true);
        setError(null);

        // Utiliser l'ID du profil visité
        const response = await axios.get(`${API_URL}/users/stats/${user.id}`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }

        const data = response.data;
        setStats(data);
      } catch (error: any) {
        console.error("Erreur dans fetchStats :", error.message || error);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]); // Dépendance sur user

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
        <ActivityIndicator size="large" color="#29524A" />
        <Text style={{fontSize:18, fontWeight:'bold', color:"#29524A"}}>Chargement des informations..</Text>
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
  interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    showEmail: boolean;
    currentPassword: string;
    newPassword: string;
  }

  interface HandleInputChange {
    (field: keyof FormData, value: string): void;
  }

  const handleInputChange: HandleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        showEmail: formData.showEmail.toString(), // Convertir en chaîne ("true" ou "false")
      };

      const response = await fetch(`${API_URL}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // N'envoie que les champs nécessaires
      });

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
      setFormData((prevState) => ({
        ...prevState,
        currentPassword: "", // Vide le champ actuel
        newPassword: "", // Vide le champ du nouveau mot de passe
      }));
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de modifier le mot de passe."
      );
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <View style={styles.container}>
     <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
        <Icon
          name="menu"
          size={28}
          color="#BEE5BF" // Couleur dorée
          style={{ marginLeft: 10 }}
        />
      </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>PROFIL</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={28}
              color={unreadCount > 0 ? "#BEE5BF" : "#BEE5BF"}
              style={{ marginRight: 10 }}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
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
          {/* Email */}
          {formData.showEmail && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email :</Text>
              <TextInput
                style={[styles.input, !editable && styles.inputDisabled]}
                value={formData.email} // L'email est visible ici uniquement si showEmail est activé
                onChangeText={(text) => handleInputChange("email", text)}
                editable={editable}
              />
            </View>
          )}

          <View style={styles.fieldContainer}>
            <View style={styles.showEmail}>
              <Text style={styles.labelEmail}>
                Activer ou désactiver le partage de votre email avec les autres
                utilisateurs.
              </Text>
              <Switch
                value={formData.showEmail}
                onValueChange={async (value) => {
                  try {
                    // Envoyer la mise à jour au backend
                    const response = await axios.post(
                      `${API_URL}/users/show-email`,
                      {
                        userId: user?.id,
                        showEmail: value,
                      }
                    );

                    // Mettre à jour l'état local après la réussite
                    const updatedShowEmail = response.data.showEmail;

                    setFormData((prevState) => ({
                      ...prevState,
                      showEmail: updatedShowEmail,
                      email: updatedShowEmail ? user?.email || "" : "", // Met à jour l'email localement selon la visibilité
                    }));

                    // Optionnel : rafraîchir l'utilisateur
                    const refreshedUser = await fetch(
                      `${API_URL}/users/${user?.id}`
                    ).then((res) => res.json());
                    setUser(refreshedUser);
                  } catch (error) {
                    console.error(
                      "Erreur lors de la mise à jour de la préférence :",
                      error
                    );
                    Alert.alert(
                      "Erreur",
                      "Impossible de mettre à jour la préférence."
                    );
                  }
                }}
              />
            </View>
          </View>

          {/* Bouton Sauvegarder/Modifier */}
          <TouchableOpacity
            style={styles.buttonProfil}
            onPress={() => {
              if (editable) {
                // Sauvegarder les modifications
                handleSave();
                setEditable(false); // Désactiver le mode édition
              } else {
                // Vérifier si l'email est affiché
                if (!formData.showEmail) {
                  Alert.alert(
                    "Afficher l'email",
                    "Veuillez afficher votre email avant de pouvoir entamer des modifications."
                  );
                  return;
                }

                // Passer en mode édition
                setEditable(true);
              }
            }}
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
                  value={formData.currentPassword} // Liaison avec currentPassword
                  onChangeText={
                    (text) =>
                      setFormData({ ...formData, currentPassword: text }) // Met à jour uniquement currentPassword
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)} // Toggle visibilité
                >
                  <Icon
                    name={showCurrentPassword ? "visibility-off" : "visibility"} // Icône selon l'état
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
                  value={formData.newPassword} // Liaison avec newPassword
                  onChangeText={
                    (text) => setFormData({ ...formData, newPassword: text }) // Met à jour uniquement newPassword
                  }
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)} // Toggle visibilité
                >
                  <Icon
                    name={showNewPassword ? "visibility-off" : "visibility"} // Icône selon l'état
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

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Ville de référence</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
              {user?.nomCommune || "Non disponible"}
              </Text>
              <Text style={styles.statLabel}>Ville</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.codePostal || "Non disponible"}</Text>
              <Text style={styles.statLabel}>Code postal</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Statistiques de signalements</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfComments || 0}
              </Text>
              <Text style={styles.statLabel}>Commentaires</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.numberOfVotes || 0}</Text>
              <Text style={styles.statLabel}>Votes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfReports || 0}
              </Text>
              <Text style={styles.statLabel}>Signalements</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Relations</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.followers?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.following?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Social</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfPosts || 0}
              </Text>
              <Text style={styles.statLabel}>Publications{"\n"}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats?.numberOfEventsCreated || 0}
              </Text>
              <Text style={styles.statLabel}>Événements{"\n"}crées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.following?.length || 0}
              </Text>
              <Text style={styles.statLabel}>
                Participation{"\n"}aux événements
              </Text>
            </View>
          </View>
        </View>

        {/* Section Abonnement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abonnements</Text>
          <Text style={styles.field}>
            Abonné : {user?.isSubscribed ? "Oui" : "Non"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
}
