// Chemin : frontend/components/profile/modals/PostReportModal.tsx

import React, { memo, useState, useCallback, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

/**
 * Interface pour les props du modal de signalement
 * Compatible avec l'écran PostDetailsScreen
 */
interface PostReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSendReport: (reportReason: string, reportType: string) => Promise<void>;
  postId?: string;
  postAuthor?: string;
  postTitle?: string;
}

/**
 * Catégories de signalement prédéfinies avec métadonnées
 */
const REPORT_CATEGORIES = [
  {
    id: 'inappropriate_content',
    label: 'Contenu inapproprié',
    icon: 'warning-outline',
    description: 'Contenu offensant, vulgaire ou déplacé',
    requiresDetails: true,
    severity: 'high'
  },
  {
    id: 'spam',
    label: 'Spam ou publicité',
    icon: 'ban-outline',
    description: 'Contenu publicitaire non désiré ou répétitif',
    requiresDetails: false,
    severity: 'medium'
  },
  {
    id: 'harassment',
    label: 'Harcèlement',
    icon: 'shield-outline',
    description: 'Intimidation, menaces ou harcèlement',
    requiresDetails: true,
    severity: 'high'
  },
  {
    id: 'false_information',
    label: 'Fausses informations',
    icon: 'information-circle-outline',
    description: 'Désinformation ou informations trompeuses',
    requiresDetails: true,
    severity: 'medium'
  },
  {
    id: 'violence',
    label: 'Violence ou danger',
    icon: 'alert-circle-outline',
    description: 'Incitation à la violence ou contenu dangereux',
    requiresDetails: true,
    severity: 'critical'
  },
  {
    id: 'copyright',
    label: 'Violation de droits',
    icon: 'document-text-outline',
    description: 'Utilisation non autorisée de contenu protégé',
    requiresDetails: false,
    severity: 'medium'
  },
  {
    id: 'other',
    label: 'Autre motif',
    icon: 'ellipsis-horizontal-outline',
    description: 'Autre problème non listé ci-dessus',
    requiresDetails: true,
    severity: 'low'
  }
] as const;

/**
 * Système de couleurs sémantique
 */
const COLORS = {
  primary: {
    main: "#667eea",
    light: "#8b9dff",
    dark: "#4c63d2",
    contrast: "#FFFFFF"
  },
  danger: {
    main: "#FF6B6B",
    light: "#FF8E8E",
    dark: "#FF4757",
    contrast: "#FFFFFF"
  },
  warning: {
    main: "#FFA726",
    light: "#FFB74D",
    dark: "#FF9800",
    contrast: "#FFFFFF"
  },
  success: {
    main: "#66BB6A",
    light: "#81C784",
    dark: "#4CAF50",
    contrast: "#FFFFFF"
  },
  neutral: {
    white: "#FFFFFF",
    background: "#F8F9FA",
    card: "#FFFFFF",
    border: "#E9ECEF",
    text: {
      primary: "#212529",
      secondary: "#6C757D",
      hint: "#ADB5BD"
    }
  }
} as const;

/**
 * Hook personnalisé pour la gestion des animations
 */
