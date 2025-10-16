import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get('window');


export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
      paddingBottom: 15,
      paddingHorizontal: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#FFFFFF',
      flex: 1,
      textAlign: 'center',
    },
    shareButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
    },
    headerRight: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 16,
      marginBottom: 8,
    },
    errorText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    retryButton: {
      backgroundColor: '#062C41',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 16,
    },
    postContainer: {
      backgroundColor: '#FFFFFF',
      margin: 16,
      borderRadius: 12,
      padding: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    authorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    authorAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#E0E0E0',
    },
    authorInfo: {
      flex: 1,
      marginLeft: 12,
    },
    authorName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 2,
    },
    postDate: {
      fontSize: 12,
      color: '#999',
    },
    postContent: {
      marginBottom: 16,
    },
    postText: {
      fontSize: 16,
      color: '#555',
      lineHeight: 22,
    },
    photosContainer: {
      marginBottom: 16,
    },
    postPhoto: {
      width: width * 0.7,
      height: 200,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: '#E0E0E0',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      paddingTop: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    actionText: {
      marginLeft: 6,
      fontSize: 14,
      color: '#666',
      fontWeight: '500',
    },
    likedText: {
      color: '#FF5252',
    },
  });