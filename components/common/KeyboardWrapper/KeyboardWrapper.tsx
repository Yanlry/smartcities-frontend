import React, { memo } from 'react';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { KeyboardWrapperProps } from './types';

const KeyboardWrapper: React.FC<KeyboardWrapperProps> = memo(({
  children,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  enabled = true,
  keyboardVerticalOffset = 0
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={behavior}
      enabled={enabled}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {children}
        </View>
      </TouchableWithoutFeedback>
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