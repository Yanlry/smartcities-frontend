// Chemin : components/profile/modals/PostReportModal.tsx

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
  ScrollView
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Interface pour les props du modal
interface PostReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSendReport: (reportReason: string, reportType: string) => Promise<void>;
  postId?: string;
  postAuthor?: string;
  postTitle?: string;
}

// Catégories de signalement prédéfinies
const REPORT_CATEGORIES = [
  {
    id: 'inappropriate_content',
    label: 'Contenu inapproprié',
    icon: 'warning-outline',
    description: 'Contenu offensant, vulgaire ou déplacé'
  },
  {
    id: 'spam',
    label: 'Spam ou publicité',
    icon: 'ban-outline',
    description: 'Contenu publicitaire non désiré ou répétitif'
  },
  {
    id: 'harassment',
    label: 'Harcèlement',
    icon: 'shield-outline',
    description: 'Intimidation, menaces ou harcèlement'
  },
  {
    id: 'false_information',
    label: 'Fausses informations',
    icon: 'information-circle-outline',
    description: 'Désinformation ou informations trompeuses'
  },
  {
    id: 'violence',
    label: 'Violence ou danger',
    icon: 'alert-circle-outline',
    description: 'Incitation à la violence ou contenu dangereux'
  },
  {
    id: 'copyright',
    label: 'Violation de droits',
    icon: 'document-text-outline',
    description: 'Utilisation non autorisée de contenu protégé'
  },
  {
    id: 'other',
    label: 'Autre motif',
    icon: 'ellipsis-horizontal-outline',
    description: 'Autre problème non listé ci-dessus'
  }
] as const;

