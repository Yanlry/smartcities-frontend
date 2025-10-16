// Chemin : screens/EditServicesScreen.tsx

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
} from "react-native";
// @ts-ignore
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/screens/EditServicesScreen.styles";

/**
 * Interface pour un service
 */
interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

/**
 * 📋 ÉCRAN : GÉRER LES SERVICES MUNICIPAUX
 * 
 * Permet d'ajouter, modifier et supprimer les services proposés par la mairie
 */
export default function EditServicesScreen() {
  const navigation = useNavigation();

  // ========== ÉTATS ==========
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceIcon, setServiceIcon] = useState("📋");

  const cityName = "HAUBOURDIN";

  // Liste d'icônes suggérées pour les services
  const suggestedIcons = ["📋", "🏛️", "👶", "🎓", "♻️", "🚗", "🏠", "💼", "🎫"];

  // ========== CHARGER LES SERVICES EXISTANTS ==========
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/cityinfo?cityName=${encodeURIComponent(cityName)}`
      );

      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("❌ Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========== OUVRIR LA MODALE ==========
  const openModal = (index: number | null = null) => {
    if (index !== null) {
      // Mode modification
      const service = services[index];
      setServiceTitle(service.title);
      setServiceDescription(service.description);
      setServiceIcon(service.icon || "📋");
      setEditingIndex(index);
    } else {
      // Mode ajout
      setServiceTitle("");
      setServiceDescription("");
      setServiceIcon("📋");
      setEditingIndex(null);
    }
    setShowModal(true);
  };

  // ========== SAUVEGARDER UN SERVICE ==========
  const saveService = () => {
    if (!serviceTitle.trim() || !serviceDescription.trim()) {
      Alert.alert("Erreur", "Le titre et la description sont obligatoires");
      return;
    }

    const newService: Service = {
      id: editingIndex !== null ? services[editingIndex].id : Date.now().toString(),
      title: serviceTitle.trim(),
      description: serviceDescription.trim(),
      icon: serviceIcon,
    };

    if (editingIndex !== null) {
      // Modification
      const updated = [...services];
      updated[editingIndex] = newService;
      setServices(updated);
    } else {
      // Ajout
      setServices([...services, newService]);
    }

    setShowModal(false);
  };

  // ========== SUPPRIMER UN SERVICE ==========
  const deleteService = (index: number) => {
    Alert.alert(
      "Confirmer",
      "Voulez-vous vraiment supprimer ce service ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updated = services.filter((_, i) => i !== index);
            setServices(updated);
          },
        },
      ]
    );
  };

  // ========== SAUVEGARDER TOUS LES SERVICES ==========
  const handleSave = async () => {
    try {
      console.log("💾 Sauvegarde des services...");

      if (services.length === 0) {
        Alert.alert(
          "Attention",
          "Ajoutez au moins un service avant de sauvegarder."
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
        services,
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
          "Les services ont été sauvegardés !",
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
        <ActivityIndicator size="large" color="#FF9800" />
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
          colors={['#FF9800', '#F57C00']}
          style={styles.header}
        >
          <Text style={styles.headerIcon}>📋</Text>
          <Text style={styles.headerTitle}>Services municipaux</Text>
          <Text style={styles.headerSubtitle}>
            Présentez vos services aux citoyens
          </Text>
        </LinearGradient>

        {/* Liste des services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {services.length} service{services.length > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openModal()}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>
                Aucun service configuré
              </Text>
              <Text style={styles.emptySubtext}>
                Cliquez sur "+ Ajouter" pour commencer
              </Text>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((service, index) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceIcon}>{service.icon}</Text>
                    <View style={styles.serviceActions}>
                      <TouchableOpacity onPress={() => openModal(index)}>
                        <Text style={styles.actionButton}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteService(index)}>
                        <Text style={styles.actionButton}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={3}>
                    {service.description}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Les services seront présentés aux citoyens dans l'onglet "Services" de l'application.
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingIndex !== null ? "Modifier" : "Ajouter"} un service
            </Text>

            {/* Sélection d'icône */}
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Icône</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.iconScroll}
              >
                {suggestedIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      serviceIcon === icon && styles.iconButtonActive,
                    ]}
                    onPress={() => setServiceIcon(icon)}
                  >
                    <Text style={styles.iconButtonText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Titre *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: État civil"
                value={serviceTitle}
                onChangeText={setServiceTitle}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Description *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Décrivez ce service en quelques lignes..."
                value={serviceDescription}
                onChangeText={setServiceDescription}
                multiline
                numberOfLines={4}
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
                onPress={saveService}
              >
                <Text style={styles.modalSaveText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}