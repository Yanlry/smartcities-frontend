import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: "95%",
    padding: 15,
    borderRadius: 30,
    backgroundColor: "#f5f5f5",
  },
  dropdownText: {
    width: "85%",
    fontSize: 14,
    color: "#c7c7c7",
    paddingLeft: 10,
  },
  selectedCategory: {
    color: "#666",
  },
  boldText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34495E",
  },
  modalOverlayCategorie: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContentCategorie: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  card: {
    backgroundColor: "#f9f9f9",
    marginBottom: 25,
    borderRadius: 50,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedCard: {
    backgroundColor: "#e0f7ff",
    borderWidth: 1,
    borderColor: "#34495E",
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardDescription: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#34495E",
    borderRadius: 30,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Espace uniforme entre les boutons
    alignItems: "center", // Centre les boutons verticalement
    width: "95%", // Le conteneur occupe 90% de l'espace disponible
    alignSelf: "center", // Centre horizontalement le conteneur
  },
  rowButtonMap: {
    width: "47%",
    flexDirection: "row", // Icône et texte alignés horizontalement
    justifyContent: "center", // Centrage horizontal à l'intérieur du bouton
    alignItems: "center", // Centrage vertical à l'intérieur du bouton
    backgroundColor: "#34495E", // Bleu pour "Rechercher"
    padding: 10,
    borderRadius: 50,
  },
  rowButtonLocation: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDAE49",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10, // Espace entre le champ et le bouton
    marginTop : 40,

  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  selectedIconContainer: {
    alignItems: "center",
    paddingBottom: 10,
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 12,
    color: "#34495E",
    fontWeight: "bold",
  },
  selectedIconLabel: {
    color: "#34495E",
    fontWeight: "bold",
  },
  containerSubmit: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#38A83C",
    padding: 15,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34495E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginVertical: 10,
  },
  buttonMap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34495E",
    height: 80,
    borderRadius: 5,
    marginVertical: 10,
  },
  mapButtonText: {
    color: "white",
    marginLeft: 10,
  },
  closeButtonMap: {
    width: "100%",
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
    borderRadius: 5,
  },
  closeButtonTextMap: {
    color: "white",
    fontWeight: "bold",
    fontSize: 25,
  },
  containerSecond: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 35,
  },
  containerInput: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 35,
    color: "#333",
    textAlign: "center",
  },
  inputTitle: {
    flex: 1, // Permet au champ d'occuper l'espace disponible
    width: 330,
    height: 50, // Hauteur fixe (peut être ajustée)
    maxHeight: 50, // Empêche l'agrandissement vertical
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingLeft: 30,
    marginBottom: 25, // Espacement avec l'élément suivant
    fontSize: 16,
    color: "#333",
    overflow: "hidden", // Empêche le débordement
  },
  input: {
    flex: 1, // Permet au champ d'occuper l'espace disponiblehei
    maxHeight: 350, // Empêche l'agrandissement vertical
    backgroundColor: "#f5f5f5",
    borderRadius: 30,
    paddingVertical: 10, // Ajustez en fonction de votre design
    paddingHorizontal: 15,
    paddingLeft: 25,
    paddingTop: 20,
    fontSize: 16,
    color: "#333",
    overflow: "hidden", // Empêche le débordement
    
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  inputSearch: {
    height: 50, // Assurez une hauteur uniforme
    textAlignVertical: 'center', // Centre le texte verticalement
    paddingHorizontal: 10, // Ajoute un espace pour le texte à gauche et à droite
   paddingLeft: 20, // Ajoutez un espacement à gauche
    
    backgroundColor: "#f5f5f5",
    width:"65%",
    borderRadius: 30, // Ajoutez un arrondi aux coins
    fontSize: 16, // Ajustez la taille de la police
    color: "#333",
    marginTop : 40,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34495E",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10, // Espace entre le champ et le bouton
    marginTop : 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "50%",
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 20,
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
  closeModalButton: {
    marginTop: 10,
    alignSelf: "center",
    backgroundColor: "#34495E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navButtonLeft: {
    position: "absolute",
    right: 110,
    bottom: 10,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 10,
    gap: 20,
  },
  navButtonRight: {
    position: "absolute",
    left: 110,
    bottom: 10,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  homeTitle: {
    flexDirection: "row", // Aligne les enfants en ligne (horizontalement)
    alignItems: "center", // Centre verticalement les éléments
    marginBottom: 20, // Ajoutez un espacement en bas si nécessaire
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 90,
    alignSelf: "flex-start",
    backgroundColor: "#E0E0E0",
    marginBottom: 20,
    marginTop: 40,
    marginLeft: 15,
    marginRight: 35,
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
    // Ajustez la couleur si nécessaire
    marginTop: 20,
    textAlign: "center",
  },
  containerThird: { 
    paddingHorizontal: 20, 
    marginTop: 35 ,
  },
});
