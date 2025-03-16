// components/interactions/EventCreation/AddressSuggestionModal.tsx
import React, { memo } from 'react';
import { 
  Modal, View, Text, TouchableOpacity, 
  ScrollView, StyleSheet 
} from 'react-native';
import { AddressSuggestionModalProps } from './types';

/**
 * Modal affichant les suggestions d'adresses
 */
const AddressSuggestionModal: React.FC<AddressSuggestionModalProps> = memo(({
  visible,
  suggestions,
  onSelect,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Sélectionnez une adresse</Text>
          
          <ScrollView style={styles.scrollView}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={`${item.formatted}-${index}`}
                style={styles.suggestionItem}
                onPress={() => onSelect(item)}
              >
                <Text style={styles.suggestionText}>{item.formatted}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#062C41',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddressSuggestionModal;