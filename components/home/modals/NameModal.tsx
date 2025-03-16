// Chemin : src/components/modals/NameModal.tsx

import React, { memo, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  Modal, 
  FlatList, 
  StyleSheet, 
  Animated, 
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Interface définissant les propriétés du modal de préférence de nom
 */
interface NameModalProps {
  visible: boolean;
  onClose: () => void;
  useFullName: boolean;
  onOptionChange: (option: 'fullName' | 'username') => void;
}

/**
 * Interface pour une option d'affichage de nom
 */
interface NameOption {
  label: string;
  value: boolean;
  icon: string;
}

/**
 * Composant NameModal - Permet à l'utilisateur de choisir entre afficher
 * son nom complet ou son nom d'utilisateur dans l'application
 */
const NameModal: React.FC<NameModalProps> = memo(({
  visible,
  onClose,
  useFullName,
  onOptionChange
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Options d'affichage de nom disponibles
  const nameOptions: NameOption[] = [
    {
      label: "Mon nom et prénom",
      value: true,
      icon: "person"
    },
    {
      label: "Mon nom d'utilisateur",
      value: false,
      icon: "at"
    }
  ];

  // Animation d'entrée et de sortie du modal
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
    }
  }, [visible, fadeAnim, scaleAnim]);
  
  // Gestionnaire optimisé pour le changement d'option
  const handleOptionChange = useCallback((optionValue: boolean) => {
    onOptionChange(optionValue ? 'fullName' : 'username');
  }, [onOptionChange]);
  
  // Fonction de rendu optimisée pour chaque élément de la liste
  const renderItem = useCallback(({ item }: { item: NameOption }) => {
    const isSelected = useFullName === item.value;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.optionItem}
        onPress={() => handleOptionChange(item.value)}
      >
        <View style={styles.optionContent}>
          <View style={[
            styles.iconContainer,
            isSelected && styles.selectedIconContainer
          ]}>
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={20}
              color={isSelected ? '#FFFFFF' : '#062C41'}
            />
          </View>
          <Text style={[
            styles.optionText,
            isSelected && styles.selectedOptionText
          ]}>
            {item.label}
          </Text>
        </View>
        <Switch
          value={isSelected}
          onValueChange={() => handleOptionChange(item.value)}
          trackColor={{ false: "#CCCCCC", true: "#062C41" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#CCCCCC"
        />
      </TouchableOpacity>
    );
  }, [useFullName, handleOptionChange]);
  
  // Extraction de la clé pour la FlatList
  const keyExtractor = useCallback((item: NameOption) => 
    item.value.toString(), []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[
        styles.modalOverlay, 
        { paddingTop: insets.top }
      ]}>
        <Animated.View 
          style={[
            styles.modalContainerName,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerContainer}>
            <Ionicons
              name="person-circle"
              size={40}
              color="#062C41"
              style={styles.headerIcon}
            />
            <Text style={styles.modalTitleName}>
              Indiquez votre préférence pour votre identité visible
            </Text>
          </View>
          
          <FlatList
            data={nameOptions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.optionsList}
            contentContainerStyle={styles.optionsContent}
          />
          
          <View style={styles.noticeContainer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#666666"
            />
            <Text style={styles.noticeText}>
              Ce paramètre sera appliqué dans toute l'application
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Appliquer</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
});

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainerName: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    marginBottom: 12,
  },
  modalTitleName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333333',
    lineHeight: 24,
  },
  optionsList: {
    marginVertical: 12,
  },
  optionsContent: {
    paddingVertical: 4,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: '#062C41',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#062C41',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  noticeText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#062C41',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#062C41',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default NameModal;