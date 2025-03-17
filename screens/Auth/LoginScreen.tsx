// Chemin : screens/auth/LoginScreen.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  Modal,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Easing,
} from "react-native";
import { useAuth } from "../../hooks/auth/useAuth";
import { BlurView } from "expo-blur";
// @ts-ignore
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

// Types pour améliorer la sécurité du code
interface LoginScreenProps {
  navigation: any;
  onLogin: () => void;
}

interface ForgotPasswordState {
  email: string;
  token: string;
  newPassword: string;
  step: number;
}

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation, onLogin }: LoginScreenProps) {
  // Hooks d'authentification
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoginClicked,
    handleLogin,
  } = useAuth();

  // États locaux
  const [isRegisterClicked, setIsRegisterClicked] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [forgotPasswordState, setForgotPasswordState] = useState<ForgotPasswordState>({
    email: "",
    token: "",
    newPassword: "",
    step: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // États de validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Référence aux inputs pour focus
  const passwordInputRef = useRef<TextInput>(null);
  
  // Animation d'entrée
  useEffect(() => {
    // Séquence d'animations parallèles
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1)),
      }),
    ]).start();
    
    // Listeners de clavier
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Validation des champs
  const validateEmail = useCallback((text: string) => {
    if (!text || text.trim() === '') {
      setEmailError("Veuillez saisir votre adresse email");
      return false;
    }
    setEmailError(null);
    return true;
  }, []);
  
  const validatePassword = useCallback((text: string) => {
    if (!text || text.trim() === '') {
      setPasswordError("Veuillez saisir votre mot de passe");
      return false;
    }
    setPasswordError(null);
    return true;
  }, []);

  // Animation de secousse pour erreur
  const shakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  // Handlers
  const handleLoginClick = useCallback(() => {
    // Valider les deux champs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      shakeAnimation();
      return;
    }
    
    // Animation de pression du bouton
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => handleLogin(onLogin));
  }, [email, password, handleLogin, onLogin, scaleAnim, shakeAnimation, validateEmail, validatePassword]);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
    if (emailError) validateEmail(text);
  }, [emailError, setEmail, validateEmail]);
  
  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    if (passwordError) validatePassword(text);
  }, [passwordError, setPassword, validatePassword]);

  const handleRegisterNavigation = useCallback(() => {
    setIsRegisterClicked(true);
    
    // Animation de sortie
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("Register");
      setTimeout(() => {
        setIsRegisterClicked(false);
        // Reset animations for when we come back
        fadeAnim.setValue(0);
        slideAnim.setValue(50);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      }, 500);
    });
  }, [fadeAnim, slideAnim, navigation]);

  const updateForgotPasswordState = useCallback((field: keyof ForgotPasswordState, value: string | number) => {
    setForgotPasswordState(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleForgotPassword = useCallback(async () => {
    if (!forgotPasswordState.email) {
      return Alert.alert("Erreur", "Veuillez entrer votre adresse email");
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotPasswordState.email.trim().toLowerCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Succès", data.message);
        updateForgotPasswordState("step", 2);
      } else if (response.status === 404) {
        const data = await response.json();
        Alert.alert(
          "Vérifiez le champ de saisie",
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
  }, [forgotPasswordState.email, updateForgotPasswordState]);
  
  const handleResetPassword = useCallback(async () => {
    const { email, token, newPassword } = forgotPasswordState;
    
    if (!email || !token || !newPassword) {
      return Alert.alert("Erreur", "Veuillez remplir tous les champs");
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          resetToken: token,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Votre mot de passe a été réinitialisé.");
        setIsModalVisible(false);
        updateForgotPasswordState("step", 1);
        setForgotPasswordState({
          email: "",
          token: "",
          newPassword: "",
          step: 1,
        });
      } else {
        const data = await response.json();
        Alert.alert("Erreur", data.message || "Une erreur s'est produite.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de se connecter au serveur.");
    } finally {
      setIsLoading(false);
    }
  }, [forgotPasswordState, updateForgotPasswordState]);

  const handleCancelStep2 = useCallback(() => {
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
                `${API_URL}/auth/invalidate-token`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ resetToken: forgotPasswordState.token }),
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
            setForgotPasswordState({
              email: "",
              token: "",
              newPassword: "",
              step: 1,
            });
          },
        },
      ]
    );
  }, [forgotPasswordState.token]);

  // Function pour le focus progressif entre les champs
  const focusNextInput = useCallback(() => {
    if (email && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [email]);

  // Élément pour la modale de réinitialisation de mot de passe
  const renderModalContent = () => {
    const { step, email, token, newPassword } = forgotPasswordState;
    
    if (step === 1) {
      return (
        <>
          <LinearGradient
            colors={['#24385b', '#3a5e8c']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Réinitialisation de mot de passe</Text>
            <Text style={styles.modalSubtitle}>Étape 1 : Vérification d'identité</Text>
          </LinearGradient>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              Entrez votre email pour recevoir un token de réinitialisation.
            </Text>
            
            <View style={styles.inputModalWrapper}>
              <Icon name="email" size={22} color="#5b7ea0" style={styles.inputIcon} />
              <TextInput
                style={styles.inputModal}
                value={email}
                onChangeText={(text) => updateForgotPasswordState("email", text)}
                placeholder="Adresse Email"
                placeholderTextColor="#90a4ae"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButtonSubmit,
                  !email && styles.modalButtonDisabled,
                ]}
                onPress={handleForgotPassword}
                disabled={!email || isLoading}
              >
                <LinearGradient
                  colors={['#2c6e49', '#4c956c']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[styles.gradientButton, !email && styles.gradientButtonDisabled]}
                >
                  <Text style={styles.modalButtonTextSubmit}>
                    {isLoading ? "Envoi en cours..." : "Envoyer le token"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <LinearGradient
                  colors={['#c9184a', '#ff4d6d']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.modalCloseButtonText}>Annuler</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    } else {
      return (
        <>
          <LinearGradient
            colors={['#24385b', '#3a5e8c']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>Réinitialisation de mot de passe</Text>
            <Text style={styles.modalSubtitle}>Étape 2 : Nouveau mot de passe</Text>
          </LinearGradient>
          
          <View style={styles.modalBody}>
            <Text style={styles.modalText}>
              Entrez le token reçu par email et choisissez un nouveau mot de passe.
            </Text>
            
            <View style={styles.inputModalWrapper}>
              <Icon name="email" size={22} color="#5b7ea0" style={styles.inputIcon} />
              <TextInput
                style={styles.inputModal}
                value={email}
                onChangeText={(text) => updateForgotPasswordState("email", text)}
                placeholder="Adresse Email"
                placeholderTextColor="#90a4ae"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            
            <View style={styles.inputModalWrapper}>
              <Icon name="vpn-key" size={22} color="#5b7ea0" style={styles.inputIcon} />
              <TextInput
                style={styles.inputModal}
                value={token}
                onChangeText={(text) => updateForgotPasswordState("token", text)}
                placeholder="Token de réinitialisation"
                placeholderTextColor="#90a4ae"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            
            <View style={styles.inputModalWrapper}>
              <Icon name="lock" size={22} color="#5b7ea0" style={styles.inputIcon} />
              <TextInput
                style={styles.inputModal}
                value={newPassword}
                onChangeText={(text) => updateForgotPasswordState("newPassword", text)}
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#90a4ae"
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButtonSubmit,
                  (!email || !token || !newPassword) && styles.modalButtonDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={!email || !token || !newPassword || isLoading}
              >
                <LinearGradient
                  colors={['#2c6e49', '#4c956c']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={[
                    styles.gradientButton,
                    (!email || !token || !newPassword) && styles.gradientButtonDisabled,
                  ]}
                >
                  <Text style={styles.modalButtonTextSubmit}>
                    {isLoading ? "Réinitialisation..." : "Définir le nouveau mot de passe"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleCancelStep2}
                style={styles.modalCloseButton}
              >
                <LinearGradient
                  colors={['#c9184a', '#ff4d6d']}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.modalCloseButtonText}>Annuler</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ImageBackground
        source={require("../../assets/images/2.jpg")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
          style={styles.overlay}
        />

        {/* Logo et titre animés */}
        <Animated.View
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#062C41', '#1d3e53']}
              style={styles.logoBackground}
            >
              <Icon name="location-city" size={40} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>Smartcities</Text>
          <Text style={styles.appTagline}>Connectez-vous avec votre ville</Text>
        </Animated.View>

        {/* Section principale avec animation */}
        <Animated.View
          style={[
            styles.mainContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
                { translateX: shakeAnim }
              ],
            },
          ]}
        >
          <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              start={[0, 0]}
              end={[1, 1]}
              style={styles.gradientOverlay}
            />
            
            <Text style={styles.welcomeTitle}>Bienvenue</Text>
            <Text style={styles.welcomeSubtitle}>Accédez à votre espace connecté</Text>

            <View style={styles.inputGroup}>
              <View style={[
                styles.inputContainer,
                emailError && styles.inputContainerError
              ]}>
                <Icon 
                  name="person" 
                  size={22} 
                  color={emailError ? "#e11d48" : "#fff"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Adresse Email"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="next"
                  onSubmitEditing={focusNextInput}
                  blurOnSubmit={false}
                  onBlur={() => validateEmail(email)}
                />
              </View>
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <View style={[
                styles.inputContainer,
                passwordError && styles.inputContainerError
              ]}>
                <Icon 
                  name="lock" 
                  size={22} 
                  color={passwordError ? "#e11d48" : "#fff"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  value={password}
                  onChangeText={handlePasswordChange}
                  placeholder="Mot de passe"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLoginClick}
                  onBlur={() => validatePassword(password)}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.visibilityIcon}
                >
                  <Icon
                    name={isPasswordVisible ? "visibility-off" : "visibility"}
                    size={22}
                    color={passwordError ? "#e11d48" : "#fff"}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.loginButtonContainer,
                isLoginClicked && styles.buttonClicked,
              ]}
              onPress={handleLoginClick}
            >
              <LinearGradient
                colors={['#1a759f', '#168aad', '#34a0a4']}
                start={[0, 0]}
                end={[1, 0]}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>CONNEXION</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OU</Text>
              <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                activeOpacity={0.8}
              >
                <Icon name="mail" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.socialButton, styles.socialButtonTwitter]}
                activeOpacity={0.8}
              >
                <Icon name="alternate-email" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.socialButton, styles.socialButtonFacebook]}
                activeOpacity={0.8}
              >
                <Icon name="facebook" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleRegisterNavigation}
              style={styles.registerButton}
              activeOpacity={0.8}
            >
              <Text style={styles.registerText}>
                Nouveau sur Smartcities ?{" "}
                <Text style={styles.registerTextBold}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>

        {/* Modal avec animation */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: isModalVisible ? 1 : 0.9 }],
                },
              ]}
            >
              {renderModalContent()}
            </Animated.View>
          </View>
        </Modal>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#062C41',
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    opacity: 0.7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appTagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mainContainer: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 24,
    padding: 30,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputContainerError: {
    borderColor: "#e11d48",
    backgroundColor: "rgba(225, 29, 72, 0.1)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#e11d48",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    marginLeft: 12,
  },
  visibilityIcon: {
    padding: 8,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  loginButtonContainer: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#1a759f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  loginButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  buttonClicked: {
    opacity: 0.9,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  separatorText: {
    color: "rgba(255, 255, 255, 0.7)",
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ea4335",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  socialButtonTwitter: {
    backgroundColor: "#1da1f2",
  },
  socialButtonFacebook: {
    backgroundColor: "#1877f2",
  },
  registerButton: {
    marginTop: 10,
  },
  registerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textAlign: "center",
  },
  registerTextBold: {
    fontWeight: "bold",
    color: "#fff",
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  modalBody: {
    padding: 20,
    backgroundColor: "#fff",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
  },
  inputModalWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  inputModal: {
    flex: 1,
    height: 56,
    color: "#333",
    fontSize: 16,
  },
  modalButtonsContainer: {
    marginTop: 10,
  },
  modalButtonSubmit: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    height: 56,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonTextSubmit: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCloseButton: {
    borderRadius: 12,
    overflow: "hidden",
    height: 56,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});