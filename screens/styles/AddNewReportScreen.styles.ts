import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  containerSecond: {
    width: '100%',
    height: '100%',
    padding: 5,
    marginTop:10
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
    borderColor: '#ccc',
    borderRadius: 30,
    padding: 15,
    paddingHorizontal:20,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: '100%',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingHorizontal:20,

  },
  locationButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 150,
    marginTop: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Écarte les boutons uniformément
  },
  rowButtonSearch: {
    flex: 1,
    flexDirection: 'row', // Aligne l'icône et le texte horizontalement
    justifyContent: 'center',
    backgroundColor: '#007BFF', // Bleu pour Rechercher
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginRight: 10, // Espace entre les deux boutons
    
  },
  rowButtonLocation: {
    flexDirection: 'row', // Aligne l'icône et le texte horizontalement
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFA500', // Orange pour Localiser moi
    padding: 10,
    borderRadius: 50,
    marginLeft: 10,
    width:'48%'
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
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
  map: {
    width: width - 32,
    height: height * 0.3,
    borderRadius: 10,
    marginBottom: 10,
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
});
