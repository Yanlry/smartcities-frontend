// src/components/interactions/ReportDetails/VotingSection.tsx

import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { VoteType } from "../../../types/report.types";

interface VotingButtonsProps {
  votes: { upVotes: number; downVotes: number };
  selectedVote: VoteType;
  onVote: (type: "up" | "down") => void;
}

/**
 * Sous-composant pour les boutons de vote
 */
const VotingButtons = memo(({ votes, selectedVote, onVote }: VotingButtonsProps) => {
  return (
    <View style={styles.votingContainer}>
      <TouchableOpacity
        style={[
          styles.voteButton,
          selectedVote === "up" && styles.selectedUpVote
        ]}
        onPress={() => onVote("up")}
        activeOpacity={0.7}
      >
        <Icon 
          name="thumbs-up-outline" 
          size={20} 
          color={selectedVote === "up" ? "#fff" : "#4CAF50"} 
        />
        <Text 
          style={[
            styles.voteText, 
            selectedVote === "up" && styles.selectedVoteText
          ]}
        >
          Oui ({votes.upVotes})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.voteButton,
          selectedVote === "down" && styles.selectedDownVote
        ]}
        onPress={() => onVote("down")}
        activeOpacity={0.7}
      >
        <Icon 
          name="thumbs-down-outline" 
          size={20} 
          color={selectedVote === "down" ? "#fff" : "#F44336"} 
        />
        <Text 
          style={[
            styles.voteText, 
            selectedVote === "down" && styles.selectedVoteText
          ]}
        >
          Non ({votes.downVotes})
        </Text>
      </TouchableOpacity>
    </View>
  );
});

interface VotingSectionProps {
  votes: { upVotes: number; downVotes: number };
  selectedVote: VoteType;
  onVote: (type: "up" | "down") => void;
}

/**
 * Composant de section de vote complète
 */
const VotingSection: React.FC<VotingSectionProps> = ({
  votes,
  selectedVote,
  onVote,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.votingTitle}>Avez-vous vu cet événement ?</Text>
      <VotingButtons 
        votes={votes} 
        selectedVote={selectedVote} 
        onVote={onVote} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  votingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  votingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  selectedUpVote: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  selectedDownVote: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  voteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
    marginLeft: 8,
  },
  selectedVoteText: {
    color: "#FFFFFF",
  },
});

export default memo(VotingSection);