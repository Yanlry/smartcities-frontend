// Chemin : screens/EditTeamScreen.tsx

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
  Modal,
  Image,
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import styles from "../styles/screens/EditTeamScreen.styles";
/**
 * Interface pour un membre de l'équipe
 */
interface TeamMember {
  name: string;
  role?: string;
  photo?: string;
}

/**
 * 👥 ÉCRAN : GÉRER L'ÉQUIPE MUNICIPALE
 * 
 * Permet d'ajouter, modifier et supprimer les membres de l'équipe
 * + Ajouter des photos pour chaque membre
 */
export default function EditTeamScreen() {
  const navigation = useNavigation();

  // ========== ÉTATS ==========
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberPhoto, setMemberPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const cityName = "HAUBOURDIN";

  // ========== CHARGER LES MEMBRES EXISTANTS ==========
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/cityinfo?cityName=${encodeURIComponent(cityName)}`
      );

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== 📸 SÉLECTIONNER UNE PHOTO ==========
  const handleSelectPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission requise",
          "Vous devez autoriser l'accès à vos photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        console.log("📸 Photo sélectionnée:", photoUri);
        await uploadTeamMemberPhoto(photoUri);
      }
    } catch (error) {
      console.error("❌ Erreur sélection photo:", error);
      Alert.alert("Erreur", "Impossible de sélectionner la photo.");
    }
  };


const uploadTeamMemberPhoto = async (photoUri: string) => {
  try {
    setUploadingPhoto(true);

    const formData = new FormData();
    
    formData.append("teamMemberPhoto", {
      uri: photoUri,
      type: "image/jpeg",
      name: "team-member.jpg",
    } as any);

    // ⬅️ ✅ Plus besoin d'envoyer cityName ici, juste la photo
    const token = await AsyncStorage.getItem("authToken");
    
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté.");
      setUploadingPhoto(false);
      return;
    }

    console.log("📤 Envoi de la photo...");

    const response = await fetch(`${API_URL}/cityinfo/upload-team-photo`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Photo uploadée:", data);
      
      // ⬅️ ✅ On récupère l'URL S3
      setMemberPhoto(data.photoUrl);
      
      Alert.alert("Succès", "Photo ajoutée !");
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

  // ========== OUVRIR LA MODALE ==========
  const openModal = (index: number | null = null) => {
    if (index !== null) {
      const member = teamMembers[index];
      setMemberName(member.name);
      setMemberRole(member.role || "");
      setMemberPhoto(member.photo || null);
      setEditingIndex(index);
    } else {
      setMemberName("");
      setMemberRole("");
      setMemberPhoto(null);
      setEditingIndex(null);
    }
    setShowModal(true);
  };

  // ========== SAUVEGARDER UN MEMBRE ==========
  const saveMember = () => {
    if (!memberName.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }

    const newMember: TeamMember = {
      name: memberName.trim(),
      role: memberRole.trim() || undefined,
      photo: memberPhoto || "https://via.placeholder.com/150",
    };

    if (editingIndex !== null) {
      const updated = [...teamMembers];
      updated[editingIndex] = newMember;
      setTeamMembers(updated);
    } else {
      setTeamMembers([...teamMembers, newMember]);
    }

    setShowModal(false);
  };

  // ========== SUPPRIMER UN MEMBRE ==========
  const deleteMember = (index: number) => {
    Alert.alert(
      "Confirmer",
      "Voulez-vous vraiment supprimer ce membre ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updated = teamMembers.filter((_, i) => i !== index);
            setTeamMembers(updated);
          },
        },
      ]
    );
  };

  // ========== SAUVEGARDER TOUTE L'ÉQUIPE ==========
  const handleSave = async () => {
    try {
      console.log("💾 Sauvegarde de l'équipe...");

      if (teamMembers.length === 0) {
        Alert.alert(
          "Attention",
          "Ajoutez au moins un membre avant de sauvegarder."
        );
        return;
      }

      setSaving(true);

      const token = await AsyncStorage.getItem("authToken");
      
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté.");
        setSaving(false);
        return;
      }

      const data = {
        cityName,
        teamMembers,
      };

      const response = await fetch(`${API_URL}/cityinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Alert.alert(
          "Succès",
          "L'équipe a été sauvegardée !",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("Erreur", "Impossible de sauvegarder.");
      }
    } catch (error) {
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

  // ========== AFFICHAGE PRINCIPAL ==========
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* En-tête */}
        <LinearGradient
          colors={['#43A047', '#2E7D32']}
          style={styles.header}
        >
          <Text style={styles.headerIcon}>👥</Text>
          <Text style={styles.headerTitle}>Équipe municipale</Text>
          <Text style={styles.headerSubtitle}>
            Gérez les membres de votre équipe
          </Text>
        </LinearGradient>

        {/* Liste des membres */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {teamMembers.length} membre{teamMembers.length > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openModal()}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {teamMembers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👤</Text>
              <Text style={styles.emptyText}>
                Aucun membre ajouté
              </Text>
              <Text style={styles.emptySubtext}>
                Cliquez sur "+ Ajouter" pour commencer
              </Text>
            </View>
          ) : (
            teamMembers.map((member, index) => (
              <View key={index} style={styles.memberCard}>
                {/* ✨ MODIFICATION ICI : Cercle avec texte au lieu de l'initiale */}
                {member.photo && member.photo !== "https://via.placeholder.com/150" ? (
                  <Image
                    source={{ uri: member.photo }}
                    style={styles.memberAvatarImage}
                  />
                ) : (
                  <View style={styles.memberAvatarNoPhoto}>
                    <Text style={styles.memberAvatarNoPhotoText}>
                      Aucune photo disponible
                    </Text>
                  </View>
                )}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.role && (
                    <Text style={styles.memberRole}>{member.role}</Text>
                  )}
                </View>
                <View style={styles.memberActions}>
                  <TouchableOpacity onPress={() => openModal(index)}>
                    <Text style={styles.actionButton}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteMember(index)}>
                    <Text style={styles.actionButton}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Ces membres seront visibles par tous les citoyens dans l'application.
          </Text>
        </View>

        {/* Boutons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
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

      {/* ========== MODALE AJOUT/MODIFICATION ========== */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null ? "Modifier" : "Ajouter"} un membre
              </Text>

              {/* Section Photo */}
              <View style={styles.photoSection}>
                <Text style={styles.modalLabel}>Photo du membre</Text>
                
                <View style={styles.photoContainer}>
                  <View style={styles.photoPreview}>
                    {memberPhoto ? (
                      <Image
                        source={{ uri: memberPhoto }}
                        style={styles.photoImage}
                      />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <MaterialIcons name="person" size={60} color="#BDBDBD" />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.photoButton}
                    onPress={handleSelectPhoto}
                    disabled={uploadingPhoto}
                    activeOpacity={0.7}
                  >
                    {uploadingPhoto ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
                        <Text style={styles.photoButtonText}>
                          {memberPhoto ? "Changer" : "Ajouter"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {memberPhoto && !uploadingPhoto && (
                    <TouchableOpacity
                      style={styles.photoDeleteButton}
                      onPress={() => setMemberPhoto(null)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete" size={16} color="#E53935" />
                      <Text style={styles.photoDeleteButtonText}>Supprimer</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Nom complet *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Jean Dupont"
                  value={memberName}
                  onChangeText={setMemberName}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Fonction</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ex: Adjoint au maire"
                  value={memberRole}
                  onChangeText={setMemberRole}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={saveMember}
                  disabled={uploadingPhoto}
                >
                  <Text style={styles.modalSaveText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
