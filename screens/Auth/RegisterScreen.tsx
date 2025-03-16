import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/auth/useAuth";
import PhotoManager from "../../components/interactions/PhotoManager";
import { BlurView } from "expo-blur";
import franceCitiesRaw from "../../assets/france.json";

const franceCities: City[] = franceCitiesRaw as City[];

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

  const handleRegisterClick = () => {
    console.log("selectedLocation :", selectedLocation);
    console.log("latitude :", latitude);
    console.log("longitude :", longitude);

    if (!selectedLocation || !latitude || !longitude) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner une ville avant de vous inscrire."
      );
      return;
    }

    const cityData = {
      nom_commune: selectedCity.nom_commune,  
      code_postal: selectedCity.code_postal,
      latitude,
      longitude,
    };

    console.log("Données envoyées :", cityData);

    handleRegister(onLogin, cityData);
  };

  const handleAddressSearch = () => {
    const trimmedQuery = query.trim();  

    if (!trimmedQuery) {
      console.warn("Recherche annulée : champ query vide.");
      return;
    }
 
    const filteredCities = franceCities.filter((city) => { 
      const cityName = (city.Ligne_5 || city.Nom_commune).toLowerCase().trim();
      const codePostal = city.Code_postal.toString().trim();

      return (
        cityName.includes(trimmedQuery.toLowerCase()) ||  
        codePostal.startsWith(trimmedQuery)  
      );
    });

    if (filteredCities.length > 0) {
      setSuggestions(filteredCities);
      setModalVisible(true);
    } else {
      setSuggestions([]);
      Alert.alert(
        "Erreur",
        "Aucune ville ou code postal correspondant trouvé."
      );
    }
  };

  const handleSuggestionSelect = (item: any) => {
    const [latitude, longitude] = item.coordonnees_gps
      .split(",")
      .map((coord: string) => parseFloat(coord.trim()));
 
    setSelectedCity({
      nom_commune: item.Nom_commune,
      code_postal: item.Code_postal,
    });

    console.log("Données préparées :", {
      nom_commune: item.Nom_commune,
      code_postal: item.Code_postal,
      latitude,
      longitude,
    });
 
    setLatitude(latitude);
    setLongitude(longitude);
    setSelectedLocation({ latitude, longitude });
 
    setQuery(`${item.Nom_commune} ${item.Ligne_5 ? `(${item.Ligne_5})` : ""}`);

    setModalVisible(false);
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };
 
  return (
    <View style={styles.container}>
      {/* Arrière-plan avec image */}
      <ImageBackground
        source={require("../../assets/images/background.png")}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}  
          keyboardShouldPersistTaps="handled"  
        >
          {/* Contenu flou */}
          <BlurView intensity={80} style={styles.blurContainer}>
            <View style={styles.containerTitle}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#2c3e50" />
              </TouchableOpacity>
              <Text style={styles.title}>Créer un compte</Text>
            </View>
            <Text style={styles.subtitle}>
              Inscrivez-vous et rejoignez la communauté
            </Text>

            {/* Champs de formulaire */}
            <TextInput
              style={styles.input}
              value={lastName}
              placeholder="Prénom"
              placeholderTextColor="#c7c7c7"
              onChangeText={setLastName}
              autoCorrect={false} 
              spellCheck={false} 
            />
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nom"
              placeholderTextColor="#c7c7c7"
              autoCorrect={false} 
              spellCheck={false} 
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Nom d'utilisateur"
              placeholderTextColor="#c7c7c7"
              autoCorrect={false} 
              spellCheck={false} 
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              placeholderTextColor="#c7c7c7"
              autoCapitalize="none"
              autoCorrect={false} 
              spellCheck={false} 
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              placeholderTextColor="#c7c7c7"
              autoCorrect={false} 
              spellCheck={false} 
            />
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.inputSearch}
                placeholder="Rechercher par code postal"
                value={query}
                placeholderTextColor="#c7c7c7"
                onChangeText={setQuery}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleAddressSearch}
              >
                {/* Remplacez par une icône ou texte */}
                <Ionicons name="search-sharp" size={20} color="black" />
              </TouchableOpacity>
            </View>

            {/* Suggestions d'adresses */}
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ScrollView>
                    {suggestions.map((item, index) => { 
                      const [latitude, longitude] = item.coordonnees_gps
                        .split(",")
                        .map((coord: string) => parseFloat(coord.trim()));

                      const displayName =
                        item.Ligne_5 && item.Ligne_5.trim() !== ""
                          ? item.Ligne_5
                          : item.Nom_commune;

                      return (
                        <TouchableOpacity
                          key={`${item.Code_commune_INSEE}-${index}`}
                          style={styles.suggestionItem}
                          onPress={() => handleSuggestionSelect(item)}
                        >
                          <Text style={styles.suggestionText}>
                            {displayName} - {item.Code_postal}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </Modal>

            {/* Gestion de la photo de profil */}
            <Text style={styles.titlePhoto}>
              Choisissez une photo de profil
            </Text>
            <PhotoManager photos={photos} setPhotos={setPhotos} maxPhotos={1} />

            {/* Bouton d'inscription */}
            <TouchableOpacity
              style={[
                styles.modalButtonSubmit,
                (!email ||
                  !password ||
                  !username ||
                  !lastName ||
                  !firstName ||
                  !photos) && {
                  backgroundColor: "#ccc",
                },  
              ]}
              onPress={handleRegisterClick}
              disabled={
                !email ||
                !password ||
                !lastName ||
                !firstName ||
                !password ||
                !username ||
                !photos ||
                isRegisterClicked
              }  
            >
              <Text style={styles.modalButtonTextSubmit}>
                {isLoading ? "En cours..." : "S'inscrire"}
              </Text>
            </TouchableOpacity>

            {/* Lien vers la connexion */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Déjà inscrit ?</Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,  
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
    flex: 1,
    minHeight: 600,  
    marginVertical: 40,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",  
    borderRadius: 20,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    overflow: "hidden",  
  }, 
  backButton: {
    backgroundColor: "#ffffff", 
    borderRadius: 50,  
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginRight: 20,
  },
  containerTitle: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  }, 
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50", 
    textAlign: "center",
  }, 
  titlePhoto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50", 
    marginBottom: 8,
    marginTop: 20,
    textAlign: "center",
  }, 
  subtitle: {
    fontSize: 16,
    color: "#2c3e50", 
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 22,
  },
 
  input: {
    height: 50,
    borderColor: "#ecf0f1",  
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: "100%",
    backgroundColor: "#ffffff", 
    fontSize: 16,
    color: "#34495e",  
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,  
  },
 
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#2c3e50",  
    borderRadius: 25,  
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2980b9", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
 
  buttonClicked: {
    backgroundColor: "#27ae60",  
  },
 
  registerButtonText: {
    color: "#ffffff",  
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "uppercase",
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
    fontWeight: "bold",
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",  
    alignItems: "center", 
    backgroundColor: "rgba(0, 0, 0, 0.5)",  
  },
  modalContent: {
    width: "80%", 
    backgroundColor: "#fff", 
    borderRadius: 10,  
    padding: 20,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 4 },  
    shadowOpacity: 0.3, 
    shadowRadius: 5,  
    elevation: 10,  
    alignItems: "center",  
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",  
    alignItems: "center", 
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
  },
  inputSearch: {
    flex: 1,
    borderColor: "#ecf0f1", 
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: "100%",
    backgroundColor: "#ffffff",  
    fontSize: 16,
    color: "#34495e",  
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,  
  },
  searchButton: {
    position: "absolute",
    top: 12,
    right: 10,
    padding: 10,
    borderRadius: 5,
  }, 
  loginLink: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
 
  loginText: {
    color: "#2c3e50",  
    fontSize: 15,
  },
 
  loginButton: {
    borderColor: "#2c3e50",
    borderWidth: 2,
    borderRadius: 20,
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
 
  loginButtonText: {
    color: "#2c3e50",  
    fontSize: 15,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",  
  },

  loaderText: {
    marginTop: 10,
    color: "#fff",
    fontSize: 16,
  },
});
