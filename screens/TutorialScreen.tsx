import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../styles/screens/TutorialScreen.styles";

export default function TutorialScreen() {
  const navigation = useNavigation<any>(); // 👈 fix TypeScript ici
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue sur Smartcities 👋",
      description: "Ce tutoriel va vous faire découvrir les principales pages de l’application.",
      next: () => setStep(1),
    },
    {
      title: "Page Profil",
      description: "Ici, vous pouvez gérer vos informations personnelles et consulter vos statistiques.",
      next: () => {
        navigation.navigate("ProfileScreen");
        setTimeout(() => setStep(2), 2000);
      },
    },
    {
      title: "Fin du tutoriel 🎉",
      description: "Vous connaissez maintenant les bases !",
      next: () => navigation.navigate("Main"),
    },
  ];

  const current = steps[step];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.description}>{current.description}</Text>
      <Button title="Suivant ➜" onPress={current.next} />
    </View>
  );
}
