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
import { useNotification } from "../context/NotificationContext";
import Sidebar from "../components/common/Sidebar";
import { useUserProfile } from "../hooks/user/useUserProfile";
import styles from "../styles/HelpScreen.styles";

const COLORS = {
  primary: "#062C41",
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
};

const HelpScreen: React.FC = () => {
  const { unreadCount } = useNotification();
  const { user, displayName, voteSummary, updateProfileImage } = useUserProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const dummyFn = () => {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erreur", "Impossible d’ouvrir le lien.");
    }
  };

  const handleMail = () => {
    Linking.openURL("mailto:support@smartcities.app").catch(() =>
      Alert.alert("Erreur", "Impossible d’ouvrir l’application mail.")
    );
  };

  const handleCall = () => {
    Linking.openURL("tel:+33123456789").catch(() =>
      Alert.alert("Erreur", "Impossible de lancer l’appel.")
    );
  };

  // Gestion du sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  return (
    <LinearGradient colors={["#F6F8FB", "#EEF2F7"]} style={styles.container}>
      {/* Header modernisé */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={toggleSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
          <Ionicons name="menu-outline" size={26} color={COLORS.text.light} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>AIDE & SUPPORT</Text>

        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.navigate("NotificationsScreen")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.8}
        >
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {/* FAQ */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => handleLink("https://smartcities.app/faq")}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="help-circle-outline" size={30} color="#2563EB" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>FAQ et Documentation</Text>
            <Text style={styles.cardDescription}>
              Consulte les réponses aux questions fréquentes.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Contact */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={handleMail}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="chatbubbles-outline" size={30} color="#10B981" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Contacter le support</Text>
            <Text style={styles.cardDescription}>
              Envoie un message directement à notre équipe.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Téléphone */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={handleCall}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="call-outline" size={30} color="#F59E0B" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Assistance téléphonique</Text>
            <Text style={styles.cardDescription}>
              Appelle un conseiller Smartcities.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Feedback */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => handleLink("https://smartcities.app/feedback")}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="bug-outline" size={30} color="#EF4444" />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Signaler un bug</Text>
            <Text style={styles.cardDescription}>
              Informe-nous d’un problème ou d’une anomalie.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Confidentialité */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => handleLink("https://smartcities.app/privacy")}
        >
          <View style={styles.cardIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={30}
              color="#3B82F6"
            />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Politique de confidentialité</Text>
            <Text style={styles.cardDescription}>
              En savoir plus sur la protection de vos données.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bouton principal */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleMail}
          style={styles.gradientButtonContainer}
        >
          <LinearGradient
            colors={["#2563EB", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="mail-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>Contacter le support</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        user={user}
        displayName={displayName}
        voteSummary={voteSummary}
        onShowNameModal={dummyFn}
        onShowVoteInfoModal={dummyFn}
        onNavigateToCity={() => {
          /* TODO : remplacer par une navigation appropriée si besoin */
        }}
        updateProfileImage={updateProfileImage}
      />
    </LinearGradient>
  );
};

export default HelpScreen;
