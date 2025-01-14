import { StyleSheet } from "react-native";

export default StyleSheet.create({
  //  ------------------------------------------------ STYLE GLOBAL

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 90,

  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 15,
    color: "#093A3E",
  },
  //  ------------------------------------------------ LOADING

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",  
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",  
  },

  // ------------------------------------------------  MODAL PARTAGE DE POSITION

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",  
    paddingHorizontal: 20,   
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff", 
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#ddd",  
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,  
  },
  button: {
    backgroundColor: "#1E90FF",  
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,  
    shadowColor: "#000",  
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff",  
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // ------------------------------------------------  MODAL FOLLOWER

  containerFollower: {
    flex: 1,
    backgroundColor: "#f7f8fa",  
    padding: 20,
    paddingTop: 110,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  followerList: {
    paddingBottom: 20,  
  },
  backButton: {
    marginBottom: 70,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#093A3E",  
    borderRadius: 30,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",  
    textTransform: "uppercase",  
  },

  //  ------------------------------------------------ PROFILE CONTAINER

  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#ccc",
    marginRight: 16,
  },
  noProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  noProfileImageText: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",
  },
  dropdownButton: {
    position:"absolute",
    right:0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",  
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainerName: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 10,  
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    alignItems: "center",
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitleName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  optionItem: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F2F4F7",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    color: "#111",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#D91A20",  
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  
  userCity: {
    fontSize: 12,
    color: "#777", // Couleur par défaut pour le texte
    marginTop: 4,
  },
  cityNameUser: {
    color: "#093A3E", // Texte de la ville en bleu
    fontWeight: "bold", // Optionnel pour mettre en valeur la ville
  },
  userDetails: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  followerItem: {
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: "#fff",  
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 1,
    borderRadius: 90,  
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,  
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,  
    marginRight: 12,  
    borderWidth: 1,
    borderColor: "#ddd", 
  },
  followerName: {
    fontSize: 16,
    fontWeight: "600",  
    color: "#444", 
  },
  statistics: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: 15,
    padding: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#093A3E",
  },
  statLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  separator: {
    height: 40,
    width: 1,
    backgroundColor: "#ddd",
  },
  voteSummary: {
    flexDirection: "row",
    gap: 20,
  },
  votes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#093A3E",
    marginLeft: 8,
  },
  noVotesText: {
    marginTop: 20,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

 modalContentRanking: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  titleModal: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40,
    color: "#333",
  },
  rankingItemModal: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#FFF",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  topThreeImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  rankingTextModal: {
    fontSize: 16,
    color: "#333",
  },
  topThreeText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  badge: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  badgeText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
  closeButtonModal: {
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#093A3E",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  closeButtonTextModal: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  nonTopThreeItem: {
    backgroundColor: "#EFEFEF", // Couleur de fond pour ceux hors du top 3
    borderWidth: 0, // Pas de contour
    borderRadius:60,
    paddingLeft: 10,
  },
  nonTopThreeText: {
    color: "#666", // Couleur plus subtile pour ceux hors du top 3
    fontWeight: "normal", // Style plus léger pour différencier
  },
  titleContainer: {
    backgroundColor: '#f8f9fa', // Couleur claire pour le fond
    padding: 15,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Pour Android
    marginTop: 35, // Espace avec le titre
    marginBottom: 25, // Espace avec la liste
    alignItems: 'center',
  },
  titleContainer1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF', // Couleur pour le nom de la ville
  },

  
  //  ------------------------------------------------ TOP 10 DES SMARTERS


  sectionTitleTop10: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#093A3E",
  },
  smarterItem: {
    alignItems: "center",
    padding: 10,
    width: 120,
  },
  smarterImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Assure l'image circulaire
    marginBottom: 10,
    marginTop: 5,
    borderWidth: 3, // Épaisseur du contour
    borderColor: "#ddd", // Couleur par défaut (changée dynamiquement)
  },
  rankingName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  medal: {
    fontSize: 40, // Taille de la médaille
    position: "absolute",
    top: 0, // Position légèrement au-dessus de l'image
    left: 0, // Décalage vers la gauche
    zIndex: 1, // Assure que la médaille est au-dessus de l'image
  },
  seeAllButton: {
    backgroundColor: "#093A3E",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 100,
    height: 100,
    marginTop: 18,
    marginHorizontal: 10,
  },
  seeAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  //  ------------------------------------------------ SIGNALEMENTS PROCHE

  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  noReportsText: {
    fontSize: 18,
    color: "#A0A0A0",
    textAlign: "center",
    fontStyle: "italic",
  },
  timelineContainer: {
    flexDirection: "row", // Permet un défilement horizontal
    alignItems: "center",
  },
  timelinePointContainer: {
    alignItems: "center",
    marginHorizontal: 10, // Espacement entre chaque signalement
  },
  timelineLabel: {
    width: 180,
    marginTop:5,

    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10, // Distance entre l'étiquette et le bloc signalement
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF", // Couleur blanche pour contraster avec le fond dynamique
    textAlign: "center",
  },
  timelineBlock: {
    width: 230,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom:10,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  reportType: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 10,
  },
  reportDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  reportTime: {
    fontSize: 11,
    color: "#666",
  },
  //  ------------------------------------------------ SELECTION DE CATEGORIE

  categoryButton: {
    width: 120,  
    height: 120,  
    marginTop: 10,
    justifyContent: "center",  
    alignItems: "center",  
    marginRight: 10,  
    borderRadius: 90, 
  },
  categoryIcon: {
    marginBottom: 5,  
  },
  categoryText: {
    color: "#fff", 
    fontSize: 16,  
    fontWeight: "bold", 
  },

  //  ------------------------------------------------ EVENT A LA UNE

  featuredItem: {
    width: 150,
    minHeight: 150, 
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  featuredImage: {
    width: "100%",
    height: "auto", 
    aspectRatio: 1.5,  
  },
  featuredTitle: {
    padding: 10,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  errorText: {
    color: "red", // Couleur rouge pour attirer l'attention
    fontSize: 16, // Taille de texte confortable
    fontWeight: "bold", // Texte en gras pour plus de visibilité
    textAlign: "center", // Centré pour un affichage clair
    marginTop: 10, // Espace en haut pour le séparer des autres éléments
    marginHorizontal: 20, // Marges horizontales pour éviter d’être collé aux bords
  },

  // ------------------------------------------------  CALENDRIER

  calendarContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#093A3E",
  },
  eventDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: "#888",
  },
  noEventsContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fce4ec",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f8bbd0",
    marginBottom: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: "#d81b60",
    fontWeight: "bold",
    textAlign: "center",
  },
  noEventsTextOne: {
    fontSize: 16,
    color: "#d81b60",
    marginTop: 30,
    marginBottom: 40,
    fontWeight: "bold",
    textAlign: "center",
  },
  // ------------------------------------------------  PARTIE  MAIRIE

  // ------------------------------------------------ SIGNALEMENT RESOLUS

  infoCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#093A3E",
    marginBottom: 10,
    marginTop: 15,
  },
  infoContent: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
    lineHeight: 20,
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#666",
  },

  // ------------------------------------------------  FICHE INFORMATION MAIRE

  mayorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  profileImageMayor: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    marginRight: 15,
  },
  mayorContainer: {
    flex: 1,
  },
  mayorInfo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",
    marginBottom: 5,
  },
  mayorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  mayorSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  mayorContact: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
  },
  contactBold: {
    fontWeight: "bold",
    marginTop: 5,
  },

  // ------------------------------------------------ FICHE CONTACT MAIRIE

  officeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  officeImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    marginRight: 15,
  },
  officeInfo: {
    flex: 1,
  },
  officeAddress: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  Address: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#093A3E",
  },
  officeContact: {
    fontSize: 14,
    color: "#666",
  },
  phone: {
    fontWeight: "bold",
  },
  hours: {
    fontWeight: "bold",
  },
});
