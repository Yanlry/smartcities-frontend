// hooks/profile/useBadgeStyles.ts

import { BadgeStyle } from "../../types/profile.types";

/**
 * Hook personnalisé pour déterminer le style du badge basé sur le nombre de votes
 * @param votesCount Nombre de votes de l'utilisateur
 * @returns Objet contenant les styles du badge
 */
export const useBadgeStyles = (votesCount: number = 0): BadgeStyle => {
  if (votesCount >= 1000) {
    return {
      title: "Légende urbaine",
      backgroundColor: "#997BBA",
      textColor: "#fff",
      borderColor: "#5B3F78",
      shadowColor: "#997BBA",
      starsColor: "#5B3F78",
      stars: 6,
      icon: null,
    };
  } else if (votesCount >= 500) {
    return {
      title: "Icône locale",
      backgroundColor: "#70B3B1",
      textColor: "#fff",
      borderColor: "#044745",
      shadowColor: "#70B3B1",
      starsColor: "#044745",
      stars: 5,
      icon: null,
    };
  } else if (votesCount >= 250) {
    return {
      title: "Héros du quotidien",
      backgroundColor: "#FAF3E3",
      textColor: "#856404",
      borderColor: "#856404",
      shadowColor: "#D4AF37",
      starsColor: "#D4AF37",
      stars: 4,
      icon: null,
    };
  } else if (votesCount >= 100) {
    return {
      title: "Ambassadeur du quartier",
      backgroundColor: "#E1E1E1",
      textColor: "#6A6A6A",
      starsColor: "#919191",
      shadowColor: "#6A6A6A",
      borderColor: "#919191",
      stars: 3,
      icon: null,
    };
  } else if (votesCount >= 50) {
    return {
      title: "Citoyen de confiance",
      backgroundColor: "#CEA992",
      textColor: "#853104",
      starsColor: "#853104",
      shadowColor: "#853104",
      borderColor: "#D47637",
      stars: 2,
      icon: null,
    };
  } else if (votesCount >= 5) {
    return {
      title: "Apprenti citoyen",
      backgroundColor: "#9BD4A2",
      textColor: "#25562A",
      starsColor: "#54B65F",
      borderColor: "#54B65F",
      shadowColor: "#54B65F",
      stars: 1,
      icon: null,
    };
  } else {
    return {
      title: "Premiers pas",
      backgroundColor: "#062C41",
      textColor: "#fff",
      borderColor: "#fff",
      shadowColor: "#062C41",
      starsColor: "#0AAEA8",
      stars: 0,
      icon: "school",
    };
  }
};