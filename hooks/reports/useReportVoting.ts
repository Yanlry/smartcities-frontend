import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { Report, VoteType } from '../../types/entities/report.types';
// @ts-ignore
import { API_URL } from '@env';

interface VotesState {
  upVotes: number;
  downVotes: number;
}

interface UseReportVotingProps {
  report: Report | null;
  currentUserId: number | null;
  location: { latitude: number; longitude: number } | null;
}

/**
 * Hook personnalisé pour gérer les votes sur un signalement
 * 
 * @param report Le signalement concerné
 * @param currentUserId L'ID de l'utilisateur courant
 * @param location La position actuelle de l'utilisateur
 */
export const useReportVoting = ({ report, currentUserId, location }: UseReportVotingProps) => {
  const [votes, setVotes] = useState<VotesState>({ upVotes: 0, downVotes: 0 });
  const [selectedVote, setSelectedVote] = useState<VoteType>(null);

  // Mettre à jour les votes lorsque le rapport change
  useEffect(() => {
    if (report) {
      setVotes({
        upVotes: report.upVotes,
        downVotes: report.downVotes,
      });
    }
  }, [report]);

  // Fonction pour restaurer le vote (mise à jour uniquement de l'état visuel sans appel API)
  const restoreVote = useCallback((vote: "up" | "down") => {
    setSelectedVote(vote);
  }, []);

  /**
   * Gère l'action de vote en envoyant la requête puis en mettant à jour le compteur
   * 
   * @param type Type de vote (up ou down)
   */
  const handleVote = useCallback(async (type: "up" | "down") => {
    if (!location || !report || !currentUserId) return;

    // Mise à jour optimiste du vote pour l'affichage
    setSelectedVote(type);

    try {
      const payload = {
        reportId: report.id,
        userId: currentUserId,
        type,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const response = await fetch(`${API_URL}/reports/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Vote failed");
      }

      const result = await response.json();

      // Met à jour le compteur de votes selon la réponse serveur
      setVotes({
        upVotes: result.updatedVotes.upVotes,
        downVotes: result.updatedVotes.downVotes,
      });
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue");
      // Optionnel: ne pas réinitialiser selectedVote pour conserver le vote visuel
      // setSelectedVote(null);
    }
  }, [location, report, currentUserId]);

  return {
    votes,
    selectedVote,
    handleVote,
    restoreVote,
  };
};