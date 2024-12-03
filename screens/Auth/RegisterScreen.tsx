import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import PhotoManager from '../../components/PhotoManager';
import { BlurView } from 'expo-blur';

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

  const handleRegisterClick = () => handleRegister(onLogin);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Affichage principal
  return (
    <View style={styles.container}> 
      {/* Arrière-plan avec image */}
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={styles.background}
      >
        <ScrollView
        contentContainerStyle={styles.scrollContainer} // Ajouté
        keyboardShouldPersistTaps="handled" // Permet de fermer le clavier au clic ailleurs
      >
        {/* Contenu flou */}
        <BlurView intensity={80} style={styles.blurContainer}>
          <View style={styles.containerTitle}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>
            <Text style={styles.title}>Créer un compte</Text>
          </View>
          <Text style={styles.subtitle}>Inscrivez-vous et rejoignez la communauté</Text>

          {/* Champs de formulaire */}
          <TextInput
            style={styles.input}
            value={lastName}
            placeholder="Prénom"
            placeholderTextColor="#999"
            onChangeText={setLastName}
            autoCorrect={false} // Désactive la correction automatique
            spellCheck={false} // Désactive la vérification orthographique
          />
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Nom"
            placeholderTextColor="#999"
            autoCorrect={false} // Désactive la correction automatique
            spellCheck={false} // Désactive la vérification orthographique
          />
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#999"
            autoCorrect={false} // Désactive la correction automatique
            spellCheck={false} // Désactive la vérification orthographique
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false} // Désactive la correction automatique
            spellCheck={false} // Désactive la vérification orthographique
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            secureTextEntry
            placeholderTextColor="#999"
            autoCorrect={false} // Désactive la correction automatique
            spellCheck={false} // Désactive la vérification orthographique
          />

          {/* Gestion de la photo de profil */}
          <Text style={styles.titlePhoto}>Choisissez une photo de profil</Text>
          <PhotoManager photos={photos} setPhotos={setPhotos} maxPhotos={1} />

          {/* Bouton d'inscription */}
          <TouchableOpacity
                  style={[
                    styles.modalButtonSubmit,
                    (!email || !password || !username || !lastName || !firstName || !photos ) && {
                      backgroundColor: "#ccc",
                    }, // Désactivé si les champs sont vides
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
                  } // Désactivé si les champs sont vides ou en cours de traitement
                >
            <Text style={styles.modalButtonTextSubmit}>
                    {isLoading ? "En cours..." : "S'inscrire"}
                  </Text>
                </TouchableOpacity>

          {/* Lien vers la connexion */}
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Déjà inscrit ?</Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
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
  // Conteneur principal
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, // Permet à la ScrollView de remplir l'écran même si le contenu est plus petit
  },
  
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
 // Section floue
 blurContainer: {
  flex: 1,
  minHeight: 600, // Assurez une hauteur minimale pour que le contenu soit bien positionné
  marginVertical: 40,
  width: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.3)', // Fond translucide
  borderRadius: 20,
  padding: 30,
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center', // Centre le BlurView horizontalement
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  overflow: 'hidden', // Empêche les débordements et applique le radius
},
  // Bouton retour
  backButton: {
    backgroundColor: "#ffffff", // Fond blanc pour le bouton
    borderRadius: 50, // Forme circulaire
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
  // Titre principal
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50", // Bleu foncé moderne
    textAlign: "center",
  },
 // Titre principal
 titlePhoto: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#2c3e50", // Bleu foncé moderne
  marginBottom: 8,
  marginTop: 20,
  textAlign: "center",
},
  // Sous-titre
  subtitle: {
    fontSize: 16,
    color: "#2c3e50", // Gris élégant
    marginBottom: 25,
    textAlign: "center",
    lineHeight: 22,
  },

  // Champs de saisie
  input: {
    height: 50,
    borderColor: "#ecf0f1", // Bordure grise légère
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: "100%",
    backgroundColor: "#ffffff", // Fond blanc
    fontSize: 16,
    color: "#34495e", // Texte gris foncé
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Ombre douce
  },

  // Bouton s'inscrire
  registerButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#2c3e50", // Bleu moderne
    borderRadius: 25, // Coins arrondis
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2980b9", // Ombre bleue
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },

  // Bouton en état cliqué
  buttonClicked: {
    backgroundColor: "#27ae60", // Vert confirmation
  },

  // Texte du bouton s'inscrire
  registerButtonText: {
    color: "#ffffff", // Texte blanc
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
    fontWeight: "bold",
    fontSize: 16,
  },
  // Lien pour se connecter
  loginLink: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  // Texte d'invitation à se connecter
  loginText: {
    color: "#2c3e50", // Gris élégant
    fontSize: 15,
  },

  // Bouton se connecter
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

  // Texte du bouton se connecter
  loginButtonText: {
    color: "#2c3e50", // Bleu moderne
    fontSize: 15,
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fond sombre
  },

  loaderText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});
