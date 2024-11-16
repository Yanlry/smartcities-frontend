import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
      },
      profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
      },
      profileImage: {
        width: 100,
        height: 130,
        borderRadius:10,
        marginRight: 20,
      },
      profileInfo: {
        flex: 1,
      },
      userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
      },
      userDetails: {
        fontSize: 14,
        color: '#666',
      },
      userStats: {
        fontWeight:'bold',
        fontSize: 14,
        marginVertical: 5,
        color:'#3498db'
      },
      userRanking: {
        fontSize: 14,
        color: '#999',
      },
      trustBadge: {
        backgroundColor: '#37323E',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 30,
        marginTop: 5,
      },
      trustBadgeText: {
        textAlign:'center',
        color: '#fff',
        fontWeight: 'bold',
      },
      smileyContainer: {
        marginLeft: 16,
      },
      smiley: {
        fontSize: 48,
        color: 'green',
      },
      sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
      signalementItem: {
        padding: 15, 
        paddingLeft:30,
        marginVertical: 10,
        borderRadius: 50, 
        borderWidth: 1,
      },
      signalementType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242', // Couleur du texte en blanc pour contraste
      },
      signalementDescription: {
        fontSize: 14,
        marginTop: 5,
        color: '#424242', // Texte blanc pour rester lisible sur les fonds colorés
      },
      horizontalScroll: {
        marginBottom: 20,
      },
      smarterItem: {
        width: 80,
        height: 80,
        marginRight: 15,
      },
      smarterImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
      },
     
      categoryItem: {
        width: 150,
        minHeight: 150,
        marginRight: 15,
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      },
      overlay: {
        ...StyleSheet.absoluteFillObject, // Remplit entièrement le conteneur parent
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Couleur avec opacité (noir à 50%)
      },
      categoryText: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginTop: 10,
        zIndex: 1, // Place le texte au-dessus de la superposition
      },
      featuredItem: {
        width: 150,
        minHeight: 150, // Remplacez height par minHeight pour permettre au conteneur de s'agrandir
        marginRight: 15,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff',
      },
      featuredImage: {
        width: '100%',
        height: 'auto', // Utilisez auto pour que l'image s'ajuste en fonction du texte
        aspectRatio: 1.5, // Vous pouvez définir un ratio pour que l'image conserve une forme cohérente
      },
      featuredTitle: {
        padding: 10,
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
      },
      calendarContainer: {
        marginVertical: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center', // Centre le contenu horizontalement
        overflow: 'hidden',
      },
    
      eventItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
      },
    
      eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
      },
    
      eventDetails: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
      },
    
      eventLocation: {
        fontSize: 14,
        color: '#888',
      },
    
      chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
      },
      infoContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
      },
    
      infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
      },
      infoCard: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
      },
      infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 10,
        marginTop: 15,
      },
      infoContent: {
        fontSize: 14,
        color: '#333',
        marginBottom: 15,
        lineHeight: 20,
      },
      infoLabel: {
        fontWeight: 'bold',
        color: '#666',
      },
      mayorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
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
      mayor:{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom:5
      },
      mayorName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
      },
      mayorSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
      },
      mayorContact: {
        fontSize: 16,
        color: '#333',
        marginTop: 10,
      },
      contactBold: {
        fontWeight: 'bold',
      },
      officeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
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
        color: '#333',
        marginBottom: 10,
      },
      Address:{
        fontSize: 18,
        fontWeight:'bold',
        color: '#3498db',
      },
      officeContact: {
        fontSize: 14,
        color: '#666',
      },
      phone:{
        fontWeight:'bold'
      },
      hours:{
        fontWeight:'bold',
      },
});
