/**
 * reportHelpers.ts
 * 
 * Module de configuration et d'utilitaires pour la gestion des signalements
 * Inclut des types, constantes, couleurs et fonctions pour manipuler les données de signalements
 */

import axios from "axios";
import React from "react";
// @ts-ignore - Récupération des variables d'environnement
import { API_URL } from "@env";

/**
 * Types de signalements supportés par l'application
 */
export type ReportType = 'danger' | 'travaux' | 'nuisance' | 'pollution' | 'reparation';

/**
 * Structure définissant une catégorie de signalement avec ses métadonnées
 */
export interface ReportCategory {
  name: string;
  icon: string;
  value: ReportType;
  article: string;
  description: string;
}

/**
 * Système de couleurs sophistiqué pour l'application
 * Palette optimisée pour l'accessibilité et le professionnalisme
 */
export const COLORS = {
  // Couleurs primaires de l'application
  primary: "#1A4B8C",      // Bleu profond institutionnel
  secondary: "#2D3142",    // Gris-bleu neutre 
  
  // Couleurs d'interface de base
  text: {
    primary: "#2D3142",    // Texte principal
    secondary: "#545B70",  // Texte secondaire
    tertiary: "#8E94A8",   // Texte tertiaire
    inverse: "#FFFFFF"     // Texte sur fond sombre
  },
  background: {
    main: "#F8F9FD",       // Fond d'écran principal
    paper: "#FFFFFF",      // Fond pour cartes et surfaces
    elevated: "#F0F2F8"    // Fond avec élévation (liste, etc.)
  },
  border: {
    light: "#E4E6ED",      // Bordure légère
    medium: "#D1D5E0"      // Bordure moyenne
  },
  
  // États de l'interface
  state: {
    success: "#2E7D6E",    // Vert soutenu pour confirmations
    info: "#345995",       // Bleu informatif
    disabled: "#C5CAD6"    // Éléments désactivés
  },
  
  // Système de couleurs pour les catégories avec variantes
  categories: {
    danger: {
      main: "#C8372D",     // Rouge vif mais sophistiqué 
      light: "#F2DBD9",    // Fond pour cartes danger
      dark: "#92281F",     // Accentuation et contraste
      opacity: "rgba(200, 55, 45, 0.1)" // Pour overlays et backgrounds subtils
    },
    travaux: {
      main: "#DD8E31",     // Orange terre plus professionnel
      light: "#F8ECDC",    // Fond pour cartes travaux
      dark: "#A46924",     // Accentuation et contraste
      opacity: "rgba(221, 142, 49, 0.1)" // Pour overlays et backgrounds subtils
    },
    nuisance: {
      main: "#8655AB",     // Violet posé et institutionnel
      light: "#E8DEF0",    // Fond pour cartes nuisance
      dark: "#5E3C79",     // Accentuation et contraste
      opacity: "rgba(134, 85, 171, 0.1)" // Pour overlays et backgrounds subtils
    },
    pollution: {
      main: "#27746B",     // Vert-bleu profond et sérieux
      light: "#D8E9E8",    // Fond pour cartes pollution
      dark: "#1E5A53",     // Accentuation et contraste
      opacity: "rgba(39, 116, 107, 0.1)" // Pour overlays et backgrounds subtils
    },
    reparation: {
      main: "#156CB3",     // Bleu technique fiable
      light: "#D8E8F6",    // Fond pour cartes réparation
      dark: "#0E4F82",     // Accentuation et contraste
      opacity: "rgba(21, 108, 179, 0.1)" // Pour overlays et backgrounds subtils
    }
  }
};

/**
 * Mapping des couleurs principales pour chaque type de signalement
 */
export const typeColors: Record<ReportType, string> = {
  danger: COLORS.categories.danger.main,
  travaux: COLORS.categories.travaux.main,
  nuisance: COLORS.categories.nuisance.main,
  pollution: COLORS.categories.pollution.main,
  reparation: COLORS.categories.reparation.main,
};

/**
 * Mapping des couleurs d'arrière-plan légères pour chaque type
 */
export const typeBackgroundColors: Record<ReportType, string> = {
  danger: COLORS.categories.danger.light,
  travaux: COLORS.categories.travaux.light,
  nuisance: COLORS.categories.nuisance.light,
  pollution: COLORS.categories.pollution.light,
  reparation: COLORS.categories.reparation.light,
};

/**
 * Mapping des couleurs foncées pour accentuation/hover pour chaque type
 */
