// screens/CreateEventScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import PhotoManager from "../components/interactions/PhotoManager";
import {
  EventForm,
  EventDatePicker,
  LocationSelector,
  ProgressModal,
  EventFormData,
  LocationData,
} from "../components/interactions/CreateEvent";
import { useEventSubmission } from "../hooks/events/useEventSubmission";
import styles from "../styles/screens/CreateEventScreen.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import { NavigationProp } from "@react-navigation/native";

export default function CreateEventScreen({
  navigation,
}: {
  navigation: NavigationProp<any>;
}) {
  // Original form state management
  const [formData, setFormData] = useState<Partial<EventFormData>>({
    title: "",
    description: "",
    date: new Date(),
    location: {
      query: "",
      coordinates: null,
    },
  });
  const [photos, setPhotos] = useState<any[]>([]);

  // Animation states
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  // Submission management
  const { submitEvent, isSubmitting, progress, progressVisible } =
    useEventSubmission();

  // Calculate form completion percentage for visual feedback
  const completionPercentage = useMemo(() => {
    let total = 0;
    let completed = 0;

    // Title check
    total += 1;
    if (formData.title?.trim()) completed += 1;

    // Description check
    total += 1;
    if (formData.description?.trim()) completed += 1;

    // Location check
    total += 1;
    if (formData.location?.coordinates) completed += 1;

    // Photos check
    total += 1;
    if (photos.length > 0) completed += 1;

    return Math.floor((completed / total) * 100);
  }, [formData, photos]);

  // Animate component mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Original form update handlers
  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateLocation = useCallback((locationData: LocationData) => {
    setFormData((prev) => ({
      ...prev,
      location: locationData,
    }));
  }, []);

  // Original form submission
  const handleSubmit = useCallback(async () => {
    const { title, description, location } = formData;

    // Original validation
    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.query ||
      !location?.coordinates ||
      photos.length === 0
    ) {
      Alert.alert(
        "Erreur",
        "Tous les champs et au moins une photo sont obligatoires."
      );
      return;
    }

    const eventData = {
      ...formData,
      photos,
    } as EventFormData;

    const success = await submitEvent(eventData);

    if (success) {
      // Original navigation
      navigation.navigate("Main");
    }
  }, [formData, photos, submitEvent, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidContainer}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Header with gradient and back button */}
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFF"]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#062C41" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Nouvel événement</Text>
              <View style={styles.progressIndicator}>
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${completionPercentage}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>{completionPercentage}%</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Main form content - animated */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Photo manager section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="images-outline"
                  size={22}
                  color="#062C41"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Photos de l'événement</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Ajoutez jusqu'à 7 photos pour illustrer votre événement
              </Text>
              <PhotoManager
                photos={photos}
                setPhotos={setPhotos}
                maxPhotos={7}
              />
            </View>

            {/* Event details section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#062C41"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Détails de l'événement</Text>
              </View>
              <EventForm
                title={formData.title || ""}
                description={formData.description || ""}
                onTitleChange={(text) => updateField("title", text)}
                onDescriptionChange={(text) => updateField("description", text)}
              />
            </View>

            {/* Date section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color="#062C41"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Date de l'événement</Text>
              </View>
              <EventDatePicker
                date={formData.date || new Date()}
                onDateChange={(date) => updateField("date", date)}
              />
            </View>

            {/* Location section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color="#062C41"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Lieu de l'événement</Text>
              </View>
              <LocationSelector
                query={formData.location?.query || ""}
                selectedLocation={formData.location?.coordinates || null}
                onLocationSelect={updateLocation}
              />
            </View>
          </Animated.View>
        </ScrollView>

        {/* Submit button */}
        <View style={styles.submitContainer}>
          <LinearGradient
            colors={
              isSubmitting ? ["#A0A0A0", "#808080"] : ["#062C41", "#05253A"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <Text style={styles.submitText}>Envoi en cours...</Text>
              ) : (
                <>
                  <Text style={styles.submitText}>Créer l'événement</Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#FFFFFF"
                    style={styles.submitIcon}
                  />
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Progress modal */}
        <ProgressModal visible={progressVisible} progress={progress} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
