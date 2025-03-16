import React from 'react';
import { 
  Modal, 
  View, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import { AddressSuggestion } from './types';

interface AddressSuggestionModalProps {
  visible: boolean;
  suggestions: AddressSuggestion[];
  onSelect: (suggestion: AddressSuggestion) => void;
  onClose: () => void;
}

/**
 * Composant modal pour afficher et sélectionner des suggestions d'adresses
 */
const AddressSuggestionModal: React.FC<AddressSuggestionModalProps> = ({
  visible,
  suggestions,
  onSelect,
  onClose
}) => {
  /**
   * Gère l'appui en dehors du modal pour le fermer
   */
  const handleOutsidePress = () => {
    onClose();
  };

  /**
   * Empêche la propagation des événements de toucher
   */
  const handleModalContentPress = (e: any) => {
    e.stopPropagation();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={handleModalContentPress}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionnez une adresse</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.suggestionList}>
                {suggestions.length === 0 ? (
                  <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
                ) : (
                  suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={`${item.formatted}-${index}`}
                      style={styles.suggestionItem}
                      onPress={() => onSelect(item)}
                    >
                      <Text style={styles.suggestionText}>
                        {item.formatted.replace(/unnamed road/gi, 'Route inconnue')}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
  },
  suggestionList: {
    maxHeight: 300,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  noResultsText: {
    padding: 20,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
});

export default React.memo(AddressSuggestionModal);