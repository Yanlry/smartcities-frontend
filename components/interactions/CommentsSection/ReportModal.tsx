import React, { useState, memo } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { ReportModalProps } from './types';


const ReportModal: React.FC<ReportModalProps> = memo(({ 
  isVisible, 
  onClose, 
  onSubmit 
}) => {
  const [reportReason, setReportReason] = useState("");

  const handleSubmit = async () => {
    if (reportReason.trim()) {
      await onSubmit(reportReason);
      setReportReason("");
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Signaler un commentaire</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Quelle est la raison de votre signalement ?"
            placeholderTextColor="#A9A9A9"
            value={reportReason}
            onChangeText={setReportReason}
            multiline
          />
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.confirmButton}
            disabled={!reportReason.trim()}
          >
            <Text style={styles.confirmButtonText}>Envoyer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    height: 100,
    width: "100%",
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F2F4F7",
    marginBottom: 20,
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#ff4d4f",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ReportModal;