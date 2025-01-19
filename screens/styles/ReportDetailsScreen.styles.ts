import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Fond blanc pour une apparence propre
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#093A3E", // Couleur sombre
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  headerTitle: {
    fontSize: 20,
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#093A3E', // Couleur dorée ou autre
    backgroundColor: '#F7F2DE',
    letterSpacing:2,
    fontWeight: 'bold',
    fontFamily: 'Insanibc', // Utilisez le nom de la police que vous avez défini
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginHorizontal: 5, // Espacement entre les icônes
  },
  typeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  mapContainer: {
    height: 350,
    backgroundColor: "#f4f4f4", // Ajout d'un fond clair autour de la carte
    overflow: "hidden", // Assurez-vous que la carte reste à l'intérieur des bordures
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  titleContainer: {
    position: "absolute", // Superposé à la carte
    top: 20, // Positionné en haut
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fond semi-transparent
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonsContainer: {
    position: "absolute", // Superposition des boutons
    bottom: 20, // Position en bas de l'écran
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voteSection: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  votePrompt: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 15,
  },
  voteContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fond transparent
  },
  titleVotes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fond transparent
  },
  upVoteButton: {
    marginRight: 10,
  },
  downVoteButton: {
    marginLeft: 10,
  },
  voteTextUp: {
    color: "#57A773",
    fontSize: 16,
    marginLeft: 8,
  },
  voteTextDown: {
    color: "#ff4d4f",
    fontSize: 16,
    marginLeft: 8,
  },
  commentContainer: {
    marginTop: 5,
    padding: 10,
    backgroundColor: "#F2F4F7",
    borderRadius: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  replyButton: {
    marginTop: 5,
  },
  replyButtonText: {
    color: "#007bff",
    fontSize: 12,
  },
  replyInputContainer: {
    marginTop: 10,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  submitReplyButton: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  submitReplyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  zoomPosition: {
    position: "absolute",
    bottom: 20,
    right: 10,
    backgroundColor: "#3185FC",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomPositionText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  zoomReport: {
    position: "absolute",
    bottom: 20,
    left: 10,
    backgroundColor: "#E84855",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomReprotText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    backgroundColor: "#F3F5F7",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    margin: 5 ,
    marginHorizontal: 10,

  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 10,

    borderRadius: 15,
    margin: 5,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardComment: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    margin: 5,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 50,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginTop: 10,
  },
  detailCardPhoto: {
    backgroundColor: "#fff",
    marginHorizontal: 10,

    borderRadius: 15,
    padding: 16,
    margin: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  detailContainer: {
    backgroundColor: "#F3F5F7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 4,
  }, 
  detailLabelInfo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 14,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  photoContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  photosScrollView: {
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  
  photo: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
    marginTop: 10,
  },
  noPhotosText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPhoto: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',   // Pour positionner le bouton au-dessus du contenu
    top: 50,                // Décalage par rapport au haut du conteneur
    right: 20,              // Décalage par rapport à la droite du conteneur
    backgroundColor: '#FF3B30', // Couleur de fond (rouge pour "fermer")
    width: 40,              // Largeur du bouton
    height: 40,             // Hauteur du bouton
    borderRadius: 20,       // Rendre le bouton circulaire
    justifyContent: 'center', // Centrer le contenu verticalement
    alignItems: 'center',     // Centrer le contenu horizontalement
    shadowColor: '#000',     // Ombre pour donner de la profondeur
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,            // Ombre pour Android
  },
  closeButtonText: {
    color: '#FFFFFF',        // Couleur du texte
    fontSize: 18,            // Taille de la croix
    fontWeight: 'bold',      // Texte en gras
  },
});