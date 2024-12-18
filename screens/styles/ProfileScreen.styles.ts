import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9fb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
    paddingTop: 50,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  profileContent: {
    padding: 20,
  },
  profileImageContainer: {
    alignItems: "center", // Centrer le contenu horizontalement
    justifyContent: "center", // Centrer le contenu verticalement
    padding: 20, // Espacement interne pour respirer
    backgroundColor: "#F9F9F9", // Fond clair pour contraster
    borderRadius: 15, // Coins arrondis
    shadowColor: "#000", // Ombre douce
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // Ombre sur Android
    marginBottom: 20, // Espacement avec la section suivante
  },
  profileImage: {
    width: 250, // Largeur de l'image
    height: 250, // Hauteur de l'image
    borderRadius: 60, // Forme ronde (50% de width/height)
  },
  noProfileImageText: {
    color: "#999", // Couleur grise discrète
    fontSize: 16, // Taille de police lisible
    fontWeight: "bold", // Texte en gras pour plus de visibilité
    marginBottom: 20, // Espacement avec le bouton
  },
  updateButton: {
    marginTop: 20,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#11998e",
    shadowColor: "#11998e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  updateButtonText: {
    color: "#FFFFFF", // Texte blanc
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  field: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  containerPhoto: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitleProfil: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  fieldContainer: {
    marginVertical: 10,
  },
  showEmail: {
    backgroundColor: "#f9f9f9",
    justifyContent: "space-between",
    flexDirection: "row", // Place le texte et le switch côte à côte
    alignItems: "center", // Centre verticalement le texte et le switch
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 20,
    borderRadius: 50,
  },
  label: {
    fontSize: 18, // Augmente la taille du texte
    fontWeight: "400", // Donne une apparence plus proéminente
    color: "#333", // Couleur sombre pour une bonne lisibilité
    marginBottom: 5, // Espacement avec le champ suivant
  }, 
  labelEmail: {
    flex:1,

    fontSize: 12, // Augmente la taille du texte
    fontWeight: "400", // Donne une apparence plus proéminente
    color: "#333", // Couleur sombre pour une bonne lisibilité
    marginBottom: 5, // Espacement avec le champ suivant
  },
  inputContainer: {
    flexDirection: "row", // Pour aligner l’icône à droite
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 30,
    marginTop: 5,
  },
  input: {
    flex: 1, // Prend tout l'espace sauf celui de l'icône
    height: 40,
    marginTop: 5,
    paddingLeft: 15,
    borderRadius: 30,
  },
  icon: {
    marginRight: 1,
  },
  inputDisabled: {
    backgroundColor: "#f9f9f9",
    color: "#888",
  },
  buttonProfil: {
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#007bff",
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonTextProfil: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
