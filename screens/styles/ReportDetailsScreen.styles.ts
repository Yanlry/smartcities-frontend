
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingTop: 50,
      marginBottom: 10,
    },
    typeBadge: {
      flexDirection: "row",
      alignItems: "center",
    },
    typeText: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#333",
      paddingHorizontal: 15,
    },
    icon: {
      width: 40,
      height: 40,
      marginRight: 5,
    },
    backButton: {
      padding: 5,
    },
    mapContainer: {
      height: 500, // Donne à la carte une hauteur spécifique
    },
    map: {
      flex: 1,
    },
    zoomPosition: {
      position: "absolute",
      bottom: 20,
      right: 5, // Position à droite
      backgroundColor: "#3185FC",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      elevation: 5,
      width: "45%",
      justifyContent: "center", // Centre le texte verticalement
      alignItems: "center", // Centre le texte horizontalement
    },
    zoomPositionText: {
      color: "#FFF",
      fontSize: 12, // Ajusté pour correspondre à la taille du bouton
      fontWeight: "bold",
    },
    zoomReport: {
      position: "absolute",
      bottom: 20,
      left: 5, // Position à gauche
      backgroundColor: "#E84855",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      elevation: 5,
      width: "45%",
      justifyContent: "center", // Centre le texte verticalement
      alignItems: "center", // Centre le texte horizontalement
    },
    zoomReprotText: {
      color: "#FFF",
      fontSize: 12, // Ajusté pour correspondre à la taille du bouton
      fontWeight: "bold",
    },
    content: {
      marginTop: 16,
      backgroundColor: "#f4f4f9",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: 30,
      marginBottom: 12,
      marginHorizontal: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      color: "#333",
    },
    stateReport: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    upContainer: {
    },
    downContainer: {
    },
    description: {
      fontSize: 16,
      color: "#555",
      lineHeight: 22,
    },
    detailCard: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 16,
      margin: 16,
      elevation: 2,
    },
    detailContainer: {
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#555',
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      color: '#333',
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
  
    detailsVoteContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 30,
      backgroundColor: "#fff",
      width: "90%",
      justifyContent: "center",
    },
    voteContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      gap: 16,
    },
    voteButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 20,
      minWidth: 150,
      alignItems: 'center',
    },
    upVoteButton: {
      backgroundColor: '#B8E0C3',
    },
    downVoteButton: {
      backgroundColor: '#F29A91',
    },
    voteText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    voteStatus: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#666',
    },
    alreadyVoted: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#333",
    },
    voteButtons: {
    },
  });
  