// components/profile/modals/ReportModal.tsx

import React, { memo, useState, useCallback } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, Alert } from "react-native";
import { profileStyles } from "../../../styles/profileStyles";

import { ReportModalProps } from "./types";

/**
 * Composant modal pour signaler un profil utilisateur
 */
export const ReportModal: React.FC<ReportModalProps> = memo(({ 
  isVisible, 
  onClose, 
  onSendReport 
}) => {
  const [reportReason, setReportReason] = useState("");

  /**
   * Gère la soumission du signalement
   */
  const handleSendReport = useCallback(async () => {
    if (!reportReason.trim()) {
      Alert.alert("Erreur", "Veuillez saisir une raison pour le signalement.");
      return;
    }
    await onSendReport(reportReason);
    setReportReason("");
  }, [reportReason, onSendReport]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={profileStyles.modalBackdrop}>
        <View style={profileStyles.modalContainer}>
          <Text style={profileStyles.modalTitle}>Signaler ce profil</Text>
          <TextInput
            style={profileStyles.textInput}
            placeholder="Indiquez la raison ainsi que le maximum d'informations (ex: profil douteux, dates, etc...)"
            value={reportReason}
            placeholderTextColor="#777777"
            onChangeText={setReportReason}
            multiline={true}
          />
          <TouchableOpacity onPress={handleSendReport} style={profileStyles.confirmButton}>
            <Text style={profileStyles.confirmButtonText}>Envoyer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={profileStyles.cancelButton}>
            <Text style={profileStyles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

ReportModal.displayName = 'ReportModal';