// Palette de couleurs optimisée
const COLORS = {
  primary: {
    main: "#667eea",
    light: "#764ba2",
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
};

/**
 * Modal de signalement optimisé pour les publications
 * Offre une interface intuitive avec catégories prédéfinies et champ personnalisé
 */
export const PostReportModal: React.FC<PostReportModalProps> = memo(({ 
  isVisible, 
  onClose, 
  onSendReport,
  postId,
  postAuthor,
  postTitle
}) => {
  // États locaux
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'category' | 'details'>('category');
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(height))[0];
  const stepAnim = useState(new Animated.Value(0))[0];
  
  // Gestion du clavier
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
  
  // Animations d'ouverture/fermeture
  useEffect(() => {
    if (isVisible) {
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
    } else {
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
      ]).start(() => {
        // Reset du modal à la fermeture
        setCurrentStep('category');
        setSelectedCategory('');
        setCustomReason('');
        setCharCount(0);
      });
    }
  }, [isVisible, fadeAnim, slideAnim]);

  // Animation de transition entre étapes
  useEffect(() => {
    Animated.timing(stepAnim, {
      toValue: currentStep === 'category' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, stepAnim]);
  
  // Suivi du nombre de caractères
  useEffect(() => {
    setCharCount(customReason.length);
  }, [customReason]);

  // Catégorie sélectionnée avec détails
  const selectedCategoryData = useMemo(() => 
    REPORT_CATEGORIES.find(cat => cat.id === selectedCategory),
    [selectedCategory]
  );

  /**
   * Sélection d'une catégorie et passage à l'étape suivante
   */
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep('details');
  }, []);

  /**
   * Retour à la sélection de catégorie
   */
  const handleBackToCategory = useCallback(() => {
    setCurrentStep('category');
  }, []);

  /**
   * Gestion de la soumission du signalement
   */
  const handleSendReport = useCallback(async () => {
    if (!selectedCategory) {
      Alert.alert(
        "Catégorie requise",
        "Veuillez sélectionner une catégorie de signalement.",
        [{ text: "Compris", style: "default" }]
      );
      return;
    }

    const requiresCustomReason = selectedCategory === 'other' || 
      ['inappropriate_content', 'harassment', 'false_information'].includes(selectedCategory);
    
    if (requiresCustomReason && customReason.trim().length < 10) {
      Alert.alert(
        "Détails requis",
        "Veuillez fournir plus de détails pour nous aider à traiter votre signalement.",
        [{ text: "Compris", style: "default" }]
      );
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Construction du message de signalement
      const reportMessage = customReason.trim() 
        ? `${selectedCategoryData?.label}: ${customReason.trim()}`
        : selectedCategoryData?.label || 'Signalement';
      
      await onSendReport(reportMessage, selectedCategory);
      
      // Feedback de succès
      Alert.alert(
        "✅ Signalement envoyé",
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
        "❌ Erreur",
        "Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.",
        [{ text: "Réessayer", style: "default" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCategory, customReason, selectedCategoryData, onSendReport, onClose]);

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
            onPress: onClose
          }
        ]
      );
    } else {
      onClose();
    }
  }, [selectedCategory, customReason, onClose]);

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
      >
        {REPORT_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.categoryItemSelected
            ]}
            onPress={() => handleCategorySelect(category.id)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryIconContainer}>
              <Ionicons 
                name={category.icon as any} 
                size={24} 
                color={selectedCategory === category.id 
                  ? COLORS.primary.main 
                  : COLORS.neutral.text.secondary
                } 
              />
            </View>
            <View style={styles.categoryContent}>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelSelected
              ]}>
                {category.label}
              </Text>
              <Text style={styles.categoryDescription}>
                {category.description}
              </Text>
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
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary.main} />
        </TouchableOpacity>
        <Text style={styles.stepTitle}>Détails du signalement</Text>
      </View>
      
      {selectedCategoryData && (
        <View style={styles.selectedCategoryBadge}>
          <Ionicons 
            name={selectedCategoryData.icon as any} 
            size={20} 
            color={COLORS.primary.main} 
          />
          <Text style={styles.selectedCategoryText}>
            {selectedCategoryData.label}
          </Text>
        </View>
      )}
      
      <Text style={styles.detailsInstructions}>
        {selectedCategory === 'other' 
          ? "Veuillez décrire le problème en détail"
          : "Ajoutez des détails supplémentaires si nécessaire (optionnel)"
        }
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={selectedCategory === 'other' 
            ? "Décrivez le problème rencontré..."
            : "Informations complémentaires (optionnel)..."
          }
          value={customReason}
          placeholderTextColor={COLORS.neutral.text.hint}
          onChangeText={setCustomReason}
          multiline={true}
          textAlignVertical="top"
          maxLength={500}
          autoFocus={selectedCategory === 'other'}
        />
        <Text style={[
          styles.charCount,
          charCount > 400 ? styles.charCountWarning : null
        ]}>
          {charCount}/500
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableWithoutFeedback onPress={handleCloseModal}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
            
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: slideAnim }],
                  maxHeight: keyboardVisible ? '85%' : '75%'
                }
              ]}
            >
              {/* Header avec dégradé */}
              <LinearGradient
                colors={[COLORS.danger.main, COLORS.danger.dark]}
                style={styles.modalHeader}
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
                >
                  <Ionicons name="close" size={24} color={COLORS.danger.contrast} />
                </TouchableOpacity>
              </LinearGradient>
              
              {/* Indicateur de progression */}
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
              
              {/* Contenu dynamique */}
              <View style={styles.contentContainer}>
                {currentStep === 'category' && renderCategorySelection()}
                {currentStep === 'details' && renderDetailsStep()}
              </View>
              
              {/* Boutons d'action */}
              {currentStep === 'details' && (
                <View style={styles.buttonContainer}>
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
                        (selectedCategory === 'other' && customReason.trim().length < 10)
                      ) && styles.confirmButtonDisabled
                    ]}
                    activeOpacity={0.7}
                    disabled={isSubmitting || !selectedCategory || 
                      (selectedCategory === 'other' && customReason.trim().length < 10)
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

PostReportModal.displayName = 'PostReportModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 25,
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
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  categoryDescription: {
    fontSize: 13,
    color: COLORS.neutral.text.secondary,
    lineHeight: 18,
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
  selectedCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.main,
    marginLeft: 8,
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
  charCount: {
    position: 'absolute',
    bottom: 12,
    right: 15,
    fontSize: 12,
    color: COLORS.neutral.text.hint,
  },
  charCountWarning: {
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

export default PostReportModal;