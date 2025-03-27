// src/utils/formatters.ts

// Fonctions existantes pour le formatage des villes
export const formatCity = (city: string): string => {
  return city
    .replace(/, France/g, '') 
    .replace(/^\s*\d+\s*(bis|ter|quater|b|c|t|a|d|e|f)?\s+/gi, '')  
    .replace(/\b(bis|ter|quater|b|c|t|a|d|e|f)\b/gi, '')  
    .replace(/\s{2,}/g, ' ')  
    .trim();
};

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

/**
 * Convertit une distance brute en valeur de priorité pour le tri
 * Les valeurs de retour garantissent le tri dans cet ordre:
 * 1. Position actuelle (distance = 0)
 * 2. Très proche (distance < 0.01km / 10m)
 * 3. Toutes les autres distances par ordre croissant
 * 4. Distances indéfinies ou invalides (en dernier)
 * 
 * @param distance Distance en kilomètres
 * @returns Valeur numérique pour le tri (plus petite = plus prioritaire)
 */
export function getDistanceSortValue(distance: number | undefined): number {
  // Cas 1: Position actuelle (exactement 0)
  if (distance === 0) {
    return -2;
  }
  
  // Cas 2: Très proche mais non nul (< 10m)
  if (distance !== undefined && distance < 0.01) {
    return -1;
  }
  
  // Cas 3: Distance valide
  if (distance !== undefined && isFinite(distance)) {
    return distance;
  }
  
  // Cas 4: Distance invalide ou non définie
  return Number.MAX_VALUE;
}

/**
 * Fonction de comparaison pour trier un tableau de signalements par distance
 * Utilise getDistanceSortValue pour garantir l'ordre de priorité correct
 * 
 * @param a Premier signalement à comparer
 * @param b Second signalement à comparer
 * @returns Valeur négative si a est plus prioritaire, positive si b est plus prioritaire
 */
export function compareReportsByDistance(
  a: { distance?: number },
  b: { distance?: number }
): number {
  const valueA = getDistanceSortValue(a.distance);
  const valueB = getDistanceSortValue(b.distance);
  return valueA - valueB;
}