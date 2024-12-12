import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  userRanking: {
    fontSize: 14,
    color: "#999",
  },
  trustBadge: {
    backgroundColor: "#37323E",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 30,
    marginTop: 5,
  },
  trustBadgeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  smileyContainer: {
    marginLeft: 16,
  },
  smiley: {
    fontSize: 48,
    color: "green",
  },
  reportItem: {
    padding: 15,
    paddingLeft: 30,
    marginVertical: 5,
    borderRadius: 50,
  },
  reportType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#424242", // Couleur du texte en blanc pour contraste
  },
  reportTitle: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "500",
    color: "#424242", // Texte blanc pour rester lisible sur les fonds colorés
  },
  reportCity: {
    fontSize: 14,
    marginTop: 5,
    fontWeight: "500",
    color: "#424242", // Texte blanc pour rester lisible sur les fonds colorés
  },
  smarterItem: {
    alignItems: "center",
    padding: 10,
    width: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 10,
  },
  seeAllButton: {
    backgroundColor: "#2c3e50", // Couleur accentuée (orange-rouge)
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 90,
    margin: 35,
    width: 100,
    height: 100,
    marginHorizontal: 10,
  },
  seeAllText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  smarterImage: {
    width: 100,
    height: 100,
    borderRadius: 90,
    marginBottom: 10,
    marginTop: 5,
    borderColor: "#ddd",
  },
  username: {
    fontSize: 19,
    fontWeight: "600",
    color: "#555",
    textAlign: "center",
  },
  rankNumber: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#ff6347", // Couleur accentuée (orange-rouge)
  },
  categoryItem: {
    width: 150,
    minHeight: 150,
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Remplit entièrement le conteneur parent
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Couleur avec opacité (noir à 50%)
  },
  featuredItem: {
    width: 150,
    minHeight: 150, // Remplacez height par minHeight pour permettre au conteneur de s'agrandir
    marginRight: 15,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  featuredImage: {
    width: "100%",
    height: "auto", // Utilisez auto pour que l'image s'ajuste en fonction du texte
    aspectRatio: 1.5, // Vous pouvez définir un ratio pour que l'image conserve une forme cohérente
  },
  featuredTitle: {
    padding: 10,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
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
    color: "#11998e",
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
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
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
  mayorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  mayorInfo: {
    flex: 1,
  },
  mayor: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
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
  },
  officeCard: {
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
  officeImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
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
    color: "#3498db",
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Couleur de fond douce
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // Texte gris foncé
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fond semi-transparent
    paddingHorizontal: 20, // Espacement pour éviter que le contenu ne touche les bords
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff", // Blanc pour contraster avec le fond
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#ddd", // Texte légèrement gris pour une bonne lisibilité
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24, // Espacement des lignes pour plus de lisibilité
  },
  button: {
    backgroundColor: "#1E90FF", // Bleu vif
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2, // Ombre pour donner un effet de profondeur (Android uniquement)
    shadowColor: "#000", // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#fff", // Texte blanc pour contraster avec le bouton
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoryButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  categoryButton: {
    width: 120, // Largeur fixe
    height: 120, // Hauteur fixe
    marginTop: 10,
    justifyContent: "center", // Centrer le contenu verticalement
    alignItems: "center", // Centrer le contenu horizontalement
    marginRight: 10, // Espacement entre les boutons
    borderRadius: 90, // Coins arrondis
  },
  categoryIcon: {
    marginBottom: 5, // Espacement entre l'icône et le texte
  },
  categoryText: {
    color: "#fff", // Texte blanc
    fontSize: 16, // Taille de la police du texte
    fontWeight: "bold", // Texte en gras
  },
  containerFollower: {
    flex: 1,
    backgroundColor: "#f7f8fa", // Light gray for a soft look
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  followerList: {
    paddingBottom: 20, // Space at the bottom
  },
  followerItem: {
    flexDirection: "row", // Align image and text horizontally
    alignItems: "center",
    backgroundColor: "#fff", // White background for contrast
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 1,
    borderRadius: 90, // Rounded corners for a modern look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1, // Elevation for Android
  },
  followerImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 12, // Space between image and text
    borderWidth: 1,
    borderColor: "#ddd", // Soft border for definition
  },
  followerTextContainer: {
    flex: 1,
  },
  followerName: {
    fontSize: 16,
    fontWeight: "600", // Slightly bold for importance
    color: "#444", // Dark gray for subtle contrast
  },
  backButton: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#2c3e50", // Primary blue
    borderRadius: 30,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff", // White text for contrast
    textTransform: "uppercase", // Button style text
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  rankingText: {
    fontSize: 16,
    marginRight: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007BFF",
    alignItems: "center",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  noReportsText: {
    textAlign: "center",
    color: "#888",
    marginVertical: 20,
  },
  profileContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  noProfileImageText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  userDetails: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  userStats: {
    fontSize: 16,
    color: "#1E90FF",
    fontWeight: "bold",
    marginTop: 10,
  },
  modalContentRanking: {
    backgroundColor: "white",
    padding: 20,
    paddingVertical: 80,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // Pour Android
  },
  rankingItemModal: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
    marginHorizontal: 8,
    padding: 16,
    borderRadius: 190,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Pour Android
  },
  rankingTextModal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
    marginHorizontal: 8,
  },
  userImageModal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#5a67d8",
  },
  closeButtonModal: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#5a67d8",
    shadowColor: "#5a67d8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    borderRadius: 30,
   
  },
  closeButtonTextModal: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row", // Met sur la même ligne
    alignItems: "center", // Centre les éléments verticalement
    justifyContent: "space-between", // Espace entre les éléments
    marginVertical: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rankingButton: {
    backgroundColor: "#5a67d8",
    shadowColor: "#5a67d8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  rankingButtonContent: {
    alignItems: "center", // Centre le texte principal et le sous-texte
  },
  rankingMainText: {
    marginTop: 3,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff", // Texte blanc
  },
  rankingSubText: {
    fontSize: 8,
    color: "#d9ffe2", // Texte légèrement plus clair
  },
  votesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    flex: 1, // Permet d'occuper l'espace restant
    marginLeft: 15, // Séparation entre le bouton et les votes
  },
  voteSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  voteItem: {
    width: 60, // Assurez-vous que largeur et hauteur sont égales
    height: 60,
    flexDirection: "row", // Change l'alignement interne pour centrer verticalement et horizontalement
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30, // Moitié de la largeur/hauteur pour obtenir un cercle parfait
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal: 5,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  noVotesText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