const useModalAnimations = (isVisible: boolean) => {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(height))[0];
  const stepAnim = useState(new Animated.Value(0))[0];

  const showModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const hideModal = useCallback((callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(callback);
  }, [fadeAnim, slideAnim]);

  const animateStep = useCallback((step: 'category' | 'details') => {
    Animated.timing(stepAnim, {
      toValue: step === 'category' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [stepAnim]);

  useEffect(() => {
    if (isVisible) {
      showModal();
    }
  }, [isVisible, showModal]);

  return { fadeAnim, slideAnim, stepAnim, hideModal, animateStep };
};

/**
 * Hook personnalisé pour la gestion d'état du modal
 */
const useReportState = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'category' | 'details'>('category');

  const resetState = useCallback(() => {
    setSelectedCategory('');
    setCustomReason('');
    setCharCount(0);
    setIsSubmitting(false);
    setCurrentStep('category');
  }, []);

  useEffect(() => {
    setCharCount(customReason.length);
  }, [customReason]);

  return {
    selectedCategory,
    setSelectedCategory,
    customReason,
    setCustomReason,
    charCount,
    isSubmitting,
    setIsSubmitting,
    currentStep,
    setCurrentStep,
    resetState
  };
};

/**
 * PostReportModal - Modal de signalement ultra-moderne
 * Architecture optimisée avec gestion d'état robuste et animations fluides
 */
export const PostReportModal: React.FC<PostReportModalProps> = memo(({ 
  isVisible, 
  onClose, 
  onSendReport,
  postId,
  postAuthor,
  postTitle
}) => {
  const insets = useSafeAreaInsets();
  const { fadeAnim, slideAnim, stepAnim, hideModal, animateStep } = useModalAnimations(isVisible);
  const {
    selectedCategory,
    setSelectedCategory,
    customReason,
    setCustomReason,
    charCount,
    isSubmitting,
    setIsSubmitting,
    currentStep,
    setCurrentStep,
    resetState
  } = useReportState();

  // Gestion du clavier optimisée
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animation de transition entre étapes
  useEffect(() => {
    animateStep(currentStep);
  }, [currentStep, animateStep]);

  // Catégorie sélectionnée avec métadonnées
  const selectedCategoryData = useMemo(() => 
    REPORT_CATEGORIES.find(cat => cat.id === selectedCategory),
    [selectedCategory]
  );

  /**
   * Validation des données avant soumission
   */
  const validateSubmission = useCallback(() => {
    if (!selectedCategory) {
      Alert.alert(
        "Catégorie requise",
        "Veuillez sélectionner une catégorie de signalement.",
        [{ text: "Compris", style: "default" }]
      );
      return false;
    }

    const requiresDetails = selectedCategoryData?.requiresDetails || selectedCategory === 'other';
    
    if (requiresDetails && customReason.trim().length < 10) {
      Alert.alert(
        "Détails requis",
        "Veuillez fournir plus de détails (minimum 10 caractères) pour nous aider à traiter votre signalement.",
        [{ text: "Compris", style: "default" }]
      );
      return false;
    }

    return true;
  }, [selectedCategory, selectedCategoryData, customReason]);

  /**
   * Sélection d'une catégorie et passage à l'étape suivante
   */
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep('details');
  }, [setSelectedCategory, setCurrentStep]);

  /**
   * Retour à la sélection de catégorie
   */
  const handleBackToCategory = useCallback(() => {
    setCurrentStep('category');
  }, [setCurrentStep]);

  /**
   * Gestion de la soumission du signalement avec validation robuste
   */
  const handleSendReport = useCallback(async () => {
    if (!validateSubmission()) return;
    
    try {
      setIsSubmitting(true);
      
      // Construction du message de signalement
      const reportMessage = customReason.trim() 
        ? `${selectedCategoryData?.label}: ${customReason.trim()}`
        : selectedCategoryData?.label || 'Signalement';
      
      await onSendReport(reportMessage, selectedCategory);
      
      // Reset et fermeture
      resetState();
      
      // Feedback de succès
      Alert.alert(
        "Signalement envoyé",
        "Merci de contribuer à la sécurité de notre communauté. Notre équipe de modération examinera ce contenu rapidement.",
        [{ 
          text: "Fermer", 
          onPress: onClose,
          style: "default"
        }]
      );
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.",
        [{ text: "Réessayer", style: "default" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [validateSubmission, customReason, selectedCategoryData, selectedCategory, onSendReport, resetState, onClose, setIsSubmitting]);

  /**
   * Fermeture avec confirmation si données saisies
   */
  const handleCloseModal = useCallback(() => {
    const hasData = selectedCategory || customReason.trim();
    
    if (hasData) {
      Alert.alert(
        "Abandonner le signalement ?",
        "Vos informations ne seront pas sauvegardées.",
        [
          { text: "Continuer l'édition", style: "cancel" },
          { 
            text: "Abandonner", 
            style: "destructive", 
            onPress: () => {
              hideModal(() => {
                resetState();
                onClose();
              });
            }
          }
        ]
      );
    } else {
      hideModal(() => {
        resetState();
        onClose();
      });
    }
  }, [selectedCategory, customReason, hideModal, resetState, onClose]);

  /**
   * Rendu de l'étape sélection de catégorie
   */
  const renderCategorySelection = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: stepAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0]
          }),
          transform: [{
            translateX: stepAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -width]
            })
          }]
        }
      ]}
    >
      <Text style={styles.stepTitle}>Choisissez une catégorie</Text>
      <Text style={styles.stepSubtitle}>
        Sélectionnez le type de problème que vous souhaitez signaler
      </Text>
      
      <ScrollView 
        style={styles.categoriesContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
      >
        {REPORT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemSelected,
              category.severity === 'critical' && styles.categoryItemCritical
            ]}
            onPress={() => handleCategorySelect(category.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.categoryIconContainer,
              category.severity === 'critical' && styles.categoryIconCritical
            ]}>
              <Ionicons 
                name={category.icon as any} 
                size={24} 
                color={
                  selectedCategory === category.id 
                    ? COLORS.primary.main 
                    : category.severity === 'critical'
                    ? COLORS.danger.main
                    : COLORS.neutral.text.secondary
                } 
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelSelected,
                category.severity === 'critical' && styles.categoryLabelCritical
              ]}>
                {category.label}
              </Text>
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
              {category.requiresDetails && (
                <Text style={styles.categoryRequirement}>
                  Détails requis
                </Text>
              )}
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={COLORS.neutral.text.hint} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  /**
   * Rendu de l'étape détails
   */
  const renderDetailsStep = () => (
    <Animated.View 
      style={[
        styles.stepContainer,
        {
          opacity: stepAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          }),
          transform: [{
            translateX: stepAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [width, 0]
            })
          }]
        }
      ]}
    >
      <View style={styles.detailsHeader}>
        <TouchableOpacity 
          onPress={handleBackToCategory}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary.main} />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Détails du signalement</Text>
      </View>
      
      {selectedCategoryData && (
        <View style={[
          styles.selectedCategoryBadge,
          selectedCategoryData.severity === 'critical' && styles.selectedCategoryBadgeCritical
        ]}>
          <Ionicons 
            name={selectedCategoryData.icon as any} 
            size={20} 
            color={
              selectedCategoryData.severity === 'critical' 
                ? COLORS.danger.main 
                : COLORS.primary.main
            } 
          />
          <Text style={[
            styles.selectedCategoryText,
            selectedCategoryData.severity === 'critical' && styles.selectedCategoryTextCritical
          ]}>
            {selectedCategoryData.label}
          </Text>
        </View>
      )}
      
      <Text style={styles.detailsInstructions}>
        {selectedCategoryData?.requiresDetails || selectedCategory === 'other'
          ? "Veuillez décrire le problème en détail (minimum 10 caractères)"
          : "Ajoutez des détails supplémentaires si nécessaire (optionnel)"
        }
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            selectedCategoryData?.severity === 'critical' && styles.textInputCritical
          ]}
          placeholder={selectedCategoryData?.requiresDetails || selectedCategory === 'other'
            ? "Décrivez le problème rencontré..."
            : "Informations complémentaires (optionnel)..."
          }
          value={customReason}
          placeholderTextColor={COLORS.neutral.text.hint}
          onChangeText={setCustomReason}
          multiline={true}
          textAlignVertical="top"
          maxLength={500}
          autoFocus={selectedCategoryData?.requiresDetails || selectedCategory === 'other'}
        />
        <Text style={[
          styles.charCount,
          charCount > 400 ? styles.charCountWarning : null,
          charCount < 10 && selectedCategoryData?.requiresDetails ? styles.charCountError : null
        ]}>
          {charCount}/500
          {selectedCategoryData?.requiresDetails && charCount < 10 && (
            <Text style={styles.charCountRequirement}> (min. 10)</Text>
          )}
        </Text>
      </View>
      
      {postId && (
        <View style={styles.postInfoContainer}>
          <Ionicons name="document-text" size={16} color={COLORS.neutral.text.hint} />
          <Text style={styles.postInfoText}>
            Publication #{postId.slice(-8)}
            {postAuthor && ` par ${postAuthor}`}
          </Text>
        </View>
      )}
    </Animated.View>
  );

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleCloseModal}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.6)" barStyle="light-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <View style={styles.backdropTouchable} />
            </TouchableWithoutFeedback>
            
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  maxHeight: keyboardVisible ? height * 0.75 : height * 0.85
                }
              ]}
            >
              {/* Header avec dégradé et glassmorphisme */}
              <LinearGradient
                colors={[COLORS.danger.main, COLORS.danger.dark]}
                style={[styles.modalHeader, { paddingTop: insets.top + 15 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.headerContent}>
                  <Ionicons name="flag" size={24} color={COLORS.danger.contrast} />
                  <Text style={styles.modalTitle}>Signaler cette publication</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={handleCloseModal}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color={COLORS.danger.contrast} />
                </TouchableOpacity>
              </LinearGradient>
              
              {/* Indicateur de progression modernisé */}
              <View style={styles.progressContainer}>
                <View style={[
                  styles.progressStep,
                  currentStep === 'category' && styles.progressStepActive
                ]}>
                  <Text style={[
                    styles.progressStepText,
                    currentStep === 'category' && styles.progressStepTextActive
                  ]}>1</Text>
                </View>
                <View style={[
                  styles.progressLine,
                  currentStep === 'details' && styles.progressLineActive
                ]} />
                <View style={[
                  styles.progressStep,
                  currentStep === 'details' && styles.progressStepActive
                ]}>
                  <Text style={[
                    styles.progressStepText,
                    currentStep === 'details' && styles.progressStepTextActive
                  ]}>2</Text>
                </View>
              </View>
              
              {/* Contenu dynamique avec animations fluides */}
              <View style={styles.contentContainer}>
                {currentStep === 'category' && renderCategorySelection()}
                {currentStep === 'details' && renderDetailsStep()}
              </View>
              
              {/* Boutons d'action avec feedback visuel */}
              {currentStep === 'details' && (
                <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 10 }]}>
                  <TouchableOpacity 
                    onPress={handleBackToCategory} 
                    style={styles.cancelButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Retour</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleSendReport} 
                    style={[
                      styles.confirmButton,
                      (!selectedCategory || 
                        ((selectedCategoryData?.requiresDetails || selectedCategory === 'other') && customReason.trim().length < 10)
                      ) && styles.confirmButtonDisabled
                    ]}
                    activeOpacity={0.7}
                    disabled={isSubmitting || !selectedCategory || 
                      ((selectedCategoryData?.requiresDetails || selectedCategory === 'other') && customReason.trim().length < 10)
                    }
                  >
                    <LinearGradient
                      colors={isSubmitting 
                        ? [COLORS.neutral.text.hint, COLORS.neutral.text.hint]
                        : [COLORS.danger.main, COLORS.danger.dark]
                      }
                      style={styles.confirmButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isSubmitting ? (
                        <View style={styles.submitButtonContent}>
                          <Ionicons name="sync" size={18} color={COLORS.danger.contrast} />
                          <Text style={styles.confirmButtonText}>Envoi...</Text>
                        </View>
                      ) : (
                        <View style={styles.submitButtonContent}>
                          <Ionicons name="send" size={18} color={COLORS.danger.contrast} />
                          <Text style={styles.confirmButtonText}>Signaler</Text>
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
});

PostReportModal.displayName = 'PostReportModal';

/**
 * Styles optimisés avec système de design cohérent
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: 20,
    overflow: 'hidden',
    width: width * 0.95,
    maxHeight: height - 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.danger.contrast,
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 40,
    backgroundColor: COLORS.neutral.background,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: COLORS.primary.main,
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral.text.hint,
  },
  progressStepTextActive: {
    color: COLORS.primary.contrast,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.neutral.border,
    marginHorizontal: 15,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary.main,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  stepContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral.text.primary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: COLORS.neutral.text.secondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  categoriesContainer: {
    flex: 1,
  },
  categoriesContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItemSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
  },
  categoryItemCritical: {
    borderColor: COLORS.danger.light,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIconCritical: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  categoryContent: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral.text.primary,
    marginBottom: 4,
  },
  categoryLabelSelected: {
    color: COLORS.primary.main,
  },
  categoryLabelCritical: {
    color: COLORS.danger.main,
  },
  categoryDescription: {
    fontSize: 13,
    color: COLORS.neutral.text.secondary,
    lineHeight: 18,
  },
  categoryRequirement: {
    fontSize: 11,
    color: COLORS.warning.main,
    fontWeight: '500',
    marginTop: 4,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  selectedCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  selectedCategoryBadgeCritical: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: 8,
  },
  selectedCategoryTextCritical: {
    color: COLORS.danger.main,
  },
  detailsInstructions: {
    fontSize: 15,
    color: COLORS.neutral.text.secondary,
    marginBottom: 15,
    lineHeight: 22,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 12,
    padding: 15,
    minHeight: 120,
    fontSize: 16,
    color: COLORS.neutral.text.primary,
    paddingBottom: 40,
    textAlignVertical: 'top',
  },
  textInputCritical: {
    borderColor: COLORS.danger.light,
    backgroundColor: 'rgba(255, 107, 107, 0.02)',
  },
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 15,
    fontSize: 12,
    color: COLORS.neutral.text.hint,
  },
  charCountWarning: {
    color: COLORS.warning.main,
  },
  charCountError: {
    color: COLORS.danger.main,
  },
  charCountRequirement: {
    fontSize: 10,
    color: COLORS.danger.main,
  },
  postInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  postInfoText: {
    fontSize: 12,
    color: COLORS.neutral.text.secondary,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
    backgroundColor: COLORS.neutral.background,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: COLORS.danger.contrast,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.white,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  cancelButtonText: {
    color: COLORS.neutral.text.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
});

// Export par défaut pour l'utilisation dans PostDetailsScreen
export default PostReportModal;