// Chemin : screens/Auth/RegisterScreen.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../hooks/auth/useAuth";
import PhotoManager from "../../components/interactions/PhotoManager";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';
import franceCitiesRaw from "../../assets/france.json";
import { checkUsernameAvailability, checkEmailAvailability } from "../../services/authService";
import styles from "../../styles/screens/RegisterScreen.styles";

const franceCities: City[] = franceCitiesRaw as City[];

const MIN_LENGTH = 3;
const PASSWORD_MIN_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface City {
  Code_commune_INSEE: number;
  Nom_commune: string;
  Code_postal: number;
  Libelle_acheminement: string;
  Ligne_5: string;
  coordonnees_gps: string;
}

export default function RegisterScreen({ navigation, onLogin }: any) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    username,
    setUsername,
    lastName,
    setLastName,
    firstName,
    setFirstName,
    isRegisterClicked,
    handleRegister,
    photos,
    setPhotos,
    isLoading,
  } = useAuth();

  const [accountType, setAccountType] = useState<"citizen" | "municipality">("citizen");
  
  // ✅ SUPPRIMÉ : municipalityPhone et municipalityAddress
  const [municipalityCity, setMunicipalityCity] = useState("");
  const [municipalitySIREN, setMunicipalitySIREN] = useState("");

  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const [passwordHasMinLength, setPasswordHasMinLength] = useState(false);
  const [passwordHasUppercase, setPasswordHasUppercase] = useState(false);
  const [passwordHasNumber, setPasswordHasNumber] = useState(false);
  const [passwordHasSpecialChar, setPasswordHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

  const usernameTimeoutRef = useRef<number | null>(null);
  const emailTimeoutRef = useRef<number | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState({
    nom_commune: "",
    code_postal: "",
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formValid, setFormValid] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const inputRefs = useRef<Array<TextInput | null>>(Array(50).fill(null));
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const searchBounceAnim = useRef(new Animated.Value(1)).current;
  const checkingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📍 ÉTAPE ${currentStep} | Type: ${accountType}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }, [currentStep, accountType]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4)),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.elastic(1)),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isCheckingUsername || isCheckingEmail) {
      Animated.loop(
        Animated.timing(checkingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    } else {
      checkingAnim.stopAnimation();
      checkingAnim.setValue(0);
    }
  }, [isCheckingUsername, isCheckingEmail]);

  const checkUsernameAvailabilityHandler = useCallback(async (usernameToCheck: string): Promise<boolean> => {
    try {
      setIsCheckingUsername(true);
      const isAvailable = await checkUsernameAvailability(usernameToCheck);
      setUsernameAvailable(isAvailable);
      
      if (!isAvailable) {
        setUsernameError("Ce nom d'utilisateur est déjà pris");
      } else {
        setUsernameError(null);
      }
      
      return isAvailable;
    } catch (error) {
      setUsernameError("Erreur lors de la vérification. Veuillez réessayer.");
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  const checkEmailAvailabilityHandler = useCallback(async (emailToCheck: string): Promise<boolean> => {
    try {
      setIsCheckingEmail(true);
      const isAvailable = await checkEmailAvailability(emailToCheck);
      setEmailAvailable(isAvailable);
      
      if (!isAvailable) {
        setEmailError("Cette adresse email est déjà utilisée");
      } else {
        setEmailError(null);
      }
      
      return isAvailable;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'email:', error);
      setEmailError("Erreur lors de la vérification. Veuillez réessayer.");
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  }, []);

  const togglePasswordVisibility = () => {
    console.log("👁️ Toggle visibility mot de passe");
    setIsPasswordVisible(!isPasswordVisible);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleConfirmPasswordVisibility = () => {
    console.log("👁️ Toggle visibility confirmation mot de passe");
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const validatePasswordRules = (passwordValue: string, confirmValue: string) => {
    const hasMinLength = passwordValue.length >= PASSWORD_MIN_LENGTH;
    setPasswordHasMinLength(hasMinLength);

    const hasUppercase = /[A-Z]/.test(passwordValue);
    setPasswordHasUppercase(hasUppercase);

    const hasNumber = /\d/.test(passwordValue);
    setPasswordHasNumber(hasNumber);

    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordValue);
    setPasswordHasSpecialChar(hasSpecialChar);

    const doPasswordsMatch = passwordValue.length > 0 && passwordValue === confirmValue;
    setPasswordsMatch(doPasswordsMatch);

    return hasMinLength && hasUppercase && hasNumber && hasSpecialChar && doPasswordsMatch;
  };

  useEffect(() => {
    if (accountType === "municipality") {
      setUsernameAvailable(null);
      setUsernameError(null);
      return;
    }

    if (usernameTimeoutRef.current) {
      clearTimeout(usernameTimeoutRef.current);
    }

    setUsernameAvailable(null);

    if (username.length >= MIN_LENGTH) {
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailabilityHandler(username);
      }, 800);
    } else if (username.length > 0) {
      setUsernameError(`Le nom d'utilisateur doit comporter au moins ${MIN_LENGTH} caractères`);
    } else {
      setUsernameError(null);
    }

    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, [username, accountType, checkUsernameAvailabilityHandler]);

  useEffect(() => {
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }

    setEmailAvailable(null);

    if (EMAIL_REGEX.test(email)) {
      emailTimeoutRef.current = setTimeout(() => {
        checkEmailAvailabilityHandler(email);
      }, 800);
    } else if (email.length > 0) {
      setEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setEmailError(null);
    }

    return () => {
      if (emailTimeoutRef.current) {
        clearTimeout(emailTimeoutRef.current);
      }
    };
  }, [email, checkEmailAvailabilityHandler]);

  useEffect(() => {
    validatePasswordRules(password, confirmPassword);
  }, [password, confirmPassword]);

  const validateFirstName = (value: string): boolean => {
    const isValid = value.length >= MIN_LENGTH;
    if (!isValid && value.length > 0) {
      setFirstNameError(`Le prénom doit comporter au moins ${MIN_LENGTH} caractères`);
    } else {
      setFirstNameError(null);
    }
    return isValid || value.length === 0;
  };

  const validateLastName = (value: string): boolean => {
    const isValid = value.length >= MIN_LENGTH;
    if (!isValid && value.length > 0) {
      setLastNameError(`Le nom doit comporter au moins ${MIN_LENGTH} caractères`);
    } else {
      setLastNameError(null);
    }
    return isValid || value.length === 0;
  };

  const handleFirstNameChange = (value: string) => {
    const capitalizedValue = capitalizeFirstLetter(value);
    setFirstName(capitalizedValue);
    validateFirstName(capitalizedValue);
  };

  const handleLastNameChange = (value: string) => {
    const capitalizedValue = capitalizeFirstLetter(value);
    setLastName(capitalizedValue);
    validateLastName(capitalizedValue);
  };

  const handleUsernameChange = (value: string) => {
    console.log("✏️ Username changé:", value);
    setUsername(value);
  };

  const handleEmailChange = (value: string) => {
    console.log("✏️ Email changé:", value);
    setEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 MOT DE PASSE CHANGÉ");
    console.log("Nouvelle valeur:", value);
    console.log("Longueur:", value.length);
    console.log("Type:", typeof value);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    setPassword(value);
  };

  const handleConfirmPasswordChange = (value: string) => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔐 CONFIRMATION MOT DE PASSE CHANGÉE");
    console.log("Nouvelle valeur:", value);
    console.log("Longueur:", value.length);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    setConfirmPassword(value);
  };

  // 🔄 VALIDATION ADAPTÉE AU NOUVEAU FLUX (SIMPLIFIÉ)
  useEffect(() => {
    if (currentStep === 0) {
      setFormValid(true);
    } else if (currentStep === 1) {
      if (accountType === "citizen") {
        // CITOYEN : firstName, lastName, username
        const step1Valid = 
          !!firstName && !!lastName && !!username && 
          firstNameError === null && lastNameError === null && usernameError === null &&
          firstName.length >= MIN_LENGTH && lastName.length >= MIN_LENGTH && username.length >= MIN_LENGTH &&
          usernameAvailable === true;
        setFormValid(step1Valid);
      } else {
        // MAIRIE : sélection de la ville uniquement
        const step1Valid = !!selectedLocation && !!municipalityCity;
        setFormValid(step1Valid);
      }
    } else if (currentStep === 2) {
      if (accountType === "citizen") {
        // CITOYEN : email + password
        const step2Valid = 
          !!email && !!password && !!confirmPassword &&
          emailError === null &&
          EMAIL_REGEX.test(email) &&
          emailAvailable === true &&
          passwordHasMinLength &&
          passwordHasUppercase &&
          passwordHasNumber &&
          passwordHasSpecialChar &&
          passwordsMatch;
        setFormValid(step2Valid);
      } else {
        // ✅ MAIRIE : SIREN + email officiel (SIMPLIFIÉ)
        const step2Valid = 
          !!municipalitySIREN && !!email &&
          municipalitySIREN.length === 9 &&
          EMAIL_REGEX.test(email) &&
          emailAvailable === true &&
          emailError === null;
        setFormValid(step2Valid);
      }
    } else if (currentStep === 3) {
      if (accountType === "citizen") {
        // CITOYEN : photo + localisation
        setFormValid(!!selectedLocation && !!photos?.length);
      } else {
        // ✅ MAIRIE : mot de passe uniquement
        const step3Valid = 
          !!password && !!confirmPassword &&
          passwordHasMinLength &&
          passwordHasUppercase &&
          passwordHasNumber &&
          passwordHasSpecialChar &&
          passwordsMatch;
        setFormValid(step3Valid);
      }
    }
  }, [
    firstName, lastName, username, email, password, confirmPassword,
    firstNameError, lastNameError, usernameError, emailError,
    currentStep, selectedLocation, photos, usernameAvailable, emailAvailable,
    passwordHasMinLength, passwordHasUppercase, passwordHasNumber, passwordHasSpecialChar, passwordsMatch,
    accountType, municipalityCity, municipalitySIREN
  ]);

  const handleRegisterClick = () => {
    if (accountType === "citizen") {
      if (!selectedLocation || !latitude || !longitude) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Emplacement manquant", "Veuillez sélectionner une ville avant de vous inscrire.");
        return;
      }

      if (!photos || photos.length === 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Photo manquante", "Veuillez ajouter une photo de profil pour continuer.");
        return;
      }
    } else {
      if (!selectedLocation || !latitude || !longitude) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Emplacement manquant", "Veuillez sélectionner la ville de votre mairie.");
        return;
      }
      // ✅ SUPPRIMÉ : vérification de l'adresse
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.elastic(1.5),
      }),
    ]).start();

    const cityData = {
      nom_commune: selectedCity.nom_commune,
      code_postal: selectedCity.code_postal,
      latitude,
      longitude,
    };

    // ✅ SIMPLIFIÉ : plus de phone et address
    const municipalityData = accountType === "municipality" ? {
      isMunicipality: true,
      municipalityCity,
      municipalitySIREN,
    } : { 
      isMunicipality: false 
    };

    if (accountType === "municipality") {
      const municipalityCallback = () => {
        console.log("🏛️ Inscription mairie réussie - Redirection vers Login");
        
        Alert.alert(
          "Inscription réussie ! 🎉",
          "Votre demande de compte mairie a été enregistrée.\n\nUn administrateur va vérifier et valider votre compte sous 24-48h.\n\nVous recevrez un email de confirmation une fois votre compte approuvé.",
          [
            {
              text: "Compris",
              onPress: () => {
                Animated.parallel([
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                  Animated.timing(translateY, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: true,
                  }),
                ]).start(() => {
                  navigation.navigate("Login");
                });
              }
            }
          ]
        );
      };

      handleRegister(municipalityCallback, { ...cityData, ...municipalityData });
      
    } else {
      handleRegister(onLogin, { ...cityData, ...municipalityData });
    }
  };

  const focusNextInput = (index: number, step: number) => {
    console.log(`⏭️ focusNextInput appelé: index=${index}, step=${step}`);
    
    if (step === 1) {
      if (accountType === "citizen") {
        if (index < 2 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    } else if (step === 2) {
      if (accountType === "municipality") {
        if (index < 12 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      } else {
        if (index < 22 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    } else if (step === 3) {
      if (accountType === "municipality") {
        if (index < 22 && inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  const goToNextStep = async () => {
    if (!formValid && currentStep !== 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
      
      return;
    }

    if (currentStep === 1 && accountType === "citizen" && usernameAvailable === false) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Nom d'utilisateur indisponible", "Ce nom d'utilisateur est déjà pris. Veuillez en choisir un autre.");
      return;
    } else if ((currentStep === 2 && accountType === "citizen") || (currentStep === 2 && accountType === "municipality")) {
      if (emailAvailable === false) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Email indisponible", "Cette adresse email est déjà utilisée. Veuillez en utiliser une autre.");
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(prev => prev + 1);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  };

  const goToPreviousStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(prev => prev - 1);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  };

  const handleAddressSearch = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    Animated.sequence([
      Animated.timing(searchBounceAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(searchBounceAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(searchBounceAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const filteredCities = franceCities.filter((city) => {
      const cityName = (city.Ligne_5 || city.Nom_commune).toLowerCase().trim();
      const codePostal = city.Code_postal.toString().trim();

      return (
        cityName.includes(trimmedQuery.toLowerCase()) ||
        codePostal.startsWith(trimmedQuery)
      );
    }).slice(0, 20);

    if (filteredCities.length > 0) {
      setSuggestions(filteredCities);
      setModalVisible(true);
      
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setSuggestions([]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Aucun résultat",
        "Aucune ville ou code postal correspondant trouvé."
      );
    }
  };

  const handleSuggestionSelect = (item: any) => {
    const [lat, lng] = item.coordonnees_gps
      .split(",")
      .map((coord: string) => parseFloat(coord.trim()));

    setSelectedCity({
      nom_commune: item.Nom_commune,
      code_postal: item.Code_postal.toString(),
    });

    // Pour les mairies, on génère automatiquement le nom
    if (accountType === "municipality") {
      setMunicipalityCity(item.Nom_commune);
    }

    setLatitude(lat);
    setLongitude(lng);
    setSelectedLocation({ latitude: lat, longitude: lng });

    setQuery(`${item.Nom_commune} (${item.Code_postal})`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Animated.timing(modalScaleAnim, {
      toValue: 0.8,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setTimeout(() => modalScaleAnim.setValue(0.8), 200);
    });
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate("Login");
    });
  };

  const getProgressWidth = () => {
    switch (currentStep) {
      case 0:
        return "0%";
      case 1:
        return "33%";
      case 2:
        return "67%";
      case 3:
        return "100%";
      default:
        return "0%";
    }
  };

  const renderVerificationIndicator = (isChecking: boolean, isAvailable: boolean | null, fieldName: string) => {
    if (isChecking) {
      return (
        <Animated.View 
          style={[
            styles.verificationIndicator,
            {
              transform: [{
                rotate: checkingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }
          ]}
        >
          <ActivityIndicator size="small" color="#6366f1" />
        </Animated.View>
      );
    } else if (isAvailable === true) {
      return (
        <View style={styles.verificationIndicator}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
        </View>
      );
    } else if (isAvailable === false) {
      return (
        <View style={styles.verificationIndicator}>
          <Ionicons name="close-circle" size={20} color="#ef4444" />
        </View>
      );
    }
    return null;
  };

  const renderPasswordRule = (isValid: boolean, text: string) => (
    <View style={styles.passwordRuleContainer}>
      <Ionicons 
        name={isValid ? "checkmark-circle" : "close-circle"} 
        size={18} 
        color={isValid ? "#10b981" : "#ef4444"} 
      />
      <Text style={[
        styles.passwordRuleText,
        isValid && styles.passwordRuleTextValid
      ]}>
        {text}
      </Text>
    </View>
  );

  const renderStepZero = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: translateY },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Bienvenue !</Text>
      <Text style={styles.stepDescription}>
        Choisissez le type de compte que vous souhaitez créer
      </Text>

      <View style={styles.accountTypeContainer}>
        <TouchableOpacity
          style={[
            styles.accountTypeCard,
            accountType === "citizen" && styles.accountTypeCardSelected
          ]}
          onPress={() => {
            console.log("👤 Type de compte sélectionné: CITOYEN");
            setAccountType("citizen");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={accountType === "citizen" ? ['#6366f1', '#4f46e5'] : ['#f1f5f9', '#e2e8f0']}
            style={styles.accountTypeGradient}
          >
            <Ionicons 
              name="person" 
              size={48} 
              color={accountType === "citizen" ? "#fff" : "#64748b"} 
            />
            <Text style={[
              styles.accountTypeTitle,
              accountType === "citizen" && styles.accountTypeTitleSelected
            ]}>
              Citoyen
            </Text>
            <Text style={[
              styles.accountTypeDescription,
              accountType === "citizen" && styles.accountTypeDescriptionSelected
            ]}>
              Signaler des incidents et participer à la vie locale
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.accountTypeCard,
            accountType === "municipality" && styles.accountTypeCardSelected
          ]}
          onPress={() => {
            console.log("🏛️ Type de compte sélectionné: MAIRIE");
            setAccountType("municipality");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={accountType === "municipality" ? ['#6366f1', '#4f46e5'] : ['#f1f5f9', '#e2e8f0']}
            style={styles.accountTypeGradient}
          >
            <FontAwesome5 
              name="landmark" 
              size={42} 
              color={accountType === "municipality" ? "#fff" : "#64748b"} 
            />
            <Text style={[
              styles.accountTypeTitle,
              accountType === "municipality" && styles.accountTypeTitleSelected
            ]}>
              Mairie
            </Text>
            <Text style={[
              styles.accountTypeDescription,
              accountType === "municipality" && styles.accountTypeDescriptionSelected
            ]}>
              Gérer les signalements et communiquer avec les citoyens
            </Text>
            <View style={styles.validationBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10b981" />
              <Text style={styles.validationBadgeText}>Validation requise</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextButton}
        onPress={goToNextStep}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#6366f1', '#4f46e5', '#4338ca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <Text style={styles.nextButtonText}>Continuer</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.loginLink}>
        <Text style={styles.loginText}>Déjà membre ?</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ÉTAPE 1 : Inchangée
  const renderStepOne = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: translateY },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressIndicator, { width: getProgressWidth() }]} />
        </View>
        <Text style={styles.progressText}>Étape 1/3</Text>
      </View>

      <Text style={styles.stepTitle}>
        {accountType === "citizen" ? "Qui êtes-vous ?" : "Sélectionnez votre ville"}
      </Text>
      <Text style={styles.stepDescription}>
        {accountType === "citizen" 
          ? "Commençons par vos informations personnelles" 
          : "Recherchez et sélectionnez la ville de votre mairie"}
      </Text>

      <View style={styles.formContainer}>
        {accountType === "citizen" ? (
          <>
            <View>
              <View style={[
                styles.inputWrapper,
                lastNameError && { borderColor: 'rgba(239, 68, 68, 0.5)' }
              ]}>
                <Ionicons 
                  name="people-outline" 
                  size={22} 
                  color={lastNameError ? "#ef4444" : "#5e5ce6"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={lastName}
                  placeholder="Nom"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handleLastNameChange}
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="next"
                  editable={true}
                  ref={(el) => { inputRefs.current[1] = el; }}
                  onSubmitEditing={() => focusNextInput(1, 1)}
                />
              </View>
              {lastNameError && (
                <Text style={styles.errorText}>{lastNameError}</Text>
              )}
            </View>

            <View>
              <View style={[
                styles.inputWrapper,
                firstNameError && { borderColor: 'rgba(239, 68, 68, 0.5)' }
              ]}>
                <Ionicons 
                  name="person-outline" 
                  size={22} 
                  color={firstNameError ? "#ef4444" : "#5e5ce6"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={firstName}
                  placeholder="Prénom"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handleFirstNameChange}
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="next"
                  editable={true}
                  ref={(el) => { inputRefs.current[0] = el; }}
                  onSubmitEditing={() => focusNextInput(0, 1)}
                />
              </View>
              {firstNameError && (
                <Text style={styles.errorText}>{firstNameError}</Text>
              )}
            </View>

            <View>
              <View style={[
                styles.inputWrapper,
                usernameError && { borderColor: 'rgba(239, 68, 68, 0.5)' },
                usernameAvailable === true && { borderColor: 'rgba(16, 185, 129, 0.5)' }
              ]}>
                <Ionicons 
                  name="at" 
                  size={22} 
                  color={usernameError ? "#ef4444" : usernameAvailable === true ? "#10b981" : "#5e5ce6"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={username}
                  placeholder="Nom d'utilisateur"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handleUsernameChange}
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  editable={true}
                  ref={(el) => { inputRefs.current[2] = el; }}
                  onSubmitEditing={() => inputRefs.current[2]?.blur()}
                />
                {renderVerificationIndicator(isCheckingUsername, usernameAvailable, 'username')}
              </View>
              {usernameError && (
                <Text style={styles.errorText}>{usernameError}</Text>
              )}
              {usernameAvailable === true && !usernameError && (
                <Text style={styles.successText}>✓ Ce nom d'utilisateur est disponible</Text>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={22} color="#5e5ce6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Rechercher par ville ou code postal"
                  value={query}
                  placeholderTextColor="#94a3b8"
                  onChangeText={setQuery}
                  editable={true}
                />
              </View>
              
              <Animated.View style={[styles.searchButtonContainer, { transform: [{ scale: searchBounceAnim }] }]}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleAddressSearch}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    style={styles.searchButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.searchButtonText}>Rechercher</Text>
                    <Ionicons name="search" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {selectedLocation && municipalityCity && (
              <View style={styles.selectedLocationContainer}>
                <MaterialIcons name="location-on" size={22} color="#10b981" />
                <Text style={styles.selectedLocationText}>
                  {municipalityCity} ({selectedCity.code_postal})
                </Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#6366f1" />
              <Text style={styles.infoBoxText}>
                La dénomination officielle sera : "Mairie de {municipalityCity || ' ... '}"
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToPreviousStep}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.12)']}
            style={styles.buttonGradient}
          >
            <Text style={styles.backButtonText}>←</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButtonMain,
            (!formValid || (accountType === "citizen" && isCheckingUsername)) && styles.buttonDisabled,
          ]}
          onPress={goToNextStep}
          disabled={!formValid || (accountType === "citizen" && isCheckingUsername)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={(formValid && !(accountType === "citizen" && isCheckingUsername)) ? ['#6366f1', '#4f46e5', '#4338ca'] : ['#94a3b8', '#cbd5e1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {(accountType === "citizen" && isCheckingUsername) ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.nextButtonText}>Vérification...</Text>
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ✅ ÉTAPE 2 MODIFIÉE : Pour mairies = SIREN + Email officiel
  const renderStepTwo = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: translateY },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressIndicator, { width: getProgressWidth() }]} />
        </View>
        <Text style={styles.progressText}>Étape 2/3</Text>
      </View>

      <Text style={styles.stepTitle}>
        {accountType === "citizen" ? "Votre compte" : "Informations officielles"}
      </Text>
      <Text style={styles.stepDescription}>
        {accountType === "citizen" 
          ? "Configurez les informations de connexion à votre compte"
          : "Renseignez les informations administratives de votre mairie"}
      </Text>

      <View style={styles.formContainer}>
        {accountType === "citizen" ? (
          <>
            {/* CITOYEN : email + password (INCHANGÉ) */}
            <View>
              <View style={[
                styles.inputWrapper,
                emailError && { borderColor: 'rgba(239, 68, 68, 0.5)' },
                emailAvailable === true && { borderColor: 'rgba(16, 185, 129, 0.5)' }
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={22} 
                  color={emailError ? "#ef4444" : emailAvailable === true ? "#10b981" : "#5e5ce6"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  placeholder="Email"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="next"
                  editable={true}
                  ref={(el) => { inputRefs.current[20] = el; }}
                  onSubmitEditing={() => focusNextInput(20, 2)}
                />
                {renderVerificationIndicator(isCheckingEmail, emailAvailable, 'email')}
              </View>
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
              {emailAvailable === true && !emailError && (
                <Text style={styles.successText}>✓ Cette adresse email est disponible</Text>
              )}
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={22} 
                  color="#5e5ce6" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  placeholder="Mot de passe"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!isPasswordVisible}
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="next"
                  editable={true}
                  ref={(el) => { inputRefs.current[21] = el; }}
                  onSubmitEditing={() => focusNextInput(21, 2)}
                />
                <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.passwordToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={22} 
                  color="#5e5ce6" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  placeholder="Confirmer le mot de passe"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  editable={true}
                  ref={(el) => { inputRefs.current[22] = el; }}
                  onSubmitEditing={() => inputRefs.current[22]?.blur()}
                />
                <TouchableOpacity
                  onPress={toggleConfirmPasswordVisibility}
                  style={styles.passwordToggle}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passwordRulesContainer}>
              <Text style={styles.passwordRulesTitle}>Votre mot de passe doit contenir :</Text>
              {renderPasswordRule(passwordHasMinLength, "Au moins 8 caractères")}
              {renderPasswordRule(passwordHasUppercase, "Au moins 1 majuscule")}
              {renderPasswordRule(passwordHasNumber, "Au moins 1 chiffre (0-9)")}
              {renderPasswordRule(passwordHasSpecialChar, "Au moins 1 caractère spécial (!@#$%...)")}
              {renderPasswordRule(passwordsMatch, "Les deux mots de passe sont identiques")}
            </View>
          </>
        ) : (
          <>
            {/* ✅ MAIRIE : Récap + SIREN + Email officiel UNIQUEMENT */}
            {municipalityCity && (
              <View style={styles.municipalityRecapBox}>
                <FontAwesome5 name="landmark" size={24} color="#6366f1" />
                <Text style={styles.municipalityRecapText}>
                  Mairie de {municipalityCity}
                </Text>
              </View>
            )}

            {/* ⚠️ MESSAGE IMPORTANT SUR L'EMAIL OFFICIEL */}
            <View style={[styles.warningBox]}>
              <Ionicons name="shield-checkmark" size={22} color="#f59e0b" />
              <Text style={styles.warningBoxText}>
                <Text style={{ fontWeight: '700' }}>Important :</Text> Afin de garantir l’authenticité de votre demande, veuillez utiliser l’adresse e-mail officielle de votre mairie. Les adresses non officielles ne pourront malheureusement pas être prises en compte.
              </Text>
            </View>

            {/* CHAMP SIREN */}
            <View>
              <View style={styles.inputWrapper}>
                <MaterialIcons 
                  name="business" 
                  size={22} 
                  color="#5e5ce6" 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={municipalitySIREN}
                  placeholder="Numéro SIREN (9 chiffres)"
                  placeholderTextColor="#94a3b8"
                  onChangeText={setMunicipalitySIREN}
                  keyboardType="numeric"
                  maxLength={9}
                  returnKeyType="next"
                  editable={true}
                  ref={(el) => { inputRefs.current[11] = el; }}
                  onSubmitEditing={() => focusNextInput(11, 2)}
                />
              </View>
            </View>

            {/* CHAMP EMAIL OFFICIEL (NE PAS TOUCHER) */}
            <View>
              <View style={[
                styles.inputWrapper,
                emailError && { borderColor: 'rgba(239, 68, 68, 0.5)' },
                emailAvailable === true && { borderColor: 'rgba(16, 185, 129, 0.5)' }
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={22} 
                  color={emailError ? "#ef4444" : emailAvailable === true ? "#10b981" : "#5e5ce6"} 
                  style={styles.inputIcon} 
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  placeholder="Email officiel de la mairie"
                  placeholderTextColor="#94a3b8"
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  returnKeyType="done"
                  editable={true}
                  ref={(el) => { inputRefs.current[12] = el; }}
                  onSubmitEditing={() => inputRefs.current[12]?.blur()}
                />
                {renderVerificationIndicator(isCheckingEmail, emailAvailable, 'email')}
              </View>
              {emailError && (
                <Text style={styles.errorText}>{emailError}</Text>
              )}
              {emailAvailable === true && !emailError && (
                <Text style={styles.successText}>✓ Cette adresse email est disponible</Text>
              )}
            </View>
          </>
        )}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToPreviousStep}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.12)']}
            style={styles.buttonGradient}
          >
            <Text style={styles.backButtonText}>←</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButtonMain,
            (!formValid || isCheckingEmail) && styles.buttonDisabled,
          ]}
          onPress={goToNextStep}
          disabled={!formValid || isCheckingEmail}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={(formValid && !isCheckingEmail) ? ['#6366f1', '#4f46e5', '#4338ca'] : ['#94a3b8', '#cbd5e1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {isCheckingEmail ? (
              <>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.nextButtonText}>Vérification...</Text>
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ✅ ÉTAPE 3 MODIFIÉE : Pour mairies = Mot de passe uniquement
  const renderStepThree = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: translateY },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressIndicator, { width: getProgressWidth() }]} />
        </View>
        <Text style={styles.progressText}>Étape 3/3</Text>
      </View>

      <Text style={styles.stepTitle}>
        {accountType === "citizen" ? "Finalisez votre profil" : "Sécurisez votre compte"}
      </Text>
      <Text style={styles.stepDescription}>
        {accountType === "citizen"
          ? "Personnalisez votre profil avec une photo et votre ville"
          : "Créez un mot de passe sécurisé pour votre compte"}
      </Text>

      <View style={styles.formContainer}>
        {accountType === "citizen" ? (
          <>
            {/* CITOYEN : photo + localisation (inchangé) */}
            <Text style={styles.sectionTitle}>Photo de profil</Text>
            <View style={styles.photoManagerContainer}>
              <View>
                <PhotoManager photos={photos} setPhotos={setPhotos} maxPhotos={1} />
              </View>
              <Text style={styles.photoHelperText}>
                {photos?.length ? 'Votre photo de profil' : 'Appuyez ici pour ajouter une photo'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Votre ville</Text>
            <View style={styles.searchContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="location-outline" size={22} color="#5e5ce6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Rechercher par ville ou code postal"
                  value={query}
                  placeholderTextColor="#94a3b8"
                  onChangeText={setQuery}
                  editable={true}
                />
              </View>
              
              <Animated.View style={[styles.searchButtonContainer, { transform: [{ scale: searchBounceAnim }] }]}>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleAddressSearch}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    style={styles.searchButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.searchButtonText}>Rechercher</Text>
                    <Ionicons name="search" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <MaterialIcons name="location-on" size={22} color="#10b981" />
                <Text style={styles.selectedLocationText}>
                  {selectedCity.nom_commune} ({selectedCity.code_postal})
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
       <View>
          <Text style={{ color: '#fff', fontSize: 12, marginBottom: 5 }}>
            🔍 DEBUG: Password value = "{password}" | Length = {password.length}
          </Text>
          <View style={[
            styles.inputWrapper,
            { borderWidth: 2, borderColor: '#10b981' }
          ]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={22} 
              color="#5e5ce6" 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
              value={password}
              placeholder="🔐 MOT DE PASSE (TESTEZ MOI)"
              placeholderTextColor="#94a3b8"
              onChangeText={handlePasswordChange}
              secureTextEntry={!isPasswordVisible}
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="next"
              editable={true}
              keyboardType="default"
              ref={(el) => { 
                console.log("📝 Ref MOT DE PASSE assignée (index 21)");
                inputRefs.current[21] = el; 
              }}
              onSubmitEditing={() => {
                console.log("⏭️ onSubmitEditing appelé pour mot de passe");
                focusNextInput(21, 2);
              }}
              onFocus={() => {
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("✅ MOT DE PASSE A LE FOCUS !");
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
              }}
              onBlur={() => {
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("❌ MOT DE PASSE A PERDU LE FOCUS");
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
              }}
              onPressIn={() => console.log("👆 PRESS IN sur champ mot de passe")}
              onPressOut={() => console.log("👆 PRESS OUT sur champ mot de passe")}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.passwordToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={20}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <View style={styles.inputWrapper}>
            <Ionicons 
              name="lock-closed-outline" 
              size={22} 
              color="#5e5ce6" 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#94a3b8"
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!isConfirmPasswordVisible}
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="done"
              editable={true}
              ref={(el) => { 
                console.log("📝 Ref CONFIRMATION assignée (index 22)");
                inputRefs.current[22] = el; 
              }}
              onSubmitEditing={() => inputRefs.current[22]?.blur()}
              onFocus={() => console.log("✅ CONFIRMATION a le focus")}
              onBlur={() => console.log("❌ CONFIRMATION a perdu le focus")}
            />
            <TouchableOpacity
              onPress={toggleConfirmPasswordVisibility}
              style={styles.passwordToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                size={20}
                color="#94a3b8"
              />
            </TouchableOpacity>
          </View>
        </View>

            <View style={styles.passwordRulesContainer}>
              <Text style={styles.passwordRulesTitle}>Votre mot de passe doit contenir :</Text>
              {renderPasswordRule(passwordHasMinLength, "Au moins 8 caractères")}
              {renderPasswordRule(passwordHasUppercase, "Au moins 1 majuscule")}
              {renderPasswordRule(passwordHasNumber, "Au moins 1 chiffre (0-9)")}
              {renderPasswordRule(passwordHasSpecialChar, "Au moins 1 caractère spécial (!@#$%...)")}
              {renderPasswordRule(passwordsMatch, "Les deux mots de passe sont identiques")}
            </View>

            <View style={[styles.infoBox, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              <Text style={[styles.infoBoxText, { color: '#92400e' }]}>
                Votre compte sera soumis à validation. Vous recevrez un email une fois votre compte approuvé par un administrateur.
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToPreviousStep}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.12)']}
            style={styles.buttonGradient}
          >
            <Text style={styles.backButtonText}>←</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.registerButton,
            !formValid && styles.buttonDisabled,
          ]}
          onPress={handleRegisterClick}
          disabled={!formValid || isRegisterClicked || isLoading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={formValid ? ['#6366f1', '#4f46e5', '#4338ca'] : ['#94a3b8', '#cbd5e1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? "Création du compte..." : "S'inscrire"}
            </Text>
            {!isLoading && <Ionicons name="checkmark" size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStepZero();
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      default:
        return renderStepZero();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require("../../assets/images/2.jpg")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(24, 24, 27, 0.6)', 'rgba(15, 23, 42, 0.85)']}
          style={styles.gradientOverlay}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
            {renderCurrentStep()}
          </BlurView>
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ scale: modalScaleAnim }] },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sélectionnez votre ville</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {suggestions.length > 0 ? (
                  suggestions.map((item, index) => {
                    const displayName = item.Nom_commune;
                    const codePostal = item.Code_postal;

                    return (
                      <TouchableOpacity
                        key={`${item.Code_commune_INSEE}-${index}`}
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionSelect(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.suggestionIconContainer}>
                          <FontAwesome5 name="city" size={16} color="#6366f1" />
                        </View>
                        <View style={styles.suggestionTextContainer}>
                          <Text style={styles.suggestionCityName}>
                            {displayName}
                          </Text>
                          <Text style={styles.suggestionPostalCode}>
                            {codePostal}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <Text style={styles.noResultsText}>
                    Aucun résultat trouvé. Essayez un autre terme de recherche.
                  </Text>
                )}
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

