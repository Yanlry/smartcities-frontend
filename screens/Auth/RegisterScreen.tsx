// Chemin : screens/Auth/RegisterScreen.tsx

import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../hooks/auth/useAuth";
import PhotoManager from "../../components/interactions/PhotoManager";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';
import franceCitiesRaw from "../../assets/france.json";

const { width, height } = Dimensions.get("window");
const franceCities: City[] = franceCitiesRaw as City[];

// Expressions régulières de validation
const MIN_LENGTH = 3;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).+$/;

interface City {
  Code_commune_INSEE: number;
  Nom_commune: string;
  Code_postal: number;
  Libelle_acheminement: string;
  Ligne_5: string;
  coordonnees_gps: string;
}

export default function RegisterScreen({ navigation, onLogin }: any) {
  // États et hooks d'authentification
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

  // États de validation des champs
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // États de localisation et recherche
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
  const [currentStep, setCurrentStep] = useState(1);
  const [formValid, setFormValid] = useState(false);

  // Refs pour les animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const inputRefs = useRef<Array<TextInput | null>>([null, null, null, null, null]);
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const searchBounceAnim = useRef(new Animated.Value(1)).current;

  // Animation d'entrée
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

  // Fonctions de validation des champs
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

  const validateUsername = (value: string): boolean => {
    const isValid = value.length >= MIN_LENGTH;
    if (!isValid && value.length > 0) {
      setUsernameError(`Le nom d'utilisateur doit comporter au moins ${MIN_LENGTH} caractères`);
    } else {
      setUsernameError(null);
    }
    return isValid || value.length === 0;
  };

  const validateEmail = (value: string): boolean => {
    const isValid = EMAIL_REGEX.test(value);
    if (!isValid && value.length > 0) {
      setEmailError("Veuillez saisir une adresse e-mail valide");
    } else {
      setEmailError(null);
    }
    return isValid || value.length === 0;
  };

  const validatePassword = (value: string): boolean => {
    const isValid = PASSWORD_REGEX.test(value);
    if (!isValid && value.length > 0) {
      setPasswordError("Le mot de passe doit contenir au moins une majuscule et un chiffre");
    } else {
      setPasswordError(null);
    }
    return isValid || value.length === 0;
  };

  // Gestionnaires de modification des champs avec validation
  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    validateFirstName(value);
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    validateLastName(value);
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    validateUsername(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value);
  };

  // Valider le formulaire selon l'étape courante
  useEffect(() => {
    if (currentStep === 1) {
      // Vérifie que les champs sont remplis ET valides
      const step1Valid = 
        !!firstName && !!lastName && !!username && 
        firstNameError === null && lastNameError === null && usernameError === null &&
        firstName.length >= MIN_LENGTH && lastName.length >= MIN_LENGTH && username.length >= MIN_LENGTH;
      setFormValid(step1Valid);
    } else if (currentStep === 2) {
      // Vérifie que les champs sont remplis ET valides
      const step2Valid = 
        !!email && !!password && 
        emailError === null && passwordError === null &&
        EMAIL_REGEX.test(email) && PASSWORD_REGEX.test(password);
      setFormValid(step2Valid);
    } else if (currentStep === 3) {
      setFormValid(!!selectedLocation && !!photos?.length);
    }
  }, [
    firstName, lastName, username, email, password, 
    firstNameError, lastNameError, usernameError, emailError, passwordError,
    currentStep, selectedLocation, photos
  ]);

  // Gestion de l'inscription
  const handleRegisterClick = () => {
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

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animation lors de l'inscription
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

    handleRegister(onLogin, cityData);
  };

  // Navigation vers la prochaine étape
  const goToNextStep = () => {
    if (!formValid) {
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

  // Retour à l'étape précédente
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

  // Recherche d'adresse
  const handleAddressSearch = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    // Animation du bouton de recherche
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
    }).slice(0, 20); // Limiter à 20 résultats pour les performances

    if (filteredCities.length > 0) {
      setSuggestions(filteredCities);
      setModalVisible(true);
      
      // Animation à l'ouverture de la modale
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

  // Sélection d'une suggestion
  const handleSuggestionSelect = (item: any) => {
    const [lat, lng] = item.coordonnees_gps
      .split(",")
      .map((coord: string) => parseFloat(coord.trim()));

    setSelectedCity({
      nom_commune: item.Nom_commune,
      code_postal: item.Code_postal.toString(),
    });

    setLatitude(lat);
    setLongitude(lng);
    setSelectedLocation({ latitude: lat, longitude: lng });

    setQuery(`${item.Nom_commune} (${item.Code_postal})`);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animation à la fermeture de la modale
    Animated.timing(modalScaleAnim, {
      toValue: 0.8,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setTimeout(() => modalScaleAnim.setValue(0.8), 200);
    });
  };

  // Navigation vers la page de connexion
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

  // Transition entre champs du formulaire
  const focusNextInput = (index: number, step: number) => {
    if (step === 1) {
      if (index < 2 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      } else if (index === 2) {
        inputRefs.current[index]?.blur();
        goToNextStep();
      }
    } else if (step === 2) {
      if (index < 4 && index > 2 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      } else if (index === 4) {
        inputRefs.current[index]?.blur();
        goToNextStep();
      }
    }
  };

  // Calculer la largeur de la barre de progression
  const getProgressWidth = () => {
    switch (currentStep) {
      case 1:
        return "33%";
      case 2:
        return "67%";
      case 3:
        return "100%";
      default:
        return "33%";
    }
  };

  // Rendu de l'étape 1: Informations personnelles
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

      <Text style={styles.stepTitle}>Qui êtes-vous ?</Text>
      <Text style={styles.stepDescription}>
        Commençons par vos informations personnelles
      </Text>

      <View style={styles.formContainer}>
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
              ref={(el) => (inputRefs.current[0] = el)}
              onSubmitEditing={() => focusNextInput(0, 1)}
              onBlur={() => validateFirstName(firstName)}
            />
          </View>
          {firstNameError && (
            <Text style={styles.errorText}>{firstNameError}</Text>
          )}
        </View>

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
              ref={(el) => (inputRefs.current[1] = el)}
              onSubmitEditing={() => focusNextInput(1, 1)}
              onBlur={() => validateLastName(lastName)}
            />
          </View>
          {lastNameError && (
            <Text style={styles.errorText}>{lastNameError}</Text>
          )}
        </View>
        
        <View>
          <View style={[
            styles.inputWrapper,
            usernameError && { borderColor: 'rgba(239, 68, 68, 0.5)' }
          ]}>
            <Ionicons 
              name="at" 
              size={22} 
              color={usernameError ? "#ef4444" : "#5e5ce6"} 
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
              returnKeyType="next"
              ref={(el) => (inputRefs.current[2] = el)}
              onSubmitEditing={() => focusNextInput(2, 1)}
              onBlur={() => validateUsername(username)}
            />
          </View>
          {usernameError && (
            <Text style={styles.errorText}>{usernameError}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          !formValid && styles.buttonDisabled,
        ]}
        onPress={goToNextStep}
        disabled={!formValid}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={formValid ? ['#6366f1', '#4f46e5', '#4338ca'] : ['#94a3b8', '#cbd5e1']}
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

  // Rendu de l'étape 2: Informations du compte
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

      <Text style={styles.stepTitle}>Votre compte</Text>
      <Text style={styles.stepDescription}>
        Configurez les informations de connexion à votre compte
      </Text>

      <View style={styles.formContainer}>
        <View>
          <View style={[
            styles.inputWrapper,
            emailError && { borderColor: 'rgba(239, 68, 68, 0.5)' }
          ]}>
            <Ionicons 
              name="mail-outline" 
              size={22} 
              color={emailError ? "#ef4444" : "#5e5ce6"} 
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
              ref={(el) => (inputRefs.current[3] = el)}
              onSubmitEditing={() => focusNextInput(3, 2)}
              onBlur={() => validateEmail(email)}
            />
          </View>
          {emailError && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}
        </View>

        <View>
          <View style={[
            styles.inputWrapper,
            passwordError && { borderColor: 'rgba(239, 68, 68, 0.5)' }
          ]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={22} 
              color={passwordError ? "#ef4444" : "#5e5ce6"} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Mot de passe"
              placeholderTextColor="#94a3b8"
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoCorrect={false}
              spellCheck={false}
              returnKeyType="done"
              ref={(el) => (inputRefs.current[4] = el)}
              onSubmitEditing={() => focusNextInput(4, 2)}
              onBlur={() => validatePassword(password)}
            />
          </View>
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
        </View>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToPreviousStep}
          activeOpacity={0.9}
        >
          <Text style={styles.backButtonText}>Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            styles.nextButtonInRow,
            !formValid && styles.buttonDisabled,
          ]}
          onPress={goToNextStep}
          disabled={!formValid}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={formValid ? ['#6366f1', '#4f46e5', '#4338ca'] : ['#94a3b8', '#cbd5e1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.nextButtonText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Rendu de l'étape 3: Finalisation du profil
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

      <Text style={styles.stepTitle}>Finalisez votre profil</Text>
      <Text style={styles.stepDescription}>
        Personnalisez votre profil avec une photo et votre ville
      </Text>

      <View style={styles.formContainer}>
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
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={goToPreviousStep}
          activeOpacity={0.9}
        >
          <Text style={styles.backButtonText}>Précédent</Text>
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
            style={styles.gradientButton}
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

  // Rendu conditionnel selon l'étape
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      default:
        return renderStepOne();
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 20,
    paddingHorizontal: 24,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    opacity: 0.8,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 40,
  },
  blurContainer: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  stepContainer: {
    padding: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    marginBottom: 10,  // Réduit pour laisser de la place aux messages d'erreur
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 16,
    fontWeight: '500',
  },
  nextButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
  },
  nextButtonInRow: {
    flex: 1,
    marginLeft: 12,
    marginBottom: 0,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  loginButton: {
    marginLeft: 8,
  },
  loginButtonText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  photoManagerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  photoManagerWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  photoHelperText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchButtonContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  searchButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: 4,
  },
  selectedLocationText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginLeft: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.7,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  suggestionsList: {
    maxHeight: height * 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionCityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  suggestionPostalCode: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  noResultsText: {
    padding: 24,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
});