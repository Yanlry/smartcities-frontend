// Chemin : screens/ProfileScreen.tsx
import React, { useEffect, useState, useCallback } from "react";
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
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import Icon from "@expo/vector-icons/MaterialIcons";
import Sidebar from "../components/common/Sidebar";
import { useNotification } from "../context/NotificationContext";
import franceCitiesRaw from "../assets/france.json";
import { LinearGradient } from "expo-linear-gradient";
import { useUserProfile } from "../context/UserProfileContext"; // Ajoutez cette ligne
import { FollowersModal, FollowingModal } from "../components/home/modals";
import ProfilePhotoModal from "../components/profile/Photo/ProfilePhoto";

const franceCities: City[] = franceCitiesRaw as City[];

// Définition de la palette de couleurs officielle
const COLORS = {
  primary: {
    base: "#062C41",
    light: "#1B5D85",
    dark: "#041E2D",
    contrast: "#FFFFFF",
  },
  secondary: {
    base: "#2A93D5",
    light: "#50B5F5",
    dark: "#1C7AB5",
    contrast: "#FFFFFF",
  },
  accent: {
    base: "#FF5A5F",
    light: "#FF7E82",
    dark: "#E04347",
    contrast: "#FFFFFF",
  },
  neutral: {
    50: "#F9FAFC",
    100: "#F0F4F8",
    200: "#E1E8EF",
    300: "#C9D5E3",
    400: "#A3B4C6",
    500: "#7D91A7",
    600: "#5C718A",
    700: "#465670",
    800: "#2E3B4E",
    900: "#1C2536",
  },
  state: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  overlay: "rgba(0,0,0,0.7)",
};

interface City {
  Code_commune_INSEE: number;
  Nom_commune: string;
  Code_postal: string;
  Libelle_acheminement: string;
  Ligne_5: string;
  coordonnees_gps: string;
}

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

import { User as ImportedUser } from "../types/entities/user.types";

type User = ImportedUser & {
  followers?: any[];
  following?: any[];
  reports?: any[];
  comments?: any[];
  posts?: any[];
  organizedEvents?: any[];
  attendedEvents?: any[];
};

interface ProfileScreenProps {
  navigation: any;
  onLogout?: () => void;
}

