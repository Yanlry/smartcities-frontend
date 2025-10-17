// Chemin : frontend/screens/TermsScreen.tsx

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
import styles from "../styles/screens/TermsScreen.styles";

/**
 * Interface pour les sections des conditions d'utilisation
 */
interface TermsSection {
  id: string;
  number: string;
  title: string;
  icon: string;
  iconColor: readonly [string, string];
  content: React.ReactNode;
}

/**
 * TermsScreen - Écran des Conditions Générales d'Utilisation
 * Présente de manière claire et attractive les règles d'utilisation de Smartcities
 */
const TermsScreen: React.FC = () => {
  // ✅ Hooks
  const navigation = useNavigation();
  const { unreadCount } = useNotification();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Références d'animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  /**
   * Animation d'entrée spectaculaire au montage
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
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
   * Gérer l'acceptation des conditions
   */
  const handleAcceptance = () => {
    setHasAccepted(true);
    Alert.alert(
      "Merci ! 🎉",
      "Vous avez accepté les Conditions Générales d'Utilisation de Smartcities.",
      [{ text: "OK", style: "default" }]
    );
  };

  /**
   * Configuration complète des sections des CGU
   * Chaque section est détaillée, professionnelle et visuellement attractive
   */
  const termsSections: TermsSection[] = [
    {
      id: "acceptance",
      number: "01",
      title: "Acceptation des Conditions",
      icon: "checkmark-circle",
      iconColor: ["#10B981", "#059669"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            En accédant et en utilisant l'application mobile Smartcities, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation (CGU).
          </Text>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✓ Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              L'utilisation de Smartcities implique une acceptation pleine et entière des CGU
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous devez avoir au moins 13 ans pour utiliser l'application (consentement parental requis pour les moins de 15 ans)
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Ces conditions constituent un contrat juridiquement contraignant entre vous et Smartcities SAS
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "purpose",
      number: "02",
      title: "Objet de l'Application",
      icon: "location",
      iconColor: ["#3B82F6", "#1D4ED8"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities est une plateforme citoyenne qui permet aux utilisateurs de :
          </Text>
          <View style={styles.numberedItem}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>1</Text>
            </View>
            <Text style={styles.numberedText}>
              Signaler des incidents urbains (nids-de-poule, éclairage défectueux, dégradations, etc.)
            </Text>
          </View>
          <View style={styles.numberedItem}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>2</Text>
            </View>
            <Text style={styles.numberedText}>
              Consulter et participer aux événements locaux organisés dans leur ville
            </Text>
          </View>
          <View style={styles.numberedItem}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>3</Text>
            </View>
            <Text style={styles.numberedText}>
              Communiquer directement avec les services municipaux et autorités locales
            </Text>
          </View>
          <View style={styles.numberedItem}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>4</Text>
            </View>
            <Text style={styles.numberedText}>
              Contribuer activement à l'amélioration de la qualité de vie urbaine
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Smartcities ne remplace pas les services d'urgence (police, pompiers, SAMU). En cas d'urgence, composez le 112.
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "account",
      number: "03",
      title: "Création et Gestion de Compte",
      icon: "person-circle",
      iconColor: ["#8B5CF6", "#7C3AED"] as const,
      content: (
        <>
          <Text style={styles.subTitle}>Création de compte</Text>
          <Text style={styles.paragraph}>
            Pour utiliser pleinement Smartcities, vous devez créer un compte utilisateur en fournissant :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Nom et prénom</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Adresse email valide</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Mot de passe sécurisé (minimum 8 caractères)</Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>Localisation (facultatif, mais recommandé pour une meilleure expérience)</Text>
          </View>

          <Text style={styles.subTitle}>Responsabilité du compte</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Vous êtes entièrement responsable de la confidentialité de vos identifiants et de toutes les activités effectuées via votre compte.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous devez fournir des informations exactes, complètes et à jour
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous devez notifier immédiatement Smartcities en cas d'utilisation non autorisée de votre compte
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Un seul compte par utilisateur est autorisé
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "usage",
      number: "04",
      title: "Utilisation de l'Application",
      icon: "phone-portrait",
      iconColor: ["#06B6D4", "#0891B2"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            En utilisant Smartcities, vous vous engagez à respecter les règles suivantes :
          </Text>
          
          <Text style={styles.subTitle}>✅ Usages autorisés</Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Signaler des incidents réels et vérifiables
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Participer de manière constructive aux discussions et événements
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Respecter les autres utilisateurs et les autorités locales
            </Text>
          </View>

          <Text style={styles.subTitle}>❌ Usages interdits</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Les comportements suivants sont strictement interdits et peuvent entraîner la suspension ou la suppression de votre compte :
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Publier des signalements faux, trompeurs ou abusifs
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Harceler, menacer ou insulter d'autres utilisateurs
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Diffuser du contenu illégal, offensant, diffamatoire ou pornographique
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Tenter de pirater, perturber ou endommager l'application
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Utiliser l'application à des fins commerciales non autorisées
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Créer plusieurs comptes ou usurper l'identité d'autrui
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "reports",
      number: "05",
      title: "Signalements et Contenu",
      icon: "alert-circle",
      iconColor: ["#F59E0B", "#D97706"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            Lorsque vous créez un signalement ou publiez du contenu sur Smartcities :
          </Text>

          <Text style={styles.subTitle}>Propriété du contenu</Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous conservez la propriété de votre contenu (textes, photos, commentaires)
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous accordez à Smartcities une licence non exclusive pour utiliser, afficher et partager votre contenu dans le cadre du service
            </Text>
          </View>

          <Text style={styles.subTitle}>Modération</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Smartcities se réserve le droit de modérer, modifier ou supprimer tout contenu qui viole les présentes CGU, sans préavis.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Les signalements sont vérifiés avant transmission aux autorités
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Le contenu inapproprié est supprimé dans les 24 heures
            </Text>
          </View>

          <Text style={styles.subTitle}>Responsabilité du contenu</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Vous êtes seul responsable du contenu que vous publiez. Smartcities n'est pas responsable du contenu créé par les utilisateurs.
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "user-responsibility",
      number: "06",
      title: "Responsabilités de l'Utilisateur",
      icon: "person",
      iconColor: ["#EC4899", "#DB2777"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            En tant qu'utilisateur de Smartcities, vous êtes responsable de :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Véracité des signalements :</Text> assurez-vous que vos signalements sont exacts et basés sur des faits réels
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Respect de la vie privée :</Text> ne publiez pas d'informations personnelles d'autrui sans leur consentement
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Conformité légale :</Text> respectez toutes les lois locales, nationales et internationales applicables
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Sécurité de votre compte :</Text> protégez vos identifiants et signalez toute activité suspecte
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Usage responsable :</Text> n'abusez pas de l'application ou des services municipaux
            </Text>
          </View>
          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              ✓ Votre utilisation responsable contribue à faire de Smartcities une communauté positive et efficace.
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "smartcities-responsibility",
      number: "07",
      title: "Responsabilités de Smartcities",
      icon: "business",
      iconColor: ["#1B5D85", "#155A7F"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities s'engage à :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Fournir un service accessible, sécurisé et fonctionnel
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Protéger vos données personnelles conformément au RGPD
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Transmettre vos signalements aux autorités compétentes dans les meilleurs délais
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Modérer le contenu pour garantir un environnement sain
            </Text>
          </View>

          <Text style={styles.subTitle}>Limitation de responsabilité</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Smartcities ne garantit pas la résolution de tous les signalements. La responsabilité finale appartient aux autorités locales compétentes.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Smartcities n'est pas responsable des dommages directs ou indirects résultant de l'utilisation de l'application
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              En cas de maintenance ou d'incident technique, l'application peut être temporairement indisponible
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "ip",
      number: "08",
      title: "Propriété Intellectuelle",
      icon: "shield-checkmark",
      iconColor: ["#A855F7", "#9333EA"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            Tous les éléments de l'application Smartcities (logo, design, code, textes, images) sont la propriété exclusive de Smartcities SAS et sont protégés par les lois sur la propriété intellectuelle.
          </Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Toute reproduction, représentation, modification ou exploitation non autorisée est strictement interdite et peut faire l'objet de poursuites judiciaires.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Le nom "Smartcities" et le logo sont des marques déposées
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              L'architecture logicielle et le code source sont protégés par le droit d'auteur
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Vous ne pouvez pas copier, modifier ou redistribuer l'application sans autorisation écrite
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "modifications",
      number: "09",
      title: "Modification des CGU",
      icon: "refresh-circle",
      iconColor: ["#14B8A6", "#0D9488"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            Smartcities se réserve le droit de modifier ces Conditions Générales d'Utilisation à tout moment.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Vous serez notifié par email et via l'application de toute modification importante des CGU.
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Les modifications entrent en vigueur dès leur publication
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              L'utilisation continue de l'application après modification implique l'acceptation des nouvelles conditions
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Si vous n'acceptez pas les modifications, vous devez cesser d'utiliser l'application
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "termination",
      number: "10",
      title: "Résiliation",
      icon: "close-circle",
      iconColor: ["#EF4444", "#DC2626"] as const,
      content: (
        <>
          <Text style={styles.subTitle}>Résiliation par l'utilisateur</Text>
          <Text style={styles.paragraph}>
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. La suppression est définitive et irréversible.
          </Text>

          <Text style={styles.subTitle}>Résiliation par Smartcities</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Smartcities peut suspendre ou supprimer votre compte en cas de violation des présentes CGU, sans préavis et sans remboursement.
            </Text>
          </View>
          <Text style={styles.paragraph}>
            Motifs de suspension/suppression :
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Violation répétée des conditions d'utilisation
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Publication de contenu illégal ou offensant
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Activités frauduleuses ou malveillantes
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              Non-respect des droits d'autrui
            </Text>
          </View>
        </>
      ),
    },
    {
      id: "law",
      number: "11",
      title: "Loi Applicable et Juridiction",
      icon: "hammer",
      iconColor: ["#64748B", "#475569"] as const,
      content: (
        <>
          <Text style={styles.paragraph}>
            Les présentes Conditions Générales d'Utilisation sont régies par le droit français.
          </Text>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Loi applicable :</Text> Droit français
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Juridiction compétente :</Text> Tribunaux de Paris, France
            </Text>
          </View>
          <View style={styles.listItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.listText}>
              <Text style={{ fontWeight: "700" }}>Résolution des litiges :</Text> En cas de différend, nous vous encourageons à nous contacter en premier lieu pour trouver une solution amiable
            </Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              ℹ️ Conformément à la législation européenne, vous pouvez également saisir la plateforme de règlement en ligne des litiges de la Commission européenne : ec.europa.eu/consumers/odr
            </Text>
          </View>
        </>
      ),
    },
  ];

  return (
    <LinearGradient colors={["#F6F8FB", "#EEF2F7"]} style={styles.container}>
      {/* ===== HEADER IDENTIQUE AUX AUTRES ÉCRANS ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>CONDITIONS D'UTILISATION</Text>

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
        {/* Hero Section avec date */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={["#3B82F6", "#8B5CF6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradientOverlay}
          />
          <View style={styles.legalBadge}>
            <Ionicons name="document-text" size={16} color="#1E40AF" />
            <Text style={styles.legalBadgeText}>DOCUMENT LÉGAL</Text>
          </View>
          <Text style={styles.heroTitle}>
            Conditions Générales d'Utilisation
          </Text>
          <Text style={styles.heroSubtitle}>
            Bienvenue sur Smartcities ! Ces conditions régissent votre utilisation de notre application. 
            Veuillez les lire attentivement avant de continuer.
          </Text>
          <View style={styles.effectiveDateContainer}>
            <Ionicons name="calendar" size={18} color="#64748B" />
            <Text style={styles.effectiveDateLabel}>Date d'effet :</Text>
            <Text style={styles.effectiveDate}>17 octobre 2025</Text>
          </View>
        </Animated.View>

        {/* Important Notice */}
        <View style={styles.importantNotice}>
          <View style={styles.importantNoticeHeader}>
            <Ionicons name="warning" size={28} color="#F59E0B" />
            <Text style={styles.importantNoticeTitle}>À lire absolument</Text>
          </View>
          <Text style={styles.importantNoticeText}>
            En utilisant Smartcities, vous acceptez automatiquement ces conditions. 
            Si vous n'êtes pas d'accord, veuillez ne pas utiliser l'application.
          </Text>
        </View>

        {/* Sections des CGU */}
        {termsSections.map((section) => (
          <View key={section.id} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconWrapper}>
                <LinearGradient
                  colors={[...section.iconColor]}
                  style={styles.sectionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={section.icon as any} size={26} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionNumber}>ARTICLE {section.number}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
            </View>
            <View style={styles.sectionContent}>{section.content}</View>
          </View>
        ))}

        {/* Section Acceptation avec bouton */}
        <View style={styles.acceptanceSection}>
          <View style={styles.acceptanceHeader}>
            <View style={styles.checkmarkCircle}>
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.acceptanceTitle}>
              J'ai lu et j'accepte les CGU
            </Text>
          </View>
          <Text style={styles.acceptanceText}>
            En cliquant sur le bouton ci-dessous, vous confirmez avoir lu, compris et accepté l'intégralité des Conditions Générales d'Utilisation de Smartcities.
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleAcceptance}
            disabled={hasAccepted}
          >
            <LinearGradient
              colors={hasAccepted ? ["#94A3B8", "#64748B"] : ["#10B981", "#059669"]}
              style={styles.acceptanceButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.acceptanceButtonContent}>
                <Ionicons
                  name={hasAccepted ? "checkmark-done" : "checkmark-circle"}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.acceptanceButtonText}>
                  {hasAccepted ? "Conditions acceptées ✓" : "J'accepte les conditions"}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Section Contact */}
        <View style={styles.contactSection}>
          <View style={styles.contactIconContainer}>
            <Ionicons name="help-circle" size={40} color="#8E2DE2" />
          </View>
          <Text style={styles.contactTitle}>Questions sur les CGU ?</Text>
          <Text style={styles.contactSubtitle}>
            Notre équipe juridique est disponible pour répondre à toutes vos questions concernant ces conditions d'utilisation
          </Text>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleEmail("legal@smartcities.app")}
          >
            <LinearGradient
              colors={["#8E2DE2", "#4A00E0"]}
              style={styles.contactButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.contactButtonContent}>
                <Ionicons name="mail-outline" size={22} color="#FFFFFF" />
                <Text style={styles.contactButtonText}>Contacter le service légal</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer légal */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalFooterTitle}>Informations Légales</Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>Éditeur :</Text> Smartcities SAS
          </Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>Siège social :</Text> 123 Avenue des Champs-Élysées, 75008 Paris, France
          </Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>Capital social :</Text> 50 000 €
          </Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>SIRET :</Text> 123 456 789 00012
          </Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>RCS :</Text> Paris B 123 456 789
          </Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>Contact légal :</Text>{" "}
            <Text
              style={styles.legalLink}
              onPress={() => handleEmail("legal@smartcities.app")}
            >
              legal@smartcities.app
            </Text>
          </Text>
          <Text style={styles.legalFooterText}>
            <Text style={{ fontWeight: "700" }}>Version des CGU :</Text> 2.1 - Octobre 2025
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

export default TermsScreen;