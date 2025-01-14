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
  Modal,
  FlatList,
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
import franceCitiesRaw from "../assets/france.json";
const franceCities: City[] = franceCitiesRaw as City[];
import { Ionicons } from "@expo/vector-icons";

interface City {
  Code_commune_INSEE: number;
  Nom_commune: string;
  Code_postal: string;
  Libelle_acheminement: string;
  Ligne_5: string;
  coordonnees_gps: string;
}

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
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [suggestions, setSuggestions] = useState<City[]>([]); // Stocke les villes correspondantes
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedList, setSelectedList] = useState<
    "followers" | "following" | null
  >(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // Désactive le retour par geste
    });
    async function fetchUser() {
      try {
        const userId = await getUserIdFromToken();
        setCurrentUserId(userId);
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#093A3E" />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#093A3E" }}>
          Chargement des informations..
        </Text>
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

  const handleSearchCity = () => {
    const trimmedQuery = query.trim(); // Supprime les espaces inutiles

    if (!trimmedQuery) {
      Alert.alert(
        "Erreur",
        "Veuillez entrer un code postal ou un nom de ville."
      );
      return;
    }

    // Détecter si la recherche est un code postal (entier)
    const isCodePostal = /^[0-9]{5}$/.test(trimmedQuery);

    // Filtrer les villes par code postal ou nom de ville
    const filteredCities = franceCities.filter((city) => {
      const cityName = (city.Ligne_5 || city.Nom_commune).toLowerCase().trim();
      const codePostal = city.Code_postal.toString().trim();

      return isCodePostal
        ? codePostal === trimmedQuery // Recherche par code postal
        : cityName.includes(trimmedQuery.toLowerCase()); // Recherche par nom de ville
    });

    if (filteredCities.length > 0) {
      setSuggestions(filteredCities);
      setModalVisible(true);
    } else {
      setSuggestions([]);
      Alert.alert(
        "Erreur",
        "Aucune ville ou code postal correspondant trouvé."
      );
    }
  };

  const handleCitySelection = (city: City) => {
    setSelectedCity(city);
    setModalVisible(false); // Fermer le modal
    setQuery(`${city.Nom_commune} (${city.Code_postal})`); // Mettre à jour le champ de recherche
  };

  const handleSaveCity = async () => {
    if (!selectedCity) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner une ville avant d'enregistrer."
      );
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/users/${user?.id}`, {
        nomCommune: selectedCity.Nom_commune,
        codePostal: selectedCity.Code_postal,
      });

      if (response.status === 200) {
        Alert.alert("Succès", "Votre ville a été mise à jour avec succès.");
        setUser((prev: any) => ({
          ...prev,
          nomCommune: selectedCity.Nom_commune,
          codePostal: selectedCity.Code_postal,
        }));
        setIsEditingCity(false);
      } else {
        throw new Error("Erreur serveur");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la ville.");
    }
  };

  const handleShowList = (listType: "followers" | "following") => {
    setSelectedList((prev) => (prev === listType ? null : listType));
  };

  const handleCloseModal = () => {
    setSelectedList(null);
  };

  const handleUnfollow = async (followingUserId) => {
    if (!currentUserId) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${API_URL}/users/${followingUserId}/unfollow`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followerId: currentUserId }),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du désuivi de cet utilisateur.");
      }

      // Mettre à jour localement la liste des abonnements
      setUser((prevUser) =>
        prevUser
          ? {
              ...prevUser,
              following: (prevUser.following || []).filter(
                (following) => following.id !== followingUserId
              ),
            }
          : null
      );
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Bouton pour ouvrir le menu */}
        <TouchableOpacity onPress={toggleSidebar}>
          <Icon
            name="menu"
            size={24}
            color="#F7F2DE" // Couleur dorée
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>

        {/* Titre de la page */}
        <View style={styles.typeBadge}>
          <Text style={styles.headerTitle}>MON PROFIL</Text>
        </View>

        {/* Bouton de notifications avec compteur */}
        <TouchableOpacity
          onPress={() => navigation.navigate("NotificationsScreen")}
        >
          <View>
            <Icon
              name="notifications"
              size={24}
              color={unreadCount > 0 ? "#F7F2DE" : "#F7F2DE"}
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

          {/* Affichage de la ville actuelle */}
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.nomCommune || "Non disponible"}
              </Text>
              <Text style={styles.statLabel}>Ville</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.codePostal || "Non disponible"}
              </Text>
              <Text style={styles.statLabel}>Code postal</Text>
            </View>
          </View>

          {/* Bouton pour activer la modification */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditingCity(true)}
          >
            <Text style={styles.editButtonText}>Modifier ma ville</Text>
          </TouchableOpacity>

          {/* Mode édition */}
          {isEditingCity && (
            <View style={styles.editContainer}>
              {/* Champ de recherche */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.inputCity}
                  placeholder="Rechercher par code postal"
                  value={query}
                  onChangeText={setQuery}
                  placeholderTextColor="#c7c7c7"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchCity}
                >
                  <Ionicons name="search-sharp" size={20} color="black" />
                </TouchableOpacity>
              </View>

              {/* Modal pour afficher les suggestions */}
              <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <ScrollView>
                      {suggestions.map((item, index) => (
                        <TouchableOpacity
                          key={`${item.Code_commune_INSEE}-${index}`}
                          style={styles.suggestionItem}
                          onPress={() => handleCitySelection(item)}
                        >
                          <Text style={styles.suggestionText}>
                            {item.Nom_commune} ({item.Code_postal})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Fermer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* Boutons Sauvegarder et Annuler */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveCity}
                >
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsEditingCity(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Relations</Text>
          <View style={styles.cardContent}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => handleShowList("followers")}
            >
              <Text style={styles.statNumber}>
                {user?.followers?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnées</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statItem}
              onPress={() => handleShowList("following")}
            >
              <Text style={styles.statNumber}>
                {user?.following?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </TouchableOpacity>
          </View>

          {/* Modal pour afficher la liste */}
          {selectedList && (
            <Modal
              visible={true}
              transparent={true}
              animationType="slide"
              onRequestClose={handleCloseModal}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContentFollower}>
                  <Text style={styles.modalHeader}>
                    {selectedList === "followers"
                      ? "Smarters abonnés à votre profil"
                      : "Smarters auxquels vous êtes abonné"}
                  </Text>
                  <FlatList
                    data={
                      selectedList === "followers"
                        ? user?.followers
                        : user?.following
                    }
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <Image
                          source={{
                            uri:
                              item.profilePhoto ||
                              "https://via.placeholder.com/150",
                          }}
                          style={styles.avatar}
                        />
                        <Text style={styles.userName}>{item.username}</Text>

                        {selectedList === "following" && ( // Bouton désabonnement uniquement pour les abonnements
                          <TouchableOpacity
                            style={styles.unfollowButton}
                            onPress={() => handleUnfollow(item.id)}
                          >
                            <Text style={styles.unfollowButtonText}>
                              Se désabonner
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.closeButtonText}>Fermer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>
            Statistiques de signalements
          </Text>
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
          <Text style={styles.infoCardHeader}>Social</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.numberOfPosts || 0}</Text>
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
                {stats?.numberOfEventsAttended || 0}
              </Text>
              <Text style={styles.statLabel}>
                Participation{"\n"}aux événements
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.infoCardHeader}>Options</Text>
          <View style={styles.cardContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.isSubscribed ? "Oui" : "Non"}
              </Text>
              <Text style={styles.statLabel}> SMART+</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {user?.isSubscribed ? "Oui" : "Non"}
              </Text>
              <Text style={styles.statLabel}>Affiliation mairie</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </View>
  );
}
