export const formatCity = (city: string): string => {
  return city
    .replace(/, France/g, '') 
    .replace(/^\s*\d+\s*(bis|ter|quater|b|c|t|a|d|e|f)?\s+/gi, '')  
    .replace(/\b(bis|ter|quater|b|c|t|a|d|e|f)\b/gi, '')  
    .replace(/\s{2,}/g, ' ')  
    .trim();
};
  export const formatDate = (date: string | Date): string => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

// src/utils/formatters.ts

// Ajoutez cette fonction si elle n'existe pas déjà
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