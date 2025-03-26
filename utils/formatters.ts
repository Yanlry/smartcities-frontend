// src/utils/formatters.ts

// Fonction existante conservée telle quelle
export const formatCity = (city: string): string => {
  return city
    .replace(/, France/g, '') 
    .replace(/^\s*\d+\s*(bis|ter|quater|b|c|t|a|d|e|f)?\s+/gi, '')  
    .replace(/\b(bis|ter|quater|b|c|t|a|d|e|f)\b/gi, '')  
    .replace(/\s{2,}/g, ' ')  
    .trim();
};

// Nouvelle fonction pour normaliser les noms de ville pour la comparaison
export const normalizeCityName = (cityName: string): string[] => {
  if (!cityName || typeof cityName !== 'string') {
    return [];
  }
  
  // Normalisation de base: supprimer les accents, mettre en minuscules
  const normalized = cityName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  
  // Nettoyer les parties inutiles comme "France", codes postaux, etc.
  const cleaned = normalized
    .replace(/,\s*france$/i, '')
    .replace(/^\d{5}\s+/i, '')
    .trim();
  
  // Générer différentes variantes pour maximiser les chances de correspondance
  const variants = [
    cleaned,                           // Version de base
    cleaned.replace(/-/g, ' '),        // Tirets remplacés par espaces
    cleaned.replace(/\s+/g, '-'),      // Espaces remplacés par tirets
    cleaned.replace(/\s+/g, ''),       // Sans espaces ni tirets
    cleaned.replace(/-/g, '')          // Sans tirets
  ];
  
  // Suppression des doublons et des variantes vides
  return [...new Set(variants)].filter(v => v.length > 0);
};

/**
 * Compare deux noms de ville pour déterminer s'ils font référence à la même localité
 * @param city1 Premier nom de ville à comparer
 * @param city2 Second nom de ville à comparer
 * @returns true si les villes correspondent, false sinon
 */
export const citiesMatch = (city1: string, city2: string): boolean => {
  if (!city1 || !city2) return false;
  
  // Générer les variantes normalisées pour les deux villes
  const variants1 = normalizeCityName(city1);
  const variants2 = normalizeCityName(city2);
  
  // Vérifier si une variante de city1 correspond à une variante de city2
  for (const v1 of variants1) {
    for (const v2 of variants2) {
      // Correspondance exacte
      if (v1 === v2) return true;
      
      // Correspondance par inclusion (pour gérer les différences mineures)
      if (v1.includes(v2) || v2.includes(v1)) return true;
    }
  }
  
  return false;
};

// Fonction spécifique pour l'affichage stylisé dans RankBadge
export const formatCityForDisplay = (city: string | null | undefined): string => {
  if (!city || city.trim() === '') {
    return "Ville non spécifiée";
  }
  
  // Anonymisation d'abord (réutilisation de la logique existante)
  const anonymizedCity = formatCity(city);
  
  // Liste des mots de liaison qui doivent rester en minuscules
  const lowerCaseWords = ['à', 'au', 'aux', 'de', 'des', 'du', 'et', 'la', 'le', 'les', 'lez', 'sur', 'en', 'sous'];
  
  // Formatage majuscules/minuscules
  const words = anonymizedCity.toLowerCase().split(' ');
  
  const formattedWords = words.map((word, index) => {
    // Premier mot toujours avec majuscule
    if (index === 0) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    // Mots de liaison restent en minuscules
    if (lowerCaseWords.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    
    // Autres mots avec première lettre en majuscule
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  
  // Remplacement des espaces par des tirets
  return formattedWords.join('-');
};

// Fonctions existantes inchangées
export const formatDate = (date: string | Date): string => {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function formatDistance(distance: number | undefined): string {
  // Cas position actuelle (exactement à 0)
  if (distance === 0) {
    return "votre position";
  }

  // Cas valeurs invalides
  if (distance === undefined || !isFinite(distance)) {
    return "Distance inconnue";
  }

  // Distance très proche mais non nulle (< 10m)
  if (distance < 0.01) {
    return "moins de 10m";
  }

  // Distance < 1km : afficher en mètres
  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters}m`;
  }

  // Distance >= 1km : afficher en km avec 1 décimale
  return `${distance.toFixed(1)} km`;
}