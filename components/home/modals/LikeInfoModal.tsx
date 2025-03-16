// Chemin : src/components/modals/LikeInfoModal.tsx

import React, { memo, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef, useEffect } from 'react';

// Types
interface InteractionInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

interface InstructionItemProps {
  icon: 'eye-outline' | 'thumbs-up-outline' | 'thumbs-down-outline' | 'globe-outline';
  iconColor: string;
  text: string;
}

// Constantes
const SOCIAL_INSTRUCTIONS = [
  {
    icon: 'eye-outline' as 'eye-outline',
    iconColor: '#555555',
    text: 'Explorez et consultez un maximum de signalements pour rester informé.'
  },
  {
    icon: 'thumbs-up-outline' as 'thumbs-up-outline',
    iconColor: '#4267B2', // Couleur Facebook-like
    text: 'Votez <b>Oui</b> si le problème signalé est toujours présent et nécessite une intervention.'
  },
  {
    icon: 'thumbs-down-outline' as 'thumbs-down-outline',
    iconColor: '#E53935', // Rouge plus vif
    text: 'Votez <b>Non</b> si le problème a été résolu ou n\'est plus d\'actualité.'
  },
  {
    icon: 'globe-outline' as 'globe-outline',
    iconColor: '#1DA1F2', // Couleur Twitter-like
    text: 'Vous pouvez <b>voter dans toutes les villes</b>, pas seulement la vôtre ! Plus vous participez, plus vous gagnez de points citoyens.'
  }
];

const FOOTER_TEXT = '📢 Plus vous interagissez, plus vous évoluez et débloquez de nouveaux badges. Contribuez à améliorer votre ville et celles des autres !';

// Sous-composants
const ModalHeader: React.FC = memo(() => (
  <>
    <View style={styles.iconContainer}>
      <Ionicons
        name="information-circle"
        size={60}
        color="#4267B2"
        style={styles.icon}
      />
    </View>
    <Text style={styles.title}>
      Augmentez votre influence sociale
    </Text>
  </>
));

const InstructionItem: React.FC<InstructionItemProps> = memo(({ icon, iconColor, text }) => {
  // Fonction pour rendre le texte avec des parties en gras
  const renderFormattedText = useCallback(() => {
    const parts = text.split(/<b>|<\/b>/);
    
    return parts.map((part, index) => {
      // Les indices pairs sont du texte normal, les impairs sont à mettre en gras
      const isHighlighted = index % 2 === 1;
      return (
        <Text 
          key={index} 
          style={isHighlighted ? styles.highlightedText : null}
        >
          {part}
        </Text>
      );
    });
  }, [text]);

  return (
    <View style={styles.instructionItem}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.instructionText}>
        {renderFormattedText()}
      </Text>
    </View>
  );
});

// Composant principal
const LikeInfoModal: React.FC<InteractionInfoModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animation d'entrée et de sortie
  useEffect(() => {
    if (visible) {
      // Reset animation values
      slideAnim.setValue(50);
      opacityAnim.setValue(0);
      
      // Start animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  // Gérer la fermeture avec animation
  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  }, [onClose, slideAnim, opacityAnim]);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={[styles.modalOverlay, { paddingTop: insets.top }]}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ModalHeader />
          
          <View style={styles.instructionsContainer}>
            {SOCIAL_INSTRUCTIONS.map((instruction, index) => (
              <InstructionItem
                key={`instruction_${index}`}
                icon={instruction.icon}
                iconColor={instruction.iconColor}
                text={instruction.text}
              />
            ))}
          </View>

          <Text style={styles.footerText}>
            {FOOTER_TEXT}
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={handleClose}
          >
            <Text style={styles.actionButtonText}>
              OK, j'ai compris
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    opacity: 0.9,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333333',
  },
  highlightedText: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  footerText: {
    marginBottom: 24,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    color: '#555555',
    paddingHorizontal: 10,
  },
  actionButton: {
    backgroundColor: '#4267B2', // Couleur bleue style Facebook
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4267B2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default memo(LikeInfoModal);