// Chemin: components/home/ProfileSection/UserStats.tsx

import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFeedback } from '../../../hooks/ui/useFeedback';

interface UserStatsProps {
  upVotes: number;
  downVotes: number;
  followers: number;
  following: number;
  onShowFollowers: () => void;
  onShowFollowing: () => void;
  onShowVoteInfo: () => void;
  
  
}

/**
 * UserStats: Affiche les statistiques de l'utilisateur dans un design inspiré des réseaux sociaux
 * - Optimisé pour l'engagement utilisateur avec des animations subtiles
 * - Layout inspiré des plateformes sociales modernes
 */
const UserStats: React.FC<UserStatsProps> = memo(({
  upVotes,
  downVotes,
  followers,
  following,
  onShowFollowers,
  onShowFollowing,
  onShowVoteInfo
}) => {
  const { triggerFeedback } = useFeedback();
  
  // Calcul du ratio de votes positifs
  const voteRatio = useMemo(() => {
    const total = upVotes + downVotes;
    if (total === 0) return 0;
    return Math.round((upVotes / total) * 100);
  }, [upVotes, downVotes]);
  
  // Formater les grands nombres (1000 -> 1K)
  const formatStat = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  return (
    <View style={styles.container}>
      {/* Métriques principales (followers/following) */}
      <View style={styles.mainStatsContainer}>
        <TouchableOpacity 
          onPress={() => {
            triggerFeedback('light');
            onShowFollowers();
          }} 
          style={styles.statItem}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>{formatStat(followers)}</Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </TouchableOpacity>

        <View style={styles.statDivider} />

        <TouchableOpacity 
          onPress={() => {
            triggerFeedback('light');
            onShowFollowing();
          }} 
          style={styles.statItem}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>{formatStat(following)}</Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </TouchableOpacity>
      </View>

      {/* Section des votes avec indicateur de popularité */}
      <Pressable 
        onPress={() => {
          triggerFeedback('medium');
          onShowVoteInfo();
        }}
        style={({ pressed }) => [
          styles.voteContainer,
          pressed && styles.voteContainerPressed
        ]}
      >
        <View style={styles.voteHeader}>
          <Text style={styles.voteTitle}>Avis de la communauté</Text>
          <Text style={[styles.voteRatio, { color: upVotes > downVotes ? '#4CAF50' : '#F44336' }]}>{voteRatio}% positifs</Text>
        </View>
        
        {/* Barre de progression des votes */}
        <View style={styles.voteBarContainer}>
          <View 
            style={[
              styles.voteBarPositive, 
              { flex: upVotes > 0 ? upVotes : 0.1 }
            ]} 
          />
          <View 
            style={[
              styles.voteBarNegative, 
              { flex: downVotes > 0 ? downVotes : 0.1 }
            ]} 
          />
        </View>
        
        {/* Compteurs détaillés */}
        <View style={styles.voteCountersContainer}>
          <View style={styles.voteCounter}>
            <Ionicons name="thumbs-up" size={16} color="#4CAF50" />
            <Text style={styles.voteCounterText}>{formatStat(upVotes)}</Text>
          </View>
          
          <View style={styles.voteCounter}>
            <Ionicons name="thumbs-down" size={16} color="#F44336" />
            <Text style={styles.voteCounterText}>{formatStat(downVotes)}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mainStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5D85',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#667788',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '70%',
    alignSelf: 'center',
    backgroundColor: '#E0E6EE',
  },
  voteContainer: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E6EE',
  },
  voteContainerPressed: {
    backgroundColor: '#EEF2F7',
  },
  voteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B5D85',
  },
  voteRatio: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1B5D85',
  },
  voteBarContainer: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  voteBarPositive: {
    backgroundColor: '#4CAF50',
    height: '100%',
  },
  voteBarNegative: {
    backgroundColor: '#F44336',
    height: '100%',
  },
  voteCountersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  voteCounter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCounterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
});

export default UserStats;