export const typeDarkColors: Record<ReportType, string> = {
  danger: COLORS.categories.danger.dark,
  travaux: COLORS.categories.travaux.dark,
  nuisance: COLORS.categories.nuisance.dark,
  pollution: COLORS.categories.pollution.dark,
  reparation: COLORS.categories.reparation.dark,
};

/**
 * Mapping des couleurs pour les graphiques et visualisations
 */
export const chartColors: Record<ReportType | string, string> = {
  danger: COLORS.categories.danger.main,
  travaux: COLORS.categories.travaux.main,
  nuisance: COLORS.categories.nuisance.main,
  pollution: COLORS.categories.pollution.main,
  reparation: COLORS.categories.reparation.main,
  réparation: COLORS.categories.reparation.main, // Pour la rétrocompatibilité
};

/**
 * Libellés formatés pour chaque type de signalement
 */
export const typeLabels: Record<ReportType, string> = {
  danger: 'Danger',
  travaux: 'Travaux',
  nuisance: 'Nuisance',
  pollution: 'Pollution',
  reparation: 'Maintenance',
};

/**
 * Mapping des types de signalements vers les emojis
 */
export const typeEmojis: Record<ReportType, string> = {
  danger: '⚠️',
  travaux: '🚧',
  nuisance: '😡',
  pollution: '🌍',
  reparation: '⚙️',
};

/**
 * Mapping des types de signalements vers les noms d'icônes
 * Compatible avec Ionicons (peut être adapté à d'autres bibliothèques)
 */
export const typeIcons: Record<ReportType, string> = {
  danger: 'warning-outline',
  travaux: 'construct-outline',
  nuisance: 'volume-high-outline',
  pollution: 'leaf-outline',
  reparation: 'build-outline',
};

/**
 * Descriptions détaillées pour chaque type de signalement
 */
export const categoryDescriptions: Record<ReportType, string> = {
  danger: "Signale une situation présentant un risque immédiat pour les habitants.",
  travaux: "Indique des travaux en cours ou prévus, pouvant impacter la circulation.",
  nuisance: "Signale des nuisances sonores, olfactives ou visuelles affectant le voisinage.",
  pollution: "Informe d'une pollution environnementale comme des déchets ou des émissions toxiques.",
  reparation: "Indique des infrastructures nécessitant une réparation urgente ou en cours de réparation.",
};

/**
 * Définitions complètes des catégories de signalements
 * Inclut nom, icône, valeur, article et description détaillée pour chaque type
 */
export const categories: ReportCategory[] = [
  {
    name: 'Danger',
    icon: 'warning-outline',
    value: 'danger',
    article: 'un danger',
    description: `Pouvant affecter la sécurité des habitants :

- Objets dangereux sur la voie publique (ex. câbles tombés, verre brisé)
- Zones instables ou dangereuses (ex. glissements de terrain, structures menaçant de s'effondrer)
- Situations à haut risque (ex. incendies, inondations, zones non sécurisées)`,
  },
  {
    name: 'Travaux',
    icon: 'construct-outline',
    value: 'travaux',
    article: 'des travaux',
    description: `Publics ou privés susceptibles d'impacter la ville :

- Fermetures de routes ou rues (ex. travaux de réfection, pose de réseaux souterrains)
- Perturbations des transports ou déviations (ex. encombrements liés aux chantiers)
- Travaux générant du bruit ou des nuisances (ex. chantiers de nuit, vibrations excessives)`,
  },
  {
    name: 'Nuisance',
    icon: 'volume-high-outline',
    value: 'nuisance',
    article: 'une nuisance',
    description: `Gênes perturbant la tranquillité de la ville :

- Bruit excessif (ex. travaux nocturnes, fêtes bruyantes)
- Pollution olfactive ou visuelle (ex. odeurs nauséabondes, graffiti non autorisé)
- Comportements inappropriés (ex. regroupements bruyants, dégradations dans les espaces publics)`,
  },
  {
    name: 'Pollution',
    icon: 'leaf-outline',
    value: 'pollution',
    article: 'de la pollution',
    description: `Identifiez les sources de pollution affectant l'environnement ou la santé publique :

- Dépôts sauvages ou décharges illégales (ex. déchets abandonnés, encombrants non ramassés)
- Émissions toxiques (ex. fumées industrielles, odeurs chimiques)
- Pollution des ressources naturelles (ex. cours d'eau contaminés, sols pollués)`,
  },
  {
    name: 'Réparation',
    icon: 'build-outline',
    value: 'reparation',
    article: 'une réparation',
    description: `Infrastructure nécessitant une maintenance urgente :

- Pannes d'éclairage public (ex. lampadaires non fonctionnels)
- Équipements défectueux (ex. feux tricolores en panne, mobiliers urbains endommagés)
- Infrastructures abîmées (ex. trottoirs fissurés, routes avec nids-de-poule)
- Espaces publics détériorés (ex. bancs cassés, panneaux de signalisation dégradés)`,
  },
];

