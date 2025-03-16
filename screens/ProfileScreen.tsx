// src/screens/ProfileScreen.tsx

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Platform,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import { getUserIdFromToken } from "../utils/tokenUtils";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import Sidebar from "../components/common/Sidebar";
import { useNotification } from "../context/NotificationContext";
import franceCitiesRaw from "../assets/france.json";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Types et interfaces
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

interface User {
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
}

interface StatCard {
  title: string;
  icon: string;
  items: { label: string; value: number | string }[];
  onPress?: () => void;
}

const franceCities: City[] = franceCitiesRaw as City[];

/**
 * Écran de profil utilisateur
 * Affiche et permet de modifier les informations de l'utilisateur connecté
 */
export default function ProfileScreen({ navigation }) {
  const { unreadCount } = useNotification();

  // États liés à l'utilisateur et au chargement
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [stats, setStats] = useState<any>(null);

  // États liés au formulaire
  const [editable, setEditable] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    showEmail: false,
    currentPassword: "",
    newPassword: "",
  });

  // États liés à la ville
  const [isEditingCity, setIsEditingCity] = useState(false);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // États liés aux relations
  const [selectedList, setSelectedList] = useState<"followers" | "following" | null>(null);

  // Récupération des données utilisateur au chargement
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
    async function fetchUser() {
      try {
        const userId = await getUserIdFromToken();
        setCurrentUserId(userId);
        if (!userId) throw new Error("ID utilisateur non trouvé");

        const response = await fetch(`${API_URL}/users/${userId}`);
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des données utilisateur");

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

  // Mise à jour du formulaire lorsque les données utilisateur sont chargées
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

  // Récupération des statistiques utilisateur
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/stats/${user.id}`);
        if (response.status !== 200) {
          throw new Error(`Erreur API : ${response.statusText}`);
        }
        setStats(response.data);
      } catch (error: any) {
        console.error("Erreur dans fetchStats :", error.message || error);
        setError("Impossible de récupérer les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Gestion de la mise à jour de la photo de profil
  const handleProfileImageUpdate = useCallback(async () => {
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

      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("ID utilisateur non trouvé");

      const responsePost = await fetch(`${API_URL}/users/${userId}/profile-image`, {
        method: "POST",
        body: formData,
      });

      if (!responsePost.ok) {
        const errorBody = await responsePost.text();
        console.error("Response body:", errorBody);
        throw new Error("Échec de la mise à jour de la photo de profil");
      }

      navigation.replace("ProfileScreen");
    } catch (err: any) {
      console.error("Erreur lors de l'upload :", err.message);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [navigation]);

  // Gestion des modifications de champs du formulaire
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Gestion de la sauvegarde des informations de profil
  const handleSave = useCallback(async () => {
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
        headers: { "Content-Type": "application/json" },
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
  }, [formData, user]);

  // Gestion du changement de mot de passe
  const handleChangePassword = useCallback(async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/${user?.id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Mot de passe actuel incorrect ou autre erreur.");
      }

      Alert.alert("Succès", "Mot de passe modifié avec succès.");
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Impossible de modifier le mot de passe.");
    }
  }, [formData, user]);

  // Gestion du menu latéral
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Recherche de ville
  const handleSearchCity = useCallback(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      Alert.alert("Erreur", "Veuillez entrer un code postal ou un nom de ville.");
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
      Alert.alert("Erreur", "Aucune ville ou code postal correspondant trouvé.");
    }
  }, [query]);

  // Sélection d'une ville
  const handleCitySelection = useCallback((city: City) => {
    setSelectedCity(city);
    setModalVisible(false);
    setQuery(`${city.Nom_commune} (${city.Code_postal})`);
  }, []);

  // Sauvegarde de la ville
  const handleSaveCity = useCallback(async () => {
    if (!selectedCity) {
      Alert.alert("Erreur", "Veuillez sélectionner une ville avant d'enregistrer.");
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/users/${user?.id}`, {
        nomCommune: selectedCity.Nom_commune,
        codePostal: selectedCity.Code_postal,
      });

      if (response.status === 200) {
        Alert.alert("Succès", "Votre ville a été mise à jour avec succès.");
        setUser(prev => prev ? ({
          ...prev,
          nomCommune: selectedCity.Nom_commune,
          codePostal: selectedCity.Code_postal,
        }) : null);
        setIsEditingCity(false);
      } else {
        throw new Error("Erreur serveur");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la ville.");
    }
  }, [selectedCity, user]);

  // Gestion des listes de followers/following
  const handleShowList = useCallback((listType: "followers" | "following") => {
    setSelectedList(prev => (prev === listType ? null : listType));
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedList(null);
  }, []);

  // Gestion du unfollow
  const handleUnfollow = useCallback(async (followingUserId) => {
    if (!currentUserId) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/users/${followingUserId}/unfollow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du désuivi de cet utilisateur.");
      }

      setUser(prevUser =>
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
  }, [currentUserId]);

  // Préparation des cartes de statistiques
  const statCards = useMemo<StatCard[]>(() => [
    {
      title: "Activité",
      icon: "chart-timeline-variant",
      items: [
        { label: "Signalements", value: stats?.numberOfReports || 0 },
        { label: "Commentaires", value: stats?.numberOfComments || 0 },
        { label: "Votes", value: stats?.numberOfVotes || 0 },
      ]
    },
    {
      title: "Social",
      icon: "account-group",
      items: [
        { label: "Publications", value: stats?.numberOfPosts || 0 },
        { label: "Évènements créés", value: stats?.numberOfEventsCreated || 0 },
        { label: "Participations", value: stats?.numberOfEventsAttended || 0 },
      ]
    },
    {
      title: "Relations",
      icon: "account-multiple",
      items: [
        { label: "Abonnés", value: user?.followers?.length || 0 },
        { label: "Abonnements", value: user?.following?.length || 0 },
      ],
      onPress: () => handleShowList("followers")
    },
    {
      title: "Abonnement",
      icon: "star-circle",
      items: [
        { label: "SMART+", value: user?.isSubscribed ? "Actif" : "Inactif" },
        { label: "Mairie", value: user?.isMunicipality ? "Oui" : "Non" },
      ]
    }
  ], [stats, user, handleShowList]);

  // Affichage loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <ActivityIndicator size="large" color="#062C41" />
        <Text style={styles.loadingText}>Chargement des informations...</Text>
      </View>
    );
  }

  // Affichage erreur
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <Icon name="alert-circle-outline" size={60} color="#d81b60" />
        <Text style={styles.errorText}>Erreur : {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.replace("ProfileScreen")}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Affichage principal
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#062C41" />
      
      {/* Header modernisé */}
      <LinearGradient
        colors={['#062C41', '#0c4c6d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Mon Profil</Text>
        
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate("NotificationsScreen")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="bell" size={26} color="#FFFFFF" />
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
        {/* Section Photo de profil */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {user?.profilePhoto?.url ? (
              <Image
                source={{ uri: user.profilePhoto.url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Icon name="account" size={60} color="#FFFFFF" />
              </View>
            )}
          </View>
          
          <Text style={styles.username}>
            {user?.username || `${user?.firstName} ${user?.lastName}`}
          </Text>
          
          <TouchableOpacity
            style={styles.updatePhotoButton}
            onPress={handleProfileImageUpdate}
            disabled={isSubmitting}
          >
            <Icon name="camera" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.updateButtonText}>
              {isSubmitting ? "Chargement..." : "Modifier la photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Ville */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="map-marker" size={20} color="#062C41" />
            <Text style={styles.cardTitle}>Ville de référence</Text>
            {!isEditingCity && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingCity(true)}
              >
                <Icon name="pencil" size={16} color="#062C41" />
              </TouchableOpacity>
            )}
          </View>
          
          {!isEditingCity ? (
            <View style={styles.cityInfo}>
              <Text style={styles.cityName}>
                {user?.nomCommune || "Non définie"}
              </Text>
              <Text style={styles.cityPostalCode}>
                {user?.codePostal ? `(${user.codePostal})` : ""}
              </Text>
            </View>
          ) : (
            <View style={styles.editCityContainer}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Code postal ou nom de ville"
                  value={query}
                  onChangeText={setQuery}
                  placeholderTextColor="#AAA"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchCity}
                >
                  <Icon name="magnify" size={22} color="#062C41" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.editCityActions}>
                <TouchableOpacity
                  style={[styles.cityActionButton, styles.saveCityButton]}
                  onPress={handleSaveCity}
                >
                  <Text style={styles.cityActionButtonText}>Enregistrer</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.cityActionButton, styles.cancelCityButton]}
                  onPress={() => setIsEditingCity(false)}
                >
                  <Text style={[styles.cityActionButtonText, styles.cancelButtonText]}>
                    Annuler
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Section Informations personnelles */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="account-details" size={20} color="#062C41" />
            <Text style={styles.cardTitle}>Informations personnelles</Text>
            {!editable && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  if (!formData.showEmail) {
                    Alert.alert(
                      "Information",
                      "Activez le partage d'email pour pouvoir modifier vos informations."
                    );
                    return;
                  }
                  setEditable(true);
                }}
              >
                <Icon name="pencil" size={16} color="#062C41" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.formContainer}>
            {/* Prénom */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Prénom</Text>
              <TextInput
                style={[styles.fieldInput, !editable && styles.disabledInput]}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
                editable={editable}
                placeholder="Votre prénom"
              />
            </View>
            
            {/* Nom */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nom</Text>
              <TextInput
                style={[styles.fieldInput, !editable && styles.disabledInput]}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
                editable={editable}
                placeholder="Votre nom"
              />
            </View>
            
            {/* Nom d'utilisateur */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nom d'utilisateur</Text>
              <TextInput
                style={[styles.fieldInput, !editable && styles.disabledInput]}
                value={formData.username}
                onChangeText={(text) => handleInputChange("username", text)}
                editable={editable}
                placeholder="Votre nom d'utilisateur"
              />
            </View>
            
            {/* Email */}
            {formData.showEmail && (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={[styles.fieldInput, !editable && styles.disabledInput]}
                  value={formData.email}
                  onChangeText={(text) => handleInputChange("email", text)}
                  editable={editable}
                  placeholder="Votre email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            )}
            
            {/* Option partage email */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Partager mon email avec les autres utilisateurs
              </Text>
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
                    setFormData(prev => ({
                      ...prev,
                      showEmail: updatedShowEmail,
                      email: updatedShowEmail ? user?.email || "" : "",
                    }));

                    const refreshedUser = await fetch(
                      `${API_URL}/users/${user?.id}`
                    ).then((res) => res.json());
                    setUser(refreshedUser);
                  } catch (error) {
                    console.error("Erreur:", error);
                    Alert.alert("Erreur", "Impossible de mettre à jour la préférence.");
                  }
                }}
                trackColor={{ false: "#D1D1D1", true: "#81b0ff" }}
                thumbColor={formData.showEmail ? "#062C41" : "#f4f3f4"}
              />
            </View>
            
            {/* Bouton Sauvegarder */}
            {editable && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Icon name="content-save" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section Mot de passe */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="lock" size={20} color="#062C41" />
            <Text style={styles.cardTitle}>Sécurité</Text>
          </View>
          
          <View style={styles.formContainer}>
            {/* Mot de passe actuel */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Mot de passe actuel</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.currentPassword}
                  onChangeText={(text) => handleInputChange("currentPassword", text)}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Entrez votre mot de passe actuel"
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Icon name={showCurrentPassword ? "eye-off" : "eye"} size={20} color="#777" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Nouveau mot de passe */}
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nouveau mot de passe</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.newPassword}
                  onChangeText={(text) => handleInputChange("newPassword", text)}
                  secureTextEntry={!showNewPassword}
                  placeholder="Entrez le nouveau mot de passe"
                />
                <TouchableOpacity
                  style={styles.visibilityToggle}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Icon name={showNewPassword ? "eye-off" : "eye"} size={20} color="#777" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Bouton Changer mot de passe */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleChangePassword}
            >
              <Icon name="lock-reset" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Modifier le mot de passe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cartes de statistiques */}
        {statCards.map((card, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.card}
            onPress={card.onPress}
            disabled={!card.onPress}
          >
            <View style={styles.cardHeader}>
              <Icon name={card.icon} size={20} color="#062C41" />
              <Text style={styles.cardTitle}>{card.title}</Text>
              {card.onPress && (
                <Icon name="chevron-right" size={20} color="#062C41" />
              )}
            </View>
            
            <View style={styles.statItems}>
              {card.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.statItem}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal pour les suggestions de villes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez une ville</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#062C41" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={suggestions}
              keyExtractor={(item, index) => `${item.Code_commune_INSEE}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleCitySelection(item)}
                >
                  <Text style={styles.cityName}>{item.Nom_commune}</Text>
                  <Text style={styles.cityPostalCode}>{item.Code_postal}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            />
          </View>
        </View>
      </Modal>

      {/* Modal pour les relations */}
      {selectedList && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.followersModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedList === "followers" ? "Vos abonnés" : "Vos abonnements"}
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Icon name="close" size={24} color="#062C41" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={selectedList === "followers" ? user?.followers : user?.following}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.followItem}>
                    <Image
                      source={{
                        uri: item.profilePhoto || "https://via.placeholder.com/150",
                      }}
                      style={styles.followAvatar}
                    />
                    <Text style={styles.followName}>{item.username}</Text>
                    
                    {selectedList === "following" && (
                      <TouchableOpacity
                        style={styles.unfollowButton}
                        onPress={() => handleUnfollow(item.id)}
                      >
                        <Text style={styles.unfollowButtonText}>Se désabonner</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                contentContainerStyle={styles.followList}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <Icon name="account-off" size={50} color="#DDD" />
                    <Text style={styles.emptyListText}>
                      Aucun {selectedList === "followers" ? "abonné" : "abonnement"} pour le moment
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </SafeAreaView>
  );
}

// Styles modernisés
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#062C41",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d81b60",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#062C41",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  
  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  notificationButton: {
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#d81b60",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  
  // Scroll content
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  
  // Profile section
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#E1E1E1",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#999",
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  updatePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#062C41",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  
  // Card styles
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#062C41",
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  
  // City info styles
  cityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cityName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  cityPostalCode: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  editCityContainer: {
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 15,
  },
  searchButton: {
    padding: 10,
    backgroundColor: "#F0F0F0",
  },
  editCityActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cityActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  saveCityButton: {
    backgroundColor: "#062C41",
    marginRight: 8,
  },
  cancelCityButton: {
    backgroundColor: "#F0F0F0",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  cityActionButtonText: {
    fontWeight: "500",
    color: "#FFFFFF",
  },
  cancelButtonText: {
    color: "#333",
  },
  
  // Form styles
  formContainer: {
    width: "100%",
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#777",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: "#555",
    flex: 1,
    marginRight: 10,
  },
  passwordInputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    overflow: "hidden",
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 15,
  },
  visibilityToggle: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: "#062C41",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  
  // Stats styles
  statItems: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    padding: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#062C41",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  followersModalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#062C41",
  },
  suggestionsList: {
    paddingVertical: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  
  // Follow list styles
  followList: {
    paddingVertical: 8,
  },
  followItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  followAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  followName: {
    fontSize: 16,
    flex: 1,
    color: "#333",
  },
  unfollowButton: {
    backgroundColor: "#f44336",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  unfollowButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyListContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyListText: {
    marginTop: 12,
    color: "#999",
    fontSize: 16,
    textAlign: "center",
  },
});


// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Image,
//   TextInput,
//   Alert,
//   Switch,
//   Modal,
//   FlatList,
// } from "react-native";
// // @ts-ignore
// import { API_URL } from "@env";
// import { getUserIdFromToken } from "../utils/tokenUtils";
// import * as ImagePicker from "expo-image-picker";
// import styles from "./styles/ProfileScreen.styles";
// import axios from "axios";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Sidebar from "../components/common/Sidebar";
// import { useNotification } from "../context/NotificationContext";
// import franceCitiesRaw from "../assets/france.json";
// import { Ionicons } from "@expo/vector-icons";

// const franceCities: City[] = franceCitiesRaw as City[];

// interface City {
//   Code_commune_INSEE: number;
//   Nom_commune: string;
//   Code_postal: string;
//   Libelle_acheminement: string;
//   Ligne_5: string;
//   coordonnees_gps: string;
// }

// interface FormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   username: string;
//   showEmail: boolean;
//   currentPassword: string;
//   newPassword: string;
// }

// interface HandleInputChange {
//   (field: keyof FormData, value: string): void;
// }

// type User = {
//   id: string;
//   createdAt: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   showEmail: boolean;
//   username?: string;
//   trustRate?: number;
//   followers?: any[];
//   following?: any[];
//   reports?: any[];
//   comments?: any[];
//   posts?: any[];
//   organizedEvents?: any[];
//   attendedEvents?: any[];
//   nomCommune?: string;
//   codePostal?: string;
//   latitude?: number;
//   longitude?: number;
//   profilePhoto?: { url: string };
//   isSubscribed: boolean;
//   isMunicipality: boolean;
// };

// export default function ProfileScreen({ navigation }) {
//   const { unreadCount } = useNotification();

//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [editable, setEditable] = useState(false);
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     username: "",
//     showEmail: false,
//     currentPassword: "",
//     newPassword: "",
//   });
//   const [stats, setStats] = useState<any>(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isEditingCity, setIsEditingCity] = useState(false);
//   const [suggestions, setSuggestions] = useState<City[]>([]);
//   const [query, setQuery] = useState("");
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedCity, setSelectedCity] = useState<City | null>(null);
//   const [selectedList, setSelectedList] = useState<
//     "followers" | "following" | null
//   >(null);
//   const [currentUserId, setCurrentUserId] = useState<number | null>(null);

//   useEffect(() => {
//     navigation.setOptions({
//       gestureEnabled: false,
//     });
//     async function fetchUser() {
//       try {
//         const userId = await getUserIdFromToken();
//         setCurrentUserId(userId);
//         if (!userId) throw new Error("ID utilisateur non trouvé");

//         const response = await fetch(`${API_URL}/users/${userId}`);
//         if (!response.ok)
//           throw new Error(
//             "Erreur lors de la récupération des données utilisateur"
//           );

//         const data: User = await response.json();
//         setUser(data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUser();
//   }, [navigation]);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         firstName: user.firstName || "",
//         lastName: user.lastName || "",
//         email: user.showEmail ? user.email || "" : "",
//         showEmail: user.showEmail || false,
//         username: user.username || "",
//         currentPassword: "",
//         newPassword: "",
//       });
//     }
//   }, [user]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       if (!user?.id) return;

//       try {
//         setLoading(true);
//         setError(null);

//         const response = await axios.get(`${API_URL}/users/stats/${user.id}`);
//         if (response.status !== 200) {
//           throw new Error(`Erreur API : ${response.statusText}`);
//         }

//         const data = response.data;
//         setStats(data);
//       } catch (error: any) {
//         console.error("Erreur dans fetchStats :", error.message || error);
//         setError("Impossible de récupérer les statistiques.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStats();
//   }, [user]);

//   const handleProfileImageUpdate = async () => {
//     try {
//       setIsSubmitting(true);

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         quality: 1,
//         aspect: [1, 1],
//       });

//       if (result.canceled) {
//         setIsSubmitting(false);
//         return;
//       }

//       const photoUri = result.assets?.[0]?.uri;

//       if (!photoUri) {
//         throw new Error("Aucune image sélectionnée");
//       }

//       const formData = new FormData();
//       formData.append("profileImage", {
//         uri: photoUri,
//         type: "image/jpeg",
//         name: "profile.jpg",
//       } as any);

//       console.log("FormData clé et valeur:", formData);

//       const userId = await getUserIdFromToken();
//       if (!userId) throw new Error("ID utilisateur non trouvé");

//       const responsePost = await fetch(
//         `${API_URL}/users/${userId}/profile-image`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       console.log("Response status:", responsePost.status);

//       if (!responsePost.ok) {
//         const errorBody = await responsePost.text();
//         console.error("Response body:", errorBody);
//         throw new Error("Échec de la mise à jour de la photo de profil");
//       }

//       const updatedUser = await responsePost.json();
//       console.log("Response body:", updatedUser);

//       navigation.replace("ProfileScreen");
//     } catch (err: any) {
//       console.error("Erreur lors de l'upload :", err.message);
//       setError(err.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleInputChange: HandleInputChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSave = async () => {
//     try {
//       const payload = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         username: formData.username,
//         showEmail: formData.showEmail.toString(),
//       };

//       const response = await fetch(`${API_URL}/users/${user?.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         throw new Error("Une erreur s'est produite lors de la sauvegarde.");
//       }

//       Alert.alert("Succès", "Les informations ont été mises à jour.");
//       setEditable(false);
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de sauvegarder les modifications.");
//     }
//   };

//   const handleChangePassword = async () => {
//     if (!formData.currentPassword || !formData.newPassword) {
//       Alert.alert("Erreur", "Veuillez remplir tous les champs.");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${API_URL}/users/${user?.id}/change-password`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             currentPassword: formData.currentPassword,
//             newPassword: formData.newPassword,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Mot de passe actuel incorrect ou autre erreur.");
//       }

//       Alert.alert("Succès", "Mot de passe modifié avec succès.");
//       setFormData((prevState) => ({
//         ...prevState,
//         currentPassword: "",
//         newPassword: "",
//       }));
//     } catch (error: any) {
//       Alert.alert(
//         "Erreur",
//         error.message || "Impossible de modifier le mot de passe."
//       );
//     }
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   const handleSearchCity = () => {
//     const trimmedQuery = query.trim();

//     if (!trimmedQuery) {
//       Alert.alert(
//         "Erreur",
//         "Veuillez entrer un code postal ou un nom de ville."
//       );
//       return;
//     }

//     const isCodePostal = /^[0-9]{5}$/.test(trimmedQuery);

//     const filteredCities = franceCities.filter((city) => {
//       const cityName = (city.Ligne_5 || city.Nom_commune).toLowerCase().trim();
//       const codePostal = city.Code_postal.toString().trim();

//       return isCodePostal
//         ? codePostal === trimmedQuery
//         : cityName.includes(trimmedQuery.toLowerCase());
//     });

//     if (filteredCities.length > 0) {
//       setSuggestions(filteredCities);
//       setModalVisible(true);
//     } else {
//       setSuggestions([]);
//       Alert.alert(
//         "Erreur",
//         "Aucune ville ou code postal correspondant trouvé."
//       );
//     }
//   };

//   const handleCitySelection = (city: City) => {
//     setSelectedCity(city);
//     setModalVisible(false);
//     setQuery(`${city.Nom_commune} (${city.Code_postal})`);
//   };

//   const handleSaveCity = async () => {
//     if (!selectedCity) {
//       Alert.alert(
//         "Erreur",
//         "Veuillez sélectionner une ville avant d'enregistrer."
//       );
//       return;
//     }

//     try {
//       const response = await axios.put(`${API_URL}/users/${user?.id}`, {
//         nomCommune: selectedCity.Nom_commune,
//         codePostal: selectedCity.Code_postal,
//       });

//       if (response.status === 200) {
//         Alert.alert("Succès", "Votre ville a été mise à jour avec succès.");
//         setUser((prev: any) => ({
//           ...prev,
//           nomCommune: selectedCity.Nom_commune,
//           codePostal: selectedCity.Code_postal,
//         }));
//         setIsEditingCity(false);
//       } else {
//         throw new Error("Erreur serveur");
//       }
//     } catch (error) {
//       console.error("Erreur lors de la mise à jour :", error);
//       Alert.alert("Erreur", "Impossible de mettre à jour la ville.");
//     }
//   };

//   const handleShowList = (listType: "followers" | "following") => {
//     setSelectedList((prev) => (prev === listType ? null : listType));
//   };

//   const handleCloseModal = () => {
//     setSelectedList(null);
//   };

//   const handleUnfollow = async (followingUserId) => {
//     if (!currentUserId) return;

//     try {
//       setIsSubmitting(true);
//       const response = await fetch(
//         `${API_URL}/users/${followingUserId}/unfollow`,
//         {
//           method: "DELETE",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ followerId: currentUserId }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Erreur lors du désuivi de cet utilisateur.");
//       }

//       setUser((prevUser) =>
//         prevUser
//           ? {
//               ...prevUser,
//               following: (prevUser.following || []).filter(
//                 (following) => following.id !== followingUserId
//               ),
//             }
//           : null
//       );
//     } catch (error) {
//       console.error(error.message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#062C41" />
//         <Text style={{ fontSize: 18, fontWeight: "bold", color: "#062C41" }}>
//           Chargement des informations..
//         </Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>Erreur : {error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         {/* Bouton pour ouvrir le menu */}
//         <TouchableOpacity onPress={toggleSidebar}>
//           <Icon
//             name="menu"
//             size={24}
//             color="#FFFFFC"
//             style={{ marginLeft: 10 }}
//           />
//         </TouchableOpacity>

//         {/* Titre de la page */}
//         <View style={styles.typeBadge}>
//           <Text style={styles.headerTitle}>MON PROFIL</Text>
//         </View>

//         {/* Bouton de notifications avec compteur */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate("NotificationsScreen")}
//         >
//           <View>
//             <Icon
//               name="notifications"
//               size={24}
//               color={unreadCount > 0 ? "#FFFFFC" : "#FFFFFC"}
//               style={{ marginRight: 10 }}
//             />
//             {unreadCount > 0 && (
//               <View style={styles.badge}>
//                 <Text style={styles.badgeText}>{unreadCount}</Text>
//               </View>
//             )}
//           </View>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.profileContent}>
//         <View style={styles.profileImageContainer}>
//           {user?.profilePhoto?.url ? (
//             <Image
//               source={{ uri: user.profilePhoto.url }}
//               style={styles.profileImage}
//             />
//           ) : (
//             <Text style={styles.noProfileImageText}>
//               Pas de photo de profil
//             </Text>
//           )}
//           <TouchableOpacity
//             style={styles.updateButton}
//             onPress={handleProfileImageUpdate}
//             disabled={isSubmitting}
//           >
//             <Text style={styles.updateButtonText}>
//               {isSubmitting ? "Modification..." : "Modifier la photo de profil"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Section Informations de base */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitleProfil}>
//             Informations personnelles
//           </Text>
//           {/* Prénom */}
//           <View style={styles.fieldContainer}>
//             <Text style={styles.label}>Prénom :</Text>
//             <TextInput
//               style={[styles.input, !editable && styles.inputDisabled]}
//               value={formData.firstName}
//               onChangeText={(text) => handleInputChange("firstName", text)}
//               editable={editable}
//             />
//           </View>
//           {/* Nom */}
//           <View style={styles.fieldContainer}>
//             <Text style={styles.label}>Nom :</Text>
//             <TextInput
//               style={[styles.input, !editable && styles.inputDisabled]}
//               value={formData.lastName}
//               onChangeText={(text) => handleInputChange("lastName", text)}
//               editable={editable}
//             />
//           </View>
//           {/* Nom d'utilisateur */}
//           <View style={styles.fieldContainer}>
//             <Text style={styles.label}>Nom d'utilisateur :</Text>
//             <TextInput
//               style={[styles.input, !editable && styles.inputDisabled]}
//               value={formData.username}
//               onChangeText={(text) => handleInputChange("username", text)}
//               editable={editable}
//             />
//           </View>
//           {/* Email */}
//           {formData.showEmail && (
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Email :</Text>
//               <TextInput
//                 style={[styles.input, !editable && styles.inputDisabled]}
//                 value={formData.email}
//                 onChangeText={(text) => handleInputChange("email", text)}
//                 editable={editable}
//               />
//             </View>
//           )}

//           <View style={styles.fieldContainer}>
//             <View style={styles.showEmail}>
//               <Text style={styles.labelEmail}>
//                 Activer ou désactiver le partage de votre email avec les autres
//                 utilisateurs.
//               </Text>
//               <Switch
//                 value={formData.showEmail}
//                 onValueChange={async (value) => {
//                   try {
//                     const response = await axios.post(
//                       `${API_URL}/users/show-email`,
//                       {
//                         userId: user?.id,
//                         showEmail: value,
//                       }
//                     );

//                     const updatedShowEmail = response.data.showEmail;

//                     setFormData((prevState) => ({
//                       ...prevState,
//                       showEmail: updatedShowEmail,
//                       email: updatedShowEmail ? user?.email || "" : "",
//                     }));

//                     const refreshedUser = await fetch(
//                       `${API_URL}/users/${user?.id}`
//                     ).then((res) => res.json());
//                     setUser(refreshedUser);
//                   } catch (error) {
//                     console.error(
//                       "Erreur lors de la mise à jour de la préférence :",
//                       error
//                     );
//                     Alert.alert(
//                       "Erreur",
//                       "Impossible de mettre à jour la préférence."
//                     );
//                   }
//                 }}
//               />
//             </View>
//           </View>

//           {/* Bouton Sauvegarder/Modifier */}
//           <TouchableOpacity
//             style={styles.buttonProfil}
//             onPress={() => {
//               if (editable) {
//                 handleSave();
//                 setEditable(false);
//               } else {
//                 if (!formData.showEmail) {
//                   Alert.alert(
//                     "Afficher l'email",
//                     "Veuillez afficher votre email avant de pouvoir entamer des modifications."
//                   );
//                   return;
//                 }

//                 setEditable(true);
//               }
//             }}
//           >
//             <Text style={styles.buttonTextProfil}>
//               {editable ? "Sauvegarder" : "Modifier"}
//             </Text>
//           </TouchableOpacity>

//           <View style={styles.section}>
//             <Text style={styles.sectionTitleProfil}>
//               Modifier le mot de passe
//             </Text>

//             {/* Mot de passe actuel */}
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Mot de passe actuel :</Text>
//               <View style={styles.inputContainer}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Entrez votre mot de passe actuel"
//                   secureTextEntry={!showCurrentPassword}
//                   value={formData.currentPassword}
//                   onChangeText={(text) =>
//                     setFormData({ ...formData, currentPassword: text })
//                   }
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowCurrentPassword(!showCurrentPassword)}
//                 >
//                   <Icon
//                     name={showCurrentPassword ? "visibility-off" : "visibility"}
//                     size={20}
//                     color="gray"
//                     style={styles.icon}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Nouveau mot de passe */}
//             <View style={styles.fieldContainer}>
//               <Text style={styles.label}>Nouveau mot de passe :</Text>
//               <View style={styles.inputContainer}>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Entrez le nouveau mot de passe"
//                   secureTextEntry={!showNewPassword}
//                   value={formData.newPassword}
//                   onChangeText={(text) =>
//                     setFormData({ ...formData, newPassword: text })
//                   }
//                 />
//                 <TouchableOpacity
//                   onPress={() => setShowNewPassword(!showNewPassword)}
//                 >
//                   <Icon
//                     name={showNewPassword ? "visibility-off" : "visibility"}
//                     size={20}
//                     color="gray"
//                     style={styles.icon}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Bouton Sauvegarder */}
//             <TouchableOpacity
//               style={styles.buttonProfil}
//               onPress={handleChangePassword}
//             >
//               <Text style={styles.buttonTextProfil}>
//                 Modifier le mot de passe
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View style={styles.cardContainer}>
//           <Text style={styles.infoCardHeader}>Ville de référence</Text>

//           {/* Affichage de la ville actuelle */}
//           <View style={styles.cardContent}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {user?.nomCommune || "Non disponible"}
//               </Text>
//               <Text style={styles.statLabel}>Ville</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {user?.codePostal || "Non disponible"}
//               </Text>
//               <Text style={styles.statLabel}>Code postal</Text>
//             </View>
//           </View>

//           {/* Bouton pour activer la modification */}
//           <TouchableOpacity
//             style={styles.editButton}
//             onPress={() => setIsEditingCity(true)}
//           >
//             <Text style={styles.editButtonText}>Modifier ma ville</Text>
//           </TouchableOpacity>

//           {/* Mode édition */}
//           {isEditingCity && (
//             <View style={styles.editContainer}>
//               {/* Champ de recherche */}
//               <View style={styles.searchContainer}>
//                 <TextInput
//                   style={styles.inputCity}
//                   placeholder="Rechercher par code postal"
//                   value={query}
//                   onChangeText={setQuery}
//                   placeholderTextColor="#c7c7c7"
//                 />
//                 <TouchableOpacity
//                   style={styles.searchButton}
//                   onPress={handleSearchCity}
//                 >
//                   <Ionicons name="search-sharp" size={20} color="black" />
//                 </TouchableOpacity>
//               </View>

//               {/* Modal pour afficher les suggestions */}
//               <Modal
//                 visible={modalVisible}
//                 animationType="slide"
//                 transparent={true}
//                 onRequestClose={() => setModalVisible(false)}
//               >
//                 <View style={styles.modalOverlay}>
//                   <View style={styles.modalContent}>
//                     <ScrollView>
//                       {suggestions.map((item, index) => (
//                         <TouchableOpacity
//                           key={`${item.Code_commune_INSEE}-${index}`}
//                           style={styles.suggestionItem}
//                           onPress={() => handleCitySelection(item)}
//                         >
//                           <Text style={styles.suggestionText}>
//                             {item.Nom_commune} ({item.Code_postal})
//                           </Text>
//                         </TouchableOpacity>
//                       ))}
//                     </ScrollView>
//                     <TouchableOpacity
//                       style={styles.closeButton}
//                       onPress={() => setModalVisible(false)}
//                     >
//                       <Text style={styles.closeButtonText}>Fermer</Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </Modal>

//               {/* Boutons Sauvegarder et Annuler */}
//               <View style={styles.buttonRow}>
//                 <TouchableOpacity
//                   style={styles.saveButton}
//                   onPress={handleSaveCity}
//                 >
//                   <Text style={styles.saveButtonText}>Enregistrer</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.cancelButton}
//                   onPress={() => setIsEditingCity(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Annuler</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}
//         </View>

//         <View style={styles.cardContainer}>
//           <Text style={styles.infoCardHeader}>Relations</Text>
//           <View style={styles.cardContent}>
//             <TouchableOpacity
//               style={styles.statItem}
//               onPress={() => handleShowList("followers")}
//             >
//               <Text style={styles.statNumber}>
//                 {user?.followers?.length || 0}
//               </Text>
//               <Text style={styles.statLabel}>Abonnées</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.statItem}
//               onPress={() => handleShowList("following")}
//             >
//               <Text style={styles.statNumber}>
//                 {user?.following?.length || 0}
//               </Text>
//               <Text style={styles.statLabel}>Abonnements</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Modal pour afficher la liste */}
//           {selectedList && (
//             <Modal
//               visible={true}
//               transparent={true}
//               animationType="slide"
//               onRequestClose={handleCloseModal}
//             >
//               <View style={styles.modalContainer}>
//                 <View style={styles.modalContentFollower}>
//                   <Text style={styles.modalHeader}>
//                     {selectedList === "followers"
//                       ? "Smarters abonnés à votre profil"
//                       : "Smarters auxquels vous êtes abonné"}
//                   </Text>
//                   <FlatList
//                     data={
//                       selectedList === "followers"
//                         ? user?.followers
//                         : user?.following
//                     }
//                     keyExtractor={(item) => item.id.toString()}
//                     renderItem={({ item }) => (
//                       <View style={styles.listItem}>
//                         <Image
//                           source={{
//                             uri:
//                               item.profilePhoto ||
//                               "https://via.placeholder.com/150",
//                           }}
//                           style={styles.avatar}
//                         />
//                         <Text style={styles.userName}>{item.username}</Text>

//                         {selectedList === "following" && (
//                           <TouchableOpacity
//                             style={styles.unfollowButton}
//                             onPress={() => handleUnfollow(item.id)}
//                           >
//                             <Text style={styles.unfollowButtonText}>
//                               Se désabonner
//                             </Text>
//                           </TouchableOpacity>
//                         )}
//                       </View>
//                     )}
//                   />
//                   <TouchableOpacity
//                     style={styles.closeButton}
//                     onPress={handleCloseModal}
//                   >
//                     <Text style={styles.closeButtonText}>Fermer</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </Modal>
//           )}
//         </View>

//         <View style={styles.cardContainer}>
//           <Text style={styles.infoCardHeader}>
//             Statistiques de signalements
//           </Text>
//           <View style={styles.cardContent}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {stats?.numberOfComments || 0}
//               </Text>
//               <Text style={styles.statLabel}>Commentaires</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>{stats?.numberOfVotes || 0}</Text>
//               <Text style={styles.statLabel}>Votes</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {stats?.numberOfReports || 0}
//               </Text>
//               <Text style={styles.statLabel}>Signalements</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.cardContainer}>
//           <Text style={styles.infoCardHeader}>Social</Text>
//           <View style={styles.cardContent}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>{stats?.numberOfPosts || 0}</Text>
//               <Text style={styles.statLabel}>Publications{"\n"}</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {stats?.numberOfEventsCreated || 0}
//               </Text>
//               <Text style={styles.statLabel}>Événements{"\n"}crées</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {stats?.numberOfEventsAttended || 0}
//               </Text>
//               <Text style={styles.statLabel}>
//                 Participation{"\n"}aux événements
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.cardContainer}>
//           <Text style={styles.infoCardHeader}>Options</Text>
//           <View style={styles.cardContent}>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {user?.isSubscribed ? "Oui" : "Non"}
//               </Text>
//               <Text style={styles.statLabel}> SMART+</Text>
//             </View>
//             <View style={styles.statItem}>
//               <Text style={styles.statNumber}>
//                 {user?.isSubscribed ? "Oui" : "Non"}
//               </Text>
//               <Text style={styles.statLabel}>Affiliation mairie</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//     </View>
//   );
// }
