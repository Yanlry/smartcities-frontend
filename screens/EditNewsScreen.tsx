// Chemin : screens/EditNewsScreen.tsx

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

/**
 * Interface pour une actualité
 */
interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  icon?: string;
  color?: string;
}

/**
 * 📢 ÉCRAN : GÉRER LES ACTUALITÉS
 * 
 * Permet d'ajouter, modifier et supprimer les actualités de la ville
 */
export default function EditNewsScreen() {
  const navigation = useNavigation();

  // ========== ÉTATS ==========
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [news, setNews] = useState<News[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsIcon, setNewsIcon] = useState("📰");

  const cityName = "HAUBOURDIN";

  // Liste d'icônes suggérées
  const suggestedIcons = ["📰", "🎉", "🚧", "🏗️", "🌳", "🚴", "📅", "🎭", "🎨"];

  // ========== CHARGER LES ACTUALITÉS EXISTANTES ==========
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/cityinfo?cityName=${encodeURIComponent(cityName)}`
      );

      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
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
      const article = news[index];
      setNewsTitle(article.title);
      setNewsContent(article.content);
      setNewsIcon(article.icon || "📰");
      setEditingIndex(index);
    } else {
      // Mode ajout
      setNewsTitle("");
      setNewsContent("");
      setNewsIcon("📰");
      setEditingIndex(null);
    }
    setShowModal(true);
  };

  // ========== SAUVEGARDER UNE ACTUALITÉ ==========
  const saveNews = () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      Alert.alert("Erreur", "Le titre et le contenu sont obligatoires");
      return;
    }

    const newArticle: News = {
      id: editingIndex !== null ? news[editingIndex].id : Date.now().toString(),
      title: newsTitle.trim(),
      content: newsContent.trim(),
      date: new Date().toLocaleDateString("fr-FR"),
      icon: newsIcon,
      color: "#1E88E5",
    };

    if (editingIndex !== null) {
      // Modification
      const updated = [...news];
      updated[editingIndex] = newArticle;
      setNews(updated);
    } else {
      // Ajout
      setNews([...news, newArticle]);
    }

    setShowModal(false);
  };

  // ========== SUPPRIMER UNE ACTUALITÉ ==========
  const deleteNews = (index: number) => {
    Alert.alert(
      "Confirmer",
      "Voulez-vous vraiment supprimer cette actualité ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updated = news.filter((_, i) => i !== index);
            setNews(updated);
          },
        },
      ]
    );
  };

  // ========== SAUVEGARDER TOUTES LES ACTUALITÉS ==========
  const handleSave = async () => {
    try {
      console.log("💾 Sauvegarde des actualités...");

      if (news.length === 0) {
        Alert.alert(
          "Attention",
          "Ajoutez au moins une actualité avant de sauvegarder."
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
        news,
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
          "Les actualités ont été sauvegardées !",
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
        <ActivityIndicator size="large" color="#1E88E5" />
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
          colors={['#1E88E5', '#1565C0']}
          style={styles.header}
        >
          <Text style={styles.headerIcon}>📢</Text>
          <Text style={styles.headerTitle}>Actualités</Text>
          <Text style={styles.headerSubtitle}>
            Partagez les nouvelles de votre ville
          </Text>
        </LinearGradient>

        {/* Liste des actualités */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {news.length} actualité{news.length > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openModal()}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {news.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📰</Text>
              <Text style={styles.emptyText}>
                Aucune actualité publiée
              </Text>
              <Text style={styles.emptySubtext}>
                Cliquez sur "+ Ajouter" pour commencer
              </Text>
            </View>
          ) : (
            news.map((article, index) => (
              <View key={article.id} style={styles.newsCard}>
                <View style={styles.newsHeader}>
                  <View style={styles.newsIconContainer}>
                    <Text style={styles.newsIcon}>{article.icon}</Text>
                  </View>
                  <View style={styles.newsInfo}>
                    <Text style={styles.newsTitle}>{article.title}</Text>
                    <Text style={styles.newsDate}>{article.date}</Text>
                  </View>
                  <View style={styles.newsActions}>
                    <TouchableOpacity onPress={() => openModal(index)}>
                      <Text style={styles.actionButton}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteNews(index)}>
                      <Text style={styles.actionButton}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.newsContent} numberOfLines={3}>
                  {article.content}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Les actualités seront affichées dans l'application pour informer les citoyens.
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
              {editingIndex !== null ? "Modifier" : "Ajouter"} une actualité
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
                      newsIcon === icon && styles.iconButtonActive,
                    ]}
                    onPress={() => setNewsIcon(icon)}
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
                placeholder="Ex: Nouvelle piste cyclable"
                value={newsTitle}
                onChangeText={setNewsTitle}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Contenu *</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Décrivez l'actualité en détail..."
                value={newsContent}
                onChangeText={setNewsContent}
                multiline
                numberOfLines={6}
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
                onPress={saveNews}
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
    backgroundColor: "#1E88E5",
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
  newsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  newsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  newsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  newsIcon: {
    fontSize: 20,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    color: "#757575",
  },
  newsActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    fontSize: 20,
    padding: 4,
  },
  newsContent: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
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
    color: "#1565C0",
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
    backgroundColor: "#1E88E5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#90CAF9",
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
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 20,
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
  modalTextArea: {
    minHeight: 150,
    textAlignVertical: "top",
  },
  iconScroll: {
    marginTop: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  iconButtonActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#1E88E5",
  },
  iconButtonText: {
    fontSize: 24,
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
    backgroundColor: "#1E88E5",
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