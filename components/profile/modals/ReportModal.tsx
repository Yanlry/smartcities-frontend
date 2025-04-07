// components/profile/modals/ReportModal.tsx

import React, { memo, useState, useCallback, useEffect } from "react";
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
  KeyboardAvoidingView
} from "react-native";
import { ReportModalProps } from "../../../types/features/profile/modals.types";
import { Ionicons } from "@expo/vector-icons"; // Assurez-vous d'avoir cette dépendance

const { width, height } = Dimensions.get('window');

// Palette de couleurs - Adaptez selon votre thème
const COLORS = {
  primary: {
    main: "#062C41",
    light: "#2E5775",
    dark: "#041C29",
    contrast: "#FFFFFF"
  },
  secondary: {
    main: "#FF9800",
    light: "#FFB547",
    dark: "#C66900",
    contrast: "#000000"
  },
  danger: {
    main: "#E53935",
    light: "#FF6B68",
    dark: "#AB000D",
    contrast: "#FFFFFF"
  },
  neutral: {
    white: "#FFFFFF",
    background: "#F5F7FA",
    card: "#FFFFFF",
    border: "#E0E6ED",
    text: {
      primary: "#263238",
      secondary: "#546E7A",
      hint: "#78909C"
    }
  }
};

/**
 * Composant modal pour signaler un profil utilisateur avec un design amélioré
 */
export const ReportModal: React.FC<ReportModalProps> = memo(({ 
  isVisible, 
  onClose, 
  onSendReport 
}) => {
  const [reportReason, setReportReason] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(height))[0];
  
  // Détecter quand le clavier est visible
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Animation d'entrée et de sortie
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
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);
  
  // Vérification du nombre de caractères
  useEffect(() => {
    setCharCount(reportReason.length);
  }, [reportReason]);

  /**
   * Gère la soumission du signalement
   */
  const handleSendReport = useCallback(async () => {
    if (!reportReason.trim()) {
      Alert.alert(
        "Informations incomplètes",
        "Veuillez décrire le problème avec ce profil pour continuer.",
        [{ text: "Compris", style: "default" }]
      );
      return;
    }
    
    if (reportReason.trim().length < 10) {
      Alert.alert(
        "Description trop courte",
        "Veuillez fournir plus de détails pour nous aider à traiter votre signalement efficacement.",
        [{ text: "Compris", style: "default" }]
      );
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSendReport(reportReason);
      setReportReason("");
      
      // Feedback positif
      Alert.alert(
        "Signalement envoyé",
        "Merci d'avoir contribué à la sécurité de la communauté. Votre signalement sera traité dans les plus brefs délais.",
        [{ text: "Fermer", onPress: onClose }]
      );
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [reportReason, onSendReport, onClose]);

  const handleCloseModal = useCallback(() => {
    if (reportReason.trim()) {
      Alert.alert(
        "Abandonner le signalement ?",
        "Votre texte ne sera pas sauvegardé.",
        [
          { text: "Continuer l'édition", style: "cancel" },
          { text: "Abandonner", style: "destructive", onPress: () => {
            setReportReason("");
            onClose();
          }}
        ]
      );
    } else {
      onClose();
    }
  }, [reportReason, onClose]);

  return (
    <Modal
      animationType="none" // Nous utilisons notre propre animation
      transparent={true}
      visible={isVisible}
      onRequestClose={handleCloseModal}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                  maxHeight: keyboardVisible ? '80%' : '70%'
                }
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerContent}>
                  <Ionicons name="warning" size={24} color={COLORS.danger.main} />
                  <Text style={styles.modalTitle}>Signaler ce profil</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={handleCloseModal}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={COLORS.neutral.text.secondary} />
                </TouchableOpacity>
              </View>
              
              {/* Séparateur */}
              <View style={styles.divider} />
              
              {/* Contenu */}
              <View style={styles.contentContainer}>
                <Text style={styles.instructionText}>
                  Veuillez détailler les raisons de votre signalement. Notre équipe de modération examinera votre demande dans les plus brefs délais.
                </Text>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Décrivez le problème en incluant des détails spécifiques..."
                    value={reportReason}
                    placeholderTextColor={COLORS.neutral.text.hint}
                    onChangeText={setReportReason}
                    multiline={true}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={[
                    styles.charCount,
                    charCount > 400 ? styles.charCountWarning : null
                  ]}>
                    {charCount}/500
                  </Text>
                </View>
                
                <View style={styles.tipsContainer}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primary.light} />
                  <Text style={styles.tipsText}>
                    Veillez à être précis et factuel. Incluez des dates et des exemples concrets si possible.
                  </Text>
                </View>
              </View>
              
              {/* Boutons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  onPress={handleCloseModal} 
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={handleSendReport} 
                  style={styles.confirmButton}
                  activeOpacity={0.7}
                  disabled={isSubmitting || !reportReason.trim()}
                >
                  {isSubmitting ? (
                    <View style={styles.submitButtonContent}>
                      <Ionicons name="sync" size={18} color={COLORS.primary.contrast} style={styles.spinnerIcon} />
                      <Text style={styles.confirmButtonText}>Envoi...</Text>
                    </View>
                  ) : (
                    <View style={styles.submitButtonContent}>
                      <Ionicons name="send" size={18} color={COLORS.primary.contrast} />
                      <Text style={styles.confirmButtonText}>Envoyer</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

ReportModal.displayName = 'ReportModal';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral.text.primary,
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.background,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral.border,
    marginHorizontal: 20,
  },
  contentContainer: {
    padding: 20,
  },
  instructionText: {
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
    minHeight: 150,
    fontSize: 16,
    color: COLORS.neutral.text.primary,
    paddingBottom: 40, // Espace pour le compteur
  },
  charCount: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    fontSize: 12,
    color: COLORS.neutral.text.hint,
  },
  charCountWarning: {
    color: COLORS.danger.main,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(6, 44, 65, 0.05)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  tipsText: {
    fontSize: 13,
    color: COLORS.neutral.text.secondary,
    flex: 1,
    marginLeft: 10,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  confirmButtonText: {
    color: COLORS.primary.contrast,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerIcon: {
    transform: [{ rotate: '0deg' }],
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 10,
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