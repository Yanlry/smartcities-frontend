// Chemin : components/ranking/RankingHeader.tsx

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
 * Props interface for RankingHeader component
 */
interface RankingHeaderProps {
  userRanking: number | null;
  totalUsers: number | null;
  cityName: string | null;
}

/**
 * RankingHeader displays the user's current ranking information
 * along with city name and total number of users
 */
const RankingHeader: React.FC<RankingHeaderProps> = ({ 
  userRanking, 
  totalUsers, 
  cityName 
}) => {
  // Generate ranking message based on user's position
  const rankingMessage = useMemo(() => {
    if (!userRanking || !totalUsers) return "Position indisponible";
    
    const percentile = Math.floor((userRanking / totalUsers) * 100);
    
    if (userRanking === 1) return "Vous êtes en tête du classement !";
    if (userRanking <= 3) return "Vous êtes sur le podium !";
    if (userRanking <= Math.ceil(totalUsers * 0.1)) 
      return "Vous êtes dans le top 10% !";
    if (userRanking <= Math.ceil(totalUsers * 0.25)) 
      return "Vous êtes dans le top 25% !";
    
    return `Vous devancez ${100 - percentile}% des utilisateurs`;
  }, [userRanking, totalUsers]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f5f7fa']}
        style={styles.gradientContainer}
      >
        {/* City Indicator */}
        <View style={styles.citySection}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={24} color={COLORS.primary.start} />
          </View>
          <Text style={styles.cityLabel}>COMMUNAUTÉ</Text>
          <Text style={styles.cityName}>{cityName || "Ville inconnue"}</Text>
        </View>

        {/* User Ranking Stats */}
        <View style={styles.rankingStatsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>#{userRanking || "-"}</Text>
            <Text style={styles.statLabel}>VOTRE RANG</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalUsers || "-"}</Text>
            <Text style={styles.statLabel}>UTILISATEURS</Text>
          </View>
        </View>

        {/* Ranking Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.rankingMessage}>{rankingMessage}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#ffffff',
  },
  gradientContainer: {
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  citySection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  cityName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  rankingStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary.start,
  },
  statLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 16,
  },
  messageContainer: {
    backgroundColor: `rgba(${parseInt(COLORS.primary.start.slice(1, 3), 16)}, ${parseInt(COLORS.primary.start.slice(3, 5), 16)}, ${parseInt(COLORS.primary.start.slice(5, 7), 16)}, 0.1)`,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  rankingMessage: {
    fontSize: 14,
    color: COLORS.primary.end,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default RankingHeader;