// hooks/ui/useBadge.ts

import React, { useMemo } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { BadgeStyle } from '../../components/home/ProfileSection/user.types';

interface BadgeTier {
  name: string;
  description: string;
  votes: number;
  styleConfig: Omit<BadgeStyle, 'title'>;
}

/**
 * Hook personnalisé pour la gestion des badges utilisateur
 * Optimisé avec useMemo pour éviter les recalculs inutiles
 */
export const useBadge = () => {
  /**
   * Configuration complète des niveaux de badge
   * Centralisée pour faciliter la maintenance
   */
  const badgeTiers = useMemo<BadgeTier[]>(() => [
    {
      name: "Légende urbaine",
      description: "Plus de 1000 votes",
      votes: 1000,
      styleConfig: {
        backgroundColor: "#997BBA",
        textColor: "#fff",
        borderColor: "#5B3F78",
        shadowColor: "#997BBA",
        starsColor: "#5B3F78",
        stars: 6,
        icon: null,
      }
    },
    {
      name: "Icône locale",
      description: "500 à 999 votes",
      votes: 500,
      styleConfig: {
        backgroundColor: "#70B3B1",
        textColor: "#fff",
        borderColor: "#044745",
        shadowColor: "#70B3B1",
        starsColor: "#044745",
        stars: 5,
        icon: null,
      }
    },
    {
      name: "Héros du quotidien",
      description: "250 à 499 votes",
      votes: 250,
      styleConfig: {
        backgroundColor: "#FAF3E3",
        textColor: "#856404",
        borderColor: "#856404",
        shadowColor: "#D4AF37",
        starsColor: "#D4AF37",
        stars: 4,
        icon: null,
      }
    },
    {
      name: "Ambassadeur du quartier",
      description: "100 à 249 votes",
      votes: 100,
      styleConfig: {
        backgroundColor: "#E1E1E1",
        textColor: "#6A6A6A",
        starsColor: "#919191",
        shadowColor: "#6A6A6A",
        borderColor: "#919191",
        stars: 3,
        icon: null,
      }
    },
    {
      name: "Citoyen de confiance",
      description: "50 à 99 votes",
      votes: 50,
      styleConfig: {
        backgroundColor: "#CEA992",
        textColor: "#853104",
        starsColor: "#853104",
        shadowColor: "#853104",
        borderColor: "#D47637",
        stars: 2,
        icon: null,
      }
    },
    {
      name: "Apprenti citoyen",
      description: "5 à 49 votes",
      votes: 5,
      styleConfig: {
        backgroundColor: "#9BD4A2",
        textColor: "#25562A",
        starsColor: "#54B65F",
        borderColor: "#54B65F",
        shadowColor: "#54B65F",
        stars: 1,
        icon: null,
      }
    },
    {
      name: "Premiers pas",
      description: "Moins de 5 votes",
      votes: 0,
      styleConfig: {
        backgroundColor: "#062C41",
        textColor: "#fff",
        borderColor: "#fff",
        shadowColor: "#062C41",
        starsColor: "#062C41",
        stars: 0,
        icon: React.createElement(Ionicons, { name: "school", size: 24, color: "#0AAEA8" }),
      }
    },
  ], []);

  /**
   * Version simplifiée des tiers pour l'affichage en UI
   */
  const tiers = useMemo(() => 
    badgeTiers.map(({ name, description, votes }) => ({
      name,
      description,
      votes
    }))
  , [badgeTiers]);

  /**
   * Récupère le style du badge en fonction du nombre de votes
   * @param votes - Nombre de votes de l'utilisateur
   * @returns Configuration de style pour le badge
   */
  const getBadgeStyles = useMemo(() => 
    (votes: number): BadgeStyle => {
      // Trouvez le tier approprié en fonction du nombre de votes
      const tier = badgeTiers.find(tier => votes >= tier.votes) || badgeTiers[badgeTiers.length - 1];
      
      // Retourne le style complet avec le titre
      return {
        ...tier.styleConfig,
        title: tier.name
      };
    }
  , [badgeTiers]);

  /**
   * Calcule la progression vers le prochain niveau
   * @param votes - Nombre de votes actuels
   * @returns Informations sur la progression
   */
  const getProgressInfo = useMemo(() => 
    (votes: number) => {
      // Trouve le niveau actuel et le niveau suivant
      const currentTierIndex = badgeTiers.findIndex(tier => votes >= tier.votes);
      const currentTier = badgeTiers[currentTierIndex];
      const nextTier = currentTierIndex > 0 ? badgeTiers[currentTierIndex - 1] : null;
      
      // Aucun niveau suivant si déjà au niveau maximal
      if (!nextTier) {
        return {
          currentTier: currentTier.name,
          nextTier: null,
          votesNeeded: 0,
          progress: 100,
          isMaxLevel: true
        };
      }
      
      // Calcul de la progression
      const votesForNextLevel = nextTier.votes - currentTier.votes;
      const currentProgress = votes - currentTier.votes;
      const progressPercentage = Math.min(
        100,
        Math.round((currentProgress / votesForNextLevel) * 100)
      );
      
      return {
        currentTier: currentTier.name,
        nextTier: nextTier.name,
        votesNeeded: nextTier.votes - votes,
        progress: progressPercentage,
        isMaxLevel: false
      };
    }
  , [badgeTiers]);

  return {
    getBadgeStyles,
    tiers,
    getProgressInfo
  };
};

export default useBadge;