// screens/CreateReportScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { categories } from '../utils/reportHelpers';
import { useLocation } from '../hooks/location/useLocation';
import { useReportForm } from '../hooks/reports/useReportForm';
import { useReportLocation } from '../hooks/reports/useReportLocation';
import { CURRENT_LOCATION_LABEL } from '../components/interactions/CreateReport/LocationSelectionStep';
import {
  CategorySelection,
  ReportDetailsForm,
  LocationSelectionStep,
  ProgressModal,
  StepNavigation,
} from '../components/interactions/CreateReport';

/**
 * Écran de création d'un nouveau signalement
 */
const CreateReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
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
    
    // Appeler directement useCurrentLocation avec la position actuelle
    // La mise à jour de la barre de recherche et l'affichage du modal
    // seront gérés par le hook lui-même
    useCurrentLocation(location);
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

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.scrollContent}
      enableOnAndroid={true}
      extraHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {renderStep()}

        <StepNavigation
          currentStep={step}
          totalSteps={3}
          onPrevStep={prevStep}
          onNextStep={nextStep}
        />

        <ProgressModal
          visible={progressModalVisible}
          progress={progress}
          steps={progressSteps}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
});

export default CreateReportScreen;