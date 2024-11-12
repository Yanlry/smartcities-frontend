// frontend/screens/Auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Logique d'enregistrement
  };

  return (
    <View>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mot de passe"
        secureTextEntry
      />
      <Button title="S'inscrire" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;  // Assure-toi que le composant est exporté par défaut
