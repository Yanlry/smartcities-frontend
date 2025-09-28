// Chemin : frontend/screens/PostDetailsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useToken } from '../hooks/auth/useToken';
// @ts-ignore
import { API_URL } from '@env';

const { width, height } = Dimensions.get('window');

// Interface selon la vraie structure de votre API
interface PostData {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByUser: boolean;
  authorId: number;
  authorName: string;
  profilePhoto: string;
  photos: Array<{
    id: number;
    url: string;
  }>;
  comments: any[];
}

interface PostDetailsScreenProps {
  route: {
    params: {
      postId: number;
    };
  };
  navigation: any;
}

export default function PostDetailsScreen({ route, navigation }: PostDetailsScreenProps) {
  const { getToken, getUserId } = useToken();
  const { postId } = route.params;

  // États locaux
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);

  console.log('📱 PostDetailsScreen monté avec postId:', postId);

  // Fonction pour récupérer les détails du post
  const fetchPostDetails = useCallback(async () => {
    try {
      console.log('🔍 Récupération des détails du post:', postId);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const response = await fetch(`${API_URL}/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Réponse API posts:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Publication non trouvée');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la récupération du post');
      }

      const postData: PostData = await response.json();
      
      console.log('✅ Post récupéré - ID:', postData.id);
      console.log('👤 Auteur:', postData.authorName);
      console.log('💖 Liké par utilisateur:', postData.likedByUser);
      console.log('📊 Nombre de likes:', postData.likesCount);
      
      setPost(postData);
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la récupération du post:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [postId, getToken]);

  // Chargement initial
  useEffect(() => {
    fetchPostDetails();
  }, [postId]);

  // Fonction pour rafraîchir
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPostDetails();
  }, [fetchPostDetails]);

  // FONCTION CORRIGÉE : Logique simplifiée qui se base uniquement sur l'état du post
  const handleLike = useCallback(async () => {
    if (!post || isLiking) return;

    try {
      setIsLiking(true);
      
      const userId = await getUserId();
      if (!userId) {
        console.error('Impossible de récupérer l\'ID utilisateur.');
        return;
      }

      // CORRECTION : Capture l'état actuel AVANT la requête
      const wasLiked = post.likedByUser;
      const currentLikesCount = post.likesCount;

      console.log('🔄 Avant like - Était liké:', wasLiked, 'Likes:', currentLikesCount);

      // Mise à jour optimiste IMMÉDIATE
      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          likedByUser: !wasLiked, // Inverse l'état actuel
          likesCount: wasLiked ? currentLikesCount - 1 : currentLikesCount + 1
        };
      });

      // Ensuite, envoyer la requête au serveur
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        // CORRECTION : En cas d'erreur, remettre l'état d'origine
        setPost(prevPost => {
          if (!prevPost) return null;
          return {
            ...prevPost,
            likedByUser: wasLiked, // Remettre l'état d'origine
            likesCount: currentLikesCount // Remettre le nombre d'origine
          };
        });
        throw new Error('Erreur lors du like de la publication');
      }

      console.log('✅ Like mis à jour avec succès');

    } catch (error: any) {
      console.error('❌ Erreur toggle like:', error.message);
      Alert.alert('Erreur', 'Impossible de mettre à jour le like');
    } finally {
      setIsLiking(false);
    }
  }, [post, postId, getUserId, isLiking]);

  // Fonction pour partager le post
  const sharePost = useCallback(async () => {
    if (!post) return;

    try {
      await Share.share({
        message: `Découvrez cette publication : "${post.content}" par ${post.authorName} sur SmartCities`,
        url: `smartcities://post/${postId}`,
      });
    } catch (error) {
      console.error('❌ Erreur partage:', error);
    }
  }, [post, postId]);

  // Fonction pour naviguer vers le profil de l'auteur
  const navigateToAuthorProfile = useCallback(() => {
    if (post?.authorId) {
      navigation.navigate('UserProfileScreen', { userId: post.authorId });
    }
  }, [post, navigation]);

  // Fonction pour retourner en arrière
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Écran de chargement
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#062C41" />
        
        <LinearGradient
          colors={['#062C41', '#0F3460']}
          style={styles.header}
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publication</Text>
          <View style={styles.headerRight} />
        </LinearGradient>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#062C41" />
          <Text style={styles.loadingText}>Chargement de la publication...</Text>
        </View>
      </View>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#062C41" />
        
        <LinearGradient
          colors={['#062C41', '#0F3460']}
          style={styles.header}
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
          <View style={styles.headerRight} />
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF5252" />
          <Text style={styles.errorTitle}>Oups !</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPostDetails}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Vérification que le post existe
  if (!post) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#062C41" />
        
        <LinearGradient
          colors={['#062C41', '#0F3460']}
          style={styles.header}
        >
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Publication</Text>
          <View style={styles.headerRight} />
        </LinearGradient>

        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={60} color="#999" />
          <Text style={styles.errorTitle}>Aucune donnée</Text>
          <Text style={styles.errorText}>La publication semble vide.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPostDetails}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Écran principal
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#062C41" />
      
      {/* Header avec actions */}
      <LinearGradient
        colors={['#062C41', '#0F3460']}
        style={styles.header}
      >
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publication</Text>
        <TouchableOpacity onPress={sharePost} style={styles.shareButton}>
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#062C41']}
            tintColor="#062C41"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.postContainer}>
          {/* Informations de l'auteur */}
          <TouchableOpacity 
            style={styles.authorContainer}
            onPress={navigateToAuthorProfile}
            activeOpacity={0.7}
          >
            <Image
              source={{ 
                uri: post.profilePhoto || 'https://via.placeholder.com/150' 
              }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {post.authorName || 'Utilisateur inconnu'}
              </Text>
              <Text style={styles.postDate}>
                {formatDate(post.createdAt)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#A0A0A0" />
          </TouchableOpacity>

          {/* Contenu du post */}
          <View style={styles.postContent}>
            <Text style={styles.postText}>{post.content}</Text>
          </View>

          {/* Photos du post */}
          {post.photos && post.photos.length > 0 && (
            <ScrollView 
              horizontal 
              style={styles.photosContainer}
              showsHorizontalScrollIndicator={false}
            >
              {post.photos.map((photo, index) => (
                <Image
                  key={photo?.id || index}
                  source={{ uri: photo?.url || 'https://via.placeholder.com/200' }}
                  style={styles.postPhoto}
                />
              ))}
            </ScrollView>
          )}

          {/* Actions du post - CORRIGÉES */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
              disabled={isLiking}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={post.likedByUser ? "heart" : "heart-outline"} // CORRECTION : Se base uniquement sur post.likedByUser
                size={22} 
                color={post.likedByUser ? "#FF5252" : "#666"} 
              />
              <Text style={[
                styles.actionText, 
                post.likedByUser && styles.likedText // CORRECTION : Se base uniquement sur post.likedByUser
              ]}>
                {post.likesCount} J'aime
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.actionText}>{post.comments.length} Commentaires</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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