// Chemin : screens/CreateReportScreen.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { categories } from '../utils/reportHelpers';
import { useLocation } from '../hooks/location/useLocation';
import { useReportForm } from '../hooks/reports/useReportForm';
import { useReportLocation } from '../hooks/reports/useReportLocation';
import { CURRENT_LOCATION_LABEL } from '../components/interactions/CreateReport/LocationSelectionStep';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CategorySelection,
  ReportDetailsForm,
  LocationSelectionStep,
  ProgressModal,
  StepNavigation,
} from '../components/interactions/CreateReport';

/**
 * Écran de création d'un nouveau signalement
 * Avec validation à chaque étape et UI responsive
 */
const CreateReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Obtenir les insets pour gérer les zones sécurisées
  const insets = useSafeAreaInsets();
  
  // Utilisation du hook de localisation
  const { location, loading } = useLocation();

  // Gestion du formulaire de signalement
  const {
    formData,
    step,
    isSubmitting,
    progress,
    progressModalVisible,
    progressSteps,
    setTitle,
    setDescription,
    setAddress,
    setCategory,
    setPhotos,
    updateCoordinates,
    nextStep,
    prevStep,
    submitReport,
    setProgressModalVisible,
  } = useReportForm(() => navigation.navigate("Main"));

  // Utilisation du hook spécialisé pour la localisation de rapports
  const {
    query,
    setQuery,
    suggestions,
    modalVisible,
    setModalVisible,
    selectedLocation,
    searchAddress,
    handleSuggestionSelect,
    handleMapSelection,
    useCurrentLocation,
  } = useReportLocation((coords, address) => {
    updateCoordinates(coords.latitude, coords.longitude);
    setAddress(address);
  });

  // Gestion de la position actuelle
  const handleUseLocation = async () => {
    if (loading || !location) {
      return;
    }
    
    useCurrentLocation(location);
  };

  /**
   * Validation de l'étape actuelle
   * Cette fonction détermine si l'utilisateur peut passer à l'étape suivante
   */
  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        // Étape 1: Une catégorie doit être sélectionnée
        return !!formData.category;
      case 2:
        // Étape 2: Titre et description doivent être remplis
        return !!formData.title.trim() && !!formData.description.trim();
      case 3:
        // Étape 3: Une localisation doit être sélectionnée
        return !!formData.coordinates;
      default:
        return true;
    }
  }, [step, formData]);

  /**
   * Gestion améliorée du passage à l'étape suivante
   * Avec validation et feedback utilisateur
   */
  const handleNextStep = () => {
    if (!canProceed) {
      // Afficher un message d'erreur spécifique à chaque étape
      switch(step) {
        case 1:
          Alert.alert(
            "Sélection requise", 
            "Veuillez sélectionner une catégorie pour continuer.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 2:
          Alert.alert(
            "Informations manquantes",
            "Veuillez compléter le titre et la description du signalement.",
            [{ text: "OK", style: "default" }]
          );
          break;
        case 3:
          Alert.alert(
            "Localisation requise",
            "Veuillez sélectionner une localisation sur la carte.",
            [{ text: "OK", style: "default" }]
          );
          break;
      }
      return;
    }
    
    // Si la validation passe, aller à l'étape suivante
    nextStep();
  };

  /**
   * Rendu conditionnel en fonction de l'étape actuelle
   */
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CategorySelection
            categories={categories}
            selectedCategory={formData.category}
            onCategorySelect={setCategory}
            onBack={() => navigation.goBack()}
          />
        );
      case 2:
        return (
          <ReportDetailsForm
            title={formData.title}
            description={formData.description}
            photos={formData.photos}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onPhotosChange={setPhotos}
          />
        );
      case 3:
        return (
          <LocationSelectionStep
            query={query}
            onQueryChange={setQuery}
            onSearchAddress={searchAddress}
            onUseCurrentLocation={handleUseLocation}
            onMapPress={handleMapSelection}
            selectedLocation={selectedLocation}
            initialLocation={location}
            isLoading={loading}
            modalVisible={modalVisible}
            suggestions={suggestions}
            onSuggestionSelect={handleSuggestionSelect}
            onModalClose={() => setModalVisible(false)}
            onSubmit={submitReport}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  // Calcul du padding inférieur pour éviter que le contenu soit masqué par les contrôles fixes
  const bottomPadding = 100 + insets.bottom;

  return (
    <View style={styles.mainContainer}>
      {/* Contenu défilant */}
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding } // Espace supplémentaire pour éviter le chevauchement
        ]}
        enableOnAndroid={true}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {renderStep()}
        </View>
      </KeyboardAwareScrollView>

      {/* Barre de navigation fixe avec validation d'étape */}
      <View 
        style={[
          styles.fixedBottomContainer, 
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }
        ]}
        pointerEvents="box-none"
      >
        <StepNavigation
          currentStep={step}
          totalSteps={3}
          onPrevStep={prevStep}
          onNextStep={handleNextStep}
          canProceed={canProceed}
        />
      </View>

      {/* Modal de progression */}
      <ProgressModal
        visible={progressModalVisible}
        progress={progress}
        steps={progressSteps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fixedBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    // Compatibilité avec Android
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
    }),
  },
});

export default CreateReportScreen;