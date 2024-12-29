import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
// @ts-ignore
import { API_URL } from '@env';

export default function SocialScreen() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les publications depuis le backend
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/posts`); // Endpoint pour lister les publications
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des publications');
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de charger les publications.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Erreur lors du like de la publication');
      }
      fetchPosts(); // Recharge les publications pour mettre à jour les likes
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible d\'aimer la publication.');
    }
  };

  const handleAddPost = async () => {
    if (newPostContent.trim()) {
      try {
        const response = await fetch(`${API_URL}/posts`, { // Correction ici
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newPostContent,
            authorId: 1, // Remplacez par l'ID de l'utilisateur connecté
          }),
        });
        if (!response.ok) {
          throw new Error('Erreur lors de la création de la publication');
        }
        setNewPostContent('');
        fetchPosts(); // Recharge les publications après ajout
      } catch (error) {
        Alert.alert('Erreur', error.message || 'Impossible de créer la publication.');
      }
    }
  };

const renderItem = ({ item }) => (
  <View style={styles.postContainer}>
    <Image
      source={{ uri: item.profilePhoto || 'https://via.placeholder.com/150' }}
      style={styles.avatar}
    />
    <View style={styles.postContent}>
      <Text style={styles.userName}>{item.authorName}</Text>
      <Text style={styles.postTitle}>{item.title}</Text> {/* Affiche le titre */}
      <Text style={styles.postText}>{item.content}</Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity onPress={() => handleLike(item.id)}>
          <Text style={styles.likeButton}>Like ({item.likesCount || 0})</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.commentButton}>Comment ({item.comments?.length || 0})</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Réseau Social de Ville</Text>
      </View>
      <View style={styles.newPostContainer}>
        <TextInput
          style={styles.newPostInput}
          placeholder="Quoi de neuf ?"
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <TouchableOpacity style={styles.newPostButton} onPress={handleAddPost}>
          <Text style={styles.newPostButtonText}>Publier</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>Chargement des publications...</Text>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.postsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 150,
  },
  header: {
    padding: 15,
    backgroundColor: '#3b5998',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newPostContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  newPostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  newPostButton: {
    backgroundColor: '#29524A',
    padding: 10,
    borderRadius: 5,
  },
  newPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  postContent: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postText: {
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likeButton: {
    color: '#29524A',
    fontWeight: 'bold',
  },
  commentButton: {
    color: '#777',
  },
  commentsSection: {
    marginTop: 10,
  },
  commentContainer: {
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentText: {
    marginLeft: 5,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  postsList:{
    flexGrow: 1,
  }
});