// Modification de la ligne 113
export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { unreadCount } = useNotification();

  // Désactivation du fade: initialisation avec 1
  const fadeAnim = useState(new Animated.Value(1))[0];

  const [showProfilePhotoModal, setShowProfilePhotoModal] =
    useState<boolean>(false);
  // Ajout d’un listener pour réinitialiser la Sidebar lors du blur du screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setIsSidebarOpen(false);
    });
    return unsubscribe;
  }, [navigation]);

  // Variables d'état
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editable, setEditable] = useState(false);
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
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Local states for modals
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  // Importez les fonctions du context
  const { updateUserCity, refreshUserData } = useUserProfile();

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
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

        const data: User = await response.json();
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
        email: user.showEmail ? user.email || "" : "",
        showEmail: user.showEmail || false,
        username: user.username || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

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
  }, [user]);

  const handleFollowingUserPress = useCallback(
    (id: string) => {
      setShowFollowingModal(false);
      setShowFollowersModal(false);
      setTimeout(() => {
        navigation.navigate("UserProfileScreen", { userId: id });
      }, 300);
    },
    [navigation]
  );

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

  const handleProfileImageUpdateWrapper = async (
    uri: string
  ): Promise<boolean> => {
    // Vous pouvez ignorer le paramètre 'uri' si votre fonction existante ne l'utilise pas
    await handleProfileImageUpdate();
    return true;
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
        showEmail: formData.showEmail.toString(),
      };

      const response = await fetch(`${API_URL}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Une erreur s'est produite lors de la sauvegarde.");
      }

      Alert.alert("Succès", "Les informations ont été mises à jour.");
      setEditable(false);
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
        currentPassword: "",
        newPassword: "",
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
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      Alert.alert(
        "Erreur",
        "Veuillez entrer un code postal ou un nom de ville."
      );
      return;
    }

    const isCodePostal = /^[0-9]{5}$/.test(trimmedQuery);

    const filteredCities = franceCities.filter((city) => {
      const cityName = (city.Ligne_5 || city.Nom_commune).toLowerCase().trim();
      const codePostal = city.Code_postal.toString().trim();

      return isCodePostal
        ? codePostal === trimmedQuery
        : cityName.includes(trimmedQuery.toLowerCase());
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
    setModalVisible(false);
    setQuery(`${city.Nom_commune} (${city.Code_postal})`);
  };

  const normalizeCommune = (communeName: string): string => {
    if (!communeName) return "";

    // Étape 1: Nettoyer la chaîne (supprimer caractères spéciaux, espaces multiples)
    let normalized = communeName.trim().replace(/\s+/g, " "); // Remplacer espaces multiples par un seul espace

    // Étape 2: Remplacer les espaces par des tirets
    normalized = normalized.replace(/\s/g, "-");

    return normalized;
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
      // Normaliser le nom de la commune
      const normalizedCommuneName = normalizeCommune(selectedCity.Nom_commune);
      console.log(
        `Normalisation: "${selectedCity.Nom_commune}" → "${normalizedCommuneName}"`
      );

      // Utilisez la fonction du context pour mettre à jour la ville
      await updateUserCity(normalizedCommuneName, selectedCity.Code_postal);

      // Optionnel : rafraîchir les données pour s'assurer que le profil est à jour
      await refreshUserData();

      Alert.alert("Succès", "Votre ville a été mise à jour avec succès.");

      // Recharger la page ProfileScreen pour actualiser le champ localisation
      navigation.replace("ProfileScreen");
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la ville.");
    }
  };

  const handlePhotoUpdateSuccess = useCallback(() => {
    refreshUserData();

    navigation.replace("ProfileScreen");
  }, [refreshUserData, navigation]);

  const handleOpenPhotoModal = useCallback(() => {
    setShowProfilePhotoModal(true);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.secondary.base} />
          <Text style={styles.loadingText}>Chargement de votre profil...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={60} color={COLORS.state.error} />
        <Text style={styles.errorTitle}>Oups !</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.replace("ProfileScreen")}
        >
          <Text style={styles.errorButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={[COLORS.primary.base, COLORS.primary.light]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={toggleSidebar}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color={COLORS.primary.contrast} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>MON PROFIL</Text>
        </View>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("NotificationsScreen")}
          activeOpacity={0.7}
        >
          <Icon
            name="notifications"
            size={24}
            color={COLORS.primary.contrast}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.fadeIn, { opacity: fadeAnim }]}>
          {/* Section de la photo de profil */}
          <View style={styles.profileSection}>
            <LinearGradient
              colors={[COLORS.primary.light, COLORS.secondary.base]}
              style={styles.profileGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.profileImageWrapper}>
                {user?.profilePhoto?.url ? (
                  <Image
                    source={{ uri: user.profilePhoto.url }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>                
                      {formData.lastName.charAt(0)}
                      {formData.firstName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                 {formData.lastName} {formData.firstName} 
                </Text>
                <Text style={styles.profileUsername}>
                  @{formData.username || "username"}
                </Text>

                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleOpenPhotoModal}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Icon
                    name="photo-camera"
                    size={16}
                    color={COLORS.neutral[50]}
                  />
                  <Text style={styles.photoButtonText}>
                    {isSubmitting ? "Modification..." : "Modifier la photo"}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Stats rapides */}
            <View style={styles.quickStats}>
              <TouchableOpacity
                style={styles.quickStatItem}
                onPress={() => setShowFollowersModal(true)}
              >
                <Text style={styles.quickStatNumber}>
                  {user?.followers?.length || 0}
                </Text>
                <Text style={styles.quickStatLabel}>Abonnés</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <TouchableOpacity
                style={styles.quickStatItem}
                onPress={() => setShowFollowingModal(true)}
              >
                <Text style={styles.quickStatNumber}>
                  {user?.following?.length || 0}
                </Text>
                <Text style={styles.quickStatLabel}>Abonnements</Text>
              </TouchableOpacity>

              <View style={styles.statDivider} />

              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatNumber}>
                  {stats?.numberOfReports || 0}
                </Text>
                <Text style={styles.quickStatLabel}>Signalements</Text>
              </View>
            </View>
          </View>

          {/* Cartes d'information */}
          <View style={styles.cardsContainer}>
            {/* Localisation */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon
                  name="location-on"
                  size={22}
                  color={COLORS.secondary.base}
                />
                <Text style={styles.cardTitle}>Localisation</Text>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => setIsEditingCity(true)}
                >
                  <Icon name="edit" size={20} color={COLORS.secondary.base} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.locationDisplay}>
                  <Icon name="place" size={32} color={COLORS.secondary.base} />
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationCity}>
                      {user?.nomCommune || "Aucune ville définie"}
                    </Text>
                    <Text style={styles.locationPostal}>
                      {user?.codePostal || ""}
                    </Text>
                  </View>
                </View>

                {isEditingCity && (
                  <View style={styles.cityEditContainer}>
                    <View style={styles.searchBar}>
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher par ville ou code postal"
                        placeholderTextColor={COLORS.neutral[400]}
                        value={query}
                        onChangeText={setQuery}
                      />
                      <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearchCity}
                      >
                        <Icon
                          name="search"
                          size={20}
                          color={COLORS.primary.contrast}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.cityActionButtons}>
                      <TouchableOpacity
                        style={styles.cityActionButton}
                        onPress={handleSaveCity}
                      >
                        <Text style={styles.cityActionButtonText}>
                          Enregistrer
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.cityActionButton,
                          styles.cityActionButtonCancel,
                        ]}
                        onPress={() => setIsEditingCity(false)}
                      >
                        <Text style={styles.cityActionButtonTextCancel}>
                          Annuler
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Informations personnelles */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="person" size={22} color={COLORS.secondary.base} />
                <Text style={styles.cardTitle}>Informations personnelles</Text>
                <TouchableOpacity
                  style={[
                    styles.editIconButton,
                    editable && styles.saveIconButton,
                  ]}
                  onPress={() => {
                    if (editable) {
                      handleSave();
                    } else {
                      if (!formData.showEmail) {
                        Alert.alert(
                          "Afficher l'email",
                          "Veuillez afficher votre email avant de pouvoir entamer des modifications."
                        );
                        return;
                      }
                      setEditable(true);
                    }
                  }}
                >
                  <Icon
                    name={editable ? "check" : "edit"}
                    size={20}
                    color={
                      editable ? COLORS.state.success : COLORS.secondary.base
                    }
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContent}>
                {/* Champs du formulaire */}
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Prénom</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      !editable && styles.fieldInputDisabled,
                    ]}
                    value={formData.firstName}
                    onChangeText={(text) =>
                      handleInputChange("firstName", text)
                    }
                    editable={editable}
                    placeholderTextColor={COLORS.neutral[400]}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Nom</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      !editable && styles.fieldInputDisabled,
                    ]}
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                    editable={editable}
                    placeholderTextColor={COLORS.neutral[400]}
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Nom d'utilisateur</Text>
                  <TextInput
                    style={[
                      styles.fieldInput,
                      !editable && styles.fieldInputDisabled,
                    ]}
                    value={formData.username}
                    onChangeText={(text) => handleInputChange("username", text)}
                    editable={editable}
                    placeholderTextColor={COLORS.neutral[400]}
                  />
                </View>

                {formData.showEmail && (
                  <View style={styles.formField}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        !editable && styles.fieldInputDisabled,
                      ]}
                      value={formData.email}
                      onChangeText={(text) => handleInputChange("email", text)}
                      editable={editable}
                      placeholderTextColor={COLORS.neutral[400]}
                      keyboardType="email-address"
                    />
                  </View>
                )}

                <View style={styles.switchContainer}>
                  <View style={styles.switchInfo}>
                    <Icon
                      name="visibility"
                      size={20}
                      color={COLORS.secondary.base}
                    />
                    <Text style={styles.switchLabel}>
                      Partager mon email avec les autres utilisateurs
                    </Text>
                  </View>
                  <Switch
                    value={formData.showEmail}
                    onValueChange={async (value) => {
                      try {
                        const response = await axios.post(
                          `${API_URL}/users/show-email`,
                          {
                            userId: user?.id,
                            showEmail: value,
                          }
                        );

                        const updatedShowEmail = response.data.showEmail;

                        setFormData((prevState) => ({
                          ...prevState,
                          showEmail: updatedShowEmail,
                          email: updatedShowEmail ? user?.email || "" : "",
                        }));

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
                    trackColor={{
                      false: COLORS.neutral[300],
                      true: COLORS.secondary.light,
                    }}
                    thumbColor={
                      formData.showEmail
                        ? COLORS.secondary.base
                        : COLORS.neutral[50]
                    }
                    ios_backgroundColor={COLORS.neutral[300]}
                  />
                </View>
              </View>
            </View>

            {/* Sécurité */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="lock" size={22} color={COLORS.secondary.base} />
                <Text style={styles.cardTitle}>Sécurité</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Mot de passe actuel</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.neutral[400]}
                      secureTextEntry={!showCurrentPassword}
                      value={formData.currentPassword}
                      onChangeText={(text) =>
                        handleInputChange("currentPassword", text)
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      <Icon
                        name={
                          showCurrentPassword ? "visibility-off" : "visibility"
                        }
                        size={20}
                        color={COLORS.neutral[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formField}>
                  <Text style={styles.fieldLabel}>Nouveau mot de passe</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.neutral[400]}
                      secureTextEntry={!showNewPassword}
                      value={formData.newPassword}
                      onChangeText={(text) =>
                        handleInputChange("newPassword", text)
                      }
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Icon
                        name={showNewPassword ? "visibility-off" : "visibility"}
                        size={20}
                        color={COLORS.neutral[500]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleChangePassword}
                >
                  <Icon
                    name="vpn-key"
                    size={16}
                    color={COLORS.primary.contrast}
                  />
                  <Text style={styles.actionButtonText}>
                    Changer mon mot de passe
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Statistiques */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon
                  name="bar-chart"
                  size={22}
                  color={COLORS.secondary.base}
                />
                <Text style={styles.cardTitle}>Statistiques</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Icon
                    name="thumb-up"
                    size={20}
                    color={COLORS.secondary.base}
                  />
                  <Text style={styles.statValue}>
                    {stats?.numberOfVotes || 0}
                  </Text>
                  <Text style={styles.statLabel}>Votes</Text>
                </View>

                <View style={styles.statCard}>
                  <Icon
                    name="comment"
                    size={20}
                    color={COLORS.secondary.base}
                  />
                  <Text style={styles.statValue}>
                    {stats?.numberOfComments || 0}
                  </Text>
                  <Text style={styles.statLabel}>Commentaires</Text>
                </View>

                <View style={styles.statCard}>
                  <Icon name="flag" size={20} color={COLORS.secondary.base} />
                  <Text style={styles.statValue}>
                    {stats?.numberOfReports || 0}
                  </Text>
                  <Text style={styles.statLabel}>Signalements</Text>
                </View>

                <View style={styles.statCard}>
                  <Icon
                    name="article"
                    size={20}
                    color={COLORS.secondary.base}
                  />
                  <Text style={styles.statValue}>
                    {stats?.numberOfPosts || 0}
                  </Text>
                  <Text style={styles.statLabel}>Publications</Text>
                </View>

                <View style={styles.statCard}>
                  <Icon name="event" size={20} color={COLORS.secondary.base} />
                  <Text style={styles.statValue}>
                    {stats?.numberOfEventsCreated || 0}
                  </Text>
                  <Text style={styles.statLabel}>Événements créés</Text>
                </View>

                <View style={styles.statCard}>
                  <Icon name="people" size={20} color={COLORS.secondary.base} />
                  <Text style={styles.statValue}>
                    {stats?.numberOfEventsAttended || 0}
                  </Text>
                  <Text style={styles.statLabel}>Participations</Text>
                </View>
              </View>
            </View>

            {/* Adhésions */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon
                  name="card-membership"
                  size={22}
                  color={COLORS.secondary.base}
                />
                <Text style={styles.cardTitle}>Options d'adhésion</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.membershipItem}>
                  <View style={styles.membershipInfo}>
                    <View style={styles.membershipBadge}>
                      <Icon
                        name="star"
                        size={16}
                        color={
                          user?.isSubscribed
                            ? COLORS.state.warning
                            : COLORS.neutral[400]
                        }
                      />
                    </View>
                    <View>
                      <Text style={styles.membershipTitle}>SMART+</Text>
                      <Text style={styles.membershipDescription}>
                        Accès à toutes les services de l'application
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.membershipStatus,
                      user?.isSubscribed
                        ? styles.membershipActive
                        : styles.membershipInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.membershipStatusText,
                        user?.isSubscribed
                          ? styles.membershipActiveText
                          : styles.membershipInactiveText,
                      ]}
                    >
                      {user?.isSubscribed ? "Actif" : "Inactif"}
                    </Text>
                  </View>
                </View>

                <View style={styles.membershipDivider} />

                <View style={styles.membershipItem}>
                  <View style={styles.membershipInfo}>
                    <View style={styles.membershipBadge}>
                      <Icon
                        name="apartment"
                        size={16}
                        color={
                          user?.isMunicipality
                            ? COLORS.state.info
                            : COLORS.neutral[400]
                        }
                      />
                    </View>
                    <View>
                      <Text style={styles.membershipTitle}>
                        Affiliation mairie
                      </Text>
                      <Text style={styles.membershipDescription}>
                        Statut officiel pour les comptes municipaux
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.membershipStatus,
                      user?.isMunicipality
                        ? styles.membershipActive
                        : styles.membershipInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.membershipStatusText,
                        user?.isMunicipality
                          ? styles.membershipActiveText
                          : styles.membershipInactiveText,
                      ]}
                    >
                      {user?.isMunicipality ? "Vérifié" : "Non vérifié"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal pour la recherche de ville */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une ville</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon name="close" size={24} color={COLORS.neutral[600]} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={suggestions}
              keyExtractor={(item, index) =>
                `${item.Code_commune_INSEE}-${index}`
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleCitySelection(item)}
                  activeOpacity={0.7}
                >
                  <Icon name="place" size={18} color={COLORS.secondary.base} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionCity}>
                      {item.Nom_commune}
                    </Text>
                    <Text style={styles.suggestionPostal}>
                      {item.Code_postal}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={20}
                    color={COLORS.neutral[400]}
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.suggestionDivider} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            />
          </View>
        </View>
      </Modal>

      <ProfilePhotoModal
        visible={showProfilePhotoModal}
        onClose={() => setShowProfilePhotoModal(false)}
        currentPhotoUrl={user?.profilePhoto?.url || null}
        onSuccess={handlePhotoUpdateSuccess}
        username={user?.username || "Utilisateur"}
        isSubmitting={false}
        isFollowing={false}
        onFollow={() => Promise.resolve()}
        onUnfollow={() => Promise.resolve()}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        navigation={navigation}
        user={user}
        stats={stats}
        displayName={`${formData.lastName} ${formData.firstName} `}
        unreadCount={unreadCount}
        voteSummary={stats?.voteSummary || {}}
        onShowNameModal={() => setIsEditingCity(true)}
        onLogout={() => navigation.replace("LoginScreen")}
        onNavigateToSettings={() => navigation.navigate("SettingsScreen")}
        onShowVoteInfoModal={() => console.log("Show vote info modal")}
        onNavigateToCity={() => console.log("Navigate to city")}
        updateProfileImage={handleProfileImageUpdateWrapper}
      />
      <FollowersModal
        visible={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        followers={user?.followers || []}
        onUserPress={handleFollowingUserPress}
      />
      <FollowingModal
        visible={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        following={user?.following || []}
        onUserPress={handleFollowingUserPress}
      />
    </View>
  );
}

// Styles modernisés avec un design épuré et une meilleure hiérarchie visuelle
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[500],
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary.contrast,
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.accent.base,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: COLORS.accent.contrast,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Loading and error styles
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[700],
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.neutral[50],
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.neutral[800],
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: COLORS.secondary.base,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonText: {
    color: COLORS.secondary.contrast,
    fontWeight: "600",
    fontSize: 16,
  },

  // Main content styles
  scrollContent: {
    paddingBottom: 30,
  },
  fadeIn: {
    width: "100%",
  },

  // Profile section
  profileSection: {
    marginBottom: 16,
  },
  profileGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageWrapper: {
    marginRight: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.neutral[300],
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.neutral[50],
    textTransform: "uppercase",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary.contrast,
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  photoButtonText: {
    fontSize: 14,
    color: COLORS.primary.contrast,
    marginLeft: 6,
    fontWeight: "500",
  },

  // Quick stats row
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickStatItem: {
    alignItems: "center",
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary.base,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: COLORS.neutral[300],
    alignSelf: "center",
  },

  // Cards container
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
    padding: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[800],
    marginLeft: 10,
    flex: 1,
  },
  editIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },
  saveIconButton: {
    backgroundColor: COLORS.neutral[200],
  },
  cardContent: {
    padding: 16,
  },

  // Form fields
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.neutral[600],
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.neutral[800],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  fieldInputDisabled: {
    backgroundColor: COLORS.neutral[200],
    color: COLORS.neutral[700],
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.neutral[700],
    marginLeft: 8,
    flex: 1,
  },

  // Password fields
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.neutral[800],
  },
  eyeIcon: {
    padding: 10,
  },

  // Action buttons
  actionButton: {
    backgroundColor: COLORS.secondary.base,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  actionButtonText: {
    color: COLORS.secondary.contrast,
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },

  // Location display
  locationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  locationInfo: {
    marginLeft: 15,
  },
  locationCity: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  locationPostal: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 2,
  },

  // City edit
  cityEditContainer: {
    marginTop: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: COLORS.neutral[800],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  searchButton: {
    backgroundColor: COLORS.secondary.base,
    width: 46,
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  cityActionButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  cityActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: COLORS.secondary.base,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  cityActionButtonCancel: {
    backgroundColor: COLORS.neutral[200],
  },
  cityActionButtonText: {
    color: COLORS.secondary.contrast,
    fontWeight: "600",
    fontSize: 14,
  },
  cityActionButtonTextCancel: {
    color: COLORS.neutral[700],
    fontWeight: "600",
    fontSize: 14,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statCard: {
    width: "30%",
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary.base,
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral[600],
    textAlign: "center",
  },

  // Membership section
  // Styles pour la section d'adhésion
  membershipItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  membershipInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  membershipBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[800],
    marginBottom: 3,
  },
  membershipDescription: {
    fontSize: 13,
    paddingRight: 50,
    color: COLORS.neutral[600],
  },
  membershipStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  membershipActive: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  membershipInactive: {
    backgroundColor: "rgba(114, 114, 114, 0.15)",
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  membershipStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  membershipActiveText: {
    color: COLORS.state.success,
  },
  membershipInactiveText: {
    color: COLORS.neutral[800], // Couleur plus foncée pour une meilleure lisibilité
  },
  membershipDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 10,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.neutral[50],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "100%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[200],
    justifyContent: "center",
    alignItems: "center",
  },

  // Suggestion items
  suggestionsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionCity: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.neutral[800],
  },
  suggestionPostal: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },

  // User list items
  userListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  userListItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userListAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userListAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.neutral[300],
    justifyContent: "center",
    alignItems: "center",
  },
  userListAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.neutral[50],
  },
  userListInfo: {
    marginLeft: 15,
  },
  userListName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.neutral[800],
  },
  userListDetail: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 2,
  },
  userListDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  emptyListContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyListText: {
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: "center",
    marginTop: 16,
  },
  unfollowButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  unfollowButtonText: {
    color: COLORS.state.error,
    fontSize: 13,
    fontWeight: "600",
  },
});
