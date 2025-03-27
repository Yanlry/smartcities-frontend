// hooks/ui/useBadge.ts - Nouvelle palette de couleurs

import React, { useMemo } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { BadgeStyle } from '../../types/entities/user.types';

interface BadgeTier {
  name: string;
  description: string;
  votes: number;
  styleConfig: Omit<BadgeStyle, 'title'>;
}

/**
 * Hook personnalisé pour la gestion des badges utilisateur
 * Optimisé avec useMemo pour éviter les recalculs inutiles
 * Palette de couleurs modernisée et professionnelle
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
        backgroundColor: "#7E57C2", // Violet améthyste moderne
        textColor: "#757575",
        borderColor: "#4527A0", // Violet foncé pour l'accent
        shadowColor: "#B39DDB", // Violet clair pour les ombres
        starsColor: "#4527A0", // Or pour les étoiles (prestige)
        stars: 6,
        icon: null,
      }
    },
    {
      name: "Icône locale",
      description: "500 à 999 votes",
      votes: 500,
      styleConfig: {
        backgroundColor: "#00ACC1", // Bleu-vert moderne (teal)
        textColor: "#006064",
        borderColor: "#006064", // Teal foncé pour l'accent
        shadowColor: "#80DEEA", // Teal clair pour les ombres
        starsColor: "#006064", // Blanc bleuté pour les étoiles
        stars: 5,
        icon: null,
      }
    },
    {
      name: "Héros du quotidien",
      description: "250 à 499 votes",
      votes: 250,
      styleConfig: {
        backgroundColor: "#FFD700", // Or classique, plus authentique
        textColor: "#FFFFFF", // Texte blanc pour un meilleur contraste sur fond doré
        borderColor: "#B8860B", // Or foncé (DarkGoldenrod) pour l'accent
        shadowColor: "#F8E7B5", // Or clair pour les ombres (Champagne)
        starsColor: "#FFD700", // Or brillant pour les étoiles (Gold)
        stars: 4,
        icon: null,
      }
    },
    {
      name: "Ambassadeur du quartier",
      description: "100 à 249 votes",
      votes: 100,
      styleConfig: {
        backgroundColor: "#546E7A", // Bleu-gris ardoise élégant
        textColor: "#263238",
        borderColor: "#263238", // Bleu-gris foncé pour l'accent
        shadowColor: "#90A4AE", // Bleu-gris clair pour les ombres
        starsColor: "#263238", // Presque blanc pour les étoiles
        stars: 3,
        icon: null,
      }
    },
    {
      name: "Citoyen de confiance",
      description: "50 à 99 votes",
      votes: 50,
      styleConfig: {
        backgroundColor: "#8D6E63", // Brun-bronze modernisé
        textColor: "#5D4037",
        borderColor: "#5D4037", // Brun foncé pour l'accent
        shadowColor: "#D7CCC8", // Beige pour les ombres
        starsColor: "#5D4037", // Blanc cassé pour les étoiles
        stars: 2,
        icon: null,
      }
    },
    {
      name: "Apprenti citoyen",
      description: "5 à 49 votes",
      votes: 5,
      styleConfig: {
        backgroundColor: "#26A69A", // Vert menthe moderne
        textColor: "#37474F",
        borderColor: "#00796B", // Vert foncé pour l'accent
        shadowColor: "#B2DFDB", // Vert menthe clair pour les ombres
        starsColor: "#00796B", // Blanc verdâtre pour les étoiles
        stars: 1,
        icon: null,
      }
    },
    {
      name: "Premiers pas",
      description: "Moins de 5 votes",
      votes: 0,
      styleConfig: {
        backgroundColor: "#37474F", // Bleu-gris profond
        textColor: "#37474F",
        borderColor: "#37474F", // Bordure claire pour contraste
        shadowColor: "#607D8B", // Bleu-gris pour les ombres
        starsColor: "#37474F", // Bleu-gris clair pour les icônes
        stars: 0,
        icon: React.createElement(Ionicons, { name: "school", size: 24, color: "#FFFFFF" }),
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