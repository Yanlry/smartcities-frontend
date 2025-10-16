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
  Pressable,
  Image,
} from "react-native";
import { useAuth } from "../../hooks/auth/useAuth";
import { BlurView } from "expo-blur";
// @ts-ignore
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../../styles/screens/LoginScreen.styles";

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

// Configuration des mesures et constantes
const { width, height } = Dimensions.get("window");
const BORDER_RADIUS = 24;
const NEON_PRIMARY = '#FF3A8D';
const NEON_SECONDARY = '#00DFFF';
const NEON_TERTIARY = '#00FFB3';
const ACCENT_COLOR = '#1a759f';

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
  
  // États pour le clavier
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  // États de validation
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Animations améliorées
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const formSlideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Animation pour le bouton de fermeture du clavier
  const keyboardButtonAnim = useRef(new Animated.Value(0)).current;
  
  // Animation de fond
  const bgCircleScale1 = useRef(new Animated.Value(1)).current;
  const bgCircleScale2 = useRef(new Animated.Value(1)).current;
  const bgCircleOpacity1 = useRef(new Animated.Value(0.5)).current;
  const bgCircleOpacity2 = useRef(new Animated.Value(0.3)).current;
  
  // Référence aux inputs pour focus
  const passwordInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  
  // FONCTION AMÉLIORÉE : Fermer le clavier avec plusieurs méthodes
  const dismissKeyboard = useCallback(() => {
    // Méthode 1: Keyboard.dismiss()
    Keyboard.dismiss();
    
    // Méthode 2: Forcer le blur sur tous les inputs actifs
    if (emailInputRef.current) {
      emailInputRef.current.blur();
    }
    if (passwordInputRef.current) {
      passwordInputRef.current.blur();
    }
  }, []);

  // NOUVEAU : Gestionnaire d'événements pour fermer le clavier sur tap
  const handleScreenPress = useCallback(() => {
    if (keyboardVisible) {
      dismissKeyboard();
    }
  }, [keyboardVisible, dismissKeyboard]);
  
  // Animation des cercles de fond
  useEffect(() => {
    const animateBackground = () => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(bgCircleScale1, {
              toValue: 1.2,
              duration: 8000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(bgCircleOpacity1, {
              toValue: 0.4,
              duration: 8000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(bgCircleScale2, {
              toValue: 0.9,
              duration: 10000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(bgCircleOpacity2, {
              toValue: 0.6,
              duration: 10000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
          Animated.parallel([
            Animated.timing(bgCircleScale1, {
              toValue: 1,
              duration: 8000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(bgCircleOpacity1, {
              toValue: 0.7,
              duration: 8000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(bgCircleScale2, {
              toValue: 1,
              duration: 10000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
            Animated.timing(bgCircleOpacity2, {
              toValue: 0.5,
              duration: 10000,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.sin),
            }),
          ]),
        ])
      ).start();
    };

    animateBackground();
  }, []);
  
  // Animation d'entrée avec séquence améliorée
  useEffect(() => {
    const startupAnimation = () => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.elastic(1)),
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.out(Easing.back(1.5)),
          }),
          Animated.timing(formSlideAnim, {
            toValue: 0,
            duration: 800,
            delay: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            delay: 300,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.cubic),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            delay: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.elastic(1)),
          }),
        ]),
      ]).start();
    };
    
    startupAnimation();
    
    // Listeners de clavier améliorés pour gérer la hauteur du clavier
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
        // Animation d'apparition du bouton
        Animated.spring(keyboardButtonAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
        // Animation de disparition du bouton
        Animated.timing(keyboardButtonAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(text)) {
      setEmailError("Format d'email invalide");
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

  // Animation de secousse améliorée
  const shakeAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 15,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
      }),
      Animated.timing(shakeAnim, {
        toValue: -15,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
      }),
      Animated.timing(shakeAnim, {
        toValue: 5,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
      }),
      Animated.timing(shakeAnim, {
        toValue: -5,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
        easing: Easing.cubic,
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

  // Animation de transition améliorée
  const handleRegisterNavigation = useCallback(() => {
    setIsRegisterClicked(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.timing(formSlideAnim, {
        toValue: 50,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.cubic),
      }),
    ]).start(() => {
      navigation.navigate("Register");
      setTimeout(() => {
        setIsRegisterClicked(false);
        // Reset animations
        fadeAnim.setValue(0);
        slideAnim.setValue(-100);
        formSlideAnim.setValue(50);
        opacityAnim.setValue(0);
        rotateAnim.setValue(0);
        scaleAnim.setValue(0.9);
        
        // Ré-animer l'entrée
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic),
          }),
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
              easing: Easing.out(Easing.elastic(1)),
            }),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
              easing: Easing.out(Easing.back(1.5)),
            }),
            Animated.timing(formSlideAnim, {
              toValue: 0,
              duration: 800,
              delay: 200,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 1000,
              delay: 300,
              useNativeDriver: true,
              easing: Easing.inOut(Easing.cubic),
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1000,
              delay: 300,
              useNativeDriver: true,
              easing: Easing.out(Easing.elastic(1)),
            }),
          ]),
        ]).start();
      }, 100);
    });
  }, [fadeAnim, formSlideAnim, navigation, opacityAnim, rotateAnim, scaleAnim, slideAnim]);

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

  // Fonction pour le focus progressif entre les champs
  const focusNextInput = useCallback(() => {
    if (email && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [email]);

  // Conversion des valeurs animées pour les rotations
  const rotateDegrees = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
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
      
      {/* SOLUTION : Utilisation de Pressable qui fonctionne mieux avec les navigations */}
      <Pressable style={styles.container} onPress={handleScreenPress}>
        <ImageBackground
          source={require("../../assets/images/2.jpg")}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          {/* Overlay amélioré avec animation */}
          <View style={styles.overlay}>
            <View style={styles.backgroundEffects}>
              {/* Premier cercle animé */}
              <Animated.View style={[
                styles.bgCircle1,
                {
                  transform: [{ scale: bgCircleScale1 }],
                  opacity: bgCircleOpacity1
                }
              ]}>
                <LinearGradient
                  colors={[NEON_PRIMARY, 'transparent']}
                  style={styles.bgGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>
              
              {/* Deuxième cercle animé */}
              <Animated.View style={[
                styles.bgCircle2,
                {
                  transform: [{ scale: bgCircleScale2 }],
                  opacity: bgCircleOpacity2
                }
              ]}>
                <LinearGradient
                  colors={[NEON_SECONDARY, 'transparent']}
                  style={styles.bgGradient}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </Animated.View>
            </View>
          </View>

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
          <Image
                source={require("../../assets/images/logo.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
          </Animated.View>

          {/* Section principale avec animation */}
          <Animated.View
            style={[
              styles.mainContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: formSlideAnim },
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
              
              <Text style={styles.welcomeTitle}>SMARTCITIES</Text>
              <Text style={styles.welcomeSubtitle}>Entrer dans le coeur de votre ville</Text>

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
                    ref={emailInputRef}
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
            {/* SOLUTION : Même approche dans la modal */}
            <Pressable style={styles.modalOverlay} onPress={dismissKeyboard}>
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
            </Pressable>
          </Modal>
        </ImageBackground>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
