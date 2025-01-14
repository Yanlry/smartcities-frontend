export const formatCity = (city: string): string => {
  return city
    .replace(/, France/g, '') // Supprime ", France" si présent
    .replace(/\b\d+\b/g, '') // Supprime tous les numéros isolés (numéros de rue)
    .replace(/\b(bis|ter|quater)\b/gi, '') // Supprime "bis", "ter", "quater", insensible à la casse
    .replace(/\s{2,}/g, ' ') // Remplace les espaces multiples par un seul espace
    .trim(); // Supprime les espaces inutiles en début et fin
};
  export const formatDate = (date: string | Date): string => {
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };