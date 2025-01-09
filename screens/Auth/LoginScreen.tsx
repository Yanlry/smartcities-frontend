import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  Modal,
  Alert,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { BlurView } from "expo-blur";
// @ts-ignore
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/MaterialIcons";


export default function LoginScreen({ navigation, onLogin }: any) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoginClicked,
    handleLogin,
  } = useAuth();

  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [step, setStep] = useState(1); // Étape du processus
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // État pour la visibilité du mot de passe

  const handleLoginClick = () => {
    handleLogin(onLogin);
  };

  const handleRegisterNavigation = () => {
    setIsRegisterClicked(true);
    navigation.navigate("Register");
    setTimeout(() => setIsRegisterClicked(false), 500);
  };

  const handleForgotPassword = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordEmail.trim().toLowerCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Succès", data.message); // Affiche le message de succès
        setStep(2); // Passer à l'étape 2
      } else if (response.status === 404) {
        const data = await response.json();
        Alert.alert(
          "Vérifié le champs de saisie",
          data.message || "Adresse email introuvable."
        ); // Affiche l'erreur pour un email inexistant
      } else {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error); // Log pour débogage
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };
  
  const handleResetPassword = async () => {
    setIsLoading(true);
    // Étape 2 : Réinitialisation du mot de passe avec le token
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordEmail.trim().toLowerCase(),
          resetToken: resetToken,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Votre mot de passe a été réinitialisé.");
        setIsModalVisible(false); // Fermer le modal
        setStep(1); // Réinitialiser les étapes
      } else {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    } finally {
      setIsLoading(false); // Fin du chargement
    }
  };

  const handleCancelStep2 = async () => {
    Alert.alert(
      "Confirmation",
      "Le processus de réinitialisation va être abandonné, et le token ne sera plus valide. Êtes-vous sûr ?",
      [
        {
          text: "Non",
          style: "cancel", // Fermer l'alerte
        },
        {
          text: "Oui",
          onPress: async () => {
            try {
              // Appeler une API pour invalider le token si nécessaire
              const response = await fetch(
                "http://localhost:3000/auth/invalidate-token",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resetToken }),
                }
              );

              if (response.ok) {
                Alert.alert("Succès", "Le processus a été annulé.");
              } else {
                const data = await response.json();
                Alert.alert(
                  "Erreur",
                  data.message || "Une erreur s'est produite."
                );
              }
            } catch (error) {
              console.log("Erreur", "Impossible de se connecter au serveur.");
            }

            // Fermer le modal et réinitialiser les étapes
            setIsModalVisible(false);
            setStep(1); // Retourner à l'étape initiale
            setForgotPasswordEmail("");
            setResetToken("");
            setNewPassword("");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Image d'arrière-plan */}
      <ImageBackground
        source={require("../../assets/images/1.jpg")}
        style={styles.background}
      >
        {/* Section floue au centre */}
        <BlurView intensity={80} style={styles.blurContainer}>
          <Text style={styles.title}>Bienvenue sur Smartcities !</Text>
          <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="Adresse Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCorrect={false} // Désactive la correction automatique
            spellCheck={false} // Désactive la vérification orthographique
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputPassword}
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Mot de passe"
              placeholderTextColor="#aaa"
              secureTextEntry={!isPasswordVisible} // Contrôle la visibilité
              autoCorrect={false} // Désactive la correction automatique
              spellCheck={false} // Désactive la vérification orthographique
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)} // Toggle visibilité
            >
              <Icon
                name={isPasswordVisible ? "visibility-off" : "visibility"} // Icône selon l'état
                size={26}
                color="#666"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.passwordText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, isLoginClicked && styles.buttonClicked]}
            onPress={handleLoginClick}
          >
            <Text style={styles.loginButtonText}>CONNEXION</Text>
          </TouchableOpacity>

          <Text style={styles.registerText} >
            Pas de compte ?{" "}
            <Text
              style={{ fontWeight: "bold", textDecorationLine: "underline" }}
              onPress={handleRegisterNavigation}
            >
              Inscrivez-vous
            </Text>
          </Text>
        </BlurView>
      </ImageBackground>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {step === 1 && (
              <>
                <Text style={styles.modalTitle}>
                  Réinitialisation : Étape 1
                </Text>
                <Text style={styles.modalText}>
                  Entrez votre email pour recevoir un token.
                </Text>
                <TextInput
                  style={styles.inputModal}
                  value={forgotPasswordEmail}
                  onChangeText={setForgotPasswordEmail}
                  placeholder="Adresse Email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCorrect={false} // Désactive la correction automatique
                  spellCheck={false} // Désactive la vérification orthographique
                />
                <TouchableOpacity
                  style={[
                    styles.modalButtonSubmit,
                    !forgotPasswordEmail && { backgroundColor: "#ccc" }, // Grisé si désactivé
                  ]}
                  onPress={handleForgotPassword}
                  disabled={!forgotPasswordEmail} // Désactivation du bouton
                >
                  <Text style={styles.modalButtonTextSubmit}>Envoyer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseButtonText}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.modalTitle}>
                  Réinitialisation : Étape 2
                </Text>
                <Text style={styles.modalText}>
                  Entrez le token, votre email, et un nouveau mot de passe.
                </Text>
                <TextInput
                  style={styles.inputModal}
                  value={forgotPasswordEmail}
                  onChangeText={setForgotPasswordEmail}
                  placeholder="Adresse Email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCorrect={false} // Désactive la correction automatique
                  spellCheck={false} // Désactive la vérification orthographique
                />
                <TextInput
                  style={styles.inputModal}
                  value={resetToken}
                  onChangeText={setResetToken}
                  placeholder="Token"
                  placeholderTextColor="#aaa"
                  autoCorrect={false} // Désactive la correction automatique
                  spellCheck={false} // Désactive la vérification orthographique
                />
                <TextInput
                  style={styles.inputModal}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor="#aaa"
                  autoCorrect={false} // Désactive la correction automatique
                  spellCheck={false} // Désactive la vérification orthographique
                  secureTextEntry
                />
                <TouchableOpacity
                  style={[
                    styles.modalButtonSubmit,
                    (!forgotPasswordEmail || !resetToken || !newPassword) && {
                      backgroundColor: "#ccc",
                    }, // Désactivé si les champs sont vides
                  ]}
                  onPress={handleResetPassword}
                  disabled={
                    !forgotPasswordEmail ||
                    !resetToken ||
                    !newPassword ||
                    isLoading
                  } // Désactivé si les champs sont vides ou en cours de traitement
                >
                  <Text style={styles.modalButtonTextSubmit}>
                    {isLoading ? "En cours..." : "Réinitialiser"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelStep2}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseButtonText}>Annuler</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
  },

  // Arrière-plan
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },

  blurContainer: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Plus translucide avec 5 % d'opacité
    borderRadius: 50,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden", // Empêche les débordements et applique le radius
  },

  // Titre principal
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#535353",
    marginBottom: 10,
    textAlign: "center",
  },

  // Sous-titre
  subtitle: {
    fontSize: 18,
    color: "#535353",
    marginBottom: 20,
    textAlign: "center",
  },

  // Champs de saisie
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Blanc semi-transparent
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#333",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  inputContainer: {
    flexDirection: "row", // Aligne le champ et l'icône côte à côte
    alignItems: "center",
    borderRadius: 5,
    marginVertical: 10,
  },
  icon: {
    position: "absolute",
    right: 20,
    bottom: -5,
  },

  inputPassword: {
    flex: 1,
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Blanc semi-transparent
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#333",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  inputModal: {
    width: "100%",
    height: 50,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#333",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },

  // Bouton "Se connecter"
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#535353", // Bleu moderne
    shadowColor: "#535353",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Texte "Pas de compte"
  registerText: {
    marginTop: 15,
    fontSize: 16,
    color: "#535353",
  },

  // Bouton "S'inscrire"
  registerButton: {
    marginTop: 10,
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#535353",
  },
  passwordText: {
    color: "#535353",
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    marginBottom: 10,
  },

  buttonClicked: {
    backgroundColor: "#CBCBCB", // Vert agréable pour indiquer que le bouton a été cliqué
  },

  registerButtonText: {
    color: "#535353",
    fontSize: 18,
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
    borderRadius: 50,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#535353",
  },
  modalText: {
    color: "#535353",
    marginBottom: 20,
  },
  modalButton: {
    padding: 15,
    backgroundColor: "#535353",
    borderRadius: 30,
    marginTop: 10,
    width: "100%",
  },
  modalButtonSubmit: {
    padding: 15,
    borderRadius: 30,
    marginTop: 10,
    width: "100%",
    backgroundColor: "#4CAF50",
  },
  modalButtonDisabled: {
    backgroundColor: "#ccc", // Couleur grise pour indiquer que le bouton est désactivé
  },
  modalButtonText: {
    color: "#fff", // Texte blanc
    fontWeight: "bold",
    fontSize: 16,
  },
  modalButtonTextSubmit: {
    color: "#fff",
    textAlign: "center",
  },
  modalCloseButton: {
    padding: 15,
    marginTop: 10,
    backgroundColor: "#CA483F",
    borderRadius: 30,
    width: "100%",
  },
  modalCloseButtonText: {
    color: "#fff",
    textAlign: "center",
  },
});
