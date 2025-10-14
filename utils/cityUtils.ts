// Chemin : utils/cityUtils.ts

/**
 * 🏙️ FONCTION MAGIQUE : Normaliser les noms de villes
 * 
 * Cette fonction transforme n'importe quel nom de ville
 * pour qu'il soit toujours au même format :
 * - MAJUSCULES
 * - Tirets au lieu d'espaces
 * 
 * Exemples :
 * "Hallennes Lez Haubourdin" → "HALLENNES-LEZ-HAUBOURDIN"
 * "hallennes lez haubourdin" → "HALLENNES-LEZ-HAUBOURDIN"
 * "Hallennes-Lez-Haubourdin" → "HALLENNES-LEZ-HAUBOURDIN"
 * "HAUBOURDIN" → "HAUBOURDIN"
 */
export function normalizeCityName(cityName: string | null | undefined): string {
    // Si le nom de ville est vide ou null, on retourne "VILLE_INCONNUE"
    if (!cityName || cityName.trim() === "") {
      return "VILLE_INCONNUE";
    }
  
    return cityName
      .trim()                    // Enlever les espaces au début et à la fin
      .toUpperCase()             // Mettre en MAJUSCULES
      .replace(/\s+/g, "-");     // Remplacer tous les espaces par des tirets
  }