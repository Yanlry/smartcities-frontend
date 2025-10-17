// Chemin : frontend/screens/PrivacyScreen.tsx

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "../components/common/Sidebar";
import { useNotification } from "../context/NotificationContext";
import { useUserProfile } from "../hooks/user/useUserProfile";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../styles/screens/PrivacyScreen.styles";

/**
 * Interface pour les sections de la politique de confidentialité
 * ✅ CORRECTION: readonly [...] pour TypeScript
 */
interface PrivacySection {
  id: string;
  number: string;
  title: string;
  icon: string;
  iconColor: readonly [string, string]; // ✅ CORRECTION ICI
  content: React.ReactNode;
}

/**
 * PrivacyScreen - Écran de politique de confidentialité
 * Présente de manière professionnelle et transparente comment Smartcities
 * collecte, utilise et protège les données des utilisateurs
 */
const PrivacyScreen: React.FC = () => {
  // ✅ Hooks
  const navigation = useNavigation();
  const { unreadCount } = useNotification();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Références d'animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  /**
   * Animation d'entrée au montage
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /**
   * Toggle du sidebar
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Ouvrir un email
   */
  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() =>
      Alert.alert("Erreur", "Impossible d'ouvrir l'application mail.")
    );
  };

  /**
   * Configuration des sections de confidentialité
   * Chaque section a une icône unique avec dégradé de couleur
   * ✅ CORRECTION: Tous les tableaux iconColor utilisent "as const"
   */
  const privacySections: PrivacySection[] = [
    {
      id: "data-collection",
      number: "01",
      title: "Données Collectées",
      icon: "folder-open",
      iconColor: ["#00C6FB", "#005BEA"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities collecte uniquement les données essentielles au fonctionnement de l'application :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Informations de compte :</Text> nom, prénom, adresse e-mail, mot de passe (chiffré)
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Données de localisation :</Text> coordonnées GPS lors des signalements (avec votre consentement)
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Informations techniques :</Text> type d'appareil, version du système d'exploitation, langue
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Données d'utilisation :</Text> interactions avec l'app, signalements créés, événements consultés
            </Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✓ Aucune donnée bancaire n'est stockée sur nos serveurs
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "data-usage",
      number: "02",
      title: "Utilisation des Données",
      icon: "analytics",
      iconColor: ["#11998e", "#38ef7d"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Vos données personnelles sont utilisées exclusivement pour :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Créer et gérer votre compte utilisateur</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Traiter vos signalements et les transmettre aux autorités compétentes</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Vous informer des événements locaux pertinents</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Améliorer la qualité de vie urbaine et la réactivité des services municipaux</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Vous envoyer des notifications importantes (résolution de signalements, alertes)</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Analyser l'usage de l'application pour l'améliorer continuellement</Text>
          </View>
        </>
      ),
    },
    {
      id: "data-sharing",
      number: "03",
      title: "Partage et Tiers",
      icon: "people",
      iconColor: ["#8E2DE2", "#4A00E0"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities peut partager vos données avec :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Autorités locales partenaires :</Text> mairies, services techniques municipaux (uniquement les signalements et données nécessaires)
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Prestataires techniques :</Text> hébergement cloud (AWS/Google Cloud), maintenance système
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Services d'analyse :</Text> outils anonymisés pour comprendre l'usage (Google Analytics, Firebase)
            </Text>
          </View>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Smartcities ne vend JAMAIS vos données à des tiers. Aucune donnée n'est utilisée à des fins publicitaires.
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "security",
      number: "04",
      title: "Sécurité et Protection",
      icon: "shield-checkmark",
      iconColor: ["#FF416C", "#FF4B2B"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            La sécurité de vos données est notre priorité absolue :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Chiffrement SSL/TLS :</Text> toutes les communications sont sécurisées
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Mots de passe :</Text> hashés avec bcrypt, jamais stockés en clair
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Accès restreint :</Text> seules les personnes autorisées peuvent accéder aux données sensibles
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Audits réguliers :</Text> tests de sécurité et mises à jour fréquentes
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Sauvegardes automatiques :</Text> pour prévenir toute perte de données
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "retention",
      number: "05",
      title: "Conservation des Données",
      icon: "time",
      iconColor: ["#F59E0B", "#F97316"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities conserve vos données selon les durées suivantes :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Signalements :</Text> 12 mois après résolution, puis anonymisés à des fins statistiques
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Compte utilisateur :</Text> tant que le compte est actif
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Données d'analyse :</Text> 24 mois maximum, puis suppression automatique
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Après suppression de compte :</Text> toutes les données personnelles sont effacées sous 30 jours
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "rights",
      number: "06",
      title: "Vos Droits (RGPD)",
      icon: "hand-right",
      iconColor: ["#6366F1", "#8B5CF6"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Droit d'accès :</Text> obtenir une copie de toutes vos données
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Droit de rectification :</Text> corriger des données inexactes
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Droit à l'effacement :</Text> supprimer votre compte et toutes vos données
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Droit à la portabilité :</Text> récupérer vos données dans un format exploitable
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Droit d'opposition :</Text> refuser le traitement de vos données à des fins spécifiques
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Droit de retrait du consentement :</Text> à tout moment, pour les traitements basés sur le consentement
            </Text>
          </View>
          <Text style={styles.paragraph}>
            Pour exercer ces droits, contactez-nous à{" "}
            <Text
              style={styles.legalLink}
              onPress={() => handleEmail("privacy@smartcities.app")}
            >
              privacy@smartcities.app
            </Text>
          </Text>
        </>
      ),
    },
    {
      id: "cookies",
      number: "07",
      title: "Cookies et Traceurs",
      icon: "code-slash",
      iconColor: ["#EC4899", "#D946EF"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities utilise des technologies de suivi limitées :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Cookies essentiels :</Text> nécessaires au fonctionnement de l'application (session, authentification)
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Cookies analytiques :</Text> anonymisés, pour comprendre l'usage et améliorer l'expérience
            </Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✓ Aucun cookie publicitaire ou de tracking tiers n'est utilisé
            </Text>
          </View>
          <Text style={styles.paragraph}>
            Vous pouvez gérer vos préférences de cookies dans les paramètres de votre appareil.
          </Text>
        </>
      ),
    },
    {
      id: "minors",
      number: "08",
      title: "Protection des Mineurs",
      icon: "shield",
      iconColor: ["#14B8A6", "#06B6D4"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities est accessible à tous les citoyens, y compris les mineurs :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Les mineurs de moins de 15 ans doivent obtenir le consentement parental pour créer un compte
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Les parents peuvent demander la suppression du compte de leur enfant à tout moment
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Nous ne collectons aucune donnée sensible sur les mineurs au-delà du strict nécessaire
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "changes",
      number: "09",
      title: "Modifications de la Politique",
      icon: "refresh",
      iconColor: ["#10B981", "#059669"] as const, // ✅ AJOUT "as const"
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities se réserve le droit de modifier cette politique de confidentialité à tout moment.
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous serez notifié par email et via l'application de tout changement majeur
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              La date de dernière mise à jour sera toujours indiquée en haut de ce document
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              L'utilisation continue de l'application après modification implique l'acceptation des nouvelles conditions
            </Text>
          </View>
        </>
      ),
    },
  ];

  return (
    <LinearGradient colors={["#F6F8FB", "#EEF2F7"]} style={styles.container}>
      {/* ===== HEADER IDENTIQUE À HELPSCREEN ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CONFIDENTIALITÉ</Text>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.navigate("NotificationsScreen" as never)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <View>
            <Icon name="notifications" size={24} color="#FFFFFF" />
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

      {/* ===== CONTENU PRINCIPAL ===== */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction avec badge RGPD */}
        <Animated.View style={[styles.introContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.rgpdBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#6366F1" />
            <Text style={styles.rgpdBadgeText}>CONFORME RGPD</Text>
          </View>
          <Text style={styles.introTitle}>
            Politique de Confidentialité
          </Text>
          <Text style={styles.introText}>
            Chez Smartcities, nous prenons la protection de vos données personnelles très au sérieux. 
            Cette politique explique de manière transparente comment nous collectons, utilisons, 
            partageons et protégeons vos informations.
          </Text>
          <Text style={styles.lastUpdateText}>
            Dernière mise à jour : 17 octobre 2025
          </Text>
        </Animated.View>

        {/* Sections de confidentialité */}
        {privacySections.map((section, index) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={[...section.iconColor]} // ✅ Maintenant ça fonctionne !
                style={styles.sectionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name={section.icon as any} size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionNumber}>Section {section.number}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            </View>
            <View style={styles.sectionContent}>
              {section.content}
            </View>
          </View>
        ))}

        {/* Section Contact avec CTA */}
        <View style={styles.contactSection}>
          <Ionicons name="mail" size={48} color="#8E2DE2" />
          <Text style={styles.contactTitle}>Des questions ?</Text>
          <Text style={styles.contactSubtitle}>
            Notre équipe est à votre disposition pour toute question concernant vos données
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleEmail("privacy@smartcities.app")}
          >
            <LinearGradient
              colors={["#8E2DE2", "#4A00E0"]}
              style={styles.contactButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.contactButtonContent}>
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Nous contacter</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer légal */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalTitle}>Informations Légales</Text>
          <Text style={styles.legalText}>
            <Text style={{ fontWeight: "700" }}>Responsable du traitement :</Text> Smartcities SAS
          </Text>
          <Text style={styles.legalText}>
            <Text style={{ fontWeight: "700" }}>Siège social :</Text> 123 Avenue des Champs-Élysées, 75008 Paris, France
          </Text>
          <Text style={styles.legalText}>
            <Text style={{ fontWeight: "700" }}>SIRET :</Text> 123 456 789 00012
          </Text>
          <Text style={styles.legalText}>
            <Text style={{ fontWeight: "700" }}>DPO (Délégué à la Protection des Données) :</Text>{" "}
            <Text
              style={styles.legalLink}
              onPress={() => handleEmail("dpo@smartcities.app")}
            >
              dpo@smartcities.app
            </Text>
          </Text>
          <Text style={styles.legalText}>
            <Text style={{ fontWeight: "700" }}>Hébergeur :</Text> AWS Europe (Amazon Web Services EMEA SARL)
          </Text>
        </View>
      </Animated.ScrollView>

      {/* Sidebar */}
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
    </LinearGradient>
  );
};

export default PrivacyScreen;