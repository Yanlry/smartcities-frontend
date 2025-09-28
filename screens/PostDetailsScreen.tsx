// Chemin : frontend/screens/PostDetailsScreen.tsx

import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import du modal de signalement
import PostReportModal from '../components/interactions/ReportDetails/PostReportModal';

const { width } = Dimensions.get('window');

/**
 * Interface pour les paramètres de navigation de l'écran
 */
interface PostDetailsScreenParams {
  postId?: string;
  postAuthor?: string;
  postTitle?: string;
  showReportModal?: boolean;
}

/**
 * Props de navigation pour l'écran PostDetails
 * Compatible avec React Navigation Stack Navigator
 */
interface PostDetailsScreenProps {
  navigation: StackNavigationProp<any, 'PostDetailsScreen'>;
  route: RouteProp<{ PostDetailsScreen: PostDetailsScreenParams }, 'PostDetailsScreen'>;
}

/**
 * Interface pour les données d'un post
 */
interface PostData {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

/**
 * Hook personnalisé pour la gestion des données du post
 */
const usePostData = (postId?: string, postTitle?: string, postAuthor?: string) => {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostData = useCallback(async () => {
    if (!postId) {
      setError("ID de post manquant");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: Remplacer par votre appel API réel
      // const response = await fetch(`${API_URL}/posts/${postId}`);
      // const data = await response.json();
      
      // Simulation de données pour l'exemple
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: PostData = {
        id: postId,
        title: postTitle || "Titre du post",
        content: "Contenu du post à afficher ici. Ce sera remplacé par les vraies données de votre API.",
        author: postAuthor || "Utilisateur inconnu",
        createdAt: new Date().toISOString(),
        likes: 42,
        comments: 7,
        isLiked: false,
      };
      
      setPostData(mockData);
    } catch (err: any) {
      console.error('Erreur lors du chargement du post:', err);
      setError(err.message || "Erreur lors du chargement du post");
    } finally {
      setLoading(false);
    }
  }, [postId, postTitle, postAuthor]);

  return { postData, loading, error, fetchPostData };
};

/**
 * Hook personnalisé pour la gestion du modal de signalement
 */
const useReportModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  const openModal = useCallback(() => setIsVisible(true), []);
  const closeModal = useCallback(() => setIsVisible(false), []);

  return { isVisible, openModal, closeModal };
};

/**
 * PostDetailsScreen - Écran principal de détails d'un post
 * Architecture optimisée avec séparation des responsabilités
 * Compatible avec React Navigation
 */
