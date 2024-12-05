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
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: "#007BFF", // Bleu moderne
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: "center",
        justifyContent: "center",
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
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 30,
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
      button: {
        backgroundColor: "#007BFF", // Couleur de fond
        paddingVertical: 12, // Espacement vertical
        paddingHorizontal: 20, // Espacement horizontal
        borderRadius: 8, // Coins arrondis
      },
      buttonText: {
        color: "#fff", // Couleur du texte
        fontSize: 16, // Taille de la police
        fontWeight: "bold", // Texte en gras
        textAlign: "center", // Centrage du texte
      },
    
      nameText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
      },
      usernameText: {
        fontSize: 16,
        color: "#555",
      },
    
      sectionTitleProfil: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
      },
      fieldContainer: {
        marginBottom: 15,
      },
      label: {
        fontSize: 16,
        color: "#555",
        marginBottom: 5,
      },
      inputContainer: {
        flexDirection: "row", // Pour aligner l’icône à droite
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        paddingHorizontal: 10,
      },
      input: {
        flex: 1, // Prend tout l'espace sauf celui de l'icône
        height: 40,
      },
      icon: {
        marginLeft: 10,
      },
      inputDisabled: {
        backgroundColor: "#f9f9f9",
        color: "#888",
      },
      buttonProfil: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
      },
      buttonTextProfil: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
      },
});