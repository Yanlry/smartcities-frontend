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
  const [step, setStep] = useState(1);  
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);  

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
        Alert.alert("Succès", data.message); 
        setStep(2);  
      } else if (response.status === 404) {
        const data = await response.json();
        Alert.alert(
          "Vérifié le champs de saisie",
          data.message || "Adresse email introuvable."
        );  
      } else {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);  
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    } finally {
      setIsLoading(false);  
    }
  };
  
  const handleResetPassword = async () => {
    setIsLoading(true); 
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
        setIsModalVisible(false);  
        setStep(1);  
      } else {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    } finally {
      setIsLoading(false);  
    }
  };

  const handleCancelStep2 = async () => {
    Alert.alert(
      "Confirmation",
      "Le processus de réinitialisation va être abandonné, et le token ne sera plus valide. Êtes-vous sûr ?",
      [
        {
          text: "Non",
          style: "cancel",  
        },
        {
          text: "Oui",
          onPress: async () => {
            try { 
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
 
            setIsModalVisible(false);
            setStep(1);  
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
            autoCorrect={false}  
            spellCheck={false} 
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputPassword}
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Mot de passe"
              placeholderTextColor="#aaa"
              secureTextEntry={!isPasswordVisible}  
              autoCorrect={false}  
              spellCheck={false} 
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}  
            >
              <Icon
                name={isPasswordVisible ? "visibility-off" : "visibility"} 
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
                  autoCorrect={false}  
                  spellCheck={false} 
                />
                <TouchableOpacity
                  style={[
                    styles.modalButtonSubmit,
                    !forgotPasswordEmail && { backgroundColor: "#ccc" },  
                  ]}
                  onPress={handleForgotPassword}
                  disabled={!forgotPasswordEmail} 
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
                  autoCorrect={false} 
                  spellCheck={false} 
                />
                <TextInput
                  style={styles.inputModal}
                  value={resetToken}
                  onChangeText={setResetToken}
                  placeholder="Token"
                  placeholderTextColor="#aaa"
                  autoCorrect={false} 
                  spellCheck={false} 
                />
                <TextInput
                  style={styles.inputModal}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor="#aaa"
                  autoCorrect={false} 
                  spellCheck={false} 
                  secureTextEntry
                />
                <TouchableOpacity
                  style={[
                    styles.modalButtonSubmit,
                    (!forgotPasswordEmail || !resetToken || !newPassword) && {
                      backgroundColor: "#ccc",
                    }, 
                  ]}
                  onPress={handleResetPassword}
                  disabled={
                    !forgotPasswordEmail ||
                    !resetToken ||
                    !newPassword ||
                    isLoading
                  }   
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
  container: {
    flex: 1,
  },
 
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",  
    borderRadius: 50,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden",  
  },
 
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#093A3E",
    marginBottom: 10,
    textAlign: "center",
  },
 
  subtitle: {
    fontSize: 18,
    color: "#093A3E",
    marginBottom: 20,
    textAlign: "center",
  },
 
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.8)",  
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "#333",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  inputContainer: {
    flexDirection: "row",  
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",  
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
 
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#093A3E",  
    shadowColor: "#093A3E",
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
 
  registerText: {
    marginTop: 15,
    fontSize: 16,
    color: "#093A3E",
  },
 
  registerButton: {
    marginTop: 10,
    width: "100%",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#093A3E",
  },
  passwordText: {
    color: "#093A3E",
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    marginBottom: 10,
  },

  buttonClicked: {
    backgroundColor: "#CBCBCB",  
  },

  registerButtonText: {
    color: "#093A3E",
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
    color: "#093A3E",
  },
  modalText: {
    color: "#093A3E",
    marginBottom: 20,
  },
  modalButton: {
    padding: 15,
    backgroundColor: "#093A3E",
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
    backgroundColor: "#ccc",  
  },
  modalButtonText: {
    color: "#fff",  
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
