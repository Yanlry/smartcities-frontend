import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';

const initialPosts = [
  {
    id: '1',
    user: 'John Doe',
    avatar: 'https://example.com/avatar1.jpg',
    content: 'Bonjour à tous ! Quelqu\'un connaît un bon restaurant en ville ?',
    timestamp: 'Il y a 2 heures',
    likes: 5,
    comments: [
      { id: '1', user: 'Jane Smith', content: 'Oui, le restaurant "Le Gourmet" est excellent !' },
    ],
  },
  {
    id: '2',
    user: 'Jane Smith',
    avatar: 'https://example.com/avatar2.jpg',
    content: 'Il y a un marché fermier ce week-end. Venez nombreux !',
    timestamp: 'Il y a 5 heures',
    likes: 3,
    comments: [],
  },
  // Ajoutez plus de publications ici
];

export default function SocialScreen() {
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState('');

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleAddPost = () => {
    if (newPostContent.trim()) {
      const newPost = {
        id: (posts.length + 1).toString(),
        user: 'Current User',
        avatar: 'https://example.com/current_user_avatar.jpg',
        content: newPostContent,
        timestamp: 'À l\'instant',
        likes: 0,
        comments: [],
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.postContent}>
        <Text style={styles.userName}>{item.user}</Text>
        <Text style={styles.postText}>{item.content}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => handleLike(item.id)}>
            <Text style={styles.likeButton}>Like ({item.likes})</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.commentButton}>Comment ({item.comments.length})</Text>
          </TouchableOpacity>
        </View>
        {item.comments.length > 0 && (
          <View style={styles.commentsSection}>
            {item.comments.map((comment) => (
              <View key={comment.id} style={styles.commentContainer}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            ))}
          </View>
        )}
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
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:100,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  newPostContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  newPostInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    marginRight: 10,
  },
  newPostButton: {
    padding: 10,
    backgroundColor: '#6200ee',
    borderRadius: 30,
  },
  newPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postsList: {
    padding: 10,
  },
  postContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  postText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  likeButton: {
    marginRight: 20,
    color: '#6200ee',
  },
  commentButton: {
    color: '#6200ee',
  },
  commentsSection: {
    marginTop: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentText: {
    color: '#333',
  },
});