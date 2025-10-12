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

  // ========== 📤 UPLOADER LA PHOTO ==========
  const uploadTeamMemberPhoto = async (photoUri: string) => {
    try {
      setUploadingPhoto(true);

      const formData = new FormData();
      
      formData.append("teamMemberPhoto", {
        uri: photoUri,
        type: "image/jpeg",
        name: "team-member.jpg",
      } as any);

      formData.append("cityName", cityName);

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

// ========== STYLES ==========
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
  },
  addButton: {
    backgroundColor: "#43A047",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#757575",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  // ✨ NOUVEAU STYLE : Pour la vraie photo
  memberAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  // ✨ NOUVEAU STYLE : Cercle avec texte "Aucune photo disponible"
  memberAvatarNoPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    padding: 4,
  },
  // ✨ NOUVEAU STYLE : Texte à l'intérieur du cercle
  memberAvatarNoPhotoText: {
    fontSize: 7,
    fontWeight: "600",
    color: "#757575",
    textAlign: "center",
    lineHeight: 9,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: "#757575",
  },
  memberActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    fontSize: 20,
    padding: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 20,
  },
  photoSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  photoContainer: {
    alignItems: "center",
    width: "100%",
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 2,
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
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#43A047",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  photoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  photoDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 4,
  },
  photoDeleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E53935",
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#212121",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: "#43A047",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});