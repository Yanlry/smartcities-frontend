// Chemin : components/ranking/TopUsersSection.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

// Color palette
const COLORS = {
  primary: {
    start: "#062C41",
    end: "#0b3e5a",
  },
  text: "#FFFFFC",
  accent: "red",
};

/**
 * User interface for top users display
 */
interface User {
  id: number;
  ranking: number;
  photo?: string;
  useFullName?: boolean;
  firstName?: string;
  lastName?: string;
  username?: string;
  voteCount?: number;
}

/**
 * Props for TopUsersSection component
 */
interface TopUsersSectionProps {
  topUsers: User[];
  onUserPress: (userId: number) => void;
}

/**
 * TopUsersSection displays the top 3 ranked users in a podium-style view
 */
const TopUsersSection: React.FC<TopUsersSectionProps> = ({ topUsers, onUserPress }) => {
  // Sort users by ranking
  const sortedUsers = [...topUsers].sort((a, b) => a.ranking - b.ranking);
  
  // Get users by position
  const firstPlace = sortedUsers.find(user => user.ranking === 1);
  const secondPlace = sortedUsers.find(user => user.ranking === 2);
  const thirdPlace = sortedUsers.find(user => user.ranking === 3);

  // Get user display name
  const getUserName = (user: User): string => {
    if (user.useFullName && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "Utilisateur";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podium</Text>
      <Text style={styles.subtitle}>Les meilleurs citoyens</Text>
      
      <View style={styles.podiumContainer}>
        {/* Second Place */}
        {secondPlace && (
          <View style={styles.podiumCol}>
            <TouchableOpacity 
              style={styles.userContainer}
              onPress={() => onUserPress(secondPlace.id)}
            >
              <LinearGradient 
                colors={['#bdc3c7', '#95a5a6']} 
                style={styles.crownSecond}
              >
                <FontAwesome5 name="crown" size={12} color="#ffffff" />
              </LinearGradient>
              
              <View style={[styles.photoContainer, styles.secondPhoto]}>
                <Image 
                  source={{ uri: secondPlace.photo || "https://via.placeholder.com/150" }}
                  style={styles.userPhoto}
                />
              </View>
              
              <Text style={styles.userName} numberOfLines={1}>
                {getUserName(secondPlace)}
              </Text>
              
              <View style={styles.scoreChip}>
                <Text style={styles.scoreText}>
                  {secondPlace.voteCount || 0} pts
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={[styles.podium, styles.secondPodium]}>
              <Text style={styles.position}>2</Text>
            </View>
          </View>
        )}
        
        {/* First Place */}
        {firstPlace && (
          <View style={styles.podiumCol}>
            <TouchableOpacity 
              style={styles.userContainer}
              onPress={() => onUserPress(firstPlace.id)}
            >
              <LinearGradient 
                colors={['#f39c12', '#f1c40f']} 
                style={styles.crownFirst}
              >
                <FontAwesome5 name="crown" size={16} color="#ffffff" />
              </LinearGradient>
              
              <View style={[styles.photoContainer, styles.firstPhoto]}>
                <Image 
                  source={{ uri: firstPlace.photo || "https://via.placeholder.com/150" }}
                  style={styles.userPhoto}
                />
              </View>
              
              <Text style={styles.userName} numberOfLines={1}>
                {getUserName(firstPlace)}
              </Text>
              
              <View style={styles.scoreChip}>
                <Text style={styles.scoreText}>
                  {firstPlace.voteCount || 0} pts
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={[styles.podium, styles.firstPodium]}>
              <Text style={styles.position}>1</Text>
            </View>
          </View>
        )}
        
        {/* Third Place */}
        {thirdPlace && (
          <View style={styles.podiumCol}>
            <TouchableOpacity 
              style={styles.userContainer}
              onPress={() => onUserPress(thirdPlace.id)}
            >
              <LinearGradient 
                colors={['#d35400', '#e67e22']} 
                style={styles.crownThird}
              >
                <FontAwesome5 name="crown" size={10} color="#ffffff" />
              </LinearGradient>
              
              <View style={[styles.photoContainer, styles.thirdPhoto]}>
                <Image 
                  source={{ uri: thirdPlace.photo || "https://via.placeholder.com/150" }}
                  style={styles.userPhoto}
                />
              </View>
              
              <Text style={styles.userName} numberOfLines={1}>
                {getUserName(thirdPlace)}
              </Text>
              
              <View style={styles.scoreChip}>
                <Text style={styles.scoreText}>
                  {thirdPlace.voteCount || 0} pts
                </Text>
              </View>
            </TouchableOpacity>
            
            <View style={[styles.podium, styles.thirdPodium]}>
              <Text style={styles.position}>3</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 20,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  podiumCol: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userContainer: {
    alignItems: 'center',
    marginBottom: 10,
    width: 80,
  },
  photoContainer: {
    padding: 2,
    borderRadius: 50,
    marginBottom: 8,
  },
  firstPhoto: {
    backgroundColor: '#f1c40f',
    padding: 3,
  },
  secondPhoto: {
    backgroundColor: '#bdc3c7',
    padding: 2,
  },
  thirdPhoto: {
    backgroundColor: '#e67e22',
    padding: 2,
  },
  userPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    width: 80,
    marginBottom: 4,
  },
  scoreChip: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 10,
    color: '#3498db',
    fontWeight: 'bold',
  },
  podium: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstPodium: {
    backgroundColor: '#f1c40f',
    width: 60,
    height: 70,
  },
  secondPodium: {
    backgroundColor: '#bdc3c7',
    width: 60,
    height: 55,
  },
  thirdPodium: {
    backgroundColor: '#e67e22',
    width: 60,
    height: 40,
  },
  position: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  crownFirst: {
    position: 'absolute',
    top: -12,
    padding: 4,
    borderRadius: 10,
    zIndex: 2,
  },
  crownSecond: {
    position: 'absolute',
    top: -8,
    padding: 3,
    borderRadius: 8,
    zIndex: 2,
  },
  crownThird: {
    position: 'absolute',
    top: -7,
    padding: 3,
    borderRadius: 7,
    zIndex: 2,
  },
});

export default TopUsersSection;