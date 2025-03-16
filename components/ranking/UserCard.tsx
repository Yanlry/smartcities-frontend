// Chemin : components/ranking/UserCard.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
 * User interface for UserCard component
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
 * Props interface for UserCard component
 */
interface UserCardProps {
  user: User;
  onPress: () => void;
}

/**
 * UserCard displays a single user in the ranking list
 * with their position, avatar, name and score
 */
const UserCard: React.FC<UserCardProps> = ({ user, onPress }) => {
  // Get display name for user
  const displayName = useMemo(() => {
    if (user.useFullName && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "Utilisateur inconnu";
  }, [user]);

  // Determine ranking color and icon
  const getRankingInfo = useMemo(() => {
    // Default styling
    let color = '#7f8c8d';
    let backgroundColor = '#ecf0f1';
    let trend: 'trending-up' | undefined = undefined;
    
    // Based on ranking position
    if (user.ranking <= 10) {
      color = '#3498db';
      backgroundColor = 'rgba(52, 152, 219, 0.1)';
      trend = 'trending-up';
    } else if (user.ranking <= 30) {
      color = '#2ecc71';
      backgroundColor = 'rgba(46, 204, 113, 0.1)';
    }
    
    return { color, backgroundColor, trend };
  }, [user.ranking]);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Ranking Number */}
      <View 
        style={[
          styles.rankingBadge, 
          { backgroundColor: getRankingInfo.backgroundColor }
        ]}
      >
        <Text style={[styles.rankingNumber, { color: getRankingInfo.color }]}>
          {user.ranking}
        </Text>
      </View>
      
      {/* User Avatar */}
      <Image 
        source={{ uri: user.photo || "https://via.placeholder.com/150" }}
        style={styles.avatar}
      />
      
      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {displayName}
        </Text>
        
        {/* Score with trend indicator */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {user.voteCount || 0} points
          </Text>
          
          {getRankingInfo.trend && (
            <Feather 
              name={getRankingInfo.trend} 
              size={14} 
              color={getRankingInfo.color} 
              style={styles.trendIcon}
            />
          )}
        </View>
      </View>
      
      {/* Chevron indicator */}
      <View style={styles.chevronContainer}>
        <Feather name="chevron-right" size={20} color="#bdc3c7" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rankingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankingNumber: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#f5f7fa',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  trendIcon: {
    marginLeft: 6,
  },
  chevronContainer: {
    paddingLeft: 10,
  },
});

export default UserCard;