// Chemin: frontend/components/common/KeyboardWrapper.tsx

import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface KeyboardWrapperProps {
  children: React.ReactNode;
  behavior?: 'height' | 'position' | 'padding' | undefined;
  enabled?: boolean;
  keyboardVerticalOffset?: number;
  shouldDismissKeyboard?: boolean;
}

/**
 * Composant pour gérer l'affichage du clavier sans interférer avec le défilement
 * Cette version corrigée n'entrave plus les gestes de défilement dans l'application
 */
const KeyboardWrapper: React.FC<KeyboardWrapperProps> = memo(({
  children,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  enabled = true,
  keyboardVerticalOffset = 0,
  shouldDismissKeyboard = false // Nouvelle prop pour contrôler le comportement de fermeture
}) => {
  // Si on veut que le toucher ferme le clavier et qu'on est sur iOS (plus sensible à ces problèmes)
  if (shouldDismissKeyboard && Platform.OS === 'ios') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={behavior}
        enabled={enabled}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {/* Utiliser un gestionnaire d'événements natif plutôt que TouchableWithoutFeedback */}
        <View 
          style={styles.innerContainer} 
          onStartShouldSetResponder={() => true}
          onResponderRelease={() => Keyboard.dismiss()}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    );
  }
  
  // Version standard sans interception de toucher
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      enabled={enabled}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
});

export default KeyboardWrapper;