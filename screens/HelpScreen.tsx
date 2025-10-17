// Chemin : frontend/screens/HelpScreen.tsx

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // ✅ CORRECTION DE L'ERREUR
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/common/Sidebar";
import { useUserProfile } from "../hooks/user/useUserProfile";
import Icon from "react-native-vector-icons/MaterialIcons";
import styles from "../styles/screens/HelpScreen.styles";
/**
 * Palette de couleurs moderne avec dégradés vibrants
 */
const COLORS = {
  primary: "#1B5D85",
  secondary: "#1B5D85",
  danger: "#f44336",
  success: "#4CAF50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E0E0E0",
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#FFFFFF",
    muted: "#999999",
  },
  // ✅ CORRECTION : Ajout de "as const" pour le typage TypeScript strict
  gradients: {
    purple: ["#8E2DE2", "#4A00E0"] as const,
    orange: ["#FF416C", "#FF4B2B"] as const,
    blue: ["#00C6FB", "#005BEA"] as const,
    green: ["#11998e", "#38ef7d"] as const,
    yellow: ["#F59E0B", "#F97316"] as const,
  },
};

/**
 * Configuration des animations
 */
const ANIMATION_CONFIG = {
  spring: {
    tension: 100,
    friction: 7,
    useNativeDriver: true,
  },
  timing: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    useNativeDriver: true,
  },
};

/**
 * Composant HelpScreen - Écran d'aide et support
 * Interface moderne avec animations et design premium
 */
const HelpScreen: React.FC = () => {
  // ✅ CORRECTION : Ajout du hook useNavigation pour la navigation
  const navigation = useNavigation();
  const { unreadCount } = useNotification();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  
  // États locaux
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Références d'animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const dummyFn = () => {};

  /**
   * Animation d'entrée au montage du composant
   */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * Animation de pression sur les cartes
   * Crée un effet de "rebond" quand on appuie sur une carte
   */
  const animatePress = (index: number) => {
    Animated.sequence([
      // Réduction de la taille
      Animated.timing(scaleAnims[index], {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      // Retour à la taille normale avec un effet ressort
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        ...ANIMATION_CONFIG.spring,
      }),
    ]).start();
  };

  /**
   * Gestion des liens externes
   */
  const handleLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir le lien.");
    }
  };

  /**
   * Ouvrir l'application mail
   */
  const handleMail = () => {
    Linking.openURL("mailto:support@smartcities.app").catch(() =>
      Alert.alert("Erreur", "Impossible d'ouvrir l'application mail.")
    );
  };

  /**
   * Lancer un appel téléphonique
   */
  const handleCall = () => {
    Linking.openURL("tel:+33123456789").catch(() =>
      Alert.alert("Erreur", "Impossible de lancer l'appel.")
    );
  };

  /**
   * Toggle du sidebar
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  /**
   * Configuration des cartes d'aide
   * Chaque carte a un dégradé de couleur unique et une action
   */
  const helpCards = [
    {
      icon: "help-circle-outline",
      title: "FAQ et Documentation",
      description: "Consulte les réponses aux questions fréquentes",
      gradient: COLORS.gradients.blue,
      onPress: () => {
        animatePress(0);
        handleLink("https://smartcities.app/faq");
      },
    },
    {
      icon: "chatbubbles-outline",
      title: "Contacter le support",
      description: "Envoie un message directement à notre équipe",
      gradient: COLORS.gradients.green,
      onPress: () => {
        animatePress(1);
        handleMail();
      },
    },
    {
      icon: "call-outline",
      title: "Assistance téléphonique",
      description: "Appelle un conseiller Smartcities",
      gradient: COLORS.gradients.yellow,
      onPress: () => {
        animatePress(2);
        handleCall();
      },
    },
    {
      icon: "bug-outline",
      title: "Signaler un bug",
      description: "Informe-nous d'un problème ou d'une anomalie",
      gradient: COLORS.gradients.orange,
      onPress: () => {
        animatePress(3);
        handleLink("https://smartcities.app/feedback");
      },
    },
    {
      icon: "shield-checkmark-outline",
      title: "Politique de confidentialité",
      description: "En savoir plus sur la protection de vos données",
      gradient: COLORS.gradients.purple,
      onPress: () => {
        animatePress(4);
        handleLink("https://smartcities.app/privacy");
      },
    },
  ];

  return (
    <LinearGradient colors={["#F6F8FB", "#EEF2F7"]} style={styles.container}>
      {/* 🎨 Header modernisé - CONSERVÉ TEL QUEL */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <Icon name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AIDE & SUPPORT</Text>

        {/* ✅ CORRECTION : Maintenant le bouton fonctionne correctement */}
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

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
      >

        {/* 🎴 Cartes d'aide modernisées */}
        {helpCards.map((card, index) => (
          <Animated.View
            key={index}
            style={[
              styles.cardWrapper,
              {
                transform: [{ scale: scaleAnims[index] }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={card.onPress}
              style={styles.modernCard}
            >
              {/* ✅ CORRECTION : Utilisation explicite des index au lieu du spread */}
              <LinearGradient
                colors={[card.gradient[0], card.gradient[1], `${card.gradient[1]}E6`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientBorder}
              >
                <View style={styles.cardInner}>
                  {/* Icône avec effet glassmorphisme */}
                  <View style={styles.cardIconContainer}>
                    <LinearGradient
                      colors={[...card.gradient]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cardIconGradient}
                    >
                      <Ionicons name={card.icon as any} size={28} color="#FFF" />
                    </LinearGradient>
                  </View>

                  {/* Contenu texte */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardDescription}>{card.description}</Text>
                  </View>

                  {/* Flèche de navigation */}
                  <View style={styles.cardArrow}>
                    <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* 🚀 Bouton CTA principal avec dégradé vibrant */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleMail}
          style={styles.ctaButtonContainer}
        >
          <LinearGradient
            colors={["#8E2DE2", "#4A00E0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <View style={styles.ctaContent}>
              <Ionicons name="mail-outline" size={24} color="#fff" />
              <Text style={styles.ctaButtonText}>Contacter le support</Text>
            </View>
            <View style={styles.ctaShine} />
          </LinearGradient>
        </TouchableOpacity>

      </Animated.ScrollView>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {}}
        updateProfileImage={updateProfileImage}
      />
    </LinearGradient>
  );
};

export default HelpScreen;