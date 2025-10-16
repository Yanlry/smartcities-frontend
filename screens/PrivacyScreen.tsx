import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Sidebar from "../components/common/Sidebar";
import { useNotification } from "../context/NotificationContext";
import { useUserProfile } from "../hooks/user/useUserProfile";
import styles from "../styles/screens/PrivacyScreen.styles";

const COLORS = {
  primary: "#062C41",
  secondary: "#1B5D85",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E0E0E0",
  danger: "#E11D48",
  text: {
    primary: "#1E293B",
    secondary: "#475569",
    light: "#FFFFFF",
  },
};

const PrivacyScreen: React.FC = () => {
  const { unreadCount } = useNotification();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <LinearGradient colors={["#F6F8FB", "#EEF2F7"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={toggleSidebar}>
          <Ionicons name="menu-outline" size={26} color={COLORS.text.light} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CONFIDENTIALITÉ</Text>

        <TouchableOpacity style={styles.headerIcon}>
          <View>
            <Ionicons
              name="notifications-outline"
              size={26}
              color={COLORS.text.light}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={() => {}}
        onShowVoteInfoModal={() => {}}
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />

      {/* Contenu principal */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Bienvenue sur Smartcities. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez notre application.
          </Text>

          <Text style={styles.sectionTitle}>2. Données collectées</Text>
          <Text style={styles.paragraph}>
            Nous collectons uniquement les données nécessaires au bon fonctionnement du service :
          </Text>
          <Text style={styles.listItem}>• Informations de compte (nom, e-mail)</Text>
          <Text style={styles.listItem}>• Données de localisation (pour les signalements)</Text>
          <Text style={styles.listItem}>• Informations techniques (version de l’app, appareil)</Text>

          <Text style={styles.sectionTitle}>3. Utilisation des données</Text>
          <Text style={styles.paragraph}>
            Vos données servent à :
          </Text>
          <Text style={styles.listItem}>• Gérer votre compte utilisateur</Text>
          <Text style={styles.listItem}>• Traiter vos signalements et contributions</Text>
          <Text style={styles.listItem}>• Améliorer les services et la sécurité de la ville</Text>

          <Text style={styles.sectionTitle}>4. Partage des données</Text>
          <Text style={styles.paragraph}>
            Vos données peuvent être partagées uniquement avec :
          </Text>
          <Text style={styles.listItem}>• Les autorités locales partenaires</Text>
          <Text style={styles.listItem}>• Nos prestataires techniques (hébergement, maintenance)</Text>
          <Text style={styles.listItem}>
            En aucun cas vos données ne sont vendues à des tiers.
          </Text>

          <Text style={styles.sectionTitle}>5. Sécurité</Text>
          <Text style={styles.paragraph}>
            Smartcities applique des mesures de sécurité strictes : chiffrement des communications, stockage sécurisé, et accès restreint aux données sensibles.
          </Text>

          <Text style={styles.sectionTitle}>6. Durée de conservation</Text>
          <Text style={styles.paragraph}>
            Vos signalements sont conservés pendant 12 mois, vos informations de compte tant que vous utilisez l’application. Au-delà, elles sont anonymisées ou supprimées.
          </Text>

          <Text style={styles.sectionTitle}>7. Vos droits</Text>
          <Text style={styles.paragraph}>
            Conformément au RGPD, vous pouvez :
          </Text>
          <Text style={styles.listItem}>• Accéder à vos données</Text>
          <Text style={styles.listItem}>• Les corriger ou les supprimer</Text>
          <Text style={styles.listItem}>• Retirer votre consentement à tout moment</Text>
          <Text style={styles.paragraph}>
            Pour exercer ces droits :{" "}
            <Text style={styles.link}>privacy@smartcities.app</Text>
          </Text>

          <Text style={styles.sectionTitle}>8. Cookies et analyses</Text>
          <Text style={styles.paragraph}>
            Smartcities utilise des outils analytiques anonymisés pour comprendre l’usage de l’application. Aucun cookie publicitaire n’est utilisé.
          </Text>

          <Text style={styles.sectionTitle}>9. Contact</Text>
          <Text style={styles.paragraph}>
            Pour toute question relative à la confidentialité ou au traitement de vos données, vous pouvez nous contacter à :{" "}
            <Text style={styles.link}>privacy@smartcities.app</Text>.
          </Text>

          <Text style={styles.sectionTitle}>10. Mise à jour</Text>
          <Text style={styles.paragraph}>
            Cette politique peut être mise à jour. Dernière mise à jour : <Text style={{ fontWeight: "600" }}>Octobre 2025</Text>.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default PrivacyScreen;
