import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    width: '100%',
  },
  containerSecond: {
    height: '100%',
    padding: 5,
    marginTop:10,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  }, 
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 30,
    padding: 15,
    height:55,
    paddingHorizontal:20,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: '100%', // Empêche l'élargissement
    overflow: 'hidden', // Cache le contenu trop long
    color: '#c7c7c7',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingHorizontal:20,
  },



  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    alignSelf: 'center',
    width: '100%',
    maxWidth: '100%', 
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 30,
    backgroundColor: '#fff',
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



  modalContent: {
    backgroundColor: '#fff',
    width: '90%', // Largeur du modal
    borderRadius: 30,
    padding: 20,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  closeModalButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 30,
    marginTop: 10,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Espace uniforme entre les boutons
    alignItems: 'center', // Centre les boutons verticalement
    width: '95%', // Le conteneur occupe 90% de l'espace disponible
    alignSelf: 'center', // Centre horizontalement le conteneur
  },
  rowButtonSearch: {
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
    borderRadius: 50,
    width:'47%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    width: '95%',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fond semi-transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  
});
