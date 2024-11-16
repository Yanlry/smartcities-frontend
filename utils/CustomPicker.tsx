import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CustomPickerProps {
  label: string; // Texte du champ
  options: { label: string; value: string; isDefault?: boolean }[]; // Liste des options
  selectedValue: string; // Valeur sélectionnée
  onValueChange: (value: string) => void; // Fonction appelée lors de la sélection
  containerStyle?: object;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleValueChange = (value: string) => {
    if (value === '') {
      // Empêche la sélection de l'option par défaut
      Alert.alert('Attention', 'Vous devez sélectionner une option valide.');
      return;
    }

    onValueChange(value);
    setShowPicker(false); // Ferme le modal après sélection
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedValue
            ? options.find((item) => item.value === selectedValue)?.label
            : 'Sélectionnez une option'}
        </Text>
      </TouchableOpacity>

      {/* Modal avec Picker */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Picker
              selectedValue={selectedValue}
              onValueChange={handleValueChange}
              style={styles.picker}
            >
              {options.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  color={option.isDefault ? '#ccc' : '#000'}
                />
              ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 50,
    padding: 10,
    backgroundColor: '#fff',
    width: 300,
  },
  dropdownText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 200,
  },
});

export default CustomPicker;
