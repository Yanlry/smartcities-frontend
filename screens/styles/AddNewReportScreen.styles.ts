import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 15,
    color: '#333',
    marginLeft: 20,
  }, 
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    alignSelf: 'center',
    width: '100%',
    maxWidth: '95%', 
    padding: 15,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',

  },
  dropdownText: {
    width: '85%',
    fontSize: 14,
    color: '#c7c7c7',
    paddingLeft: 10,
  },
  selectedCategory: {
  color: '#666',
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#007BFF',
  },
  modalOverlayCategorie: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentCategorie: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  card: {
    backgroundColor: '#f9f9f9',
    marginBottom: 25,
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedCard: {
    backgroundColor: '#e0f7ff',
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 30,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Espace uniforme entre les boutons
    alignItems: 'center', // Centre les boutons verticalement
    width: '95%', // Le conteneur occupe 90% de l'espace disponible
    alignSelf: 'center', // Centre horizontalement le conteneur
  },
  rowButtonMap: {
    width:'47%',
    flexDirection: 'row', // Icône et texte alignés horizontalement
    justifyContent: 'center', // Centrage horizontal à l'intérieur du bouton
    alignItems: 'center', // Centrage vertical à l'intérieur du bouton
    backgroundColor: '#007BFF', // Bleu pour "Rechercher"
    padding: 10,
    borderRadius: 50,
  },
  rowButtonLocation: {
    flexDirection: 'row', // Icône et texte alignés horizontalement
    justifyContent: 'center', // Centrage horizontal à l'intérieur du bouton
    alignItems: 'center', // Centrage vertical à l'intérieur du bouton
    backgroundColor: '#FFA500', // Orange pour "Localiser moi"
    padding: 10,
    paddingVertical:10,
    borderRadius: 50,
    width:'47%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft:5

  },

  selectedIconContainer: {
    alignItems: 'center',
    paddingBottom : 10,
  },
  iconLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  selectedIconLabel: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#38A83C',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginVertical: 10,
  },
  buttonMap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    height: 80,
    borderRadius: 5,
    marginVertical: 10,
  },
  mapButtonText: {
    color: 'white',
    marginLeft: 10,
  },
  closeButtonMap: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
    borderRadius: 5,
  },
  closeButtonTextMap: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 25,
  },

   containerSecond: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 15,
    color: '#333',
  },
  inputTitle: {
    flex: 1, // Permet au champ d'occuper l'espace disponible
    height: 50, // Hauteur fixe (peut être ajustée)
    maxHeight: 50, // Empêche l'agrandissement vertical
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    overflow: 'hidden', // Empêche le débordement
  },
  input: {
  flex: 1, // Permet au champ d'occuper l'espace disponible
  height: 50, // Hauteur fixe (peut être ajustée)
  maxHeight: 100, // Empêche l'agrandissement vertical
  backgroundColor: '#f5f5f5',
  borderRadius: 30,
  paddingVertical: 10, // Ajustez en fonction de votre design
  paddingHorizontal: 15,
  fontSize: 16,
  color: '#333',
  overflow: 'hidden', // Empêche le débordement
},

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Espacement avec l'élément suivant
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10, // Espace entre le champ et le bouton
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    height : '50%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  closeModalButton: {
    marginTop: 10,
    alignSelf: 'center',
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
