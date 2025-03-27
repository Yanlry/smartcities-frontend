// src/components/interactions/ReportDetails/LoadingErrorStates.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface LoadingStateProps {
  message?: string;
}

/**
 * Composant d'état de chargement
 */
export const LoadingState = memo(({ message = "Chargement des détails..." }: LoadingStateProps) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
});

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  buttonText?: string;
}

/**
 * Composant d'état d'erreur
 */
export const ErrorState = memo(({
  title = "Signalement introuvable",
  message = "Le signalement demandé n'est pas disponible ou a été supprimé.",
  onRetry,
  buttonText = "Retour",
}: ErrorStateProps) => {
  return (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle" size={60} color="#F44336" />
      <Text style={styles.errorTitle}>{title}</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      <TouchableOpacity
        style={styles.errorButton}
        onPress={onRetry}
      >
        <Text style={styles.errorButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});