/**
 * Interface pour les paramètres de la fonction handleVote
 */
interface VoteParams {
  reportId: number;
  userId: number;
  type: string;
  latitude: number;
  longitude: number;
  currentVotes: number | undefined;
  setVotes: React.Dispatch<React.SetStateAction<number | undefined>>;
}

/**
 * Gère le vote sur un signalement avec mise à jour optimiste de l'UI
 * 
 * @param params - Paramètres nécessaires pour traiter le vote
 * @returns Promise<void>
 */
export const handleVote = async ({
  reportId,
  userId,
  type,
  latitude,
  longitude,
  currentVotes,
  setVotes
}: VoteParams): Promise<void> => {
  try { 
    // Mise à jour optimiste de l'interface utilisateur
    const newVotes = type === "up" ? (currentVotes || 0) + 1 : (currentVotes || 0) - 1;
    setVotes(newVotes);
 
    const payload = {
      reportId,
      userId,
      type,
      latitude,
      longitude,
    };
    
    // Envoi de la requête au backend
    const response = await axios.post(`${API_URL}/reports/vote`, payload);
    
    // Mise à jour avec la valeur réelle retournée par le serveur
    if (response.data.updatedVotes !== undefined) {
      setVotes(response.data.updatedVotes);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du vote :", error.response?.data || error);
    // Annulation de la mise à jour optimiste en cas d'erreur
    setVotes(currentVotes);
  }
};

/**
 * Récupère le libellé formaté d'un type de signalement
 * 
 * @param type - Type de signalement
 * @returns Libellé formaté
 */
export const getTypeLabel = (type: string): string => {
  return typeLabels[type as ReportType] || type;
};

/**
 * Récupère l'emoji correspondant à un type de signalement
 * 
 * @param type - Type de signalement
 * @returns Emoji correspondant
 */
export const getTypeEmoji = (type: string): string => {
  return typeEmojis[type as ReportType] || '❓';
};

/**
 * Récupère le nom de l'icône pour un type de signalement
 * 
 * @param type - Type de signalement
 * @returns Nom de l'icône à utiliser
 */
export const getTypeIcon = (type: string): string => {
  return typeIcons[type as ReportType] || 'help-circle-outline';
};

/**
 * Récupère toutes les informations visuelles pour un type de signalement
 * 
 * @param type - Type de signalement
 * @returns Objet contenant l'emoji, l'icône et les variantes de couleurs
 */
export const getTypeVisuals = (type: string) => {
  const reportType = type as ReportType;
  const emoji = getTypeEmoji(type);
  const iconName = getTypeIcon(type);
  
  // Récupération des couleurs avec fallback
  const color = typeColors[reportType] || COLORS.text.primary;
  const backgroundColor = typeBackgroundColors[reportType] || COLORS.background.elevated;
  const darkColor = typeDarkColors[reportType] || COLORS.secondary;
  
  return { 
    emoji, 
    iconName, 
    color,
    backgroundColor,
    darkColor
  };
};

/**
 * Génère une couleur avec opacité pour un type donné
 * 
 * @param type - Type de signalement
 * @param opacity - Valeur d'opacité (0-1)
 * @returns Couleur avec opacité au format rgba
 */
export const getTypeColorWithOpacity = (type: string, opacity: number): string => {
  const reportType = type as ReportType;
  const hexColor = typeColors[reportType] || COLORS.text.primary;
  
  // Conversion hex vers rgb pour appliquer l'opacité
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Détermine si une couleur est suffisamment claire pour utiliser du texte foncé
 * 
 * @param hexColor - Couleur au format hexadécimal
 * @returns Boolean indiquant si la couleur est claire
 */
export const isLightColor = (hexColor: string): boolean => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcul de la luminosité perçue (formule standard)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5; // Seuil de 0.5 pour déterminer si clair ou foncé
};

/**
 * Détermine la couleur de texte à utiliser sur un fond coloré
 * 
 * @param backgroundColor - Couleur d'arrière-plan
 * @returns Couleur de texte appropriée (clair ou foncé)
 */
export const getContrastTextColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) 
    ? COLORS.text.primary   // Texte foncé sur fond clair
    : COLORS.text.inverse;  // Texte clair sur fond foncé
};