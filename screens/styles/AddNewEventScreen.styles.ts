import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3, // Pour les ombres sur Android
    paddingTop: 50,
  },
  homeTitle: {
    flexDirection: "row", // Aligne les enfants en ligne (horizontalement)
    alignItems: "center", // Centre verticalement les éléments
    marginBottom: 25,
  },
  backButton: {
    padding: 10,
    borderRadius: 90,
    alignSelf: "flex-start",
    backgroundColor: "#E0E0E0",
    marginLeft: 15,
    marginRight: 26,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    fontSize: 14,
  },
  labelDescription: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    borderRadius: 30,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  inputDescription: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    height: 100,
    padding: 12,
    borderRadius: 30,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // React Native ne prend pas en charge "gap". Remplacez-le par "marginHorizontal" si nécessaire
  },
  inputSearch: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    borderRadius: 30,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  searchButton: {
    padding: 12,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007BFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  locationButton: {
    padding: 12,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FF5733",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center", // Centre verticalement
    alignItems: "center", // Centre horizontalement
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
  },
  modalContent: {
    width: "80%", // Largeur relative à l'écran
    backgroundColor: "#fff", // Fond blanc
    borderRadius: 10, // Coins arrondis
    padding: 20, // Espacement intérieur
    shadowColor: "#000", // Ombre
    shadowOffset: { width: 0, height: 4 }, // Position de l'ombre
    shadowOpacity: 0.3, // Opacité de l'ombre
    shadowRadius: 5, // Rayon de l'ombre
    elevation: 10, // Ombre pour Android
    alignItems: "center", // Centre le contenu horizontalement
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15, // Espacement entre le texte et la barre de progression
    textAlign: "center", // Centrer le texte
    color: "#333", // Couleur du texte
  },
  modalPercentage: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10, // Espacement entre la barre de progression et le pourcentage
    textAlign: "center",
    color: "#007BFF", // Bleu pourcentage
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
  containerDate: {
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  selectedDate: {
    marginVertical: 15,
    fontSize: 18,
    color: "#555",
    fontWeight: "bold",
  },
  mapContainer: {
    marginVertical: 20,
    height: 400,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modal: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  activityIndicator: {
    marginTop: 20,
  },
  submitButtonContainer: {
    paddingBottom: 50,
    justifyContent: "center", // Centrer l'élément dans le container
    alignItems: "center", // Centrer l'élément dans le container
  },
  submitButton: {
    marginVertical: 20, // Espacement autour du bouton
    alignItems: "center", // Centrer le bouton horizontalement
  },
  button: {
    backgroundColor: "#007BFF", // Couleur de fond
    paddingVertical: 12, // Espacement vertical
    paddingHorizontal: 20, // Espacement horizontal
    borderRadius: 8, // Coins arrondis
  },
  buttonDisabled: {
    backgroundColor: "#ccc", // Couleur grisée lorsque désactivé
  },
  buttonText: {
    color: "#fff", // Couleur du texte
    fontSize: 16, // Taille de la police
    fontWeight: "bold", // Texte en gras
    textAlign: "center", // Centrage du texte
  },
  containerPhoto: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoContainer: {
    marginTop: 20,
    marginBottom: 20,
  },

  photoWrapper: {
    position: "relative", // Nécessaire pour positionner la croix
    marginRight: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 1, // S'assurer que la croix est au-dessus de l'image
  },
  progressModalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: 300,
  },
  
});
