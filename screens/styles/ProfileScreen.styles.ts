import { StyleSheet } from "react-native";

export default StyleSheet.create({


  // Style Global  :

  cardContent: {
    flexDirection: "row",
    justifyContent: "space-around", // Espace égal entre les items
    alignItems: "center",
    flexWrap: "wrap", // Permet de passer à la ligne si les éléments débordent
    paddingHorizontal: 10, // Ajout d'espace sur les côtés pour éviter le débordement
  },
  statItem: {
    justifyContent: "center", // Centre verticalement le contenu de statItem
    alignItems: "center", // Centre horizontalement le contenu de statItem
    padding: 10, // Espacement interne
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center", // Centre le nombre horizontalement
    marginBottom: 5, // Espace entre le nombre et le texte
    color: "#535353", // Couleur sombre pour le nombre
  },
  statLabel: {
    textAlign: "center", // Centre le texte horizontalement
    fontSize: 14,
    color: "#555", // Couleur du texte
    fontWeight: "bold", // Texte en gras
    lineHeight: 20, // Espacement entre les lignes
  },


  editButton: {
    marginTop: 10,
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: "#535353",
    borderRadius: 30,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  editContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 35,
    backgroundColor: "#f9f9f9",
  },
  inputCity: {
    height: 40,
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  cityPreview: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    padding: 10,
    width: "40%",
    backgroundColor: "#535353",
    borderRadius: 30,
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",

  },
  cancelButton: {
    padding: 10,
    width: "40%",
    backgroundColor: "#B2352E",
    borderRadius: 30,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#fff",
  },
 
  modalTitle: {
    fontWeight: "bold",
    marginBottom: 20,
  },


// Modal ville

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding:30,
    paddingVertical: 90,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "100%",  
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#B2352E",
    borderRadius: 30,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },




searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width : "100%",
    marginBottom: 15,
  },
searchButton: {
    position: "absolute",
    right:3,
    top:0,
    padding: 10,
    borderRadius: 5,
  },


  container: {
    flex: 1,
    backgroundColor: "#f9f9fb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#535353", // Couleur sombre
    borderBottomLeftRadius: 50, // Arrondi en bas à gauche
    borderBottomRightRadius: 50, // Arrondi en bas à droite
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#fff", // Couleur blanche
    letterSpacing: 2, // Espacement pour un effet moderne
    textAlign: "center",
    fontFamily: 'BebasNeue', // Utilisez le nom de la police que vous avez défini
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
    width: 200, // Largeur de l'image
    height: 200, // Hauteur de l'image
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
    backgroundColor: "#535353",
    shadowColor: "#535353",
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
    marginTop: 5,
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
    marginRight: 15,
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
    backgroundColor: "#535353",
    shadowColor: "#535353",
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
  infoCardHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContentFollower: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    height: "50%",
    padding: 16,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 16,
  },
  unfollowButton: {
    backgroundColor: "#ff6666",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 30,
  },
  unfollowButtonText: {
    color: "#fff",
    fontSize: 14,
  },
});
