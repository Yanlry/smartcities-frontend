// Chemin : screens/EditMayorInfoScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * 👨‍💼 ÉCRAN : MODIFIER LES INFORMATIONS DU MAIRE ET DE LA MAIRIE
 * 
 * Permet à la mairie de renseigner :
 * - Nom du maire
 * - Photo du maire (NOUVEAU !)
 * - Téléphone du maire
 * - Adresse de la mairie
 * - Téléphone de la mairie
 * - Horaires d'ouverture
 */
export default function EditMayorInfoScreen() {
  const navigation = useNavigation();

  // ========== ÉTATS ==========
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Informations du maire
  const [mayorName, setMayorName] = useState("");
  const [mayorPhone, setMayorPhone] = useState("");
  const [mayorPhoto, setMayorPhoto] = useState<string | null>(null); // ✨ NOUVEAU

  // Informations de la mairie
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");

  const cityName = "HAUBOURDIN";

  // ========== CHARGER LES INFOS EXISTANTES ==========
  useEffect(() => {
    loadCityInfo();
  }, []);

  const loadCityInfo = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/cityinfo?cityName=${encodeURIComponent(cityName)}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données chargées:", data);
        
        setMayorName(data.mayorName || "");
        setMayorPhone(data.mayorPhone || "");
        setMayorPhoto(data.mayorPhoto || null); // ✨ NOUVEAU
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setHours(data.hours || "");
      } else if (response.status === 404) {
        console.log("ℹ️ Aucune info existante");
      }
    } catch (error) {
      console.error("❌ Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== 📸 NOUVELLE FONCTION : UPLOADER LA PHOTO DU MAIRE ==========
  const handleSelectMayorPhoto = async () => {
    try {
      // Demander la permission d'accès à la galerie
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission requise",
          "Vous devez autoriser l'accès à vos photos pour ajouter une photo."
        );
        return;
      }

      // Ouvrir le sélecteur d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Permet de recadrer l'image
        aspect: [1, 1], // Format carré
        quality: 0.8, // Qualité de l'image (0 à 1)
      });

      // Si l'utilisateur n'a pas annulé
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        console.log("📸 Photo sélectionnée:", photoUri);
        
        // Uploader la photo
        await uploadMayorPhoto(photoUri);
      }
    } catch (error) {
      console.error("❌ Erreur sélection photo:", error);
      Alert.alert("Erreur", "Impossible de sélectionner la photo.");
    }
  };

  // ========== 📤 NOUVELLE FONCTION : ENVOYER LA PHOTO AU SERVEUR ==========
  const uploadMayorPhoto = async (photoUri: string) => {
    try {
      setUploadingPhoto(true);

      // Préparer les données à envoyer (FormData)
      const formData = new FormData();
      
      // Ajouter l'image au FormData
      formData.append("mayorPhoto", {
        uri: photoUri,
        type: "image/jpeg",
        name: "mayor.jpg",
      } as any);

      // Ajouter le nom de la ville
      formData.append("cityName", cityName);

      // Récupérer le token d'authentification
      const token = await AsyncStorage.getItem("authToken");
      
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté.");
        setUploadingPhoto(false);
        return;
      }

      console.log("📤 Envoi de la photo au serveur...");

      // Envoyer au serveur
      const response = await fetch(`${API_URL}/cityinfo/upload-mayor-photo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // ⚠️ NE PAS mettre "Content-Type" pour FormData, il se génère automatiquement
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Photo uploadée:", data);
        
        // Mettre à jour l'état avec la nouvelle URL de la photo
        setMayorPhoto(data.mayorPhotoUrl);
        
        Alert.alert("Succès", "La photo du maire a été mise à jour !");
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur serveur:", errorText);
        Alert.alert("Erreur", "Impossible d'uploader la photo.");
      }
    } catch (error) {
      console.error("❌ Erreur upload:", error);
      Alert.alert("Erreur", "Vérifiez votre connexion.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ========== SAUVEGARDER LES INFORMATIONS ==========
  const handleSave = async () => {
    try {
      console.log("💾 Sauvegarde des infos du maire...");

      // Validation : au moins un champ doit être rempli
      if (!mayorName && !mayorPhone && !address && !phone && !hours && !mayorPhoto) {
        Alert.alert(
          "Attention",
          "Veuillez remplir au moins un champ avant de sauvegarder."
        );
        return;
      }

      setSaving(true);

      const token = await AsyncStorage.getItem("authToken");
      
      if (!token) {
        Alert.alert(
          "Erreur",
          "Vous devez être connecté pour sauvegarder."
        );
        setSaving(false);
        return;
      }

      // Préparer les données à envoyer
      const data = {
        cityName,
        mayorName: mayorName || null,
        mayorPhone: mayorPhone || null,
        mayorPhoto: mayorPhoto || null, // ✨ NOUVEAU : inclure l'URL de la photo
        address: address || null,
        phone: phone || null,
        hours: hours || null,
      };

      console.log("📤 Envoi:", data);

      const response = await fetch(`${API_URL}/cityinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log("✅ Sauvegarde réussie");
        
        Alert.alert(
          "Succès",
          "Les informations ont été sauvegardées avec succès !",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        const errorText = await response.text();
        console.error("❌ Erreur:", errorText);
        Alert.alert("Erreur", "Impossible de sauvegarder.");
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
      Alert.alert("Erreur", "Vérifiez votre connexion.");
    } finally {
      setSaving(false);
    }
  };

  // ========== AFFICHAGE PENDANT LE CHARGEMENT ==========
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#43A047" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // ========== AFFICHAGE DU FORMULAIRE ==========
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête avec dégradé */}
        <LinearGradient
          colors={['#43A047', '#2E7D32']}
          style={styles.header}
        >
          <Text style={styles.headerIcon}>👨‍💼</Text>
          <Text style={styles.headerTitle}>Informations du maire</Text>
          <Text style={styles.headerSubtitle}>
            Renseignez les coordonnées du maire et de la mairie
          </Text>
        </LinearGradient>

        {/* ========== SECTION MAIRE ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Le maire</Text>

          {/* ✨ NOUVEAU : Section pour la photo du maire */}
          <View style={styles.photoSection}>
            <Text style={styles.label}>Photo du maire</Text>
            
            <View style={styles.photoContainer}>
              {/* Affichage de la photo actuelle ou placeholder */}
              <View style={styles.photoPreview}>
                {mayorPhoto ? (
                  <Image
                    source={{ uri: mayorPhoto }}
                    style={styles.photoImage}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MaterialIcons name="person" size={60} color="#BDBDBD" />
                    <Text style={styles.photoPlaceholderText}>
                      Aucune photo
                    </Text>
                  </View>
                )}
              </View>

              {/* Bouton pour sélectionner/changer la photo */}
              <TouchableOpacity
                style={styles.photoButton}
                onPress={handleSelectMayorPhoto}
                disabled={uploadingPhoto}
                activeOpacity={0.7}
              >
                {uploadingPhoto ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="photo-camera" size={20} color="#FFFFFF" />
                    <Text style={styles.photoButtonText}>
                      {mayorPhoto ? "Changer la photo" : "Ajouter une photo"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Bouton pour supprimer la photo */}
              {mayorPhoto && !uploadingPhoto && (
                <TouchableOpacity
                  style={styles.photoDeleteButton}
                  onPress={() => {
                    Alert.alert(
                      "Supprimer la photo",
                      "Êtes-vous sûr de vouloir supprimer cette photo ?",
                      [
                        { text: "Annuler", style: "cancel" },
                        { 
                          text: "Supprimer", 
                          style: "destructive",
                          onPress: () => setMayorPhoto(null)
                        },
                      ]
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="delete" size={20} color="#E53935" />
                  <Text style={styles.photoDeleteButtonText}>
                    Supprimer la photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pierre BÉHARELLE"
              value={mayorName}
              onChangeText={setMayorName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 03 20 44 02 51"
              value={mayorPhone}
              onChangeText={setMayorPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* ========== SECTION MAIRIE ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 La mairie</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse complète *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Ex: 11 rue Sadi Carnot, 59320 Haubourdin"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 03 20 44 02 90"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Horaires d'ouverture *</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              placeholder="Ex: Lun-Ven: 08:30-12:00, 13:30-17:00"
              value={hours}
              onChangeText={setHours}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Note d'information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Ces informations seront visibles par tous les citoyens de {cityName} sur l'application.
          </Text>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, (saving || uploadingPhoto) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || uploadingPhoto}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Sauvegarder</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ========== STYLES (avec nouveaux styles pour la photo) ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#757575",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 20,
  },
  // ✨ NOUVEAUX STYLES POUR LA PHOTO
  photoSection: {
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: "center",
  },
  photoPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#43A047",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: "#BDBDBD",
    marginTop: 8,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#43A047",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  photoDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  photoDeleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E53935",
  },
  // FIN DES NOUVEAUX STYLES
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#212121",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#43A047",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});