const PostDetailsScreen: React.FC<PostDetailsScreenProps> = memo(
  ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    
    // Extraction des paramètres de navigation
    const { 
      postId, 
      postAuthor, 
      postTitle, 
      showReportModal = false 
    } = route.params || {};

    // Hooks personnalisés pour la gestion d'état
    const { postData, loading, error, fetchPostData } = usePostData(postId, postTitle, postAuthor);
    const { isVisible: isReportModalVisible, openModal: openReportModal, closeModal: closeReportModal } = useReportModal();

    /**
     * Chargement initial des données
     */
    useEffect(() => {
      fetchPostData();
    }, [fetchPostData]);

    /**
     * Ouverture automatique du modal si demandé via navigation
     */
    useEffect(() => {
      if (showReportModal) {
        openReportModal();
      }
    }, [showReportModal, openReportModal]);

    /**
     * Gestion de l'envoi du signalement avec feedback utilisateur optimisé
     */
    const handleSendReport = useCallback(async (reportReason: string, reportType: string) => {
      try {
        // TODO: Remplacer par votre appel API réel
        const reportData = {
          postId,
          reason: reportReason,
          type: reportType,
          reportedBy: "current_user_id", // À remplacer par l'ID de l'utilisateur actuel
          timestamp: new Date().toISOString(),
        };
        
        console.log('Données de signalement:', reportData);
        
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Fermeture du modal et feedback positif
        closeReportModal();
        
        Alert.alert(
          "Signalement envoyé",
          "Merci de contribuer à la sécurité de notre communauté. Notre équipe examinera ce contenu rapidement.",
          [
            { 
              text: "Retour à l'accueil", 
              onPress: () => navigation.navigate("Main"),
              style: "default"
            },
            { 
              text: "Rester ici", 
              style: "cancel"
            }
          ]
        );
      } catch (error: any) {
        console.error('Erreur lors de l\'envoi du signalement:', error);
        
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de l'envoi du signalement. Veuillez réessayer.",
          [{ text: "Réessayer", style: "default" }]
        );
      }
    }, [postId, navigation, closeReportModal]);

    /**
     * Gestion du bouton retour avec confirmation si modal ouvert
     */
    const handleBackPress = useCallback(() => {
      if (isReportModalVisible) {
        Alert.alert(
          "Fermer le signalement ?",
          "Votre signalement en cours sera perdu.",
          [
            { text: "Continuer", style: "cancel" },
            { 
              text: "Fermer", 
              style: "destructive", 
              onPress: () => {
                closeReportModal();
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        navigation.goBack();
      }
    }, [isReportModalVisible, navigation, closeReportModal]);

    /**
     * Gestion des actions sur le post (like, partage, etc.)
     */
    const handleLikePress = useCallback(() => {
      // TODO: Implémenter la logique de like
      console.log('Like pressed for post:', postId);
    }, [postId]);

    const handleCommentPress = useCallback(() => {
      // TODO: Naviguer vers les commentaires
      console.log('Comment pressed for post:', postId);
    }, [postId]);

    const handleSharePress = useCallback(() => {
      // TODO: Implémenter le partage
      console.log('Share pressed for post:', postId);
    }, [postId]);

    /**
     * Rendu de l'état de chargement
     */
    if (loading) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Chargement du post...</Text>
          </View>
        </SafeAreaView>
      );
    }

    /**
     * Rendu de l'état d'erreur
     */
    if (error || !postData) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Erreur de chargement</Text>
            <Text style={styles.errorText}>
              {error || "Impossible de charger les détails du post"}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchPostData}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        {/* Header optimisé avec dégradé */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {postData.title}
            </Text>
            <Text style={styles.headerSubtitle}>
              Par {postData.author}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={openReportModal}
            activeOpacity={0.7}
            hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
          >
            <Ionicons name="flag" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Contenu principal */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Informations du post */}
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <View style={styles.authorContainer}>
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#667eea" />
                </View>
                <View>
                  <Text style={styles.authorName}>{postData.author}</Text>
                  <Text style={styles.postDate}>
                    {new Date(postData.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.postTitle}>{postData.title}</Text>
            <Text style={styles.postContent}>{postData.content}</Text>

            {/* Actions du post */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, postData.isLiked && styles.actionButtonLiked]}
                onPress={handleLikePress}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={postData.isLiked ? "heart" : "heart-outline"} 
                  size={20} 
                  color={postData.isLiked ? "#FF6B6B" : "#7D91A7"} 
                />
                <Text style={[
                  styles.actionText,
                  postData.isLiked && styles.actionTextLiked
                ]}>
                  {postData.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleCommentPress}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#7D91A7" />
                <Text style={styles.actionText}>{postData.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleSharePress}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#7D91A7" />
                <Text style={styles.actionText}>Partager</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section commentaires (placeholder) */}
          <View style={styles.commentsContainer}>
            <Text style={styles.sectionTitle}>Commentaires ({postData.comments})</Text>
            <View style={styles.commentPlaceholder}>
              <Text style={styles.placeholderText}>
                Section commentaires à implémenter
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Modal de signalement */}
        <PostReportModal
          isVisible={isReportModalVisible}
          onClose={closeReportModal}
          onSendReport={handleSendReport}
          postId={postData.id}
          postAuthor={postData.author}
          postTitle={postData.title}
        />
      </SafeAreaView>
    );
  }
);

PostDetailsScreen.displayName = 'PostDetailsScreen';

/**
 * Styles optimisés avec système de design cohérent
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  
  // États de chargement et d'erreur
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7D91A7',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#7D91A7',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Contenu principal
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
    color: '#7D91A7',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    lineHeight: 28,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    color: '#465670',
    lineHeight: 24,
    marginBottom: 20,
  },

  // Actions du post
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 16,
  },
  actionButtonLiked: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  actionText: {
    fontSize: 14,
    color: '#7D91A7',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionTextLiked: {
    color: '#FF6B6B',
  },

  // Section commentaires
  commentsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  commentPlaceholder: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#7D91A7',
    textAlign: 'center',
  },
});

// Export par défaut pour React Navigation
export default PostDetailsScreen;