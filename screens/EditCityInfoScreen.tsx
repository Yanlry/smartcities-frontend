// Chemin : screens/EditCityInfoScreen.tsx

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
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

/**
 * Écran permettant à la mairie de remplir/modifier ses informations
 */
export default function EditCityInfoScreen() {
  const navigation = useNavigation();

  // ========== ÉTATS ==========
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Informations du maire
  const [mayorName, setMayorName] = useState("");
  const [mayorPhone, setMayorPhone] = useState("");

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

      console.log("📥 Chargement des infos pour:", cityName);

      const response = await fetch(
        `${API_URL}/cityinfo?cityName=${encodeURIComponent(cityName)}`
      );

      console.log("📡 Réponse du serveur:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Données reçues:", data);
        
        setMayorName(data.mayorName || "");
        setMayorPhone(data.mayorPhone || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
        setHours(data.hours || "");
      } else if (response.status === 404) {
        console.log("ℹ️ Aucune information existante, formulaire vierge");
      } else {
        console.error("❌ Erreur inattendue:", response.status);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== SAUVEGARDER LES INFORMATIONS ==========
  const handleSave = async () => {
    try {
      console.log("💾 Début de la sauvegarde...");

      // Validation des champs
      if (!mayorName && !mayorPhone && !address && !phone && !hours) {
        Alert.alert(
          "Attention",
          "Veuillez remplir au moins un champ avant de sauvegarder."
        );
        return;
      }

      setSaving(true);

      // 🔧 CORRECTION : Utiliser "authToken" au lieu de "token"
      console.log("🔍 Tentative de récupération du token...");
      const token = await AsyncStorage.getItem("authToken"); // ✅ BONNE CLÉ
      
      console.log("🔍 Token trouvé ?", token ? "OUI" : "NON");
      
      if (token) {
        console.log("✅ Token présent (longueur:", token.length, "caractères)");
        console.log("📝 Début du token:", token.substring(0, 20) + "...");
      } else {
        console.error("❌ Token NULL ou undefined");
      }

      // Si pas de token, afficher un message d'erreur
      if (!token) {
        console.error("❌ PROBLÈME : Le token n'existe pas dans AsyncStorage");
        
        Alert.alert(
          "Erreur d'authentification",
          "Vous devez être connecté pour sauvegarder. Veuillez vous reconnecter.",
          [
            {
              text: "OK",
              onPress: () => {
                // Redirection vers la connexion si besoin
                // navigation.navigate("LoginScreen");
              }
            }
          ]
        );
        setSaving(false);
        return;
      }

      // Préparer les données
      const data = {
        cityName,
        mayorName: mayorName || null,
        mayorPhone: mayorPhone || null,
        address: address || null,
        phone: phone || null,
        hours: hours || null,
      };

      console.log("📤 Envoi des données:", data);
      console.log("🌐 URL de l'API:", `${API_URL}/cityinfo`);

      // Envoyer la requête
      const response = await fetch(`${API_URL}/cityinfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      console.log("📡 Statut de la réponse:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Succès:", result);
        
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
        // Afficher l'erreur détaillée
        const errorText = await response.text();
        console.error("❌ Erreur serveur:", errorText);
        
        let errorMessage = `Erreur ${response.status}`;
        
        if (response.status === 401) {
          errorMessage = "Erreur d'authentification. Votre session a peut-être expiré. Veuillez vous reconnecter.";
        } else if (response.status === 403) {
          errorMessage = "Accès refusé. Seules les mairies peuvent modifier ces informations.";
        } else {
          errorMessage = `Erreur ${response.status}: ${errorText}`;
        }
        
        Alert.alert("Erreur", errorMessage);
      }
    } catch (error) {
      console.error("❌ Erreur catch:", error);
      Alert.alert(
        "Erreur",
        "Impossible de sauvegarder les informations. Vérifiez votre connexion."
      );
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
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Informations de {cityName}</Text>
          <Text style={styles.headerSubtitle}>
            Complétez les informations de votre mairie
          </Text>
        </View>

        {/* ========== SECTION MAIRE ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍💼 Informations du maire</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du maire *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Pierre BÉHARELLE"
              value={mayorName}
              onChangeText={setMayorName}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone du maire</Text>
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
          <Text style={styles.sectionTitle}>🏢 Informations de la mairie</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse *</Text>
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
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Les champs marqués d'un astérisque (*) sont recommandés pour une
            meilleure visibilité sur l'application.
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
    </KeyboardAvoidingView>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#757575",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212121",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
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
    borderRadius: 8,
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